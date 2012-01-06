 /**
   * Copyright (c) 2010-2011 Ivo Wetzel.
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
if (typeof window === 'undefined') {
    var BISON = require('../lib/bison');
    var nodeunit = require('nodeunit');
}

function code(test, data) {
    var enc = BISON.encode(data);
    test.deepEqual(BISON.decode(enc), data);
}

var tests = nodeunit.testCase({

    'Integer': nodeunit.testCase({

        'small': function(test) {

            code(test, [0]);
            code(test, [1]);
            code(test, [32]);
            code(test, [64]);
            code(test, [117]);

            code(test, [-0]);
            code(test, [-1]);
            code(test, [-32]);
            code(test, [-64]);
            code(test, [-117]);

            code(test, [0, 1, 1, 1, 0]);
            code(test, [0, 1, 0, 1, 0]);
            code(test, [0, 2, 0, 2, 0]);

            test.done()

        },

        'medium': function(test) {

            code(test, [116]);
            code(test, [256]);
            code(test, [1024]);
            code(test, [65535]);

            code(test, [-116]);
            code(test, [-256]);
            code(test, [-1024]);
            code(test, [-65535]);

            test.done()

        },

        'big': function(test) {

            code(test, [65536]);
            code(test, [5040213]);
            code(test, [1010123024]);
            code(test, [2147483647]);

            code(test, [-65536]);
            code(test, [-5040213]);
            code(test, [-1010123024]);
            code(test, [-2147483647]);

            test.done()

        }

    }),

    'Float': nodeunit.testCase({

        'small': function(test) {

            code(test, [0.0]);
            code(test, [1.15]);
            code(test, [1.16]);
            code(test, [32.045]);
            code(test, [64.171]);
            code(test, [117.123912]);

            code(test, [-0]);
            code(test, [-1.15]);
            code(test, [-1.16]);
            code(test, [-1.123]);
            code(test, [-32.045]);
            code(test, [-64.171]);
            code(test, [-117.123912]);

            test.done()

        },

        'medium': function(test) {

            code(test, [116.2137]);
            code(test, [256.214]);
            code(test, [1024.001]);
            code(test, [65535.01]);

            code(test, [-128.2137]);
            code(test, [-256.214]);
            code(test, [-1024.001]);
            code(test, [-65535.01]);

            test.done()

        },

        'big': function(test) {

            code(test, [65536]);
            code(test, [5040213]);
            code(test, [1010123024]);
            code(test, [2147483647]);

            code(test, [-65536]);
            code(test, [-5040213]);
            code(test, [-1010123024]);
            code(test, [-2147483647]);

            test.done()

        }

    }),

    'String': nodeunit.testCase({

        'small': function(test) {
            code(test, ['Hello World']);
            code(test, ['Fooooooooooooooooooo.......:::!!!!!!']);
            code(test, ['                                                  ']);
            code(test, ['']);
            test.done();
        },

        'medium': function(test) {

            var str = '-----00000-----------0000--------000000000000-0000000--000000000000-000-----------';
            for(var i = 0, l = 9; i < l; i++) {
                str += str;
            }

//            code(test, [str]);
            test.done();

        }

    }),

    'Boolean': function(test) {
        code(test, [true]);
        code(test, [false]);
        test.done();
    },

    'Null': function(test) {
        code(test, [null]);
        test.done();
    },

    'Array': function(test) {

        code(test, [1, 2, 3]);
        code(test, ['foo', 'bla']);
        code(test, [4, 5, [[[['test'], 1]], 2]]);
        test.done();

    },

    'Object': function(test) {

        code(test, {
            a: 1,
            b: 2,
            c: 3,
            d: 4
        });

        code(test, {
            a: 1.12,
            b: 2.12,
            c: 3.12,
            d: 4.12
        });

        code(test, {
            hello: 123,
            foooo: 213,
            'test world': 1245
        });

        code(test, {
            '1123': 'blub',
            '_$cucu': '....',
            '   ': 'hello'
        });

        code(test, {

            'one': {
                hello: 123,
                foooo: 213,
                'test world': 1245
            },

            'two': {
                '1123': 'blub',
                '_$cucu': '....',
                '   ': 'hello'
            },

            'ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo': {
                longKey: true
            },

            three: {

            }

        });

        test.done();

    },

    'Mixed': nodeunit.testCase({

        nodeGame: function(test) {

            code(test, [
                    { 'foo': 12 }
            ]);

            code(test, [
                1,
                50,
                {
                    s: [480, 480],
                    ri: 1,
                    rt: 177699,
                    rg: 1,
                    rs: [],
                    m: 5,
                    p: {},
                    c: {},
                    o: {}
                }
            ])

            code(test, [9, {
                aie: [1,
                    'foo',
                    '-----------------------------------------------',
                5],
                test: {

                }
                }
            ]);

            test.done();

        }

    })

});

if (typeof window === 'undefined') {
    module.exports = tests;
}

