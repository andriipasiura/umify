'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type DiagramMetaInput } from '@/features/diagram/schema/diagram-meta';
import { createDiagram } from '@/features/diagram/server/diagram.actions';

import { DiagramForm } from '../diagram-form';

const TITLE = 'Create Diagram';
const SUBMIT_LABEL = 'Create';

type CreateDiagramModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DEFAULT_VALUES: DiagramMetaInput = {
  title: '',
  category: '',
  tags: [],
  visibility: 'private',
};

export const CreateDiagramModal = ({ open, onOpenChange }: CreateDiagramModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{TITLE}</DialogTitle>
      </DialogHeader>
      <DiagramForm
        defaultValues={DEFAULT_VALUES}
        action={createDiagram}
        submitLabel={SUBMIT_LABEL}
        onSuccess={() => onOpenChange(false)}
      />
    </DialogContent>
  </Dialog>
);
