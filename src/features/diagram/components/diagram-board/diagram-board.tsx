'use client';

import { Star } from 'lucide-react';

import { Show } from '@/components/utils/show';
import { useDiagramBoard } from '@/features/diagram/hooks/use-diagram-board';
import { type DiagramCardData } from '@/features/diagram/types';

import { CreateDiagramCard } from '../create-diagram-card';
import { CreateDiagramFab } from '../create-diagram-fab';
import { CreateDiagramModal } from '../create-diagram-modal';
import { DeleteDiagramDialog } from '../delete-diagram-dialog';
import { DiagramGrid } from '../diagram-grid';
import { EditDiagramModal } from '../edit-diagram-modal';

const FAVORITES_EMPTY_HEADING = 'No favorite diagrams yet';
const FAVORITES_EMPTY_HINT = 'Star a diagram to see it here.';

const FAVORITES_EMPTY_STATE = (
  <div className="text-muted-foreground border-border col-span-full flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-center">
    <Star className="size-8 opacity-60" />
    <p className="text-foreground text-sm font-medium">{FAVORITES_EMPTY_HEADING}</p>
    <p className="text-xs">{FAVORITES_EMPTY_HINT}</p>
  </div>
);

type DiagramBoardProps = {
  diagrams: DiagramCardData[];
  variant?: 'all' | 'favorites';
};

export const DiagramBoard = ({ diagrams, variant = 'all' }: DiagramBoardProps) => {
  const isFavorites = variant === 'favorites';

  const {
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
  } = useDiagramBoard(diagrams, { removeOnUnfavorite: isFavorites });

  return (
    <div className="relative">
      <DiagramGrid
        diagrams={optimisticDiagrams}
        createCard={isFavorites ? null : <CreateDiagramCard onClick={openCreate} />}
        onEdit={openEdit}
        onToggleFavorite={handleToggleFavorite}
        onDelete={openDelete}
        emptyState={isFavorites ? FAVORITES_EMPTY_STATE : undefined}
      />

      <Show when={!isFavorites}>
        <CreateDiagramFab onClick={openCreate} />
        <CreateDiagramModal open={isCreateOpen} onOpenChange={(open) => !open && closeCreate()} />
      </Show>
      <EditDiagramModal diagram={editing} onOpenChange={(open) => !open && closeEdit()} />
      <DeleteDiagramDialog
        diagram={deleting}
        onCancel={closeDelete}
        onConfirm={handleConfirmDelete}
        pending={isPending}
      />
    </div>
  );
};
