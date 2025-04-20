// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for favorite.routes settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import express from 'express';
const router = express.Router();
import favoriteController from '../controllers/favorite.controller';
import { authenticate } from '../middleware/auth';

/**
 * Favorites routes
 * All routes require authentication
 */

// Get all favorites for the current user
// Supports query parameters for filtering and sorting:
// - sort: newest, oldest, price-asc, price-desc, title-asc, title-desc, priority-high, priority-low
// - category: filter by ad category
// - county: filter by county
// - city: filter by city
// - search: search in title, description, and notes
// - priority: filter by priority level (low, normal, high)
// - priceMin: filter by minimum price
// - priceMax: filter by maximum price
// - dateFrom: filter by date added (from)
// - dateTo: filter by date added (to)
// - tags: filter by tags (can be specified multiple times for AND filtering)
router.get('/', authenticate, favoriteController.getFavorites);

// Get favorite ad IDs for the current user (for efficient checking on the client)
router.get('/ids', authenticate, favoriteController.getFavoriteIds);

// Get all tags used by the current user
router.get('/tags', authenticate, favoriteController.getUserTags);

// Check if an ad is favorited by the current user
router.get('/check/:adId', authenticate, favoriteController.checkFavorite);

// Add an ad to favorites
router.post('/:adId', authenticate, favoriteController.addFavorite);

// Add multiple ads to favorites in a batch operation
router.post('/batch', authenticate, favoriteController.addFavoritesBatch);

// Remove an ad from favorites
router.delete('/:adId', authenticate, favoriteController.removeFavorite);

// Remove multiple ads from favorites in a batch operation
router.delete('/batch', authenticate, favoriteController.removeFavoritesBatch);

// Update favorite notes
router.patch('/:adId/notes', authenticate, favoriteController.updateFavoriteNotes);

// Update favorite tags
router.patch('/:adId/tags', authenticate, favoriteController.updateFavoriteTags);

// Update favorite priority
router.patch('/:adId/priority', authenticate, favoriteController.updateFavoritePriority);

// Toggle notifications for a favorite
router.patch('/:adId/notifications', authenticate, favoriteController.toggleNotifications);

module.exports = router;
