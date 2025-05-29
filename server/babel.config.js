export default {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-typescript', { allowDeclareFields: true }],
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    'babel-plugin-transform-import-meta',
    // For Jest with ESM support, we don't need to transform modules to CommonJS
    // since we're using ts-jest with ESM preset
  ],
};
