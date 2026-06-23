import 'server-only';

import { type Prisma } from '@prisma/client';

import { db } from '@/lib/db';

import { type DiagramFilters } from '../search/diagram-filters';

const DIAGRAM_CARD_SELECT = {
  id: true,
  title: true,
  visibility: true,
  category: true,
  tags: true,
  isFavorite: true,
  updatedAt: true,
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
};
