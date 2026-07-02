import { beforeEach, describe, expect, test, vi } from 'vitest';

import { type DiagramFilters } from '../search/diagram-filters';
import { type DiagramCardData } from '../types';
import { getDiagramsList, getPublicDiagram, listMyTags } from './diagram.queries';

const { requireUserMock, findByOwner, countByOwner, distinctTags, findPublicById } = vi.hoisted(
  () => ({
    requireUserMock: vi.fn(),
    findByOwner: vi.fn(),
    countByOwner: vi.fn(),
    distinctTags: vi.fn(),
    findPublicById: vi.fn(),
  }),
);

vi.mock('@/lib/auth/require-user', () => ({ requireUser: requireUserMock }));
vi.mock('./diagram.repository', () => ({
  diagramRepository: { findByOwner, countByOwner, distinctTags, findPublicById },
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

describe('getPublicDiagram', () => {
  const validNode = {
    id: 'n1',
    type: 'actor',
    position: { x: 0, y: 0 },
    data: { kind: 'actor', label: 'User' },
  };

  beforeEach(() => {
    requireUserMock.mockReset();
    findPublicById.mockReset();
  });

  test('returns null when the diagram is missing or private', async () => {
    findPublicById.mockResolvedValue(null);
    await expect(getPublicDiagram('d1')).resolves.toBeNull();
  });

  test('returns parsed content for a public diagram', async () => {
    findPublicById.mockResolvedValue({
      id: 'd1',
      title: 'Login Flow',
      nodes: [validNode],
      edges: [],
    });

    await expect(getPublicDiagram('d1')).resolves.toEqual({
      id: 'd1',
      title: 'Login Flow',
      nodes: [validNode],
      edges: [],
    });
  });

  test('falls back to empty content when stored JSON is malformed', async () => {
    findPublicById.mockResolvedValue({
      id: 'd1',
      title: 'Login Flow',
      nodes: [{ bogus: true }],
      edges: 'not-an-array',
    });

    await expect(getPublicDiagram('d1')).resolves.toEqual({
      id: 'd1',
      title: 'Login Flow',
      nodes: [],
      edges: [],
    });
  });

  test('never requires authentication', async () => {
    findPublicById.mockResolvedValue(null);
    await getPublicDiagram('d1');
    expect(requireUserMock).not.toHaveBeenCalled();
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
