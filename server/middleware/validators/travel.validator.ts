/**
 * Validation schemas for travel-related routes using Zod
 */
import { z } from 'zod';
import { zodSchemas } from '../../utils/validation-utils.js';
// Import validateWithZod function from local validator
import { validateWithZod } from '../validator.js';

export const TravelSchemas = {
  // Schema for itinerary creation/update
  itineraryData: z.object({
    destination: z.object({
      city: zodSchemas.shortString,
      county: zodSchemas.shortString,
      location: zodSchemas.coordinates.optional(),
    }),
    arrivalDate: z
      .string()
      .datetime()
      .refine(value => new Date(value) >= new Date(), {
        message: 'Arrival date cannot be in the past',
      }),
    departureDate: z
      .string()
      .datetime()
      .refine(
        (value: string, ctx: z.RefinementCtx) => {
          const arrivalDate = (ctx as any).parent?.arrivalDate
            ? new Date((ctx as any).parent.arrivalDate)
            : null;
          return arrivalDate ? new Date(value) > arrivalDate : true;
        },
        {
          message: 'Departure date must be after arrival date',
        }
      ),
    accommodation: z
      .object({
        showAccommodation: z.boolean().optional(),
        name: zodSchemas.shortString.optional(),
        address: zodSchemas.shortString.optional(),
      })
      .optional(),
    notes: zodSchemas.longString.optional(),
    status: z.enum(['planned', 'active', 'completed', 'cancelled']).optional(),
  }),

  // Schema for location update
  locationUpdate: z.object({
    longitude: z.number().min(-180).max(180),
    latitude: z.number().min(-90).max(90),
  }),

  // Schema for location-based queries
  locationQuery: z.object({
    longitude: z.number().min(-180).max(180),
    latitude: z.number().min(-90).max(90),
    distance: z.number().min(1).max(100000).optional(),
    radius: z.number().positive().optional(),
    unit: z.enum(['km', 'mi']).optional(),
  }),

  // Schema for upcoming tours query
  upcomingToursQuery: z.object({
    city: zodSchemas.shortString.optional(),
    county: zodSchemas.shortString.optional(),
    days: z.number().int().min(1).max(365).optional(),
  }),

  // Schema for ad ID parameter
  adIdParam: z.object({
    adId: zodSchemas.objectId,
  }),

  // Schema for itinerary ID parameter
  itineraryIdParam: z.object({
    itineraryId: zodSchemas.objectId,
  }),
};

export const TravelValidator = {
  validateItineraryData: validateWithZod(z.object({ body: TravelSchemas.itineraryData })),
  validateLocationUpdate: validateWithZod(z.object({ body: TravelSchemas.locationUpdate })),
  validateLocationQuery: validateWithZod(z.object({ query: TravelSchemas.locationQuery })),
  validateUpcomingToursQuery: validateWithZod(
    z.object({ query: TravelSchemas.upcomingToursQuery })
  ),
  validateAdId: validateWithZod(z.object({ params: TravelSchemas.adIdParam })),
  validateItineraryId: validateWithZod(z.object({ params: TravelSchemas.itineraryIdParam })),
};

export default TravelValidator;
