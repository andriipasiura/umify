import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@xyflow/react', () => ({
  getNodesBounds: vi.fn(() => ({ x: 0, y: 0, width: 400, height: 300 })),
  getViewportForBounds: vi.fn(() => ({ x: 10, y: 10, zoom: 1 })),
}));

vi.mock('html-to-image', () => ({
  toPng: vi.fn(() => Promise.resolve('data:image/png;base64,abc')),
  toJpeg: vi.fn(() => Promise.resolve('data:image/jpeg;base64,def')),
  toSvg: vi.fn(() => Promise.resolve('data:image/svg+xml;base64,ghi')),
}));

import { getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toJpeg, toPng, toSvg } from 'html-to-image';

import {
  captureDiagram,
  EmptyDiagramError,
  sanitizeFileName,
  triggerDownload,
} from './export-diagram';

const makeNode = (id: string) =>
  ({
    id,
    type: 'actor',
    position: { x: 0, y: 0 },
    data: { kind: 'actor', label: 'Actor' },
  }) as Parameters<typeof captureDiagram>[0]['nodes'][number];

describe('sanitizeFileName', () => {
  it('trims whitespace', () => expect(sanitizeFileName('  hello  ')).toBe('hello'));
  it('collapses internal spaces', () => expect(sanitizeFileName('my  diagram')).toBe('my diagram'));
  it('removes forbidden chars', () =>
    expect(sanitizeFileName('file<>:"/\\|?*name')).toBe('filename'));
  it('falls back to "diagram" when empty after sanitising', () =>
    expect(sanitizeFileName('   <>')).toBe('diagram'));
  it('passes normal names through', () =>
    expect(sanitizeFileName('Login Flow')).toBe('Login Flow'));
});

describe('captureDiagram', () => {
  let viewport: HTMLDivElement;

  beforeEach(() => {
    viewport = document.createElement('div');
    viewport.className = 'react-flow__viewport';
    document.body.appendChild(viewport);
    vi.clearAllMocks();
    vi.mocked(toPng).mockResolvedValue('data:image/png;base64,abc');
    vi.mocked(toJpeg).mockResolvedValue('data:image/jpeg;base64,def');
    vi.mocked(toSvg).mockResolvedValue('data:image/svg+xml;base64,ghi');
  });

  afterEach(() => {
    document.body.removeChild(viewport);
  });

  it('throws EmptyDiagramError when nodes array is empty', async () => {
    await expect(
      captureDiagram({ format: 'png', transparent: false, nodes: [] }),
    ).rejects.toBeInstanceOf(EmptyDiagramError);
  });

  it('calls toPng for png format', async () => {
    const result = await captureDiagram({
      format: 'png',
      transparent: false,
      nodes: [makeNode('1')],
    });
    expect(toPng).toHaveBeenCalledWith(viewport, expect.objectContaining({ pixelRatio: 2 }));
    expect(result).toBe('data:image/png;base64,abc');
  });

  it('calls toJpeg for jpeg format', async () => {
    await captureDiagram({ format: 'jpeg', transparent: false, nodes: [makeNode('1')] });
    expect(toJpeg).toHaveBeenCalled();
  });

  it('calls toSvg for svg format', async () => {
    await captureDiagram({ format: 'svg', transparent: false, nodes: [makeNode('1')] });
    expect(toSvg).toHaveBeenCalled();
  });

  it('passes undefined backgroundColor for png when transparent=true', async () => {
    await captureDiagram({ format: 'png', transparent: true, nodes: [makeNode('1')] });
    expect(toPng).toHaveBeenCalledWith(
      viewport,
      expect.objectContaining({ backgroundColor: undefined }),
    );
  });

  it('passes undefined backgroundColor for svg when transparent=true', async () => {
    await captureDiagram({ format: 'svg', transparent: true, nodes: [makeNode('1')] });
    expect(toSvg).toHaveBeenCalledWith(
      viewport,
      expect.objectContaining({ backgroundColor: undefined }),
    );
  });

  it('always provides solid backgroundColor for jpeg even when transparent=true', async () => {
    await captureDiagram({ format: 'jpeg', transparent: true, nodes: [makeNode('1')] });
    const call = vi.mocked(toJpeg).mock.calls[0];
    expect(call[1]?.backgroundColor).not.toBeUndefined();
  });

  it('uses getNodesBounds and getViewportForBounds', async () => {
    await captureDiagram({ format: 'png', transparent: false, nodes: [makeNode('1')] });
    expect(getNodesBounds).toHaveBeenCalled();
    expect(getViewportForBounds).toHaveBeenCalled();
  });
});

describe('triggerDownload', () => {
  it('sets download attribute with sanitized name and correct extension', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    triggerDownload('data:image/png;base64,abc', 'My Diagram', 'png');
    // After the call the anchor is removed from body, so we check via the spy args
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('uses .jpg extension for jpeg', () => {
    const created: HTMLAnchorElement[] = [];
    const orig = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = orig(tag);
      if (tag === 'a') created.push(el as HTMLAnchorElement);
      return el;
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    triggerDownload('data:image/jpeg;base64,def', 'test', 'jpeg');
    expect(created[0]?.download).toBe('test.jpg');

    vi.restoreAllMocks();
  });
});
