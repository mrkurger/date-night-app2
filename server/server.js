require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

// Initialize express
const app = express();

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

// Setup request logging
// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// Use morgan for logging
if (process.env.NODE_ENV === 'production') {
  // Log to file in production
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  // Log to console in development
  app.use(morgan('dev'));
}

// Security middleware
// Set security HTTP headers with configuration for Angular
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://*.googleapis.com"],
      connectSrc: ["'self'", "wss:", "ws:", "https://api.stripe.com"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

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
app.use(hpp({
  whitelist: [
    'category',
    'county',
    'city',
    'featured',
    'verified',
    'sort'
  ]
}));

// Compression middleware
app.use(compression());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection with retry logic
const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(config.mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('MongoDB connected successfully');
      break;
    } catch (err) {
      if (err.code === 'EADDRINUSE') {
        console.log('MongoDB address in use, attempting to recover...');
        try {
          // Close existing connections
          await mongoose.connection.close();
          // Wait for port to be released
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        } catch (closeErr) {
          console.error('Error closing connection:', closeErr);
        }
      }
      
      if (i === retries - 1) {
        console.error('MongoDB connection failed after retries:', err);
        process.exit(1);
      }
      
      console.log(`Retrying connection in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// API routes with versioning
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
const shutdown = async (signal) => {
  console.log(`${signal} received. Starting graceful shutdown...`);

  // Close database connection
  await mongoose.connection.close();
  console.log('Database connections closed');

  // Close server
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Forcing shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  shutdown('UNCAUGHT EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
  shutdown('UNHANDLED REJECTION');
});

// Start server only after MongoDB connects
const PORT = process.env.PORT || 3000;

connectWithRetry().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Initialize Socket.IO
  const socketService = require('./services/socket.service');
  socketService.initialize(server);

  // Initialize message cleanup scheduler
  const messageCleanup = require('./utils/messageCleanup');
  messageCleanup.init();
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = { app };
