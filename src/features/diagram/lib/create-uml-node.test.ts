import { describe, expect, test } from 'vitest';

import { UML_NODE_KINDS } from '../types';
import { createUmlNode } from './create-uml-node';

const POS = { x: 100, y: 200 };

describe('createUmlNode', () => {
  test('each kind produces correct type and data.kind', () => {
    for (const kind of UML_NODE_KINDS) {
      const node = createUmlNode(kind, POS);
      expect(node.type).toBe(kind);
      expect(node.data.kind).toBe(kind);
    }
  });

  test('position is passed through', () => {
    const node = createUmlNode('actor', POS);
    expect(node.position).toEqual(POS);
  });

  test('generates unique ids', () => {
    const a = createUmlNode('actor', POS);
    const b = createUmlNode('actor', POS);
    expect(a.id).not.toBe(b.id);
  });

  test('actor and usecase have no default size', () => {
    const actor = createUmlNode('actor', POS);
    const uc = createUmlNode('usecase', POS);
    expect(actor.width).toBeUndefined();
    expect(actor.height).toBeUndefined();
    expect(uc.width).toBeUndefined();
    expect(uc.height).toBeUndefined();
  });

  test('boundary has default size', () => {
    const node = createUmlNode('boundary', POS);
    expect(node.width).toBe(240);
    expect(node.height).toBe(160);
  });

  test('note has default size', () => {
    const node = createUmlNode('note', POS);
    expect(node.width).toBe(160);
    expect(node.height).toBe(80);
  });

  test('default labels are set', () => {
    expect(createUmlNode('actor', POS).data.label).toBe('Actor');
    expect(createUmlNode('usecase', POS).data.label).toBe('Use Case');
    expect(createUmlNode('boundary', POS).data.label).toBe('System');
    expect(createUmlNode('note', POS).data.label).toBe('Note');
  });
});
