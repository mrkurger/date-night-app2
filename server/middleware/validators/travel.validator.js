/**
 * Validation middleware for travel-related routes
 */
import { body, param, query, validationResult } from 'express-validator';
import { AppError } from '../errorHandler';

// Helper function to check validation results
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new AppError(
        `Validation error: ${errors
          .array()
          .map(e => e.msg)
          .join(', ')}`,
        400
      )
    );
  }
  next();
};

// Validate itinerary creation/update data
exports.validateItineraryData = [
  body('destination.city')
    .notEmpty()
    .withMessage('City is required')
    .isString()
    .withMessage('City must be a string')
    .trim(),

  body('destination.county')
    .notEmpty()
    .withMessage('County is required')
    .isString()
    .withMessage('County must be a string')
    .trim(),

  body('arrivalDate')
    .notEmpty()
    .withMessage('Arrival date is required')
    .isISO8601()
    .withMessage('Arrival date must be a valid date')
    .custom(value => {
      const arrivalDate = new Date(value);
      return arrivalDate >= new Date();
    })
    .withMessage('Arrival date must be in the future'),

  body('departureDate')
    .notEmpty()
    .withMessage('Departure date is required')
    .isISO8601()
    .withMessage('Departure date must be a valid date')
    .custom((value, { req }) => {
      const departureDate = new Date(value);
      const arrivalDate = new Date(req.body.arrivalDate);
      return departureDate > arrivalDate;
    })
    .withMessage('Departure date must be after arrival date'),

  body('destination.location.coordinates')
    .optional()
    .isArray()
    .withMessage('Coordinates must be an array')
    .custom(value => {
      return value.length === 2 && !isNaN(parseFloat(value[0])) && !isNaN(parseFloat(value[1]));
    })
    .withMessage('Coordinates must be [longitude, latitude]'),

  body('accommodation.showAccommodation')
    .optional()
    .isBoolean()
    .withMessage('showAccommodation must be a boolean'),

  body('accommodation.name')
    .optional()
    .isString()
    .withMessage('Accommodation name must be a string')
    .trim(),

  body('accommodation.address')
    .optional()
    .isString()
    .withMessage('Accommodation address must be a string')
    .trim(),

  body('notes').optional().isString().withMessage('Notes must be a string').trim(),

  body('status')
    .optional()
    .isIn(['planned', 'active', 'completed', 'cancelled'])
    .withMessage('Invalid status'),

  validateResults,
];

// Validate location update data
exports.validateLocationUpdate = [
  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  validateResults,
];

// Validate parameters for getting ads by location
exports.validateLocationQuery = [
  query('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  query('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  query('distance')
    .optional()
    .isInt({ min: 1, max: 100000 })
    .withMessage('Distance must be between 1 and 100000 meters'),

  validateResults,
];

// Validate parameters for getting upcoming tours
exports.validateUpcomingToursQuery = [
  query('city').optional().isString().withMessage('City must be a string').trim(),

  query('county').optional().isString().withMessage('County must be a string').trim(),

  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),

  validateResults,
];

// Validate ad ID parameter
exports.validateAdId = [
  param('adId')
    .notEmpty()
    .withMessage('Ad ID is required')
    .isMongoId()
    .withMessage('Invalid Ad ID format'),

  validateResults,
];

// Validate itinerary ID parameter
exports.validateItineraryId = [
  param('itineraryId')
    .notEmpty()
    .withMessage('Itinerary ID is required')
    .isString()
    .withMessage('Invalid Itinerary ID format'),

  validateResults,
];
