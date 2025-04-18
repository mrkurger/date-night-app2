/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended', 'plugin:node/recommended', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 2021,
  },
  rules: {
    'prettier/prettier': 'warn',
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'node/no-process-exit': 'warn',
    'node/no-unsupported-features/es-syntax': 'warn',
    'node/no-missing-require': 'warn',
    'node/no-unpublished-require': 'off',
    'no-inner-declarations': 'warn',
    'no-useless-escape': 'warn',
    'no-undef': 'error',
  },
  ignorePatterns: ['node_modules/', 'coverage/', 'dist/', 'build/', 'logs/', 'uploads/'],
  overrides: [
    {
      // Allow more warnings in test files
      files: ['tests/**/*.js', '**/*.test.js'],
      rules: {
        'no-unused-vars': 'off',
        'node/no-missing-require': 'off',
      },
    },
  ],
};
