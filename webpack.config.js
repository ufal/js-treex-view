var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: "./index.js",
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'js-treex-view.js'
  },
  externals: {
    jquery: 'jQuery'
  },
  module: {
    postLoaders: [{
      test: /\.js$/,
      exclude: /\/(node_modules|bower_components)\//,
      loader: 'autopolyfiller',
      query: {browsers: ['last 2 versions', 'ie >= 9']}
    }],
    loaders: [
      {test: /\.less/, loader: 'style!css?localIdentName=_[hash:base64:5]!postcss-loader!autoprefixer!less'},
      {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader'},
      {test: /\.json/, loader: 'json-loader'},
      {test: /\.dot/, loader: 'dot-loader'}
    ]
  },
  // Provide the Local Scope plugin to postcss-loader:
  postcss: [ require('postcss-local-scope') ],
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'index.html'),
      inject: 'head'
    })
  ]
};
