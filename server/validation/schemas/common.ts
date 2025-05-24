import { z } from 'zod';
import mongoose from 'mongoose';

/**
 * Common validation schemas that can be reused across the application
 */
export const commonSchemas = {
  // Basic field types
  id: z.string().refine(val => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ID format',
  }),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(/^[a-zA-ZæøåÆØÅ\s-]+$/, 'Name can only contain letters, spaces and hyphens'),
  norwegianPhone: z
    .string()
    .regex(/^(\+47|0047)?[2-9]\d{7}$/, 'Must be a valid Norwegian phone number'),
  norwegianPostalCode: z.string().regex(/^\d{4}$/, 'Must be a valid Norwegian postal code'),

  // URLs and paths
  secureUrl: z.string().url('Must be a valid URL').startsWith('https://', 'URL must use HTTPS'),
  filePath: z.string().regex(/^[a-zA-Z0-9-_/]+\.[a-zA-Z0-9]+$/, 'Invalid file path format'),

  // Common objects
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  dateRange: z
    .object({
      startDate: z.date(),
      endDate: z.date(),
    })
    .refine(data => data.endDate > data.startDate, {
      message: 'End date must be after start date',
    }),

  // Common arrays
  tags: z.array(z.string().min(1).max(50)).max(10, 'Maximum 10 tags allowed'),

  // Common request parameters
  pagination: z.object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().min(1).max(100).optional(),
  }),

  // Common metadata
  metadata: z
    .object({
      createdAt: z.date(),
      updatedAt: z.date(),
      version: z.number().int().positive(),
    })
    .partial(),
};
