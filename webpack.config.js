const path = require('path');

module.exports = {
  entry: {
    lib: './web/index.js',
  },
  output: {
    path: path.join(__dirname, 'lib'),
    filename: 'index.js',
    library: 'hybro',
    libraryTarget: 'umd'
  },
  externals : {
    'react-native-webview-messaging': 'react-native-webview-messaging',
    'guid': 'guid',
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
    }],
  },
};