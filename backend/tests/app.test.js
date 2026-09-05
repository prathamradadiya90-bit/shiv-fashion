process.env.JWT_SECRET = 'test_secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test?schema=public';
process.env.RAZORPAY_KEY_ID = 'test_razorpay_key';
process.env.RAZORPAY_KEY_SECRET = 'test_razorpay_secret';
process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
process.env.CLOUDINARY_API_KEY = 'test_api_key';
process.env.CLOUDINARY_API_SECRET = 'test_api_secret';
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Use random port for testing if it starts a server

const request = require('supertest');
const app = require('../server');
const prisma = require('../config/db');

describe('App Server', () => {
  afterAll(async () => {
    // Close Prisma connection to avoid open handles
    await prisma.$disconnect();
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route-that-does-not-exist');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('Not Found');
  });
});
