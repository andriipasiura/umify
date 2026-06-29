'use client';

import { Maximize2, Minus, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type DiagramZoomControlsProps = {
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onResetZoom: () => void;
  className?: string;
};

export const DiagramZoomControls = ({
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onFitView,
  onResetZoom,
  className,
}: DiagramZoomControlsProps) => (
  <TooltipProvider delayDuration={400}>
    <div
      className={cn(
        'bg-background border-border flex items-center gap-0.5 rounded-lg border p-1 shadow-md',
        className,
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Zoom out" onClick={onZoomOut}>
            <Minus className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Zoom out</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Reset zoom to 100%"
            onClick={onResetZoom}
            className="min-w-12 px-1.5 tabular-nums"
          >
            {zoomPercent}%
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Reset zoom</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Zoom in" onClick={onZoomIn}>
            <Plus className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Zoom in</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Fit view" onClick={onFitView}>
            <Maximize2 className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Fit view</TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
);
