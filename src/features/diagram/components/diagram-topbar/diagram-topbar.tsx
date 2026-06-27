import { type ReactNode } from 'react';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

type DiagramTopbarProps = {
  title: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  className?: string;
};

export const DiagramTopbar = ({ title, leftSlot, rightSlot, className }: DiagramTopbarProps) => (
  <header
    className={cn(
      'bg-background sticky top-0 z-50 flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b px-4',
      className,
    )}
  >
    <SidebarTrigger />
    {leftSlot}
    <div className="flex min-w-0 flex-1 items-center justify-center">
      <span className="truncate text-sm font-medium">{title}</span>
    </div>
    {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}
  </header>
);
