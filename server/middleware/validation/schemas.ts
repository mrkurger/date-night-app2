import { z } from 'zod';
import mongoose from 'mongoose';

/**
 * Common validation schemas that can be reused across the application
 */
export const commonSchemas = {
  // Basic types
  objectId: z.string().refine(val => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId format',
  }),

  email: z.string().email('Invalid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

  phone: z.string().regex(/^(\+47)?[2-9]\d{7}$/, 'Invalid phone number format'),

  url: z.string().url('Invalid URL format'),

  // Norwegian specific
  norwegianPhone: z.string().regex(/^(\+47)?[2-9]\d{7}$/, 'Invalid Norwegian phone number'),

  norwegianPostalCode: z.string().regex(/^\d{4}$/, 'Invalid Norwegian postal code'),

  // Common objects
  pagination: z.object({
    page: z.number().int().positive().optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(10),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional().default('asc'),
  }),

  coordinates: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90), // latitude
    ]),
  }),

  // Common strings
  nonEmptyString: z.string().min(1, 'Field cannot be empty'),
  shortString: z.string().max(100, 'Text is too long'),
  mediumString: z.string().max(500, 'Text is too long'),
  longString: z.string().max(2000, 'Text is too long'),

  // Date validation
  pastDate: z.date().max(new Date(), 'Date cannot be in the future'),
  futureDate: z.date().min(new Date(), 'Date cannot be in the past'),

  dateRange: z
    .object({
      startDate: z.date(),
      endDate: z.date(),
    })
    .refine(data => data.endDate > data.startDate, {
      message: 'End date must be after start date',
      path: ['endDate'],
    }),

  // File validations
  imageFile: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string().regex(/^image\/(jpeg|png|gif)$/, 'File must be an image'),
    size: z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB'),
  }),

  // Common arrays
  nonEmptyArray: z.array(z.any()).min(1, 'Array cannot be empty'),
  limitedArray: z.array(z.any()).max(100, 'Too many items'),
};
