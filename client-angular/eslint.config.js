import eslint from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a compatibility instance
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: eslint.configs.recommended,
});

export default [
  eslint.configs.recommended,
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  prettierConfig,
  {
    ignores: [
      'projects/**/*',
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '.angular/**',
      'src/csp-config.js',
      '**/*.html',
      'cypress/**',
    ],
  },
  {
    files: ['**/*.ts'],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json'],
        createDefaultProgram: true,
      },
    },
    rules: {
      'prettier/prettier': 'warn',
      'no-unused-vars': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-empty': 'off',
      'no-eval': 'error',
      'no-fallthrough': 'warn',
      'no-new-wrappers': 'warn',
      'no-throw-literal': 'warn',
      'no-undef-init': 'warn',
      'no-underscore-dangle': 'off',
      'no-var': 'warn',
      'prefer-const': 'warn',
      'arrow-body-style': 'warn',
      'constructor-super': 'error',
      eqeqeq: ['warn', 'smart'],
      'guard-for-in': 'warn',
      'no-bitwise': 'warn',
      'no-caller': 'warn',
      radix: 'warn',
    },
  },
  {
    files: ['**/*.html'],
    rules: {},
  },
];
