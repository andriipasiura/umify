import { describe, expect, test } from 'vitest';

import { diagramThumbnailSchema, THUMBNAIL_MAX_LENGTH } from './diagram-thumbnail';

describe('diagramThumbnailSchema', () => {
  test('accepts a valid PNG data URL', () => {
    const result = diagramThumbnailSchema.safeParse('data:image/png;base64,YWJjMTIz');
    expect(result.success).toBe(true);
  });

  test('accepts null', () => {
    const result = diagramThumbnailSchema.safeParse(null);
    expect(result.success).toBe(true);
  });

  test('rejects a JPEG data URL', () => {
    const result = diagramThumbnailSchema.safeParse('data:image/jpeg;base64,YWJjMTIz');
    expect(result.success).toBe(false);
  });

  test('rejects a plain string', () => {
    const result = diagramThumbnailSchema.safeParse('not-a-data-url');
    expect(result.success).toBe(false);
  });

  test('rejects an over-length string', () => {
    const oversized = `data:image/png;base64,${'a'.repeat(THUMBNAIL_MAX_LENGTH)}`;
    const result = diagramThumbnailSchema.safeParse(oversized);
    expect(result.success).toBe(false);
  });

  test('rejects undefined', () => {
    const result = diagramThumbnailSchema.safeParse(undefined);
    expect(result.success).toBe(false);
  });
});
