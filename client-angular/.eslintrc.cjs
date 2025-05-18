module.exports = {
  root: true,
  overrides: [
    {
      files: ['run-single-test.js'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],
      },
    },
    {
      files: ['scripts/*.cjs'],
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        'no-undef': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      files: ['src/assets/js/*.js', 'src/ngsw-worker.js'],
      env: {
        browser: true,
      },
      rules: {
        'no-undef': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      files: ['src/app/core/utils/test-runner.js'],
      env: {
        browser: true,
        node: true,
      },
      rules: {
        'no-undef': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};
