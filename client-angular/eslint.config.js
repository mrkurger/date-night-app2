// @ts-check
import eslint from '@eslint/js';
import * as tseslint from 'typescript-eslint';
import angularEslintPlugin from '@angular-eslint/eslint-plugin';
import angularEslintTemplateParser from '@angular-eslint/template-parser';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import globals from 'globals';

// Correctly define __dirname for ES modules
const __filenameEsm = fileURLToPath(import.meta.url);
const __dirnameEsm = path.dirname(__filenameEsm);

// Use FlatCompat for extending older eslintrc-style configs
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const compat = new FlatCompat({
  baseDirectory: __dirnameEsm, // Use the ESM-compatible __dirname
});

// Consolidate ignore patterns specific to client-angular
const clientAngularSpecificIgnores = [
  '.angular/**/*',
  '**/*.html',
  'projects/**/*',
  'src/csp-config.js',
  'src/babel-runtime-loader.js',
  'src/babel-runtime-loader.cjs',
  'cypress/**',
  'src/jasmine.d.ts',
  'src/app/testing/**/*.ts',
  'src/app/components/**/*.spec.ts',
  'src/app/features/**/*.spec.ts',
  'src/app/shared/**/*.spec.ts',
  'src/app/core/**/*.spec.ts',
  'src/app/components/login/login.component.spec.ts',
  'src/app/features/admin/admin.module.ts',
  'src/app/features/admin/content-moderation/moderation-modal/moderation-modal.component.spec.ts',
  'src/app/features/chat/chat-room/chat-room.component.ts',
  'src/app/features/chat/chat.component.ts',
  'src/app/shared/components/button/button.component.ts',
  'src/app/shared/components/card/card.component.ts',
  'src/app/shared/components/icon/icon.component.ts',
  'src/app/shared/emerald/components/card-grid/card-grid.component.ts',
  'src/app/core/services/**/*.ts',
  'src/app/core/interceptors/**/*.ts',
  'src/app/core/models/**/*.ts',
  'src/app/core/types/**/*.ts',
  'src/app/shared/types/**/*.ts',
  'src/app/shared/emerald/**/*.ts',
  'src/typings.d.ts',
  'src/main.ts',
  'src/shared/**/*.ts',
  'scripts/**',
  'src/assets/**',
  'src/ngsw-worker.js',
  'src/app/core/utils/test-runner.js',
  'run-single-test.js',
  'src/app/features/auth/components/register/register.component.ts',
  'src/app/features/features.module.ts',
  'src/app/shared/modules/review.module.ts',
  'src/app/shared/modules/shared.module.ts',
  'src/app/features/chat/chat.component.fixed.ts',
  'src/app/features/wallet/wallet.component.ts',
  'src/app/shared/components/custom-nebular-components/nb-paginator/nb-paginator.component.ts',
];
const uniqueClientAngularSpecificIgnores = [...new Set(clientAngularSpecificIgnores)];

export default tseslint.config(
  {
    ignores: uniqueClientAngularSpecificIgnores,
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended, // Use non-type-aware linting
  // Angular ESLint configurations
  {
    files: ['**/*.ts'],
    plugins: {
      '@angular-eslint': angularEslintPlugin,
    },
    rules: {
      // Angular rules
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularEslintTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularEslintPlugin, // Plugin for HTML templates
    },
    rules: {
      // Template rules
    },
  },
  eslintConfigPrettier, // Disables ESLint rules that conflict with Prettier
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirnameEsm, // Use ESM-compatible __dirname
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-eval': 'error',
      'no-fallthrough': 'warn',
      'no-new-wrappers': 'warn',
      'no-throw-literal': 'warn',
      'no-undef-init': 'warn',
      'no-underscore-dangle': 'off',
      'no-var': 'warn',
      'prefer-const': 'warn',
      'arrow-body-style': ['warn', 'as-needed'],
      'constructor-super': 'error',
      eqeqeq: ['warn', 'smart'],
      'guard-for-in': 'warn',
      'no-bitwise': 'warn',
      'no-caller': 'warn',
      radix: 'warn',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'warn',
        { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true },
      ],
      'no-unused-expressions': 'off',
    },
  },
  {
    files: ['src/**/*.spec.ts', 'src/app/testing/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.jasmine,
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  {
    files: ['src/**/*.html'],
    languageOptions: {
      parser: angularEslintTemplateParser,
    },
    plugins: {
      '@angular-eslint': angularEslintPlugin,
    },
    rules: {},
  },
  {
    files: ['*.js', '*.cjs', 'src/**/*.js', 'src/**/*.cjs'],
    // Use 'not' pattern instead of excludedFiles
    ignores: ['src/babel-runtime-loader.js', 'src/babel-runtime-loader.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'no-undef': 'warn',
    },
  },
);
