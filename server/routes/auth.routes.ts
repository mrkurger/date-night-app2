/**
 * Authentication routes
 */
import { Router } from 'express';
import { standardValidation } from '../middleware/validator.js';
import { AuthController } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', standardValidation.register, AuthController.register);
router.post('/login', standardValidation.login, AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/forgot-password', standardValidation.forgotPassword, AuthController.forgotPassword);
router.post('/reset-password', standardValidation.resetPassword, AuthController.resetPassword);
router.post('/verify-email', AuthController.verifyEmail);

// Protected routes
router.get('/profile', protect, AuthController.getProfile);

export default router;
