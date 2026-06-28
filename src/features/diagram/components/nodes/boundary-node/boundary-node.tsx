import { type NodeProps, NodeResizer } from '@xyflow/react';
import { memo } from 'react';

import { NodeInlineLabel } from '@/features/diagram/components/node-inline-label';
import { useInlineLabel } from '@/features/diagram/hooks/use-inline-label';
import { type UmlNode } from '@/features/diagram/types';
import { cn } from '@/lib/utils';

export const BoundaryNode = memo(({ id, data, selected }: NodeProps<UmlNode>) => {
  const { isEditing, onDoubleClick, inputProps } = useInlineLabel(id, data.label);

  return (
    <div
      className={cn(
        'group/node border-foreground relative flex h-full min-h-40 w-full min-w-60 flex-col rounded-sm border-2',
        selected ? 'ring-primary/50 ring-1' : '',
      )}
    >
      <NodeResizer
        minWidth={180}
        minHeight={120}
        isVisible={selected}
        lineClassName="!border-primary"
        handleClassName="!bg-primary !border-primary !size-1.5"
      />

      <div className="w-fit px-2 py-0.5">
        <NodeInlineLabel
          isEditing={isEditing}
          label={data.label}
          onDoubleClick={onDoubleClick}
          inputProps={inputProps}
          displayClassName="text-xs font-semibold"
          inputClassName="w-24 text-xs font-semibold border-b border-primary"
        />
      </div>
    </div>
  );
});
BoundaryNode.displayName = 'BoundaryNode';
