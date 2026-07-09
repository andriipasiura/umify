import { beforeEach, describe, expect, test } from 'vitest';

import { type EditorTool, useEditorStore } from './editor-store';

beforeEach(() => {
  useEditorStore.setState({ tool: 'select' });
});

describe('useEditorStore', () => {
  test('defaults to select tool', () => {
    expect(useEditorStore.getState().tool).toBe('select');
  });

  test('setTool transitions to the given tool', () => {
    const tools: EditorTool[] = ['pan', 'eraser', 'actor', 'boundary', 'usecase', 'note'];
    for (const tool of tools) {
      useEditorStore.getState().setTool(tool);
      expect(useEditorStore.getState().tool).toBe(tool);
    }
  });

  test('setTool back to select', () => {
    useEditorStore.getState().setTool('actor');
    useEditorStore.getState().setTool('select');
    expect(useEditorStore.getState().tool).toBe('select');
  });
});
