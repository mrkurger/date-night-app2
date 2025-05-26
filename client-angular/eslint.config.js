// ESLint configuration for Angular application
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import parser from '@angular-eslint/template-parser';
import globals from 'globals';
import sonarjs from 'eslint-plugin-sonarjs';
import jsdoc from 'eslint-plugin-jsdoc';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';

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
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      '@angular-eslint': angular,
      sonarjs: sonarjs,
      jsdoc: jsdoc,
      import: importPlugin,
      prettier: prettier,
    },
    rules: {
      // TypeScript Rules
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/consistent-type-assertions': 'warn',
      '@typescript-eslint/member-ordering': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
          prefix: ['E'],
        },
        {
          selector: 'class',
          format: ['PascalCase'],
        },
      ],

      // Angular Rules
      '@angular-eslint/component-class-suffix': 'error',
      '@angular-eslint/directive-class-suffix': 'error',
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],

      // Import Rules
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'error',
      'import/no-cycle': 'error',
      'import/first': 'error',
      'import/no-mutable-exports': 'error',

      // SonarJS Rules
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/prefer-immediate-return': 'warn',
      'sonarjs/no-small-switch': 'warn',

      // JSDoc Rules
      'jsdoc/require-jsdoc': [
        'warn',
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
          },
          contexts: [
            'TSInterfaceDeclaration',
            'TSTypeAliasDeclaration',
            'TSEnumDeclaration',
            'TSPropertySignature',
          ],
        },
      ],
      'jsdoc/require-description': 'warn',
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-returns-description': 'warn',

      // Prettier Integration
      'prettier/prettier': 'warn',
    },
  },

  // Template files configuration - currently disabled to focus on TypeScript linting
  // {
  //   files: ['src/**/*.component.html'],
  //   plugins: {
  //     '@angular-eslint/template': angularTemplate,
  //   },
  //   languageOptions: {
  //     parser: '@angular-eslint/template-parser',
  //     parserOptions: {
  //       project: './tsconfig.json',
  //     },
  //   },
  //   rules: {},
  // },
];
