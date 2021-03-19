module.exports = {
  root: true,
  env: {
    webextensions: true,
    browser: true,
  },
  extends: [
    'airbnb-base',
  ],
  plugins: [
    'import',
  ],
  ignorePatterns: [
    'dist/*',
  ],
};
