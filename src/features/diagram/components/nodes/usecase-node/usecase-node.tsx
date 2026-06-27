import { Handle, type NodeProps, Position } from '@xyflow/react';
import { memo } from 'react';

import { type UmlNode } from '@/features/diagram/types';
import { cn } from '@/lib/utils';

const HANDLE_CLASS =
  '!size-2 !bg-primary !border-primary opacity-0 group-hover/node:opacity-100 transition-opacity';

export const UseCaseNode = memo(({ data, selected }: NodeProps<UmlNode>) => (
  <div
    className={cn(
      'group/node border-foreground relative flex min-h-12 min-w-40 items-center justify-center rounded-[50%] border-2 px-6 py-3',
      selected ? 'ring-primary ring-2 ring-offset-2' : '',
    )}
  >
    <span className="text-foreground max-w-35 text-center text-sm font-medium break-words">
      {data.label}
    </span>

    <Handle type="source" position={Position.Top} id="top" className={HANDLE_CLASS} />
    <Handle type="source" position={Position.Right} id="right" className={HANDLE_CLASS} />
    <Handle type="source" position={Position.Bottom} id="bottom" className={HANDLE_CLASS} />
    <Handle type="source" position={Position.Left} id="left" className={HANDLE_CLASS} />
    <Handle type="target" position={Position.Top} id="top-t" className={HANDLE_CLASS} />
    <Handle type="target" position={Position.Right} id="right-t" className={HANDLE_CLASS} />
    <Handle type="target" position={Position.Bottom} id="bottom-t" className={HANDLE_CLASS} />
    <Handle type="target" position={Position.Left} id="left-t" className={HANDLE_CLASS} />
  </div>
));
UseCaseNode.displayName = 'UseCaseNode';
