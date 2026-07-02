import { describe, expect, test } from 'vitest';

import { type UmlNode } from '../types';
import { layerBoundariesFirst } from './diagram-canvas-utils';

const node = (id: string, kind: UmlNode['data']['kind']): UmlNode => ({
  id,
  type: kind,
  position: { x: 0, y: 0 },
  data: { kind, label: id },
});

describe('layerBoundariesFirst', () => {
  test('moves boundary nodes to the front, keeping other nodes after them', () => {
    const sorted = layerBoundariesFirst([
      node('actor-1', 'actor'),
      node('boundary-1', 'boundary'),
      node('usecase-1', 'usecase'),
    ]);

    expect(sorted[0]?.id).toBe('boundary-1');
    expect(sorted.map((n) => n.id)).toHaveLength(3);
  });

  test('does not mutate the input array', () => {
    const input = [node('actor-1', 'actor'), node('boundary-1', 'boundary')];
    layerBoundariesFirst(input);
    expect(input[0]?.id).toBe('actor-1');
  });

  test('returns an empty array unchanged', () => {
    expect(layerBoundariesFirst([])).toEqual([]);
  });
});
