var path = require('path');
var webpack = require('webpack');
var merge = require('webpack-merge');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer');
var argv = require('minimist')(process.argv.slice(2));
var pgk = require('./package.json');

var definePlugin = new webpack.DefinePlugin({
  VERSION: JSON.stringify(pgk.version),
  PRODUCTION: !!argv.p,
  DEVELOPMENT: !!argv.debug
});

var common = {
  module: {
    postLoaders: [{
      test: /\.js$/,
      exclude: /\/(node_modules|bower_components)\//,
      loader: 'autopolyfiller',
      query: {browsers: ['last 2 versions', 'ie >= 9']}
    }],
    loaders: [
      {test: /\.less/, loader: 'style!css?localIdentName=_[hash:base64:5]!postcss-loader!autoprefixer!less'},
      {test: /\.css/, loader: 'style!css!autoprefixer'},
      {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader'},
      {test: /\.json/, loader: 'json-loader'},
      {test: /\.dot/, loader: 'dot-loader'}
    ],
  },
  plugins: [definePlugin],
  // Provide the Local Scope plugin to postcss-loader:
  postcss: [ require('postcss-local-scope') ]
};

var jqueryPlugin = merge(common, {
  entry: "./index.js",
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'js-treex-view.js'
  },
  externals: {
    jquery: 'jQuery'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'index.html'),
      inject: 'head'
    })
  ]
});

var electronApp = merge(common, {
  entry: ['./app/index.js'],
  output: {
    path: path.join(__dirname, 'electron'),
    filename: 'index.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'app/index.html'),
      inject: false
    })
  ]
});

electronApp.target = webpackTargetElectronRenderer(electronApp);

module.exports = argv.debug ? jqueryPlugin : [jqueryPlugin, electronApp];
