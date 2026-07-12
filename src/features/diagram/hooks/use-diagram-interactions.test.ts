import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useDiagramStore } from '../store/diagram-store';
import { useEditorStore } from '../store/editor-store';
import { UML_DND_MIME } from '../types';

vi.mock('@xyflow/react', () => ({
  useReactFlow: () => ({
    screenToFlowPosition: ({ x, y }: { x: number; y: number }) => ({ x, y }),
  }),
}));

const { useDiagramInteractions } = await import('./use-diagram-interactions');

const makeMouseEvent = (x = 100, y = 200) =>
  ({ clientX: x, clientY: y, preventDefault: vi.fn() }) as unknown as React.MouseEvent;

const makeDragEvent = (kind: string) => {
  const data: Record<string, string> = { [UML_DND_MIME]: kind };
  return {
    preventDefault: vi.fn(),
    dataTransfer: {
      getData: (key: string) => data[key] ?? '',
      dropEffect: '',
    },
  } as unknown as React.DragEvent<HTMLDivElement>;
};

beforeEach(() => {
  useDiagramStore.getState().load({ nodes: [], edges: [] });
  useEditorStore.setState({ tool: 'select' });
});

describe('useDiagramInteractions', () => {
  describe('onPaneClick', () => {
    test('places a node when a node tool is active and keeps the tool active', () => {
      useEditorStore.setState({ tool: 'actor' });
      const { result } = renderHook(() => useDiagramInteractions());

      act(() => result.current.onPaneClick(makeMouseEvent(100, 200)));

      expect(useDiagramStore.getState().nodes).toHaveLength(1);
      expect(useDiagramStore.getState().nodes[0].type).toBe('actor');
      expect(useEditorStore.getState().tool).toBe('actor');
    });

    test('places multiple nodes on repeated taps without switching tools', () => {
      useEditorStore.setState({ tool: 'usecase' });
      const { result } = renderHook(() => useDiagramInteractions());

      act(() => result.current.onPaneClick(makeMouseEvent(10, 10)));
      act(() => result.current.onPaneClick(makeMouseEvent(80, 80)));

      expect(useDiagramStore.getState().nodes).toHaveLength(2);
    });

    test('does nothing when select tool is active', () => {
      const { result } = renderHook(() => useDiagramInteractions());
      act(() => result.current.onPaneClick(makeMouseEvent()));
      expect(useDiagramStore.getState().nodes).toHaveLength(0);
    });

    test('does nothing when eraser tool is active', () => {
      useEditorStore.setState({ tool: 'eraser' });
      const { result } = renderHook(() => useDiagramInteractions());
      act(() => result.current.onPaneClick(makeMouseEvent()));
      expect(useDiagramStore.getState().nodes).toHaveLength(0);
    });
  });

  describe('onNodeClick (eraser)', () => {
    test('deletes a node when eraser is active', () => {
      const node = {
        id: 'n1',
        type: 'actor',
        position: { x: 0, y: 0 },
        data: { kind: 'actor', label: 'A' },
      };
      useDiagramStore.getState().load({ nodes: [node as never], edges: [] });
      useEditorStore.setState({ tool: 'eraser' });

      const { result } = renderHook(() => useDiagramInteractions());
      act(() => result.current.onNodeClick(makeMouseEvent(), node as never));

      expect(useDiagramStore.getState().nodes).toHaveLength(0);
    });

    test('does not delete when select tool is active', () => {
      const node = {
        id: 'n1',
        type: 'actor',
        position: { x: 0, y: 0 },
        data: { kind: 'actor', label: 'A' },
      };
      useDiagramStore.getState().load({ nodes: [node as never], edges: [] });

      const { result } = renderHook(() => useDiagramInteractions());
      act(() => result.current.onNodeClick(makeMouseEvent(), node as never));

      expect(useDiagramStore.getState().nodes).toHaveLength(1);
    });
  });

  describe('onDrop', () => {
    test('places a node at the drop position', () => {
      const { result } = renderHook(() => useDiagramInteractions());
      const e = makeDragEvent('usecase');
      act(() => result.current.onDrop(e));

      expect(useDiagramStore.getState().nodes).toHaveLength(1);
      expect(useDiagramStore.getState().nodes[0].type).toBe('usecase');
    });

    test('ignores drop with invalid kind', () => {
      const { result } = renderHook(() => useDiagramInteractions());
      const e = makeDragEvent('invalid-kind');
      act(() => result.current.onDrop(e));
      expect(useDiagramStore.getState().nodes).toHaveLength(0);
    });
  });

  describe('interaction flags', () => {
    test('panOnDrag=true only for pan tool', () => {
      useEditorStore.setState({ tool: 'pan' });
      const { result } = renderHook(() => useDiagramInteractions());
      expect(result.current.panOnDrag).toBe(true);
    });

    test('panOnDrag=false for select tool', () => {
      const { result } = renderHook(() => useDiagramInteractions());
      expect(result.current.panOnDrag).toBe(false);
    });

    test('nodesDraggable=true for select and pan', () => {
      useEditorStore.setState({ tool: 'select' });
      const { result: r1 } = renderHook(() => useDiagramInteractions());
      expect(r1.current.nodesDraggable).toBe(true);

      useEditorStore.setState({ tool: 'pan' });
      const { result: r2 } = renderHook(() => useDiagramInteractions());
      expect(r2.current.nodesDraggable).toBe(true);
    });

    test('nodesDraggable=false for eraser', () => {
      useEditorStore.setState({ tool: 'eraser' });
      const { result } = renderHook(() => useDiagramInteractions());
      expect(result.current.nodesDraggable).toBe(false);
    });

    test('selectionOnDrag=true only for select tool', () => {
      const { result } = renderHook(() => useDiagramInteractions());
      expect(result.current.selectionOnDrag).toBe(true);

      useEditorStore.setState({ tool: 'pan' });
      const { result: r2 } = renderHook(() => useDiagramInteractions());
      expect(r2.current.selectionOnDrag).toBe(false);
    });
  });
});
