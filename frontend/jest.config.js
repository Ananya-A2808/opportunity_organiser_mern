module.exports = {
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    // Update this pattern to include all modules that need to be transformed
    'node_modules/(?!axios|@mui|@babel/runtime)',
  ],
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testEnvironment: 'jsdom', // Important for frontend React testing
};