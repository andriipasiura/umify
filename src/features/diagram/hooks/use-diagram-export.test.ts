import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/diagram/lib/export-diagram', () => ({
  captureDiagram: vi.fn(),
  triggerDownload: vi.fn(),
  EmptyDiagramError: class EmptyDiagramError extends Error {
    constructor() {
      super('Cannot export an empty diagram');
      this.name = 'EmptyDiagramError';
    }
  },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { toast } from 'sonner';

import {
  captureDiagram,
  EmptyDiagramError,
  triggerDownload,
} from '@/features/diagram/lib/export-diagram';
import { useDiagramStore } from '@/features/diagram/store/diagram-store';
import { type UmlNode } from '@/features/diagram/types';

import { useDiagramExport } from './use-diagram-export';

const mockNode: UmlNode = {
  id: '1',
  type: 'actor',
  position: { x: 0, y: 0 },
  data: { kind: 'actor', label: 'User' },
};

beforeEach(() => {
  vi.clearAllMocks();
  useDiagramStore.getState().load({ nodes: [], edges: [] });
});

afterEach(() => {
  useDiagramStore.getState().load({ nodes: [], edges: [] });
});

describe('useDiagramExport', () => {
  it('initializes fileName from title', () => {
    const { result } = renderHook(() => useDiagramExport('My Diagram'));
    expect(result.current.fileName).toBe('My Diagram');
  });

  it('reports isEmpty=true when store has no nodes', () => {
    const { result } = renderHook(() => useDiagramExport('Test'));
    expect(result.current.isEmpty).toBe(true);
  });

  it('reports isEmpty=false when store has nodes', () => {
    useDiagramStore.getState().load({ nodes: [mockNode], edges: [] });
    const { result } = renderHook(() => useDiagramExport('Test'));
    expect(result.current.isEmpty).toBe(false);
  });

  it('resets fileName to title when dialog opens', () => {
    const { result } = renderHook(() => useDiagramExport('Initial'));
    act(() => {
      result.current.setFileName('changed');
    });
    act(() => {
      result.current.setOpen(true);
    });
    expect(result.current.fileName).toBe('Initial');
  });

  it('exportAs calls captureDiagram and triggerDownload on success', async () => {
    vi.mocked(captureDiagram).mockResolvedValue('data:image/png;base64,abc');
    useDiagramStore.getState().load({ nodes: [mockNode], edges: [] });

    const { result } = renderHook(() => useDiagramExport('Test'));
    act(() => {
      result.current.exportAs('png');
    });

    await waitFor(() =>
      expect(triggerDownload).toHaveBeenCalledWith('data:image/png;base64,abc', 'Test', 'png'),
    );
    expect(toast.success).toHaveBeenCalledWith('Diagram exported successfully');
  });

  it('exportAs fires toast.error on capture failure', async () => {
    vi.mocked(captureDiagram).mockRejectedValue(new Error('oops'));
    useDiagramStore.getState().load({ nodes: [mockNode], edges: [] });

    const { result } = renderHook(() => useDiagramExport('Test'));
    act(() => {
      result.current.exportAs('png');
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to export diagram'));
  });

  it('exportAs fires empty-diagram message for EmptyDiagramError', async () => {
    vi.mocked(captureDiagram).mockRejectedValue(new EmptyDiagramError());
    useDiagramStore.getState().load({ nodes: [mockNode], edges: [] });

    const { result } = renderHook(() => useDiagramExport('Test'));
    act(() => {
      result.current.exportAs('png');
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Cannot export an empty diagram'));
  });

  it('generates preview when dialog opens with nodes', async () => {
    vi.mocked(captureDiagram).mockResolvedValue('data:image/png;base64,preview');
    useDiagramStore.getState().load({ nodes: [mockNode], edges: [] });

    const { result } = renderHook(() => useDiagramExport('Test'));
    act(() => {
      result.current.setOpen(true);
    });

    await waitFor(() => expect(result.current.previewSrc).toBe('data:image/png;base64,preview'));
  });
});
