/**
 * Jest configuration for server tests
 * Configured to handle ES modules in the server codebase
 */
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for configuration settings (jest.config)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
module.exports = {
  // Tell Jest to treat .js files as ESM
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  extensionsToTreatAsEsm: ['.js'],

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

  // Transformers for handling ES modules
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // Verbose output for test results
  verbose: true,
};
