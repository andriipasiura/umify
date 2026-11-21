import { beforeEach, describe, expect, test } from 'vitest';

import { EMPTY_DIAGRAM_CONTENT } from '@/features/diagram/schema/diagram-content';

import {
  clearGeneratedDiagram,
  GENERATED_DIAGRAM_STORAGE_KEY,
  readGeneratedDiagram,
  writeGeneratedDiagram,
} from './generated-diagram-storage';

const draft = { title: 'Bookstore', content: EMPTY_DIAGRAM_CONTENT };

describe('generated-diagram-storage', () => {
  beforeEach(() => {
    clearGeneratedDiagram();
  });

  test('returns null when nothing is stored', () => {
    expect(readGeneratedDiagram()).toBeNull();
  });

  test('round-trips a written draft through sessionStorage', () => {
    writeGeneratedDiagram(draft);
    expect(window.localStorage.getItem(GENERATED_DIAGRAM_STORAGE_KEY)).toBeNull();
    expect(readGeneratedDiagram()).toEqual(draft);
  });

  test('returns null for corrupt JSON or invalid shape', () => {
    window.sessionStorage.setItem(GENERATED_DIAGRAM_STORAGE_KEY, '{not json');
    expect(readGeneratedDiagram()).toBeNull();

    window.sessionStorage.setItem(GENERATED_DIAGRAM_STORAGE_KEY, JSON.stringify({ title: '' }));
    expect(readGeneratedDiagram()).toBeNull();
  });

  test('clears the draft', () => {
    writeGeneratedDiagram(draft);
    clearGeneratedDiagram();
    expect(readGeneratedDiagram()).toBeNull();
  });
});
