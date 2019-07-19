const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: {
    // treatment: './cohapp/static/cohapp/js_big/components/treatment/treatment.jsx',
    landingpage: './cohapp/static/cohapp/js_big/components/landingpage/landingpage.jsx'
  },
  output: {
    path: path.join(__dirname, 'static/cohapp/js'),
    filename: '[name].min.js',
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'cohapp/static/cohapp/js_big'),
        exclude: path.resolve(__dirname, 'node_modules'),
        options: {
          babelrc: false,
          presets: [
            ['es2015', { modules: false }],
            'react']
        }
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),

    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      include: /\.min\.js$/,
      minimize: true,
      comments: false
    })
  ]
};
