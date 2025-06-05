import { Router } from 'express';
import { travelController } from './travel.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { isAdvertiser } from '../../middleware/roles.js';
import { ValidationUtils } from '../../utils/validation-utils.js';
import { travelSchemas } from './travel.schema.js';

const router = Router();

// Protected routes requiring authentication
router.use(authenticateToken);

// Routes for managing travel itineraries
router.get(
  '/ad/:adId',
  ValidationUtils.validateWithZod(travelSchemas.params.adId, 'params'),
  travelController.getItineraries
);

router.post(
  '/ad/:adId',
  isAdvertiser,
  ValidationUtils.validateWithZod(travelSchemas.params.adId, 'params'),
  ValidationUtils.validateWithZod(travelSchemas.itinerary),
  travelController.addItinerary
);

router.put(
  '/ad/:adId/itinerary/:itineraryId',
  isAdvertiser,
  ValidationUtils.validateWithZod(travelSchemas.params.adAndItineraryId, 'params'),
  ValidationUtils.validateWithZod(travelSchemas.itinerary),
  travelController.updateItinerary
);

router.delete(
  '/ad/:adId/itinerary/:itineraryId',
  isAdvertiser,
  ValidationUtils.validateWithZod(travelSchemas.params.adAndItineraryId, 'params'),
  travelController.cancelItinerary
);

// Location update route
router.put(
  '/ad/:adId/location',
  isAdvertiser,
  ValidationUtils.validateWithZod(travelSchemas.params.adId, 'params'),
  ValidationUtils.validateWithZod(travelSchemas.locationUpdate),
  travelController.updateLocation
);

// Public routes for browsing travel information
router.get('/touring', travelController.getTouringAdvertisers);

router.get(
  '/upcoming',
  ValidationUtils.validateWithZod(travelSchemas.upcomingToursQuery, 'query'),
  travelController.getUpcomingTours
);

router.get(
  '/location',
  ValidationUtils.validateWithZod(travelSchemas.locationQuery, 'query'),
  travelController.getAdsByLocation
);

export { router as travelRouter };
