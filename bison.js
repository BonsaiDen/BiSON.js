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

(function() {
var floor = Math.floor, round = Math.round, ceil = Math.ceil;
var tok = [];
for (var i = 0; i < 256; i++) {
    tok.push(String.fromCharCode(i));
}

var enc = '';
function _encode(data) {
    if (typeof data === 'number') {
        
        // Floats
        var add = 0;
        if (floor(data) !== data) {
            var m = data > 0 ? floor(data) : ceil(data);
            var r = round((data - m) * 100);
            if (m < 0 || r < 0) {
                m = 0 - m;
                r = 0 - r;
                add = 1;
            }
            
            if (m < 256) {
                if (m === 0) {
                    enc += tok[13 + add] + tok[r + 128];
                
                } else {
                    enc += tok[13 + add] + tok[r] + tok[m];
                }
            
            } else if (m < 65536) {
                enc += tok[15 + add] + tok[m >> 8 & 0xff]
                                     + tok[m & 0xff] + tok[r];
            
            } else if (m < 2147483648) {
                enc += tok[17 + add] + tok[m >> 24 & 0xff]
                                     + tok[m >> 16 & 0xff]
                                     + tok[m >> 8 & 0xff]
                                     + tok[m & 0xff] + tok[r];
            
            } else {
                enc += tok[1 + add] + tok[0];
            }
        
        // Fixed
        } else {
            if (data < 0) {
                data = 0 - data;   
                add = 1;
            }
            
            if (data < 113) {
                enc += tok[25 + data + add * 112];
            
            } else if (data < 256) {
                enc += tok[1 + add] + tok[data];
            
            } else if (data < 65536) {
                enc += tok[3 + add] + tok[data >> 8 & 0xff]
                                    + tok[data & 0xff];
            
            } else if (data < 2147483648) {
                enc += tok[5 + add] + tok[data >> 24 & 0xff]
                                    + tok[data >> 16 & 0xff]
                                    + tok[data >> 8 & 0xff]
                                    + tok[data & 0xff];
            
            } else {
                enc += tok[1 + add] + tok[0];
            }
        }
    
    // Strings
    } else if (typeof data === 'string') {
        enc += tok[7] + data + tok[0];
    
    // Booleans
    } else if (typeof data === 'boolean') {
        enc += tok[data ? 19 : 20];
    
    // Null
    } else if (data === null) {
        enc += tok[0];
    
    // Objects / Arrays
    } else if (typeof data === 'object') {
        if (data instanceof Array) {
            enc += tok[8];
            for (var i = 0, l = data.length; i < l; i++) {
                _encode(data[i]);
            }
            enc += tok[9];
        
        } else {
            enc += tok[10];
            for (var i in data) {
                enc += tok[25 + i.length] + i;
                _encode(data[i]);
            }
            enc += tok[11];
        }
    }
}

function encode(data) {
    enc = '';
    _encode(data);
    return enc;
}

function decode(data) {
    var p = 0, l = data.length;
    var s = [], d = [], f = null, t = 0;
    var dict = false, set = false, init = false;
    var str = '', k ='';
    while (p < l) {
        t = data.charCodeAt(p++), f = s[0];
        
        // Keys
        if (dict && set && t > 24) {
            k = data.substring(p, p + t - 25);
            p += t - 25;
            set = false;
        
        // Array / Objects
        } else if (t === 8 || t === 10) {
            var a = t === 8 ? [] : {};
            set = dict = t === 10;
            if (init) {
                f instanceof Array ? f.push(a) : f[k] = a;
            
            } else {
                init = true;
                d.push(a);
            }
            s.unshift(a);
        
        } else if (t === 11 || t === 9) {
            s.shift();
            set = dict = !(s[0] instanceof Array);
        
        // Fixed
        } else if (t > 24) {
            t = t - 25;
            t = t > 112 ? (0 - t + 112) : t 
            f instanceof Array ? f.push(t) : f[k] = t;
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
            value = t % 2 ? value : 0 - value
            f instanceof Array ? f.push(value) : f[k] = value;
            set = true;
        
        // Floats
        } else if (t > 12 && t < 19) {
            var size = floor((t - 1) / 2) - 6;
            var m = 0, r = 0;
            if (size === 0) {
                r = data.charCodeAt(p);
                if (r > 127) {
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
            m = t % 2 ? m + r * 0.01 : 0 - (m + r * 0.01);
            f instanceof Array ? f.push(m) : f[k] = m;
            set = true;
        
        // Booleans
        } else if (t > 18 && t < 21) {
            f instanceof Array ? f.push(t === 19) : f[k] = t === 19;
            set = true;
        
        // Null
        } else if (t === 0) {
            f instanceof Array ? f.push(null) : f[k] = null;
            set = true;
        
        // Strings
        } else if (t === 7) {
            str = '';
            while (data.charCodeAt(p) !== 0) {
                str += data.charAt(p++);
            }
            p++;
            f instanceof Array ? f.push(str) : f[k] = str;
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

