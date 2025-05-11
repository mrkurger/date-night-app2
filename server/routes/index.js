// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for index settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import express from 'express';
const router = express.Router();
// These imports are available for future use when implementing additional features
// eslint-disable-next-line no-unused-vars
import cors from 'cors';
// eslint-disable-next-line no-unused-vars
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import helmet from 'helmet';
import compression from 'compression';
// eslint-disable-next-line no-unused-vars
import requestValidator from '../middleware/requestValidator.js';
import { csrfProtection, sendCsrfToken } from '../middleware/csrf.js';
// Cache middleware options for different endpoints
// eslint-disable-next-line no-unused-vars
import { staticCache, dynamicCache, noCache } from '../middleware/cache.js';

// Add correlation ID to each request for better logging and debugging
router.use((req, res, next) => {
  req.correlationId = uuidv4();
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
});

// Route error handler - especially for path-to-regexp errors
router.use((err, req, res, next) => {
  if (
    err &&
    (err.message.includes('path-to-regexp') || err.message.includes('Missing parameter name'))
  ) {
    console.warn(`[Route Error] ${err.message} for URL: ${req.originalUrl}`);
    return res.status(400).json({
      status: 'error',
      message: 'Invalid URL format',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
  next(err);
});

// Wrap route module registration in a try-catch to handle initialization errors
const safelyRegisterRoutes = (path, routeModule) => {
  try {
    router.use(path, routeModule);
  } catch (err) {
    console.error(`Failed to register route module at ${path}:`, err);
    // Still allow the server to start, just log the error
  }
};

// Apply security headers
router.use(helmet());

// Apply compression
router.use(compression());

// Import route modules
import adRoutes from '../components/ads/ad.routes.js';
import authRoutes from '../components/auth/auth.routes.js';
import chatRoutes from '../components/chat/chat.routes.js';
import userRoutes from '../components/users/user.routes.js';
import paymentRoutes from '../routes/payment.routes.js';
import walletRoutes from '../routes/wallet.routes.js';
import travelRoutes from '../routes/travel.routes.js';
import mediaRoutes from '../routes/media.routes.js';
import verificationRoutes from '../routes/verification.routes.js';
import reviewRoutes from '../routes/review.routes.js';
import safetyRoutes from '../routes/safety.routes.js';
import locationRoutes from '../routes/location.routes.js';
import favoriteRoutes from '../routes/favorite.routes.js';

// CSRF token endpoint
router.get('/csrf-token', csrfProtection, sendCsrfToken, (req, res) => {
  res.status(200).json({ success: true });
});

// Apply specific middleware to routes with granular rate limiting
safelyRegisterRoutes('/auth', authRoutes);
safelyRegisterRoutes('/ads', adRoutes);
safelyRegisterRoutes('/chat', chatRoutes);
safelyRegisterRoutes('/users', userRoutes);
safelyRegisterRoutes('/payments', paymentRoutes);
safelyRegisterRoutes('/wallet', walletRoutes);
safelyRegisterRoutes('/travel', travelRoutes);
safelyRegisterRoutes('/media', mediaRoutes);
safelyRegisterRoutes('/verification', verificationRoutes);
safelyRegisterRoutes('/reviews', reviewRoutes);
safelyRegisterRoutes('/safety', safetyRoutes);
safelyRegisterRoutes('/favorites', favoriteRoutes);
safelyRegisterRoutes('/locations', locationRoutes);

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

export default router;
