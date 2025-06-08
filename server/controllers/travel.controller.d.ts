// Type declarations for controllers/travel.controller.js
import { RequestHandler } from '../src/types/middleware';

/**
 * Travel Controller interface with typed methods
 */
export interface TravelController {
  getItineraries: RequestHandler;
  addItinerary: RequestHandler;
  updateItinerary: RequestHandler;
  cancelItinerary: RequestHandler;
  updateLocation: RequestHandler;
  getTouringAdvertisers: RequestHandler;
  getUpcomingTours: RequestHandler;
  getAdsByLocation: RequestHandler;
}

declare const travelController: TravelController;
export default travelController;
