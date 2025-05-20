import { z } from 'zod';

// Base location type schema
const locationBaseSchema = z.object({
  city: z.string().min(1, 'City is required').trim(),
  county: z.string().min(1, 'County is required').trim(),
  country: z.string().default('Norway').trim(),
  coordinates: z.tuple(
    [
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90), // latitude
    ],
    'Coordinates must be [longitude, latitude]'
  ),
  source: z.enum(['manual', 'nominatim', 'google', 'mapbox', 'imported']).default('manual'),
  population: z.number().optional(),
  timezone: z.string().optional(),
  postalCodes: z.array(z.string()).optional(),
});

// Search query schema
export const searchQuerySchema = z.object({
  query: z.string().min(1, 'Search query is required').trim(),
  limit: z.number().min(1).max(100).default(10).optional(),
});

// Nearby locations query schema
export const nearbyQuerySchema = z.object({
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  maxDistance: z.number().min(1).max(100000).default(10000).optional(),
  limit: z.number().min(1).max(100).default(10).optional(),
});

// Param schema for routes that require an ID
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

// Create location schema
export const createLocationSchema = locationBaseSchema;

// Update location schema - all fields optional
export const updateLocationSchema = locationBaseSchema.partial();

// Export validation middlewares
export const LocationValidation = {
  searchQuery: (data: unknown) => searchQuerySchema.parse(data),
  nearbyQuery: (data: unknown) => nearbyQuerySchema.parse(data),
  idParam: (data: unknown) => idParamSchema.parse(data),
  createLocation: (data: unknown) => createLocationSchema.parse(data),
  updateLocation: (data: unknown) => updateLocationSchema.parse(data),
};
