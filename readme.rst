BiSON.js
========

**BiSON.js** is size optimized binary encoding for JavaScript objects.

**BiSON.js** makes some trade offs in order to archive a very small size of the encoded data.

- Number range is limited to **-2147483647** to **2147483647** (inclusive)
- Floating point precision is limited to **2 decimal places**
- There is no **NaN** or **Infinite**
- Just like in JSON **undefined** gets ignored
- Object keys are limited to **230 characters**


Speed
=====

See for yourself by running ``node bench.js`` or open up ``bench.html`` in a Browser of your choice.

In general it's twice as fast as JSON under V8 and just as fast as JSON in Firefox 4 Beta.

License
=======

Copyright (c) 2010 Ivo Wetzel.

All rights reserved.

**BiSON.js** is free software: you can redistribute it and/or
modify it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

**BiSON.js** is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
**BiSON.js**. If not, see <http://www.gnu.org/licenses/>.

