/**
 * Fully featured server for date-night-app
 * Includes all middleware and TypeScript-compatible validation features
 */

// Apply path-to-regexp patch first to avoid URL parsing issues with colons
import './middleware/path-to-regexp-patch.js';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// Import middleware
import { protect } from './middleware/auth.js';
import { xssProtection } from './middleware/xss-protection.js';
import { mongoSanitize } from './middleware/mongo-sanitize.js';
import { AppError, errorHandler } from './middleware/error-handler.js';
import { createRouter } from './middleware/safe-router.js';

// Import compatibility helpers
import { wrapAsync, jsonResponse, errorResponse } from './src/utils/express-compatibility.js';

// Import routes
import authRoutes from './components/auth/auth.routes.js';
import userRoutes from './components/users/user.routes.js';
import adRoutes from './components/ads/ad.routes.js';
import chatRoutes from './components/chat/chat.routes.js';
import mainRoutes from './routes/index.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Convert to ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure logging
const loggerFormat = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/date-night-app')
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Set security HTTP headers
app.use(helmet());

// CORS setup
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  max: 100, // limit each IP to 100 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes!',
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xssProtection());

// Response compression
app.use(compression());

// Request logging
app.use(morgan(loggerFormat));

// Prepare the main router with sanitization middleware
const mainRouter = createRouter();

// Route debugging middleware
app.use((req, res, next) => {
  const rawUrl = req.originalUrl;

  // Safely decode URL to prevent errors
  let decodedUrl;
  try {
    decodedUrl = decodeURIComponent(rawUrl);
  } catch (_) {
    decodedUrl = rawUrl; // Use raw URL if decoding fails
    console.warn(`[Route Warning] Failed to decode URL: ${rawUrl}`);
  }

  if (process.env.NODE_ENV === 'development') {
    console.debug(`[Route Debug] Processing URL: ${decodedUrl}`);
  }

  // Add request ID
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);

  next();
});

// Register routes
mainRouter.use('/api/auth', authRoutes);
mainRouter.use('/api/users', userRoutes);
mainRouter.use('/api/ads', adRoutes);
mainRouter.use('/api/chat', chatRoutes);
app.use('/', mainRoutes);

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is up and running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'unknown',
  });
});

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

// Start server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', err => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err);

  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

export default app;
