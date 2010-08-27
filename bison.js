/*
  
  BiSON.js
  Copyright (c) 2010 Ivo Wetzel.
  
  All rights reserved.
  
  BiSON.js is free software: you can redistribute it and/or
  modify it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  BiSON.js is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  BiSON.js. If not, see <http://www.gnu.org/licenses/>.
  
*/

(function(){
var chr = String.fromCharCode;
var floor = Math.floor, abs = Math.abs, round = Math.round, ceil = Math.ceil;
var isArray = Array.isArray;

var enc = '';
function _encode(data) {
    if (typeof data === 'number') {
        
        // Float
        var add = 0;
        if (floor(data) !== data) {
            var m = data > 0 ? floor(data) : ceil(data);
            var r = round((data - m) * 100);
            if (m < 0 || r < 0) {
                m = abs(m);
                r = abs(r);      
                add = 1;
            }
            
            if (m <= 255) {
                if (m === 0) {
                    enc += chr(13 + add) + chr(r + 128);
                
                } else {
                    enc += chr(13 + add) + chr(r) + chr(m);
                }
            
            } else if (m <= 65535) {
                enc += chr(15 + add) + chr(m >> 8 & 0xff)
                                     + chr(m & 0xff) + chr(r);
            
            } else if (m <= 2147483647) {
                enc += chr(17 + add) + chr(m >> 24 & 0xff)
                       + chr(m >> 16 & 0xff)
                       + chr(m >> 8 & 0xff)
                       + chr(m & 0xff) + chr(r);
            
            } else {
                enc += chr(1 + add) + chr(0);
            }
        
        // Fixed
        } else {
            if (data < 0) {
                data = abs(data);   
                add = 1;
            }
            
            if (data <= 112) {
                enc += chr(25 + data + add * 112);
            
            } else if (data <= 255) {
                enc += chr(1 + add) + chr(data);
            
            } else if (data <= 65535) {
                enc += chr(3 + add) + chr(data >> 8 & 0xff)
                                    + chr(data & 0xff);
            
            } else if (data <= 2147483647) {
                enc += chr(5 + add) + chr(data >> 24 & 0xff)
                       + chr(data >> 16 & 0xff)
                       + chr(data >> 8 & 0xff)
                       + chr(data & 0xff);
            
            } else {
                enc += chr(1 + add) + chr(0);
            }
        }
    
    // Strings
    } else if (typeof data === 'string') {
        enc += chr(7) + data + chr(0);
    
    // Boolean
    } else if (typeof data === 'boolean') {
        enc += chr(data ? 19 : 20)
    
    // Null
    } else if (data === null) {
        enc += chr(0);
    
    // Objects / Arrays
    } else if (typeof data === 'object') {
        if (isArray(data)) {
            enc += chr(8);
            for(var i = 0, l = data.length; i < l; i++) {
                _encode(data[i]);
            }
            enc += chr(9);
        
        } else {
            enc += chr(10);
            for(var i in data) {
                enc += chr(25 + i.length) + i;
                _encode(data[i]);
            }
            enc += chr(11);
        }
    }
}

function encode(data) {
    enc = '';
    _encode(data);
    return enc;
};

function add(o, v, k) {
    if (isArray(o)) {
        o.push(v);
    
    } else {
        o[k] = v;
    }
}

function decode(data) {
    var p = 0;
    var l = data.length;
    var s = [];
    var d = [];
    var k = '';
    var dict = false;
    var str = '';
    var set = false;
    var init = false;
    while(p < l) {
        var t = data.charCodeAt(p++);
        
        // Key
        if (t >= 25 && dict && set) {
            k = data.substring(p, p + t - 25);
            p += t - 25;
            set = false;
        
        // Array // Objects
        } else if (t === 8 || t === 10) {
            var a = t === 8 ? [] : {};
            set = dict = t === 10;
            if (init) {
                add(s[0], a, k);
            
            } else {
                init = true;
                d.push(a);
            }
            s.unshift(a);
        
        } else if (t === 11 || t === 9) {
            s.shift();
            set = dict = !isArray(s[0]);
        
        // Fixed
        } else if (t >= 25) {
            var value = t - 25;
            add(s[0], value > 112 ? (0 - value + 112) : value, k);
            set = true;
        
        } else if (t > 0 && t < 7) {
            var size = floor((t - 1) / 2);
            var value = 0;
            if (size === 0) {
                value = data.charCodeAt(p);
                p++;
            
            } else if (size === 1) {
                value = (data.charCodeAt(p) << 8) + data.charCodeAt(p + 1);
                p += 2;
            
            } else if (size === 2) {
                value = (data.charCodeAt(p) << 24)
                        + (data.charCodeAt(p + 1) << 16)
                        + (data.charCodeAt(p + 2) << 8)
                        + data.charCodeAt(p + 3);
                
                p += 4;
            }
            add(s[0], t % 2 ? value : 0 - value, k);
            set = true;
        
        // Floats
        } else if (t > 12 && t < 19) {
            var size = floor((t - 1) / 2) - 6;
            var m = 0, r = 0;
            if (size === 0) {
                r = data.charCodeAt(p);
                if (r >= 128) {
                    m = 0;
                    r -= 128;
                    p++;
                
                } else {
                    m = data.charCodeAt(p + 1);
                    p += 2;
                }
            
            } else if (size === 1) {
                m = (data.charCodeAt(p) << 8) + data.charCodeAt(p + 1);
                r = data.charCodeAt(p + 2);
                p += 3;
            
            } else if (size === 2) {
                m = (data.charCodeAt(p) << 24)
                    + (data.charCodeAt(p + 1) << 16)
                    + (data.charCodeAt(p + 2) << 8)
                    + data.charCodeAt(p + 3);
                
                r = data.charCodeAt(p + 4);
                p += 5;
            }
            add(s[0], t % 2 ? m + r * 0.01 : 0 - (m + r * 0.01), k);
            set = true;
        
        // Boolean
        } else if (t > 18 && t < 21) {
            add(s[0], t === 19, k);
            set = true;
        
        // Null
        } else if (t === 0) {
            add(s[0], null, k);
            set = true;
        
        // String
        } else if (t === 7) {
            str = '';
            while(data.charCodeAt(p) !== 0) {
                str += data.charAt(p++);
            }
            p++;
            add(s[0], str, k);
            set = true;
        }
    }
    return d[0];
}

if (typeof window === 'undefined') {
    exports.encode = encode;
    exports.decode = decode;

} else {
    window.BISON = {
        'encode': encode,
        'decode': decode
    };
}
})();

