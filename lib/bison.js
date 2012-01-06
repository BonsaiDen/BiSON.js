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

    var array = Array,
        chr = new array(32768);

    for (var i = 0; i < 32768; i++) {
        chr[i] = String.fromCharCode(i);
    }

    // Encoder ----------------------------------------------------------------
    var encoded = '';
    function __encode(value, top) {

        // Numbers
        if (typeof value === 'number') {

            var type = value !== (value | 0), sign = 0;
            if (value < 0) {
                value = -value;
                sign = 1;
            }

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

            // 17 - 19 (236 left = 116 per sign)
            if (value < 118 && type === false) {
                encoded += chr[15 + sign * 118 + value];

            // 7 - 10
            } else if (value < 65536) {
                encoded += chr[7 + type + sign * 2] + chr[value >> 8 & 0xff] + chr[value & 0xff];

            // 11 - 14
            } else {
                encoded += chr[11 + type + sign * 2]
                           + chr[value >> 24 & 0xff]
                           + chr[value >> 16 & 0xff]
                           + chr[value >> 8 & 0xff]
                           + chr[value & 0xff];
            }

            if (type) {
                encoded += chr[shift];
            }

        // Strings
        } else if (typeof value === 'string') {

            var l = value.length;
            encoded += chr[6];

            while (l >= 32677) {
                l -= 32767;
                encoded += chr[32767];
            }

            encoded += chr[l] + value;

        // Booleans
        } else if (typeof value === 'boolean') {
            encoded += chr[value ? 1 : 2];

        // Null
        } else if (value === null) {
            encoded += chr[0];

        // Arrays
        } else if (value instanceof array) {

            encoded += chr[3];
            for(var i = 0, l = value.length; i < l; i++) {
                __encode(value[i]);
            }

            if (!top) {
                encoded += chr[5];
            }

        // Object
        } else {

            encoded += chr[4];
            for(var i in value) {
                encoded += chr[16 + i.length] + i;
                __encode(value[i]);
            }

            if (!top) {
                encoded += chr[5];
            }

        }

    }


    function encode(value) {
        encoded = '';
        __encode(value, true);
        return encoded;
    }


    // Decoder ----------------------------------------------------------------
    function decode(string) {

        var pos = 0, l = string.length,
            stack = [], i = -1, e,
            type, top, value, obj,

            // Objects
            getKey = false, key = null, isObj, decoded;

        while (pos < l) {

            // Grab type from string and current top of stack
            type = string.charCodeAt(pos++);
            obj = top;

            // Null
            if (type === 0) {
                value = null;

            // Boolean
            } else if (type < 3) {
                value = type === 1;

            // Open Array / Objects
            } else if (type < 5) {

                value = type === 3 ? [] : {};
                getKey = isObj = key !== null || type === 4;
                top = stack[++i] = value;

                if (decoded === undefined) {
                    decoded = value;
                    continue;
                }

            // Close Array / Object
            } else if (type === 5) {
                top = stack[--i];
                getKey = isObj = !(top instanceof array);
                continue;

            // Object Keys
            } else if (type >= 16 && getKey) {
                key = string.substring(pos, pos += type - 16);
                getKey = false;
                continue;

            // String
            } else if (type === 6) {

                e = 0;
                while (type = string.charCodeAt(pos++)) {

                    e += type;
                    if (type !== 32767) {
                        break;
                    }

                }

                value = string.substring(pos, pos + e);
                pos += e;

            // Number
            } else if (type < 15) {

                // 0-65535
                if (type < 11) {
                    type -= 7;
                    value = (string.charCodeAt(pos++) << 8) + string.charCodeAt(pos++);

                // >= 65536
                } else {
                    type -= 11;
                    value = (string.charCodeAt(pos++) << 24) + (string.charCodeAt(pos++) << 16) + (string.charCodeAt(pos++) << 8) + string.charCodeAt(pos++);
                }

                // Sign
                e = (type & 2) === 2 ? 1 : 0;
                if (e) {
                    value = -value;
                }

                // Floats
                if (type - e * 2) {
                    e = string.charCodeAt(pos++)
                    value /= Math.pow(10, e);
                }

            // Integers < 116
            } else {
                type -= 15;
                value = type > 117 ? (0 - type + 118) : type;
            }

            // Assign value to top of stack or return value
            if (isObj && key !== null) {
                obj[key] = value;
                getKey = true;
                key = null;

            } else {
                obj.push(value);
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

})();


exports.encode([1.16, 65533.01, 24.123123])
