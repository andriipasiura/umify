import { beforeEach, describe, expect, test, vi } from 'vitest';

import { type DiagramFilters } from '../search/diagram-filters';
import { diagramRepository } from './diagram.repository';

const { findMany, count } = vi.hoisted(() => ({ findMany: vi.fn(), count: vi.fn() }));

vi.mock('@/lib/db', () => ({ db: { diagram: { findMany, count } } }));

const baseFilters: DiagramFilters = {
  search: '',
  visibility: 'all',
  sort: 'recent',
  tags: [],
};

describe('diagramRepository.findByOwner', () => {
  beforeEach(() => {
    findMany.mockReset().mockResolvedValue([]);
  });

  test('scopes to the owner and orders by most recent by default', async () => {
    await diagramRepository.findByOwner('owner_1', baseFilters);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerId: 'owner_1' },
        orderBy: { updatedAt: 'desc' },
      }),
    );
  });

  test('applies visibility, search, and tag filters', async () => {
    await diagramRepository.findByOwner('owner_1', {
      search: 'login',
      visibility: 'public',
      sort: 'title',
      tags: ['auth', 'login'],
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          ownerId: 'owner_1',
          visibility: 'public',
          title: { contains: 'login', mode: 'insensitive' },
          tags: { hasSome: ['auth', 'login'] },
        },
        orderBy: { title: 'asc' },
      }),
    );
  });

  test('maps the oldest sort to createdAt ascending', async () => {
    await diagramRepository.findByOwner('owner_1', { ...baseFilters, sort: 'oldest' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'asc' } }),
    );
  });
});

describe('diagramRepository.distinctTags', () => {
  beforeEach(() => {
    findMany.mockReset();
  });

  test('returns a sorted, de-duplicated tag list', async () => {
    findMany.mockResolvedValue([
      { tags: ['login', 'auth'] },
      { tags: ['auth', 'cart'] },
      { tags: [] },
    ]);

    await expect(diagramRepository.distinctTags('owner_1')).resolves.toEqual([
      'auth',
      'cart',
      'login',
    ]);
    expect(findMany).toHaveBeenCalledWith({
      where: { ownerId: 'owner_1' },
      select: { tags: true },
    });
  });
});
