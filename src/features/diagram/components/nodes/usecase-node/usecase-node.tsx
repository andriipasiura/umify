import { Handle, type NodeProps, Position } from '@xyflow/react';
import { memo } from 'react';

import { NodeInlineLabel } from '@/features/diagram/components/node-inline-label';
import { useInlineLabel } from '@/features/diagram/hooks/use-inline-label';
import { type UmlNode } from '@/features/diagram/types';
import { cn } from '@/lib/utils';

const HANDLE_CLASS =
  '!size-1.5 !bg-primary !border-primary opacity-0 group-hover/node:opacity-100 transition-opacity';

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

      <Handle type="source" position={Position.Top} id="top" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Right} id="right" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Left} id="left" className={HANDLE_CLASS} />
    </div>
  );
});
UseCaseNode.displayName = 'UseCaseNode';
