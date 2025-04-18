import eslint from '@eslint/js';
import nodePlugin from 'eslint-plugin-node';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  eslint.configs.recommended,
  {
    plugins: {
      node: nodePlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        // Common Node.js globals
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        module: 'readonly',
        require: 'readonly',
        Buffer: 'readonly',
        process: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 2021,
      },
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
    ignores: ['node_modules/', 'coverage/', 'dist/', 'build/', 'logs/', 'uploads/'],
  },
  {
    files: ['tests/**/*.js', '**/*.test.js'],
    rules: {
      'no-unused-vars': 'off',
      'node/no-missing-require': 'off',
    },
  },
];
