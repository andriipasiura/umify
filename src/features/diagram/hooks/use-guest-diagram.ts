'use client';

import { type ChangeEvent, type KeyboardEvent, useCallback, useEffect, useState } from 'react';

import { type DiagramTitleResult } from '@/features/diagram/hooks/use-diagram-title';
import { readGuestDiagram, writeGuestDiagram } from '@/features/diagram/lib/guest-diagram-storage';
import { toDiagramContent } from '@/features/diagram/lib/serialize-content';
import { DEFAULT_GUEST_TITLE } from '@/features/diagram/schema/guest-diagram';
import { useDiagramStore } from '@/features/diagram/store/diagram-store';

const PERSIST_DEBOUNCE_MS = 500;

export type UseGuestDiagramResult = {
  titleControl: DiagramTitleResult;
  flush: () => void;
};

export const useGuestDiagram = (): UseGuestDiagramResult => {
  const load = useDiagramStore((s) => s.load);
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);

  const [value, setValue] = useState(DEFAULT_GUEST_TITLE);
  const [draft, setDraft] = useState(DEFAULT_GUEST_TITLE);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const stored = readGuestDiagram();
    if (!stored) return;

    load({ nodes: stored.content.nodes, edges: stored.content.edges });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(stored.title);
    setDraft(stored.title);
  }, [load]);

  const flush = useCallback(() => {
    const state = useDiagramStore.getState();
    writeGuestDiagram({
      version: 1,
      title: value,
      content: toDiagramContent(state.nodes, state.edges),
      updatedAt: Date.now(),
    });
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(flush, PERSIST_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [nodes, edges, flush]);

  useEffect(() => {
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, [flush]);

  const commit = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(value);
      setIsEditing(false);
      return;
    }

    setValue(trimmed);
    setIsEditing(false);
  }, [draft, value]);

  const cancel = useCallback(() => {
    setDraft(value);
    setIsEditing(false);
  }, [value]);

  const titleControl: DiagramTitleResult = {
    value,
    isEditing,
    draft,
    onDoubleClick: () => {
      setDraft(value);
      setIsEditing(true);
    },
    inputProps: {
      value: draft,
      onChange: (e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          cancel();
        }
      },
      autoFocus: true,
    },
  };

  return { titleControl, flush };
};
