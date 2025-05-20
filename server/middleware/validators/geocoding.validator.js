import { z } from 'zod';

const GeocodeSchemas = {
  forwardGeocode: z.object({
    address: z.string().min(3).max(200),
    city: z.string().min(2).max(100),
    county: z.string().min(2).max(100),
    country: z.string().default('Norway').optional(),
  }),

  reverseGeocode: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),

  getCacheStats: z.object({}), // No parameters needed

  clearCache: z.object({}), // No parameters needed
};

export default GeocodeSchemas;
