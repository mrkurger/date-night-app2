// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      '**/coverage/',
      '**/build/',
      '**/logs/',
      '**/uploads/',
      '**/.cache/',
      '**/.angular/',
      '**/CHANGELOG.html',
      '**/AILESSONS.html',
      '**/GLOSSARY.html',
      '_docs_index.html',
      '_glossary.html',
      '_docs*.html',
      'bakups_arkive.zip',
      'mongodb.log*',
      '*.sh',
      '*.bat',
      '*.md', // Retire all .md docs
      'angular.json',
      'babel.config.js',
      'package-lock.json', // If you use it
      'yarn.lock', // If you use it
      '**/generated/**',
      '**/temp/**',
      '**/*.bak',
    ],
  },
  eslint.configs.recommended,
  // Configuration for JavaScript files in the root directory
  {
    files: ['*.js', '*.mjs', '*.cjs'], // Covers JS, ES Modules, CommonJS in root
    excludedFiles: ['*.spec.js', '*.test.js', '.*.js'], // Exclude test files and dotfiles like .eslintrc.js
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module', // Default to ES Modules as per user instructions
      globals: {
        ...globals.node, // Common Node.js globals
        // Add any other specific globals for root scripts if necessary
      },
    },
    rules: {
      // Rules adapted from the original root .eslintrc.json for JS files
      'import/extensions': 'off',
      'no-console': 'warn',
      // "import/no-dynamic-require": "off", // More relevant for CommonJS
      // "global-require": "off", // More relevant for CommonJS
      'no-await-in-loop': 'off',
      'import/first': 'off', // Or "warn"
      'import/prefer-default-export': 'off', // Or "warn"
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-use-before-define': ['warn', { functions: false, classes: true, variables: true }],
      'no-underscore-dangle': 'off',
      'max-len': [
        'warn',
        { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true },
      ],
    },
  },
);
