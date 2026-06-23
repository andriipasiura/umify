'use client';

import { useDiagramBoard } from '@/features/diagram/hooks/use-diagram-board';
import { type DiagramCardData } from '@/features/diagram/types';

import { CreateDiagramCard } from '../create-diagram-card';
import { CreateDiagramFab } from '../create-diagram-fab';
import { CreateDiagramModal } from '../create-diagram-modal';
import { DeleteDiagramDialog } from '../delete-diagram-dialog';
import { DiagramGrid } from '../diagram-grid';
import { EditDiagramModal } from '../edit-diagram-modal';

type DiagramBoardProps = {
  diagrams: DiagramCardData[];
};

export const DiagramBoard = ({ diagrams }: DiagramBoardProps) => {
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
  } = useDiagramBoard(diagrams);

  return (
    <div className="relative">
      <DiagramGrid
        diagrams={optimisticDiagrams}
        createCard={<CreateDiagramCard onClick={openCreate} />}
        onEdit={openEdit}
        onToggleFavorite={handleToggleFavorite}
        onDelete={openDelete}
      />

      <CreateDiagramFab onClick={openCreate} />

      <CreateDiagramModal open={isCreateOpen} onOpenChange={(open) => !open && closeCreate()} />
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
