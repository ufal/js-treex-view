var treex = module.exports = {};

// define all `classes` here
var Document, Bundle, Zone, Tree, Node;

treex.documents = {}; // hash of loaded documents

var has = 'hasOwnProperty';

treex.parseStyles = function (styles) {
  var style = {};
  if (!styles) {
    return style;
  }
  // #{name:value}
  var n = styles.match(/#\{[a-zA-Z0-9-:\.#]+\}/g);
  if (!n) {
    return style;
  }
  for (var i = 0; i < n.length; i++) {
    var val = n[i].slice(2, -1); // kill brackets
    val = val.split(':');

    var name = val[0];
    val = val[1];

    name = name.split('-');
    var cat = name.length > 1 ? name.shift() : 'Node';
    name = name.shift();

    if (!style[cat]) {
      style[cat] = {};
    }
    style[cat][name] = val;
  }
  return style;
};

Document = function () {
  this.bundles = []; // an array, because order matters
  this.file = '';
};
treex.Document = Document;
treex.document = function () {
  return new Document();
};

Document.fromJSON = function (bundles) {
  var doc = new Document(),
    i = -1,
    n = bundles.length;

  while (++i < n) {
    var bundle = bundles[i],
      b = Bundle.fromJSON(bundle);
    b.document = doc;
    doc.bundles.push(b);
  }
  return doc;
};

Bundle = function () {
  this.zones = {}; // indexed by `language`-`selector`
  this.document = null;
};
treex.Bundle = Bundle;
treex.bundle = function () {
  return new Bundle();
};

Bundle.prototype = {
  allZones: function () {
    var zones = [];
    for (var label in this.zones) {
      zones.push(this.zones[label]);
    }
    return zones;
  },
  allTrees: function () {
    var trees = [],
      zones = this.zones;
    for (var label in zones) {
      if (zones[has](label)) {
        var zone = zones[label],
          ztrees = zone.trees;
        for (var layer in ztrees) {
          if (ztrees[has](layer)) {
            trees.push(ztrees[layer]);
          }
        }
      }
    }

    return trees;
  }
};

Bundle.fromJSON = function (json) {
  var bundle = new Bundle(),
    zones = json.zones;
  bundle.style = treex.parseStyles(json.style);
  bundle.desc = json.desc; // just assign it
  for (var label in zones) {
    var zone = zones[label],
      z = Zone.fromJSON(zone);
    z.bundle = bundle;
    z.label = label;
    bundle.zones[label] = z;
  }
  return bundle;
};

Zone = function () {
  this.trees = {};
  this.sentence = '';
  this.label = '';
  this.bundle = null;
};
treex.Zone = Zone;
treex.zone = function () {
  return new Zone();
};

Zone.fromJSON = function (json) {
  var zone = new Zone(),
    trees = json.trees;
  for (var layer in trees) {
    var tree = trees[layer],
      t = zone.trees[layer] = Tree.fromJSON(tree.nodes);
    t.layer = tree.layer;
    t.language = tree.language;
  }
  zone.sentence = json.sentence;
  return zone;
};

/*
 * Trees related functions
 */
// tree is defined by root node
Tree = function (root) {
  this.root = root;
  this.layer = '';
  this.language = '';
};
treex.Tree = Tree;
// mask constructor
treex.tree = function (root) {
  return new Tree(root);
};

Tree.fromJSON = function (nodes) {
  // index nodes first
  var nodesIndex = {};
  var treeNodes = [];
  var root, node, treeNode = null;
  for (var i = 0, ii = nodes.length; i < ii; i++) {
    node = nodes[i];
    treeNode = new Node(node.id, node.data, node.style);
    treeNode.labels = node.labels;
    treeNode.hint = node.hint;
    treeNode.order = i;
    nodesIndex[node.id] = treeNode;
    treeNodes.push(treeNode);
    if (node.parent === null) {
      root = treeNode;
    }
  }
  if (!root) {
    // this should never happen
    throw 'Tree has no root!';
  }
  var tree = new Tree(root);
  // manually assign these
  tree.index = nodesIndex;
  tree.nodes = treeNodes;

  // reconstruct the tree parent/child relations
  for (i = 0, ii = nodes.length; i < ii; i++) {
    treeNode = treeNodes[i];
    node = nodes[i];
    if (node.firstson) {
      treeNode.firstson = nodesIndex[node.firstson];
    }
    if (node.parent) {
      treeNode.parent = nodesIndex[node.parent];
    }
    if (node.rbrother) {
      treeNode.rbrother = nodesIndex[node.rbrother];
    }
  }
  return tree;
};

Tree.prototype = {
  allNodes: function () {
    return this.nodes;
  }
};

var order = 0;

Node = function (id, data, style) {
  this.id = id;
  this.data = data || {};
  this.style = treex.parseStyles(style);
  this.parent = null;
  this.lbrother = null;
  this.rbrother = null;
  this.firstson = null; // leftmost son
  this.order = order++;
  this.uid = 'node_' + this.order; // globaly unique id
};
treex.Node = Node;
treex.node = function (id, data) {
  return new Node(id, data);
};

// Try to match function names with Treex::PML::Node
Node.prototype = {
  isLeaf: function () {
    return this.firstson == null;
  },
  isRoot: function () {
    return this.parent == null;
  },
  root: function () {
    var node = this;
    while (node && node.parent != null) {
      node = node.parent;
    }
    return node;
  },
  attr: function (attr) {
    return this.data[attr];
  },
  // from left to right
  following: function (top) {
    if (this.firstson) {
      return this.firstson;
    }
    var node = this;
    while (node) {
      if (node.uid == top.uid || !node.parent) {
        return null;
      }
      if (node.rbrother) {
        return node.rbrother;
      }
      node = node.parent;
    }
    return null;
  },
  descendants: function () {
    var desc = [];
    var node = this.following(this);
    while (node) {
      desc.push(node);
      node = node.following(this);
    }
    return desc;
  },
  leftmostDescendant: function () {
    var node = this;
    while (node.firstson) {
      node = node.firstson;
    }
    return node;
  },
  rightmostDescendant: function () {
    var node = this;
    while (node.firstson) {
      node = node.firstson;
      while (node.rbrother) {
        node = node.rbrother;
      }
    }
    return node;
  },
  // depth of the node
  depth: function () {
    var level = -1;
    var node = this;
    while (node) {
      node = node.parent;
      level++;
    }
    return level;
  },
  children: function () {
    var children = [];
    var node = this.firstson;
    while (node) {
      children.push(node);
      node = node.rbrother;
    }
    return children;
  }//,
  // attach node to new parent
  // paste_on: function(parent) {
  //     var node = parent.firstson;
  //     if (node && this.order > node.order) {
  //         while(node.rbrother && this.order > node.rbrother.order)
  //             node = node.rbrother;
  //         var rbrother = node.rbrother;
  //         this.rbrother = rbrother;
  //         if (rbrother) rbrother.lbrother = this;
  //         node.rbrother = this;
  //         this.lbrother = node;
  //         this.parent = parent;
  //     } else {
  //         this.rbrother = node;
  //         parent.firstson = this;
  //         this.lbrother = null;
  //         if (node) node.lbrother = this;
  //         this.parent = parent;
  //     }
  // }
};
