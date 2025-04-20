/**
 * Babel configuration for Jest tests
 * Configured to handle ES modules in the server codebase
 */
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for configuration settings (babel.config)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        // Transform modules to CommonJS for Jest compatibility
        modules: 'commonjs',
      },
    ],
  ],
  plugins: ['@babel/plugin-syntax-dynamic-import'],
};
