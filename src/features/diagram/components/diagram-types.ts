import { UmlEdge } from './edges/uml-edge';
import { ActorNode } from './nodes/actor-node';
import { BoundaryNode } from './nodes/boundary-node';
import { NoteNode } from './nodes/note-node';
import { UseCaseNode } from './nodes/usecase-node';

export const nodeTypes = {
  actor: ActorNode,
  usecase: UseCaseNode,
  boundary: BoundaryNode,
  note: NoteNode,
} as const;

export const edgeTypes = {
  uml: UmlEdge,
} as const;
