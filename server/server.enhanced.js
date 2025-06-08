/**
 * Enhanced simplified server for date-night-app
 * This server combines the best practices from our TypeScript server
 * but in a plain JavaScript implementation to avoid compilation issues.
 */
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

// Import compatibility helpers
import { wrapAsync, jsonResponse, errorResponse } from './src/utils/express-compatibility.js';

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
const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/date-night-app'
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Security middleware
app.use(helmet());

// CORS setup
const corsOptions = {
  origin:
    process.env.NODE_ENV === 'development'
      ? '*'
      : [process.env.FRONTEND_URL, 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan(loggerFormat));
}

// Add correlation ID to each request for tracing
app.use((req, res, next) => {
  req.correlationId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
});

// Rate limiting for API routes
app.use('/api', limiter);

// Serve static files (for admin panel or documentation)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Simple health check route
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint called');
  try {
    const mem = process.memoryUsage();
    res.status(200).json({
      status: 'success',
      uptime: process.uptime(),
      memory: {
        rss: Math.round(mem.rss / 1024 / 1024) + 'MB',
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024) + 'MB',
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + 'MB',
      },
      env: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    console.error('Error in health check endpoint:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Dummy API routes for testing
app.get(
  '/api/users',
  wrapAsync((req, res) => {
    jsonResponse(res, 200, {
      success: true,
      data: [
        { id: 1, name: 'Test User 1' },
        { id: 2, name: 'Test User 2' },
      ],
    });
  })
);

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[Error] ${req.correlationId || 'no-id'}: ${err.message}`);
  console.error(err.stack);

  errorResponse(
    res,
    err.statusCode || 500,
    err.message || 'Internal server error',
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
});

// 404 handler - keep this as the last middleware
app.use((req, res) => {
  errorResponse(res, 404, `Endpoint not found: ${req.originalUrl}`);
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
