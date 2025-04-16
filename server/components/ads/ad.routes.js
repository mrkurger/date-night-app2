// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (ad.routes)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const express = require('express');
const router = express.Router();
const adController = require('./ad.controller');

// Routes for ad CRUD
router.get('/', adController.getAllAds);
router.get('/:adId', adController.getAdById);
router.post('/', adController.createAd);

// Swipe and category endpoints
router.get('/swipe', adController.getSwipeAds);
router.get('/categories', adController.getCategories);
router.get('/category/:category', adController.getAdsByCategory);
router.post('/swipes', adController.recordSwipe);

module.exports = router;
