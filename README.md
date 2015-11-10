# Treex View
Javascript library for visualizing Treex files

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
