import { Graph, layout } from '@dagrejs/dagre';

import {
  KIND_ACTOR,
  KIND_USECASE,
  RELATION_ASSOCIATION,
  RELATION_EXTEND,
  type UmlRelation,
} from '../types';

type Point = { x: number; y: number };
type Rect = Point & { width: number; height: number };

export type LayoutNode = { id: string; kind: typeof KIND_ACTOR | typeof KIND_USECASE };
export type LayoutEdge = { source: string; target: string; relation: UmlRelation };

export type DiagramLayout = {
  positions: Map<string, Point>;
  boundary: Rect;
};

export const NODE_SIZE = {
  [KIND_ACTOR]: { width: 88, height: 110 },
  [KIND_USECASE]: { width: 144, height: 56 },
} as const;

const BOUNDARY_PADDING = { x: 40, top: 48, bottom: 40 };
const BOUNDARY_MIN = { width: 240, height: 160 };
const ACTOR_COLUMN_GAP = 80;
const ACTOR_GAP_Y = 32;

const rankingEdge = (e: LayoutEdge, kindOf: Map<string, LayoutNode['kind']>) => {
  if (kindOf.get(e.source) === KIND_ACTOR && kindOf.get(e.target) === KIND_ACTOR) return null;
  if (e.relation === RELATION_EXTEND) return { v: e.target, w: e.source };
  return { v: e.source, w: e.target };
};

export const layoutDiagram = (nodes: LayoutNode[], edges: LayoutEdge[]): DiagramLayout => {
  const kindOf = new Map(nodes.map((n) => [n.id, n.kind]));

  const g = new Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 32, ranksep: 120, marginx: 0, marginy: 0 });
  g.setDefaultEdgeLabel(() => ({}));
  for (const n of nodes) g.setNode(n.id, { ...NODE_SIZE[n.kind] });
  for (const e of edges) {
    const edge = rankingEdge(e, kindOf);
    if (edge) g.setEdge(edge.v, edge.w, e.relation === RELATION_ASSOCIATION ? { weight: 2 } : {});
  }
  layout(g);

  const center = (id: string) => g.node(id) as unknown as Point;
  const positions = new Map<string, Point>();

  const useCases = nodes.filter((n) => n.kind === KIND_USECASE);
  for (const n of useCases) {
    const { x, y } = center(n.id);
    const size = NODE_SIZE[KIND_USECASE];
    positions.set(n.id, { x: x - size.width / 2, y: y - size.height / 2 });
  }

  const ucRects = useCases.map((n) => ({ ...positions.get(n.id)!, ...NODE_SIZE[KIND_USECASE] }));
  const minX = Math.min(...ucRects.map((r) => r.x));
  const minY = Math.min(...ucRects.map((r) => r.y));
  const maxX = Math.max(...ucRects.map((r) => r.x + r.width));
  const maxY = Math.max(...ucRects.map((r) => r.y + r.height));
  const boundary: Rect = {
    x: minX - BOUNDARY_PADDING.x,
    y: minY - BOUNDARY_PADDING.top,
    width: Math.max(BOUNDARY_MIN.width, maxX - minX + 2 * BOUNDARY_PADDING.x),
    height: Math.max(
      BOUNDARY_MIN.height,
      maxY - minY + BOUNDARY_PADDING.top + BOUNDARY_PADDING.bottom,
    ),
  };

  const actor = NODE_SIZE[KIND_ACTOR];
  const actorX = boundary.x - ACTOR_COLUMN_GAP - actor.width;
  const actors = nodes
    .filter((n) => n.kind === KIND_ACTOR)
    .map((n) => ({ id: n.id, y: center(n.id).y - actor.height / 2 }))
    .sort((a, b) => a.y - b.y);

  let nextFreeY = -Infinity;
  for (const a of actors) {
    const y = Math.max(a.y, nextFreeY);
    positions.set(a.id, { x: actorX, y });
    nextFreeY = y + actor.height + ACTOR_GAP_Y;
  }

  return { positions, boundary };
};
