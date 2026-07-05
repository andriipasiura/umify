import { type ReactNode } from 'react';

import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

type ContentLayoutProps = {
  children?: ReactNode;
  className?: string;
};

export const ContentLayout = ({ children, className }: ContentLayoutProps) => (
  <SidebarInset
    className={cn(
      '!ml-0 overflow-hidden overflow-y-auto border shadow-sm md:m-2 md:max-h-[calc(100svh-16px)] md:rounded-md',
      className,
    )}
  >
    {children}
  </SidebarInset>
);
