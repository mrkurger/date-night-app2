/**
 * Jest configuration for server tests (ES Module version)
 */
export default {
  // Use Node.js as the test environment
  testEnvironment: 'node',

  // Test patterns
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.spec.js'],

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
    '^.+\\.js$': ['babel-jest', { configFile: './babel.config.cjs' }],
  },

  // Module name mapping for imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // Verbose output for test results
  verbose: true,

  // Ensure proper handling of ES modules
  moduleFileExtensions: ['js', 'json', 'node'],

  // Required for proper ES modules support
  testRunner: 'jest-circus/runner',

  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(mongoose|@babel/runtime|@jest/globals|bcrypt|jsonwebtoken|supertest|stripe)/)',
  ],
};
