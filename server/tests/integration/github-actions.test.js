import request from 'supertest';
import express from 'express';
import githubActionsRoutes from '../../routes/github-actions.routes.js';

const app = express();
app.use(express.json());
app.use('/api/v1/github-actions', githubActionsRoutes);

describe('GitHub Actions Routes', () => {
  describe('GET /api/v1/github-actions/status', () => {
    it('should return workflow status', async () => {
      const response = await request(app)
        .get('/api/v1/github-actions/status')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/v1/github-actions/runs', () => {
    it('should return recent workflow runs', async () => {
      const response = await request(app)
        .get('/api/v1/github-actions/runs')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/v1/github-actions/deployments', () => {
    it('should return deployment status', async () => {
      const response = await request(app)
        .get('/api/v1/github-actions/deployments')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});