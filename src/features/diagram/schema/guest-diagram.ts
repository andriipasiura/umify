import { z } from 'zod';

import { diagramContentSchema } from './diagram-content';
import { diagramMetaSchema } from './diagram-meta';

export const DEFAULT_GUEST_TITLE = 'Untitled diagram';

export const guestDiagramSchema = z.object({
  version: z.literal(1),
  title: diagramMetaSchema.shape.title,
  content: diagramContentSchema,
  updatedAt: z.number(),
});

export type GuestDiagram = z.infer<typeof guestDiagramSchema>;
