import request from 'supertest';
import express from 'express';
import mobileRoutes from '../../routes/mobile.routes.js';

const app = express();
app.use(express.json());
app.use('/api/v1/mobile', mobileRoutes);

describe('Mobile Routes', () => {
  describe('GET /api/v1/mobile/analytics', () => {
    it('should return mobile analytics data', async () => {
      const response = await request(app)
        .get('/api/v1/mobile/analytics')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/v1/mobile/pwa-status', () => {
    it('should return PWA status', async () => {
      const response = await request(app)
        .get('/api/v1/mobile/pwa-status')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /api/v1/mobile/validate-responsive', () => {
    it('should validate responsive design', async () => {
      const response = await request(app)
        .post('/api/v1/mobile/validate-responsive')
        .send({ url: 'http://localhost:3000' })
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should require URL parameter', async () => {
      const response = await request(app)
        .post('/api/v1/mobile/validate-responsive')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'URL is required for responsive validation');
    });
  });

  describe('GET /api/v1/mobile/device-capabilities', () => {
    it('should return device capabilities', async () => {
      const response = await request(app)
        .get('/api/v1/mobile/device-capabilities')
        .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
    });
  });
});