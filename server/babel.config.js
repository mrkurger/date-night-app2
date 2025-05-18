export default {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    'babel-plugin-transform-import-meta',
    // Jest typically works best with CommonJS, so we transform ESM to CJS.
    // If you have configured Jest for experimental ESM support, this might not be needed
    // or might need to be conditional.
    ['@babel/plugin-transform-modules-commonjs', { loose: true }],
  ],
};
