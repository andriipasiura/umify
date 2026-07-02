import { Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type DiagramShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPublic: boolean;
  pending: boolean;
  shareUrl: string;
  onToggle: (checked: boolean) => void;
  onCopy: () => void;
};

const DIALOG_TITLE = 'Share diagram';
const DIALOG_DESCRIPTION = 'Make the diagram public to share a read-only link.';

export const DiagramShareDialog = ({
  open,
  onOpenChange,
  isPublic,
  pending,
  shareUrl,
  onToggle,
  onCopy,
}: DiagramShareDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{DIALOG_TITLE}</DialogTitle>
        <DialogDescription className="sr-only">{DIALOG_DESCRIPTION}</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="share-public">Public access</Label>
          <Switch
            id="share-public"
            checked={isPublic}
            onCheckedChange={onToggle}
            disabled={pending}
          />
        </div>

        <div className="flex items-center gap-2">
          <Input
            readOnly
            disabled={!isPublic}
            value={shareUrl}
            aria-label="Share link"
            onFocus={(e) => e.currentTarget.select()}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={!isPublic}
            onClick={onCopy}
            aria-label="Copy share link"
          >
            <Copy />
            Copy
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
