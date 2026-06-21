import { Plus } from 'lucide-react';

import { cn } from '@/lib/utils';

const TITLE = 'Create Diagram';
const SUBTITLE = 'Start a new use case diagram from a blank canvas';

type CreateDiagramCardProps = {
  className?: string;
};

export const CreateDiagramCard = ({ className }: CreateDiagramCardProps) => (
  <button
    type="button"
    disabled
    aria-label={TITLE}
    className={cn(
      'group/card text-card-foreground border-border flex h-full min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center transition-colors',
      'hover:border-primary hover:bg-accent/40 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
      'disabled:cursor-not-allowed',
      className,
    )}
  >
    <span className="bg-muted text-muted-foreground group-hover/card:text-primary flex size-11 items-center justify-center rounded-full transition-colors">
      <Plus className="size-5" />
    </span>
    <span className="flex flex-col gap-1">
      <span className="font-heading text-base font-medium">{TITLE}</span>
      <span className="text-muted-foreground text-xs">{SUBTITLE}</span>
    </span>
  </button>
);
