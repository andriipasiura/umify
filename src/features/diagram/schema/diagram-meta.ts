import { z } from 'zod';

export const diagramMetaSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120, 'Max 120 characters'),
  category: z.string().trim().max(60, 'Max 60 characters'),
  tags: z.array(z.string().trim().min(1)).max(20, 'Max 20 tags'),
  visibility: z.enum(['public', 'private']),
});

export type DiagramMetaInput = z.infer<typeof diagramMetaSchema>;
