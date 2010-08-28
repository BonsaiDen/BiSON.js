BiSON.js
========

**BiSON.js** is size optimized binary encoding for JavaScript objects.

**BiSON.js** makes some tradeoffs in order to archive a very small size of the 
data.

- Floating points numbers are limited to **2 digits of precision**
- There is no **NaN** or **Infinite**
- Strings can't contain **0x00**
- Just like in JSON **undefined** gets ignored
- Object keys are limited to **230 characters**


Speed
=====

See for yourself by running `test.js` with node or open up `test.html` in a
web browser of your choice.

**But I want dah test resultz *NAO(!)***  
Okay...

**V8 under Node.js**
BiSON encode: 6 ms  
JSON stringify: 22 ms  
 
BiSON decode: 8 ms  
JSON parse: 22 ms  


**V8 under Chrome 6**
BiSON encode: 6 ms  
JSON stringify: 23 ms  

BiSON decode: 8 ms  
JSON parse: 25 ms  


**Firefox 4 Beta 4**
BiSON encode: 65 ms  
JSON stringify: 18 ms  

BiSON decode: 21 ms  
JSON parse: 19 ms  


**Opera 10.61**
BiSON encode: 30 ms  
JSON stringify: 14 ms  

BiSON decode: 24 ms  
JSON parse: 7 ms  


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

