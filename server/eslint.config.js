s for a createEmitAndSemanticDiagnosticsBuilderProgram, node// @ts-check
import eslint from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import nPlugin from 'eslint-plugin-n';
import globals from 'globals';
import * as tseslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import airbnbTypescript from 'eslint-config-airbnb-typescript';

export default [
  eslint.configs.recommended,
  {
    plugins: {
      n: nPlugin, // Changed from node: nodePlugin
    },
    rules: {
      ...nPlugin.configs.recommended.rules,
      'n/no-unpublished-import': 'off', // Added to allow devDependencies here
      'n/no-extraneous-import': ['error', { allowModules: ['@eslint/js', 'globals'] }], // Allow these specific modules
    },
  },
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
      'n/no-process-exit': 'warn', // Changed from error to warn for now
    },
    ignores: ['services/file-encryption.service.js'],
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
      ...airbnbTypescript.rules,
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'import/prefer-default-export': 'off',
      'no-underscore-dangle': ['error', { allow: ['_id'] }],
    },
  },
  {
    files: ['tests/**/*.{js,ts}', '**/*.test.{js,ts}', '**/*.spec.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node, // nPlugin still deals with Node.js environment specifics
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'n/no-unpublished-import': 'off',
      'n/no-missing-import': 'off',
      'n/no-extraneous-import': 'off',
    },
  },
];
