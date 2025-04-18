/**
 * Babel configuration for Jest tests
 * Configured to handle ES modules in the server codebase
 */
module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
  plugins: [
    // Add any plugins needed for your specific ES module features
  ],
};
