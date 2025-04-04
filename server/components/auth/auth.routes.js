const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('./auth.controller');
const { authenticateToken } = require('../../middleware/authenticateToken');

// Local authentication
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authenticateToken, authController.logout);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  authController.githubCallback
);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  authController.googleCallback
);

// Reddit OAuth
router.get('/reddit', passport.authenticate('reddit'));
router.get('/reddit/callback',
  passport.authenticate('reddit', { failureRedirect: '/login', session: false }),
  authController.redditCallback
);

// Apple OAuth
router.get('/apple', passport.authenticate('apple'));
router.get('/apple/callback',
  passport.authenticate('apple', { failureRedirect: '/login', session: false }),
  authController.appleCallback
);

module.exports = router;
