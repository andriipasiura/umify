import { MoreHorizontal, Pencil, Star, Trash2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const ACTIONS_LABEL_PREFIX = 'Actions for';
const EDIT_LABEL = 'Edit';
const FAVORITE_LABEL = 'Add to favorites';
const UNFAVORITE_LABEL = 'Unfavorite';
const DELETE_LABEL = 'Delete';

type DiagramCardActionsProps = {
  diagramTitle: string;
  isFavorite?: boolean;
  onEdit?: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
  className?: string;
};

export const DiagramCardActions = ({
  diagramTitle,
  isFavorite,
  onEdit,
  onToggleFavorite,
  onDelete,
  className,
}: DiagramCardActionsProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      aria-label={`${ACTIONS_LABEL_PREFIX} ${diagramTitle}`}
      className={cn(
        'bg-background/80 text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-7 cursor-pointer items-center justify-center rounded-md opacity-0 backdrop-blur transition-opacity group-hover/card:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none',
        className,
      )}
    >
      <MoreHorizontal className="size-4" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="min-w-40">
      <DropdownMenuItem disabled={!onEdit} onSelect={onEdit}>
        <Pencil />
        {EDIT_LABEL}
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={!onToggleFavorite}
        onSelect={onToggleFavorite}
        className="truncate"
      >
        <Star className={cn('size-4', isFavorite && 'fill-current')} />
        {isFavorite ? UNFAVORITE_LABEL : FAVORITE_LABEL}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem disabled={!onDelete} onSelect={onDelete} variant="destructive">
        <Trash2 />
        {DELETE_LABEL}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
