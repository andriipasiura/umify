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

const TITLE = 'Discard generated diagram?';
const DESCRIPTION =
  'The diagram and your edits to it will be lost. Generating a new one counts toward your hourly limit.';
const CANCEL_LABEL = 'Keep editing';
const DISCARD_LABEL = 'Discard';

type DiscardGeneratedDialogProps = {
  open: boolean;
  onCancel: VoidFunction;
  onConfirm: VoidFunction;
};

export const DiscardGeneratedDialog = ({
  open,
  onCancel,
  onConfirm,
}: DiscardGeneratedDialogProps) => (
  <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{TITLE}</AlertDialogTitle>
        <AlertDialogDescription>{DESCRIPTION}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>{CANCEL_LABEL}</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} variant="destructive">
          {DISCARD_LABEL}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
