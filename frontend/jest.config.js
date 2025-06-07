module.exports = {
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(axios)/)", // transform axios, but ignore other node_modules
  ],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"], // if you have setupTests.js
};
