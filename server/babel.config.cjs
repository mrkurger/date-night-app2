/**
 * Babel configuration for Jest tests
 * Configured to handle both ES modules and CommonJS in the server codebase
 * This file uses .cjs extension to ensure it's treated as CommonJS
 */
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
        // Allow Babel to convert ES modules to CommonJS when needed
        modules: 'auto',
      },
    ],
  ],
  plugins: [
    // Add any plugins needed for your specific ES module features
  ],
};
