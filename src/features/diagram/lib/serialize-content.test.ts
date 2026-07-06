import { describe, expect, test } from 'vitest';

import { diagramContentSchema } from '@/features/diagram/schema/diagram-content';
import type { UmlEdge, UmlNode } from '@/features/diagram/types';

import { toDiagramContent } from './serialize-content';

const makeNode = (extra: Record<string, unknown> = {}): UmlNode =>
  ({
    id: 'n1',
    type: 'actor',
    position: { x: 10, y: 20 },
    data: { kind: 'actor', label: 'User' },
    width: 80,
    height: 40,
    selected: true,
    dragging: true,
    ...extra,
  }) as unknown as UmlNode;

const makeEdge = (extra: Record<string, unknown> = {}): UmlEdge =>
  ({
    id: 'e1',
    source: 'n1',
    target: 'n2',
    sourceHandle: 'right',
    targetHandle: 'left',
    type: 'uml',
    data: { relation: 'association' },
    selected: true,
    ...extra,
  }) as unknown as UmlEdge;

describe('toDiagramContent', () => {
  test('sets version to 1', () => {
    expect(toDiagramContent([], []).version).toBe(1);
  });

  test('strips transient node fields', () => {
    const { nodes } = toDiagramContent([makeNode()], []);
    expect(nodes[0]).not.toHaveProperty('selected');
    expect(nodes[0]).not.toHaveProperty('dragging');
  });

  test('keeps width and height when present', () => {
    const { nodes } = toDiagramContent([makeNode()], []);
    expect(nodes[0].width).toBe(80);
    expect(nodes[0].height).toBe(40);
  });

  test('omits width and height when undefined', () => {
    const { nodes } = toDiagramContent([makeNode({ width: undefined, height: undefined })], []);
    expect(nodes[0]).not.toHaveProperty('width');
    expect(nodes[0]).not.toHaveProperty('height');
  });

  test('strips transient edge fields', () => {
    const { edges } = toDiagramContent([], [makeEdge()]);
    expect(edges[0]).not.toHaveProperty('selected');
  });

  test('keeps sourceHandle and targetHandle', () => {
    const { edges } = toDiagramContent([], [makeEdge()]);
    expect(edges[0].sourceHandle).toBe('right');
    expect(edges[0].targetHandle).toBe('left');
  });

  test('nulls out missing sourceHandle and targetHandle', () => {
    const { edges } = toDiagramContent(
      [],
      [makeEdge({ sourceHandle: undefined, targetHandle: undefined })],
    );
    expect(edges[0].sourceHandle).toBeNull();
    expect(edges[0].targetHandle).toBeNull();
  });

  test('round-trips through diagramContentSchema', () => {
    const content = toDiagramContent([makeNode()], [makeEdge()]);
    expect(diagramContentSchema.safeParse(content).success).toBe(true);
  });
});
