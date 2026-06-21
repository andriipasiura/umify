import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Show } from '@/components/utils/show';
import { type DiagramCardData } from '@/features/diagram/types';
import { formatUpdatedAt } from '@/features/diagram/utils/formatUpdatedAt';
import { cn } from '@/lib/utils';

import { DiagramCardActions } from '../diagram-card-actions';
import { DiagramPreviewMark } from '../diagram-preview-mark';
import { DiagramTagList } from '../diagram-tag-list';

type DiagramCardProps = {
  diagram: DiagramCardData;
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

export const DiagramCard = ({ diagram, className }: DiagramCardProps) => (
  <Card
    className={cn(
      'hover:border-primary gap-0 border border-transparent py-0 transition-colors',
      className,
    )}
  >
    <div className="bg-accent/50 relative flex h-28 items-center justify-center">
      <DiagramPreviewMark className="group-hover/card:text-primary/70 h-14 w-20 transition-colors" />
      <DiagramCardActions diagramTitle={diagram.title} className="absolute top-2 right-2" />
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
        <CardTitle>{diagram.title}</CardTitle>
        <p className="text-muted-foreground text-xs">{formatUpdatedAt(diagram.updatedAt)}</p>
      </div>

      <Show when={diagram.tags.length > 0}>
        <DiagramTagList tags={diagram.tags} />
      </Show>
    </CardContent>
  </Card>
);
