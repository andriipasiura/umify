import 'server-only';

import { requireUser } from '@/lib/auth/require-user';

import { type DiagramFilters } from '../search/diagram-filters';
import { type DiagramCardData } from '../types';
import { diagramRepository } from './diagram.repository';

export type DiagramListResult = {
  diagrams: DiagramCardData[];
  shownCount: number;
  totalCount: number;
};

export const getDiagramsList = async (filters: DiagramFilters): Promise<DiagramListResult> => {
  const user = await requireUser();

  const [diagrams, totalCount] = await Promise.all([
    diagramRepository.findByOwner(user.id, filters),
    diagramRepository.countByOwner(user.id),
  ]);

  return { diagrams, shownCount: diagrams.length, totalCount };
};

export const getFavoriteDiagramsList = async (
  filters: DiagramFilters,
): Promise<DiagramListResult> => {
  const user = await requireUser();

  const [diagrams, totalCount] = await Promise.all([
    diagramRepository.findFavoritesByOwner(user.id, filters),
    diagramRepository.countFavoritesByOwner(user.id),
  ]);

  return { diagrams, shownCount: diagrams.length, totalCount };
};

export const listMyTags = async (): Promise<string[]> => {
  const user = await requireUser();
  return diagramRepository.distinctTags(user.id);
};
