// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (auth.routes)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import express from 'express';
const router = express.Router();
import passport from 'passport';
import authController from './auth.controller.js';
import { formatServerUrl } from '../../utils/urlHelpers.js';
import { protect } from '../../middleware/auth.js';
import { registrationLimiter, passwordResetLimiter } from '../../middleware/rateLimiter.js';
import {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword,
} from '../../middleware/validators/auth.validator.js';

// Local authentication with validation and rate limiting
router.post('/register', registrationLimiter, validateRegister, authController.register);
router.post('/login', validateLogin, authController.login); // Already has authLimiter from index.js
router.post('/logout', protect, authController.logout);
router.post('/refresh-token', validateRefreshToken, authController.refreshToken);

// Password reset endpoints with validation and rate limiting
router.post(
  '/forgot-password',
  passwordResetLimiter,
  validateForgotPassword,
  authController.forgotPassword
);
router.post(
  '/reset-password',
  passwordResetLimiter,
  validateResetPassword,
  authController.resetPassword
);

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
  passport.authenticate('github', {
    failureRedirect: formatServerUrl(process.env.CLIENT_URL, 'http://localhost:4200') + '/login',
    session: false,
  }),
  authController.githubCallback
);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: formatServerUrl(process.env.CLIENT_URL, 'http://localhost:4200') + '/login',
    session: false,
  }),
  authController.googleCallback
);

// Reddit OAuth
router.get('/reddit', passport.authenticate('reddit'));
router.get(
  '/reddit/callback',
  passport.authenticate('reddit', {
    failureRedirect: formatServerUrl(process.env.CLIENT_URL, 'http://localhost:4200') + '/login',
    session: false,
  }),
  authController.redditCallback
);

// Apple OAuth
router.get('/apple', passport.authenticate('apple'));
router.get(
  '/apple/callback',
  passport.authenticate('apple', {
    failureRedirect: formatServerUrl(process.env.CLIENT_URL, 'http://localhost:4200') + '/login',
    session: false,
  }),
  authController.appleCallback
);

export default router;
