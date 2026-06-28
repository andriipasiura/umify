'use client';

import { useEffect } from 'react';

import { useEditorShortcuts } from '@/features/diagram/hooks/use-editor-shortcuts';
import { useDiagramStore } from '@/features/diagram/store/diagram-store';
import { type UmlEdge, type UmlNode } from '@/features/diagram/types';

import { DiagramCanvas } from '../diagram-canvas';
import { DiagramTopbar } from '../diagram-topbar';

type DiagramEditorProps = {
  id: string;
  title: string;
  nodes: UmlNode[];
  edges: UmlEdge[];
};

export const DiagramEditor = ({ title, nodes, edges }: DiagramEditorProps) => {
  const load = useDiagramStore((s) => s.load);

  useEditorShortcuts();

  useEffect(() => {
    load({ nodes, edges });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  return (
    <div className="flex h-full w-full flex-col">
      <DiagramTopbar title={title} />
      <div className="flex-1 overflow-hidden">
        <DiagramCanvas />
      </div>
    </div>
  );
};
