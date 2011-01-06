BiSON.js - Binary Encoding for JavaScript
-----------------------------------------

**BiSON** is size optimized binary encoding for JavaScript objects, it was 
designed for real time web games and other applications that might be bandwidth 
limited.

### Output Size

BiSON **saves** between **20 to 45 percent** of size when compared to JSON. With 
the average saving being around **one third**.
In order to achieve a maximum of compression BiSON makes some trade offs, 
therefore it is not 100% compatible with JSON.

### Valid BiSON

- **true**, **false**, **null**
- Any Number between **-2147483647.99** and **2147483647.99** (inclusive) 

> **Note:** Floats are rounded to 2 decimal places

- **Object** and **Arrays** of any size and nesting depth
- **Strings** of any length

Just like with JSON, all data needs to be encapsulated in a top level **Array** or **Object**.

> **Important:** For reasons of speed, **BiSON** does **not** perform any validation on the data you pass it.
> Therefore passing for example Numbers that are not in range will result in malformed output.

### Speed

Depending on the input, BiSON under V8 is between 2 to 5 times **faster** than 
native JSON and **just as fast** as JSON in Firefox 4 Beta.

For more detailed results visit the 
[JSPerf Benchmark](http://jsperf.com/bison/6).

