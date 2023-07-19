/* eslint-env node */

const path = require('path');
const webpack = require('webpack');
const fs = require('fs');

module.exports = (env, argv) => {
  var config = {
    entry: {
      // Each entry in here would declare a file that needs to be transpiled
      // and included in the extension source.
      // For example, you could add a background script like:
      background: 'background.js',
      content: 'content.js',
      popup: 'popup.js',
      // 'navigate-collection': 'navigate-collection.js',
    },
    output: {
      // This copies each source entry into the extension dist folder named
      // after its entry config key.
      path: path.join(__dirname, 'extension', 'dist'),
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          exclude: ['/node_modules/'],
          test: /\.js$/,
          use: [
            // This transpiles all code (except for third party modules) using Babel.
            {
              // Babel options are in .babelrc
              loader: 'babel-loader',
            },
          ]
        }
      ]
    },
    resolve: {
      // This allows you to import modules just like you would in a NodeJS app.
      extensions: ['.js', '.jsx'],
      modules: [
        path.join(__dirname, 'src'),
        'node_modules',
      ],
    },
    plugins: [
      new webpack.BannerPlugin({
        banner: fs.readFileSync('License_banner', 'utf8'),
      })
    ]
  }

  if (argv.mode === 'production') {
    config.mode = 'production';
    config.devtool = false;
  } else {
    config.mode = 'development';
    config.devtool = 'source-map';
  }

  return config;
};
