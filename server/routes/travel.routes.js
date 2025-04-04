const express = require('express');
const router = express.Router();
const travelController = require('../controllers/travel.controller');
const { protect, authorize } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to all routes
router.use(rateLimiter.apiLimiter);

// Public routes
router.get('/touring', travelController.getTouringAdvertisers);
router.get('/upcoming', travelController.getUpcomingTours);
router.get('/location', travelController.getAdsByLocation);
router.get('/ad/:adId', travelController.getItineraries);

// Protected routes (authenticated users only)
router.use(protect);

// Advertiser routes
router.post('/ad/:adId', authorize('advertiser'), travelController.addItinerary);
router.put('/ad/:adId/itinerary/:itineraryId', authorize('advertiser'), travelController.updateItinerary);
router.delete('/ad/:adId/itinerary/:itineraryId', authorize('advertiser'), travelController.cancelItinerary);
router.put('/ad/:adId/location', authorize('advertiser'), travelController.updateLocation);

module.exports = router;