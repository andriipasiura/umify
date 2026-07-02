'use client';

import { useCallback, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { setDiagramVisibility } from '@/features/diagram/server/diagram.actions';
import { routes } from '@/lib/routes';

export type DiagramShareResult = {
  open: boolean;
  setOpen: (open: boolean) => void;
  isPublic: boolean;
  pending: boolean;
  shareUrl: string;
  onToggle: (checked: boolean) => void;
  onCopy: () => void;
};

export const useDiagramShare = (
  id: string,
  initialVisibility: 'public' | 'private',
): DiagramShareResult => {
  const [open, setOpen] = useState(false);
  const [visibility, setVisibility] = useState(initialVisibility);
  const [pending, startTransition] = useTransition();

  const shareUrl = typeof window === 'undefined' ? '' : window.location.origin + routes.share(id);

  const onToggle = useCallback(
    (checked: boolean) => {
      const prev = visibility;
      const next = checked ? 'public' : 'private';
      setVisibility(next);

      startTransition(async () => {
        const result = await setDiagramVisibility(id, next);
        if (!result.ok) {
          setVisibility(prev);
          toast.error(result.error ?? 'Failed to update visibility');
          return;
        }
        setVisibility(result.data.visibility);
      });
    },
    [id, visibility],
  );

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  }, [shareUrl]);

  return {
    open,
    setOpen,
    isPublic: visibility === 'public',
    pending,
    shareUrl,
    onToggle,
    onCopy,
  };
};
