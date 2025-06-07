const request = require('supertest');
const express = require('express');
const resumeRoutes = require('../routes/resume');
const mongoose = require('mongoose');
const wkhtmltopdf = require('wkhtmltopdf');
const stream = require('stream');

jest.mock('wkhtmltopdf');

const app = express();
app.use(express.json());
app.use('/api/resume', resumeRoutes);

// Mock mongoose model methods used in resume routes
const Resume = require('../models/Resume');

jest.mock('../models/Resume');

describe('Resume API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/resume/save should respond with 200', async () => {
    Resume.prototype.save = jest.fn().mockResolvedValue({});

    const response = await request(app)
      .post('/api/resume/save')
      .field('data', JSON.stringify({ email: 'test@example.com' }))
      .attach('profileImage', Buffer.from(''), 'test.png');
    expect(response.statusCode).toBe(200);
  });

  test('POST /api/resume/get_role_suggestions should respond with 200', async () => {
    // Mock any DB calls if needed here
    const response = await request(app)
      .post('/api/resume/get_role_suggestions')
      .send({ query: 'developer' });
    expect(response.statusCode).toBe(200);
  });

  test('POST /api/resume/get_skill_suggestions should respond with 200', async () => {
    // Mock any DB calls if needed here
    const response = await request(app)
      .post('/api/resume/get_skill_suggestions')
      .send({ query: 'javascript' });
    expect(response.statusCode).toBe(200);
  });

  test('GET /api/resume/download_pdf/:filename should respond with 200 or 404', async () => {
    const response = await request(app)
      .get('/api/resume/download_pdf/testfile.pdf');
    expect([200, 404]).toContain(response.statusCode);
  });

  test('GET /api/resume/download_presentation/:filename should respond with 200 or 404', async () => {
    const response = await request(app)
      .get('/api/resume/download_presentation/testfile.pptx');
    expect([200, 404]).toContain(response.statusCode);
  });

  test('POST /api/resume/download_pdf_wkhtmltopdf should respond with 200', async () => {
    wkhtmltopdf.mockImplementation((html, options, cb) => {
      if (typeof options === 'function') {
        cb = options;
      }
      const readable = new stream.Readable();
      readable._read = () => {};
      cb(null, readable);
    });

    const response = await request(app)
      .post('/api/resume/download_pdf_wkhtmltopdf')
      .send({ html: '<html></html>' });
    expect(response.statusCode).toBe(200);
  });

  test('POST /api/resume/preview should respond with 200', async () => {
    Resume.prototype.save = jest.fn().mockResolvedValue({});

    const response = await request(app)
      .post('/api/resume/preview')
      .field('data', JSON.stringify({ email: 'test@example.com' }))
      .attach('profileImage', Buffer.from(''), 'test.png');
    expect(response.statusCode).toBe(200);
  });

  test('POST /api/resume/download should respond with 200', async () => {
    const response = await request(app)
      .post('/api/resume/download')
      .send({ html: '<html></html>' });
    expect(response.statusCode).toBe(200);
  });

  test('GET /api/resume/get_resume/:email should respond with 200 or 404', async () => {
    Resume.findOne = jest.fn().mockResolvedValue(null);

    const response = await request(app)
      .get('/api/resume/get_resume/test@example.com');
    expect([200, 404]).toContain(response.statusCode);
  });
});
