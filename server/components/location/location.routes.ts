import express from 'express';
const router = express.Router();
import asyncHandler from '../../middleware/asyncHandler.js';
import { protect as authenticate, restrictTo } from '../../middleware/auth.js';
import locationController from '../../controllers/location.controller.js';
import { LocationValidator } from './location.validator.js';
import norwayLocations from '../../data/norway-locations.js';

/**
 * @route   GET /api/v1/locations/counties
 * @desc    Get all Norwegian counties
 * @access  Public
 */
router.get(
  '/counties',
  asyncHandler(async (req, res) => {
    const counties = norwayLocations.getAllCounties();
    res.json(counties);
  })
);

/**
 * @route   GET /api/v1/locations/counties/:countyName/cities
 * @desc    Get all cities for a specific county
 * @access  Public
 */
router.get(
  '/counties/:countyName/cities',
  asyncHandler(async (req, res) => {
    const { countyName } = req.params;
    const cities = norwayLocations.getCitiesByCounty(countyName);

    if (!cities.length) {
      return res.status(404).json({ message: `No cities found for county: ${countyName}` });
    }

    res.json(cities);
  })
);

/**
 * @route   GET /api/v1/locations/cities
 * @desc    Get all Norwegian cities
 * @access  Public
 */
router.get(
  '/cities',
  asyncHandler(async (req, res) => {
    const cities = norwayLocations.getAllCities();
    res.json(cities);
  })
);

/**
 * @route   GET /api/v1/locations/cities/:cityName/coordinates
 * @desc    Get coordinates for a specific city
 * @access  Public
 */
router.get(
  '/cities/:cityName/coordinates',
  asyncHandler(async (req, res) => {
    const { cityName } = req.params;
    const coordinates = norwayLocations.getCityCoordinates(cityName);

    if (!coordinates) {
      return res.status(404).json({ message: `No coordinates found for city: ${cityName}` });
    }

    res.json({ coordinates });
  })
);

/**
 * @route   GET /api/v1/locations/nearest-city
 * @desc    Find the nearest city to the given coordinates
 * @access  Public
 */
router.get(
  '/nearest-city',
  LocationValidator.validateNearbyQuery,
  asyncHandler(async (req, res) => {
    const { latitude, longitude } = req.query;

    const { city, county, distance } = norwayLocations.findNearestCity(
      parseFloat(latitude as string),
      parseFloat(longitude as string)
    );

    if (!city) {
      return res.status(404).json({ message: 'No nearby city found' });
    }

    res.json({ city, county, distance });
  })
);

/**
 * @route   GET /api/v1/locations/search
 * @desc    Search locations by name
 * @access  Public
 */
router.get(
  '/search',
  LocationValidator.validateSearchQuery,
  asyncHandler(locationController.searchLocations)
);

/**
 * @route   GET /api/v1/locations/nearby
 * @desc    Get locations near coordinates
 * @access  Public
 */
router.get(
  '/nearby',
  LocationValidator.validateNearbyQuery,
  asyncHandler(locationController.getNearbyLocations)
);

/**
 * @route   GET /api/v1/locations/popular
 * @desc    Get popular locations
 * @access  Public
 */
router.get('/popular', asyncHandler(locationController.getPopularLocations));

/**
 * @route   GET /api/v1/locations/:id
 * @desc    Get location by ID
 * @access  Public
 */
router.get(
  '/:id',
  LocationValidator.validateIdParam,
  asyncHandler(locationController.getLocationById)
);

/**
 * @route   POST /api/v1/locations
 * @desc    Create a new location
 * @access  Admin
 */
router.post(
  '/',
  authenticate,
  restrictTo('admin'),
  LocationValidator.validateCreateLocation,
  asyncHandler(locationController.createLocation)
);

/**
 * @route   PUT /api/v1/locations/:id
 * @desc    Update a location
 * @access  Admin
 */
router.put(
  '/:id',
  authenticate,
  restrictTo('admin'),
  LocationValidator.validateIdParam,
  LocationValidator.validateUpdateLocation,
  asyncHandler(locationController.updateLocation)
);

/**
 * @route   DELETE /api/v1/locations/:id
 * @desc    Delete a location
 * @access  Admin
 */
router.delete(
  '/:id',
  authenticate,
  restrictTo('admin'),
  LocationValidator.validateIdParam,
  asyncHandler(locationController.deleteLocation)
);

export default router;
