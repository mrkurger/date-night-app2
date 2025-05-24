/**
 * Common validation schemas using Zod
 */
import { z } from 'zod';
import mongoose from 'mongoose';

export const zodSchemas = {
  // Basic types
  objectId: z.string().refine((val: string) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId format',
  }),

  email: z.string().email(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

  url: z.string().url(),

  // Norwegian specific
  norwegianPhone: z.string().regex(/^(\+47)?[2-9]\d{7}$/, {
    message: 'Must be a valid Norwegian phone number',
  }),

  norwegianPostalCode: z.string().regex(/^\d{4}$/, {
    message: 'Must be a valid Norwegian postal code',
  }),

  // Common objects
  coordinates: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90), // latitude
    ]),
  }),

  pagination: z.object({
    page: z.number().int().positive().optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(10),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional().default('asc'),
  }),

  // Common string validations
  nonEmptyString: z.string().min(1, 'Field cannot be empty'),
  shortString: z.string().max(100, 'Text is too long'),
  mediumString: z.string().max(500, 'Text is too long'),
  longString: z.string().max(2000, 'Text is too long'),

  // Date validation
  date: z.string().datetime(),
  pastDate: z.date().max(new Date(), 'Date cannot be in the future'),
  futureDate: z.date().min(new Date(), 'Date cannot be in the past'),

  // Date range validation
  dateRange: z
    .object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
    })
    .refine(data => new Date(data.endDate) > new Date(data.startDate), {
      message: 'End date must be after start date',
    }),

  // Array validations
  nonEmptyArray: z.array(z.any()).min(1, 'Array cannot be empty'),
  limitedArray: z.array(z.any()).max(100, 'Too many items'),
};
