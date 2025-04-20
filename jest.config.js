// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains Jest configuration for testing
//
// COMMON CUSTOMIZATIONS:
// - TEST_MATCH_PATTERNS: Patterns for test file discovery
// - TEST_ENVIRONMENT: Environment settings for different test types
// - COVERAGE_THRESHOLDS: Minimum code coverage requirements
// ===================================================

export default {
  projects: [
    // Server-side tests
    {
      displayName: 'server-unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/server/tests/unit/**/*.test.js', '<rootDir>/server/**/*.test.js'],
      setupFilesAfterEnv: ['jest-extended/all'],
      collectCoverageFrom: [
        '<rootDir>/server/**/*.js',
        '!<rootDir>/server/tests/**',
        '!<rootDir>/server/scripts/**',
      ],
      coverageThreshold: {
        global: {
          statements: 70,
          branches: 60,
          functions: 70,
          lines: 70,
        },
      },
      // Handle ES modules
      transform: {
        '^.+\\.js$': 'babel-jest',
      },
      extensionsToTreatAsEsm: ['.js'],
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      // Use CommonJS for tests but allow importing ES modules
      transformIgnorePatterns: [],
    },
    {
      displayName: 'server-integration',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/server/tests/integration/**/*.test.js'],
      setupFilesAfterEnv: ['jest-extended/all'],
      // Handle ES modules
      transform: {
        '^.+\\.js$': 'babel-jest',
      },
      extensionsToTreatAsEsm: ['.js'],
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      // Use CommonJS for tests but allow importing ES modules
      transformIgnorePatterns: [],
      // Integration tests may take longer to run
    },
    {
      displayName: 'server-performance',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/server/tests/performance/**/*.test.js'],
      setupFilesAfterEnv: ['jest-extended/all'],
      // Handle ES modules
      transform: {
        '^.+\\.js$': 'babel-jest',
      },
      extensionsToTreatAsEsm: ['.js'],
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      // Use CommonJS for tests but allow importing ES modules
      transformIgnorePatterns: [],
      // Performance tests may take even longer to run
    },

    // Client-side tests (Angular tests are handled by Karma)
    {
      displayName: 'client-unit',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/client/src/**/*.test.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/client/src/$1',
      },
    },
  ],

  // Global settings
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './test-results',
        outputName: 'junit.xml',
      },
    ],
  ],

  // Verbose output for test results
  verbose: true,
};
