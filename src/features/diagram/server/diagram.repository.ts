import 'server-only';

import { and, arrayOverlaps, asc, desc, eq, ilike, type SQL } from 'drizzle-orm';

import { db } from '@/lib/db';
import { diagrams, type Visibility } from '@/lib/db/schema';

import { type DiagramFilters } from '../search/diagram-filters';

type DiagramMeta = {
  title: string;
  category: string | null;
  tags: string[];
  visibility: Visibility;
};

type DiagramContent = { nodes: unknown; edges: unknown };

const DIAGRAM_CARD_COLUMNS = {
  id: diagrams.id,
  title: diagrams.title,
  visibility: diagrams.visibility,
  category: diagrams.category,
  tags: diagrams.tags,
  isFavorite: diagrams.isFavorite,
  updatedAt: diagrams.updatedAt,
  thumbnailLight: diagrams.thumbnailLight,
  thumbnailDark: diagrams.thumbnailDark,
};

const DIAGRAM_ID_COLUMN = { id: diagrams.id };

const SORT_ORDERS = {
  recent: desc(diagrams.updatedAt),
  oldest: asc(diagrams.createdAt),
  title: asc(diagrams.title),
  'title-desc': desc(diagrams.title),
} satisfies Record<DiagramFilters['sort'], SQL>;

const escapeLike = (value: string): string => value.replace(/[\\%_]/g, '\\$&');

const buildWhere = (ownerId: string, filters: DiagramFilters) =>
  and(
    eq(diagrams.ownerId, ownerId),
    filters.visibility !== 'all' ? eq(diagrams.visibility, filters.visibility) : undefined,
    filters.search ? ilike(diagrams.title, `%${escapeLike(filters.search)}%`) : undefined,
    filters.tags.length > 0 ? arrayOverlaps(diagrams.tags, filters.tags) : undefined,
  );

const firstOrNull = <T>(rows: T[]): T | null => rows[0] ?? null;

const firstOrThrow = <T>(rows: T[]): T => {
  const row = firstOrNull(rows);
  if (row === null) throw new Error('Diagram not found');
  return row;
};

const selectCards = (where: SQL | undefined, sort: DiagramFilters['sort']) =>
  db.select(DIAGRAM_CARD_COLUMNS).from(diagrams).where(where).orderBy(SORT_ORDERS[sort]);

const updateById = (id: string, data: Partial<typeof diagrams.$inferInsert>) =>
  db.update(diagrams).set(data).where(eq(diagrams.id, id));

export const diagramRepository = {
  findByOwner: (ownerId: string, filters: DiagramFilters) =>
    selectCards(buildWhere(ownerId, filters), filters.sort),

  countByOwner: (ownerId: string) => db.$count(diagrams, eq(diagrams.ownerId, ownerId)),

  findFavoritesByOwner: (ownerId: string, filters: DiagramFilters) =>
    selectCards(and(buildWhere(ownerId, filters), eq(diagrams.isFavorite, true)), filters.sort),

  countFavoritesByOwner: (ownerId: string) =>
    db.$count(diagrams, and(eq(diagrams.ownerId, ownerId), eq(diagrams.isFavorite, true))),

  distinctTags: async (ownerId: string, isFavorite?: boolean): Promise<string[]> => {
    const rows = await db
      .select({ tags: diagrams.tags })
      .from(diagrams)
      .where(
        and(
          eq(diagrams.ownerId, ownerId),
          isFavorite === undefined ? undefined : eq(diagrams.isFavorite, isFavorite),
        ),
      );
    return [...new Set(rows.flatMap((row) => row.tags))].sort();
  },

  findOwner: async (id: string) =>
    firstOrNull(
      await db
        .select({ ownerId: diagrams.ownerId, isFavorite: diagrams.isFavorite })
        .from(diagrams)
        .where(eq(diagrams.id, id))
        .limit(1),
    ),

  create: async (ownerId: string, data: DiagramMeta) =>
    firstOrThrow(
      await db
        .insert(diagrams)
        .values({ ...data, ownerId, nodes: [], edges: [] })
        .returning(DIAGRAM_CARD_COLUMNS),
    ),

  createWithContent: async (ownerId: string, data: { title: string } & DiagramContent) =>
    firstOrThrow(
      await db
        .insert(diagrams)
        .values({ ...data, ownerId, category: null, tags: [], visibility: 'private' })
        .returning(DIAGRAM_ID_COLUMN),
    ),

  updateMeta: async (id: string, data: DiagramMeta) =>
    firstOrThrow(await updateById(id, data).returning(DIAGRAM_CARD_COLUMNS)),

  remove: async (id: string): Promise<void> => {
    await db.delete(diagrams).where(eq(diagrams.id, id));
  },

  setFavorite: async (id: string, isFavorite: boolean) =>
    firstOrThrow(await updateById(id, { isFavorite }).returning(DIAGRAM_CARD_COLUMNS)),

  findPublicById: async (id: string) =>
    firstOrNull(
      await db
        .select({
          id: diagrams.id,
          title: diagrams.title,
          nodes: diagrams.nodes,
          edges: diagrams.edges,
        })
        .from(diagrams)
        .where(and(eq(diagrams.id, id), eq(diagrams.visibility, 'public')))
        .limit(1),
    ),

  setVisibility: async (id: string, visibility: Visibility) =>
    firstOrThrow(
      await updateById(id, { visibility }).returning({ visibility: diagrams.visibility }),
    ),

  findContentById: async (id: string) =>
    firstOrNull(
      await db
        .select({
          id: diagrams.id,
          title: diagrams.title,
          ownerId: diagrams.ownerId,
          visibility: diagrams.visibility,
          version: diagrams.version,
          nodes: diagrams.nodes,
          edges: diagrams.edges,
        })
        .from(diagrams)
        .where(eq(diagrams.id, id))
        .limit(1),
    ),

  saveContent: async (id: string, data: DiagramContent): Promise<void> => {
    firstOrThrow(await updateById(id, data).returning(DIAGRAM_ID_COLUMN));
  },

  rename: async (id: string, title: string): Promise<void> => {
    firstOrThrow(await updateById(id, { title }).returning(DIAGRAM_ID_COLUMN));
  },

  setThumbnail: async (
    id: string,
    thumbnail: { light: string | null; dark: string | null },
  ): Promise<void> => {
    firstOrThrow(
      await updateById(id, {
        thumbnailLight: thumbnail.light,
        thumbnailDark: thumbnail.dark,
      }).returning(DIAGRAM_ID_COLUMN),
    );
  },
};
