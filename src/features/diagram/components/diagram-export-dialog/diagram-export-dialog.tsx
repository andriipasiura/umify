import { Download, ImageOff } from 'lucide-react';

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
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Show } from '@/components/utils/show';
import { type ExportFormat } from '@/features/diagram/lib/export-diagram';

type DiagramExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  onFileNameChange: (name: string) => void;
  transparent: boolean;
  onTransparentChange: (v: boolean) => void;
  previewSrc: string | null;
  isPreviewLoading: boolean;
  isEmpty: boolean;
  isExporting: boolean;
  onExport: (format: ExportFormat) => void;
};

const FORMATS: { format: ExportFormat; label: string }[] = [
  { format: 'png', label: 'PNG' },
  { format: 'jpeg', label: 'JPEG' },
  { format: 'svg', label: 'SVG' },
];

const DIALOG_TITLE = 'Export diagram';
const DIALOG_DESCRIPTION = 'Preview and download your diagram.';

export const DiagramExportDialog = ({
  open,
  onOpenChange,
  fileName,
  onFileNameChange,
  transparent,
  onTransparentChange,
  previewSrc,
  isPreviewLoading,
  isEmpty,
  isExporting,
  onExport,
}: DiagramExportDialogProps) => {
  const downloadDisabled = isEmpty || isExporting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{DIALOG_TITLE}</DialogTitle>
          <DialogDescription>{DIALOG_DESCRIPTION}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="bg-muted/30 border-border flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border">
            <Show
              when={isEmpty}
              fallback={
                <Show
                  when={isPreviewLoading || previewSrc === null}
                  fallback={
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewSrc!}
                      alt="Diagram preview"
                      className="h-full w-full object-contain"
                    />
                  }
                >
                  <Skeleton className="h-full w-full" />
                </Show>
              }
            >
              <div className="text-muted-foreground flex flex-col items-center gap-2 text-sm">
                <ImageOff className="size-8 opacity-40" />
                <span>No nodes to export</span>
              </div>
            </Show>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="export-file-name">File name</Label>
              <Input
                id="export-file-name"
                value={fileName}
                onChange={(e) => onFileNameChange(e.target.value)}
                placeholder="diagram"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="export-transparent">Disable background</Label>
              <Switch
                id="export-transparent"
                checked={transparent}
                onCheckedChange={onTransparentChange}
              />
            </div>

            <div className="mt-auto flex flex-row gap-2">
              {FORMATS.map(({ format, label }) => (
                <Button
                  key={format}
                  variant="outline"
                  size="sm"
                  disabled={downloadDisabled}
                  onClick={() => onExport(format)}
                  className="flex-1 gap-1.5 text-xs"
                >
                  <Download className="size-3.5" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
