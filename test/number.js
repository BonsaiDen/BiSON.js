var BISON = require('../lib/bison');

var ints = [
    0,
    1,
    2,
    15,
    16,
    64,
    128,
    255,
    256,
    1024,
    4095,
    4096,
    16000,
    65535,
    65536,
    20000000
]

for(var i = 0, l = ints.length; i < l; i++) {

    var e = -ints[i],
        size = BISON.encode(e),
        other = '' + e;

    console.log(e, size.length, other.length);
}



