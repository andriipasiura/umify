'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const TITLE = 'Leave without saving?';
const DESCRIPTION =
  'This diagram has unsaved changes. If you leave now, your latest changes will be lost.';
const LEAVE_LABEL = 'Leave';
const SAVE_LABEL = 'Save and leave';
const SAVING_LABEL = 'Saving…';

type LeaveDiagramDialogProps = {
  open: boolean;
  saving?: boolean;
  onCancel: () => void;
  onLeave: () => void;
  onSaveAndLeave: () => void;
};

export const LeaveDiagramDialog = ({
  open,
  saving,
  onCancel,
  onLeave,
  onSaveAndLeave,
}: LeaveDiagramDialogProps) => (
  <AlertDialog
    open={open}
    onOpenChange={(next) => {
      if (!next && !saving) onCancel();
    }}
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{TITLE}</AlertDialogTitle>
        <AlertDialogDescription>{DESCRIPTION}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction onClick={onLeave} disabled={saving} variant="destructive">
          {LEAVE_LABEL}
        </AlertDialogAction>
        <AlertDialogAction onClick={onSaveAndLeave} disabled={saving}>
          {saving ? SAVING_LABEL : SAVE_LABEL}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
