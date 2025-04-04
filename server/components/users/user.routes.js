const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { protect } = require('../../middleware/auth');

// Protected routes (require authentication)
router.get('/me', protect, userController.getCurrentUser);
router.put('/me', protect, userController.updateUser);
router.put('/travel-plan', protect, userController.updateTravelPlan);

// Public routes
router.get('/:userId/status', userController.getUserStatus);

module.exports = router;
