// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for verification.routes settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import express from 'express';
const router = express.Router();
import verificationController from '../controllers/verification.controller.js';
import { protect as authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roles.js';

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

export default router;
