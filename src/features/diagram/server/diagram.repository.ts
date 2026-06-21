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

const buildOrderBy = (sort: DiagramFilters['sort']): Prisma.DiagramOrderByWithRelationInput => {
  switch (sort) {
    case 'oldest':
      return { createdAt: 'asc' };
    case 'title':
      return { title: 'asc' };
    case 'title-desc':
      return { title: 'desc' };
    case 'recent':
    default:
      return { updatedAt: 'desc' };
  }
};

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
};
