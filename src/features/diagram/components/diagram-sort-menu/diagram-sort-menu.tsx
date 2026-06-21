import { ArrowDownUp } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DIAGRAM_SORTS, type DiagramSort } from '@/features/diagram/search/diagram-filters';
import { cn } from '@/lib/utils';

const SORT_LABEL: Record<DiagramSort, string> = {
  recent: 'Most recent',
  oldest: 'Oldest',
  title: 'Title A–Z',
  'title-desc': 'Title Z–A',
};

type DiagramSortMenuProps = {
  value: DiagramSort;
  onChange: (value: DiagramSort) => void;
  className?: string;
};

export const DiagramSortMenu = ({ value, onChange, className }: DiagramSortMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      aria-label={`Sort: ${SORT_LABEL[value]}`}
      className={cn(
        'border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex size-9 shrink-0 items-center justify-center rounded-md border focus-visible:ring-2 focus-visible:outline-none',
        className,
      )}
    >
      <ArrowDownUp className="size-4" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="min-w-40">
      <DropdownMenuRadioGroup
        value={value}
        onValueChange={(next) => {
          const match = DIAGRAM_SORTS.find((option) => option === next);
          if (match) onChange(match);
        }}
      >
        {DIAGRAM_SORTS.map((option) => (
          <DropdownMenuRadioItem key={option} value={option} className="cursor-pointer truncate">
            {SORT_LABEL[option]}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);
