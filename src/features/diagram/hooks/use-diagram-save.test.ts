import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const {
  saveDiagramContentMock,
  saveDiagramThumbnailMock,
  captureThumbnailMock,
  toastErrorMock,
  prefsMock,
} = vi.hoisted(() => ({
  saveDiagramContentMock: vi.fn(),
  saveDiagramThumbnailMock: vi.fn(),
  captureThumbnailMock: vi.fn(),
  toastErrorMock: vi.fn(),
  prefsMock: { autoSave: true, autoSaveInterval: 30 },
}));

vi.mock('@/features/diagram/server/diagram.actions', () => ({
  saveDiagramContent: saveDiagramContentMock,
  saveDiagramThumbnail: saveDiagramThumbnailMock,
}));
vi.mock('@/features/diagram/lib/capture-thumbnail', () => ({
  captureThumbnail: captureThumbnailMock,
}));
vi.mock('sonner', () => ({ toast: { error: toastErrorMock } }));
vi.mock('@/features/settings/components/preferences-provider', () => ({
  usePreferences: () => prefsMock,
}));

import { useDiagramStore } from '@/features/diagram/store/diagram-store';
import type { UmlNode } from '@/features/diagram/types';

import { useDiagramSave } from './use-diagram-save';

const makeNode = (id: string): UmlNode =>
  ({
    id,
    type: 'actor',
    position: { x: 0, y: 0 },
    data: { kind: 'actor', label: id },
  }) as UmlNode;

beforeEach(() => {
  useDiagramStore.getState().load({ nodes: [], edges: [] });
  saveDiagramContentMock.mockReset().mockResolvedValue({ ok: true, data: undefined });
  saveDiagramThumbnailMock.mockReset().mockResolvedValue({ ok: true, data: undefined });
  captureThumbnailMock.mockReset().mockResolvedValue({
    light: 'data:image/png;base64,light',
    dark: 'data:image/png;base64,dark',
  });
  toastErrorMock.mockReset();
  prefsMock.autoSave = true;
  prefsMock.autoSaveInterval = 30;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDiagramSave', () => {
  test('initial status is saved when store is clean', () => {
    const { result } = renderHook(() => useDiagramSave('d1'));
    expect(result.current.status).toBe('saved');
  });

  test('status is unsaved when store is dirty', () => {
    useDiagramStore.getState().addNode(makeNode('n1'));
    const { result } = renderHook(() => useDiagramSave('d1'));
    expect(result.current.status).toBe('unsaved');
  });

  test('saveNow calls saveDiagramContent with the diagram id', async () => {
    const { result } = renderHook(() => useDiagramSave('d1'));

    await act(async () => {
      await result.current.saveNow();
    });

    expect(saveDiagramContentMock).toHaveBeenCalledWith(
      'd1',
      expect.objectContaining({ version: 1 }),
    );
  });

  test('status becomes saved after successful save', async () => {
    useDiagramStore.getState().addNode(makeNode('n1'));
    const { result } = renderHook(() => useDiagramSave('d1'));

    await act(async () => {
      await result.current.saveNow();
    });

    expect(result.current.status).toBe('saved');
  });

  test('status is error and toast shown on save failure', async () => {
    saveDiagramContentMock.mockResolvedValue({ ok: false, error: 'Forbidden' });
    useDiagramStore.getState().addNode(makeNode('n1'));

    const { result } = renderHook(() => useDiagramSave('d1'));

    await act(async () => {
      await result.current.saveNow();
    });

    expect(result.current.status).toBe('error');
    expect(toastErrorMock).toHaveBeenCalledWith('Forbidden');
  });

  test('error clears to saving on retry', async () => {
    saveDiagramContentMock
      .mockResolvedValueOnce({ ok: false, error: 'Forbidden' })
      .mockResolvedValue({ ok: true, data: undefined });

    useDiagramStore.getState().addNode(makeNode('n1'));
    const { result } = renderHook(() => useDiagramSave('d1'));

    await act(async () => {
      await result.current.saveNow();
    });
    expect(result.current.status).toBe('error');

    await act(async () => {
      await result.current.saveNow();
    });
    expect(result.current.status).toBe('saved');
  });

  test('autosave fires after the configured interval', async () => {
    useDiagramStore.getState().addNode(makeNode('n1'));

    renderHook(() => useDiagramSave('d1'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });

    expect(saveDiagramContentMock).toHaveBeenCalled();
  });

  test('autosave does not fire when autoSave is disabled', async () => {
    prefsMock.autoSave = false;
    useDiagramStore.getState().addNode(makeNode('n1'));

    renderHook(() => useDiagramSave('d1'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });

    expect(saveDiagramContentMock).not.toHaveBeenCalled();
  });

  test('concurrent save calls are ignored', async () => {
    let resolve!: () => void;
    saveDiagramContentMock.mockImplementation(
      () =>
        new Promise<{ ok: true; data: undefined }>((res) => {
          resolve = () => res({ ok: true, data: undefined });
        }),
    );

    const { result } = renderHook(() => useDiagramSave('d1'));

    act(() => {
      result.current.saveNow();
    });
    act(() => {
      result.current.saveNow();
    });

    await act(async () => {
      resolve();
    });

    expect(saveDiagramContentMock).toHaveBeenCalledTimes(1);
  });

  test('captures and saves a thumbnail after a successful content save', async () => {
    useDiagramStore.getState().addNode(makeNode('n1'));
    const { result } = renderHook(() => useDiagramSave('d1'));

    await act(async () => {
      await result.current.saveNow();
    });

    expect(captureThumbnailMock).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'n1' })]),
    );
    expect(saveDiagramThumbnailMock).toHaveBeenCalledWith('d1', {
      light: 'data:image/png;base64,light',
      dark: 'data:image/png;base64,dark',
    });
  });

  test('clears the thumbnail when the diagram is empty', async () => {
    captureThumbnailMock.mockResolvedValue({ light: null, dark: null });
    const { result } = renderHook(() => useDiagramSave('d1'));

    await act(async () => {
      await result.current.saveNow();
    });

    expect(saveDiagramThumbnailMock).toHaveBeenCalledWith('d1', { light: null, dark: null });
  });

  test('does not capture a thumbnail when the content save fails', async () => {
    saveDiagramContentMock.mockResolvedValue({ ok: false, error: 'Forbidden' });
    useDiagramStore.getState().addNode(makeNode('n1'));

    const { result } = renderHook(() => useDiagramSave('d1'));

    await act(async () => {
      await result.current.saveNow();
    });

    expect(captureThumbnailMock).not.toHaveBeenCalled();
    expect(saveDiagramThumbnailMock).not.toHaveBeenCalled();
  });

  test('thumbnail capture failure does not affect save status or show a toast', async () => {
    captureThumbnailMock.mockRejectedValue(new Error('viewport not found'));
    useDiagramStore.getState().addNode(makeNode('n1'));

    const { result } = renderHook(() => useDiagramSave('d1'));

    await act(async () => {
      await result.current.saveNow();
    });

    expect(result.current.status).toBe('saved');
    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  test('thumbnail save action failure does not affect save status or show a toast', async () => {
    saveDiagramThumbnailMock.mockResolvedValue({ ok: false, error: 'Forbidden' });
    useDiagramStore.getState().addNode(makeNode('n1'));

    const { result } = renderHook(() => useDiagramSave('d1'));

    await act(async () => {
      await result.current.saveNow();
    });

    expect(result.current.status).toBe('saved');
    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  test('does not call markSaved when content changed mid-save', async () => {
    let resolve!: () => void;
    saveDiagramContentMock.mockImplementation(
      () =>
        new Promise<{ ok: true; data: undefined }>((res) => {
          resolve = () => res({ ok: true, data: undefined });
        }),
    );

    useDiagramStore.getState().addNode(makeNode('n1'));
    const { result } = renderHook(() => useDiagramSave('d1'));

    act(() => {
      result.current.saveNow();
    });

    useDiagramStore.getState().addNode(makeNode('n2'));

    await act(async () => {
      resolve();
    });

    expect(useDiagramStore.getState().dirty).toBe(true);
  });
});
