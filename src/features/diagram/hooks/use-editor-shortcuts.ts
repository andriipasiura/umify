'use client';

import { useEffect } from 'react';

import { useDiagramStore } from '../store/diagram-store';
import {
  type EditorTool,
  TOOL_ACTOR,
  TOOL_BOUNDARY,
  TOOL_ERASER,
  TOOL_NOTE,
  TOOL_PAN,
  TOOL_SELECT,
  TOOL_USECASE,
  useEditorStore,
} from '../store/editor-store';

const CODE_TO_TOOL: Record<string, EditorTool> = {
  Digit1: TOOL_SELECT,
  Digit2: TOOL_PAN,
  Digit3: TOOL_ERASER,
  Digit4: TOOL_ACTOR,
  Digit5: TOOL_BOUNDARY,
  Digit6: TOOL_USECASE,
  Digit7: TOOL_NOTE,
};

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!target) return false;
  if (target instanceof HTMLInputElement) return true;
  if (target instanceof HTMLTextAreaElement) return true;
  return target instanceof HTMLElement && target.isContentEditable;
};

export const useEditorShortcuts = () => {
  const setTool = useEditorStore((s) => s.setTool);
  const undo = useDiagramStore((s) => s.undo);
  const redo = useDiagramStore((s) => s.redo);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;

      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && e.code === 'KeyZ' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      if (isMod && (e.code === 'KeyY' || (e.code === 'KeyZ' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }

      if (!isMod) {
        const tool = CODE_TO_TOOL[e.code];
        if (tool) setTool(tool);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setTool, undo, redo]);
};
