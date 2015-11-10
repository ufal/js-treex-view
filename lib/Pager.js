var $ = require('jquery');

/** @type d3 */
var d3 = require('d3');

var styles = require('./Pager.less');

const MAX_PAGES = 12;

class Page {
  constructor(number, text, active) {
    this.number = number;
    this.bundle = number - 1;
    this.text = text;
    this.active = !!active;
  }
}

class Pager {
  /**
   * @param element
   */
  constructor(element) {
    this.element = element;
  }

  getPages() {
    var treeView = this.treeView,
      totalPages = treeView.$doc.bundles.length,
      currentPage = treeView.bundle + 1,
      startPage = 1,
      endPage = totalPages,
      isOverMax = MAX_PAGES < totalPages,
      pages = [];

    if (isOverMax) {
      startPage = Math.max(currentPage - Math.floor(MAX_PAGES / 2), 1);
      endPage = startPage + MAX_PAGES - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = endPage - MAX_PAGES + 1;
      }
    }

    for (var page = startPage; page <= endPage; page++) {
      pages.push(new Page(page, page, currentPage === page));
    }

    if (isOverMax) {
      if (startPage > 3) {
        pages.unshift(new Page(startPage - 1, '...'));
      }

      if (endPage < totalPages) {
        pages.push(new Page(endPage + 1, '...'));
      }
    }

    return pages;
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
        this.renderPages();
      });

    this.pages = d3.select(this.element)
      .append('ul')
      .attr('class', styles.pages);

    this.next = this._button()
      .text('Next')
      .on('click', () => {
        treeView.nextBundle();
        this.renderPages();
      });

    this.renderPages();
  }

  _button() {
    return d3.select(this.element)
      .append('button')
      .attr({
        'class': styles.button,
        type: 'button'
      })
  }

  renderPages() {
    var pages = this.pages
      .selectAll('li')
      .data(this.getPages(), d => d.text + d.bundle);

    pages
      .enter()
      .append('li')
      .on('click', (d) => {
        this.treeView.setBundle(d.bundle);
        this.renderPages();
      })
      .append('span')
      .text(d => d.text);

    pages.exit().remove();
    pages.classed(styles.active, d => d.active);
    pages.sort((a, b) => d3.ascending(a.number, b.number));
    this.update();
  }

  update() {
    this.next.property('disabled', () => !this.treeView.hasNextBundle());
    this.prev.property('disabled', () => !this.treeView.hasPreviousBundle());
  }
}

module.exports = Pager;
