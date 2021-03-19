const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background.js',
    suspended: './src/suspended.js',
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
      ],
    }),
  ],
};
