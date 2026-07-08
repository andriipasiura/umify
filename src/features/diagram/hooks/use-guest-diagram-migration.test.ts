import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const { pushMock, importGuestDiagramMock, toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  importGuestDiagramMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));
vi.mock('@/features/diagram/server/diagram.actions', () => ({
  importGuestDiagram: importGuestDiagramMock,
}));
vi.mock('sonner', () => ({ toast: { success: toastSuccessMock, error: toastErrorMock } }));

import { clearGuestDiagram, writeGuestDiagram } from '@/features/diagram/lib/guest-diagram-storage';
import { EMPTY_DIAGRAM_CONTENT } from '@/features/diagram/schema/diagram-content';
import { type GuestDiagram } from '@/features/diagram/schema/guest-diagram';

import { useGuestDiagramMigration } from './use-guest-diagram-migration';

const makeGuestDiagram = (overrides: Partial<GuestDiagram> = {}): GuestDiagram => ({
  version: 1,
  title: 'Untitled diagram',
  content: EMPTY_DIAGRAM_CONTENT,
  updatedAt: Date.now(),
  ...overrides,
});

const nonEmptyContent = {
  version: 1 as const,
  nodes: [
    {
      id: 'n1',
      type: 'actor' as const,
      position: { x: 0, y: 0 },
      data: { kind: 'actor' as const, label: 'Actor' },
    },
  ],
  edges: [],
};

beforeEach(() => {
  window.localStorage.clear();
  pushMock.mockReset();
  importGuestDiagramMock.mockReset();
  toastSuccessMock.mockReset();
  toastErrorMock.mockReset();
});

afterEach(() => {
  clearGuestDiagram();
});

describe('useGuestDiagramMigration', () => {
  test('does nothing when no guest diagram is stored', () => {
    renderHook(() => useGuestDiagramMigration());
    expect(importGuestDiagramMock).not.toHaveBeenCalled();
  });

  test('clears an empty guest diagram silently', () => {
    writeGuestDiagram(makeGuestDiagram());
    renderHook(() => useGuestDiagramMigration());

    expect(importGuestDiagramMock).not.toHaveBeenCalled();
    expect(toastSuccessMock).not.toHaveBeenCalled();
  });

  test('imports, clears storage, toasts, and redirects on success', async () => {
    writeGuestDiagram(makeGuestDiagram({ title: 'My diagram', content: nonEmptyContent }));
    importGuestDiagramMock.mockResolvedValue({ ok: true, data: { id: 'new_id' } });

    await act(async () => {
      renderHook(() => useGuestDiagramMigration());
    });

    expect(importGuestDiagramMock).toHaveBeenCalledWith({
      title: 'My diagram',
      content: nonEmptyContent,
    });
    expect(toastSuccessMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/diagrams/new_id');
  });

  test('keeps the guest diagram in storage and toasts an error on failure', async () => {
    writeGuestDiagram(makeGuestDiagram({ title: 'My diagram', content: nonEmptyContent }));
    importGuestDiagramMock.mockResolvedValue({ ok: false, error: 'Invalid input' });

    await act(async () => {
      renderHook(() => useGuestDiagramMigration());
    });

    expect(toastErrorMock).toHaveBeenCalledWith('Invalid input');
    expect(pushMock).not.toHaveBeenCalled();
  });

  test('only fires once even if the hook re-renders (strict-mode guard)', async () => {
    writeGuestDiagram(makeGuestDiagram({ title: 'My diagram', content: nonEmptyContent }));
    importGuestDiagramMock.mockResolvedValue({ ok: true, data: { id: 'new_id' } });

    const { rerender } = renderHook(() => useGuestDiagramMigration());

    await act(async () => {
      rerender();
    });

    expect(importGuestDiagramMock).toHaveBeenCalledTimes(1);
  });
});
