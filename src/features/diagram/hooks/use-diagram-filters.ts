'use client';

import { debounce, useQueryStates } from 'nuqs';

import {
  diagramFilterParsers,
  type DiagramSort,
  type DiagramVisibilityFilter,
} from '@/features/diagram/search/diagram-filters';

const SEARCH_DEBOUNCE_MS = 300;

export type UseDiagramFilters = {
  search: string;
  visibility: DiagramVisibilityFilter;
  sort: DiagramSort;
  tags: string[];
  setSearch: (value: string) => void;
  setVisibility: (value: DiagramVisibilityFilter) => void;
  setSort: (value: DiagramSort) => void;
  toggleTag: (tag: string) => void;
};

export const useDiagramFilters = (): UseDiagramFilters => {
  const [{ search, visibility, sort, tags }, setFilters] = useQueryStates(diagramFilterParsers, {
    shallow: false,
    history: 'replace',
  });

  return {
    search,
    visibility,
    sort,
    tags,
    setSearch: (value) =>
      setFilters({ search: value }, { limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS) }),
    setVisibility: (value) => setFilters({ visibility: value }),
    setSort: (value) => setFilters({ sort: value }),
    toggleTag: (tag) =>
      setFilters({
        tags: tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag],
      }),
  };
};
