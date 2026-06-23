import { describe, expect, test } from 'vitest';

import { diagramMetaSchema } from './diagram-meta';

describe('diagramMetaSchema', () => {
  test('accepts valid input', () => {
    const result = diagramMetaSchema.safeParse({
      title: 'Login Flow',
      category: 'web app',
      tags: ['auth', 'login'],
      visibility: 'public',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe('web app');
    }
  });

  test('trims whitespace from title and category', () => {
    const result = diagramMetaSchema.safeParse({
      title: '  Login Flow  ',
      category: '  web app  ',
      tags: [],
      visibility: 'private',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Login Flow');
      expect(result.data.category).toBe('web app');
    }
  });

  test('accepts empty string for category (converted to null in action)', () => {
    const result = diagramMetaSchema.safeParse({
      title: 'Test',
      category: '',
      tags: [],
      visibility: 'private',
    });
    expect(result.success).toBe(true);
  });

  test('rejects empty title', () => {
    const result = diagramMetaSchema.safeParse({
      title: '',
      category: '',
      tags: [],
      visibility: 'public',
    });
    expect(result.success).toBe(false);
  });

  test('rejects more than 20 tags', () => {
    const result = diagramMetaSchema.safeParse({
      title: 'Test',
      category: '',
      tags: Array.from({ length: 21 }, (_, i) => `tag${i}`),
      visibility: 'public',
    });
    expect(result.success).toBe(false);
  });

  test('rejects invalid visibility', () => {
    const result = diagramMetaSchema.safeParse({
      title: 'Test',
      category: '',
      tags: [],
      visibility: 'internal',
    });
    expect(result.success).toBe(false);
  });
});
