import 'server-only';

import { requireUser } from '@/lib/auth/require-user';

import { SAMPLE_DIAGRAMS } from '../lib/sample-diagrams';
import { type DiagramFilters } from '../search/diagram-filters';
import { type DiagramCardData } from '../types';
import { diagramRepository } from './diagram.repository';

const sampleTags = (): string[] =>
  [...new Set(SAMPLE_DIAGRAMS.flatMap((sample) => sample.tags))].sort();

export type DiagramListResult = {
  diagrams: DiagramCardData[];
  shownCount: number;
  totalCount: number;
  usingSampleData: boolean;
};

export const getDiagramsList = async (filters: DiagramFilters): Promise<DiagramListResult> => {
  const user = await requireUser();

  const [diagrams, totalCount] = await Promise.all([
    diagramRepository.findByOwner(user.id, filters),
    diagramRepository.countByOwner(user.id),
  ]);

  if (totalCount === 0) {
    const samples = [...SAMPLE_DIAGRAMS];
    return {
      diagrams: samples,
      shownCount: samples.length,
      totalCount: samples.length,
      usingSampleData: true,
    };
  }

  return { diagrams, shownCount: diagrams.length, totalCount, usingSampleData: false };
};

export const listMyTags = async (): Promise<string[]> => {
  const user = await requireUser();
  const tags = await diagramRepository.distinctTags(user.id);
  return tags.length > 0 ? tags : sampleTags();
};
