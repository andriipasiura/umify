import { type UmlNode } from '@/features/diagram/types';

import { captureDiagram, EmptyDiagramError } from './export-diagram';

export const THUMBNAIL_MAX_WIDTH = 600;
export const THUMBNAIL_MAX_HEIGHT = 400;

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

export const captureThumbnail = async (nodes: UmlNode[]): Promise<string | null> => {
  let captured: string;
  try {
    captured = await captureDiagram({ format: 'png', transparent: true, nodes });
  } catch (error) {
    if (error instanceof EmptyDiagramError) return null;
    throw error;
  }

  return downscaleImage(captured, THUMBNAIL_MAX_WIDTH, THUMBNAIL_MAX_HEIGHT);
};
