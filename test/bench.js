var BISON = require('../lib/bison');

function time(callback) {

    var cur = start = Date.now(),
        count = 0, d;

    while(Date.now() < start + 333) {
        d = callback();
        count++;
    }

    return Math.floor(count * 3.333);

}

function string(len) {
    return new Array(len + 1).join('-');
}


var data = {

    integers: [
        1,
        5,
        100,
        150,
        2501,
        47123,
        213123,
        2147483647,
        -1,
        -5,
        -100,
        -150,
        -2501,
        -47123,
        -213123,
        -2147483647,
    ],

    floats: [

        1.123,
        5.122,
        100.1494,
        150.303,
        2501.1234,
        47123.573,
        213123.45,
        21474836.12,

        -1.123,
        -5.122,
        -100.1494,
        -150.303,
        -2501.1234,
        -47123.573,
        -213123.45,
        -21474836.12

    ],

    bools: [true, false, null, false, true, null, false, true, null, false, true, null, false, true, null],
    objects: [

        {},
        { 'adasdasdas': 'foo'},
        { 'adasdasdas': {} },
        { 'adasdasdas': {}, 'bdasdsad': {} },
        { 'cdasdasdas': { 'fooOO': {} }, 'diadsdasdsad': {} }

    ],

    arrays: [
        [],
        [[]],
        [[]],
        [ [], [] ],
        [ [[]], []]
    ],

    strings: [

        string(2),
        string(256),
        string(2560),
        string(70000)

    ]

};


for(var i in data) {

    console.log('\n' + i + ':');

    var value = data[i], count = data[i].length;
    console.log('  encode BISON:', time(function() {
        return BISON.encode(value);

    }) * count);

    console.log('stringify JSON:', time(function() {
        return JSON.stringify(value);

    }) * count);

    var encoded = BISON.encode(data[i]);
    console.log('  decode BISON:', time(function() {
        return BISON.decode(encoded);
    }) * count);

    var encoded = JSON.stringify(data[i]);
    console.log('    parse JSON:', time(function() {
        return JSON.parse(encoded);
    }) * count);


    var enc = BISON.encode(data[i])
    var bl = enc.length,
        jl = JSON.stringify(data[i]).length;

    var ratio = 1 / jl * bl;
    console.log('      Ratio:', ratio);

}


