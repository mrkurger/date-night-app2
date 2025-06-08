import request from 'supertest';
import express from 'express';
import devToolsRoutes from '../../routes/dev-tools.routes.js';

const app = express();
app.use(express.json());
app.use('/api/v1/dev-tools', devToolsRoutes);

describe('DevTools Routes', () => {
  describe('GET /api/v1/dev-tools/health', () => {
    it('should return system health status', async () => {
      const response = await request(app)
        .get('/api/v1/dev-tools/health')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/v1/dev-tools/build-status', () => {
    it('should return build status', async () => {
      const response = await request(app)
        .get('/api/v1/dev-tools/build-status')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/v1/dev-tools/dependencies', () => {
    it('should return dependency analysis', async () => {
      const response = await request(app)
        .get('/api/v1/dev-tools/dependencies')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/v1/dev-tools/performance', () => {
    it('should return performance metrics', async () => {
      const response = await request(app)
        .get('/api/v1/dev-tools/performance')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /api/v1/dev-tools/build', () => {
    it('should trigger build process', async () => {
      const response = await request(app)
        .post('/api/v1/dev-tools/build')
        .send({ target: 'client', clean: false })
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message', 'Build process initiated');
    });
  });

  describe('POST /api/v1/dev-tools/task', () => {
    it('should run development task', async () => {
      const response = await request(app)
        .post('/api/v1/dev-tools/task')
        .send({ taskName: 'lint', parameters: {} })
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
    });

    it('should require task name', async () => {
      const response = await request(app)
        .post('/api/v1/dev-tools/task')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Task name is required');
    });
  });
});