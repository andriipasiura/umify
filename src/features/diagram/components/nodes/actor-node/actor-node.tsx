import { Handle, type NodeProps, Position } from '@xyflow/react';
import { memo } from 'react';

import { NodeInlineLabel } from '@/features/diagram/components/node-inline-label';
import { useInlineLabel } from '@/features/diagram/hooks/use-inline-label';
import { type UmlNode } from '@/features/diagram/types';
import { cn } from '@/lib/utils';

const HANDLE_CLASS =
  '!size-1.5 !bg-primary !border-primary opacity-0 group-hover/node:opacity-100 transition-opacity';

export const ActorNode = memo(({ id, data, selected }: NodeProps<UmlNode>) => {
  const { isEditing, onDoubleClick, inputProps } = useInlineLabel(id, data.label);

  return (
    <div
      className={cn(
        'group/node flex flex-col items-center gap-0.5 px-1 py-1',
        selected && 'ring-primary/50 rounded ring-1',
      )}
    >
      <svg
        className="text-foreground h-20 w-14"
        viewBox="0 0 40 56"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <circle cx="20" cy="8" r="7" />
        <line x1="20" y1="15" x2="20" y2="36" />
        <line x1="7" y1="24" x2="33" y2="24" />
        <line x1="20" y1="36" x2="9" y2="52" />
        <line x1="20" y1="36" x2="31" y2="52" />
      </svg>

      <div className="w-20">
        <NodeInlineLabel
          isEditing={isEditing}
          label={data.label}
          onDoubleClick={onDoubleClick}
          inputProps={inputProps}
          displayClassName="block text-center text-xs font-medium break-words"
          inputClassName="w-full text-center text-xs font-medium border-b border-primary"
        />
      </div>

      <Handle type="source" position={Position.Top} id="top" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Right} id="right" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Left} id="left" className={HANDLE_CLASS} />
    </div>
  );
});
ActorNode.displayName = 'ActorNode';
