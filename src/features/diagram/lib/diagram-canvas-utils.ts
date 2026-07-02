import { type IsValidConnection } from '@xyflow/react';

import { useDiagramStore } from '../store/diagram-store';
import { type UmlNode } from '../types';
import { isValidUmlConnection } from './uml-rules';

export const layerBoundariesFirst = (nodes: UmlNode[]): UmlNode[] =>
  [...nodes].sort((a, b) => (a.data.kind === 'boundary' ? -1 : b.data.kind === 'boundary' ? 1 : 0));

export const isValidFlowConnection: IsValidConnection = (c) => {
  const nodes = useDiagramStore.getState().nodes;
  return isValidUmlConnection(
    {
      source: c.source,
      target: c.target,
      sourceHandle: c.sourceHandle ?? null,
      targetHandle: c.targetHandle ?? null,
    },
    nodes,
  );
};
