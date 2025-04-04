const express = require('express');
const router = express.Router();

// TODO: Add comprehensive middleware stack:
// - Request logging with correlation IDs
// - Performance monitoring with prometheus
// - API versioning with accept headers
// - Rate limiting per user/IP
// - Request validation with Joi
// - Error handling with proper codes
// - Security headers
// - Compression
// - [New] TODO: Integrate a centralized error-handling middleware to capture errors from all routes

const adRoutes = require('../components/ads/ad.routes');
const authRoutes = require('../components/auth/auth.routes');
const chatRoutes = require('../components/chat/chat.routes');
const userRoutes = require('../components/users/user.routes');

router.use('/ads', adRoutes);
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/users', userRoutes);

module.exports = router;
