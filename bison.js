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

(function(undefined) {
var chr = String.fromCharCode;
var tok = [];
for (var i = 0; i < 256; i++) {
    tok.push(chr(i));
}

function round(data) {
    if (data < 0) {
        var l = (data + 1 | 0) - data;
        return (l >= 1.0 && l <= 1.5) ? data | 0 : data - 1 | 0;
    }
    
    var l = data | 0;
    return data - l >= 0.5 ? data + 1 | 0 : l;
}

var enc = '';
function _encode(data) {
    if (typeof data === 'number' && data < 2147483648) {
        
        // Floats
        var add = 0, f = data >= 0 ? data | 0 : data - 1 | 0;
        if (f !== data) {
            var m = data > 0 ? f : data | 0;
            var r = round((data - m) * 100);
            if (data < 0) {
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
            
            } else {
                enc += tok[17 + add] + tok[m >> 24 & 0xff]
                                     + tok[m >> 16 & 0xff]
                                     + tok[m >> 8 & 0xff]
                                     + tok[m & 0xff] + tok[r];
            }
        
        // Fixed
        } else {
            if (data <= 0) {
                data = 0 - data;
                add = 1;
            
            } else {
                data--;
            }
            
            if (data < 112) {
                enc += tok[25 + data + add * 112];
            
            } else if (data < 256) {
                enc += tok[1 + add] + tok[data];
            
            } else if (data < 65536) {
                enc += tok[3 + add] + tok[data >> 8 & 0xff]
                                    + tok[data & 0xff];
            
            } else {
                enc += tok[5 + add] + tok[data >> 24 & 0xff]
                                    + tok[data >> 16 & 0xff]
                                    + tok[data >> 8 & 0xff]
                                    + tok[data & 0xff];
            }
        }
    
    // Strings
    } else if (typeof data === 'string') {
        var l = data.length;
        enc += tok[7];
        while (l >= 255) {
            l -= 255;
            enc += tok[255];
        }
        enc += tok[l] + data;
    
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
            for (var e in data) {
                enc += tok[25 + e.length] + e;
                _encode(data[e]);
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
    var s = [], d = undefined, f = null, t = 0, i = -1;
    var dict = false, set = false;
    var k = '', e = null, r = 0;
    while (p < l) {
        t = data.charCodeAt(p++);
        f = s[i];
        
        // Keys
        if (dict && set && t > 24) {
            k = data.substring(p, p + t - 25);
            p += t - 25;
            set = false;
        
        // Array / Objects
        } else if (t === 8 || t === 10) {
            e = t === 8 ? new Array() : new Object();
            set = dict = t === 10;
            d !== undefined ? f instanceof Array ? f.push(e) : f[k] = e : d = e;
            s.push(e);
            i++;
        
        } else if (t === 11 || t === 9) {
            s.pop();
            set = dict = !(s[--i] instanceof Array);
        
        // Fixed
        } else if (t > 24) {
            t = t - 25;
            t = t > 111 ? (0 - t + 112) : t + 1;
            f instanceof Array ? f.push(t) : f[k] = t;
            set = true;
        
        } else if (t > 0 && t < 7) {
            r = ((t - 1) / 2) | 0;
            e = 0;
            if (r === 0) {
                e = data.charCodeAt(p);
                p++;
            
            } else if (r === 1) {
                e = (data.charCodeAt(p) << 8) + data.charCodeAt(p + 1);
                p += 2;
            
            } else if (r === 2) {
                e = (data.charCodeAt(p) << 24)
                        + (data.charCodeAt(p + 1) << 16)
                        + (data.charCodeAt(p + 2) << 8)
                        + data.charCodeAt(p + 3);
                
                p += 4;
            }
            e = t % 2 ? e + 1 : 0 - e;
            f instanceof Array ? f.push(e) : f[k] = e;
            set = true;
        
        // Floats
        } else if (t > 12 && t < 19) {
            r = (((t - 1) / 2) - 6) | 0;
            if (r === 0) {
                r = data.charCodeAt(p);
                if (r > 127) {
                    e = 0;
                    r -= 128;
                    p++;
                
                } else {
                    e = data.charCodeAt(p + 1);
                    p += 2;
                }
            
            } else if (r === 1) {
                e = (data.charCodeAt(p) << 8) + data.charCodeAt(p + 1);
                r = data.charCodeAt(p + 2);
                p += 3;
            
            } else if (r === 2) {
                e = (data.charCodeAt(p) << 24)
                    + (data.charCodeAt(p + 1) << 16)
                    + (data.charCodeAt(p + 2) << 8)
                    + data.charCodeAt(p + 3);
                
                r = data.charCodeAt(p + 4);
                p += 5;
            }
            
            e = t % 2 ? e + r * 0.01 : 0 - (e + r * 0.01);
            f instanceof Array ? f.push(e) : f[k] = e;
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
            r = 0;
            while (data.charCodeAt(p) === 255) {
                r += 255;
                p++;
            }
            r += data.charCodeAt(p++);
            f instanceof Array ? f.push(data.substr(p, r)) : f[k] = data.substr(p, r);
            p += r;
            set = true;
        }
    }
    return d;
}

if (typeof window === 'undefined') {
    exports.encode = encode;
    exports.decode = decode;

} else {
    window['BISON'] = {
        'encode': encode,
        'decode': decode
    };
}
})();

