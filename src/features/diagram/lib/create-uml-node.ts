import { createId } from '@/lib/utils';

import { type UmlNode, type UmlNodeKind } from '../types';

const DEFAULT_LABEL: Record<UmlNodeKind, string> = {
  actor: 'Actor',
  usecase: 'Use Case',
  boundary: 'System',
  note: 'Note',
};

const DEFAULT_SIZE: Partial<Record<UmlNodeKind, { width: number; height: number }>> = {
  boundary: { width: 240, height: 160 },
  note: { width: 160, height: 80 },
};

export const createUmlNode = (kind: UmlNodeKind, position: { x: number; y: number }): UmlNode => {
  const size = DEFAULT_SIZE[kind];
  return {
    id: createId(),
    type: kind,
    position,
    data: { kind, label: DEFAULT_LABEL[kind] },
    ...size,
  } as UmlNode;
};
