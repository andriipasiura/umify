import { beforeEach, describe, expect, test } from 'vitest';

import { EMPTY_DIAGRAM_CONTENT } from '@/features/diagram/schema/diagram-content';
import { type GuestDiagram } from '@/features/diagram/schema/guest-diagram';

import {
  clearGuestDiagram,
  GUEST_DIAGRAM_STORAGE_KEY,
  isGuestDiagramEmpty,
  readGuestDiagram,
  writeGuestDiagram,
} from './guest-diagram-storage';

const makeGuestDiagram = (overrides: Partial<GuestDiagram> = {}): GuestDiagram => ({
  version: 1,
  title: 'Untitled diagram',
  content: EMPTY_DIAGRAM_CONTENT,
  updatedAt: Date.now(),
  ...overrides,
});

describe('guest-diagram-storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('returns null when nothing is stored', () => {
    expect(readGuestDiagram()).toBeNull();
  });

  test('round-trips a written guest diagram', () => {
    const diagram = makeGuestDiagram({ title: 'My diagram' });
    writeGuestDiagram(diagram);
    expect(readGuestDiagram()).toEqual(diagram);
  });

  test('returns null for corrupt JSON', () => {
    window.localStorage.setItem(GUEST_DIAGRAM_STORAGE_KEY, '{not-json');
    expect(readGuestDiagram()).toBeNull();
  });

  test('returns null for JSON that fails schema validation', () => {
    window.localStorage.setItem(GUEST_DIAGRAM_STORAGE_KEY, JSON.stringify({ foo: 'bar' }));
    expect(readGuestDiagram()).toBeNull();
  });

  test('clears the stored guest diagram', () => {
    writeGuestDiagram(makeGuestDiagram());
    clearGuestDiagram();
    expect(readGuestDiagram()).toBeNull();
  });

  test('isGuestDiagramEmpty is true when there are no nodes or edges', () => {
    expect(isGuestDiagramEmpty(makeGuestDiagram())).toBe(true);
  });

  test('isGuestDiagramEmpty is false when nodes exist', () => {
    const diagram = makeGuestDiagram({
      content: {
        version: 1,
        nodes: [
          {
            id: '1',
            type: 'actor',
            position: { x: 0, y: 0 },
            data: { kind: 'actor', label: 'Actor' },
          },
        ],
        edges: [],
      },
    });
    expect(isGuestDiagramEmpty(diagram)).toBe(false);
  });
});
