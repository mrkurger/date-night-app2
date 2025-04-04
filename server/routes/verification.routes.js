const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verification.controller');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');

// Get verification status for current user
router.get('/status', authenticate, verificationController.getVerificationStatus);

// Submit identity verification
router.post('/identity', authenticate, verificationController.submitIdentityVerification);

// Submit photo verification
router.post('/photo', authenticate, verificationController.submitPhotoVerification);

// Submit phone verification
router.post('/phone', authenticate, verificationController.submitPhoneVerification);

// Verify phone with code
router.post('/phone/verify', authenticate, verificationController.verifyPhoneWithCode);

// Submit email verification
router.post('/email', authenticate, verificationController.submitEmailVerification);

// Verify email with code
router.post('/email/verify', authenticate, verificationController.verifyEmailWithCode);

// Submit address verification
router.post('/address', authenticate, verificationController.submitAddressVerification);

// Get verification status for a specific user (public)
router.get('/user/:userId', verificationController.getUserVerificationStatus);

// Admin routes
router.get('/admin/pending', authenticate, isAdmin, verificationController.getPendingVerifications);
router.post('/admin/approve', authenticate, isAdmin, verificationController.approveVerification);
router.post('/admin/reject', authenticate, isAdmin, verificationController.rejectVerification);

module.exports = router;