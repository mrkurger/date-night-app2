import { z } from 'zod';
import { BaseModelSchema } from './base.js';

export const AdSchema = BaseModelSchema.extend({
  title: z.string().min(5).max(100),
  description: z.string().min(20),
  contact: z.string(),
  location: z.string(),
  datePosted: z.string().datetime(),
  lastUpdated: z.string().datetime(),
  coordinates: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  advertiser: z.string().describe('Reference to User model'),
  profileImage: z.string().url(),
  county: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  media: z.array(
    z.object({
      url: z.string().url(),
      type: z.enum(['image', 'video']),
      thumbnail: z.string().url(),
      isApproved: z.boolean(),
      moderationStatus: z.enum(['pending', 'approved', 'rejected']),
      moderationNotes: z.string().optional(),
      uploadDate: z.string().datetime(),
    })
  ),
  status: z.enum(['draft', 'pending', 'active', 'rejected', 'inactive']),
  viewCount: z.number().int().nonnegative(),
  likeCount: z.number().int().nonnegative(),
  swipeData: z.object({
    right: z.number().int().nonnegative(),
    left: z.number().int().nonnegative(),
  }),
  ageRestricted: z.boolean(),
  privacySettings: z.object({
    showLocation: z.boolean(),
    showContact: z.boolean(),
  }),
}).describe('Advertisement Model');
