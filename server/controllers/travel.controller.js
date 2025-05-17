import travelService from '../services/travel.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
// AppError is imported but not used directly in this controller
// It may be needed for future error handling enhancements
// eslint-disable-next-line no-unused-vars
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

/**
 * Travel Controller for handling travel-related API endpoints
 */
const travelController = {
  /**
   * Get all travel itineraries for an ad
   * @route GET /api/travel/ad/:adId
   * @access Public
   */
  getItineraries: asyncHandler(async (req, res) => {
    const { adId } = req.params;
    const itineraries = await travelService.getItineraries(adId);

    res.status(200).json({
      success: true,
      data: itineraries,
    });
  }),

  /**
   * Add a travel itinerary to an ad
   * @route POST /api/travel/ad/:adId
   * @access Private (Advertiser only)
   */
  addItinerary: asyncHandler(async (req, res) => {
    const { adId } = req.params;
    const userId = req.user.id;
    const itineraryData = req.body;

    // Validation is now handled by middleware
    const ad = await travelService.addItinerary(adId, itineraryData, userId);

    logger.info(`New travel itinerary added for ad ${adId} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: ad.travelItinerary,
    });
  }),

  /**
   * Update a travel itinerary
   * @route PUT /api/travel/ad/:adId/itinerary/:itineraryId
   * @access Private (Advertiser only)
   */
  updateItinerary: asyncHandler(async (req, res) => {
    const { adId, itineraryId } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Validation is now handled by middleware
    const ad = await travelService.updateItinerary(adId, itineraryId, updates, userId);

    logger.info(`Travel itinerary ${itineraryId} updated for ad ${adId} by user ${userId}`);

    res.status(200).json({
      success: true,
      data: ad.travelItinerary.id(itineraryId),
    });
  }),

  /**
   * Cancel a travel itinerary
   * @route DELETE /api/travel/ad/:adId/itinerary/:itineraryId
   * @access Private (Advertiser only)
   */
  cancelItinerary: asyncHandler(async (req, res) => {
    const { adId, itineraryId } = req.params;
    const userId = req.user.id;

    // Call service to cancel the itinerary
    await travelService.cancelItinerary(adId, itineraryId, userId);

    logger.info(`Travel itinerary ${itineraryId} cancelled for ad ${adId} by user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Travel itinerary cancelled successfully',
    });
  }),

  /**
   * Update advertiser's current location
   * @route PUT /api/travel/ad/:adId/location
   * @access Private (Advertiser only)
   */
  updateLocation: asyncHandler(async (req, res) => {
    const { adId } = req.params;
    const userId = req.user.id;
    const { longitude, latitude } = req.body;

    // Validation is now handled by middleware
    const ad = await travelService.updateLocation(
      adId,
      parseFloat(longitude),
      parseFloat(latitude),
      userId
    );

    logger.info(`Location updated for ad ${adId} by user ${userId}`);

    res.status(200).json({
      success: true,
      data: {
        currentLocation: ad.currentLocation,
        isTouring: ad.isTouring,
      },
    });
  }),

  /**
   * Find touring advertisers
   * @route GET /api/travel/touring
   * @access Public
   */
  getTouringAdvertisers: asyncHandler(async (req, res) => {
    const ads = await travelService.findTouringAdvertisers();

    res.status(200).json({
      success: true,
      count: ads.length,
      data: ads,
    });
  }),

  /**
   * Find upcoming tours
   * @route GET /api/travel/upcoming
   * @access Public
   */
  getUpcomingTours: asyncHandler(async (req, res) => {
    const { city, county, days } = req.query;
    const daysAhead = days ? parseInt(days) : 30;

    const ads = await travelService.findUpcomingTours(city, county, daysAhead);

    res.status(200).json({
      success: true,
      count: ads.length,
      data: ads,
    });
  }),

  /**
   * Find ads by location (including touring advertisers)
   * @route GET /api/travel/location
   * @access Public
   */
  getAdsByLocation: asyncHandler(async (req, res) => {
    const { longitude, latitude, distance } = req.query;

    // Validation is now handled by middleware
    const maxDistance = distance ? parseInt(distance) : 10000;

    const ads = await travelService.findByLocation(
      parseFloat(longitude),
      parseFloat(latitude),
      maxDistance
    );

    res.status(200).json({
      success: true,
      count: ads.length,
      data: ads,
    });
  }),
};

export async function someHandler(req, res) {
  // TODO: Implement travel handler
  return sendError(res, new Error('NOT_IMPLEMENTED'), 501);
}

export default travelController;
