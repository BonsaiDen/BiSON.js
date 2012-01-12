/**
  * Copyright (c) 2009-2011 Ivo Wetzel.
  *
  * Permission is hereby granted, free of charge, to any person obtaining a copy
  * of this software and associated documentation files (the "Software"), to deal
  * in the Software without restriction, including without limitation the rights
  * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  * copies of the Software, and to permit persons to whom the Software is
  * furnished to do so, subject to the following conditions:
  *
  * The above copyright notice and this permission notice shall be included in
  * all copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  * THE SOFTWARE.
  */



(function(undefined) {

    // Encoder ----------------------------------------------------------------
    function __encode(value) {

        // Numbers
        if (typeof value === 'number') {

            var type = value !== (value | 0),
                sign = 0;

            if (value < 0) {
                value = -value;
                sign = 1;
            }

            BitStream.write(1 + type, 3)

            // Float
            if (type) {

                var shift = 1,
                    step = 10;

                while(step <= value) {
                    shift++;
                    step *= 10;
                }

                // Ensure we don't lose precisiobn
                shift = (8 - shift) + 1;
                value = Math.round(value * (1000000000 / step));

                // Figure out the smallest exp for value
                while(value / 10 === ((value  / 10) | 0)) {
                    value /= 10;
                    shift--;
                }

            }

            // 2 size 0-3: 0 = < 16 1 = < 256 2 = < 65536 3 >
            if (value < 2) {
                BitStream.write(0, 3);
                BitStream.write(value, 1);

            } else if (value < 16) {
                BitStream.write(1, 3);
                BitStream.write(value, 4);

            } else if (value < 256) {
                BitStream.write(2, 3);
                BitStream.write(value, 8);

            } else if (value < 4096) {
                BitStream.write(3, 3);
                BitStream.write(value >> 8 & 0xff, 4);
                BitStream.write(value & 0xff, 8);

            } else if (value < 65536) {
                BitStream.write(4, 3);
                BitStream.write(value >> 8 & 0xff, 8);
                BitStream.write(value & 0xff, 8);

            } else if (value < 1048576) {
                BitStream.write(5, 3);
                BitStream.write(value >> 16 & 0xff, 4);
                BitStream.write(value >> 8 & 0xff, 8);
                BitStream.write(value & 0xff, 8);

            } else if (value < 16777216) {
                BitStream.write(6, 3);
                BitStream.write(value >> 16 & 0xff, 8);
                BitStream.write(value >> 8 & 0xff, 8);
                BitStream.write(value & 0xff, 8);

            } else {
                BitStream.write(7, 3);
                BitStream.write(value >> 24 & 0xff, 8);
                BitStream.write(value >> 16 & 0xff, 8);
                BitStream.write(value >> 8 & 0xff, 8);
                BitStream.write(value & 0xff, 8);
            }

            BitStream.write(sign, 1);

            if (type) {
                BitStream.write(shift, 4);
            }

        // Strings
        } else if (typeof value === 'string') {

            var l = value.length;
            BitStream.write(3, 3);

            if (l > 65535) {
                BitStream.write(31, 5);
                BitStream.write(l >> 24 & 0xff, 8);
                BitStream.write(l >> 16 & 0xff, 8);
                BitStream.write(l >> 8 & 0xff, 8);
                BitStream.write(l & 0xff, 8);

            } else if (l > 255) {
                BitStream.write(30, 5);
                BitStream.write(l >> 8 & 0xff, 8);
                BitStream.write(l & 0xff, 8);

            } else if (l > 28) {
                BitStream.write(29, 5);
                BitStream.write(l, 8);

            } else {
                BitStream.write(l, 5);
            }

            BitStream.writeRaw(value);

        // Booleans
        } else if (typeof value === 'boolean') {
            BitStream.write(0, 3);
            BitStream.write(+value, 2);

        // Null
        } else if (value === null) {
            BitStream.write(0, 3);
            BitStream.write(2, 2);

        // Arrays
        } else if (value instanceof Array) {

            BitStream.write(4, 3);
            for(var i = 0, l = value.length; i < l; i++) {
                __encode(value[i]);
            }

            BitStream.write(6, 3);

        // Object
        } else {

            BitStream.write(5, 3);
            for(var i in value) {
                __encode(i);
                __encode(value[i]);
            }

            BitStream.write(6, 3);

        }

    }

    function encode(value) {
        BitStream.open()
        __encode(value);
        BitStream.write(7, 3);
        return BitStream.close()
    }

/*

xxx: group
    0: bool / null
        xx: type
        0 = false
        1 = true
        2 = null

    1: int
    2: float
    3: string

    4: array
    5: object
    6: close
    7: end

*/

    // Decoder ----------------------------------------------------------------
    function decode(string) {

        var pos = 0, l = string.length,
            stack = [], i = -1,
            type, top, value, obj,

            // Objects
            getKey = false, key, isObj, decoded;

        BitStream.open(string);
        while((type = BitStream.read(3)) !== 7) {

            // Null
            if (type === 0) {

                value = BitStream.read(2);
                if (value === 2) {
                    value = null;

                } else {
                    value = !!value;
                }

            // Integer / Float
            } else if (type === 1 || type === 2) {

                switch(BitStream.read(3)) {
                    case 0:
                        value = BitStream.read(1);
                        break;

                    case 1:
                        value = BitStream.read(4);
                        break;

                    case 2:
                        value = BitStream.read(8);
                        break;

                    case 3:
                        value = (BitStream.read(4) << 8)
                                + BitStream.read(8);

                        break;

                    case 4:
                        value = (BitStream.read(8) << 8)
                                + BitStream.read(8);

                        break;

                    case 5:
                        value = (BitStream.read(4) << 16)
                                + (BitStream.read(8) << 8)
                                + BitStream.read(8);

                        break;

                    case 6:
                        value = (BitStream.read(8) << 16)
                                + (BitStream.read(8) << 8)
                                + BitStream.read(8);

                        break;

                    case 7:
                        value = (BitStream.read(8) << 24)
                                + (BitStream.read(8) << 16)
                                + (BitStream.read(8) << 8)
                                + BitStream.read(8);

                        break;
                }

                if (BitStream.read(1)) {
                    value = -value;
                }

                if (type === 2) {
                    value /= Math.pow(10, BitStream.read(4));
                }

            // String
            } else if (type === 3) {

                var size = BitStream.read(5);
                switch(size) {
                    case 31:
                        size = (BitStream.read(8) << 24)
                               + (BitStream.read(8) << 16)
                               + (BitStream.read(8) << 8)
                               + BitStream.read(8);

                        break;

                    case 30:
                        size = (BitStream.read(8) << 8)
                               + BitStream.read(8);

                        break;

                    case 29:
                        size = BitStream.read(8);
                        break;

                }

                value = BitStream.readRaw(size);

                if (getKey) {
                    key = value;
                    getKey = false;
                    continue;
                }

            // Open Array / Objects
            } else if (type === 4 || type === 5) {

                getKey = type === 5;
                value = getKey ? {} : [];

                if (decoded === undefined) {
                    decoded = value;

                } else {

                    if (isObj) {
                        top[key] = value;

                    } else {
                        top.push(value)
                    }
                }

                top = stack[++i] = value;
                isObj = !(top instanceof Array);
                continue;

            // Close Array / Object
            } else if (type === 6) {
                top = stack[--i];
                getKey = isObj = !(top instanceof Array);
                continue;
            }


            // Assign value to top of stack or return value
            if (isObj) {
                top[key] = value;
                getKey = true;

            } else if (top !== undefined) {
                top.push(value);

            } else {
                return value;
            }

        }

        return decoded;

    }

    if (typeof window === 'undefined') {
        exports.encode = encode;
        exports.decode = decode;

    } else {
        window.BISON = {
            encode: encode,
            decode: decode
        };
    }

    var BitStream = (function() {

        // Some Lookup tables
        var chrTable = new Array(255);
        for(var i = 0; i < 256; i++) {
            chrTable[i] = String.fromCharCode(i);
        }

        var maskTable = new Array(8),
            powTable = new Array(8);

        for(var i = 0; i < 9; i++) {
            maskTable[i] = ~((powTable[i] = Math.pow(2, i) - 1) ^ 0xFF);
        }

        var stream = '',
            value = 0,
            left = 8,
            max = 0;

        return {

            open: function(data) {

                left = 8;

                if (data !== undefined) {
                    max = data.length;
                    index = 0;
                    stream = data;
                    value = stream.charCodeAt(index);

                } else {
                    value = 0;
                    stream = '';
                }

            },

            close: function() {

                if (value > 0) {
                    stream += chrTable[value];
                }

                return stream;

            },

            writeRaw: function(raw) {

                if (left !== 8) {
                    stream += chrTable[value];
                    value = 0;
                    left = 8;
                }

                stream += raw;
            },

            readRaw: function(count) {

                if (left !== 8) {
                    index++;
                    value = 0;
                    left = 8;
                }

                var data = stream.substr(index, count);

                index += count;
                value = stream.charCodeAt(index);
                return data;

            },

            write: function write(val, count) {

                var overflow = count - left,
                    use = left < count ? left : count,
                    shift = left - use;

                if (overflow > 0) {
                    value += val >> overflow << shift;

                } else {
                    value += val << shift;
                }

                left -= use;

                if (left === 0) {

                    stream += chrTable[value];
                    left = 8;
                    value = 0;

                    if (overflow > 0) {
                        write(val & powTable[overflow], overflow);
                    }

                }

            },

            read: function read(count) {

                if (index >= max) {
                    return null;
                }

                var overflow = count - left,
                    use = left < count ? left : count,
                    shift = left - use;

                var val = (value & maskTable[left]) >> shift;

                left -= use;

                if (left === 0) {

                    value = stream.charCodeAt(++index);
                    left = 8;

                    if (overflow > 0) {
                        val = val << overflow | read(overflow);
                    }

                }

                return val;

            }

        };

    })();


})();

