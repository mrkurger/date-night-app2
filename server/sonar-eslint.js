// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for sonar-eslint settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
export default {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  plugins: ['sonarjs'],
  rules: {
    'sonarjs/no-identical-functions': 'error',
    'sonarjs/no-duplicate-string': ['error', { threshold: 5 }],
    'sonarjs/cognitive-complexity': ['error', 15],
  },
  ignorePatterns: ['node_modules/', 'coverage/', 'dist/', 'build/', 'logs/', 'uploads/'],
};
