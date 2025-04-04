module.exports = {
  projects: [
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/client/src/**/*.test.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/client/src/$1'
      }
    },
    {
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/server/**/*.test.js']
    }
  ]
};
