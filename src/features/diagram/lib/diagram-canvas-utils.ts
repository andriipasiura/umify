import { type IsValidConnection } from '@xyflow/react';

import { useDiagramStore } from '../store/diagram-store';
import { isValidUmlConnection } from './uml-rules';

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
