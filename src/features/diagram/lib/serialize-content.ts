import type { DiagramContent } from '@/features/diagram/schema/diagram-content';
import { UML_EDGE_TYPE, type UmlEdge, type UmlNode } from '@/features/diagram/types';

const stripNode = (node: UmlNode): DiagramContent['nodes'][number] => ({
  id: node.id,
  type: node.type,
  position: node.position,
  data: node.data,
  ...(node.width !== undefined && { width: node.width }),
  ...(node.height !== undefined && { height: node.height }),
});

const stripEdge = (edge: UmlEdge): DiagramContent['edges'][number] => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  sourceHandle: edge.sourceHandle ?? null,
  targetHandle: edge.targetHandle ?? null,
  type: UML_EDGE_TYPE,
  data: edge.data!,
});

export const toDiagramContent = (nodes: UmlNode[], edges: UmlEdge[]): DiagramContent => ({
  version: 1,
  nodes: nodes.map(stripNode),
  edges: edges.map(stripEdge),
});
