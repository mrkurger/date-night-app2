import { z } from 'zod';

// Base response schemas
export const ErrorSchema = z
  .object({
    success: z.literal(false),
    error: z.string(),
    message: z.string(),
  })
  .describe('Error Response');

// Base model schemas with common fields
export const BaseModelSchema = z.object({
  _id: z.string().describe('MongoDB ObjectId'),
  createdAt: z.string().datetime().describe('Creation timestamp'),
  updatedAt: z.string().datetime().describe('Last update timestamp'),
});
