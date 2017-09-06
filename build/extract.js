/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

require('usnam-pmb');

var EX = {}, fs = require('fs'), rxEat = require('rxeat170819'),
  pkgMeta = require('../package.json');

function ifObj(x, d) { return ((x && typeof x) === 'object' ? x : d); }
function arrAppend(a, b) { a.push.apply(a, b); }
function unpackSingleItem(a, f) { return (a.length > 1 ? a : (a[0] || f)); }
function filterIf(f, x, y, z) { return (f ? (f(x, y, z) || x) : x); }
function rxg(t, r, g, d) { return ((r.exec(t) || false)[g || 0] || d); }

function fail(why, details) {
  if (details) { console.error('E:', why, details); }
  throw new Error(why);
}


EX.runFromCLI = function () {
  fs.readFile(process.argv[2], 'UTF-8', function (err, text) {
    if (err) { throw err; }
    var defs = EX.splitDefs(text), meta = defs.meta;
    defs = defs.map(EX.parseDef);
    defs = EX.dictifyDefs(defs, meta);
    defs = EX.simplifyMetaOnlyDict(defs);
    console.log(EX.prettierJSON(defs));
  });
};


EX.prettierJSON = function (defs) {
  var j = JSON.stringify(defs, null, 2);
  function compactifyArray(m) { return m.replace(/(\S)\n\s*/g, '$1 '); }
  j = j.replace(/\n *\[\n[\n -Z_-~]+\]/g, compactifyArray);
  j = j.replace(/(^|\n *)(\{|\[)(?=\n)/g, '$1$2\r');
  j = j.replace(/(\{|\[)\r\s+/g, '$1 ');
  j = j.replace(/\n\s+(\}|\])(?=,?\n|$)/g, ' $1');
  j = j.replace(/\r/g, '');
  return j;
};


EX.splitDefs = function (src) {
  src = src.split(/\n\s*\) where\s*\n\s*/);
  if (src.length < 2) { fail('No "where"?'); }
  if (src.length > 2) { fail('Too many "where"s?'); }

  var defs, meta = {
    moduleName: rxg(src[0], /\n\s*module \S+\.(\w+)\s*\n/, 1, null),
    license: pkgMeta.license,
    origAuthor: pkgMeta.author,
  };

  defs = src[1].replace(/\t/g, ' ').replace(/\r/g, ''
    ).replace(/^[\S\s]+?\n *import [\S\s]+?\n(?= *\-{2,}| *\S+ +:: )/, ''
    ).replace(/\s+\n/g, '\n'
    ).replace(/(^|\n)((?: *\-{2}[ -~]*(?:\n+|$))+)/g, '$1§<comm§$2§comm>§'
    ).replace(/(\n)(§\w*>§)/g, '$2$1'
    ).replace(/(\n)( *\S+ +:: )/g, '$1§<def§$2'
    ).replace(/§\w*>§\n§<\w*§/g, '\n'
    ).replace(/§\w*>§/g, ''
    ).split(/(?:^|\n)§<\w+§/);

  defs.meta = meta;
  return defs;
};


function setProp(d, k, v) {
  d[k] = v;
  return d;
}


function rplInto(d, k, r) {
  return function (m) {
    d[k] = m;
    return (r || '');
  };
}


EX.commentRgx = /^(?: *\-{2}[ -~]*\n+)+/;
EX.parseDef = function (src) {
  if (!src) { return; }
  var e = rxEat(src.trim() + '\n'), m, d = {};

  if (e(EX.commentRgx)) {
    d.comment = e(0).replace(/(^|\n)\-+ */g, '$1').trim();
  }
  e(/^import \S+\n/);
  if (!e.tx) { return; }

  if (e(/^\s*(\w+)\s+:: +([ -~]+)\n/)) {
    d.name = e(1);
    d.type = e(2).trim();
  }
  if (!d.name) { fail('no name?', [e.tx]); }
  if (!d.type) { fail('no type?', [e.tx]); }

  m = (e(/^\s*(\w+)\s+/) && e(1));
  if (m !== d.name) { fail('no repeated name?', [d.name, m, e.tx]); }

  if (!e(/^((?:\w+\s+)*)=\s*/)) { fail('no equal?', [e.tx]); }
  m = e(1);
  if (m) { m = m.match(/\S+/g); }
  if (m && m.length) { d.args = unpackSingleItem(m, '?'); }

  src = e.tx.replace(/^(\S+)(\s+|$)/, function (m, how, sp) {
    return (m && (how === d.type ? '' : how + sp));
  });
  src = src.replace(/\n {10,}(,)/g, '$1');
  src = src.trim();
  //src = unpackSingleItem(src.split(/\n+/), '');
  d.src = src;
  return d;
};


EX.dictifyDefs = function (defs, meta) {
  var order = [], dict = { '': meta }, monoType = null;
  meta.monoType = false;
  meta.order = order;

  defs.forEach(function (d) {
    if (!d) { return; }
    var n = d.name, t = d.type;
    d = Object.assign({}, d);
    if (dict[n] !== undefined) { fail('Duplicate ' + t + ' ' + n); }
    delete d.name;
    order.push(n);
    if (monoType === null) { monoType = t; }
    if (monoType !== t) { monoType = false; }
    dict[n] = d;
  });
  order.forEach(function (n, i) {
    var d = dict[n], t = d.type;
    if (monoType) { delete d.type; }
    d = filterIf(EX['typeFx_' + t], d, i, dict);
    if (ifObj(d) && (Object.keys(d).length === 0)) { d = undefined; }
    if (d === undefined) { delete dict[n]; } else { dict[n] = d; }
  });
  if (monoType) { filterIf(EX['dictFx_' + monoType], dict); }
  meta.monoType = monoType;
  return dict;
};


EX.simplifyMetaOnlyDict = function (d) {
  var k = Object.keys(d), m = d[''];
  if (k.length !== 1) { return d; }
  if (k[0] !== '') { return d; }
  return m;
};


function wholeMatch(r, t) {
  var m = r.exec(t);
  return (m ? ((t === m[0]) && m) : false);
}


EX.typeFx_Interval = function (d) {
  d.src = d.src.replace(/ interval_(\w+) *= *(\d+)/g, function (m, k, v) {
    d[m && k] = +v;
    return '';
  });
  if (wholeMatch(/^\{[ ,]*\}$/, d.src)) { delete d.src; }
};


EX.typeFx_Int = function (d, i, dict) {
  if (!wholeMatch(/^\d+$/, d.src)) { return; }
  var n = +d.src, m = dict[''];

  if (d.comment) {
    if (i === 0) { EX.firstCommentFx_Int(d, dict); }
    if (m.groups) {
      m.groups.push([i, d.comment]);
      delete d.comment;
    }
  }

  delete d.src;
  if (i === 0) {
    m.n_min = n;
    m.n_max = n;
  } else {
    if (m.n_min > n) { m.n_min = n; }
    if (m.n_max < n) { m.n_max = n; }
  }
  if (n !== (m.n_min + i)) { d.n = n; }
};
EX.typeFx_MidiPitch = EX.typeFx_Int;

EX.firstCommentFx_Int = function (d, dict) {
  var ln = d.comment.split(/\n/);
  if (ln[0].substr(0, 3) === 'GM ') {
    if (ln[1]) {
      d.comment = ln[1];
      dict[''].groups = [];
    } else {
      delete d.comment;
    }
    return;
  }
};


EX.typeFx_Duration = function (d) { return d.src; };























module.exports = EX;
if (require.main === module) { EX.runFromCLI(); }
