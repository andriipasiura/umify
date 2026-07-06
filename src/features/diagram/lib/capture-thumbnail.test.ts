import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./export-diagram', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./export-diagram')>();
  return { ...actual, captureDiagram: vi.fn() };
});

import {
  captureThumbnail,
  downscaleImage,
  THUMBNAIL_MAX_HEIGHT,
  THUMBNAIL_MAX_WIDTH,
} from './capture-thumbnail';
import { captureDiagram, EmptyDiagramError } from './export-diagram';

const makeNode = (id: string) =>
  ({
    id,
    type: 'actor',
    position: { x: 0, y: 0 },
    data: { kind: 'actor', label: 'Actor' },
  }) as Parameters<typeof captureThumbnail>[0][number];

let naturalSize = { width: 1200, height: 800 };
let failImageLoad = false;

class FakeImage {
  width = 0;
  height = 0;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  set src(_value: string) {
    queueMicrotask(() => {
      if (failImageLoad) {
        this.onerror?.();
        return;
      }
      this.width = naturalSize.width;
      this.height = naturalSize.height;
      this.onload?.();
    });
  }
}

describe('downscaleImage', () => {
  beforeEach(() => {
    naturalSize = { width: 1200, height: 800 };
    failImageLoad = false;
    vi.stubGlobal('Image', FakeImage);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(function (
      this: HTMLCanvasElement,
    ) {
      return `data:image/png;base64,resized-${this.width}x${this.height}`;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('downscales an oversized image to fit within the bounds', async () => {
    const result = await downscaleImage('data:image/png;base64,abc', 600, 400);
    expect(result).toBe('data:image/png;base64,resized-600x400');
  });

  it('never upscales a smaller image', async () => {
    naturalSize = { width: 300, height: 200 };
    const result = await downscaleImage('data:image/png;base64,abc', 600, 400);
    expect(result).toBe('data:image/png;base64,resized-300x200');
  });

  it('preserves aspect ratio for a tall image', async () => {
    naturalSize = { width: 400, height: 1600 };
    const result = await downscaleImage('data:image/png;base64,abc', 600, 400);
    expect(result).toBe('data:image/png;base64,resized-100x400');
  });

  it('rejects when the canvas 2D context is unavailable', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    await expect(downscaleImage('data:image/png;base64,abc', 600, 400)).rejects.toThrow(
      'Canvas 2D context is not available',
    );
  });

  it('rejects when the image fails to load', async () => {
    failImageLoad = true;
    await expect(downscaleImage('data:image/png;base64,abc', 600, 400)).rejects.toThrow(
      'Failed to load image for downscaling',
    );
  });
});

describe('captureThumbnail', () => {
  beforeEach(() => {
    naturalSize = { width: 1200, height: 800 };
    failImageLoad = false;
    vi.stubGlobal('Image', FakeImage);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(function (
      this: HTMLCanvasElement,
    ) {
      return `data:image/png;base64,resized-${this.width}x${this.height}`;
    });
    vi.mocked(captureDiagram).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns null when the diagram is empty', async () => {
    vi.mocked(captureDiagram).mockRejectedValue(new EmptyDiagramError());
    await expect(captureThumbnail([])).resolves.toBeNull();
  });

  it('captures as a transparent png and downscales the result', async () => {
    vi.mocked(captureDiagram).mockResolvedValue('data:image/png;base64,raw');
    const nodes = [makeNode('1')];

    const result = await captureThumbnail(nodes);

    expect(captureDiagram).toHaveBeenCalledWith({ format: 'png', transparent: true, nodes });
    expect(result).toBe(
      `data:image/png;base64,resized-${THUMBNAIL_MAX_WIDTH}x${THUMBNAIL_MAX_HEIGHT}`,
    );
  });

  it('rethrows non-empty-diagram capture errors', async () => {
    vi.mocked(captureDiagram).mockRejectedValue(new Error('viewport not found'));
    await expect(captureThumbnail([makeNode('1')])).rejects.toThrow('viewport not found');
  });

  it('downscales without a lossy quality argument', async () => {
    vi.mocked(captureDiagram).mockResolvedValue('data:image/png;base64,raw');
    const toDataURLSpy = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL');
    await captureThumbnail([makeNode('1')]);
    expect(toDataURLSpy).toHaveBeenCalledWith('image/png');
  });
});
