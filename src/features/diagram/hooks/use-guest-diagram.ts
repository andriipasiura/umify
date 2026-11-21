'use client';

import { useCallback, useEffect } from 'react';

import { type DiagramTitleResult } from '@/features/diagram/hooks/use-diagram-title';
import { useLocalTitle } from '@/features/diagram/hooks/use-local-title';
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

  const { titleControl, setTitle } = useLocalTitle(DEFAULT_GUEST_TITLE);
  const title = titleControl.value;

  useEffect(() => {
    const stored = readGuestDiagram();
    if (!stored) return;

    load({ nodes: stored.content.nodes, edges: stored.content.edges });
    setTitle(stored.title);
  }, [load, setTitle]);

  const flush = useCallback(() => {
    const state = useDiagramStore.getState();
    writeGuestDiagram({
      version: 1,
      title,
      content: toDiagramContent(state.nodes, state.edges),
      updatedAt: Date.now(),
    });
  }, [title]);

  useEffect(() => {
    const timer = setTimeout(flush, PERSIST_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [nodes, edges, flush]);

  useEffect(() => {
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, [flush]);

  return { titleControl, flush };
};
