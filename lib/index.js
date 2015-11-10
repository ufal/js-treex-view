var $ = require('jquery');
var Treex = require('./Treex');
var TreeView = require('./TreeView');
var Pager = require('./Pager');
var Attributes = require('./Attributes');

function template() {
  const TEMPLATE_PARTS = ['svg', 'pagination', 'sentence', 'attributes'];

  var styles = require('./index.less');
  var template = $(require('./template.dot')(styles));

  var parts = {
    html: template
  };
  for (var i = TEMPLATE_PARTS.length - 1; i >= 0; i--) {
    var part = TEMPLATE_PARTS[i];
    parts[part] = template.find(`[${part}]`).get(0);
  }

  return parts;
}

module.exports = function (element, data) {
  var $element = $(element),
    parts = template();

  $element.html(parts.html);

  var view = new TreeView(parts.svg);

  view.init(Treex.Document.fromJSON(data));

  var pager = new Pager(parts.pagination);
  pager.init(view);

  var attributes = new Attributes(parts.attributes);
  view.onNodeSelect(function (node) {
    attributes.show(node);
  });

  attributes.onClose(() => {
    view.deselectNode(true /* suppress event */)
  });

  view.description(parts.sentence);
  view.drawBundle();
};
