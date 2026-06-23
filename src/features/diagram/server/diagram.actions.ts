'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireUser } from '@/lib/auth/require-user';
import { errors } from '@/lib/constants/errors';
import { routes } from '@/lib/routes';

import { diagramMetaSchema } from '../schema/diagram-meta';
import { diagramRepository } from './diagram.repository';
import { type ActionResult } from './types';

const toCategory = (raw: string): string | null => (raw.trim() === '' ? null : raw.trim());

const toFieldErrors = (error: z.ZodError): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  for (const issue of error.issues) {
    if (issue.path.length > 0) {
      const field = String(issue.path[0]);
      (result[field] ??= []).push(issue.message);
    }
  }
  return result;
};

export const createDiagram = async (payload: unknown): Promise<ActionResult<{ id: string }>> => {
  const user = await requireUser();

  const parsed = diagramMetaSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: errors.INVALID_INPUT,
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const { category, ...rest } = parsed.data;
  const diagram = await diagramRepository.create(user.id, {
    ...rest,
    category: toCategory(category),
  });
  revalidatePath(routes.diagrams);
  return { ok: true, data: { id: diagram.id } };
};

export const updateDiagramMeta = async (
  id: string,
  payload: unknown,
): Promise<ActionResult<{ id: string }>> => {
  const user = await requireUser();

  if (!id) return { ok: false, error: errors.INVALID_INPUT };

  const parsed = diagramMetaSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: errors.INVALID_INPUT,
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const { category, ...rest } = parsed.data;

  const existing = await diagramRepository.findOwner(id);
  if (!existing) return { ok: false, error: errors.NOT_FOUND };
  if (existing.ownerId !== user.id) return { ok: false, error: errors.FORBIDDEN };

  await diagramRepository.updateMeta(id, { ...rest, category: toCategory(category) });
  revalidatePath(routes.diagrams);
  return { ok: true, data: { id } };
};

export const deleteDiagram = async (id: string): Promise<ActionResult> => {
  const user = await requireUser();

  if (!id) return { ok: false, error: errors.INVALID_INPUT };

  const existing = await diagramRepository.findOwner(id);
  if (!existing) return { ok: false, error: errors.NOT_FOUND };
  if (existing.ownerId !== user.id) return { ok: false, error: errors.FORBIDDEN };

  await diagramRepository.remove(id);
  revalidatePath(routes.diagrams);
  return { ok: true, data: undefined };
};

export const toggleFavorite = async (
  id: string,
): Promise<ActionResult<{ isFavorite: boolean }>> => {
  const user = await requireUser();

  if (!id) return { ok: false, error: errors.INVALID_INPUT };

  const existing = await diagramRepository.findOwner(id);
  if (!existing) return { ok: false, error: errors.NOT_FOUND };
  if (existing.ownerId !== user.id) return { ok: false, error: errors.FORBIDDEN };

  const updated = await diagramRepository.setFavorite(id, !existing.isFavorite);
  revalidatePath(routes.diagrams);
  return { ok: true, data: { isFavorite: updated.isFavorite } };
};
