import { beforeEach, describe, expect, test, vi } from 'vitest';

import { type DiagramFilters } from '../search/diagram-filters';
import { type DiagramCardData } from '../types';
import { getDiagramsList, listMyTags } from './diagram.queries';

const { requireUserMock, findByOwner, countByOwner, distinctTags } = vi.hoisted(() => ({
  requireUserMock: vi.fn(),
  findByOwner: vi.fn(),
  countByOwner: vi.fn(),
  distinctTags: vi.fn(),
}));

vi.mock('@/lib/auth/require-user', () => ({ requireUser: requireUserMock }));
vi.mock('./diagram.repository', () => ({
  diagramRepository: { findByOwner, countByOwner, distinctTags },
}));

const filters: DiagramFilters = { search: '', visibility: 'all', sort: 'recent', tags: [] };

const ownDiagram: DiagramCardData = {
  id: 'd1',
  title: 'Login Flow',
  visibility: 'private',
  category: null,
  tags: ['auth'],
  isFavorite: false,
  updatedAt: new Date('2026-06-01T00:00:00.000Z'),
};

describe('getDiagramsList', () => {
  beforeEach(() => {
    requireUserMock.mockReset().mockResolvedValue({ id: 'owner_1' });
    findByOwner.mockReset();
    countByOwner.mockReset();
  });

  test('returns the owner diagrams with real counts', async () => {
    findByOwner.mockResolvedValue([ownDiagram]);
    countByOwner.mockResolvedValue(3);

    const result = await getDiagramsList(filters);

    expect(findByOwner).toHaveBeenCalledWith('owner_1', filters);
    expect(result).toEqual({
      diagrams: [ownDiagram],
      shownCount: 1,
      totalCount: 3,
    });
  });

  test('returns empty diagrams when owner has none', async () => {
    findByOwner.mockResolvedValue([]);
    countByOwner.mockResolvedValue(0);

    const result = await getDiagramsList(filters);

    expect(result).toEqual({ diagrams: [], shownCount: 0, totalCount: 0 });
  });

  test('rejects when unauthenticated', async () => {
    requireUserMock.mockRejectedValue(new Error('Unauthorized'));
    await expect(getDiagramsList(filters)).rejects.toThrow('Unauthorized');
  });
});

describe('listMyTags', () => {
  beforeEach(() => {
    requireUserMock.mockReset().mockResolvedValue({ id: 'owner_1' });
    distinctTags.mockReset();
  });

  test('returns the owner tags when present', async () => {
    distinctTags.mockResolvedValue(['auth', 'login']);
    await expect(listMyTags()).resolves.toEqual(['auth', 'login']);
  });

  test('returns empty array when owner has no tags', async () => {
    distinctTags.mockResolvedValue([]);
    await expect(listMyTags()).resolves.toEqual([]);
  });
});
