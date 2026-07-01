'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  captureDiagram,
  EmptyDiagramError,
  type ExportFormat,
  triggerDownload,
} from '@/features/diagram/lib/export-diagram';
import { useDiagramStore } from '@/features/diagram/store/diagram-store';

export type UseDiagramExportResult = {
  open: boolean;
  setOpen: (open: boolean) => void;
  fileName: string;
  setFileName: (name: string) => void;
  transparent: boolean;
  setTransparent: (v: boolean) => void;
  previewSrc: string | null;
  isPreviewLoading: boolean;
  isEmpty: boolean;
  isExporting: boolean;
  exportAs: (format: ExportFormat) => void;
};

export const useDiagramExport = (title: string): UseDiagramExportResult => {
  const nodes = useDiagramStore((s) => s.nodes);

  const [open, setOpenRaw] = useState(false);
  const [fileName, setFileName] = useState(title);
  const [transparent, setTransparent] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportingRef = useRef(false);

  const isEmpty = nodes.length === 0;

  const setOpen = useCallback(
    (next: boolean) => {
      if (next) {
        setFileName(title);
      }
      setOpenRaw(next);
    },
    [title],
  );

  useEffect(() => {
    if (!open || isEmpty) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsPreviewLoading(true);
    setPreviewSrc(null);

    const currentNodes = useDiagramStore.getState().nodes;

    captureDiagram({ format: 'png', transparent, nodes: currentNodes })
      .then((src) => {
        if (!cancelled) {
          setPreviewSrc(src);
          setIsPreviewLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, transparent, isEmpty]);

  const exportAs = useCallback(
    (format: ExportFormat) => {
      if (exportingRef.current) return;
      exportingRef.current = true;
      setIsExporting(true);

      const currentNodes = useDiagramStore.getState().nodes;

      captureDiagram({ format, transparent, nodes: currentNodes })
        .then((dataUrl) => {
          triggerDownload(dataUrl, fileName, format);
          toast.success('Diagram exported successfully');
        })
        .catch((err: unknown) => {
          if (err instanceof EmptyDiagramError) {
            toast.error('Cannot export an empty diagram');
          } else {
            toast.error('Failed to export diagram');
          }
        })
        .finally(() => {
          setIsExporting(false);
          exportingRef.current = false;
        });
    },
    [fileName, transparent],
  );

  return {
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
  };
};
