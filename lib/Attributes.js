/** @type jQuery */
var $ = require('jquery');
/** @type d3 */
var d3 = require('d3');
var styles = require('./Attributes.less');

class Attributes {

  constructor(element) {
    this.element = element;

    this.hideEmpty = true;
    this.hidden = true;
    var template = $(require('./Attributes.dot')(styles));
    var $element = $(element);
    $element.append(template);
    $element.find('input[name="hide-empty"]').change((e) => {
      this.hideEmpty = e.target.checked;
      this.update();
    });

    $element.find('span[close]').click(() => {
      this.hide();
    });

    this._dispatch = d3.dispatch('open', 'close');

    this.table = d3.select(this.element)
      .classed(styles.attributes, true)
      .select('[table]');
  }

  onOpen(listener) {
    this._dispatch.on('open', listener);
  }

  onClose(listener) {
    this._dispatch.on('close', listener);
  }

  update() {
    this.createTable(this.filterData(this.node.attributes), this.table);
  }

  createTable(data, table) {
    var self = this;

    if (data.length === 0) {
      table.append('tr')
        .append('td').text('<empty>');
      return;
    }
    var rows = table
      .selectAll(() => table.node().childNodes)
      .data(data, (d) => d.id);

    var row = rows.enter()
      .append('tr')
      .selectAll(() => rows.node().childNodes)
      .data(d => d && d.expand ? [d] : [d.name, d.value], d => d && d.id ? d.id : d);

    row.enter()
      .append('td')
      .attr('colspan', d => d && d.expand ? 2 : null)
      .each(function (d) {
        var td = d3.select(this);
        if (!d || typeof d !== 'object') {
          td.text(d);
          return;
        }

        table = td.text(d.name)
          .attr('class', styles.expandable)
          .append('table')
          .append('tbody');
        self.createTable(self.filterData(d.children), table);
      });

    row.exit().remove();
    rows.exit().remove();
    rows.sort((a, b) => d3.ascending(a.name, b.name));
  }

  filterData(data) {
    if (this.hideEmpty) {
      return data.filter(d => (d.value !== '' && d.value !== null));
    }

    return data;
  }

  show(node) {
    this.node = node;
    if (node) {
      if (this.hidden) {
        $(this.element).addClass(styles.visible);
        this._dispatch.open();
        this.hidden = false;
      }
      this.update();
    } else {
      this.hide();
    }
  }

  hide() {
    if (this.hidden) {
      return;
    }
    $(this.element).removeClass(styles.visible);
    this._dispatch.close();
    this.hidden = true;
  }
}

module.exports = Attributes;
