var treexView = require('../lib');

window.onload = function () {
  var ipc = require('ipc');
  ipc.on('file-loaded', function(json) {
    var data = JSON.parse(json);
    treexView(document.body, data);
  });

  ipc.send('treex-view-ready');

  //var currentWindow = require('remote').getCurrentWindow();
  //currentWindow.openDevTools();
};
