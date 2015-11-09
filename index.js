var $ = require('jquery');
var Treex = require('./lib/Treex');
var TreeView = require('./lib/TreeView');
var Pager = require('./lib/Pager');

var styles = require('./index.less');

module.exports = $.fn.treexView = function (data) {
  var $this = $(this);
  var template = $(require('./lib/template.dot')(styles));

  $this.html(template);

  var view = new TreeView(template.find('[svg]').get(0));

  view.init(Treex.Document.fromJSON(data));

  var pager = new Pager(template.find('[pagination]').get(0));
  pager.init(view);

  view.onNodeSelect(function (node) {
    console.log(node);
  });

  view.description(template.find('[sentence]').get(0));
  view.drawBundle();
};
