'use client';

import { Share2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DiagramShareDialog } from '@/features/diagram/components/diagram-share-dialog';
import { useDiagramShare } from '@/features/diagram/hooks/use-diagram-share';

type DiagramShareProps = {
  id: string;
  initialVisibility: 'public' | 'private';
};

export const DiagramShare = ({ id, initialVisibility }: DiagramShareProps) => {
  const { open, setOpen, isPublic, pending, shareUrl, onToggle, onCopy } = useDiagramShare(
    id,
    initialVisibility,
  );

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Share2 />
        Share
      </Button>
      <DiagramShareDialog
        open={open}
        onOpenChange={setOpen}
        isPublic={isPublic}
        pending={pending}
        shareUrl={shareUrl}
        onToggle={onToggle}
        onCopy={onCopy}
      />
    </>
  );
};
