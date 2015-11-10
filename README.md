# Treex View
Javascript library for visualizing Treex files

[![Build Status](https://travis-ci.org/ufal/js-treex-view.svg?branch=master)](https://travis-ci.org/ufal/js-treex-view)

# How to Get It

The latest version is in the [releases branch](https://github.com/ufal//js-treex-view/tree/releases).
- [Javascript](https://raw.githubusercontent.com/ufal/js-treex-view/releases/js-treex-view.js)

The library requires [jQuery](http://jquery.com/).


# Usage

1. Include JS file
```.html
<!-- Include jQuery first -->
<script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
<!-- Then load the library -->
<script src="js-treex-view.js"></script>
```

2. Load data and init treex view
```.html
<div id="treex-view"></div>
```
```.javascript
$.ajax('/test/test.json').done(function (data) {
    $('#treex-view').treexView(data);
});
```
