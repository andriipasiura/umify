import { renderHook } from '@testing-library/react';
import { useReactFlow, useStore } from '@xyflow/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useDiagramZoom } from './use-diagram-zoom';

vi.mock('@xyflow/react', () => ({
  useReactFlow: vi.fn(),
  useStore: vi.fn(),
}));

const mockZoomIn = vi.fn();
const mockZoomOut = vi.fn();
const mockFitView = vi.fn();
const mockZoomTo = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useReactFlow).mockReturnValue({
    zoomIn: mockZoomIn,
    zoomOut: mockZoomOut,
    fitView: mockFitView,
    zoomTo: mockZoomTo,
  } as unknown as ReturnType<typeof useReactFlow>);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(useStore).mockImplementation((selector: any) => selector({ transform: [0, 0, 1] }));
});

describe('useDiagramZoom', () => {
  test('returns zoomPercent as a rounded integer from the store transform', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useStore).mockImplementation((selector: any) => selector({ transform: [0, 0, 1.5] }));
    const { result } = renderHook(() => useDiagramZoom());
    expect(result.current.zoomPercent).toBe(150);
  });

  test('rounds fractional zoom values', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useStore).mockImplementation((selector: any) =>
      selector({ transform: [0, 0, 1.456] }),
    );
    const { result } = renderHook(() => useDiagramZoom());
    expect(result.current.zoomPercent).toBe(146);
  });

  test('fitView calls rfFitView with padding 0.2', () => {
    const { result } = renderHook(() => useDiagramZoom());
    result.current.fitView();
    expect(mockFitView).toHaveBeenCalledWith({ padding: 0.2 });
  });

  test('resetZoom calls zoomTo with 1 and duration 200', () => {
    const { result } = renderHook(() => useDiagramZoom());
    result.current.resetZoom();
    expect(mockZoomTo).toHaveBeenCalledWith(1, { duration: 200 });
  });

  test('zoomIn and zoomOut are the functions from useReactFlow', () => {
    const { result } = renderHook(() => useDiagramZoom());
    expect(result.current.zoomIn).toBe(mockZoomIn);
    expect(result.current.zoomOut).toBe(mockZoomOut);
  });
});
