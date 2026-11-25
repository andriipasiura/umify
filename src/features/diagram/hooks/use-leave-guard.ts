'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { useDiagramStore } from '@/features/diagram/store/diagram-store';
import { routes } from '@/lib/routes';

export type UseLeaveGuardResult = {
  open: boolean;
  saving: boolean;
  onCancel: () => void;
  onLeave: () => void;
  onSaveAndLeave: () => void;
};

const internalHrefFrom = (e: MouseEvent): string | null => {
  if (e.defaultPrevented || e.button !== 0) return null;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;

  const anchor = (e.target as Element | null)?.closest?.('a[href]');
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target && anchor.target !== '_self') return null;
  if (anchor.hasAttribute('download')) return null;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname === window.location.pathname && url.search === window.location.search) {
    return null;
  }
  return `${url.pathname}${url.search}${url.hash}`;
};

export const useLeaveGuard = (saveNow: () => Promise<void>): UseLeaveGuardResult => {
  const dirty = useDiagramStore((s) => s.dirty);
  const router = useRouter();

  const [target, setTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!dirty) return;

    const onClick = (e: MouseEvent) => {
      const href = internalHrefFrom(e);
      if (!href) return;
      e.preventDefault();
      e.stopPropagation();
      setTarget(href);
    };

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    document.addEventListener('click', onClick, true);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [dirty]);

  const onCancel = useCallback(() => {
    setTarget(null);
  }, []);

  const onLeave = useCallback(() => {
    router.push(target ?? routes.home);
  }, [router, target]);

  const onSaveAndLeave = useCallback(async () => {
    setSaving(true);
    try {
      await saveNow();
    } finally {
      setSaving(false);
    }

    if (!useDiagramStore.getState().dirty) {
      router.push(target ?? routes.home);
    }
  }, [router, saveNow, target]);

  return { open: target !== null, saving, onCancel, onLeave, onSaveAndLeave };
};
