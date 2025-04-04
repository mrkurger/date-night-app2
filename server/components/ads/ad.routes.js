const express = require('express');
const router = express.Router();
const adController = require('./ad.controller');
const { authenticateToken } = require('../../middleware/authenticateToken');

// Public routes
router.get('/', adController.getAllAds);
router.get('/:id', adController.getAdById);
router.get('/search/nearby', adController.searchNearby);

// Protected routes
router.post('/', authenticateToken, adController.createAd);
router.put('/:id', authenticateToken, adController.updateAd);
router.delete('/:id', authenticateToken, adController.deleteAd);

module.exports = router;
