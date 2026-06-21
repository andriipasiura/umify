import { FileQuestion } from 'lucide-react';
import { type ReactNode } from 'react';

import { Show } from '@/components/utils/show';
import { type DiagramCardData } from '@/features/diagram/types';
import { cn } from '@/lib/utils';

import { CreateDiagramCard } from '../create-diagram-card';
import { DiagramCard } from '../diagram-card';

type DiagramGridProps = {
  diagrams: DiagramCardData[];
  emptyState?: ReactNode;
  className?: string;
};

const DEFAULT_EMPTY_STATE = (
  <div className="text-muted-foreground border-border col-span-full flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-center">
    <FileQuestion className="size-8 opacity-60" />
    <p className="text-foreground text-sm font-medium">No diagrams match your filters</p>
    <p className="text-xs">Try a different search, visibility, or tag.</p>
  </div>
);

const GRID_CLASSES = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

export const DiagramGrid = ({
  diagrams,
  emptyState = DEFAULT_EMPTY_STATE,
  className,
}: DiagramGridProps) => (
  <section className={cn(GRID_CLASSES, className)}>
    <CreateDiagramCard />
    <Show when={diagrams.length > 0} fallback={emptyState}>
      {diagrams.map((diagram) => (
        <DiagramCard key={diagram.id} diagram={diagram} />
      ))}
    </Show>
  </section>
);
