const mongoose = require('mongoose');

jest.setTimeout(60000); // Increase timeout to 60 seconds

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MongoDB connection string is not defined in environment variables');
  }
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}, 60000);

afterAll(async () => {
  await mongoose.connection.close();
}, 60000);
