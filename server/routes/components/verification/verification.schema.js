import { z } from 'zod';
import { zodSchemas } from '../../../utils/validation-utils.js';

/**
 * Schemas for verification routes
 */
export const verificationSchemas = {
  /**
   * Schema for identity verification
   */
  identityVerification: z.object({
    body: z.object({
      documentType: z.enum(['passport', 'nationalId', 'driversLicense']),
      documentNumber: z.string().min(4).max(30),
      firstName: zodSchemas.shortString,
      lastName: zodSchemas.shortString,
      dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      countryCode: z.string().length(2),
    }),
  }),

  /**
   * Schema for address verification
   */
  addressVerification: z.object({
    body: z.object({
      streetAddress: zodSchemas.shortString,
      city: zodSchemas.shortString,
      postalCode: z.string().min(3).max(12),
      countryCode: z.string().length(2),
      stateOrProvince: z.string().optional(),
    }),
  }),

  /**
   * Schema for phone verification
   */
  phoneVerification: z.object({
    body: z.object({
      phoneNumber: z.string().min(8).max(15),
      countryCode: z.string().length(2),
      verificationCode: z.string().length(6).optional(),
    }),
  }),

  /**
   * Schema for email verification
   */
  emailVerification: z.object({
    body: z.object({
      email: z.string().email(),
      verificationCode: z.string().length(6).optional(),
    }),
  }),
};
