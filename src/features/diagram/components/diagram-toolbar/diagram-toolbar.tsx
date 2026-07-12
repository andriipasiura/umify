'use client';

import { Redo2, Undo2 } from 'lucide-react';
import { type DragEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useHasHover } from '@/hooks/use-has-hover';
import { getRedoShortcut, getUndoShortcut } from '@/lib/platform';
import { cn } from '@/lib/utils';

import { type EditorTool, NODE_TOOLS } from '../../store/editor-store';
import { UML_DND_MIME, UML_RELATIONS, type UmlRelation } from '../../types';
import { ToolButton } from './tool-button';
import { RELATION_LABEL, TOOL_CONFIG, TOOL_GROUPS } from './toolbar-config';

type DiagramToolbarProps = {
  tool: EditorTool;
  onSelectTool: (tool: EditorTool) => void;
  activeRelation: UmlRelation;
  onSelectRelation: (relation: UmlRelation) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
};

export const DiagramToolbar = ({
  tool,
  onSelectTool,
  activeRelation,
  onSelectRelation,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  orientation = 'vertical',
  className,
}: DiagramToolbarProps) => {
  const isHorizontal = orientation === 'horizontal';
  const tooltipSide = isHorizontal ? 'top' : 'right';
  const hasHover = useHasHover();

  const handleDragStart = (e: DragEvent<HTMLButtonElement>, kind: EditorTool) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(UML_DND_MIME, kind);
  };

  const separator = (
    <Separator
      orientation={isHorizontal ? 'vertical' : 'horizontal'}
      className={cn('!self-center', isHorizontal ? 'mx-0.5 h-5' : 'my-0.5 w-6')}
    />
  );

  const relationTrigger = (
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Choose relation type"
        className="size-8 text-xs font-semibold"
      >
        {activeRelation.slice(0, 3).toUpperCase()}
      </Button>
    </DropdownMenuTrigger>
  );

  return (
    <TooltipProvider delayDuration={400}>
      <div
        className={cn(
          'bg-background border-border flex items-center rounded-lg border shadow-md',
          isHorizontal ? 'flex-row gap-0.5 p-0.5' : 'flex-col gap-1 p-1',
          className,
        )}
      >
        {TOOL_GROUPS.map((group, gi) => (
          <div
            key={gi}
            className={cn(
              'flex items-center',
              isHorizontal ? 'flex-row gap-0.5' : 'flex-col gap-1',
            )}
          >
            {gi > 0 && separator}

            {group.map((toolId) => {
              const config = TOOL_CONFIG.find((c) => c.tool === toolId);
              if (!config) return null;
              const Icon = config.icon;
              const isActive = tool === toolId;
              const isNodeKind = NODE_TOOLS.includes(toolId);

              return (
                <ToolButton
                  key={toolId}
                  tooltipLabel={config.label}
                  tooltipShortcut={config.shortcut}
                  tooltipSide={tooltipSide}
                  hasHover={hasHover}
                  variant="ghost"
                  size="icon"
                  aria-pressed={isActive}
                  aria-label={config.label}
                  onClick={() => onSelectTool(toolId)}
                  draggable={isNodeKind && !isHorizontal}
                  onDragStart={
                    isNodeKind && !isHorizontal ? (e) => handleDragStart(e, toolId) : undefined
                  }
                  className={cn('size-8', isActive && 'bg-accent text-accent-foreground')}
                >
                  <Icon className="size-4" />
                </ToolButton>
              );
            })}
          </div>
        ))}

        {separator}

        <DropdownMenu>
          {hasHover ? (
            <Tooltip>
              <TooltipTrigger asChild>{relationTrigger}</TooltipTrigger>
              <TooltipContent side={tooltipSide}>Relation type</TooltipContent>
            </Tooltip>
          ) : (
            relationTrigger
          )}
          <DropdownMenuContent side={tooltipSide} align="start">
            <DropdownMenuRadioGroup
              value={activeRelation}
              onValueChange={(v) => onSelectRelation(v as UmlRelation)}
            >
              {UML_RELATIONS.map((rel) => (
                <DropdownMenuRadioItem key={rel} value={rel}>
                  {RELATION_LABEL[rel]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {separator}

        <ToolButton
          tooltipLabel="Undo"
          tooltipShortcut={getUndoShortcut()}
          tooltipSide={tooltipSide}
          hasHover={hasHover}
          variant="ghost"
          size="icon"
          aria-label="Undo"
          onClick={onUndo}
          disabled={!canUndo}
          className="size-8"
        >
          <Undo2 className="size-4" />
        </ToolButton>

        <ToolButton
          tooltipLabel="Redo"
          tooltipShortcut={getRedoShortcut()}
          tooltipSide={tooltipSide}
          hasHover={hasHover}
          variant="ghost"
          size="icon"
          aria-label="Redo"
          onClick={onRedo}
          disabled={!canRedo}
          className="size-8"
        >
          <Redo2 className="size-4" />
        </ToolButton>
      </div>
    </TooltipProvider>
  );
};
