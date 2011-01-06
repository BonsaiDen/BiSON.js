// BiSON.js Test Cases ---------------------------------------------------------
// -----------------------------------------------------------------------------
var bison = require('./bison');
var equal = require('assert').equal;

function compare(msg, input) {
    var encoded = bison.encode(input);
    var decoded = bison.decode(encoded);
    equal(JSON.stringify(input), JSON.stringify(decoded), msg);
}

// Test Fixed Point Numbers ----------------------------------------------------
compare('Fixed byte', [-1, 1, 0, 2, -3, 4, -5, 6, -7, 255, -255, 112, -112,
                       113, -113, 114, -114, 117, -117, 116, -116, 115, -115]);

compare('Fixed word', [-1000, 2000, -3000, 4000, -5000, 6000, -7000, 65535,
                       -65535, 65536, -65536]);

compare('Fixed long', [-1000000, 2000000, -3000000, 4000000, -5000000, 6000000,
                       -7000000, -1147483647, 1147483647, 2147483647,
                       -2147483647]);

// Test Floating Point Numbers ------------------------------------------------
compare('Floats byte', [0.01, 0.1, -0.02, -0.2, 0.25, -0.67, -0.99, 0.99, -0.45,
                        -1.1, -1.5, 1.5, -3.5, 3.5, 2.2, -3.3, 4.4, -5.5, 6.6,
                        -7.7, 255.99, -255.99]);

compare('Floats word', [-1000.01, 2000.2, -3000.3, 4000.4, -5000.5, 6000.6,
                        -7000.7, 65535.99, -65535.99, 65536.81, -65536.81]);

compare('Floats long', [-1000000.01, 2000000.2, -3000000.3, 4000000.4,
                        -5000000.5, 6000000.6, -7000000.7, -1147483647.12,
                        1147483647.12, 2147483647.99, -2147483647.99]);

// Test Strings ---------------------------------------------------------------
compare('Strings', ['', 'Test', 'Hello World', 'Foo123', '\u00c3\u0153\u00c3\u2013\u00c3\u201e',
                     'TestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTes255',
                     'TestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTest256',
                     'TestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTest']);

// Test Boolean & Null --------------------------------------------------------
compare('Boolean Null', [true, false, null]);

// Test Arrays ----------------------------------------------------------------
compare('Arrays', [
                    [2, 3, [8, [8, [8, 9], 9], 9]],
                    [4, 5],
                    [6, 7, [8, 9]],
                    [1, 2]
                  ]);

// Test Objects ---------------------------------------------------------------
compare('Objects', {'TestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTes255': 'foo',
                    'd': 9, 'Bla': [123, 'test'], 'uff': 1.2,
                    'dict': {'a': {'a': [1, 2], 'b': 1,
                    'o': {'l': 1.2, 'p': [2.9]}}}
                   });

// Be Happy -------------------------------------------------------------------
console.log('PASSED ALL TESTS');

