'use client';

import { useState, useTransition } from 'react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { deleteAccount } from '../../server/account.actions';

const TITLE = 'Delete account?';
const DESCRIPTION =
  'This action cannot be undone. Your account and all your diagrams will be permanently deleted.';
const CONFIRM_LABEL = 'Type your email to confirm';
const CANCEL_LABEL = 'Cancel';
const DELETE_LABEL = 'Delete my account';
const DELETING_LABEL = 'Deleting…';

type DeleteAccountDialogProps = {
  open: boolean;
  email: string;
  onOpenChange: (open: boolean) => void;
};

export const DeleteAccountDialog = ({ open, email, onOpenChange }: DeleteAccountDialogProps) => {
  const [isPending, startTransition] = useTransition();
  const [typed, setTyped] = useState('');

  const canDelete = typed.trim().toLowerCase() === email.toLowerCase();

  const handleConfirm = () => {
    startTransition(async () => {
      await deleteAccount();
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{TITLE}</AlertDialogTitle>
          <AlertDialogDescription>{DESCRIPTION}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-1.5 py-2">
          <Label htmlFor="confirm-email" className="text-sm">
            {CONFIRM_LABEL}
          </Label>
          <Input
            id="confirm-email"
            type="email"
            placeholder={email}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={isPending}
            autoComplete="off"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{CANCEL_LABEL}</AlertDialogCancel>
          <Button variant="destructive" disabled={!canDelete || isPending} onClick={handleConfirm}>
            {isPending ? DELETING_LABEL : DELETE_LABEL}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
