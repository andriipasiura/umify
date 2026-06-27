import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from '@xyflow/react';
import { current } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { resolveRelation } from '../lib/uml-rules';
import { UML_EDGE_TYPE, type UmlEdge, type UmlNode, type UmlRelation } from '../types';

const HISTORY_LIMIT = 50;

type Snapshot = { nodes: UmlNode[]; edges: UmlEdge[] };

type DiagramState = {
  nodes: UmlNode[];
  edges: UmlEdge[];
  past: Snapshot[];
  future: Snapshot[];
  dirty: boolean;
  activeRelation: UmlRelation;
};

type DiagramActions = {
  onNodesChange: (changes: NodeChange<UmlNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<UmlEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: UmlNode) => void;
  updateNodeLabel: (id: string, label: string) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  undo: () => void;
  redo: () => void;
  load: (snapshot: Snapshot) => void;
  markSaved: () => void;
  setActiveRelation: (relation: UmlRelation) => void;
};

const takeSnapshot = (s: DiagramState): Snapshot => ({
  nodes: current(s.nodes),
  edges: current(s.edges),
});

const commit = (s: DiagramState) => {
  s.past.push(takeSnapshot(s));
  if (s.past.length > HISTORY_LIMIT) s.past.shift();
  s.future = [];
  s.dirty = true;
};

export const useDiagramStore = create<DiagramState & DiagramActions>()(
  immer((set) => ({
    nodes: [],
    edges: [],
    past: [],
    future: [],
    dirty: false,
    activeRelation: 'include',

    onNodesChange: (changes) =>
      set((s) => {
        s.nodes = applyNodeChanges(changes, s.nodes);
        const structural = changes.some((c) => c.type === 'remove');
        if (structural) commit(s);
        else s.dirty = true;
      }),

    onEdgesChange: (changes) =>
      set((s) => {
        s.edges = applyEdgeChanges(changes, s.edges);
        if (changes.some((c) => c.type === 'remove')) commit(s);
        else s.dirty = true;
      }),

    onConnect: (connection) =>
      set((s) => {
        const relation = resolveRelation(connection, s.nodes, s.activeRelation);
        if (!relation) return;
        commit(s);
        s.edges = addEdge<UmlEdge>(
          { ...connection, type: UML_EDGE_TYPE, data: { relation } },
          s.edges,
        );
      }),

    addNode: (node) =>
      set((s) => {
        commit(s);
        s.nodes.push(node);
      }),

    updateNodeLabel: (id, label) =>
      set((s) => {
        const node = s.nodes.find((n) => n.id === id);
        if (node) {
          node.data.label = label;
          s.dirty = true;
        }
      }),

    deleteNode: (id) =>
      set((s) => {
        commit(s);
        s.nodes = s.nodes.filter((n) => n.id !== id);
        s.edges = s.edges.filter((e) => e.source !== id && e.target !== id);
      }),

    deleteEdge: (id) =>
      set((s) => {
        commit(s);
        s.edges = s.edges.filter((e) => e.id !== id);
      }),

    undo: () =>
      set((s) => {
        const prev = s.past.pop();
        if (!prev) return;
        s.future.unshift(takeSnapshot(s));
        s.nodes = prev.nodes;
        s.edges = prev.edges;
        s.dirty = true;
      }),

    redo: () =>
      set((s) => {
        const next = s.future.shift();
        if (!next) return;
        s.past.push(takeSnapshot(s));
        s.nodes = next.nodes;
        s.edges = next.edges;
        s.dirty = true;
      }),

    load: (snap) =>
      set((s) => {
        s.nodes = snap.nodes;
        s.edges = snap.edges;
        s.past = [];
        s.future = [];
        s.dirty = false;
      }),

    markSaved: () =>
      set((s) => {
        s.dirty = false;
      }),

    setActiveRelation: (relation) =>
      set((s) => {
        s.activeRelation = relation;
      }),
  })),
);
