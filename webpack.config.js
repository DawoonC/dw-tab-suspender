const CopyWebpackPlugin = require('copy-webpack-plugin');
const sass = require('sass');

module.exports = {
  entry: {
    background: './src/background.js',
    suspended: './src/suspended.js',

    options: './src/options.js',
    popup: './src/popup.js',
  },
  output: {
    clean: true,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/manifest.json' },
        { from: './src/suspended.html' },
        { from: './images', to: 'images' },

        { from: './src/options.html' },
        { from: './src/popup.html' },
      ],
    }),
  ],
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        loader: 'file-loader',
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: sass,
              // See https://github.com/webpack-contrib/sass-loader/issues/804
              webpackImporter: false,
              sassOptions: {
                includePaths: ['./node_modules'],
              },
            },
          },
        ],
      },
    ],
  },
};
