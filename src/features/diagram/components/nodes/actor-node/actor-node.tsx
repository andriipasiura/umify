import { type NodeProps } from '@xyflow/react';
import { memo } from 'react';

import { NodeInlineLabel } from '@/features/diagram/components/node-inline-label';
import { NodeHandles } from '@/features/diagram/components/nodes/node-handles';
import { useInlineLabel } from '@/features/diagram/hooks/use-inline-label';
import { type UmlNode } from '@/features/diagram/types';
import { cn } from '@/lib/utils';

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

      <NodeHandles selected={selected} />
    </div>
  );
});
ActorNode.displayName = 'ActorNode';
