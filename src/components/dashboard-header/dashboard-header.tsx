import { ThemeToggle } from '@/components/theme-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

type DashboardHeaderProps = {
  className?: string;
};

export const DashboardHeader = ({ className }: DashboardHeaderProps) => (
  <header
    className={cn(
      'bg-background sticky top-0 z-50 flex h-[var(--header-height)] shrink-0 items-center gap-2 rounded-t-md border-b px-4',
      className,
    )}
  >
    <div className="from-background pointer-events-none absolute inset-x-0 top-[calc(var(--header-height)-2px)] h-24 border-t bg-gradient-to-b" />
    <SidebarTrigger />
    <ThemeToggle className="ml-auto" />
  </header>
);
