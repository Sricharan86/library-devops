const request = require('supertest');
const app = require('../src/app');

test('GET /health returns ok', async () => {
  const response = await request(app).get('/health');
  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual({ status: 'ok' });
});
