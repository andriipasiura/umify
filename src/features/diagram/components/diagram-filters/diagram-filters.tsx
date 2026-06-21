'use client';

import { SearchInput } from '@/components/search-input';
import { Show } from '@/components/utils/show';
import { useDiagramFilters } from '@/features/diagram/hooks/use-diagram-filters';
import { cn } from '@/lib/utils';

import { DiagramSortMenu } from '../diagram-sort-menu';
import { DiagramTagFilter } from '../diagram-tag-filter';
import { DiagramVisibilityTabs } from '../diagram-visibility-tabs';

type DiagramFiltersProps = {
  availableTags: string[];
  className?: string;
};

export const DiagramFilters = ({ availableTags, className }: DiagramFiltersProps) => {
  const { search, visibility, sort, tags, setSearch, setVisibility, setSort, toggleTag } =
    useDiagramFilters();

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center gap-2">
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="Search diagrams…"
          label="Search diagrams"
          className="flex-1"
        />
        <DiagramSortMenu value={sort} onChange={setSort} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <DiagramVisibilityTabs value={visibility} onChange={setVisibility} />
        <Show when={availableTags.length > 0}>
          <DiagramTagFilter tags={availableTags} selected={tags} onToggle={toggleTag} />
        </Show>
      </div>
    </div>
  );
};
