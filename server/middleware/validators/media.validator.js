import { z } from 'zod';
import { zodSchemas } from '../../utils/validation-utils.ts';

const MediaSchemas = {
  uploadMedia: z.object({
    adId: zodSchemas.objectId,
    type: z.enum(['image', 'video']),
    file: z.any(), // Handled by multer
    description: z.string().min(3).max(200).optional(),
    isPrivate: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),

  deleteMedia: z.object({
    adId: zodSchemas.objectId,
    mediaId: zodSchemas.objectId,
  }),

  moderateMedia: z.object({
    adId: zodSchemas.objectId,
    mediaId: zodSchemas.objectId,
    status: z.enum(['approved', 'rejected']),
    notes: z.string().min(10).max(500).optional(),
  }),

  setFeaturedMedia: z.object({
    adId: zodSchemas.objectId,
    mediaId: zodSchemas.objectId,
  }),
};

export default MediaSchemas;
