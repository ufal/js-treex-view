var $ = require('jquery');
var Treex = require('./lib/Treex');
var TreeView = require('./lib/TreeView');

// TODO REMOVE
if (!window.jQuery) {
  window.$ = window.jQuery = $;
}

require('./index.less');

$.fn.treexView = function (data) {
  var $this = $(this);
  var template = $(require('./lib/template.html'));

  $this.html(template);

  var view = new TreeView(template.find('.treex-view-pane').get(0));

  view.init(Treex.Document.fromJSON(data));
  view.onNodeSelect(function (node) {
    console.log(node);
  });

  view.description(template.find('.treex-view-sentence').get(0));
  view.drawBundle();
};
