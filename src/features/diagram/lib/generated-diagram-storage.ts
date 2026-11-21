import * as z from 'zod';

import { diagramContentSchema } from '@/features/diagram/schema/diagram-content';
import { diagramMetaSchema } from '@/features/diagram/schema/diagram-meta';
import { createStoredItem } from '@/lib/storage';

export const GENERATED_DIAGRAM_STORAGE_KEY = 'umify:generated-diagram';

export const generatedDiagramDraftSchema = z.object({
  title: diagramMetaSchema.shape.title,
  content: diagramContentSchema,
});

export type GeneratedDiagramDraft = z.infer<typeof generatedDiagramDraftSchema>;

const draftItem = createStoredItem(
  'sessionStorage',
  GENERATED_DIAGRAM_STORAGE_KEY,
  generatedDiagramDraftSchema,
);

let memoryDraft: GeneratedDiagramDraft | null = null;

export const readGeneratedDiagram = (): GeneratedDiagramDraft | null =>
  draftItem.read() ?? memoryDraft;

export const writeGeneratedDiagram = (draft: GeneratedDiagramDraft): void => {
  memoryDraft = draft;
  draftItem.write(draft);
};

export const clearGeneratedDiagram = (): void => {
  memoryDraft = null;
  draftItem.clear();
};
