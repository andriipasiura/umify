import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const { toggleFavoriteMock, deleteDiagramMock } = vi.hoisted(() => ({
  toggleFavoriteMock: vi.fn(),
  deleteDiagramMock: vi.fn(),
}));

vi.mock('@/features/diagram/server/diagram.actions', () => ({
  toggleFavorite: toggleFavoriteMock,
  deleteDiagram: deleteDiagramMock,
}));

import { type DiagramCardData } from '@/features/diagram/types';

import { useDiagramBoard } from './use-diagram-board';

const diagram: DiagramCardData = {
  id: 'd1',
  title: 'Login Flow',
  visibility: 'public',
  category: null,
  tags: [],
  isFavorite: false,
  updatedAt: new Date('2026-06-01T00:00:00.000Z'),
  thumbnail: null,
};

describe('useDiagramBoard', () => {
  beforeEach(() => {
    toggleFavoriteMock.mockReset().mockResolvedValue({ ok: true, data: { isFavorite: true } });
    deleteDiagramMock.mockReset().mockResolvedValue({ ok: true, data: undefined });
  });

  test('optimistically toggles isFavorite', async () => {
    const { result } = renderHook(() => useDiagramBoard([diagram]));

    await act(async () => {
      result.current.handleToggleFavorite(diagram);
    });

    expect(toggleFavoriteMock).toHaveBeenCalledWith('d1');
  });

  test('optimistically removes diagram on delete confirm', async () => {
    const { result } = renderHook(() => useDiagramBoard([diagram]));

    act(() => {
      result.current.openDelete(diagram);
    });

    await act(async () => {
      result.current.handleConfirmDelete();
    });

    expect(deleteDiagramMock).toHaveBeenCalledWith('d1');
    expect(result.current.deleting).toBeNull();
  });

  test('opens and closes create modal', () => {
    const { result } = renderHook(() => useDiagramBoard([]));

    act(() => result.current.openCreate());
    expect(result.current.isCreateOpen).toBe(true);

    act(() => result.current.closeCreate());
    expect(result.current.isCreateOpen).toBe(false);
  });

  test('opens and closes edit modal', () => {
    const { result } = renderHook(() => useDiagramBoard([diagram]));

    act(() => result.current.openEdit(diagram));
    expect(result.current.editing).toEqual(diagram);

    act(() => result.current.closeEdit());
    expect(result.current.editing).toBeNull();
  });
});
