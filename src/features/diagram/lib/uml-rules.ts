import { type Connection } from '@xyflow/react';

import {
  KIND_ACTOR,
  KIND_USECASE,
  RELATION_ASSOCIATION,
  RELATION_EXTEND,
  RELATION_GENERALIZATION,
  RELATION_INCLUDE,
  type UmlNode,
  type UmlRelation,
} from '../types';

const kindOf = (id: string | null, nodes: UmlNode[]) =>
  nodes.find((n) => n.id === id)?.data.kind ?? null;

const USECASE_PAIR_RELATIONS = new Set<UmlRelation>([RELATION_INCLUDE, RELATION_EXTEND]);

export const resolveRelation = (
  c: Connection,
  nodes: UmlNode[],
  preferredRelation?: UmlRelation,
): UmlRelation | null => {
  if (!c.source || !c.target || c.source === c.target) return null;

  const a = kindOf(c.source, nodes);
  const b = kindOf(c.target, nodes);
  if (!a || !b) return null;

  if ((a === KIND_ACTOR && b === KIND_USECASE) || (a === KIND_USECASE && b === KIND_ACTOR))
    return RELATION_ASSOCIATION;

  if (a === KIND_USECASE && b === KIND_USECASE) {
    if (preferredRelation && USECASE_PAIR_RELATIONS.has(preferredRelation))
      return preferredRelation;
    return RELATION_INCLUDE;
  }

  if (a === KIND_ACTOR && b === KIND_ACTOR) return RELATION_GENERALIZATION;

  return null;
};

export const isValidUmlConnection = (c: Connection, nodes: UmlNode[]): boolean =>
  resolveRelation(c, nodes) !== null;
