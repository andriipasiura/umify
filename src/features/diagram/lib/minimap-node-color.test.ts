import { describe, expect, test } from 'vitest';

import { type UmlNode } from '@/features/diagram/types';

import { miniMapNodeColor } from './minimap-node-color';

const makeNode = (kind: UmlNode['data']['kind']): UmlNode =>
  ({
    id: 'n1',
    type: kind,
    position: { x: 0, y: 0 },
    data: { kind, label: 'test' },
  }) as UmlNode;

describe('miniMapNodeColor', () => {
  test('actor → var(--chart-1)', () => {
    expect(miniMapNodeColor(makeNode('actor'))).toBe('var(--chart-1)');
  });

  test('usecase → var(--chart-2)', () => {
    expect(miniMapNodeColor(makeNode('usecase'))).toBe('var(--chart-2)');
  });

  test('boundary → var(--chart-3)', () => {
    expect(miniMapNodeColor(makeNode('boundary'))).toBe('var(--chart-3)');
  });

  test('note → var(--chart-4)', () => {
    expect(miniMapNodeColor(makeNode('note'))).toBe('var(--chart-4)');
  });
});
