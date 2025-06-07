const mongoose = require('mongoose');

jest.setTimeout(60000); // Increase timeout to 60 seconds

beforeAll(async () => {
  // Mock mongoose connect and connection close to avoid real DB connection during tests
  jest.spyOn(mongoose, 'connect').mockImplementation(() => Promise.resolve());
  jest.spyOn(mongoose.connection, 'close').mockImplementation(() => Promise.resolve());
});

afterAll(async () => {
  await mongoose.connection.close();
});
