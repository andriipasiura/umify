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

const SCHEME_VARS: Record<'light' | 'dark', Record<string, string>> = {
  light: { '--background': 'white', '--foreground': 'black', '--primary': 'blue' },
  dark: { '--background': 'black', '--foreground': 'white', '--primary': 'skyblue' },
};

describe('captureThumbnail', () => {
  let captureRoot: HTMLDivElement;
  let realGetComputedStyle: typeof window.getComputedStyle;

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
    document.documentElement.classList.remove('dark');

    realGetComputedStyle = window.getComputedStyle;
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el, ...rest) => {
      if (el === document.documentElement) {
        const scheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        const vars = SCHEME_VARS[scheme];
        return { getPropertyValue: (prop: string) => vars[prop] ?? '' } as CSSStyleDeclaration;
      }
      return realGetComputedStyle(el, ...rest);
    });

    captureRoot = document.createElement('div');
    captureRoot.setAttribute('data-diagram-capture-root', '');
    document.body.appendChild(captureRoot);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.removeChild(captureRoot);
    document.documentElement.classList.remove('dark');
  });

  it('returns null for both schemes when the diagram is empty', async () => {
    vi.mocked(captureDiagram).mockRejectedValue(new EmptyDiagramError());
    await expect(captureThumbnail([])).resolves.toEqual({ light: null, dark: null });
  });

  it('rethrows non-empty-diagram capture errors', async () => {
    vi.mocked(captureDiagram).mockRejectedValue(new Error('viewport not found'));
    await expect(captureThumbnail([makeNode('1')])).rejects.toThrow('viewport not found');
  });

  it('captures the live scheme directly and downscales both results', async () => {
    vi.mocked(captureDiagram)
      .mockResolvedValueOnce('data:image/png;base64,raw-live')
      .mockResolvedValueOnce('data:image/png;base64,raw-other');
    const nodes = [makeNode('1')];

    const result = await captureThumbnail(nodes);

    expect(captureDiagram).toHaveBeenNthCalledWith(1, { format: 'png', transparent: true, nodes });
    expect(result).toEqual({
      light: `data:image/png;base64,resized-${THUMBNAIL_MAX_WIDTH}x${THUMBNAIL_MAX_HEIGHT}`,
      dark: `data:image/png;base64,resized-${THUMBNAIL_MAX_WIDTH}x${THUMBNAIL_MAX_HEIGHT}`,
    });
  });

  it("renders the off-screen capture with the other scheme's real colors, positioned off-screen, and removes it afterward", async () => {
    document.documentElement.classList.remove('dark');
    let capturedContainer: HTMLElement | null = null;
    let observedForeground: string | null = null;

    vi.mocked(captureDiagram).mockImplementation(async ({ root }) => {
      if (root && root !== document) {
        capturedContainer = root as HTMLElement;
        const clone = capturedContainer.firstElementChild as HTMLElement;
        observedForeground = clone.style.getPropertyValue('--foreground');
        expect(capturedContainer.parentNode).toBe(document.body);
        expect(capturedContainer.style.left).toBe('-10000px');
      }
      return 'data:image/png;base64,raw';
    });

    await captureThumbnail([makeNode('1')]);

    expect(observedForeground).toBe(SCHEME_VARS.dark['--foreground']);
    expect(document.body.contains(capturedContainer)).toBe(false);
  });

  it("picks the dark scheme's real colors for the off-screen clone when the app is in dark mode", async () => {
    document.documentElement.classList.add('dark');
    let observedForeground: string | null = null;

    vi.mocked(captureDiagram).mockImplementation(async ({ root }) => {
      if (root && root !== document) {
        const clone = (root as HTMLElement).firstElementChild as HTMLElement;
        observedForeground = clone.style.getPropertyValue('--foreground');
      }
      return 'data:image/png;base64,raw';
    });

    await captureThumbnail([makeNode('1')]);

    expect(observedForeground).toBe(SCHEME_VARS.light['--foreground']);
  });

  it('rewrites duplicate marker ids inside the clone so refs do not resolve to the live marker', async () => {
    captureRoot.innerHTML = `
      <svg><defs><marker id="uml-arrow"></marker></defs></svg>
      <path marker-end="url(#uml-arrow)"></path>
    `;

    vi.mocked(captureDiagram).mockImplementation(async ({ root }) => {
      if (root && root !== document) {
        const clone = (root as HTMLElement).firstElementChild as HTMLElement;
        const marker = clone.querySelector('marker');
        const path = clone.querySelector('path');
        expect(marker?.id).toBe('uml-arrow-thumb-dark');
        expect(path?.getAttribute('marker-end')).toBe('url(#uml-arrow-thumb-dark)');
      }
      return 'data:image/png;base64,raw';
    });

    await captureThumbnail([makeNode('1')]);
  });

  it('falls back to a plain capture when no capture root is present in the document', async () => {
    document.body.removeChild(captureRoot);
    vi.mocked(captureDiagram).mockResolvedValue('data:image/png;base64,raw');

    await captureThumbnail([makeNode('1')]);

    expect(captureDiagram).toHaveBeenCalledTimes(2);
    for (const [args] of vi.mocked(captureDiagram).mock.calls) {
      expect(args.root).toBeUndefined();
    }

    captureRoot = document.createElement('div');
    captureRoot.setAttribute('data-diagram-capture-root', '');
    document.body.appendChild(captureRoot);
  });
});
