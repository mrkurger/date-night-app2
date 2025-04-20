// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (user.routes)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { protect } = require('../../middleware/auth');
const { newPasswordValidation } = require('../../middleware/validator');

// Protected routes (require authentication)
router.get('/me', protect, userController.getCurrentUser);
router.put('/me', protect, userController.updateUser);
router.put('/travel-plan', protect, userController.updateTravelPlan);
router.post('/change-password', protect, newPasswordValidation, userController.changePassword);

// Public routes
router.get('/:userId/status', userController.getUserStatus);

module.exports = router;
