import { type Visibility } from '@prisma/client';
import { type Edge, type Node } from '@xyflow/react';

export type DiagramCardData = {
  id: string;
  title: string;
  visibility: Visibility;
  category: string | null;
  tags: string[];
  isFavorite: boolean;
  updatedAt: Date;
};

export const UML_NODE_KINDS = ['actor', 'usecase', 'boundary', 'note'] as const;
export type UmlNodeKind = (typeof UML_NODE_KINDS)[number];
export const [KIND_ACTOR, KIND_USECASE, KIND_BOUNDARY, KIND_NOTE] = UML_NODE_KINDS;

export const UML_EDGE_TYPE = 'uml' as const;

export const UML_RELATIONS = ['association', 'include', 'extend', 'generalization'] as const;
export type UmlRelation = (typeof UML_RELATIONS)[number];
export const [RELATION_ASSOCIATION, RELATION_INCLUDE, RELATION_EXTEND, RELATION_GENERALIZATION] =
  UML_RELATIONS;

export type ActorData = { kind: 'actor'; label: string };
export type UseCaseData = { kind: 'usecase'; label: string };
export type BoundaryData = { kind: 'boundary'; label: string };
export type NoteData = { kind: 'note'; label: string };

export type UmlNodeData = ActorData | UseCaseData | BoundaryData | NoteData;
export type UmlNode = Node<UmlNodeData, UmlNodeKind>;

export type UmlEdgeData = { relation: UmlRelation };
export type UmlEdge = Edge<UmlEdgeData>;
