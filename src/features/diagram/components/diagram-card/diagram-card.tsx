import { Star } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Show } from '@/components/utils/show';
import { type DiagramCardData } from '@/features/diagram/types';
import { formatUpdatedAt } from '@/features/diagram/utils/formatUpdatedAt';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';

import { DiagramCardActions } from '../diagram-card-actions';
import { DiagramPreviewMark } from '../diagram-preview-mark';
import { DiagramTagList } from '../diagram-tag-list';

type DiagramCardProps = {
  diagram: DiagramCardData;
  onEdit?: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
  className?: string;
};

const VISIBILITY_LABEL: Record<DiagramCardData['visibility'], string> = {
  public: 'Public',
  private: 'Private',
};

const VISIBILITY_VARIANT: Record<DiagramCardData['visibility'], 'secondary' | 'outline'> = {
  public: 'secondary',
  private: 'outline',
};

export const DiagramCard = ({
  diagram,
  onEdit,
  onToggleFavorite,
  onDelete,
  className,
}: DiagramCardProps) => (
  <Card
    className={cn(
      'hover:border-primary gap-0 border border-transparent py-0 transition-colors',
      className,
    )}
  >
    <div className="bg-accent/50 relative flex h-28 items-center justify-center">
      <Link
        href={routes.diagram(diagram.id)}
        className="focus-visible:ring-ring absolute inset-0 flex items-center justify-center focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
        aria-label={`Open ${diagram.title}`}
        tabIndex={0}
      >
        <DiagramPreviewMark className="group-hover/card:text-primary/70 h-14 w-20 transition-colors" />
      </Link>

      <div className="absolute top-2 right-2 z-10" onClick={(e) => e.preventDefault()}>
        <DiagramCardActions
          diagramTitle={diagram.title}
          isFavorite={diagram.isFavorite}
          onEdit={onEdit}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDelete}
        />
      </div>

      <Show when={diagram.isFavorite || !!onToggleFavorite}>
        <button
          type="button"
          aria-label={diagram.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={onToggleFavorite}
          disabled={!onToggleFavorite}
          className={cn(
            'absolute top-2 left-2 z-10 inline-flex size-7 items-center justify-center rounded-md transition-opacity',
            'text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
            !diagram.isFavorite && 'opacity-0 group-hover/card:opacity-100',
            !onToggleFavorite && 'cursor-default',
          )}
        >
          <Star className={cn('size-4', diagram.isFavorite && 'fill-current text-yellow-500')} />
        </button>
      </Show>
    </div>

    <CardContent className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant={VISIBILITY_VARIANT[diagram.visibility]}>
          {VISIBILITY_LABEL[diagram.visibility]}
        </Badge>
        <Show when={diagram.category !== null}>
          <Badge variant="outline" className="text-muted-foreground">
            {diagram.category}
          </Badge>
        </Show>
      </div>

      <div className="flex flex-col gap-1">
        <Link
          href={routes.diagram(diagram.id)}
          className="hover:text-primary focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
        >
          <CardTitle>{diagram.title}</CardTitle>
        </Link>
        <p className="text-muted-foreground text-xs">{formatUpdatedAt(diagram.updatedAt)}</p>
      </div>

      <Show when={diagram.tags.length > 0}>
        <DiagramTagList tags={diagram.tags} />
      </Show>
    </CardContent>
  </Card>
);
