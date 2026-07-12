'use client';

import { type ComponentProps } from 'react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export type TooltipSide = 'top' | 'right';

type ToolButtonProps = ComponentProps<typeof Button> & {
  tooltipLabel: string;
  tooltipSide: TooltipSide;
  hasHover: boolean;
  tooltipShortcut?: string;
};

export const ToolButton = ({
  children,
  tooltipLabel,
  tooltipSide,
  hasHover,
  tooltipShortcut,
  ...buttonProps
}: ToolButtonProps) => {
  if (!hasHover) {
    return <Button {...buttonProps}>{children}</Button>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button {...buttonProps}>{children}</Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide} className="flex items-center gap-2">
        <span>{tooltipLabel}</span>
        {tooltipShortcut && (
          <kbd className="bg-muted text-muted-foreground rounded px-1 text-xs">
            {tooltipShortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
};
