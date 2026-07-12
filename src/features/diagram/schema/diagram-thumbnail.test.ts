import { describe, expect, test } from 'vitest';

import { diagramThumbnailSchema, THUMBNAIL_MAX_LENGTH } from './diagram-thumbnail';

describe('diagramThumbnailSchema', () => {
  test('accepts valid PNG data URLs for both light and dark', () => {
    const result = diagramThumbnailSchema.safeParse({
      light: 'data:image/png;base64,YWJjMTIz',
      dark: 'data:image/png;base64,YWJjMTIz',
    });
    expect(result.success).toBe(true);
  });

  test('accepts null for either field', () => {
    const result = diagramThumbnailSchema.safeParse({ light: null, dark: null });
    expect(result.success).toBe(true);
  });

  test('rejects a JPEG data URL', () => {
    const result = diagramThumbnailSchema.safeParse({
      light: 'data:image/jpeg;base64,YWJjMTIz',
      dark: null,
    });
    expect(result.success).toBe(false);
  });

  test('rejects a plain string', () => {
    const result = diagramThumbnailSchema.safeParse({ light: 'not-a-data-url', dark: null });
    expect(result.success).toBe(false);
  });

  test('rejects an over-length string', () => {
    const oversized = `data:image/png;base64,${'a'.repeat(THUMBNAIL_MAX_LENGTH)}`;
    const result = diagramThumbnailSchema.safeParse({ light: oversized, dark: null });
    expect(result.success).toBe(false);
  });

  test('rejects a missing field', () => {
    const result = diagramThumbnailSchema.safeParse({ light: null });
    expect(result.success).toBe(false);
  });

  test('rejects undefined', () => {
    const result = diagramThumbnailSchema.safeParse(undefined);
    expect(result.success).toBe(false);
  });
});
