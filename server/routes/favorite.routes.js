// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for favorite.routes settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const { authenticate } = require('../middleware/auth');

/**
 * Favorites routes
 * All routes require authentication
 */

// Get all favorites for the current user
router.get('/', authenticate, favoriteController.getFavorites);

// Get favorite ad IDs for the current user (for efficient checking on the client)
router.get('/ids', authenticate, favoriteController.getFavoriteIds);

// Check if an ad is favorited by the current user
router.get('/check/:adId', authenticate, favoriteController.checkFavorite);

// Add an ad to favorites
router.post('/:adId', authenticate, favoriteController.addFavorite);

// Remove an ad from favorites
router.delete('/:adId', authenticate, favoriteController.removeFavorite);

// Update favorite notes
router.patch('/:adId/notes', authenticate, favoriteController.updateFavoriteNotes);

// Toggle notifications for a favorite
router.patch('/:adId/notifications', authenticate, favoriteController.toggleNotifications);

module.exports = router;
