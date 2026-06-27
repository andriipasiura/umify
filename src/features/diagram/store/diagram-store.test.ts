import { type Connection } from '@xyflow/react';
import { beforeEach, describe, expect, test } from 'vitest';

import { type UmlNode } from '../types';
import { useDiagramStore } from './diagram-store';

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

const actor = makeNode('a1', 'actor');
const uc = makeNode('uc1', 'usecase');

beforeEach(() => {
  useDiagramStore.getState().load({ nodes: [], edges: [] });
});

describe('addNode', () => {
  test('adds the node and marks dirty', () => {
    useDiagramStore.getState().addNode(actor);
    const { nodes, dirty } = useDiagramStore.getState();
    expect(nodes).toHaveLength(1);
    expect(nodes[0].id).toBe('a1');
    expect(dirty).toBe(true);
  });
});

describe('onConnect', () => {
  test('creates an edge for a valid pair', () => {
    useDiagramStore.getState().load({ nodes: [actor, uc], edges: [] });
    useDiagramStore.getState().onConnect(conn('a1', 'uc1'));
    const { edges } = useDiagramStore.getState();
    expect(edges).toHaveLength(1);
    expect(edges[0].data?.relation).toBe('association');
  });

  test('rejects invalid pairs (boundary, note)', () => {
    const boundary = makeNode('b1', 'boundary');
    useDiagramStore.getState().load({ nodes: [boundary, uc], edges: [] });
    useDiagramStore.getState().onConnect(conn('b1', 'uc1'));
    expect(useDiagramStore.getState().edges).toHaveLength(0);
  });

  test('rejects self-loops', () => {
    useDiagramStore.getState().load({ nodes: [actor], edges: [] });
    useDiagramStore.getState().onConnect(conn('a1', 'a1'));
    expect(useDiagramStore.getState().edges).toHaveLength(0);
  });
});

describe('undo / redo', () => {
  test('undo restores the previous snapshot', () => {
    useDiagramStore.getState().addNode(actor);
    useDiagramStore.getState().addNode(uc);
    useDiagramStore.getState().undo();
    expect(useDiagramStore.getState().nodes).toHaveLength(1);
    expect(useDiagramStore.getState().nodes[0].id).toBe('a1');
  });

  test('redo re-applies the undone change', () => {
    useDiagramStore.getState().addNode(actor);
    useDiagramStore.getState().undo();
    useDiagramStore.getState().redo();
    expect(useDiagramStore.getState().nodes).toHaveLength(1);
  });

  test('undo on empty history does nothing', () => {
    useDiagramStore.getState().undo();
    expect(useDiagramStore.getState().nodes).toHaveLength(0);
  });
});

describe('load', () => {
  test('resets dirty and history', () => {
    useDiagramStore.getState().addNode(actor);
    useDiagramStore.getState().load({ nodes: [uc], edges: [] });
    const { nodes, dirty, past, future } = useDiagramStore.getState();
    expect(nodes[0].id).toBe('uc1');
    expect(dirty).toBe(false);
    expect(past).toHaveLength(0);
    expect(future).toHaveLength(0);
  });
});

describe('markSaved', () => {
  test('clears the dirty flag', () => {
    useDiagramStore.getState().addNode(actor);
    expect(useDiagramStore.getState().dirty).toBe(true);
    useDiagramStore.getState().markSaved();
    expect(useDiagramStore.getState().dirty).toBe(false);
  });
});

describe('updateNodeLabel', () => {
  test('updates the label and marks dirty without pushing history', () => {
    useDiagramStore.getState().load({ nodes: [actor], edges: [] });
    useDiagramStore.getState().markSaved();
    useDiagramStore.getState().updateNodeLabel('a1', 'Renamed');
    const { nodes, dirty, past } = useDiagramStore.getState();
    expect(nodes[0].data.label).toBe('Renamed');
    expect(dirty).toBe(true);
    expect(past).toHaveLength(0);
  });
});
