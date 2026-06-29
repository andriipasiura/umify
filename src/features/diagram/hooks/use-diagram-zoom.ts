'use client';

import { type ReactFlowState, useReactFlow, useStore } from '@xyflow/react';

export type UseDiagramZoomResult = {
  zoomPercent: number;
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
  resetZoom: () => void;
};

const selectZoom = (s: ReactFlowState) => Math.round(s.transform[2] * 100);

export const useDiagramZoom = (): UseDiagramZoomResult => {
  const { zoomIn, zoomOut, fitView: rfFitView, zoomTo } = useReactFlow();
  const zoomPercent = useStore(selectZoom);

  return {
    zoomPercent,
    zoomIn,
    zoomOut,
    fitView: () => rfFitView({ padding: 0.2 }),
    resetZoom: () => zoomTo(1, { duration: 200 }),
  };
};
