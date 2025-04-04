const express = require('express');
const router = express.Router();
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const helmet = require('helmet');
const compression = require('compression');
const requestValidator = require('../middleware/requestValidator');

// Add correlation ID to each request for better logging and debugging
router.use((req, res, next) => {
  req.correlationId = uuidv4();
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
});

// Apply rate limiting to auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs for auth routes
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply security headers
router.use(helmet());

// Apply compression
router.use(compression());

// Import route modules
const adRoutes = require('../components/ads/ad.routes');
const authRoutes = require('../components/auth/auth.routes');
const chatRoutes = require('../components/chat/chat.routes');
const userRoutes = require('../components/users/user.routes');
const paymentRoutes = require('../routes/payment.routes');
const travelRoutes = require('../routes/travel.routes');
const mediaRoutes = require('../routes/media.routes');
const verificationRoutes = require('../routes/verification.routes');
const reviewRoutes = require('../routes/review.routes');
const safetyRoutes = require('../routes/safety.routes');

// Apply specific middleware to routes
router.use('/auth', authLimiter, authRoutes);
router.use('/ads', adRoutes);
router.use('/chat', chatRoutes);
router.use('/users', userRoutes);
router.use('/payments', paymentRoutes);
router.use('/travel', travelRoutes);
router.use('/media', mediaRoutes);
router.use('/verification', verificationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/safety', safetyRoutes);

// API health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date(),
    version: process.env.API_VERSION || '1.0.0'
  });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API documentation',
    docs: {
      swagger: '/api-docs',
      postman: '/postman-collection'
    }
  });
});

module.exports = router;
