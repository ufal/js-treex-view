var d3 = require('d3');

var defaultOptions = {
  nodeXSkip : 10,
  nodeYSkip : 5,
  marginX: 2,
  marginY: 2
};

module.exports.constituency = function(opts) {
  var maxDepth;

  //TODO
  opts = defaultOptions;
  opts.nodeXSkip = 4;

  function layout(tree) {
    var nodes = tree.allNodes()
        .sort(function(a, b) { return d3.ascending(a.order, b.order); });

    maxDepth = d3.max(nodes, function(node) { return node.depth(); });

    return nodes;
  }

  layout.computeLayout = function(nodes) {
    var i = -1, ii,
        n = nodes.length,
        widths = [],
        left = 0,
        levelWidths = [],
        heights = [],
        depth,
        node;

    // compute widths and heights

    while(++i < n) {
      node = nodes[i];
      depth = node.isLeaf() ? maxDepth : node.depth();

      if (!levelWidths[depth])
        levelWidths[depth] = 0;
      left += node.width / 2;

      if (i === 0) {
        widths[0] = left;
      } else {

        if (levelWidths[depth] >= left) {
          left = levelWidths[depth] + opts.nodeXSkip;
        } else {
          left += opts.nodeXSkip;
        }
        widths[i] = left;
        levelWidths[depth] = left + node.width;

        if (!node.isRoot() && node.children().length === 1) {
          left += 15;
        }
      }

      if (!heights[depth] || heights[depth] < node.height) {
        heights[depth] = node.height;
      }
    }

    heights.push(0);
    for(i = 0, ii = heights.length, depth = 0; i < ii; i++) {
      var swap = heights[i];
      heights[i] = depth;
      depth += swap;
    }

    i = -1;
    while(++i < n) {
      node = nodes[i];
      depth = node.isLeaf() ? maxDepth : node.depth();
      node.y = opts.marginY;

      node.y += heights[depth] + (opts.nodeYSkip + opts.marginY)*depth;
      node.x = opts.marginX + i*opts.marginX + widths[i];
    }
  };

  layout.nodes = layout;
  layout.links = nlpLinks;
  return layout;
};

module.exports.tree = function(opts) {

  //TODO
  opts = defaultOptions;

  function layout(tree) { // expecting Treex.Tree here
    return tree.allNodes()
        .sort(function(a, b) { return d3.ascending(a.order, b.order); });
  }

  layout.computeLayout = function(nodes) {
    var i = -1, ii,
        n = nodes.length,
        widths = [],
        left = 0,
        levelWidths = [],
        heights = [],
        depth,
        node;

    // compute widths and heights

    while(++i < n) {
      node = nodes[i];
      depth = node.depth();

      if (!levelWidths[depth])
        levelWidths[depth] = 0;

      if (levelWidths[depth] >= left) {
        left = levelWidths[depth] + opts.nodeXSkip;
      } else {
        left += opts.nodeXSkip;
      }
      widths[i] = left;
      levelWidths[depth] = left + node.width;

      if (!heights[depth] || heights[depth] < node.height) {
        heights[depth] = node.height;
      }
    }

    heights.push(0);
    for(i = 0, ii = heights.length, depth = 0; i < ii; i++) {
      var swap = heights[i];
      heights[i] = depth;
      depth += swap;
    }

    i = -1;
    while(++i < n) {
      node = nodes[i];
      depth = node.depth();
      node.y = opts.marginY;

      node.y = heights[depth] + (opts.nodeYSkip + opts.marginY)*depth;
      node.x = opts.marginX + i*opts.marginX + widths[i];
    }
  };

  layout.nodes = layout;
  layout.links = nlpLinks;
  return layout;
};

// Returns an array source+target objects for the specified nodes.
function nlpLinks(nodes) {
  return d3.merge(nodes.map(function(parent) {
    return (parent.children() || []).map(function(child) {
      return {source: parent, target: child};
    });
  }));
}

//function d3_nlp_treeVisitAfter(node, callback) {
//  function visit(node, previousSibling) {
//    var children = node.children();
//    if (children && (n = children.length)) {
//      var child,
//          previousChild = null,
//          i = -1,
//          n;
//      while (++i < n) {
//        child = children[i];
//        visit(child, previousChild);
//        previousChild = child;
//      }
//    }
//    callback(node, previousSibling);
//  }
//  visit(node, null);
//}