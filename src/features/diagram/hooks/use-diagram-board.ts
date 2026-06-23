'use client';

import { useCallback, useOptimistic, useState, useTransition } from 'react';

import { deleteDiagram, toggleFavorite } from '@/features/diagram/server/diagram.actions';
import { type DiagramCardData } from '@/features/diagram/types';

const ACTION_TYPES = {
  TOGGLE_FAVORITE: 'toggle-favorite',
  REMOVE: 'remove',
} as const;

type Action =
  | { type: typeof ACTION_TYPES.TOGGLE_FAVORITE; id: string }
  | { type: typeof ACTION_TYPES.REMOVE; id: string };

const optimisticReducer = (diagrams: DiagramCardData[], action: Action): DiagramCardData[] => {
  switch (action.type) {
    case ACTION_TYPES.TOGGLE_FAVORITE:
      return diagrams.map((d) => (d.id === action.id ? { ...d, isFavorite: !d.isFavorite } : d));
    case ACTION_TYPES.REMOVE:
      return diagrams.filter((d) => d.id !== action.id);
  }
};

export const useDiagramBoard = (initialDiagrams: DiagramCardData[]) => {
  const [optimisticDiagrams, dispatch] = useOptimistic(initialDiagrams, optimisticReducer);
  const [isPending, startTransition] = useTransition();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<DiagramCardData | null>(null);
  const [deleting, setDeleting] = useState<DiagramCardData | null>(null);

  const openCreate = useCallback(() => setIsCreateOpen(true), []);
  const closeCreate = useCallback(() => setIsCreateOpen(false), []);

  const openEdit = useCallback((diagram: DiagramCardData) => setEditing(diagram), []);
  const closeEdit = useCallback(() => setEditing(null), []);

  const openDelete = useCallback((diagram: DiagramCardData) => setDeleting(diagram), []);
  const closeDelete = useCallback(() => setDeleting(null), []);

  const handleToggleFavorite = useCallback(
    (diagram: DiagramCardData) => {
      startTransition(async () => {
        dispatch({ type: ACTION_TYPES.TOGGLE_FAVORITE, id: diagram.id });
        await toggleFavorite(diagram.id);
      });
    },
    [dispatch],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!deleting) return;
    const target = deleting;
    startTransition(async () => {
      dispatch({ type: ACTION_TYPES.REMOVE, id: target.id });
      closeDelete();
      await deleteDiagram(target.id);
    });
  }, [deleting, dispatch, closeDelete]);

  return {
    diagrams: optimisticDiagrams,
    isPending,
    isCreateOpen,
    editing,
    deleting,
    openCreate,
    closeCreate,
    openEdit,
    closeEdit,
    openDelete,
    closeDelete,
    handleToggleFavorite,
    handleConfirmDelete,
  };
};
