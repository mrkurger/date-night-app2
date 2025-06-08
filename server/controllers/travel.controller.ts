/**
 * Travel Controller for handling travel-related API endpoints
 */
import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/error-handler.js';
import { logger } from '../utils/logger.js';
import travelService from '../services/travel.service.js';
import { TravelController } from './travel.controller.d.js';

/**
 * Travel Controller implementation with TypeScript support
 */
const travelController: TravelController = {
  /**
   * Get all travel itineraries for an ad
   * @route GET /api/travel/ad/:adId
   * @access Public
   */
  getItineraries: asyncHandler(async (req: Request, res: Response) => {
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
  addItinerary: asyncHandler(async (req: Request, res: Response) => {
    const { adId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User is not authenticated', 401);
    }

    const itineraryData = req.body;

    // Validation is handled by middleware
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
  updateItinerary: asyncHandler(async (req: Request, res: Response) => {
    const { adId, itineraryId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User is not authenticated', 401);
    }

    const updates = req.body;

    // Validation is handled by middleware
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
  cancelItinerary: asyncHandler(async (req: Request, res: Response) => {
    const { adId, itineraryId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User is not authenticated', 401);
    }

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
  updateLocation: asyncHandler(async (req: Request, res: Response) => {
    const { adId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User is not authenticated', 401);
    }

    const { longitude, latitude } = req.body;

    // Validation is handled by middleware
    const ad = await travelService.updateLocation(
      adId,
      parseFloat(String(longitude)),
      parseFloat(String(latitude)),
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
  getTouringAdvertisers: asyncHandler(async (req: Request, res: Response) => {
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
  getUpcomingTours: asyncHandler(async (req: Request, res: Response) => {
    const { city, county, days } = req.query;
    const daysAhead = days ? parseInt(String(days)) : 30;

    const ads = await travelService.findUpcomingTours(
      city as string | undefined,
      county as string | undefined,
      daysAhead
    );

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
  getAdsByLocation: asyncHandler(async (req: Request, res: Response) => {
    const { longitude, latitude, distance } = req.query;

    // Validation is handled by middleware
    const maxDistance = distance ? parseInt(String(distance)) : 10000;

    const ads = await travelService.findByLocation(
      parseFloat(String(longitude)),
      parseFloat(String(latitude)),
      maxDistance
    );

    res.status(200).json({
      success: true,
      count: ads.length,
      data: ads,
    });
  }),
};

export default travelController;
