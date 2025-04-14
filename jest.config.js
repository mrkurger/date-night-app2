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

module.exports = {
  projects: [
    // Server-side tests
    {
      displayName: 'server-unit',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/server/tests/unit/**/*.test.js',
        '<rootDir>/server/**/*.test.js'
      ],
      setupFilesAfterEnv: ['jest-extended/all'],
      collectCoverageFrom: [
        '<rootDir>/server/**/*.js',
        '!<rootDir>/server/tests/**',
        '!<rootDir>/server/scripts/**'
      ],
      coverageThreshold: {
        global: {
          statements: 70,
          branches: 60,
          functions: 70,
          lines: 70
        }
      }
    },
    {
      displayName: 'server-integration',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/server/tests/integration/**/*.test.js'],
      setupFilesAfterEnv: ['jest-extended/all'],
      testTimeout: 30000 // Longer timeout for integration tests
    },
    {
      displayName: 'server-performance',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/server/tests/performance/**/*.test.js'],
      setupFilesAfterEnv: ['jest-extended/all'],
      testTimeout: 60000 // Even longer timeout for performance tests
    },
    
    // Client-side tests (Angular tests are handled by Karma)
    {
      displayName: 'client-unit',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/client/src/**/*.test.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/client/src/$1'
      }
    }
  ],
  
  // Global settings
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results',
      outputName: 'junit.xml'
    }]
  ],
  
  // Verbose output for test results
  verbose: true
};
