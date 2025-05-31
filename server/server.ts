// ===================================================
// Server Configuration and URL Processing
// ===================================================
// This file contains core server setup and URL handling logic
//
// Key components:
// - URL Preprocessing: Sanitizes and validates URLs
// - Path Pattern Handling: Manages path-to-regexp compatibility
// - Error Handling: Graceful handling of URL format issues
// - OpenAPI Integration: API documentation with Zod schemas
// ===================================================

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { xssProtection } from './middleware/xss-protection.js';
import hpp from 'hpp';
// import path from 'path'; // Unused
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import config from './config/environment.js';
import routes from './routes/index.js';
import { mongoSanitize } from './middleware/mongo-sanitize.js';
import client from 'prom-client';
import { patchExpressRoute } from './middleware/url-validator.js';
import { setupOpenAPI } from './src/openapi/setup.js';

const app = express();
let server; // eslint-disable-line no-unused-vars

// Apply the patch to express.Route for all subsequent route definitions
patchExpressRoute(express);

// collect default metrics
client.collectDefaultMetrics();

// health check endpoint
app.get('/health', async (_req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: mem,
  });
});

// Security middlewares
app.use(helmet());
app.use(cors(config.corsOptions));
app.use(xssProtection);
app.use(hpp());
app.use(mongoSanitize);

// General middlewares
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes',
});
app.use('/api', limiter);

// Setup OpenAPI documentation
setupOpenAPI(app);

// Routes
app.use('/api/v1', routes);

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await mongoose.connect(config.db.uri);
    console.log('Connected to MongoDB');

    server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

startServer();
