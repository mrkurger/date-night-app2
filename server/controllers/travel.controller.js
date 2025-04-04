const travelService = require('../services/travel.service');
const { asyncHandler } = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get all travel itineraries for an ad
 * @route GET /api/travel/ad/:adId
 * @access Public
 */
exports.getItineraries = asyncHandler(async (req, res) => {
  const { adId } = req.params;
  const itineraries = await travelService.getItineraries(adId);
  
  res.status(200).json({
    success: true,
    data: itineraries
  });
});

/**
 * Add a travel itinerary to an ad
 * @route POST /api/travel/ad/:adId
 * @access Private (Advertiser only)
 */
exports.addItinerary = asyncHandler(async (req, res) => {
  const { adId } = req.params;
  const userId = req.user.id;
  const itineraryData = req.body;
  
  // Validate required fields
  if (!itineraryData.destination || !itineraryData.arrivalDate || !itineraryData.departureDate) {
    throw new AppError('Destination, arrival date, and departure date are required', 400);
  }
  
  // Validate dates
  const arrivalDate = new Date(itineraryData.arrivalDate);
  const departureDate = new Date(itineraryData.departureDate);
  
  if (isNaN(arrivalDate.getTime()) || isNaN(departureDate.getTime())) {
    throw new AppError('Invalid date format', 400);
  }
  
  if (arrivalDate > departureDate) {
    throw new AppError('Arrival date must be before departure date', 400);
  }
  
  const ad = await travelService.addItinerary(adId, itineraryData, userId);
  
  res.status(201).json({
    success: true,
    data: ad.travelItinerary
  });
});

/**
 * Update a travel itinerary
 * @route PUT /api/travel/ad/:adId/itinerary/:itineraryId
 * @access Private (Advertiser only)
 */
exports.updateItinerary = asyncHandler(async (req, res) => {
  const { adId, itineraryId } = req.params;
  const userId = req.user.id;
  const updates = req.body;
  
  // Validate dates if provided
  if (updates.arrivalDate && updates.departureDate) {
    const arrivalDate = new Date(updates.arrivalDate);
    const departureDate = new Date(updates.departureDate);
    
    if (isNaN(arrivalDate.getTime()) || isNaN(departureDate.getTime())) {
      throw new AppError('Invalid date format', 400);
    }
    
    if (arrivalDate > departureDate) {
      throw new AppError('Arrival date must be before departure date', 400);
    }
  }
  
  const ad = await travelService.updateItinerary(adId, itineraryId, updates, userId);
  
  res.status(200).json({
    success: true,
    data: ad.travelItinerary.id(itineraryId)
  });
});

/**
 * Cancel a travel itinerary
 * @route DELETE /api/travel/ad/:adId/itinerary/:itineraryId
 * @access Private (Advertiser only)
 */
exports.cancelItinerary = asyncHandler(async (req, res) => {
  const { adId, itineraryId } = req.params;
  const userId = req.user.id;
  
  const ad = await travelService.cancelItinerary(adId, itineraryId, userId);
  
  res.status(200).json({
    success: true,
    message: 'Travel itinerary cancelled successfully'
  });
});

/**
 * Update advertiser's current location
 * @route PUT /api/travel/ad/:adId/location
 * @access Private (Advertiser only)
 */
exports.updateLocation = asyncHandler(async (req, res) => {
  const { adId } = req.params;
  const userId = req.user.id;
  const { longitude, latitude } = req.body;
  
  // Validate coordinates
  if (!longitude || !latitude) {
    throw new AppError('Longitude and latitude are required', 400);
  }
  
  if (isNaN(parseFloat(longitude)) || isNaN(parseFloat(latitude))) {
    throw new AppError('Invalid coordinates', 400);
  }
  
  const ad = await travelService.updateLocation(
    adId, 
    parseFloat(longitude), 
    parseFloat(latitude), 
    userId
  );
  
  res.status(200).json({
    success: true,
    data: {
      currentLocation: ad.currentLocation,
      isTouring: ad.isTouring
    }
  });
});

/**
 * Find touring advertisers
 * @route GET /api/travel/touring
 * @access Public
 */
exports.getTouringAdvertisers = asyncHandler(async (req, res) => {
  const ads = await travelService.findTouringAdvertisers();
  
  res.status(200).json({
    success: true,
    count: ads.length,
    data: ads
  });
});

/**
 * Find upcoming tours
 * @route GET /api/travel/upcoming
 * @access Public
 */
exports.getUpcomingTours = asyncHandler(async (req, res) => {
  const { city, county, days } = req.query;
  const daysAhead = days ? parseInt(days) : 30;
  
  const ads = await travelService.findUpcomingTours(city, county, daysAhead);
  
  res.status(200).json({
    success: true,
    count: ads.length,
    data: ads
  });
});

/**
 * Find ads by location (including touring advertisers)
 * @route GET /api/travel/location
 * @access Public
 */
exports.getAdsByLocation = asyncHandler(async (req, res) => {
  const { longitude, latitude, distance } = req.query;
  
  // Validate coordinates
  if (!longitude || !latitude) {
    throw new AppError('Longitude and latitude are required', 400);
  }
  
  if (isNaN(parseFloat(longitude)) || isNaN(parseFloat(latitude))) {
    throw new AppError('Invalid coordinates', 400);
  }
  
  const maxDistance = distance ? parseInt(distance) : 10000;
  
  const ads = await travelService.findByLocation(
    parseFloat(longitude),
    parseFloat(latitude),
    maxDistance
  );
  
  res.status(200).json({
    success: true,
    count: ads.length,
    data: ads
  });
});