
var d3 = require('d3');
var layouts = require('./Layouts');

var Hint = require('./Hint');
var Stylesheet = require('./Stylesheet');

function TreeView(container) {
  this.$top = d3.select(container);
}

(function(twproto) {
  twproto.init = function(document) {
    var self = this,
        top = self.$top;
    self.$doc = document;
    self.bundle = 0;
    self.dispatch = d3.dispatch('nodeSelect');
    self.selectedNode = null;

    self.desc = null;
    self.svg = top
        .append('div').attr('class', 'treeview-gfx')
        .append('svg');
  };

  twproto.description = function(container) {
    this.desc = d3.select(container);
  };

  twproto.selectNode = function(datum, node) {
    var self = this,
        lastNode = self.selectedNode;
    if (lastNode !== node) {
      self.deselectNode(true); // deselect but suppress event
      self.nodeSelection = d3.select(node).append('rect')
          .attr('width', datum.width)
          .attr('height', datum.height)
          .attr('x', 0)
          .attr('y', 0)
          .style('fill', '#c80000')
          .style('fill-opacity', '0.1')
          .style('stroke', '#c80000')
          .style('stroke-width', '1.5px');
      self.selectedNode = node;
      self.dispatch.nodeSelect(datum, node, lastNode);
    } else {
      self.deselectNode();
    }
  };

  twproto.deselectNode = function(suppressEvent) {
    var self = this;
    if (self.nodeSelection) {
      self.nodeSelection.remove();
      if (!suppressEvent) {
        self.dispatch.nodeSelect(null, null, self.selectedNode);
      }
      self.selectedNode = self.nodeSelection = null;
    }
  };

  twproto.onNodeSelect = function(listener) {
    this.dispatch.on('nodeSelect', listener);
  };

  twproto.nextBundle = function() {
    var self = this;
    if (self.hasNextBundle()) {
      self.bundle += 1;
      self.drawBundle();
    }
  };

  twproto.hasNextBundle = function() {
    return (this.bundle+1) < this.$doc.bundles.length;
  };

  twproto.previousBundle = function() {
    var self = this;
    if (self.hasPreviousBundle()) {
      self.bundle -= 1;
      self.drawBundle();
    }
  };

  twproto.setBundle = function(bundle) {
    this.bundle = bundle;
    this.drawBundle();
  };

  twproto.hasPreviousBundle = function() {
    return this.bundle > 0;
  };

  twproto.drawBundle = function() {
    var self = this,
        bundle = self.$doc.bundles[self.bundle],
        desc = self.desc,
        hint = new Hint(),
        svg = self.svg, w, h;

    self.deselectNode();
    if (desc) {
      displayDesc(desc, self.svg, bundle);
    }
    var trees = svg.selectAll('.tree')
        .data(bundle.allTrees(), function(d) { return d.language + '-' + d.layer; });
    trees.enter().append('g')
        .attr('class', 'tree');

    var lastTree,
        me = self;
    w = h = 0;
    trees.each(function(d) {
      var self = d3.select(this),
          style = new Stylesheet(d),
          tree = d.layer === 'p' ? layouts.constituency() : layouts.tree(),
          nodes = tree.nodes(d),
          links = tree.links(nodes);

      !self.select('g.links').empty() || self.append('g').attr('class', 'links');
      !self.select('g.nodes').empty() || self.append('g').attr('class', 'nodes');

      var link = self.select('g.links').selectAll('.link')
          .data(links, function(d) { return d.source.uid + '|' + d.target.uid; });
      style.styleConnection(link.enter())
          .attr('class', 'link')
          .order();

      var node = self.select('g.nodes').selectAll('.node')
          .data(nodes, function(d) { return d.uid; });
      style.styleNode(node.enter().append('g')
          .attr('class', 'node')
          .attr('id', function(d) { return d.id; }));

      node.each(function(d) {
        var bbox = this.getBBox();
        d.figure = this;
        d.width = bbox.width;
        d.height = bbox.height;
      });

      var mouseout;
      if (desc) {
        mouseout = function(d) {
          desc.selectAll('span.'+d.id).classed('highlight', false);
          if (d.hint) {
            hint.hide();
          }
        };

        node
            .on('mouseover', function(d) {
              desc.selectAll('span.'+d.id).classed('highlight', true);
              if(d.hint) {
                hint.show(d.hint);
              }
            })
            .on('mousemove', function(d) {
              if(d.hint) {
                hint.move(d3.event) ;
              }
            })
            .on('mouseout', mouseout);
      }

      node.on('click', function(d) {
        me.selectNode(d, this);
        if (mouseout) {
          var pos = d3.mouse(this);
          if (pos[0] < 0 || pos[0] > d.width ||
              pos[1] < 0 || pos[1] > d.height) {
            mouseout(d);
          }
        }
      });

      tree.computeLayout(nodes);

      style.connect(link);
      link.exit().remove();

      //node.attr('transform', function(d) { return "translate(" + d.x + "," +  d.y + ")"; });
      node.attr('transform', function(d) { return 'translate(' + d.x + ',' +  d.y + ')'; });
      node.exit().remove();

      var bbox = this.getBBox(),
          shift = 0;

      if (lastTree) {
        shift = lastTree.x + lastTree.width + 10;
        w = shift + bbox.width;
      } else {
        w = bbox.x + bbox.width;
      }
      if (h < bbox.height) h = bbox.height;
      bbox.x = shift;
      self.attr('transform', 'translate(' + bbox.x + ',' + 10 + ')');
      lastTree = bbox;
    });
    trees.exit().remove();
    svg.attr('width', w+14)   // include possible selection stroke
        .attr('height', h+12);
  };

  function displayDesc(desc, top, bundle) {
    desc.selectAll('span').remove();
    var sentence = desc.selectAll('span')
        .data(bundle.desc);
    sentence.enter().append('span')
        .attr('class', function(d) { return d.slice(1).join(' '); })
        .each(function(d) {
          var self = d3.select(this),
              main = d[1];
          if (main === 'newline') self.append('br');
          else self.text(function(d) { return d[0]; });

          if (main == 'label' || main == 'newline' || main == 'space') {
            return;
          }
          self.classed('mouse-highlight', true);
          self.on('click', function(d) {
            var classes = d.slice(1),
                n = classes.length,
                i = -1,
                selector = '';
            if (n == 0) return;
            while (++i < n) {
              classes[i] = '#'+classes[i];
            }
            top.selectAll(classes.join(', '))
                .each(function(d) {
                  var self = d3.select(this),
                      elem = d3.select(this.firstChild) || self,
                      bbox = this.firstChild ? this.firstChild.getBBox() : this.getBBox(),
                      halfWidth = bbox.width/2,
                      halfHeight = bbox.height/2,
                      r = Math.sqrt(halfWidth*halfWidth + halfHeight*halfHeight);
                  self.append('circle')
                      .attr('cx', bbox.x + halfWidth)
                      .attr('cy', bbox.y + halfHeight)
                      .attr('r', r)
                      .attr('fill', 'none')
                      .attr('stroke', elem.style('fill') || 'orange')
                      .attr('stroke-width', 3)
                      .transition()
                      .duration(1000)
                      .attr('r', 4*r)
                      .remove();
                });
          });
        });
    sentence.exit().remove();
  }
})(TreeView.prototype);


module.exports = function(args) {
  return new TreeView(args);
};