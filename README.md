Bandwidth optimized binary encoding for JavaScript 
==================================================

**BiSON** provides a JSON like encoding for your JavaScript objects but is highly
focussed on providing a format that is optimized for use with WebSockets and other 
applications where bandwidth is a major concern.


## Usage

The Library exports a `encode` and a `decode` method on either the global `BISON` 
object in the Browser or on the module when used under Node.js.

    // Encoding and decoding a Object
    BISON.decode(BISON.encode({ key: 'value' })) // { key: 'value' }


# Pro and Contra 

BiSON **saves** between **30 to 55 percent** of size when compared to **JSON**. 
With the average saving being around **45 percent**.
In order to achieve a maximum of compression BiSON makes some trade offs, 
therefore it is not 100% compatible with JSON.


## Encoding Limits

- Floats are single precision
- Integers are limited to 32 bits

> **Important:** For reasons of speed, **BiSON** does **not** perform any 
> validation on the data you pass it.
> *For example:* Passing Numbers that are not in range will result in invalid 
> output and result in infinite loops in the worst case.


## Speed

Only half as fast as recent *native* JSON implementations, but that's still 
fast enough, you want to send as little data over the network anyways.


# Tests

The tests can be run with `nodeunit` or in a browser of your choice.

# The Format

**BiSON** uses a bit stream in order to achieve maximum possible compression of 
the different data types, the format is described below.

Each `token` is prepended by a `3 bit` field that determines its `type`, 
there are `7` different types in total:

- `0`: 
    Either a `Boolean`,  `null` or `EOS`, a `2 bit` field with the following 
    values follows:

	- `0` = `false` 
	- `1` = `true` 
	- `2` = `null` 
	- `3` = End of Stream

- `1`: 
    A `Integer` in the range of `-2147483648` to `+2147483648`, a `3 bit` field
    follows that contains the number of bits that make up the actual value:

	- `0` = `1 bit` 
	- `1` = `4 bits` 
	- `2` = `8 bits` 
	- `3` = `12 bits` 
	- `4` = `16 bits` 
	- `5` = `20 bits` 
	- `6` = `24 bits` 
	- `7` = `32 bits` 

    After the above number of bits, a `1 bit` field follows containing the `sign`.

- `2`:
    A single percision `Float`, same data as the `Integer` but with an additional
    `4 bit` field at the end containing the number of decimal places the value needs
    to be shifted to the right.

- `3`:
    A `String`, a `3 bit` field with the following values:

	- `<= 28` = The length in bytes.
	- `   29` = A `8 bit` field follows containing the length in bytes.
	- `   30` = A `16 bit` field follows containing the length in bytes.
	- `   31` = A `32 bit` field follows containing the length in bytes.

    The stream is padded to the next full **byte** followed by the raw string data.

- `4`:
    Start of an `Array`, all values until the next `type = 6` are to be 
    appended to this array.

- `5`:
    Start of an `Object`. Pairs of `String` and a value follow, until the next `type 6`.
    The string is to be used as the key in the object to which the value will be 
    associated with.

- `6`:
    End of the last opened `Array` or `Object`.


# License

**BiSON** is licenses under MIT.

