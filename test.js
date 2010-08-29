if (!BISON) {
    var BISON = require(__dirname + '/bison');
}

var foo = [];
for(var i = 0; i < 10; i++) {
    foo.push(1.12);
    foo.push('foo');
    foo.push([1.45, 1.23]);
    foo.push([true, false, null]);
    foo.push([1, -2, 3, -255, 65535, 2147483647]);
    foo.push({'test': 'bla'});
}

var ints = [], floats = [], dicts = [], arrays = [], bools = [], strings = [];
for(var i = 0; i < 30; i++) {
    ints.push(0);
    ints.push(1);
    ints.push(-5);
    ints.push(1000);
    ints.push(-5000);
    ints.push(1000000);
    ints.push(-5000000);
    
    floats.push(0.24);
    floats.push(1.12);
    floats.push(-5.98);
    floats.push(1000.45);
    floats.push(-5000.37);
    floats.push(1000000.12);
    floats.push(-5000000.64);
    
    dicts.push({});
    dicts.push({'a': {}, 'b': {}});
    dicts.push({'c': {'f': {}}, 'd': {}});
    
    arrays.push([]);
    arrays.push([[], [], []]);
    arrays.push([[], [[], []], [[], []]]);
    
    bools.push(true);
    bools.push(false);
    bools.push(null);
    
    strings.push('Foo');
    strings.push('Hello World');
    strings.push('The cake is a lie...');
    strings.push('Hey listen!');
    
}

function timeIt(foo) {
    var time = 1000000000;
    for(var i = 0; i < 5; i++) {
        time = Math.min(timeMedian(foo), time);
        
    }
    return time;
}

function timeMedian(foo) {
    for(var i = 0; i < 10; i++) {
        foo();
    }
    
    var times = [];
    for(var e = 0; e < 10; e++) {
        var start = new Date().getTime();
        for(var i = 0; i < 200; i++) {
            foo();
        }
        times.push(new Date().getTime() - start);
    }
    
    if (times.length % 2 == 0) {
        return (times[Math.ceil(times.length / 2)]
                + times[Math.floor(times.length / 2)]) / 2;
    
    } else {
        return times[Math.ceil(times.length / 2)];
    }
}

function assertIt(id, input) {
    var encoded = BISON.encode(input);
    var decoded = BISON.decode(encoded);
    if (JSON.stringify(input) === JSON.stringify(decoded)) {
        console.log(id + ': PASSED');
    
    } else {
        console.log(id + ': FAILED!');
        console.log('Expected: ' + JSON.stringify(input)
                    + '\nGot:      ' + JSON.stringify(decoded) + '\n')
    }
}

function runTiming(foo, json) {
    // Encode
    console.log('BiSON encode:', timeIt(function(){BISON.encode(foo);}), 'ms');
    if (json) {
        console.log('JSON stringify:', timeIt(function(){JSON.stringify(foo);}), 'ms');
        console.log(' ');
    }
    
    
    // Decode
    var bisonOut = BISON.encode(foo);
    console.log('BiSON decode:', timeIt(function(){BISON.decode(bisonOut);}), 'ms');
    
    var jsonOut = JSON.stringify(foo);
    if (json) {
        console.log('JSON parse:', timeIt(function(){JSON.parse(jsonOut);}), 'ms');
    }
    
    // Compare!
    var bisonFinal = JSON.stringify(BISON.decode(bisonOut));
    var jsonFinal = JSON.stringify(JSON.parse(jsonOut));
    
    // Size
    console.log(' ');
    if (json) {
        console.log('Final compare: ' + (bisonFinal == jsonFinal ? 'PASSED' : 'FAILED'));
    }
}


function runTests() {
    // Don't use console.log since Opera Dragonfly
    // slows down the tests by a factor of 10(!)
    // Also Firefox runs around 20% faster without Firebug enabled
    if (typeof window !== 'undefined') {
        console = {
            'log': function() {
                var e = '';
                for(var i = 0; i < arguments.length; i++) {
                    e += arguments[i] + ' ';
                }
                document.write(e + '<br/>');
            }
        };
    }
    
    console.log('== Timing All ==');
    runTiming(foo, true);
    console.log(' ');
    
    // Fixed
    assertIt('Fixed byte', [-1, 1, 0, 2, -3, 4, -5, 6, -7, 255, -255, 112, -112, 113, -113]);
    assertIt('Fixed word', [-1000, 2000, -3000, 4000, -5000, 6000, -7000, 65535, -65535]);
    assertIt('Fixed long', [-1000000, 2000000, -3000000, 4000000, -5000000, 6000000, -7000000, 2147483648, 2147483647, -2147483647]);
    
    // Floats
    assertIt('Floats byte', [0.1, -0.2, 0.25, -0.67, -0.45, -1.1, 2.2, -3.3, 4.4, -5.5, 6.6, -7.7, 255.99, -255.99]);
    assertIt('Floats word', [-1000.01, 2000.2, -3000.3, 4000.4, -5000.5, 6000.6, -7000.7, 65535.99, -65535.99]);
    assertIt('Floats long', [-1000000.01, 2000000.2, -3000000.3, 4000000.4, -5000000.5, 6000000.6, -7000000.7, 2147483647.99, 2147483648.99, -2147483647.99]);
    
    // Strings
    assertIt('Strings', ['', 'Test', 'Hello World', 'Foo123', '\u00c3\u0153\u00c3\u2013\u00c3\u201e']);
    
    // Booleans && Null
    assertIt('Boolean Null', [true, false, null]);
    
    // Arrays
    assertIt('Arrays', [[2, 3, [8, [8, [8, 9], 9], 9]], [4, 5], [6, 7, [8, 9]], [1, 2]]);
    
    // Objects
    assertIt('Objects', {'Test': 'foo', 'd': 9, 'Bla': [123, 'test'], 'uff': 1.2,
                         'dict': {'a': {'a': [1, 2], 'b': 1, 'o': {'l': 1.2, 'p': [2.9]}}}});
    
    console.log(' ');
    
    console.log('== Timing Integers ==');
    runTiming(ints);
    
    console.log('== Timing Floats ==');
    runTiming(floats);
    
    console.log('== Timing Strings ==');
    runTiming(strings);  
    
    console.log('== Timing Arrays ==');
    runTiming(arrays);
    
    console.log('== Timing Objects ==');
    runTiming(dicts);
    
    console.log('== Timing Booleans ==');
    runTiming(bools);
}

if (typeof window === 'undefined') {
    runTests();
}

