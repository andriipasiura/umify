import { describe, expect, test } from 'vitest';

import { diagramContentSchema } from './diagram-content';

const validNode = (kind: 'actor' | 'usecase' | 'boundary' | 'note') => ({
  id: 'n1',
  type: kind,
  position: { x: 0, y: 0 },
  data: { kind, label: 'Test' },
});

const validEdge = {
  id: 'e1',
  source: 'n1',
  target: 'n2',
  type: 'uml' as const,
  data: { relation: 'association' as const },
};

describe('diagramContentSchema', () => {
  test('accepts a valid empty diagram', () => {
    const result = diagramContentSchema.safeParse({ version: 1, nodes: [], edges: [] });
    expect(result.success).toBe(true);
  });

  test('accepts all node kinds', () => {
    for (const kind of ['actor', 'usecase', 'boundary', 'note'] as const) {
      const result = diagramContentSchema.safeParse({
        version: 1,
        nodes: [validNode(kind)],
        edges: [],
      });
      expect(result.success, `kind=${kind}`).toBe(true);
    }
  });

  test('accepts all edge relations', () => {
    for (const relation of ['association', 'include', 'extend', 'generalization'] as const) {
      const result = diagramContentSchema.safeParse({
        version: 1,
        nodes: [],
        edges: [{ ...validEdge, data: { relation } }],
      });
      expect(result.success, `relation=${relation}`).toBe(true);
    }
  });

  test('rejects wrong version', () => {
    const result = diagramContentSchema.safeParse({ version: 2, nodes: [], edges: [] });
    expect(result.success).toBe(false);
  });

  test('rejects unknown node kind', () => {
    const result = diagramContentSchema.safeParse({
      version: 1,
      nodes: [{ ...validNode('actor'), type: 'unknown', data: { kind: 'unknown', label: '' } }],
      edges: [],
    });
    expect(result.success).toBe(false);
  });

  test('rejects unknown edge relation', () => {
    const result = diagramContentSchema.safeParse({
      version: 1,
      nodes: [],
      edges: [{ ...validEdge, data: { relation: 'invalid' } }],
    });
    expect(result.success).toBe(false);
  });

  test('rejects missing fields', () => {
    expect(diagramContentSchema.safeParse({ version: 1, nodes: [] }).success).toBe(false);
    expect(diagramContentSchema.safeParse({ version: 1, edges: [] }).success).toBe(false);
    expect(diagramContentSchema.safeParse({ nodes: [], edges: [] }).success).toBe(false);
  });

  test('preserves sourceHandle and targetHandle when present', () => {
    const result = diagramContentSchema.safeParse({
      version: 1,
      nodes: [],
      edges: [{ ...validEdge, sourceHandle: 'right', targetHandle: 'left' }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.edges[0]).toMatchObject({ sourceHandle: 'right', targetHandle: 'left' });
    }
  });

  test('accepts edges without sourceHandle/targetHandle for backward compatibility', () => {
    const result = diagramContentSchema.safeParse({
      version: 1,
      nodes: [],
      edges: [validEdge],
    });
    expect(result.success).toBe(true);
  });

  test('accepts null sourceHandle/targetHandle', () => {
    const result = diagramContentSchema.safeParse({
      version: 1,
      nodes: [],
      edges: [{ ...validEdge, sourceHandle: null, targetHandle: null }],
    });
    expect(result.success).toBe(true);
  });
});
