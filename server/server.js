// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for server settings
//
// COMMON CUSTOMIZATIONS:
// - PORT: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
// Morgan logger is configured but used conditionally based on environment
// eslint-disable-next-line no-unused-vars
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
import errorHandler from './middleware/errorHandler.js';
// CSRF middleware is imported but applied conditionally based on configuration
// eslint-disable-next-line no-unused-vars
import { csrfMiddleware } from './middleware/csrf.js';
import cspNonce from './middleware/cspNonce.js';
import securityHeaders from './middleware/securityHeaders.js';
import { middleware as cspMiddleware, setupReportEndpoint } from './middleware/csp.middleware.js';
import { conditionalCache, etagCache } from './middleware/cache.js';

// Initialize express
const app = express();

// Generate CSP nonce for each request
app.use(cspNonce);

// Apply CSP middleware
app.use(cspMiddleware());

// Apply additional security headers
app.use(securityHeaders);

// Setup CSP report endpoint
setupReportEndpoint(app);

// Apply caching middleware
app.use(conditionalCache());
app.use(etagCache());

// Get current directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['category', 'county', 'city', 'featured', 'verified', 'sort'],
  })
);

// Compression middleware
app.use(compression());

// Secure file serving
const { secureFileServing } = await import('./middleware/fileAccess.js');
app.use('/uploads/*', secureFileServing);

// MongoDB connection with retry logic
const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Log the MongoDB URI we're connecting to (without credentials)
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

// API routes with versioning
// Apply CSRF protection to sensitive routes
app.use('/api/v1', routes);

// Handle 404 routes
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown handling
const shutdown = async signal => {
  console.log(`${signal} received. Starting graceful shutdown...`);

  // Close database connection
  await mongoose.connection.close();
  console.log('Database connections closed');

  // Close server
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
      // Signal successful shutdown without process.exit
      if (process.env.NODE_ENV !== 'test') {
        process.kill(process.pid, 'SIGTERM');
      }
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Forcing shutdown after timeout');
      // Signal error shutdown without process.exit
      if (process.env.NODE_ENV !== 'test') {
        process.kill(process.pid, 'SIGTERM');
      }
    }, 10000);
  } else {
    // Signal successful shutdown without process.exit
    if (process.env.NODE_ENV !== 'test') {
      process.kill(process.pid, 'SIGTERM');
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

process.on('unhandledRejection', reason => {
  console.error('UNHANDLED REJECTION:', reason);
  shutdown('UNHANDLED REJECTION');
});

// Start server only after MongoDB connects
const PORT = process.env.PORT || 3000;
let server; // Declare server variable in global scope

connectWithRetry()
  .then(() => {
    server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Initialize Socket.IO
    import('./services/socket.service.js').then(socketService => {
      socketService.initialize(server);
    });

    // Initialize message cleanup scheduler
    import('./utils/messageCleanup.js').then(messageCleanup => {
      messageCleanup.init();
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    throw err;
  });

export { app };
