'use client';

import { Download, Share2 } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useState } from 'react';

import { UmifyMark } from '@/components/icons/umify-mark';
import { Button } from '@/components/ui/button';
import { DiagramCanvas } from '@/features/diagram/components/diagram-canvas';
import { DiagramTitle } from '@/features/diagram/components/diagram-title';
import { DiagramZoomControlsPanel } from '@/features/diagram/components/diagram-zoom-controls';
import { GuestSignInDialog } from '@/features/diagram/components/guest-sign-in-dialog';
import { useEditorShortcuts } from '@/features/diagram/hooks/use-editor-shortcuts';
import { useGuestDiagram } from '@/features/diagram/hooks/use-guest-diagram';

type GuestDiagramEditorProps = {
  signInSlot: ReactNode;
};

export const GuestDiagramEditor = ({ signInSlot }: GuestDiagramEditorProps) => {
  const { titleControl, flush } = useGuestDiagram();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEditorShortcuts();

  const promptSignIn = useCallback(() => {
    flush();
    setDialogOpen(true);
  }, [flush]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
        e.preventDefault();
        promptSignIn();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [promptSignIn]);

  return (
    <div className="flex h-full w-full flex-col">
      <header className="bg-background sticky top-0 z-50 flex h-[var(--header-height)] shrink-0 items-center justify-between gap-2 border-b px-4">
        <div className="flex items-center gap-2">
          <UmifyMark className="-translate-x-[2.5px]" />
          <span className="text-sm font-semibold">UmiFy</span>
        </div>
        <Button size="sm" onClick={promptSignIn}>
          Sign in
        </Button>
      </header>
      <div className="flex-1 overflow-hidden">
        <DiagramCanvas
          topLeftPanel={
            <Button variant="outline" size="sm" onClick={promptSignIn}>
              Save
            </Button>
          }
          topCenterPanel={<DiagramTitle {...titleControl} />}
          bottomLeftPanel={<DiagramZoomControlsPanel />}
          topRightPanel={
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={promptSignIn}>
                <Share2 />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={promptSignIn}>
                <Download />
                Export
              </Button>
            </div>
          }
        />
      </div>
      <GuestSignInDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {signInSlot}
      </GuestSignInDialog>
    </div>
  );
};
