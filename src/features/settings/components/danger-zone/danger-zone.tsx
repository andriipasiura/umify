'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { DeleteAccountDialog } from '../delete-account-dialog';

const TITLE = 'Delete Account';
const DESCRIPTION = 'Delete your UmiFy account.';

type DangerZoneProps = {
  email: string;
};

export const DangerZone = ({ email }: DangerZoneProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between p-4">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{TITLE}</p>
          <p className="text-muted-foreground text-xs">{DESCRIPTION}</p>
        </div>
        <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
          Delete
        </Button>
      </div>

      <DeleteAccountDialog open={open} email={email} onOpenChange={setOpen} />
    </>
  );
};
