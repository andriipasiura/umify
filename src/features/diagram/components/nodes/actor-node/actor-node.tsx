import { Handle, type NodeProps, Position } from '@xyflow/react';
import { memo } from 'react';

import { type UmlNode } from '@/features/diagram/types';
import { cn } from '@/lib/utils';

const HANDLE_CLASS =
  '!size-2 !bg-primary !border-primary opacity-0 group-hover/node:opacity-100 transition-opacity';

export const ActorNode = memo(({ data, selected }: NodeProps<UmlNode>) => (
  <div
    className={cn(
      'group/node flex flex-col items-center gap-1 px-3 py-2',
      selected && 'outline-primary rounded outline-2 outline-offset-4',
    )}
  >
    <svg
      className="text-foreground h-10 w-8"
      viewBox="0 0 32 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="16" cy="7" r="5" />
      <line x1="16" y1="12" x2="16" y2="26" />
      <line x1="4" y1="18" x2="28" y2="18" />
      <line x1="16" y1="26" x2="6" y2="38" />
      <line x1="16" y1="26" x2="26" y2="38" />
    </svg>

    <span className="text-foreground max-w-24 text-center text-xs font-medium break-words">
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
ActorNode.displayName = 'ActorNode';
