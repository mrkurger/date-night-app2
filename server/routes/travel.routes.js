
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for travel.routes settings
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const express = require('express');
const router = express.Router();
const travelController = require('../controllers/travel.controller');
const { authenticateToken } = require('../middleware/authenticateToken');
const { isAdvertiser } = require('../middleware/roles');
const travelValidator = require('../middleware/validators/travel.validator');

// Protected routes requiring authentication
router.use(authenticateToken);

// Routes for managing travel itineraries
router.get(
  '/ad/:adId',
  travelValidator.validateAdId,
  travelController.getItineraries
);

router.post(
  '/ad/:adId',
  isAdvertiser,
  travelValidator.validateAdId,
  travelValidator.validateItineraryData,
  travelController.addItinerary
);

router.put(
  '/ad/:adId/itinerary/:itineraryId',
  isAdvertiser,
  travelValidator.validateAdId,
  travelValidator.validateItineraryId,
  travelValidator.validateItineraryData,
  travelController.updateItinerary
);

router.delete(
  '/ad/:adId/itinerary/:itineraryId',
  isAdvertiser,
  travelValidator.validateAdId,
  travelValidator.validateItineraryId,
  travelController.cancelItinerary
);

// Location update route
router.put(
  '/ad/:adId/location',
  isAdvertiser,
  travelValidator.validateAdId,
  travelValidator.validateLocationUpdate,
  travelController.updateLocation
);

// Public routes for browsing travel information
router.get(
  '/touring',
  travelController.getTouringAdvertisers
);

router.get(
  '/upcoming',
  travelValidator.validateUpcomingToursQuery,
  travelController.getUpcomingTours
);

router.get(
  '/location',
  travelValidator.validateLocationQuery,
  travelController.getAdsByLocation
);

module.exports = router;