import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getSmoothStepPath,
  MarkerType,
} from '@xyflow/react';
import { memo } from 'react';

import { type UmlEdge as UmlEdgeType, type UmlRelation } from '@/features/diagram/types';

const RELATION_LABEL: Record<UmlRelation, string> = {
  association: '',
  include: '«include»',
  extend: '«extend»',
  generalization: '',
};

const DASHED: Record<UmlRelation, boolean> = {
  association: false,
  include: true,
  extend: true,
  generalization: false,
};

const MARKER_END: Record<UmlRelation, string> = {
  association: MarkerType.Arrow,
  include: MarkerType.ArrowClosed,
  extend: MarkerType.ArrowClosed,
  generalization: MarkerType.ArrowClosed,
};

export const UmlEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
  }: EdgeProps<UmlEdgeType>) => {
    const [path, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    });

    const relation = data?.relation ?? 'association';
    const label = RELATION_LABEL[relation];

    return (
      <>
        <BaseEdge
          id={id}
          path={path}
          markerEnd={`url(#${MARKER_END[relation]})`}
          style={{
            strokeDasharray: DASHED[relation] ? '6 4' : undefined,
            stroke: selected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
            strokeWidth: selected ? 2 : 1.5,
          }}
        />
        {label && (
          <EdgeLabelRenderer>
            <div
              className="nodrag nopan bg-background text-muted-foreground absolute rounded px-1 text-xs"
              style={{
                transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                pointerEvents: 'all',
              }}
            >
              {label}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  },
);
UmlEdge.displayName = 'UmlEdge';
