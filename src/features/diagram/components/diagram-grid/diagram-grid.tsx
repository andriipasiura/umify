import { FileQuestion } from 'lucide-react';
import { type ReactNode } from 'react';

import { Show } from '@/components/utils/show';
import { type DiagramCardData } from '@/features/diagram/types';
import { cn } from '@/lib/utils';

import { CreateDiagramCard } from '../create-diagram-card';
import { DiagramCard } from '../diagram-card';

type DiagramGridProps = {
  diagrams: DiagramCardData[];
  createCard?: ReactNode;
  onEdit?: (diagram: DiagramCardData) => void;
  onToggleFavorite?: (diagram: DiagramCardData) => void;
  onDelete?: (diagram: DiagramCardData) => void;
  emptyState?: ReactNode;
  className?: string;
};

const EMPTY_HEADING = 'No diagrams match your filters';
const EMPTY_HINT = 'Try a different search, visibility, or tag.';

const DEFAULT_EMPTY_STATE = (
  <div className="text-muted-foreground border-border col-span-full flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-center">
    <FileQuestion className="size-8 opacity-60" />
    <p className="text-foreground text-sm font-medium">{EMPTY_HEADING}</p>
    <p className="text-xs">{EMPTY_HINT}</p>
  </div>
);

const GRID_CLASSES =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-16 md:pb-0';

export const DiagramGrid = ({
  diagrams,
  createCard = <CreateDiagramCard />,
  onEdit,
  onToggleFavorite,
  onDelete,
  emptyState = DEFAULT_EMPTY_STATE,
  className,
}: DiagramGridProps) => (
  <section className={cn(GRID_CLASSES, className)}>
    {createCard}
    <Show when={diagrams.length > 0} fallback={emptyState}>
      {diagrams.map((diagram) => (
        <DiagramCard
          key={diagram.id}
          diagram={diagram}
          onEdit={onEdit ? () => onEdit(diagram) : undefined}
          onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(diagram) : undefined}
          onDelete={onDelete ? () => onDelete(diagram) : undefined}
        />
      ))}
    </Show>
  </section>
);
