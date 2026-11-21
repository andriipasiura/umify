'use client';

import { Sparkles, Star } from 'lucide-react';

import { Show } from '@/components/utils/show';
import { useDiagramBoard } from '@/features/diagram/hooks/use-diagram-board';
import { type DiagramCardData } from '@/features/diagram/types';

import { CreateDiagramCard } from '../create-diagram-card';
import { CreateDiagramFab } from '../create-diagram-fab';
import { CreateDiagramModal } from '../create-diagram-modal';
import { DeleteDiagramDialog } from '../delete-diagram-dialog';
import { DiagramGrid } from '../diagram-grid';
import { EditDiagramModal } from '../edit-diagram-modal';
import { GenerateDiagramDialog } from '../generate-diagram-dialog';

const FAVORITES_EMPTY_HEADING = 'No favorite diagrams yet';
const FAVORITES_EMPTY_HINT = 'Star a diagram to see it here.';
const GENERATE_TITLE = 'Generate with AI';
const GENERATE_SUBTITLE = 'Describe your system and get a draft diagram to edit';

const FavoritesEmptyState = () => (
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
    isGenerateOpen,
    editing,
    deleting,
    openCreate,
    closeCreate,
    openGenerate,
    closeGenerate,
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
        createCard={
          isFavorites ? null : (
            <>
              <CreateDiagramCard onClick={openCreate} />
              <CreateDiagramCard
                onClick={openGenerate}
                title={GENERATE_TITLE}
                subtitle={GENERATE_SUBTITLE}
                icon={<Sparkles className="text-primary size-5" />}
              />
            </>
          )
        }
        onEdit={openEdit}
        onToggleFavorite={handleToggleFavorite}
        onDelete={openDelete}
        emptyState={isFavorites ? <FavoritesEmptyState /> : undefined}
      />

      <Show when={!isFavorites}>
        <CreateDiagramFab onClick={openCreate} />
        <CreateDiagramModal open={isCreateOpen} onOpenChange={(open) => !open && closeCreate()} />
        <GenerateDiagramDialog
          open={isGenerateOpen}
          onOpenChange={(open) => !open && closeGenerate()}
        />
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
