// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for location.routes settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import express from 'express';
const router = express.Router();
import asyncHandler from '../middleware/asyncHandler.js';
import { protect as protect as authenticate, restrictTo } from '../middleware/auth.js';
import locationController from '../controllers/location.controller.js';

// Import the Norway locations data
import norwayLocations from '../data/norway-locations.js';

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
  asyncHandler(async (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: 'Invalid latitude or longitude' });
    }

    const { city, county, distance } = norwayLocations.findNearestCity(lat, lng);

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
router.get('/search', asyncHandler(locationController.searchLocations));

/**
 * @route   GET /api/v1/locations/nearby
 * @desc    Get locations near coordinates
 * @access  Public
 */
router.get('/nearby', asyncHandler(locationController.getNearbyLocations));

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
router.get('/:id', asyncHandler(locationController.getLocationById));

/**
 * @route   POST /api/v1/locations
 * @desc    Create a new location
 * @access  Admin
 */
router.post(
  '/',
  authenticate,
  restrictTo('admin'),
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
  asyncHandler(locationController.deleteLocation)
);

export default router;
