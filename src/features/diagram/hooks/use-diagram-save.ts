'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { captureThumbnail } from '@/features/diagram/lib/capture-thumbnail';
import { toDiagramContent } from '@/features/diagram/lib/serialize-content';
import {
  saveDiagramContent,
  saveDiagramThumbnail,
} from '@/features/diagram/server/diagram.actions';
import { useDiagramStore } from '@/features/diagram/store/diagram-store';
import { usePreferences } from '@/features/settings/components/preferences-provider';

export type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error';

const deriveStatus = (saving: boolean, failed: boolean, dirty: boolean): SaveStatus => {
  if (saving) return 'saving';
  if (failed) return 'error';
  if (dirty) return 'unsaved';
  return 'saved';
};

type UseDiagramSaveResult = {
  status: SaveStatus;
  saveNow: () => void;
};

export const useDiagramSave = (id: string): UseDiagramSaveResult => {
  const dirty = useDiagramStore((s) => s.dirty);
  const markSaved = useDiagramStore((s) => s.markSaved);
  const { autoSave, autoSaveInterval } = usePreferences();

  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const savingRef = useRef(false);

  const saveNow = useCallback(async () => {
    if (savingRef.current) return;

    savingRef.current = true;
    setSaving(true);
    setFailed(false);

    const { nodes, edges } = useDiagramStore.getState();
    const payload = toDiagramContent(nodes, edges);

    try {
      const result = await saveDiagramContent(id, payload);

      if (result.ok) {
        const current = useDiagramStore.getState();
        if (current.nodes === nodes && current.edges === edges) {
          markSaved();
        }

        try {
          const thumbnail = await captureThumbnail(nodes);
          await saveDiagramThumbnail(id, thumbnail);
        } catch {}
      } else {
        setFailed(true);
        toast.error(result.error ?? 'Failed to save diagram');
      }
    } catch {
      setFailed(true);
      toast.error('Failed to save diagram');
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  }, [id, markSaved]);

  useEffect(() => {
    if (!autoSave || !dirty || saving) return;

    const timer = setTimeout(() => {
      void saveNow();
    }, autoSaveInterval * 1000);

    return () => clearTimeout(timer);
  }, [autoSave, dirty, saving, autoSaveInterval, saveNow]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
        e.preventDefault();
        void saveNow();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [saveNow]);

  const status = deriveStatus(saving, failed, dirty);

  return { status, saveNow };
};
