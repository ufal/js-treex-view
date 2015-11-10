var $ = require('jquery');
var treexView = require('./lib');

$.fn.treexView = function(data) {
  treexView(this, data);
};
