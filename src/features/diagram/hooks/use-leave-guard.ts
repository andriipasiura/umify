'use client';

import { useRouter } from 'next/navigation';
import { type MouseEvent, useCallback, useEffect, useState } from 'react';

import { useDiagramStore } from '@/features/diagram/store/diagram-store';
import { routes } from '@/lib/routes';

export type UseLeaveGuardResult = {
  open: boolean;
  saving: boolean;
  onBackClick: (e: MouseEvent<HTMLAnchorElement>) => void;
  onCancel: () => void;
  onLeave: () => void;
  onSaveAndLeave: () => void;
};

export const useLeaveGuard = (saveNow: () => Promise<void>): UseLeaveGuardResult => {
  const dirty = useDiagramStore((s) => s.dirty);
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const onBackClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (!dirty) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      e.preventDefault();
      setOpen(true);
    },
    [dirty],
  );

  const onCancel = useCallback(() => {
    setOpen(false);
  }, []);

  const onLeave = useCallback(() => {
    router.push(routes.home);
  }, [router]);

  const onSaveAndLeave = useCallback(async () => {
    setSaving(true);
    try {
      await saveNow();
    } finally {
      setSaving(false);
    }

    if (!useDiagramStore.getState().dirty) {
      router.push(routes.home);
    }
  }, [router, saveNow]);

  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  return { open, saving, onBackClick, onCancel, onLeave, onSaveAndLeave };
};
