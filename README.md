# Treex View
Javascript library for visualizing Treex files

[![Build Status](https://travis-ci.org/ufal/js-treex-view.svg?branch=master)](https://travis-ci.org/ufal/js-treex-view)

# Usage

1. Include JS file
```.html
<script src="js-treex-view.js"></script></head>
```

2. Load data and init tree view
```.html
<div id="treex-view"></div>
```

```.javascript
$.ajax('/test/test.json').done(function (data) {
    $('#treex-view').treexView(data);
});
```
