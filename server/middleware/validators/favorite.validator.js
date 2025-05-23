import { z } from 'zod';
import { zodSchemas } from '../../utils/validation-utils.js';

const FavoriteSchemas = {
  getFavorites: z
    .object({
      sort: z
        .enum([
          'newest',
          'oldest',
          'price-asc',
          'price-desc',
          'title-asc',
          'title-desc',
          'priority-high',
          'priority-low',
        ])
        .optional(),
      category: z.string().optional(),
      county: z.string().optional(),
      city: z.string().optional(),
      search: z.string().optional(),
      priority: z.enum(['low', 'normal', 'high']).optional(),
      priceMin: z.number().min(0).optional(),
      priceMax: z.number().min(0).optional(),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
      tags: z.array(z.string()).optional(),
    })
    .optional(),

  addBatchFavorites: z.object({
    adIds: z.array(zodSchemas.objectId).min(1).max(50),
  }),

  removeBatchFavorites: z.object({
    adIds: z.array(zodSchemas.objectId).min(1).max(50),
  }),

  updateNotes: z.object({
    notes: z.string().max(1000),
  }),

  updateTags: z.object({
    tags: z.array(z.string().min(1).max(30)).max(20),
  }),

  updatePriority: z.object({
    priority: z.enum(['low', 'normal', 'high']),
  }),
};

export default FavoriteSchemas;
