var timings = {};
var log = null;

var ints = [], floats = [], dicts = [], arrays = [], bools = [], strings = [];
for(var i = 0; i < 30; i++) {
    ints.push(0);
    ints.push(1);
    ints.push(-5);
    ints.push(1000);
    ints.push(-2500);
    ints.push(1000000);
    ints.push(-2500000);
    ints.push(2147483647);
    ints.push(-2147483647);
    
    floats.push(0.24);
    floats.push(1.12);
    floats.push(-5.98);
    floats.push(1000.45);
    floats.push(-2500.37);
    floats.push(1000000.12);
    floats.push(-2500000.64);
    floats.push(2147483647.01);
    floats.push(-2147483647.99);
    
    dicts.push({});
    dicts.push({'a': {}, 'b': {}});
    dicts.push({'c': {'f': {}}, 'd': {}});
    
    arrays.push([]);
    arrays.push([[], [], []]);
    arrays.push([[], [[], []], [[], []]]);
    
    bools.push(true);
    bools.push(false);
    bools.push(null);
    bools.push(true);
    bools.push(false);
    bools.push(null); 
    bools.push(true);
    bools.push(false);
    bools.push(null);
    bools.push(true);
    bools.push(false);
    bools.push(null);
    
    strings.push('Foo');
    strings.push('Hello World Hello World');
    strings.push('The cake is a lie... The cake is a lie... The cake is a lie...');
    strings.push('Hey listen! Hey listen!Hey listen! Hey listen! Hey listen! Hey listen! Hey listen! Hey listen! Hey listen! Hey listen! Hey listen! Hey listen! Hey listen! Hey listen!Hey listen! Hey listen! Hey listen!  Hey listen!Hey listen! Hey listen! Hey listen! Hey listen!Hey listen!Hey listen!Hey listen!vHey listen!Hey listen!Hey listen!Hey listen!Hey listen!Hey listen!Hey listen!Hey listen!Hey listen!Hey listen!Hey listen!');
}

if (!BISON) {
    var BISON = require(__dirname + '/bisonOpt');
}


function getSpeed(foo) {
    var cur = start = new Date().getTime();

    cur = start = new Date().getTime();
    var count = 0;
    while (cur < start + 250) {
        foo();
        count++;
        cur = new Date().getTime();
    }
    return count;
}

function runTest(id, data) {
    log('Running ' + id + '...');
    setTimeout(function() {
        var encoded = BISON.encode(data);
        var eps = getSpeed(function(){BISON.encode(data);}) * 4;
        var dps = getSpeed(function(){BISON.decode(encoded);}) * 4;
        
        if (!timings[id]) {
            timings[id] = [];
        }
        var et = Math.floor((1000 / eps) * 1000) / 1000;
        var dt = Math.floor((1000 / dps) * 1000) / 1000;
        log('    enc/s', eps, '(' + et + 'ms)')
        log('    dec/s', dps, '(' + dt + 'ms)');
        log(' ');
        timings[id].push([eps, et, dps, dt]);
    }, 20);
}

function getMedian(values) {
    values.sort();
    if (values.length % 2 == 0) {
        return (values[Math.ceil(values.length / 2)]
                + values[Math.floor(values.length / 2)]) / 2;
    
    } else {
        return values[Math.ceil(values.length / 2)];
    }
}


var globalRuns = 0;
var tests = ['Integers', 'Floats', 'Arrays', 'Objects', 'Booleans', 'Strings'];
function runTests(id) {
    if (id == 0) {
        runTest('Integers', ints);
    
    } else if (id == 1) {
        runTest('Floats', floats);
    
    } else if (id == 2) {
        runTest('Arrays', arrays);
    
    } else if (id == 3) {
        runTest('Objects', dicts);
    
    } else if (id == 4) {
        runTest('Booleans', bools)
    
    } else if (id == 5) {
        runTest('Strings', strings);
    
    } else if (id == 6) {
        if (globalRuns < 6) {
            globalRuns++;
            
            setTimeout(function(){clear();runTests(-1);}, 250);
        
        } else {
            clear();
            for(var i = 0; i < 6; i++) {
                var t = timings[tests[i]];
                var eps = [], dps = [], et = [], dt = [];
                for(var e = 0; e < t.length; e++) {
                    eps.push(t[e][0]);
                    et.push(t[e][1]);
                    dps.push(t[e][2]);
                    dt.push(t[e][3]);
                }
                log('Results for ' + tests[i] + ':');
                log('    enc/s', getMedian(eps), '(' + getMedian(et)+ 'ms)');
                log('    dec/s', getMedian(dps), '(' + getMedian(dt) + 'ms)');
                log(' ');
            }
            return;
        }
    }
    setTimeout(function(){runTests(id + 1);}, 250);
}

if (typeof window !== 'undefined') {
    log = function() {
        var e = '';
        for(var i = 0; i < arguments.length; i++) {
            var f = ('' + arguments[i]).replace(/\s/g, '&nbsp;').replace(/\n/g, '<br/>');
            e += f + ' ';
        }
        document.body.innerHTML = document.body.innerHTML + e + '<br/>';
    };
    clear = function() {
        document.body.innerHTML = '';
    };

} else {
    log = console.log;
    clear = function(){};
    runTests(-1);
}
