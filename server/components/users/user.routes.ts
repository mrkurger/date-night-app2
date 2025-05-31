// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (user.routes)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import express from 'express';
const router = express.Router();
import userController from './user.controller.js';
import { protect } from '../../middleware/auth.js';
import { validatePasswordChange } from './users.validator.js';

// Protected routes (require authentication)
router.get('/me', protect, userController.getCurrentUser);
router.put('/me', protect, userController.updateUser);
router.put('/travel-plan', protect, userController.updateTravelPlan);
router.post('/change-password', protect, validatePasswordChange, userController.changePassword);

// Public routes
router.get('/:userId/status', userController.getUserStatus);

export default router;
