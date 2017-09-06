/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
/*global define: true */
((typeof define === 'function') && define.amd ? define : function (factory) {
  'use strict';
  var m = ((typeof module === 'object') && module), e = (m && m.exports);
  if (e) { m.exports = (factory(require, e, m) || m.exports); }
})(function req() {
  'use strict';
  return {
    diatonic:     require('./diatonic.json'),
    drums:        require('./drums.json'),
    duration:     require('./duration.json'),
    instruments:  require('./instruments.json'),
    interval:     require('./interval.json'),
    key:          require('./key.json'),
    pitch:        require('./pitch.json'),
    scale:        require('./scale.json')
  };
});
