import { z } from 'zod';
import { zodSchemas } from '../../utils/validation-utils.js';

const ReviewSchemas = {
  createReview: z.object({
    advertiserId: zodSchemas.objectId,
    adId: zodSchemas.objectId.optional(),
    rating: z.number().min(1).max(5),
    title: z.string().min(3).max(100),
    content: z.string().min(10).max(2000),
    categories: z.object({
      communication: z.number().min(1).max(5),
      appearance: z.number().min(1).max(5),
      location: z.number().min(1).max(5),
      value: z.number().min(1).max(5),
    }),
    meetingDate: z.string().datetime().optional(),
  }),

  updateReview: z.object({
    rating: z.number().min(1).max(5).optional(),
    title: z.string().min(3).max(100).optional(),
    content: z.string().min(10).max(2000).optional(),
    categories: z
      .object({
        communication: z.number().min(1).max(5),
        appearance: z.number().min(1).max(5),
        location: z.number().min(1).max(5),
        value: z.number().min(1).max(5),
      })
      .optional(),
    meetingDate: z.string().datetime().optional(),
  }),

  reportReview: z.object({
    reason: z.enum(['spam', 'inappropriate', 'harassment', 'fake', 'other']),
    details: z.string().min(10).max(500),
  }),

  reviewResponse: z.object({
    content: z.string().min(10).max(1000),
  }),

  moderationNote: z.object({
    reason: z.string().min(10).max(500),
  }),
};

export default ReviewSchemas;
