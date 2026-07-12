'use client';

import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DiagramExportDialog } from '@/features/diagram/components/diagram-export-dialog';
import { useDiagramExport } from '@/features/diagram/hooks/use-diagram-export';

type DiagramExportProps = {
  title: string;
};

export const DiagramExport = ({ title }: DiagramExportProps) => {
  const {
    open,
    setOpen,
    fileName,
    setFileName,
    transparent,
    setTransparent,
    previewSrc,
    isPreviewLoading,
    isEmpty,
    isExporting,
    exportAs,
  } = useDiagramExport(title);

  return (
    <>
      <Button variant="outline" size="sm" aria-label="Export" onClick={() => setOpen(true)}>
        <Download />
        <span className="max-md:hidden">Export</span>
      </Button>
      <DiagramExportDialog
        open={open}
        onOpenChange={setOpen}
        fileName={fileName}
        onFileNameChange={setFileName}
        transparent={transparent}
        onTransparentChange={setTransparent}
        previewSrc={previewSrc}
        isPreviewLoading={isPreviewLoading}
        isEmpty={isEmpty}
        isExporting={isExporting}
        onExport={exportAs}
      />
    </>
  );
};
