BiSON - Binary Encoding for JavaScript - Saving your Bandwidth
==============================================================

**BiSON** provides a JSON like encoding for your JavaScript objects but is highly
focussed on providing a format that is optimized for use with WebSockets and other 
applications where bandwidth is a major concern.


# Usage

The Library exports a `encode` and a `decode` method on either the global `BISON` 
object in the Browser or on the module when used under Node.js.

    // Encoding and decoding
    BISON.decode(BISON.encode({ key: 'value' })) // { key: 'value' }


# Details

BiSON **saves** between **20 to 45 percent** of size when compared to JSON. With 
the average saving being around **one third**.
In order to achieve a maximum of compression BiSON makes some trade offs, 
therefore it is not 100% compatible with JSON.

## Encoding Limits

- No **undefined** (like in JSON)
- Floats are single precision
- Integers are limited to 32 bits

> **Important:** For reasons of speed, **BiSON** does **not** perform any validation on the data you pass it.
> For example: Passing Numbers that are not in range will result in invalid output and result in infinite loops in the worst case.

## Speed

Fast. Trust me.


# Tests

The tests can be run with `nodeunit` or in a browser of your choice.

