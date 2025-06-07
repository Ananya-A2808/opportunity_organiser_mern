require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const promClient = require('prom-client');

const authRoutes = require('./routes/auth');
const emailRoutes = require('./routes/email');
const resumeRoutes = require('./routes/resume');

const app = express();
const PORT = process.env.PORT || 5000;

// Prometheus metrics setup
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    const metrics = await promClient.register.metrics();
    res.end(metrics);
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static folder for uploads and generated files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/generated', express.static(path.join(__dirname, 'generated')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/resume', resumeRoutes);

// MongoDB connection
const mongoUri = process.env.MONGO_URI || '';

// Modify the connection string to specify the "devops" database if not already specified
let mongoUriWithDb = mongoUri;
if (mongoUri && !mongoUri.includes('/devops')) {
  const parts = mongoUri.split('?');
  mongoUriWithDb = parts[0].endsWith('/') ? parts[0] + 'devops' : parts[0] + '/devops';
  if (parts[1]) {
    mongoUriWithDb += '?' + parts[1];
  }
}

mongoose.connect(mongoUriWithDb, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected to database devops');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});
