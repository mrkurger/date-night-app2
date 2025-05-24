import { z } from 'zod';
import { ValidationUtils } from '../../utils/ValidationUtils';

const PaymentSchemas = {
  createPaymentIntent: z.object({
    amount: z.number().positive().min(1),
    currency: z.enum(['nok', 'usd', 'eur']).optional().default('nok'),
    metadata: z.record(z.any()).optional(),
  }),

  subscription: z.object({
    priceId: z.string().regex(/^price_/),
    paymentMethodId: z.string().regex(/^pm_/),
  }),

  boostAd: z.object({
    adId: ValidationUtils.zodSchemas.objectId,
    paymentMethodId: z.string().regex(/^pm_/),
    days: z.number().int().min(1).max(30).optional(),
  }),

  featureAd: z.object({
    adId: ValidationUtils.zodSchemas.objectId,
    paymentMethodId: z.string().regex(/^pm_/),
  }),

  webhookRequest: z.object({
    stripeSignature: z.string().min(1),
    body: z.any(),
  }),

  paymentMethod: z.object({
    type: z.enum(['card', 'bank_account', 'crypto_address']),
    provider: z.string().min(1),
    isDefault: z.boolean().optional(),
    cardDetails: z
      .object({
        lastFour: z.string().length(4),
        brand: z.string().min(1),
        expiryMonth: z.number().int().min(1).max(12),
        expiryYear: z.number().int().min(2023),
        tokenId: z.string().min(1),
      })
      .optional(),
    bankDetails: z
      .object({
        accountType: z.string().min(1),
        lastFour: z.string().length(4),
        bankName: z.string().min(1),
        country: z.string().length(2),
        currency: z.string().length(3),
        tokenId: z.string().min(1),
      })
      .optional(),
    cryptoDetails: z
      .object({
        currency: z.string().min(1),
        address: z.string().min(1),
        network: z.string().min(1),
        memo: z.string().optional(),
      })
      .optional(),
  }),
};

export default PaymentSchemas;
