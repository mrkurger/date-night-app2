import { z } from 'zod';
import { zodSchemas } from '../../utils/validation-utils.js';

/**
 * Travel module validation schemas
 */
export const travelSchemas = {
  // Schema for coordinates
  coordinates: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90), // latitude
  ]),

  // Schema for destination
  destination: z.object({
    city: z.string().min(2).max(100),
    county: z.string().min(2).max(100),
    location: z.object({
      coordinates: z.tuple([
        z.number().min(-180).max(180), // longitude
        z.number().min(-90).max(90), // latitude
      ]),
    }),
  }),

  // Schema for itinerary
  itinerary: z
    .object({
      destination: z.lazy(() => travelSchemas.destination),
      arrivalDate: z.string().datetime(),
      departureDate: z.string().datetime(),
      notes: z.string().max(1000).optional(),
      status: z.enum(['planned', 'active', 'completed', 'cancelled']).default('planned'),
      accommodation: z
        .object({
          name: z.string().min(2).max(100),
          address: z.string().min(5).max(200),
        })
        .optional(),
    })
    .refine(
      data => {
        // Custom validation: departure must be after arrival
        const arrival = new Date(data.arrivalDate);
        const departure = new Date(data.departureDate);
        return departure > arrival;
      },
      {
        message: 'Departure date must be after arrival date',
        path: ['departureDate'],
      }
    ),

  // Schema for location update
  locationUpdate: z.object({
    longitude: z.number().min(-180).max(180),
    latitude: z.number().min(-90).max(90),
  }),

  // Schema for location query
  locationQuery: z.object({
    longitude: z.string().transform(Number).pipe(z.number().min(-180).max(180)),
    latitude: z.string().transform(Number).pipe(z.number().min(-90).max(90)),
    distance: z
      .string()
      .transform(Number)
      .pipe(z.number().min(1).max(100000))
      .optional()
      .default('10000'),
  }),

  // Schema for upcoming tours query
  upcomingToursQuery: z.object({
    city: z.string().min(2).max(100).optional(),
    county: z.string().min(2).max(100).optional(),
    days: z
      .string()
      .transform(Number)
      .pipe(z.number().int().min(1).max(365))
      .optional()
      .default('30'),
    ...zodSchemas.pagination,
  }),

  // Schema for parameters with IDs
  params: {
    adId: z.object({
      adId: zodSchemas.objectId,
    }),
    itineraryId: z.object({
      itineraryId: z.string().min(1),
    }),
    adAndItineraryId: z.object({
      adId: zodSchemas.objectId,
      itineraryId: z.string().min(1),
    }),
  },
};
