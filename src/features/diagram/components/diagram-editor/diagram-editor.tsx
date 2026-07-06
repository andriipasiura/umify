'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { DiagramCanvas } from '@/features/diagram/components/diagram-canvas';
import { DiagramExport } from '@/features/diagram/components/diagram-export';
import { DiagramShare } from '@/features/diagram/components/diagram-share';
import { DiagramStatus } from '@/features/diagram/components/diagram-status';
import { DiagramTitle } from '@/features/diagram/components/diagram-title';
import { DiagramTopbar } from '@/features/diagram/components/diagram-topbar';
import { DiagramZoomControlsPanel } from '@/features/diagram/components/diagram-zoom-controls';
import { LeaveDiagramDialog } from '@/features/diagram/components/leave-diagram-dialog';
import { useDiagramSave } from '@/features/diagram/hooks/use-diagram-save';
import { useDiagramTitle } from '@/features/diagram/hooks/use-diagram-title';
import { useEditorShortcuts } from '@/features/diagram/hooks/use-editor-shortcuts';
import { useLeaveGuard } from '@/features/diagram/hooks/use-leave-guard';
import { useDiagramStore } from '@/features/diagram/store/diagram-store';
import { type UmlEdge, type UmlNode } from '@/features/diagram/types';
import { routes } from '@/lib/routes';

type DiagramEditorProps = {
  id: string;
  title: string;
  visibility: 'public' | 'private';
  nodes: UmlNode[];
  edges: UmlEdge[];
};

export const DiagramEditor = ({ id, title, visibility, nodes, edges }: DiagramEditorProps) => {
  const load = useDiagramStore((s) => s.load);
  const save = useDiagramSave(id);
  const diagramTitle = useDiagramTitle(id, title);
  const leaveGuard = useLeaveGuard(save.saveNow);

  useEditorShortcuts();

  useEffect(() => {
    load({ nodes, edges });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  return (
    <div className="flex h-full w-full flex-col">
      <DiagramTopbar
        leftSlot={
          <Button asChild variant="ghost" size="sm">
            <Link href={routes.diagrams} onClick={leaveGuard.onBackClick}>
              ← All diagrams
            </Link>
          </Button>
        }
      />
      <div className="flex-1 overflow-hidden">
        <DiagramCanvas
          topLeftPanel={<DiagramStatus status={save.status} onClick={() => save.saveNow()} />}
          topCenterPanel={<DiagramTitle {...diagramTitle} />}
          bottomLeftPanel={<DiagramZoomControlsPanel />}
          topRightPanel={
            <div className="flex items-center gap-1.5">
              <DiagramShare id={id} initialVisibility={visibility} />
              <DiagramExport title={diagramTitle.value} />
            </div>
          }
        />
      </div>
      <LeaveDiagramDialog {...leaveGuard} />
    </div>
  );
};
