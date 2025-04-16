// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for index settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const express = require('express');
const router = express.Router();
// These imports are available for future use when implementing additional features
// eslint-disable-next-line no-unused-vars
const cors = require('cors');
// eslint-disable-next-line no-unused-vars
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const helmet = require('helmet');
const compression = require('compression');
// eslint-disable-next-line no-unused-vars
const requestValidator = require('../middleware/requestValidator');
const { csrfProtection, sendCsrfToken } = require('../middleware/csrf');
// Cache middleware options for different endpoints
// eslint-disable-next-line no-unused-vars
const { staticCache, dynamicCache, noCache } = require('../middleware/cache');

// Add correlation ID to each request for better logging and debugging
router.use((req, res, next) => {
  req.correlationId = uuidv4();
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
});

// Import rate limiters
const {
  authLimiter,
  // These rate limiters are imported for future use in specific routes
  // eslint-disable-next-line no-unused-vars
  registrationLimiter,
  chatLimiter,
  adCreationLimiter,
  mediaUploadLimiter,
  // eslint-disable-next-line no-unused-vars
  searchLimiter,
  profileUpdateLimiter,
} = require('../middleware/rateLimiter');

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
const walletRoutes = require('../routes/wallet.routes');
const travelRoutes = require('../routes/travel.routes');
const mediaRoutes = require('../routes/media.routes');
const verificationRoutes = require('../routes/verification.routes');
const reviewRoutes = require('../routes/review.routes');
const safetyRoutes = require('../routes/safety.routes');
const locationRoutes = require('../routes/location.routes');

// CSRF token endpoint
router.get('/csrf-token', csrfProtection, sendCsrfToken, (req, res) => {
  res.status(200).json({ success: true });
});

// Apply specific middleware to routes with granular rate limiting
router.use('/auth', authLimiter, csrfProtection, authRoutes);

// Apply CSRF protection and rate limiting to sensitive routes
router.use('/ads', csrfProtection, adCreationLimiter, adRoutes);
router.use('/chat', csrfProtection, chatLimiter, chatRoutes);
router.use('/users', csrfProtection, profileUpdateLimiter, userRoutes);
router.use('/payments', csrfProtection, authLimiter, paymentRoutes);
router.use('/wallet', csrfProtection, authLimiter, walletRoutes);
router.use('/travel', csrfProtection, profileUpdateLimiter, travelRoutes);
router.use('/media', csrfProtection, mediaUploadLimiter, mediaRoutes);
router.use('/verification', csrfProtection, authLimiter, verificationRoutes);
router.use('/reviews', csrfProtection, profileUpdateLimiter, reviewRoutes);
router.use('/safety', csrfProtection, authLimiter, safetyRoutes);
router.use('/locations', locationRoutes); // No CSRF for public location data

// API health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date(),
    version: process.env.API_VERSION || '1.0.0',
  });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API documentation',
    docs: {
      swagger: '/api-docs',
      postman: '/postman-collection',
    },
  });
});

module.exports = router;
