import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/default-esm',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Only run TypeScript test files from the tests directory, exclude compiled JavaScript files
  testMatch: ['<rootDir>/tests/**/*.test.ts', '<rootDir>/tests/**/*.spec.ts'],
  // Explicitly ignore the dist directory and compiled files
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
    '**/*.js',
    '**/*.d.ts',
  ],
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  setupFilesAfterEnv: ['jest-extended/all'],
  // Transform ESM modules that Jest can't handle
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill|mongodb-memory-server|mongodb-memory-server-core|find-cache-dir|locate-path|find-up|pkg-dir|new-find-package-json|@mongodb-js)/)',
  ],
  // Add globals for MongoDB Memory Server compatibility
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    'middleware/**/*.{js,ts}',
    'models/**/*.{js,ts}',
    'routes/**/*.{js,ts}',
    'services/**/*.{js,ts}',
    'utils/**/*.{js,ts}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/*.d.ts',
  ],
};
