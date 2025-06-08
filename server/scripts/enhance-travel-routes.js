/**
 * Script to enhance travel routes for TypeScript compatibility
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverRoot = path.resolve(__dirname, '..');
const routesDir = path.resolve(serverRoot, 'routes');

// TypeScript friendly version of travel routes
const travelRoutesTS = `/**
 * Travel routes with TypeScript support
 * This file provides routes for managing travel itineraries
 */
import express from 'express';
import { protect as authenticate } from '../middleware/auth.js';
import { isAdvertiser } from '../middleware/roles.js';
import travelController from '../controllers/travel.controller.js';
import { wrapAsync } from '../src/utils/express-compatibility.js';
import { TravelValidator } from '../middleware/validators/travel.validator.js';

// Create router
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
  wrapAsync(travelController.updateLocation)
);

// Get advertisers currently touring
router.get('/advertisers/touring', wrapAsync(travelController.getTouringAdvertisers));

// Get upcoming tours
router.get(
  '/upcoming',
  TravelValidator.validateUpcomingToursQuery,
  wrapAsync(travelController.getUpcomingTours)
);

// Get ads by location
router.get(
  '/location',
  TravelValidator.validateLocationQuery,
  wrapAsync(travelController.getAdsByLocation)
);

export default router;`;

// Generate the new file
fs.writeFileSync(path.resolve(routesDir, 'travel.routes.js.new'), travelRoutesTS);

console.log('Enhanced travel routes created successfully!');
