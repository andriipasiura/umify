import { z } from 'zod';

import { UML_EDGE_TYPE, UML_NODE_KINDS, UML_RELATIONS } from '../types';

const position = z.object({ x: z.number(), y: z.number() });

const umlNodeData = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('actor'), label: z.string().max(200) }),
  z.object({ kind: z.literal('usecase'), label: z.string().max(200) }),
  z.object({ kind: z.literal('boundary'), label: z.string().max(200) }),
  z.object({ kind: z.literal('note'), label: z.string().max(1000) }),
]);

const umlNode = z.object({
  id: z.string(),
  type: z.enum(UML_NODE_KINDS),
  position,
  data: umlNodeData,
  width: z.number().optional(),
  height: z.number().optional(),
});

const umlEdge = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.literal(UML_EDGE_TYPE),
  data: z.object({
    relation: z.enum(UML_RELATIONS),
  }),
});

export const diagramContentSchema = z.object({
  version: z.literal(1),
  nodes: z.array(umlNode),
  edges: z.array(umlEdge),
});

export type DiagramContent = z.infer<typeof diagramContentSchema>;

export const EMPTY_DIAGRAM_CONTENT: DiagramContent = {
  version: 1,
  nodes: [],
  edges: [],
};
