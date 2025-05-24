import { z } from 'zod';
import { zodSchemas } from '../../utils/validation-utils.js';

const AppointmentSchemas = {
  createAppointment: z.object({
    advertiserProfileId: zodSchemas.objectId,
    listingId: zodSchemas.objectId.optional(),
    date: z.string().datetime(),
    duration: z.number().min(30).max(1440), // Duration in minutes (min 30min, max 24h)
    location: z.object({
      type: z.enum(['incall', 'outcall']),
      address: z.string().optional(),
      city: z.string(),
      county: z.string(),
    }),
    notes: z.string().max(500).optional(),
    preferences: z
      .object({
        service: z.string().optional(),
        specialRequests: z.string().optional(),
      })
      .optional(),
  }),

  updateAppointment: z.object({
    status: z.enum(['confirmed', 'cancelled', 'completed', 'no-show']).optional(),
    date: z.string().datetime().optional(),
    duration: z.number().min(30).max(1440).optional(),
    location: z
      .object({
        type: z.enum(['incall', 'outcall']),
        address: z.string().optional(),
        city: z.string(),
        county: z.string(),
      })
      .optional(),
    notes: z.string().max(500).optional(),
    preferences: z
      .object({
        service: z.string().optional(),
        specialRequests: z.string().optional(),
      })
      .optional(),
  }),
};

export default AppointmentSchemas;
