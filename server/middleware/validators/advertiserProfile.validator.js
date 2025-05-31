import { z } from 'zod';
// import { zodSchemas } from '../../utils/validation-utils.js'; // Unused

const AdvertiserProfileSchemas = {
  createProfile: z.object({
    displayName: z.string().min(2).max(50),
    bio: z.string().min(10).max(2000),
    contactPreferences: z
      .object({
        email: z.boolean().optional(),
        phone: z.boolean().optional(),
        chat: z.boolean().optional(),
      })
      .optional(),
    availability: z
      .object({
        monday: z
          .array(
            z.object({
              start: z.string(),
              end: z.string(),
            })
          )
          .optional(),
        tuesday: z
          .array(
            z.object({
              start: z.string(),
              end: z.string(),
            })
          )
          .optional(),
        wednesday: z
          .array(
            z.object({
              start: z.string(),
              end: z.string(),
            })
          )
          .optional(),
        thursday: z
          .array(
            z.object({
              start: z.string(),
              end: z.string(),
            })
          )
          .optional(),
        friday: z
          .array(
            z.object({
              start: z.string(),
              end: z.string(),
            })
          )
          .optional(),
        saturday: z
          .array(
            z.object({
              start: z.string(),
              end: z.string(),
            })
          )
          .optional(),
        sunday: z
          .array(
            z.object({
              start: z.string(),
              end: z.string(),
            })
          )
          .optional(),
      })
      .optional(),
    services: z.array(z.string()).optional(),
    rates: z
      .object({
        hourly: z.number().min(0).optional(),
        twoHours: z.number().min(0).optional(),
        overnight: z.number().min(0).optional(),
        weekend: z.number().min(0).optional(),
      })
      .optional(),
    languages: z.array(z.string()).optional(),
    socialMedia: z
      .object({
        instagram: z.string().url().optional(),
        twitter: z.string().url().optional(),
        onlyfans: z.string().url().optional(),
      })
      .optional(),
  }),

  updateProfile: z.object({
    displayName: z.string().min(2).max(50).optional(),
    bio: z.string().min(10).max(2000).optional(),
    contactPreferences: z
      .object({
        email: z.boolean().optional(),
        phone: z.boolean().optional(),
        chat: z.boolean().optional(),
      })
      .optional(),
    availability: z
      .object({
        monday: z
          .array(
            z.object({
              start: z.string(),
              end: z.string(),
            })
          )
          .optional(),
        tuesday: z
          .array(
            z.object({
              start: z.string(),
              end: z.string(),
            })
          )
          .optional(),
        wednesday: z
          .array(
            z.object({
              start: z.string(),
              end: z.string(),
            })
          )
          .optional(),
        thursday: z
          .array(
            z.object({
              start: z.string(),
              end: z.string(),
            })
          )
          .optional(),
        friday: z
          .array(
            z.object({
              start: z.string(),
              end: z.string(),
            })
          )
          .optional(),
        saturday: z
          .array(
            z.object({
              start: z.string(),
              end: z.string(),
            })
          )
          .optional(),
        sunday: z
          .array(
            z.object({
              start: z.string(),
              end: z.string(),
            })
          )
          .optional(),
      })
      .optional(),
    services: z.array(z.string()).optional(),
    rates: z
      .object({
        hourly: z.number().min(0).optional(),
        twoHours: z.number().min(0).optional(),
        overnight: z.number().min(0).optional(),
        weekend: z.number().min(0).optional(),
      })
      .optional(),
    languages: z.array(z.string()).optional(),
    socialMedia: z
      .object({
        instagram: z.string().url().optional(),
        twitter: z.string().url().optional(),
        onlyfans: z.string().url().optional(),
      })
      .optional(),
  }),
};

export default AdvertiserProfileSchemas;
