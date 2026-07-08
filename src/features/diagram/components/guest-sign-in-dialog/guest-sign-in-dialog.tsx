import { type ReactNode } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const TITLE = 'Sign in to save your work';
const DESCRIPTION = 'Your diagram will be moved to your account so you can keep editing it later.';

type GuestSignInDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

export const GuestSignInDialog = ({ open, onOpenChange, children }: GuestSignInDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{TITLE}</DialogTitle>
        <DialogDescription>{DESCRIPTION}</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-3">{children}</div>
    </DialogContent>
  </Dialog>
);
