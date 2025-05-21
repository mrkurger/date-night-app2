import { z } from 'zod';
import { BaseModelSchema } from './base.js';

export const UserSchema = BaseModelSchema.extend({
  email: z.string().email(),
  username: z.string().min(3),
  role: z.enum(['user', 'advertiser', 'admin']),
  profile: z.object({
    name: z.string(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
    location: z.string().optional(),
  }),
}).describe('User Model');
