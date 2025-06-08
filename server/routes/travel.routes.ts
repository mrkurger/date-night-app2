import express from 'express';
import { prrouter.delete(
  '/ad/:adId/itinerary/:itineraryId',
  isAdvertiser,
  adaptMiddleware(TravelValidator.validateAdId),
  adaptMiddleware(TravelValidator.validateItineraryId),
  wrapAsync(travelController.cancelItinerary)
);s authenticate } from '../middleware/auth.js';
import { isAdvertiser } from '../middleware/roles.js';
import travelController from '../controllers/travel.controller.js';
import { TravelValidator } from '../middleware/validators/travel.validator.js';
import { asMiddleware } from '../src/utils/express-helpers.js';
import { adaptMiddleware, wrapAsync } from '../src/utils/express-compatibility.js';
import type { RequestHandler } from '../src/types/middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a new itinerary
router.post(
  '/ad/:adId/itinerary',
  isAdvertiser,
  TravelValidator.validateAdId,
  TravelValidator.validateItineraryData,
  wrapAsync(travelController.addItinerary)
);

// Get advertiser itineraries
router.get(
  '/ad/:adId/itineraries',
  isAdvertiser,
  TravelValidator.validateAdId,
  wrapAsync(travelController.getItineraries)
);

// Update a specific itinerary
router.put(
  '/ad/:adId/itinerary/:itineraryId',
  isAdvertiser,
  TravelValidator.validateAdId,
  TravelValidator.validateItineraryId,
  TravelValidator.validateItineraryData,
  wrapAsync(travelController.updateItinerary)
);

// Cancel an itinerary
router.delete(
  '/ad/:adId/itinerary/:itineraryId',
  isAdvertiser,
  TravelValidator.validateAdId,
  TravelValidator.validateItineraryId,
  wrapAsync(travelController.cancelItinerary)
);

// Update current location while traveling
router.post(
  '/ad/:adId/location',
  isAdvertiser,
  TravelValidator.validateAdId,
  TravelValidator.validateLocationUpdate,
  assertRequestHandler(travelController.updateLocation)
);

// Get advertisers currently touring
router.get('/advertisers/touring', assertRequestHandler(travelController.getTouringAdvertisers));

// Get upcoming tours
router.get(
  '/upcoming',
  TravelValidator.validateUpcomingToursQuery,
  assertRequestHandler(travelController.getUpcomingTours)
);

// Get ads by location
router.get(
  '/location',
  TravelValidator.validateLocationQuery,
  assertRequestHandler(travelController.getAdsByLocation)
);

export default router;
