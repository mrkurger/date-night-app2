import { z } from 'zod';
import { zodSchemas } from '../../utils/validation-utils.js';

export const verificationSchemas = {
  // Identity verification schema
  identityVerification: z.object({
    documentType: z.enum(['PASSPORT', 'DRIVERS_LICENSE', 'NATIONAL_ID']),
    documentNumber: z.string().min(5).max(50),
    dateOfBirth: zodSchemas.date,
    documentExpiry: zodSchemas.date,
    documentImage: z.string().url(),
  }),

  // Phone verification schemas
  phoneVerification: z.object({
    phone: zodSchemas.norwegianPhone,
    countryCode: z.string().default('+47'),
  }),

  phoneVerificationCode: z.object({
    phone: zodSchemas.norwegianPhone,
    code: z.string().length(6).regex(/^\d+$/, 'Code must be 6 digits'),
  }),

  // Email verification schemas
  emailVerification: z.object({
    email: zodSchemas.email,
  }),

  emailVerificationCode: z.object({
    email: zodSchemas.email,
    code: z.string().length(6).regex(/^\d+$/, 'Code must be 6 digits'),
  }),

  // Photo verification schema
  photoVerification: z.object({
    selfieImage: z.string().url(),
    pose: z.enum(['SMILE', 'NEUTRAL', 'LOOKING_LEFT', 'LOOKING_RIGHT']).optional(),
  }),
};
