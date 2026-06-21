import { MoreHorizontal, Pencil, Star, Trash2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type DiagramCardActionsProps = {
  diagramTitle: string;
  className?: string;
};

export const DiagramCardActions = ({ diagramTitle, className }: DiagramCardActionsProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      aria-label={`Actions for ${diagramTitle}`}
      className={cn(
        'bg-background/80 text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-7 cursor-pointer items-center justify-center rounded-md opacity-0 backdrop-blur transition-opacity group-hover/card:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none',
        className,
      )}
    >
      <MoreHorizontal className="size-4" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem disabled>
        <Pencil />
        Edit
      </DropdownMenuItem>
      <DropdownMenuItem disabled>
        <Star />
        Add to favorites
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem disabled variant="destructive">
        <Trash2 />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
