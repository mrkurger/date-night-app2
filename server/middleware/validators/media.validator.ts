import { z } from 'zod';
import { zodSchemas } from '../../utils/validation-utils.js';

export const MediaSchemas = {
  // Schema for media upload parameters
  uploadParams: z.object({
    adId: zodSchemas.objectId,
  }),

  // Schema for file metadata
  fileMetadata: z
    .object({
      originalname: z.string(),
      mimetype: z.string(),
      size: z.number().int().positive(),
      buffer: z.instanceof(Buffer),
    })
    .optional(),

  // Schema for media update
  mediaUpdate: z.object({
    title: zodSchemas.shortString.optional(),
    description: zodSchemas.longString.optional(),
    tags: z.array(z.string()).optional(),
    isPublic: z.boolean().optional(),
  }),

  // Schema for media ID parameter
  mediaIdParam: z.object({
    mediaId: zodSchemas.objectId,
  }),
};
