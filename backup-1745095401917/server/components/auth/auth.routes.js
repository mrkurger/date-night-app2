// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (auth.routes)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('./auth.controller');
const { protect } = require('../../middleware/auth');
const { registrationLimiter, passwordResetLimiter } = require('../../middleware/rateLimiter');

// Local authentication with rate limiting
router.post('/register', registrationLimiter, authController.register);
router.post('/login', authController.login); // Already has authLimiter from index.js
router.post('/logout', protect, authController.logout);
router.post('/refresh-token', authController.refreshToken);

// Password reset endpoints with rate limiting
router.post('/forgot-password', passwordResetLimiter, (req, res) => {
  // Placeholder for future implementation
  res.status(501).json({ message: 'Not implemented yet' });
});
router.post('/reset-password', passwordResetLimiter, (req, res) => {
  // Placeholder for future implementation
  res.status(501).json({ message: 'Not implemented yet' });
});

// Validate token endpoint
router.get('/validate', protect, (req, res) => {
  res.json({
    success: true,
    user: {
      _id: req.user._id,
      username: req.user.username,
      role: req.user.role,
    },
  });
});

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  authController.githubCallback
);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  authController.googleCallback
);

// Reddit OAuth
router.get('/reddit', passport.authenticate('reddit'));
router.get(
  '/reddit/callback',
  passport.authenticate('reddit', { failureRedirect: '/login', session: false }),
  authController.redditCallback
);

// Apple OAuth
router.get('/apple', passport.authenticate('apple'));
router.get(
  '/apple/callback',
  passport.authenticate('apple', { failureRedirect: '/login', session: false }),
  authController.appleCallback
);

module.exports = router;
