import 'server-only';

import { type Prisma } from '@prisma/client';

import { db } from '@/lib/db';

import { type DiagramFilters } from '../search/diagram-filters';

type JsonValue = Prisma.InputJsonValue;

const DIAGRAM_CARD_SELECT = {
  id: true,
  title: true,
  visibility: true,
  category: true,
  tags: true,
  isFavorite: true,
  updatedAt: true,
  thumbnail: true,
} satisfies Prisma.DiagramSelect;

const buildWhere = (ownerId: string, filters: DiagramFilters): Prisma.DiagramWhereInput => ({
  ownerId,
  ...(filters.visibility !== 'all' && { visibility: filters.visibility }),
  ...(filters.search && {
    title: { contains: filters.search, mode: 'insensitive' },
  }),
  ...(filters.tags.length > 0 && { tags: { hasSome: filters.tags } }),
});

const SORT_ORDERS = {
  recent: { updatedAt: 'desc' },
  oldest: { createdAt: 'asc' },
  title: { title: 'asc' },
  'title-desc': { title: 'desc' },
} as const satisfies Record<DiagramFilters['sort'], Prisma.DiagramOrderByWithRelationInput>;

const buildOrderBy = (sort: DiagramFilters['sort']): Prisma.DiagramOrderByWithRelationInput =>
  SORT_ORDERS[sort];

export const diagramRepository = {
  findByOwner: (ownerId: string, filters: DiagramFilters) =>
    db.diagram.findMany({
      where: buildWhere(ownerId, filters),
      orderBy: buildOrderBy(filters.sort),
      select: DIAGRAM_CARD_SELECT,
    }),

  countByOwner: (ownerId: string) => db.diagram.count({ where: { ownerId } }),

  findFavoritesByOwner: (ownerId: string, filters: DiagramFilters) =>
    db.diagram.findMany({
      where: { ...buildWhere(ownerId, filters), isFavorite: true },
      orderBy: buildOrderBy(filters.sort),
      select: DIAGRAM_CARD_SELECT,
    }),

  countFavoritesByOwner: (ownerId: string) =>
    db.diagram.count({ where: { ownerId, isFavorite: true } }),

  distinctTags: async (ownerId: string): Promise<string[]> => {
    const rows = await db.diagram.findMany({
      where: { ownerId },
      select: { tags: true },
    });
    return [...new Set(rows.flatMap((row) => row.tags))].sort();
  },

  findOwner: (id: string) =>
    db.diagram.findUnique({ where: { id }, select: { ownerId: true, isFavorite: true } }),

  create: (
    ownerId: string,
    data: {
      title: string;
      category: string | null;
      tags: string[];
      visibility: 'public' | 'private';
    },
  ) =>
    db.diagram.create({
      data: { ...data, ownerId, nodes: [], edges: [] },
      select: DIAGRAM_CARD_SELECT,
    }),

  createWithContent: (
    ownerId: string,
    data: { title: string; nodes: JsonValue; edges: JsonValue },
  ) =>
    db.diagram.create({
      data: {
        ...data,
        ownerId,
        category: null,
        tags: [],
        visibility: 'private',
      },
      select: { id: true },
    }),

  updateMeta: (
    id: string,
    data: {
      title: string;
      category: string | null;
      tags: string[];
      visibility: 'public' | 'private';
    },
  ) => db.diagram.update({ where: { id }, data, select: DIAGRAM_CARD_SELECT }),

  remove: (id: string) => db.diagram.delete({ where: { id } }),

  setFavorite: (id: string, isFavorite: boolean) =>
    db.diagram.update({ where: { id }, data: { isFavorite }, select: DIAGRAM_CARD_SELECT }),

  findPublicById: (id: string) =>
    db.diagram.findFirst({
      where: { id, visibility: 'public' },
      select: { id: true, title: true, nodes: true, edges: true },
    }),

  setVisibility: (id: string, visibility: 'public' | 'private') =>
    db.diagram.update({ where: { id }, data: { visibility }, select: { visibility: true } }),

  findContentById: (id: string) =>
    db.diagram.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        ownerId: true,
        visibility: true,
        version: true,
        nodes: true,
        edges: true,
      },
    }),

  saveContent: (id: string, data: { nodes: JsonValue; edges: JsonValue }) =>
    db.diagram.update({ where: { id }, data }),

  rename: (id: string, title: string) => db.diagram.update({ where: { id }, data: { title } }),

  setThumbnail: (id: string, thumbnail: string | null) =>
    db.diagram.update({ where: { id }, data: { thumbnail } }),
};
