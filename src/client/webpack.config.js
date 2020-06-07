const path = require('path');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',

  entry: {
    app: path.join(__dirname, 'index.tsx'),
  },

  // Enable sourcemaps for debugging webpack output:
  devtool: 'source-map',

  resolve: {
    extensions: [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
    ],
  },

  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: path.join(__dirname, '../../', 'node_modules'),
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      // Re-process all output .js files' sourcemaps with 'source-map-loader'
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(__dirname, 'public', 'index.html'),
    })
  ],

  devServer: {
    contentBase: path.join(__dirname, '../../dist/client'),
    compress: true,
    port: 3000,
  },
}
