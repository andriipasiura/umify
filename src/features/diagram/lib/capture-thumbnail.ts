import { type UmlNode } from '@/features/diagram/types';

import { captureDiagram, EmptyDiagramError } from './export-diagram';

export const THUMBNAIL_MAX_WIDTH = 600;
export const THUMBNAIL_MAX_HEIGHT = 400;

export type DiagramThumbnailPair = { light: string | null; dark: string | null };

export const downscaleImage = (
  dataUrl: string,
  maxWidth: number,
  maxHeight: number,
): Promise<string> =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context is not available'));
        return;
      }

      ctx.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => reject(new Error('Failed to load image for downscaling'));
    image.src = dataUrl;
  });

const CAPTURE_ROOT_SELECTOR = '[data-diagram-capture-root]';
const CAPTURE_VARS = ['--background', '--foreground', '--primary'] as const;

type ColorScheme = 'light' | 'dark';

const readSchemeVars = (
  scheme: ColorScheme,
): Partial<Record<(typeof CAPTURE_VARS)[number], string>> => {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');
  const wantsDark = scheme === 'dark';
  if (isDark !== wantsDark) html.classList.toggle('dark', wantsDark);

  const computed = getComputedStyle(html);
  const vars = Object.fromEntries(
    CAPTURE_VARS.map((name) => [name, computed.getPropertyValue(name).trim()]),
  );

  if (isDark !== wantsDark) html.classList.toggle('dark', isDark);
  return vars;
};

const rewriteMarkerIds = (clone: HTMLElement, suffix: string): void => {
  clone.querySelectorAll<SVGMarkerElement>('marker[id]').forEach((marker) => {
    const oldId = marker.id;
    const newId = `${oldId}${suffix}`;
    marker.id = newId;
    clone
      .querySelectorAll(`[marker-end="url(#${oldId})"]`)
      .forEach((el) => el.setAttribute('marker-end', `url(#${newId})`));
  });
};

const captureOffscreen = async (nodes: UmlNode[], scheme: ColorScheme): Promise<string> => {
  const liveRoot = document.querySelector<HTMLElement>(CAPTURE_ROOT_SELECTOR);
  if (!liveRoot) return captureDiagram({ format: 'png', transparent: true, nodes });

  const vars = readSchemeVars(scheme);
  const clone = liveRoot.cloneNode(true) as HTMLElement;
  rewriteMarkerIds(clone, `-thumb-${scheme}`);
  for (const [name, value] of Object.entries(vars)) {
    if (value) clone.style.setProperty(name, value);
  }

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '-10000px';
  container.style.pointerEvents = 'none';
  container.setAttribute('aria-hidden', 'true');
  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    return await captureDiagram({ format: 'png', transparent: true, nodes, root: container });
  } finally {
    document.body.removeChild(container);
  }
};

export const captureThumbnail = async (nodes: UmlNode[]): Promise<DiagramThumbnailPair> => {
  const liveScheme: ColorScheme = document.documentElement.classList.contains('dark')
    ? 'dark'
    : 'light';
  const otherScheme: ColorScheme = liveScheme === 'dark' ? 'light' : 'dark';

  let liveCapture: string;
  let otherCapture: string;
  try {
    liveCapture = await captureDiagram({ format: 'png', transparent: true, nodes });
    otherCapture = await captureOffscreen(nodes, otherScheme);
  } catch (error) {
    if (error instanceof EmptyDiagramError) return { light: null, dark: null };
    throw error;
  }

  const [downscaledLive, downscaledOther] = await Promise.all([
    downscaleImage(liveCapture, THUMBNAIL_MAX_WIDTH, THUMBNAIL_MAX_HEIGHT),
    downscaleImage(otherCapture, THUMBNAIL_MAX_WIDTH, THUMBNAIL_MAX_HEIGHT),
  ]);

  return liveScheme === 'dark'
    ? { dark: downscaledLive, light: downscaledOther }
    : { light: downscaledLive, dark: downscaledOther };
};
