import { create } from 'zustand';

import { type UmlNodeKind } from '../types';

export type EditorTool = 'select' | 'pan' | 'eraser' | 'actor' | 'boundary' | 'usecase' | 'note';

export const TOOL_SELECT = 'select' as const satisfies EditorTool;
export const TOOL_PAN = 'pan' as const satisfies EditorTool;
export const TOOL_ERASER = 'eraser' as const satisfies EditorTool;
export const TOOL_ACTOR = 'actor' as const satisfies EditorTool;
export const TOOL_BOUNDARY = 'boundary' as const satisfies EditorTool;
export const TOOL_USECASE = 'usecase' as const satisfies EditorTool;
export const TOOL_NOTE = 'note' as const satisfies EditorTool;

export const NODE_TOOLS: readonly EditorTool[] = [
  TOOL_ACTOR,
  TOOL_BOUNDARY,
  TOOL_USECASE,
  TOOL_NOTE,
];

export const isNodeTool = (tool: EditorTool): tool is UmlNodeKind =>
  NODE_TOOLS.includes(tool as UmlNodeKind);

type EditorState = { tool: EditorTool };
type EditorActions = { setTool: (tool: EditorTool) => void };

export const useEditorStore = create<EditorState & EditorActions>()((set) => ({
  tool: 'select',
  setTool: (tool) => set({ tool }),
}));
