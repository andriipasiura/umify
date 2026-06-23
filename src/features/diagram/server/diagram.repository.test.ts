import { beforeEach, describe, expect, test, vi } from 'vitest';

import { type DiagramFilters } from '../search/diagram-filters';
import { diagramRepository } from './diagram.repository';

const { findMany, count, findUnique, create, update, deleteOne } = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  deleteOne: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    diagram: {
      findMany,
      count,
      findUnique,
      create,
      update,
      delete: deleteOne,
    },
  },
}));

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

describe('diagramRepository.create', () => {
  beforeEach(() => {
    create.mockReset().mockResolvedValue({ id: 'new-id' });
  });

  test('creates with ownerId and empty nodes/edges', async () => {
    await diagramRepository.create('owner_1', {
      title: 'New Diagram',
      category: null,
      tags: [],
      visibility: 'private',
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ownerId: 'owner_1',
          title: 'New Diagram',
          nodes: [],
          edges: [],
        }),
      }),
    );
  });
});

describe('diagramRepository.setFavorite', () => {
  beforeEach(() => {
    update.mockReset().mockResolvedValue({ id: 'd1', isFavorite: true });
  });

  test('updates the isFavorite field', async () => {
    await diagramRepository.setFavorite('d1', true);

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'd1' },
        data: { isFavorite: true },
      }),
    );
  });
});

describe('diagramRepository.remove', () => {
  beforeEach(() => {
    deleteOne.mockReset().mockResolvedValue({ id: 'd1' });
  });

  test('deletes by id', async () => {
    await diagramRepository.remove('d1');
    expect(deleteOne).toHaveBeenCalledWith({ where: { id: 'd1' } });
  });
});
