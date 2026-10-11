import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { db } from '@/lib/db';
import { diagrams, users } from '@/lib/db/schema';

import { type DiagramFilters } from '../search/diagram-filters';
import { diagramRepository } from './diagram.repository';

vi.mock('@/lib/db', async () => {
  const { createTestDb } = await import('@/test/create-test-db');
  return { db: await createTestDb() };
});

const OWNER = 'owner_1';
const OTHER_OWNER = 'owner_2';

const baseFilters: DiagramFilters = {
  search: '',
  visibility: 'all',
  sort: 'recent',
  tags: [],
};

type DiagramMeta = Parameters<typeof diagramRepository.create>[1];

const meta = (title: string, overrides: Partial<DiagramMeta> = {}): DiagramMeta => ({
  title,
  category: null,
  tags: [],
  visibility: 'private',
  ...overrides,
});

const seed = (ownerId: string, data: DiagramMeta) => diagramRepository.create(ownerId, data);

const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

const titles = (rows: { title: string }[]) => rows.map((row) => row.title);

const findRow = async (id: string) => {
  const [row] = await db.select().from(diagrams).where(eq(diagrams.id, id));
  return row;
};

beforeEach(async () => {
  await db.delete(users);
  await db.insert(users).values([{ id: OWNER }, { id: OTHER_OWNER }]);
});

describe('diagramRepository.findByOwner', () => {
  test('scopes to the owner and orders by most recent by default', async () => {
    const first = await seed(OWNER, meta('First'));
    await seed(OWNER, meta('Second'));
    await seed(OTHER_OWNER, meta('Foreign'));
    await tick();
    await diagramRepository.rename(first.id, 'First renamed');

    const rows = await diagramRepository.findByOwner(OWNER, baseFilters);

    expect(titles(rows)).toEqual(['First renamed', 'Second']);
  });

  test('returns only the card fields', async () => {
    await seed(OWNER, meta('Card'));

    const [row] = await diagramRepository.findByOwner(OWNER, baseFilters);

    expect(Object.keys(row).sort()).toEqual([
      'category',
      'id',
      'isFavorite',
      'tags',
      'thumbnailDark',
      'thumbnailLight',
      'title',
      'updatedAt',
      'visibility',
    ]);
  });

  test('applies visibility, search, and tag filters', async () => {
    await seed(OWNER, meta('User LOGIN flow', { visibility: 'public', tags: ['auth'] }));
    await seed(OWNER, meta('Login private', { tags: ['login'] }));
    await seed(OWNER, meta('Checkout', { visibility: 'public', tags: ['auth'] }));
    await seed(OWNER, meta('Login untagged', { visibility: 'public', tags: ['cart'] }));

    const rows = await diagramRepository.findByOwner(OWNER, {
      search: 'login',
      visibility: 'public',
      sort: 'title',
      tags: ['auth', 'login'],
    });

    expect(titles(rows)).toEqual(['User LOGIN flow']);
  });

  test('treats LIKE wildcards in the search term literally', async () => {
    await seed(OWNER, meta('100% done'));
    await seed(OWNER, meta('100 percent'));
    await seed(OWNER, meta('snake_case'));
    await seed(OWNER, meta('snakeXcase'));

    const percent = await diagramRepository.findByOwner(OWNER, { ...baseFilters, search: '0%' });
    const underscore = await diagramRepository.findByOwner(OWNER, {
      ...baseFilters,
      search: 'e_c',
    });

    expect(titles(percent)).toEqual(['100% done']);
    expect(titles(underscore)).toEqual(['snake_case']);
  });

  test('maps the oldest sort to createdAt ascending', async () => {
    await seed(OWNER, meta('Older'));
    await tick();
    await seed(OWNER, meta('Newer'));

    const rows = await diagramRepository.findByOwner(OWNER, { ...baseFilters, sort: 'oldest' });

    expect(titles(rows)).toEqual(['Older', 'Newer']);
  });

  test('sorts by title in both directions', async () => {
    await seed(OWNER, meta('Beta'));
    await seed(OWNER, meta('Alpha'));

    const ascending = await diagramRepository.findByOwner(OWNER, { ...baseFilters, sort: 'title' });
    const descending = await diagramRepository.findByOwner(OWNER, {
      ...baseFilters,
      sort: 'title-desc',
    });

    expect(titles(ascending)).toEqual(['Alpha', 'Beta']);
    expect(titles(descending)).toEqual(['Beta', 'Alpha']);
  });
});

describe('diagramRepository favorites and counts', () => {
  test('lists and counts favorites separately from the full set', async () => {
    const favorite = await seed(OWNER, meta('Favorite'));
    await seed(OWNER, meta('Plain'));
    await seed(OTHER_OWNER, meta('Foreign'));
    await diagramRepository.setFavorite(favorite.id, true);

    const favorites = await diagramRepository.findFavoritesByOwner(OWNER, baseFilters);

    expect(titles(favorites)).toEqual(['Favorite']);
    await expect(diagramRepository.countByOwner(OWNER)).resolves.toBe(2);
    await expect(diagramRepository.countFavoritesByOwner(OWNER)).resolves.toBe(1);
  });
});

describe('diagramRepository.distinctTags', () => {
  test('returns a sorted, de-duplicated tag list', async () => {
    await seed(OWNER, meta('A', { tags: ['login', 'auth'] }));
    await seed(OWNER, meta('B', { tags: ['auth', 'cart'] }));
    await seed(OWNER, meta('C'));
    await seed(OTHER_OWNER, meta('Foreign', { tags: ['foreign'] }));

    await expect(diagramRepository.distinctTags(OWNER)).resolves.toEqual(['auth', 'cart', 'login']);
  });

  test('narrows to favorites when asked', async () => {
    const favorite = await seed(OWNER, meta('A', { tags: ['auth'] }));
    await seed(OWNER, meta('B', { tags: ['cart'] }));
    await diagramRepository.setFavorite(favorite.id, true);

    await expect(diagramRepository.distinctTags(OWNER, true)).resolves.toEqual(['auth']);
    await expect(diagramRepository.distinctTags(OWNER, false)).resolves.toEqual(['cart']);
  });
});

describe('diagramRepository.create', () => {
  test('creates with ownerId, defaults, and empty nodes/edges', async () => {
    const created = await seed(OWNER, meta('New Diagram'));

    expect(created).toMatchObject({ title: 'New Diagram', isFavorite: false, tags: [] });
    expect(await findRow(created.id)).toMatchObject({
      ownerId: OWNER,
      title: 'New Diagram',
      version: 1,
      nodes: [],
      edges: [],
    });
  });
});

describe('diagramRepository.createWithContent', () => {
  test('creates a private diagram with the given content and no category/tags', async () => {
    const created = await diagramRepository.createWithContent(OWNER, {
      title: 'Imported diagram',
      nodes: [{ id: '1' }],
      edges: [],
    });

    expect(Object.keys(created)).toEqual(['id']);
    expect(await findRow(created.id)).toMatchObject({
      title: 'Imported diagram',
      nodes: [{ id: '1' }],
      edges: [],
      ownerId: OWNER,
      category: null,
      tags: [],
      visibility: 'private',
    });
  });
});

describe('diagramRepository.findOwner', () => {
  test('returns the owner and favorite flag, or null when missing', async () => {
    const created = await seed(OWNER, meta('Mine'));

    await expect(diagramRepository.findOwner(created.id)).resolves.toEqual({
      ownerId: OWNER,
      isFavorite: false,
    });
    await expect(diagramRepository.findOwner('missing')).resolves.toBeNull();
  });
});

describe('diagramRepository.updateMeta', () => {
  test('updates the meta fields and bumps updatedAt', async () => {
    const created = await seed(OWNER, meta('Before'));
    await tick();

    const updated = await diagramRepository.updateMeta(created.id, {
      title: 'After',
      category: 'Auth',
      tags: ['auth'],
      visibility: 'public',
    });

    expect(updated).toMatchObject({
      title: 'After',
      category: 'Auth',
      tags: ['auth'],
      visibility: 'public',
    });
    expect(updated.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
  });

  test('throws when the diagram does not exist', async () => {
    await expect(diagramRepository.updateMeta('missing', meta('Nope'))).rejects.toThrow();
  });
});

describe('diagramRepository.setFavorite', () => {
  test('updates the isFavorite field', async () => {
    const created = await seed(OWNER, meta('Favorite me'));

    const updated = await diagramRepository.setFavorite(created.id, true);

    expect(updated.isFavorite).toBe(true);
  });
});

describe('diagramRepository.findPublicById', () => {
  test('filters by public visibility and never selects ownerId', async () => {
    const hidden = await seed(OWNER, meta('Hidden'));
    const shared = await seed(OWNER, meta('Shared', { visibility: 'public' }));

    await expect(diagramRepository.findPublicById(hidden.id)).resolves.toBeNull();
    await expect(diagramRepository.findPublicById(shared.id)).resolves.toEqual({
      id: shared.id,
      title: 'Shared',
      nodes: [],
      edges: [],
    });
  });
});

describe('diagramRepository.setVisibility', () => {
  test('updates only the visibility field', async () => {
    const created = await seed(OWNER, meta('Share me'));

    const updated = await diagramRepository.setVisibility(created.id, 'public');

    expect(updated).toEqual({ visibility: 'public' });
    expect(await findRow(created.id)).toMatchObject({ title: 'Share me', visibility: 'public' });
  });
});

describe('diagramRepository content', () => {
  test('saves and reads back nodes and edges', async () => {
    const created = await seed(OWNER, meta('Canvas'));

    await diagramRepository.saveContent(created.id, {
      nodes: [{ id: 'n1' }],
      edges: [{ id: 'e1' }],
    });

    await expect(diagramRepository.findContentById(created.id)).resolves.toEqual({
      id: created.id,
      title: 'Canvas',
      ownerId: OWNER,
      visibility: 'private',
      version: 1,
      nodes: [{ id: 'n1' }],
      edges: [{ id: 'e1' }],
    });
    await expect(diagramRepository.findContentById('missing')).resolves.toBeNull();
  });
});

describe('diagramRepository.setThumbnail', () => {
  test('updates both thumbnail fields', async () => {
    const created = await seed(OWNER, meta('Thumb'));

    await diagramRepository.setThumbnail(created.id, {
      light: 'data:image/png;base64,light',
      dark: 'data:image/png;base64,dark',
    });

    expect(await findRow(created.id)).toMatchObject({
      thumbnailLight: 'data:image/png;base64,light',
      thumbnailDark: 'data:image/png;base64,dark',
    });
  });

  test('clears both thumbnail fields with null', async () => {
    const created = await seed(OWNER, meta('Thumb'));
    await diagramRepository.setThumbnail(created.id, { light: 'light', dark: 'dark' });

    await diagramRepository.setThumbnail(created.id, { light: null, dark: null });

    expect(await findRow(created.id)).toMatchObject({ thumbnailLight: null, thumbnailDark: null });
  });
});

describe('diagramRepository.remove', () => {
  test('deletes by id', async () => {
    const created = await seed(OWNER, meta('Doomed'));
    const kept = await seed(OWNER, meta('Kept'));

    await diagramRepository.remove(created.id);

    expect(await findRow(created.id)).toBeUndefined();
    expect(await findRow(kept.id)).toBeDefined();
  });
});
