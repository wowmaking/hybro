const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = () => ({
  entry: [ './index.js', 'core-js', ],
  //devtool: 'cheap-module-eval-source-map',
  devtool: 'inline-source-map',
  devServer: {
    host: '0.0.0.0',
    // port: 8000,
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index.bundle.js',
  },
  // resolve: {
  //   alias: {
  //     hybro: path.resolve(__dirname, '..'),
  //   }
  // },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
});
