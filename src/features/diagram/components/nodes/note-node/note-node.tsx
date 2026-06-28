import { type NodeProps, NodeResizer } from '@xyflow/react';
import { memo } from 'react';

import { NodeInlineLabel } from '@/features/diagram/components/node-inline-label';
import { useInlineLabel } from '@/features/diagram/hooks/use-inline-label';
import { type UmlNode } from '@/features/diagram/types';
import { cn } from '@/lib/utils';

export const NoteNode = memo(({ id, data, selected }: NodeProps<UmlNode>) => {
  const { isEditing, onDoubleClick, inputProps } = useInlineLabel(id, data.label);

  return (
    <div
      className={cn(
        'group/node bg-card relative min-w-24 rounded-sm p-1',
        selected ? 'ring-primary/50 ring-1' : '',
      )}
    >
      <NodeResizer
        minWidth={100}
        minHeight={48}
        isVisible={selected}
        lineClassName="!border-primary"
        handleClassName="!bg-primary !border-primary !size-1.5"
      />

      <NodeInlineLabel
        isEditing={isEditing}
        label={data.label}
        onDoubleClick={onDoubleClick}
        inputProps={inputProps}
        tag="p"
        displayClassName="w-full text-sm break-words"
        inputClassName="w-full text-sm resize-none"
      />
    </div>
  );
});
NoteNode.displayName = 'NoteNode';
