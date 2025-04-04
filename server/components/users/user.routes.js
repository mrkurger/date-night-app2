const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authenticateToken } = require('../../middleware/authenticateToken');

// Protected routes (require authentication)
router.get('/me', authenticateToken, userController.getCurrentUser);
router.put('/me', authenticateToken, userController.updateUser);
router.put('/travel-plan', authenticateToken, userController.updateTravelPlan);

// Public routes
router.get('/:userId/status', userController.getUserStatus);

module.exports = router;
