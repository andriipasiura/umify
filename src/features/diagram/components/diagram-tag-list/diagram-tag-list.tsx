import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type DiagramTagListProps = {
  tags: string[];
  className?: string;
};

export const DiagramTagList = ({ tags, className }: DiagramTagListProps) => (
  <ul className={cn('flex flex-wrap gap-1', className)}>
    {tags.map((tag) => (
      <li key={tag}>
        <Badge variant="ghost" className="text-muted-foreground px-1.5">
          #{tag}
        </Badge>
      </li>
    ))}
  </ul>
);
