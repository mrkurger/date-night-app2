const express = require('express');
const router = express.Router();
const adController = require('./ad.controller');

// Routes for ad CRUD
router.get('/', adController.getAllAds);
router.get('/:adId', adController.getAdById);
router.post('/', adController.createAd);
// ...additional routes such as update, delete, and category-specific endpoints...

module.exports = router;
