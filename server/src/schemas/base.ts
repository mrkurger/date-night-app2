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
  createdAt: z
    .string()
    .regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
    .describe('Creation timestamp'),
  updatedAt: z
    .string()
    .regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
    .describe('Last update timestamp'),
});
