// @ts-check
import eslint from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
// import nPlugin from 'eslint-plugin-n'; // Removed to fix import resolution issues
import globals from 'globals';
import * as tseslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
// import airbnbTypescript from 'eslint-config-airbnb-typescript'; // Unused

export default [
  // Global ignores - must be first
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'logs/**',
      '**/*.d.ts',
      'data/**',
      'services/file-encryption.service.js',
    ],
  },
  eslint.configs.recommended,
  // Removed n plugin configuration to fix import resolution issues
  prettierConfig, // Must come after other configs to override their formatting rules
  {
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2021, // Or latest stable like 2022 or "latest"
      sourceType: 'module',
      globals: {
        ...globals.node, // Includes process, Buffer, console, etc.
        ...globals.jest,
      },
    },
    rules: {
      'prettier/prettier': 'warn',
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'no-console': 'off',
      'no-inner-declarations': 'warn',
      'no-useless-escape': 'warn',
      'no-undef': 'error',
      // 'n/no-process-exit': 'warn', // Removed n plugin
    },
  },
  // TypeScript specific rules
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-underscore-dangle': ['error', { allow: ['_id'] }],
    },
  },
  {
    files: ['tests/**/*.{js,ts}', '**/*.test.{js,ts}', '**/*.spec.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      // Removed n plugin rules
    },
  },
];
