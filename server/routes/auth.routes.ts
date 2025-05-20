/**
 * Authentication routes
 */
import { Router } from 'express';
import { standardValidation } from '../validation';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/register', standardValidation.register, AuthController.register);
router.post('/login', standardValidation.login, AuthController.login);
router.post('/forgot-password', standardValidation.forgotPassword, AuthController.forgotPassword);
router.post('/reset-password', standardValidation.resetPassword, AuthController.resetPassword);

export default router;
