'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type DiagramMetaInput } from '@/features/diagram/schema/diagram-meta';
import { updateDiagramMeta } from '@/features/diagram/server/diagram.actions';
import { type DiagramCardData } from '@/features/diagram/types';

import { DiagramForm } from '../diagram-form';

const TITLE = 'Edit Diagram';
const SUBMIT_LABEL = 'Save changes';

type EditDiagramModalProps = {
  diagram: DiagramCardData | null;
  onOpenChange: (open: boolean) => void;
};

export const EditDiagramModal = ({ diagram, onOpenChange }: EditDiagramModalProps) => {
  const defaultValues: DiagramMetaInput = {
    title: diagram?.title ?? '',
    category: diagram?.category ?? '',
    tags: diagram?.tags ?? [],
    visibility: diagram?.visibility ?? 'private',
  };

  return (
    <Dialog open={diagram !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{TITLE}</DialogTitle>
        </DialogHeader>
        {diagram && (
          <DiagramForm
            key={diagram.id}
            defaultValues={defaultValues}
            action={(values) => updateDiagramMeta(diagram.id, values)}
            submitLabel={SUBMIT_LABEL}
            onSuccess={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
