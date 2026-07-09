import { Eraser, Hand, MousePointer2, Square, Type } from 'lucide-react';
import { type ComponentType } from 'react';

import {
  type EditorTool,
  TOOL_ACTOR,
  TOOL_BOUNDARY,
  TOOL_ERASER,
  TOOL_NOTE,
  TOOL_PAN,
  TOOL_SELECT,
  TOOL_USECASE,
} from '@/features/diagram/store/editor-store';
import { type UmlRelation } from '@/features/diagram/types';

import { ActorToolbarIcon } from '../actor-toolbar-icon';
import { UseCaseToolbarIcon } from '../usecase-toolbar-icon';

type IconComponent = ComponentType<{ className?: string }>;

export type ToolConfig = {
  tool: EditorTool;
  icon: IconComponent;
  label: string;
  shortcut: string;
};

export const TOOL_CONFIG: ToolConfig[] = [
  { tool: TOOL_SELECT, icon: MousePointer2, label: 'Select', shortcut: '1' },
  { tool: TOOL_PAN, icon: Hand, label: 'Pan', shortcut: '2' },
  { tool: TOOL_ERASER, icon: Eraser, label: 'Eraser', shortcut: '3' },
  { tool: TOOL_ACTOR, icon: ActorToolbarIcon, label: 'Actor', shortcut: '4' },
  { tool: TOOL_BOUNDARY, icon: Square, label: 'Boundary', shortcut: '5' },
  { tool: TOOL_USECASE, icon: UseCaseToolbarIcon, label: 'Use Case', shortcut: '6' },
  { tool: TOOL_NOTE, icon: Type, label: 'Note', shortcut: '7' },
];

export const RELATION_LABEL: Record<UmlRelation, string> = {
  association: 'Association',
  include: 'Include',
  extend: 'Extend',
  generalization: 'Generalization',
};

export const TOOL_GROUPS: EditorTool[][] = [
  [TOOL_SELECT, TOOL_PAN, TOOL_ERASER],
  [TOOL_ACTOR, TOOL_BOUNDARY, TOOL_USECASE, TOOL_NOTE],
];
