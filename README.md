
<!--#echo json="package.json" key="name" underline="=" -->
payasan-base-names-pmb
======================
<!--/#echo -->

<!--#echo json="package.json" key="description" -->
JSON translations of some of the name definitions from Payasan, a Haskell
framework for making music models and embedded DSLs.
<!--/#echo -->

* payasan repo: https://github.com/stephentetley/payasan

If you prefer the GM1 (General MIDI Level 1) patch names,
check package `midi-instrument-names-gm1-pmb`.


Files
-----

* `build/`
  * `build.sh`: Bash script to download the original files and extract
    the definitions. Some extractions aren't very smart and meaningful
    yet; feel free to improve the extractor.
  * `orig-files/`
    * `LICENSE.txt`: original license file.
    * `*.hs`: original source code files.
* `dist/`
  * `*.json`: JSON representation of the definitions found in some of
    the `.hs` files.
  * `*.amd.js`: Same JSON, wrapped in `define(…)` for AMD.




Usage
-----

from [test.js](test.js):

<!--#include file="test.js" start="  //#u" stop="  //#r"
  outdent="  " code="javascript" -->
<!--#verbatim lncnt="15" -->
```javascript
var payaNames = require('payasan-base-names-pmb'),
  families = payaNames.instruments.groups,
  ins = payaNames.instruments.order;

// verify some differences from the GM1 names:
same(families[13],  [ 104, 'World' ]);

same(ins[3].slice(-4),      'tonk');
same(ins[7].slice(-4),      'cord');
same(ins.slice(24, 29).map(acronymize),
  [ 'N.A.G.', 'S.A.G.', 'J.E.G.', 'C.E.G.', 'M.E.G.' ]);
  // ^-- Payasan has the details on the left
same(ins[46].slice(-7),     'strings');   // maybe a harp, maybe not
```
<!--/include-->



<!--#toc stop="scan" -->



&nbsp;


License
-------
<!--#echo json="package.json" key=".license" -->
BSD-3-Clause
<!--/#echo -->
<!--#echo json="package.json" key=".author" before="Copyright (C) " -->
Copyright (C) Stephen Peter Tetley (https://github.com/stephentetley)
<!--/#echo -->
Packaged for npm by @mk-pmb
