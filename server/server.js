// ===================================================
// Server Configuration and URL Processing
// ===================================================
// This file contains core server setup and URL handling logic
//
// Key components:
// - URL Preprocessing: Sanitizes and validates URLs
// - Path Pattern Handling: Manages path-to-regexp compatibility
// - Error Handling: Graceful handling of URL format issues
// ===================================================

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
// Morgan logger is configured based on environment
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import config from './config/environment.js';
import routes from './routes/index.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger.js';
import { urlValidatorMiddleware } from './middleware/url-validator.js';

const app = express();
let server;

// Custom URL preprocessing and validation disabled for startup
app.use(helmet());
app.use(cors());
// URL validation middleware not applied

// Apply remaining middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(compression());
app.use(cookieParser());

// Configure Morgan logger based on environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again in 15 minutes',
});
app.use('/api', limiter);

// Create logs directory if it doesn't exist
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Setup request logging with winston
import('./utils/logger.js').then(({ requestLogger, logger }) => {
  // Use request logger middleware
  app.use(requestLogger);

  // Log application startup
  logger.info(`Application starting in ${process.env.NODE_ENV} mode`);
});

// Logger is initialized in the import above

// Security middleware
// Set security HTTP headers with improved CSP
// Allow unsafe-eval in development mode for Angular
const isDevelopment = process.env.NODE_ENV === 'development';
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Use nonce-based CSP and allow unsafe-eval in development
        scriptSrc: [
          "'self'",
          (req, res) => `'nonce-${res.locals.cspNonce}'`,
          ...(isDevelopment ? ["'unsafe-eval'", "'unsafe-inline'"] : []),
          'https://fonts.googleapis.com',
        ],
        styleSrc: [
          "'self'",
          (req, res) => `'nonce-${res.locals.cspNonce}'`,
          "'unsafe-inline'", // Angular needs this
          'https://fonts.googleapis.com',
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://*.googleapis.com'],
        connectSrc: [
          "'self'",
          'wss:',
          'ws:',
          'https://api.stripe.com',
          ...(isDevelopment ? ['http://localhost:*', 'ws://localhost:*'] : []),
        ],
        // Add additional security directives
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
      },
    },
    // Additional security headers
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    xssFilter: true,
    noSniff: true,
  })
);

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  })
);

// Secure file serving - using IIFE to handle top-level await
(async () => {
  const { secureFileServing } = await import('./middleware/fileAccess.js');
  app.use('/uploads/*', secureFileServing);
})();

// MongoDB connection with retry logic
const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Log the MongoDB URI we're connecting to (without credentials)
      console.log(`[DEBUG] process.env.MONGODB_URI: ${process.env.MONGODB_URI}`); // Added for debugging
      console.log(`[DEBUG] config.mongoUri before connect: ${config.mongoUri}`); // Added for debugging
      const sanitizedUri = config.mongoUri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
      console.log(`Connecting to MongoDB: ${sanitizedUri}`);

      // Connect with more robust options
      await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
      });

      console.log('MongoDB connected successfully');

      // Set up event listeners for connection issues
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
      });

      mongoose.connection.on('error', err => {
        console.error('MongoDB connection error:', err);
      });

      break;
    } catch (err) {
      console.error(`MongoDB connection attempt ${i + 1}/${retries} failed:`, err.message);

      if (i === retries - 1) {
        console.error('MongoDB connection failed after all retries. Error details:', err);
        throw new Error('MongoDB connection failed after all retries');
      }

      console.log(`Retrying connection in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Parse cookies for CSRF
app.use(cookieParser());

// Add route debugging middleware before registering routes
app.use((req, res, next) => {
  const rawUrl = req.originalUrl;
  const decodedUrl = decodeURIComponent(rawUrl);
  console.debug(`[Route Debug] Processing URL: ${decodedUrl}`);
  if (decodedUrl.includes('git.new') || decodedUrl.includes('https:')) {
    console.warn(`[Route Warning] Potentially problematic URL pattern detected: ${decodedUrl}`);
  }
  next();
});

// Safe URL validation: wraps urlValidatorMiddleware to catch errors
app.use((req, res, next) => {
  try {
    urlValidatorMiddleware(req, res, next);
  } catch (error) {
    console.warn('URL validation failed:', error.message || error);
    return res.status(400).json({
      status: 'error',
      message: 'Invalid URL format',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Serve Swagger documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  })
);

// Serve Swagger JSON
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpecs);
});

// API routes with versioning
// Apply CSRF protection to sensitive routes
app.use('/api/v1', routes);

// Graceful shutdown handling
const shutdown = async signal => {
  console.log(`${signal} received. Starting graceful shutdown...`);

  try {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connections closed');

    // Close server if it exists
    if (server) {
      await new Promise((resolve, reject) => {
        server.close(err => {
          if (err) {
            console.error('Error closing server:', err);
            reject(err);
          } else {
            console.log('HTTP server closed');
            resolve();
          }
        });

        // Force close after 10 seconds
        setTimeout(() => {
          console.warn('Forcing shutdown after timeout');
          if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
          }
        }, 10000).unref();
      });
    }

    // Clean exit
    if (process.env.NODE_ENV !== 'test') {
      process.exit(0);
    }
  } catch (err) {
    console.error('Error during shutdown:', err);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', error => {
  console.error('UNCAUGHT EXCEPTION:', error);
  shutdown('UNCAUGHT EXCEPTION');
});

// Start server after successful database connection
const startServer = async () => {
  try {
    await connectWithRetry();
    const PORT = process.env.PORT || 3000;
    server = app.listen(PORT, () => {
      // Assign to top-level server variable
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Handle server-specific errors
    server.on('error', error => {
      console.error('Server error:', error);
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          console.error(`Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // Initialize Socket.IO
    import('./services/socket.service.js').then(({ default: socketService }) => {
      socketService.initialize(server);
    });

    // Initialize message cleanup scheduler
    import('./utils/messageCleanup.js').then(module => {
      module.default.init();
    });

    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
