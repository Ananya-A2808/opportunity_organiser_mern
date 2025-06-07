module.exports = {
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    // Ignore node_modules except axios
    'node_modules/(?!(axios)/)',
  ],
  moduleNameMapper: {
    '^axios$': 'axios/dist/node/axios.cjs.js', // <-- force CJS axios
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
};
