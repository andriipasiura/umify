'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

import { ContentLayout } from '@/components/content-layout';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Show } from '@/components/utils/show';
import { DiagramCanvas } from '@/features/diagram/components/diagram-canvas';
import { DiagramStatus } from '@/features/diagram/components/diagram-status';
import { DiagramTitle } from '@/features/diagram/components/diagram-title';
import { DiagramTopbar } from '@/features/diagram/components/diagram-topbar';
import { DiagramZoomControlsPanel } from '@/features/diagram/components/diagram-zoom-controls';
import { GenerateDiagramDialog } from '@/features/diagram/components/generate-diagram-dialog';
import {
  DiscardGeneratedDialog,
  GeneratedDiagramBanner,
} from '@/features/diagram/components/generated-diagram-banner';
import { LeaveDiagramDialog } from '@/features/diagram/components/leave-diagram-dialog';
import { useEditorShortcuts } from '@/features/diagram/hooks/use-editor-shortcuts';
import { useGeneratedDiagramSave } from '@/features/diagram/hooks/use-generated-diagram-save';
import { useLeaveGuard } from '@/features/diagram/hooks/use-leave-guard';
import { useLocalTitle } from '@/features/diagram/hooks/use-local-title';
import {
  clearGeneratedDiagram,
  type GeneratedDiagramDraft,
  readGeneratedDiagram,
  writeGeneratedDiagram,
} from '@/features/diagram/lib/generated-diagram-storage';
import { toDiagramContent } from '@/features/diagram/lib/serialize-content';
import { useDiagramStore } from '@/features/diagram/store/diagram-store';
import { useGenerateDraftStore } from '@/features/diagram/store/generate-draft-store';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { routes } from '@/lib/routes';

const EMPTY_HEADING = 'No generated diagram to open';
const EMPTY_HINT = 'Generate a diagram from a description on the diagrams page.';

const BackLink = () => (
  <Button asChild variant="ghost" size="sm">
    <Link href={routes.home}>← All diagrams</Link>
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

const ENTER_ANIMATION_MS = 1000;
const PERSIST_DEBOUNCE_MS = 500;

const usePersistDraft = (title: string) => {
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);

  const flush = useCallback(() => {
    const state = useDiagramStore.getState();
    if (!state.dirty) return;
    writeGeneratedDiagram({ title, content: toDiagramContent(state.nodes, state.edges) });
  }, [title]);

  useEffect(() => {
    const timer = setTimeout(flush, PERSIST_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [nodes, edges, flush]);

  useEffect(() => {
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, [flush]);
};

const DraftEditor = ({ initialDraft }: { initialDraft: GeneratedDiagramDraft }) => {
  const router = useRouter();
  const load = useDiagramStore((s) => s.load);
  const markSaved = useDiagramStore((s) => s.markSaved);
  const clearDescription = useGenerateDraftStore((s) => s.clear);

  const [draft, setDraft] = useState(initialDraft);
  const [generation, setGeneration] = useState(0);
  const [entering, setEntering] = useState(true);
  const [bannerOpen, setBannerOpen] = useState(true);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const { titleControl, setTitle } = useLocalTitle(draft.title);
  const save = useGeneratedDiagramSave(titleControl.value);
  const leaveGuard = useLeaveGuard(save.saveNow);
  const saving = save.status === 'saving';

  useEditorShortcuts();
  usePersistDraft(titleControl.value);

  useLayoutEffect(() => {
    load(draft.content, { dirty: true });
  }, [load, draft]);

  useEffect(() => {
    if (!entering) return;
    const timer = setTimeout(() => setEntering(false), ENTER_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [entering, generation]);

  const onRegenerated = (next: GeneratedDiagramDraft) => {
    setDraft(next);
    setTitle(next.title);
    setGeneration((g) => g + 1);
    setEntering(true);
    setBannerOpen(true);
  };

  const onDiscard = () => {
    markSaved();
    clearGeneratedDiagram();
    clearDescription();
    router.push(routes.home);
  };

  return (
    <ContentLayout>
      <DiagramTopbar leftSlot={<BackLink />} rightSlot={<ThemeToggle className="ml-auto" />} />
      <div className="flex h-full w-full flex-col">
        <Show when={bannerOpen}>
          <GeneratedDiagramBanner
            saving={saving}
            onSave={() => save.saveNow()}
            onRegenerate={() => setRegenerateOpen(true)}
            onDiscard={() => setDiscardOpen(true)}
            onDismiss={() => setBannerOpen(false)}
          />
        </Show>
        <div className="flex-1 overflow-hidden">
          <DiagramCanvas
            key={generation}
            entering={entering}
            topLeftPanel={<DiagramStatus status={save.status} onClick={() => save.saveNow()} />}
            topCenterPanel={<DiagramTitle {...titleControl} />}
            bottomLeftPanel={<DiagramZoomControlsPanel />}
            topRightPanel={
              bannerOpen ? undefined : (
                <Button size="sm" onClick={() => save.saveNow()} disabled={saving}>
                  Save diagram
                </Button>
              )
            }
          />
        </div>
        <LeaveDiagramDialog {...leaveGuard} />
        <DiscardGeneratedDialog
          open={discardOpen}
          onCancel={() => setDiscardOpen(false)}
          onConfirm={onDiscard}
        />
        <GenerateDiagramDialog
          open={regenerateOpen}
          onOpenChange={setRegenerateOpen}
          onGenerated={onRegenerated}
        />
      </div>
    </ContentLayout>
  );
};

const StoredDraftEditor = () => {
  const [draft] = useState(readGeneratedDiagram);
  return draft ? <DraftEditor initialDraft={draft} /> : <EmptyState />;
};

export const GeneratedDiagramEditor = () => {
  const mounted = useIsMounted();
  return mounted ? <StoredDraftEditor /> : null;
};
