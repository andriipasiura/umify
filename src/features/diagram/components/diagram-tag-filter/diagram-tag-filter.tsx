import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type DiagramTagFilterProps = {
  tags: string[];
  selected: string[];
  onToggle: (tag: string) => void;
  className?: string;
};

export const DiagramTagFilter = ({
  tags,
  selected,
  onToggle,
  className,
}: DiagramTagFilterProps) => (
  <ul className={cn('flex flex-wrap gap-1.5', className)}>
    {tags.map((tag) => {
      const active = selected.includes(tag);
      return (
        <li key={tag}>
          <Badge asChild variant={active ? 'default' : 'outline'} className="cursor-pointer">
            <button type="button" aria-pressed={active} onClick={() => onToggle(tag)}>
              #{tag}
            </button>
          </Badge>
        </li>
      );
    })}
  </ul>
);
