// ESLint configuration for Angular application
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import angularTemplateAccessibility from '@angular-eslint/eslint-plugin-template/configs/accessibility';
import angularTemplateRecommended from '@angular-eslint/eslint-plugin-template/configs/recommended';
import angularTemplateParser from '@angular-eslint/template-parser';
import globals from 'globals';
import sonarjs from 'eslint-plugin-sonarjs';
import jsdoc from 'eslint-plugin-jsdoc';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import rxjs from 'eslint-plugin-rxjs';

export default [
  js.configs.recommended,
  // Base configuration for all files
  {
    files: ['src/**/*'],
    ignores: [
      '**/node_modules/**',
      'src/dist/**',
      'src/coverage/**',
      'src/e2e/**',
      'src/test.ts',
      'karma.conf.js',
      'tailwind.config.js',
    ],
  },
  // TypeScript configuration
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
        tsconfigRootDir: '.',
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.jasmine,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      '@angular-eslint': angular,
      sonarjs: sonarjs,
      jsdoc: jsdoc,
      import: importPlugin,
      prettier: prettier,
      rxjs: rxjs,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',

      // Import rules
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-unresolved': 'error',

      // Documentation rules
      'jsdoc/require-description': 'warn',
      'jsdoc/require-jsdoc': [
        'warn',
        {
          publicOnly: true,
          require: {
            ArrowFunctionExpression: false,
            ClassDeclaration: true,
            ClassExpression: true,
            FunctionDeclaration: true,
            MethodDefinition: true,
          },
        },
      ],

      // Code quality rules
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 4 }],

      // Base rules
      'no-unused-vars': 'off', // TypeScript handles this
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Additional TypeScript rules
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/consistent-type-assertions': 'warn',
      '@typescript-eslint/member-ordering': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',

      // Angular rules
      ...angular.configs.recommended.rules,
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],

      // RxJS rules
      ...rxjs.configs.recommended.rules,
      'rxjs/finnish': [
        'error',
        {
          functions: false,
          methods: false,
          parameters: true,
          properties: true,
          variables: true,
        },
      ],
    },
  },
  // HTML Template configuration
  {
    files: ['src/**/*.component.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/eqeqeq': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/use-track-by-function': 'warn',
      // Accessibility rules
      '@angular-eslint/template/click-events-have-key-events': 'error',
      '@angular-eslint/template/mouse-events-have-key-events': 'error',
      '@angular-eslint/template/no-autofocus': 'error',
      '@angular-eslint/template/no-positive-tabindex': 'error',
      '@angular-eslint/template/alt-text': 'error',
      // Best practices
      '@angular-eslint/template/no-any': 'warn',
      '@angular-eslint/template/no-inline-styles': 'warn',
      '@angular-eslint/template/conditional-complexity': ['error', { maxComplexity: 4 }],
    },
  },
  
  // Incorporate accessibility recommendations
  {
    files: ['src/**/*.component.html'],
    rules: angularTemplateAccessibility.rules,
  },
  // Configuration for test files
  {
    files: ['src/**/*.spec.ts', 'src/**/*.test.ts', 'src/**/testing/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-console': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'jsdoc/require-jsdoc': 'off',
    },
  },
  // Configuration for interceptors
  {
    files: ['src/**/interceptors/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
