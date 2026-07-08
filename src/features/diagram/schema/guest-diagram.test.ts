import { describe, expect, test } from 'vitest';

import { EMPTY_DIAGRAM_CONTENT } from './diagram-content';
import { guestDiagramSchema } from './guest-diagram';

describe('guestDiagramSchema', () => {
  test('accepts a valid empty guest diagram', () => {
    const result = guestDiagramSchema.safeParse({
      version: 1,
      title: 'Untitled diagram',
      content: EMPTY_DIAGRAM_CONTENT,
      updatedAt: Date.now(),
    });
    expect(result.success).toBe(true);
  });

  test('rejects wrong version', () => {
    const result = guestDiagramSchema.safeParse({
      version: 2,
      title: 'Untitled diagram',
      content: EMPTY_DIAGRAM_CONTENT,
      updatedAt: Date.now(),
    });
    expect(result.success).toBe(false);
  });

  test('rejects empty title', () => {
    const result = guestDiagramSchema.safeParse({
      version: 1,
      title: '',
      content: EMPTY_DIAGRAM_CONTENT,
      updatedAt: Date.now(),
    });
    expect(result.success).toBe(false);
  });

  test('rejects invalid content', () => {
    const result = guestDiagramSchema.safeParse({
      version: 1,
      title: 'Untitled diagram',
      content: { version: 1, nodes: 'not-an-array', edges: [] },
      updatedAt: Date.now(),
    });
    expect(result.success).toBe(false);
  });

  test('rejects missing updatedAt', () => {
    const result = guestDiagramSchema.safeParse({
      version: 1,
      title: 'Untitled diagram',
      content: EMPTY_DIAGRAM_CONTENT,
    });
    expect(result.success).toBe(false);
  });
});
