import { z } from 'zod';
import { zodSchemas } from '../../utils/validation-utils.js';

export const LocationSchemas = {
  // Schema for location query params
  locationQuery: z.object({
    longitude: z.number().min(-180).max(180),
    latitude: z.number().min(-90).max(90),
    distance: z.number().min(1).max(100000).optional(),
  }),

  // Schema for creating/updating a location
  locationData: z.object({
    name: zodSchemas.shortString,
    description: zodSchemas.longString.optional(),
    address: zodSchemas.shortString,
    city: zodSchemas.shortString,
    county: zodSchemas.shortString,
    coordinates: z.tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90), // latitude
    ]),
    amenities: z.array(z.string()).optional(),
    type: z.enum(['venue', 'landmark', 'restaurant', 'hotel', 'other']).optional(),
    status: z.enum(['active', 'inactive', 'pending']).optional(),
  }),

  // Schema for update params
  updateParams: z.object({
    id: zodSchemas.objectId,
  }),

  // Schema for filtering and pagination
  filterQuery: z.object({
    type: z.enum(['venue', 'landmark', 'restaurant', 'hotel', 'other']).optional(),
    city: zodSchemas.shortString.optional(),
    county: zodSchemas.shortString.optional(),
    status: z.enum(['active', 'inactive', 'pending']).optional(),
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(100).optional(),
  }),
};

export const LocationValidator = {
  validateLocationData: async (data: unknown) => LocationSchemas.locationData.parse(data),
  validateUpdateParams: async (params: unknown) => LocationSchemas.updateParams.parse(params),
  validateLocationQuery: async (query: unknown) => LocationSchemas.locationQuery.parse(query),
  validateFilterQuery: async (query: unknown) => LocationSchemas.filterQuery.parse(query),
};
