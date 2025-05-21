import path from 'path';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import OpenAPIDocument from './index.js';

export function setupOpenAPI(app: express.Application) {
  // Serve OpenAPI documentation
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(OpenAPIDocument);
  });

  // Serve Swagger UI
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(OpenAPIDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'DateNight.io API Documentation',
    })
  );
}
