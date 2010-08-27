BiSON.js
========

**BiSON.js** is size optimized binary encoding for JavaScript objects.

**BiSON.js** makes some tradeoffs in order to archive a very small size of the 
data.

- Floating points numbers are limited to **2 digits of precision**
- There is no **NaN** or **Infinite**
- Strings can't contain **0x00**
- Just like in JSON **undefined** gets ignored


Speed
=====

See for yourself by running `test.js` with node or open up `test.html` in a
web browser of your choice.

Under V8 it's around **twice as fast** as native JSON encoding.


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

