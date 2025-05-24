import express from 'express';
import { protect as authenticate } from '../middleware/auth.js';
import { isAdvertiser } from '../middleware/roles.js';
import travelController from '../controllers/travel.controller.js';
import { ValidationUtils } from '../utils/validation-utils.ts';
import TravelSchemas from '../middleware/validators/travel.validator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a new itinerary
router.post(
  '/ad/:adId/itinerary',
  isAdvertiser,
  ValidationUtils.validateWithZod(TravelSchemas.adIdParam, 'params'),
  ValidationUtils.validateWithZod(TravelSchemas.itineraryData),
  travelController.createItinerary
);

// Get advertiser itineraries
router.get(
  '/ad/:adId/itineraries',
  isAdvertiser,
  ValidationUtils.validateWithZod(TravelSchemas.adIdParam, 'params'),
  ValidationUtils.validateWithZod(ValidationUtils.zodSchemas.pagination, 'query'),
  travelController.getAdvertiserItineraries
);

// Update an itinerary
router.put(
  '/ad/:adId/itinerary/:itineraryId',
  isAdvertiser,
  ValidationUtils.validateWithZod(TravelSchemas.adIdParam, 'params'),
  ValidationUtils.validateWithZod(TravelSchemas.itineraryIdParam, 'params'),
  ValidationUtils.validateWithZod(TravelSchemas.itineraryData),
  travelController.updateItinerary
);

// Delete an itinerary
router.delete(
  '/ad/:adId/itinerary/:itineraryId',
  isAdvertiser,
  ValidationUtils.validateWithZod(TravelSchemas.adIdParam, 'params'),
  ValidationUtils.validateWithZod(TravelSchemas.itineraryIdParam, 'params'),
  travelController.cancelItinerary
);

// Location update route
router.put(
  '/ad/:adId/location',
  isAdvertiser,
  ValidationUtils.validateWithZod(TravelSchemas.adIdParam, 'params'),
  ValidationUtils.validateWithZod(TravelSchemas.locationUpdate),
  travelController.updateLocation
);

// Public routes for browsing travel information
router.get(
  '/touring',
  ValidationUtils.validateWithZod(ValidationUtils.zodSchemas.pagination, 'query'),
  travelController.getTouringAdvertisers
);

router.get(
  '/upcoming',
  ValidationUtils.validateWithZod(TravelSchemas.upcomingToursQuery, 'query'),
  travelController.getUpcomingTours
);

router.get(
  '/location',
  ValidationUtils.validateWithZod(TravelSchemas.locationQuery, 'query'),
  travelController.getAdsByLocation
);

export default router;
