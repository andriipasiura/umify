import { createId } from '@/lib/utils';

import { type DiagramContent, diagramContentSchema } from '../schema/diagram-content';
import { KIND_ACTOR, KIND_BOUNDARY, KIND_USECASE, UML_EDGE_TYPE } from '../types';
import { layoutDiagram, type LayoutEdge, type LayoutNode, NODE_SIZE } from './layout-diagram';
import { type ValidatedDiagram } from './validate-generated-diagram';

const FALLBACK_SYSTEM_NAME = 'System';

type Point = { x: number; y: number };
type Handle = 'top' | 'right' | 'bottom' | 'left';

const centerOf = (kind: LayoutNode['kind'], p: Point): Point => ({
  x: p.x + NODE_SIZE[kind].width / 2,
  y: p.y + NODE_SIZE[kind].height / 2,
});

const pickHandles = (source: Point, target: Point): [Handle, Handle] => {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? ['right', 'left'] : ['left', 'right'];
  return dy >= 0 ? ['bottom', 'top'] : ['top', 'bottom'];
};

export const generatedToDiagramContent = (diagram: ValidatedDiagram): DiagramContent => {
  const named: (LayoutNode & { name: string })[] = [
    ...diagram.actors.map((name) => ({ id: createId(), kind: KIND_ACTOR, name }) as const),
    ...diagram.useCases.map((name) => ({ id: createId(), kind: KIND_USECASE, name }) as const),
  ];
  const idByName = new Map(named.map((n) => [n.name, n.id]));

  const layoutEdges: LayoutEdge[] = diagram.relations.map((r) => ({
    source: idByName.get(r.from)!,
    target: idByName.get(r.to)!,
    relation: r.type,
  }));

  const { positions, boundary } = layoutDiagram(named, layoutEdges);
  const kindById = new Map(named.map((n) => [n.id, n.kind]));
  const center = (id: string) => centerOf(kindById.get(id)!, positions.get(id)!);

  const content: DiagramContent = {
    version: 1,
    nodes: [
      {
        id: createId(),
        type: KIND_BOUNDARY,
        position: { x: boundary.x, y: boundary.y },
        width: boundary.width,
        height: boundary.height,
        data: { kind: KIND_BOUNDARY, label: diagram.systemName || FALLBACK_SYSTEM_NAME },
      },
      ...named.map((n) => ({
        id: n.id,
        type: n.kind,
        position: positions.get(n.id)!,
        data: { kind: n.kind, label: n.name },
      })),
    ],
    edges: layoutEdges.map((e) => {
      const [sourceHandle, targetHandle] = pickHandles(center(e.source), center(e.target));
      return {
        id: createId(),
        source: e.source,
        target: e.target,
        sourceHandle,
        targetHandle,
        type: UML_EDGE_TYPE,
        data: { relation: e.relation },
      };
    }),
  };

  return diagramContentSchema.parse(content);
};
