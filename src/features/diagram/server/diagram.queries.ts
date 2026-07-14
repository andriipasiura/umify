import 'server-only';

import { cache } from 'react';

import { requireUser } from '@/lib/auth/require-user';

import {
  type DiagramContent,
  diagramContentSchema,
  EMPTY_DIAGRAM_CONTENT,
} from '../schema/diagram-content';
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

export const listMyTags = async (isFavorite?: boolean): Promise<string[]> => {
  const user = await requireUser();
  return diagramRepository.distinctTags(user.id, isFavorite);
};

export type DiagramForEdit = {
  id: string;
  title: string;
  ownerId: string;
  visibility: 'public' | 'private';
  version: number;
  nodes: DiagramContent['nodes'];
  edges: DiagramContent['edges'];
};

export type PublicDiagram = {
  id: string;
  title: string;
  nodes: DiagramContent['nodes'];
  edges: DiagramContent['edges'];
};

export const getPublicDiagram = cache(async (id: string): Promise<PublicDiagram | null> => {
  const row = await diagramRepository.findPublicById(id);
  if (!row) return null;

  const parsed = diagramContentSchema.safeParse({
    version: 1,
    nodes: row.nodes,
    edges: row.edges,
  });

  const content = parsed.success ? parsed.data : EMPTY_DIAGRAM_CONTENT;

  return { id: row.id, title: row.title, nodes: content.nodes, edges: content.edges };
});

export const getDiagramForEdit = async (id: string): Promise<DiagramForEdit | null> => {
  const user = await requireUser();

  const row = await diagramRepository.findContentById(id);
  if (!row || row.ownerId !== user.id) return null;

  const parsed = diagramContentSchema.safeParse({
    version: 1,
    nodes: row.nodes,
    edges: row.edges,
  });

  const content = parsed.success ? parsed.data : EMPTY_DIAGRAM_CONTENT;

  return {
    id: row.id,
    title: row.title,
    ownerId: row.ownerId,
    visibility: row.visibility,
    version: row.version,
    nodes: content.nodes,
    edges: content.edges,
  };
};
