import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

type DiagramTopbarProps = {
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
};

export const DiagramTopbar = ({ leftSlot, rightSlot, className }: DiagramTopbarProps) => (
  <header
    className={cn(
      'bg-background sticky top-0 z-50 flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b px-4',
      className,
    )}
  >
    <SidebarTrigger />
    {leftSlot}
    {rightSlot}
  </header>
);
