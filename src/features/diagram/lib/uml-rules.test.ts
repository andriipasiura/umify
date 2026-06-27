import { type Connection } from '@xyflow/react';
import { describe, expect, test } from 'vitest';

import { type UmlNode } from '../types';
import { isValidUmlConnection, resolveRelation } from './uml-rules';

const makeNode = (id: string, kind: UmlNode['data']['kind']): UmlNode =>
  ({
    id,
    type: kind,
    position: { x: 0, y: 0 },
    data: { kind, label: id },
  }) as UmlNode;

const conn = (source: string, target: string): Connection => ({
  source,
  target,
  sourceHandle: null,
  targetHandle: null,
});

const nodes: UmlNode[] = [
  makeNode('actor1', 'actor'),
  makeNode('actor2', 'actor'),
  makeNode('uc1', 'usecase'),
  makeNode('uc2', 'usecase'),
  makeNode('b1', 'boundary'),
  makeNode('note1', 'note'),
];

describe('resolveRelation', () => {
  test('actor → usecase = association', () => {
    expect(resolveRelation(conn('actor1', 'uc1'), nodes)).toBe('association');
  });

  test('usecase → actor = association', () => {
    expect(resolveRelation(conn('uc1', 'actor1'), nodes)).toBe('association');
  });

  test('usecase → usecase defaults to include', () => {
    expect(resolveRelation(conn('uc1', 'uc2'), nodes)).toBe('include');
  });

  test('usecase → usecase with preferredRelation=extend = extend', () => {
    expect(resolveRelation(conn('uc1', 'uc2'), nodes, 'extend')).toBe('extend');
  });

  test('usecase → usecase with preferredRelation=include = include', () => {
    expect(resolveRelation(conn('uc1', 'uc2'), nodes, 'include')).toBe('include');
  });

  test('usecase → usecase with preferredRelation=generalization falls back to include', () => {
    expect(resolveRelation(conn('uc1', 'uc2'), nodes, 'generalization')).toBe('include');
  });

  test('preferredRelation is ignored when pair forces a specific relation', () => {
    expect(resolveRelation(conn('actor1', 'actor2'), nodes, 'include')).toBe('generalization');
    expect(resolveRelation(conn('actor1', 'uc1'), nodes, 'extend')).toBe('association');
  });

  test('actor → actor = generalization', () => {
    expect(resolveRelation(conn('actor1', 'actor2'), nodes)).toBe('generalization');
  });

  test('boundary participates in no relation', () => {
    expect(resolveRelation(conn('b1', 'uc1'), nodes)).toBeNull();
    expect(resolveRelation(conn('uc1', 'b1'), nodes)).toBeNull();
    expect(resolveRelation(conn('b1', 'actor1'), nodes)).toBeNull();
  });

  test('note participates in no relation', () => {
    expect(resolveRelation(conn('note1', 'uc1'), nodes)).toBeNull();
    expect(resolveRelation(conn('note1', 'actor1'), nodes)).toBeNull();
  });

  test('self-loop is always null', () => {
    expect(resolveRelation(conn('actor1', 'actor1'), nodes)).toBeNull();
    expect(resolveRelation(conn('uc1', 'uc1'), nodes)).toBeNull();
  });

  test('unknown source/target node is null', () => {
    expect(resolveRelation(conn('ghost', 'uc1'), nodes)).toBeNull();
  });

  test('null source/target is null', () => {
    expect(
      resolveRelation(
        {
          source: null as unknown as string,
          target: 'uc1',
          sourceHandle: null,
          targetHandle: null,
        },
        nodes,
      ),
    ).toBeNull();
    expect(
      resolveRelation(
        {
          source: 'actor1',
          target: null as unknown as string,
          sourceHandle: null,
          targetHandle: null,
        },
        nodes,
      ),
    ).toBeNull();
  });
});

describe('isValidUmlConnection', () => {
  test('returns true for valid pairs', () => {
    expect(isValidUmlConnection(conn('actor1', 'uc1'), nodes)).toBe(true);
    expect(isValidUmlConnection(conn('uc1', 'uc2'), nodes)).toBe(true);
    expect(isValidUmlConnection(conn('actor1', 'actor2'), nodes)).toBe(true);
  });

  test('returns false for invalid pairs', () => {
    expect(isValidUmlConnection(conn('b1', 'uc1'), nodes)).toBe(false);
    expect(isValidUmlConnection(conn('note1', 'actor1'), nodes)).toBe(false);
    expect(isValidUmlConnection(conn('actor1', 'actor1'), nodes)).toBe(false);
  });
});
