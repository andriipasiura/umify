import { type ReactNode } from 'react';

import { UmifyMark } from '@/components/icons/umify-mark';
import { PrivacyPolicyNotice } from '@/components/privacy-policy-notice';
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
    <DialogContent className="gap-6 p-8">
      <DialogHeader className="items-center gap-4 text-center">
        <UmifyMark className="ring-foreground/10 shadow-primary/25 size-12 rounded-lg text-2xl shadow-lg ring-1" />
        <div className="flex flex-col gap-1.5">
          <DialogTitle className="text-2xl leading-tight">{TITLE}</DialogTitle>
          <DialogDescription className="text-balance">{DESCRIPTION}</DialogDescription>
        </div>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        {children}
        <PrivacyPolicyNotice terms="By signing in, you agree to the" className="mt-2" />
      </div>
    </DialogContent>
  </Dialog>
);
