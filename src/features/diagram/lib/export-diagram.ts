import { getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toJpeg, toPng, toSvg } from 'html-to-image';

import { type UmlNode } from '@/features/diagram/types';

export type ExportFormat = 'png' | 'jpeg' | 'svg';

const EXPORT_PADDING_RATIO = 0.1;
const PIXEL_RATIO = 2;
const MIN_DIMENSION = 200;
const MAX_DIMENSION = 4096;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2;

export const sanitizeFileName = (name: string): string => {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  const safe = trimmed.replace(/[<>:"/\\|?*\x00-\x1f]/g, '');
  return safe || 'diagram';
};

type Rect = { x: number; y: number; width: number; height: number };

const unionRects = (a: Rect, b: Rect): Rect => {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const right = Math.max(a.x + a.width, b.x + b.width);
  const bottom = Math.max(a.y + a.height, b.y + b.height);
  return { x, y, width: right - x, height: bottom - y };
};

const getEdgesBounds = (): Rect | null => {
  const edgesG = document.querySelector<SVGGElement>('.react-flow__edges g');
  if (!edgesG) return null;
  try {
    const bbox = edgesG.getBBox();
    if (bbox.width === 0 && bbox.height === 0) return null;
    return { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height };
  } catch {
    return null;
  }
};

const getExportDimensions = (bounds: Rect) => ({
  width: Math.min(Math.max(bounds.width, MIN_DIMENSION), MAX_DIMENSION),
  height: Math.min(Math.max(bounds.height, MIN_DIMENSION), MAX_DIMENSION),
});

const resolveBackground = (format: ExportFormat, transparent: boolean): string | undefined => {
  if (format !== 'jpeg' && transparent) return undefined;

  const bg = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
  return bg || '#ffffff';
};

export class EmptyDiagramError extends Error {
  constructor() {
    super('Cannot export an empty diagram');
    this.name = 'EmptyDiagramError';
  }
}

export const captureDiagram = async ({
  format,
  transparent,
  nodes,
}: {
  format: ExportFormat;
  transparent: boolean;
  nodes: UmlNode[];
}): Promise<string> => {
  if (nodes.length === 0) throw new EmptyDiagramError();

  const nodeBounds = getNodesBounds(nodes);
  const edgeBounds = getEdgesBounds();
  const bounds = edgeBounds ? unionRects(nodeBounds, edgeBounds) : nodeBounds;

  const { width, height } = getExportDimensions(bounds);
  const { x, y, zoom } = getViewportForBounds(
    bounds,
    width,
    height,
    MIN_ZOOM,
    MAX_ZOOM,
    EXPORT_PADDING_RATIO,
  );

  const viewport = document.querySelector<HTMLElement>('.react-flow__viewport');
  if (!viewport) throw new Error('React Flow viewport not found');

  const backgroundColor = resolveBackground(format, transparent);
  const options = {
    width,
    height,
    backgroundColor,
    pixelRatio: PIXEL_RATIO,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${x}px, ${y}px) scale(${zoom})`,
    },
  };

  if (format === 'svg') return toSvg(viewport, options);
  if (format === 'jpeg') return toJpeg(viewport, options);
  return toPng(viewport, options);
};

export const triggerDownload = (dataUrl: string, fileName: string, format: ExportFormat): void => {
  const ext = format === 'jpeg' ? 'jpg' : format;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${sanitizeFileName(fileName)}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
