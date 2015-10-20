
var $ = require('jquery');

function Hint() {
  this.parent = $('body');
  this.visible = false;
  this.hint = $('<div>')
      .css({
        position: 'absolute',
        'z-index': 350,
        border: '1px solid black',
        'background-color': '#faf7aa',
        'padding': '4px',
        'border-radius': '4px',
        'white-space': 'nowrap'
      });
}

(function(proto) {
  proto.show = function(content) {
    if (this.lastContent !== content) {
      this.hint.html(content.replace(/\n/g, '<br />'));
      this.lastContent = content;
    }

    if (!this.visible) {
      this.parent.append(this.hint);
      this.visible = true;
    }
  };

  proto.move = function(event, side) {
    // When side == 'left', the tree_hint object will have its 'left' CSS property
    // set - it will be positioned on the right side of the mouse pointer.
    // And otherwise for side == 'right'.
    if (typeof(side) === 'undefined' || (side !== 'left' && side !== 'right')) {
      side = 'left';
    }

    var posY = event.pageY + 10,
        posX = 0,
        width = this.hint.outerWidth(),
        height = this.hint.outerHeight(),
        winWidth = $(window).width(),
        winHeigth = $(document).height();

    if (side === 'left') {
      posX = event.pageX + 10;
      if (posX + width > winWidth) {
        posX -= posX + width - winWidth;
      }
    } else {
      posX = this.parent.width() - event.pageX + 10;
    }

    if (posY + height > winHeigth) {
      posY -= posY + height - winHeigth;
    }

    this.hint.css(side, posX).css('top', posY);
  };

  proto.hide = function() {
    if (this.hint) {
      this.hint.remove();
      this.visible = false;
    }
  };

  proto.offsetX = function() { return this.parent.offset().left; };
  proto.offsetY = function() { return this.parent.offset().top; };

}(Hint.prototype));

module.exports = Hint;