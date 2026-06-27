import { Handle, type NodeProps, NodeResizer, Position } from '@xyflow/react';
import { memo } from 'react';

import { type UmlNode } from '@/features/diagram/types';
import { cn } from '@/lib/utils';

const HANDLE_CLASS =
  '!size-2 !bg-primary !border-primary opacity-0 group-hover/node:opacity-100 transition-opacity';

export const NoteNode = memo(({ data, selected }: NodeProps<UmlNode>) => (
  <div
    className={cn(
      'group/node bg-card border-border relative min-h-15 min-w-30 rounded-sm border px-3 py-2',
      selected ? 'ring-primary ring-2 ring-offset-2' : '',
    )}
  >
    <NodeResizer
      minWidth={100}
      minHeight={48}
      isVisible={selected}
      lineClassName="!border-primary"
      handleClassName="!bg-primary !border-primary !size-2.5"
    />

    <p className="text-foreground text-sm break-words">{data.label}</p>

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
NoteNode.displayName = 'NoteNode';
