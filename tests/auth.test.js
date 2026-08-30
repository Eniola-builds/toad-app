const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication & Access Control', () => {
  it('should redirect unauthenticated users away from /tasks', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(302);
    expect(res.header.location).toBe('/login');
  });

  it('should render login page successfully', async () => {
    const res = await request(app).get('/login');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Login');
  });
});
