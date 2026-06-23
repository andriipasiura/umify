'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { type DiagramCardData } from '@/features/diagram/types';

const DESCRIPTION = 'This action cannot be undone. The diagram will be permanently deleted.';
const CANCEL_LABEL = 'Cancel';
const DELETE_LABEL = 'Delete';
const DELETING_LABEL = 'Deleting…';

type DeleteDiagramDialogProps = {
  diagram: DiagramCardData | null;
  onCancel: () => void;
  onConfirm: () => void;
  pending?: boolean;
};

export const DeleteDiagramDialog = ({
  diagram,
  onCancel,
  onConfirm,
  pending,
}: DeleteDiagramDialogProps) => (
  <AlertDialog open={diagram !== null}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete &ldquo;{diagram?.title}&rdquo;?</AlertDialogTitle>
        <AlertDialogDescription>{DESCRIPTION}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel} disabled={pending}>
          {CANCEL_LABEL}
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          disabled={pending}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          {pending ? DELETING_LABEL : DELETE_LABEL}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
