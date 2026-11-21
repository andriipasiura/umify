import * as z from 'zod';

import { diagramContentSchema } from '../schema/diagram-content';

export const DESCRIPTION_MIN = 20;
export const DESCRIPTION_MAX = 2000;

export const generateRequestSchema = z.object({
  description: z
    .string({ error: 'Description is required.' })
    .trim()
    .min(DESCRIPTION_MIN, `Description must be at least ${DESCRIPTION_MIN} characters.`)
    .max(DESCRIPTION_MAX, `Description must be at most ${DESCRIPTION_MAX} characters.`),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export const generateSuccessSchema = z.object({
  title: z.string(),
  content: diagramContentSchema,
});

export type GenerateSuccess = z.infer<typeof generateSuccessSchema>;

export const generateErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.array(z.string()).optional(),
});
