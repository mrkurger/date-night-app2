const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authenticateToken } = require('../../middleware/authenticateToken');

// All routes require authentication
router.use(authenticateToken);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Travel plan routes (for advertisers)
router.put('/travel-plan', userController.updateTravelPlan);

module.exports = router;
