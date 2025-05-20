/**
 * Validation middleware for safety-related routes
 */
import { z } from 'zod';
import { zodSchemas } from '../../utils/validation-utils';

export const SafetySchemas = {
  // Schema for check-in data
  checkinData: z.object({
    meetingWith: zodSchemas.objectId.optional(),
    clientName: zodSchemas.shortString.optional(),
    clientContact: zodSchemas.shortString.optional(),
    location: z.object({
      type: z.literal('Point'),
      coordinates: zodSchemas.coordinates,
      address: zodSchemas.shortString.optional(),
      locationName: zodSchemas.shortString.optional(),
      city: zodSchemas.shortString.optional(),
      county: zodSchemas.shortString.optional(),
    }),
    startTime: z
      .string()
      .datetime()
      .refine(value => new Date(value) >= new Date(), {
        message: 'Start time cannot be in the past',
      }),
    expectedEndTime: z
      .string()
      .datetime()
      .refine(
        (value, ctx) => {
          const startTime = ctx.parent?.startTime ? new Date(ctx.parent.startTime) : null;
          return startTime ? new Date(value) > startTime : true;
        },
        {
          message: 'End time must be after start time',
        }
      ),
    safetyNotes: zodSchemas.longString.optional(),
    notifyEmergencyContact: z.boolean().optional(),
    trustedContacts: z
      .array(
        z.object({
          name: zodSchemas.shortString,
          phone: zodSchemas.norwegianPhone.optional(),
          email: zodSchemas.email.optional(),
          relationship: zodSchemas.shortString.optional(),
        })
      )
      .optional(),
  }),

  // Schema for check-in response
  checkinResponse: z.object({
    response: z.enum(['safe', 'need_more_time', 'distress']),
    coordinates: zodSchemas.coordinates.optional(),
  }),

  // Schema for safety code verification
  safetyCode: z.object({
    code: zodSchemas.nonEmptyString,
  }),

  // Schema for emergency contact
  emergencyContact: z.object({
    name: zodSchemas.shortString.max(100),
    phone: zodSchemas.norwegianPhone.optional(),
    email: zodSchemas.email.optional(),
    relationship: zodSchemas.shortString.optional(),
  }),

  // Schema for safety settings
  safetySettings: z.object({
    defaultCheckInMethod: z.enum(['app', 'sms', 'email']).optional(),
    defaultAutoCheckInSettings: z
      .object({
        enabled: z.boolean(),
        interval: z.number().int().min(5).max(120).optional(),
        method: z.enum(['app', 'sms', 'email']).optional(),
      })
      .optional(),
    emergencyContacts: z
      .array(
        z.object({
          email: zodSchemas.email,
          relationship: zodSchemas.shortString.optional(),
        })
      )
      .optional(),
  }),

  // Schema for checkin ID parameter
  checkinIdParam: z.object({
    checkinId: zodSchemas.objectId,
  }),

  // Schema for contact ID parameter
  contactIdParam: z.object({
    contactId: zodSchemas.objectId,
  }),
};
