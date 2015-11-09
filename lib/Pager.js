var $ = require('jquery');

/** @type d3 */
var d3 = require('d3');

var styles = require('./Pager.less');

class Pager {
  /**
   * @param element
   */
  constructor(element) {
    this.element = element;
  }

  /**
   * * @param {TreeView} treeView
   */
  init(treeView) {
    $(this.element).empty();

    this.treeView = treeView;
    if (treeView.$doc.bundles.length <= 1) {
      return;
    }

    d3.select(this.element)
      .classed(styles.pagination, true);

    this.prev = this._button()
      .text('Previous')
      .on('click', () => {
        treeView.previousBundle();
        this.update();
      });

    var pages = this.pages = d3.select(this.element)
      .append('ul')
      .attr('class', styles.pages)
      .selectAll('li')
      .data(treeView.$doc.bundles);

    pages
      .enter()
      .append('li')
      .on('click', (d, i) => {
        treeView.setBundle(i);
        this.update();
      })
      .append('span')
      .text((d,i) => i+1);

    pages.exit().remove();

    this.next = this._button()
      .text('Next')
      .on('click', () => {
        treeView.nextBundle();
        this.update();
      });

    this.update();
  }

  _button() {
    return d3.select(this.element)
      .append('button')
      .attr({
        'class': styles.button,
        type: 'button'
      })
  }

  update() {
    this.next.property('disabled', () => !this.treeView.hasNextBundle());
    this.pages.classed(styles.active, (d, i) => i === this.treeView.bundle);
    this.prev.property('disabled', () => !this.treeView.hasPreviousBundle());
  }
}

module.exports = Pager;
