import { describe, expect, test } from 'vitest';

import { loadDiagramFilters } from './diagram-filters';

describe('loadDiagramFilters', () => {
  test('applies defaults for missing params', async () => {
    const filters = await loadDiagramFilters(Promise.resolve({}));
    expect(filters).toEqual({ search: '', visibility: 'all', sort: 'recent', tags: [] });
  });

  test('parses provided params', async () => {
    const filters = await loadDiagramFilters(
      Promise.resolve({ search: 'login', visibility: 'public', sort: 'title', tags: 'auth,login' }),
    );
    expect(filters).toEqual({
      search: 'login',
      visibility: 'public',
      sort: 'title',
      tags: ['auth', 'login'],
    });
  });

  test('falls back to defaults for invalid enum values', async () => {
    const filters = await loadDiagramFilters(
      Promise.resolve({ visibility: 'archived', sort: 'sideways' }),
    );
    expect(filters.visibility).toBe('all');
    expect(filters.sort).toBe('recent');
  });
});
