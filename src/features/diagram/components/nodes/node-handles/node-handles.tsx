import { Handle, Position } from '@xyflow/react';

import { cn } from '@/lib/utils';

const BASE_CLASS =
  '!size-1.5 !bg-primary !border-primary opacity-0 group-hover/node:opacity-100 transition-opacity pointer-coarse:!size-3';

const FOCUSED_CLASS =
  "pointer-coarse:opacity-100 pointer-coarse:after:absolute pointer-coarse:after:-inset-3.5 pointer-coarse:after:content-['']";

type NodeHandlesProps = {
  selected?: boolean;
};

export const NodeHandles = ({ selected }: NodeHandlesProps) => {
  const handleClass = cn(BASE_CLASS, selected && FOCUSED_CLASS);

  return (
    <>
      <Handle type="source" position={Position.Top} id="top" className={handleClass} />
      <Handle type="source" position={Position.Right} id="right" className={handleClass} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={handleClass} />
      <Handle type="source" position={Position.Left} id="left" className={handleClass} />
    </>
  );
};
