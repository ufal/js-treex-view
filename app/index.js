var treexView = require('../lib');

window.onload = function () {
  require('./index.css');
  var ipc = require('ipc');
  ipc.on('file-loaded', function(json) {
    var data = JSON.parse(json);
    document.body.classList.remove('loading');
    treexView(document.body, data);
  });

  ipc.send('treex-view-ready');

  var currentWindow = require('remote').getCurrentWindow();
  currentWindow.openDevTools();
};
