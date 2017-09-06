/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var same = require('assert').deepStrictEqual, pkg = require('./package.json');

function kmap(o, f) { return Object.keys(o).map(f); }
function nth_word(n) { return function (s) { return s.split(/_/)[n - 1]; }; }
function uc(s) { return s.toUpperCase(); }
function acronymize(s) { return uc(s.replace(/([a-z])[a-z]*(_|$)/g, '$1.')); }

(function readmeDemo() {
  //#u
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
  //#r

  kmap(payaNames, function (key) {
    var list = payaNames[key], meta = (list[''] || list);
    same(meta.license, pkg.license);
    same(meta.origAuthor, pkg.author);
  });
}());









console.log("+OK tests passed.");   //= "+OK tests passed."
