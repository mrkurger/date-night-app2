const express = require('express');
const router = express.Router();
const travelController = require('../controllers/travel.controller');
const { authenticateToken } = require('../middleware/authenticateToken');
const { isAdvertiser } = require('../middleware/roles');

// Protected routes requiring authentication and advertiser role
router.use(authenticateToken);

// Routes for managing travel itineraries
router.get('/ad/:adId', travelController.getItineraries);
router.post('/ad/:adId', isAdvertiser, travelController.addItinerary);
router.put('/ad/:adId/itinerary/:itineraryId', isAdvertiser, travelController.updateItinerary);
router.delete('/ad/:adId/itinerary/:itineraryId', isAdvertiser, travelController.deleteItinerary);

module.exports = router;