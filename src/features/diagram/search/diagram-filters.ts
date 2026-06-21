import { createLoader, parseAsArrayOf, parseAsString, parseAsStringEnum } from 'nuqs/server';

export type DiagramVisibilityFilter = 'all' | 'public' | 'private';
export type DiagramSort = 'recent' | 'oldest' | 'title' | 'title-desc';

export const DIAGRAM_VISIBILITY_FILTERS: readonly DiagramVisibilityFilter[] = [
  'all',
  'public',
  'private',
];

export const DIAGRAM_SORTS: readonly DiagramSort[] = ['recent', 'oldest', 'title', 'title-desc'];

export const diagramFilterParsers = {
  search: parseAsString.withDefault(''),
  visibility: parseAsStringEnum<DiagramVisibilityFilter>([
    ...DIAGRAM_VISIBILITY_FILTERS,
  ]).withDefault('all'),
  sort: parseAsStringEnum<DiagramSort>([...DIAGRAM_SORTS]).withDefault('recent'),
  tags: parseAsArrayOf(parseAsString).withDefault([]),
};

export const loadDiagramFilters = createLoader(diagramFilterParsers);

export type DiagramFilters = {
  search: string;
  visibility: DiagramVisibilityFilter;
  sort: DiagramSort;
  tags: string[];
};
