/**
 * Jest configuration for server tests (CommonJS version)
 */
module.exports = {
  // Use Node.js as the test environment
  testEnvironment: 'node',

  // Test patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.test.cjs',
    '**/tests/**/*.test.mjs',
    '**/tests/**/*.spec.js',
  ],

  // Setup files
  setupFilesAfterEnv: ['jest-extended/all'],

  // Coverage collection
  collectCoverageFrom: ['**/*.js', '!**/node_modules/**', '!**/tests/**', '!**/scripts/**'],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },

  // Use babel-jest for transforming
  transform: {
    '^.+\\.(js|mjs)$': ['babel-jest', { configFile: './babel.config.js' }],
  },

  // Module name mapping for imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Set NODE_ENV to test
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },

  // Verbose output for test results
  verbose: true,

  // Ensure proper handling of ES modules
  moduleFileExtensions: ['js', 'json', 'node', 'mjs'],

  // Required for proper ES modules support
  testRunner: 'jest-circus/runner',

  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(mongoose|@babel/runtime|@jest/globals|bcrypt|jsonwebtoken|supertest|stripe|jest-extended|mongodb-memory-server|new-find-package-json|node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill)/)',
  ],

  // No need to specify .js as ESM since package.json has "type": "module",
};
