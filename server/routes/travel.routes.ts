import express from 'express';
import { protect as authenticate } from '../middleware/auth.js';
import { isAdvertiser } from '../middleware/roles.js';
import travelController from '../controllers/travel.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a new itinerary
router.post('/ad/:adId/itinerary', isAdvertiser, travelController.addItinerary);

// Get advertiser itineraries
router.get('/ad/:adId/itineraries', isAdvertiser, travelController.getItineraries);

// Update a specific itinerary
router.put(
  '/ad/:adId/itinerary/:itineraryId',
  isAdvertiser,
  travelController.updateItinerary
);

// Cancel an itinerary
router.delete(
  '/ad/:adId/itinerary/:itineraryId',
  isAdvertiser,
  travelController.cancelItinerary
);

// Update current location while traveling
router.post('/ad/:adId/location', isAdvertiser, travelController.updateLocation);

// Get advertisers currently touring
router.get('/advertisers/touring', travelController.getTouringAdvertisers);

// Get upcoming tours
router.get('/upcoming', travelController.getUpcomingTours);

// Get ads by location
router.get('/location', travelController.getAdsByLocation);

export default router;
