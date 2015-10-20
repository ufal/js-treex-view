var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: "./index.js",
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'js-treex-view.js'
  },
  module: {
    loaders: [
      {test: /\.less/, loader: 'style!css!autoprefixer!less'},
      {test: /\.html/, loader: 'html'}
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'index.html'),
      inject: 'head'
    })
  ]
};