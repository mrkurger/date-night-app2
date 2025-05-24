// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angularEslintPlugin from '@angular-eslint/eslint-plugin';
import angularEslintTemplateParser from '@angular-eslint/template-parser';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import rxjsXPlugin from 'eslint-plugin-rxjs-x';
import globals from 'globals';
import path from 'path';
import { fileURLToPath } from 'url';

// Correctly define __dirname for ES modules
const __filenameEsm = fileURLToPath(import.meta.url);
const __dirnameEsm = path.dirname(__filenameEsm);

// Consolidate ignore patterns
const commonIgnores = [
  '**/node_modules/',
  '**/dist/',
  '**/coverage/',
  '**/build/',
  '**/logs/',
  '**/uploads/',
  '**/.cache/',
  '**/.angular/', // Specific to Angular CLI projects
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
  // '*.md', // User wants to retire all .md docs, but let's keep this for now if some are still used by tools
  'angular.json',
  'babel.config.js',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  '**/generated/**',
  '**/temp/**',
  '**/*.bak',
  // Client-angular specific
  'projects/**/*',
  'src/csp-config.js',
  'src/babel-runtime-loader.js',
  'src/babel-runtime-loader.cjs',
  'cypress/**',
  'src/jasmine.d.ts',
  'src/assets/**',
  'src/ngsw-worker.js',
  'src/app/core/utils/test-runner.js',
  'run-single-test.js',
  'scripts/**',
];

export default tseslint.config(
  {
    ignores: [...new Set(commonIgnores)],
  },
  eslint.configs.recommended, // Base ESLint recommended rules
  ...tseslint.configs.recommended, // TypeScript recommended (non-type-aware)

  // Configuration for TypeScript files in src/
  {
    files: ['src/**/*.ts'],
    excludedFiles: [
      'src/**/*.spec.ts',
      'src/app/testing/**/*.ts',
      'src/main.ts',
      'src/polyfills.ts', // Or wherever your polyfills.ts is
      // Add other specific TS files to exclude from this strict config if needed
    ],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      '@angular-eslint': angularEslintPlugin,
      prettier: prettierPlugin,
      'rxjs-x': rxjsXPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true, // Enable type-aware linting
        tsconfigRootDir: __dirnameEsm,
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...eslintConfigPrettier.rules, // Add prettier rules from eslint-config-prettier
      'prettier/prettier': 'warn',

      // TypeScript specific rules (including type-aware)
      ...tseslint.configs.strictTypeChecked.rules,
      ...tseslint.configs.stylisticTypeChecked.rules,
      ...rxjsXPlugin.configs.recommended.rules,

      '@typescript-eslint/no-deprecated': 'warn', // THE RULE YOU REQUESTED
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      '@typescript-eslint/consistent-type-exports': [
        'warn',
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      '@typescript-eslint/no-empty-interface': 'off', // Often used in Angular
      '@typescript-eslint/no-non-null-assertion': 'off', // Sometimes necessary, use with caution

      // Angular specific rules
      '@angular-eslint/component-class-suffix': 'warn',
      '@angular-eslint/directive-class-suffix': 'warn',
      '@angular-eslint/no-input-rename': 'warn',
      '@angular-eslint/no-output-rename': 'warn',
      '@angular-eslint/use-pipe-transform-interface': 'warn',

      // General good practice rules (can be adjusted)
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'warn',
      eqeqeq: ['warn', 'smart'],
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-var': 'warn',
      'prefer-const': 'warn',
      'no-underscore-dangle': 'off', // Often used
      'max-len': [
        'warn',
        {
          code: 140, // Increased a bit for modern screens
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
          ignoreComments: true,
        },
      ],
    },
  },

  // Configuration for Angular Templates (HTML files)
  {
    files: ['src/**/*.html'],
    plugins: {
      '@angular-eslint/template': angularEslintPlugin,
    },
    languageOptions: {
      parser: angularEslintTemplateParser,
    },
    rules: {
      ...angularEslintPlugin.configs.recommended.rules, // Changed from recommendedHtml to recommended
      '@angular-eslint/template/no-negated-async': 'warn',
      // Add other template rules as needed
    },
  },

  // Configuration for Test files (e.g., *.spec.ts)
  {
    files: ['src/**/*.spec.ts', 'src/app/testing/**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      '@angular-eslint': angularEslintPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirnameEsm,
      },
      globals: {
        ...globals.jasmine, // Add jasmine globals
        ...globals.browser,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@angular-eslint/component-selector': 'off', // Often not relevant for test components
      // Relax other rules for test files if necessary
    },
  },

  // Configuration for JavaScript files in the root (e.g. config files)
  // Adjust if you have JS files within src/ that are not Angular/TS
  {
    files: ['*.js', '*.mjs', '*.cjs'], // Covers JS, ES Modules, CommonJS in root
    excludedFiles: ['client-angular/**/*.js'], // Exclude client-angular JS, handled by its own setup if any
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module', // Default to ES Modules
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off', // Often used in scripts
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_|' }],
      // Add any other specific rules for root scripts
    },
  },
);
