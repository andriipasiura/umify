'use client';

import { useDiagramZoom } from '@/features/diagram/hooks/use-diagram-zoom';

import { DiagramZoomControls } from './diagram-zoom-controls';

export const DiagramZoomControlsPanel = () => {
  const zoom = useDiagramZoom();

  return (
    <DiagramZoomControls
      zoomPercent={zoom.zoomPercent}
      onZoomIn={zoom.zoomIn}
      onZoomOut={zoom.zoomOut}
      onFitView={zoom.fitView}
      onResetZoom={zoom.resetZoom}
    />
  );
};
