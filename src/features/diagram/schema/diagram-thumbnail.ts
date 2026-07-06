import { z } from 'zod';

export const THUMBNAIL_MAX_LENGTH = 262_144;

export const diagramThumbnailSchema = z
  .string()
  .regex(/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/)
  .max(THUMBNAIL_MAX_LENGTH)
  .nullable();

export type DiagramThumbnail = z.infer<typeof diagramThumbnailSchema>;
