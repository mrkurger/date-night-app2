import { z } from 'zod';
import { ValidationUtils } from '../../utils/ValidationUtils';

const ReviewSchemas = {
  createReview: z.object({
    advertiserId: ValidationUtils.zodSchemas.objectId,
    adId: ValidationUtils.zodSchemas.objectId.optional(),
    rating: z.number().min(1).max(5),
    title: z.string().min(1).max(100),
    content: z.string().min(1).max(1000),
    categories: z
      .object({
        communication: z.number().min(1).max(5).optional(),
        appearance: z.number().min(1).max(5).optional(),
        location: z.number().min(1).max(5).optional(),
        value: z.number().min(1).max(5).optional(),
      })
      .optional(),
    meetingDate: ValidationUtils.zodSchemas.date.optional(),
  }),

  updateReview: z.object({
    rating: z.number().min(1).max(5).optional(),
    title: z.string().min(1).max(100).optional(),
    content: z.string().min(1).max(1000).optional(),
    categories: z
      .object({
        communication: z.number().min(1).max(5).optional(),
        appearance: z.number().min(1).max(5).optional(),
        location: z.number().min(1).max(5).optional(),
        value: z.number().min(1).max(5).optional(),
      })
      .optional(),
  }),

  reviewResponse: z.object({
    content: z.string().min(1).max(1000),
  }),

  reportReview: z.object({
    reason: z.string().min(1).max(500),
  }),

  moderationNote: z.object({
    moderationNotes: z.string().min(1).max(1000),
  }),
};

export default ReviewSchemas;
