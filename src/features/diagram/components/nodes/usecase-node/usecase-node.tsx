import { type NodeProps } from '@xyflow/react';
import { memo } from 'react';

import { NodeInlineLabel } from '@/features/diagram/components/node-inline-label';
import { NodeHandles } from '@/features/diagram/components/nodes/node-handles';
import { useInlineLabel } from '@/features/diagram/hooks/use-inline-label';
import { type UmlNode } from '@/features/diagram/types';
import { cn } from '@/lib/utils';

export const UseCaseNode = memo(({ id, data, selected }: NodeProps<UmlNode>) => {
  const { isEditing, onDoubleClick, inputProps } = useInlineLabel(id, data.label);

  return (
    <div
      className={cn(
        'group/node border-foreground relative flex h-14 w-36 items-center justify-center rounded-[50%] border-2 px-6 py-3',
        selected ? 'ring-primary/50 ring-1' : '',
      )}
    >
      <NodeInlineLabel
        isEditing={isEditing}
        label={data.label}
        onDoubleClick={onDoubleClick}
        inputProps={inputProps}
        displayClassName="max-w-32 text-center text-xs font-medium break-words"
        inputClassName="w-32 text-center text-xs font-medium border-b border-primary"
      />

      <NodeHandles selected={selected} />
    </div>
  );
});
UseCaseNode.displayName = 'UseCaseNode';
