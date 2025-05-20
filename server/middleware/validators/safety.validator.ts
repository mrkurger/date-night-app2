import { z } from 'zod';
import { zodSchemas } from '../../utils/validation-utils';

// Base schemas
const coordinates = z.tuple([
  z.number().min(-180).max(180), // longitude
  z.number().min(-90).max(90), // latitude
]);

const location = z.object({
  type: z.literal('Point'),
  coordinates,
  address: zodSchemas.shortString.optional(),
  locationName: zodSchemas.shortString.optional(),
  city: zodSchemas.shortString.optional(),
  county: zodSchemas.shortString.optional(),
});

const trustedContact = z.object({
  name: zodSchemas.shortString,
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  email: zodSchemas.email.optional(),
  relationship: zodSchemas.shortString.optional(),
});

const autoCheckInSettings = z.object({
  enabled: z.boolean(),
  interval: z.number().min(5).max(120).optional(), // minutes
  method: z.enum(['app', 'sms', 'email']).optional(),
});

export const safetySchemas = {
  /**
   * Schema for check-in creation/update
   */
  checkinData: z
    .object({
      meetingWith: zodSchemas.objectId.optional(),
      clientName: zodSchemas.shortString.optional(),
      clientContact: zodSchemas.shortString.optional(),
      location,
      startTime: z.string().datetime(),
      expectedEndTime: z.string().datetime(),
      safetyNotes: zodSchemas.longString.optional(),
      notifyEmergencyContact: z.boolean().optional(),
      trustedContacts: z.array(trustedContact).optional(),
    })
    .superRefine((data, ctx) => {
      // Validate startTime is not in the past
      const startTime = new Date(data.startTime);
      if (startTime < new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Start time cannot be in the past',
          path: ['startTime'],
        });
      }

      // Validate expectedEndTime is after startTime
      const endTime = new Date(data.expectedEndTime);
      if (endTime <= startTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End time must be after start time',
          path: ['expectedEndTime'],
        });
      }
    }),

  /**
   * Schema for check-in response
   */
  checkinResponse: z.object({
    response: z.enum(['safe', 'need_more_time', 'distress']),
    coordinates: coordinates.optional(),
  }),

  /**
   * Schema for safety code
   */
  safetyCode: z.object({
    safetyCode: zodSchemas.nonEmptyString,
  }),

  /**
   * Schema for emergency contact
   */
  emergencyContact: z.object({
    name: zodSchemas.nonEmptyString.max(100, 'Contact name must be less than 100 characters'),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
      .optional(),
    email: zodSchemas.email.optional(),
    relationship: zodSchemas.shortString.optional(),
  }),

  /**
   * Schema for safety settings
   */
  safetySettings: z.object({
    defaultCheckInMethod: z.enum(['app', 'sms', 'email']).optional(),
    defaultAutoCheckInSettings: autoCheckInSettings.optional(),
    emergencyContacts: z
      .array(
        z.object({
          email: zodSchemas.email,
          relationship: zodSchemas.shortString.optional(),
        })
      )
      .optional(),
  }),
};
