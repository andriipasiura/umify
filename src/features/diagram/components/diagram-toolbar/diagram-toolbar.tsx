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
import { getRedoShortcut, getUndoShortcut } from '@/lib/platform';
import { cn } from '@/lib/utils';

import { type EditorTool, NODE_TOOLS } from '../../store/editor-store';
import { UML_DND_MIME, UML_RELATIONS, type UmlRelation } from '../../types';
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
  className,
}: DiagramToolbarProps) => {
  const handleDragStart = (e: DragEvent<HTMLButtonElement>, kind: EditorTool) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(UML_DND_MIME, kind);
  };

  return (
    <TooltipProvider delayDuration={400}>
      <div
        className={cn(
          'bg-background border-border flex flex-col items-center gap-1 rounded-lg border p-1 shadow-md',
          className,
        )}
      >
        {TOOL_GROUPS.map((group, gi) => (
          <div key={gi} className="flex flex-col items-center gap-1">
            {gi > 0 && <Separator className="my-0.5 w-6" />}

            {group.map((toolId) => {
              const config = TOOL_CONFIG.find((c) => c.tool === toolId);
              if (!config) return null;
              const Icon = config.icon;
              const isActive = tool === toolId;
              const isNodeKind = NODE_TOOLS.includes(toolId);

              return (
                <Tooltip key={toolId}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-pressed={isActive}
                      aria-label={config.label}
                      onClick={() => onSelectTool(toolId)}
                      draggable={isNodeKind}
                      onDragStart={isNodeKind ? (e) => handleDragStart(e, toolId) : undefined}
                      className={cn('size-8', isActive && 'bg-accent text-accent-foreground')}
                    >
                      <Icon className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-2">
                    <span>{config.label}</span>
                    <kbd className="bg-muted text-muted-foreground rounded px-1 text-xs">
                      {config.shortcut}
                    </kbd>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ))}

        <Separator className="my-0.5 w-6" />

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent side="right">Relation type</TooltipContent>
          </Tooltip>
          <DropdownMenuContent side="right" align="start">
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

        <Separator className="my-0.5 w-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Undo"
              onClick={onUndo}
              disabled={!canUndo}
              className="size-8"
            >
              <Undo2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            <span>Undo</span>
            <kbd className="bg-muted text-muted-foreground rounded px-1 text-xs">
              {getUndoShortcut()}
            </kbd>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Redo"
              onClick={onRedo}
              disabled={!canRedo}
              className="size-8"
            >
              <Redo2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            <span>Redo</span>
            <kbd className="bg-muted text-muted-foreground rounded px-1 text-xs">
              {getRedoShortcut()}
            </kbd>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
