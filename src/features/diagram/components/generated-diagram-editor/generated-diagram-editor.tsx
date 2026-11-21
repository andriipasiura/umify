'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { ContentLayout } from '@/components/content-layout';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { DiagramCanvas } from '@/features/diagram/components/diagram-canvas';
import { DiagramStatus } from '@/features/diagram/components/diagram-status';
import { DiagramTitle } from '@/features/diagram/components/diagram-title';
import { DiagramTopbar } from '@/features/diagram/components/diagram-topbar';
import { DiagramZoomControlsPanel } from '@/features/diagram/components/diagram-zoom-controls';
import { LeaveDiagramDialog } from '@/features/diagram/components/leave-diagram-dialog';
import { useEditorShortcuts } from '@/features/diagram/hooks/use-editor-shortcuts';
import { useGeneratedDiagramSave } from '@/features/diagram/hooks/use-generated-diagram-save';
import { useLeaveGuard } from '@/features/diagram/hooks/use-leave-guard';
import { useLocalTitle } from '@/features/diagram/hooks/use-local-title';
import {
  type GeneratedDiagramDraft,
  readGeneratedDiagram,
} from '@/features/diagram/lib/generated-diagram-storage';
import { useDiagramStore } from '@/features/diagram/store/diagram-store';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { routes } from '@/lib/routes';

const EMPTY_HEADING = 'No generated diagram to open';
const EMPTY_HINT = 'Generate a diagram from a description on the diagrams page.';

const BackLink = ({ onClick }: { onClick?: React.MouseEventHandler<HTMLAnchorElement> }) => (
  <Button asChild variant="ghost" size="sm">
    <Link href={routes.home} onClick={onClick}>
      ← All diagrams
    </Link>
  </Button>
);

const EmptyState = () => (
  <ContentLayout>
    <DiagramTopbar leftSlot={<BackLink />} rightSlot={<ThemeToggle className="ml-auto" />} />
    <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <Sparkles className="size-8 opacity-60" />
      <p className="text-foreground text-sm font-medium">{EMPTY_HEADING}</p>
      <p className="text-xs">{EMPTY_HINT}</p>
      <Button asChild size="sm" className="mt-2">
        <Link href={routes.home}>Go to diagrams</Link>
      </Button>
    </div>
  </ContentLayout>
);

const DraftEditor = ({ draft }: { draft: GeneratedDiagramDraft }) => {
  const load = useDiagramStore((s) => s.load);
  const { titleControl } = useLocalTitle(draft.title);
  const save = useGeneratedDiagramSave(titleControl.value);
  const leaveGuard = useLeaveGuard(save.saveNow);

  useEditorShortcuts();

  useEffect(() => {
    load(draft.content, { dirty: true });
  }, [load, draft]);

  return (
    <ContentLayout>
      <DiagramTopbar
        leftSlot={<BackLink onClick={leaveGuard.onBackClick} />}
        rightSlot={<ThemeToggle className="ml-auto" />}
      />
      <div className="flex h-full w-full flex-col">
        <div className="flex-1 overflow-hidden">
          <DiagramCanvas
            topLeftPanel={<DiagramStatus status={save.status} onClick={() => save.saveNow()} />}
            topCenterPanel={<DiagramTitle {...titleControl} />}
            bottomLeftPanel={<DiagramZoomControlsPanel />}
            topRightPanel={
              <Button size="sm" onClick={() => save.saveNow()} disabled={save.status === 'saving'}>
                Save diagram
              </Button>
            }
          />
        </div>
        <LeaveDiagramDialog {...leaveGuard} />
      </div>
    </ContentLayout>
  );
};

const StoredDraftEditor = () => {
  const [draft] = useState(readGeneratedDiagram);
  return draft ? <DraftEditor draft={draft} /> : <EmptyState />;
};

export const GeneratedDiagramEditor = () => {
  const mounted = useIsMounted();
  return mounted ? <StoredDraftEditor /> : null;
};
