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
  overrides: [
    {
      files: ['scripts/*.js'],
      rules: {
        'import/no-extraneous-dependencies': ['off'],
      },
    },
  ],
};
