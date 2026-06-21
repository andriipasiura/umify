import { type ReactNode } from 'react';

import { Show } from '@/components/utils/show';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: string;
  subtitle?: ReactNode;
  className?: string;
};

export const PageHeader = ({ title, subtitle, className }: PageHeaderProps) => (
  <header className={cn('flex flex-col items-center gap-2 text-center', className)}>
    <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>
    <Show when={subtitle !== undefined}>
      <p className="text-muted-foreground max-w-md text-sm">{subtitle}</p>
    </Show>
  </header>
);
