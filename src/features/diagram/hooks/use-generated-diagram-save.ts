'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { type SaveStatus } from '@/features/diagram/components/diagram-status';
import { useSaveShortcut } from '@/features/diagram/hooks/use-save-shortcut';
import { captureThumbnail } from '@/features/diagram/lib/capture-thumbnail';
import { clearGeneratedDiagram } from '@/features/diagram/lib/generated-diagram-storage';
import { toDiagramContent } from '@/features/diagram/lib/serialize-content';
import {
  importGuestDiagram,
  saveDiagramThumbnail,
} from '@/features/diagram/server/diagram.actions';
import { useDiagramStore } from '@/features/diagram/store/diagram-store';
import { routes } from '@/lib/routes';

type UseGeneratedDiagramSaveResult = {
  status: SaveStatus;
  saveNow: () => Promise<void>;
};

export const useGeneratedDiagramSave = (title: string): UseGeneratedDiagramSaveResult => {
  const router = useRouter();
  const markSaved = useDiagramStore((s) => s.markSaved);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const savingRef = useRef(false);

  const saveNow = useCallback(async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setFailed(false);

    const { nodes, edges } = useDiagramStore.getState();

    try {
      const result = await importGuestDiagram({ title, content: toDiagramContent(nodes, edges) });
      if (!result.ok) {
        setFailed(true);
        toast.error(result.error ?? 'Failed to save diagram');
        return;
      }

      try {
        await saveDiagramThumbnail(result.data.id, await captureThumbnail(nodes));
      } catch {}

      markSaved();
      clearGeneratedDiagram();
      router.replace(routes.diagram(result.data.id));
    } catch {
      setFailed(true);
      toast.error('Failed to save diagram');
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  }, [markSaved, router, title]);

  useSaveShortcut(saveNow);

  const status: SaveStatus = saving ? 'saving' : failed ? 'error' : 'unsaved';

  return { status, saveNow };
};
