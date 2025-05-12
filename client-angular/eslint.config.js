import eslint from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

// Convert ESM __dirname
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// Create a compatibility instance
const compat = new FlatCompat({
  baseDirectory: _dirname,
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
      'cypress/**',
      '**/*.html',
      'src/jasmine.d.ts',
      'src/app/testing/custom-matchers.ts',
      'src/app/components/login/login.component.spec.ts',
      'src/app/features/admin/admin.module.ts',
      'src/app/features/admin/content-moderation/moderation-modal/moderation-modal.component.spec.ts',
      'src/app/features/chat/chat-room/chat-room.component.ts',
      'src/app/features/chat/chat.component.ts',
      'src/app/shared/components/button/button.component.ts',
      'src/app/shared/components/card/card.component.ts',
      'src/app/shared/components/icon/icon.component.ts',
      'src/app/shared/emerald/components/card-grid/card-grid.component.ts',
    ],
  },
  // Configuration for CommonJS files like karma.conf.js
  {
    files: ['*.js', '*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      ecmaVersion: 2020,
      globals: {
        module: 'writable',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'no-undef': 'off', // Turn off no-undef for JS files
    },
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
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'warn',
        { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true },
      ],
      'prettier/prettier': 'warn',
      // Turn off duplicate rules that conflict with TypeScript-specific versions
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn', // Downgrade from error to warning

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
