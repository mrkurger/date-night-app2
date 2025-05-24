/**
 * Validation middleware for payment-related routes
 */
import { z } from 'zod';
import { zodSchemas } from '../../utils/validation-utils.ts';

export const PaymentSchemas = {
  // Schema for payment intent creation
  createPaymentIntent: z.object({
    amount: z.number().int().positive('Amount must be greater than 0'),
    currency: z.enum(['nok', 'usd', 'eur']).optional().default('nok'),
    metadata: z.record(z.string()).optional(),
  }),

  // Schema for subscription
  subscription: z.object({
    planId: zodSchemas.objectId,
    paymentMethodId: zodSchemas.objectId.optional(),
    metadata: z.record(z.string()).optional(),
  }),

  // Schema for ad boost
  boostAd: z.object({
    adId: zodSchemas.objectId,
    duration: z.number().int().min(1).max(30),
    boostLevel: z.enum(['basic', 'premium', 'ultra']),
    paymentMethodId: zodSchemas.objectId.optional(),
  }),

  // Schema for ad feature
  featureAd: z.object({
    adId: zodSchemas.objectId,
    duration: z.number().int().min(1).max(90),
    position: z.enum(['top', 'sidebar', 'homepage']).optional(),
    paymentMethodId: zodSchemas.objectId.optional(),
  }),

  // Schema for webhook request
  webhookRequest: z.object({
    type: z.string(),
    data: z.object({}).passthrough(), // Allow any data in webhook payload
  }),
};
