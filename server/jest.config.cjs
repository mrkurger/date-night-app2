/**
 * Jest configuration for server tests
 * This file uses .cjs extension to ensure it's treated as CommonJS
 */
module.exports = {
  // Use Node.js as the test environment
  testEnvironment: 'node',

  // Test patterns
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.js',
    '<rootDir>/tests/integration/**/*.test.js',
    '<rootDir>/**/*.test.js',
  ],

  // Setup files
  setupFilesAfterEnv: ['jest-extended/all'],

  // Coverage collection
  collectCoverageFrom: ['<rootDir>/**/*.js', '!<rootDir>/tests/**', '!<rootDir>/scripts/**'],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },

  // Use babel-jest for transforming
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './babel.config.cjs' }],
  },

  // Module name mapping for imports
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // Don't ignore any transformations
  transformIgnorePatterns: [],

  // Verbose output for test results
  verbose: true,
};
