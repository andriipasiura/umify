import { describe, expect, test } from 'vitest';

import { diagramContentSchema } from '../schema/diagram-content';
import { generatedToDiagramContent } from './generated-to-content';
import { NODE_SIZE } from './layout-diagram';
import { type ValidatedDiagram } from './validate-generated-diagram';

const diagram: ValidatedDiagram = {
  systemName: 'Bookstore',
  actors: ['Customer', 'Admin'],
  useCases: ['Browse Books', 'Checkout', 'Make Payment', 'Apply Coupon', 'Manage Catalog'],
  relations: [
    { type: 'association', from: 'Customer', to: 'Browse Books' },
    { type: 'association', from: 'Customer', to: 'Checkout' },
    { type: 'association', from: 'Admin', to: 'Manage Catalog' },
    { type: 'include', from: 'Checkout', to: 'Make Payment' },
    { type: 'extend', from: 'Apply Coupon', to: 'Checkout' },
    { type: 'generalization', from: 'Admin', to: 'Customer' },
  ],
};

const labelOf = (content: ReturnType<typeof generatedToDiagramContent>, id: string) =>
  content.nodes.find((n) => n.id === id)?.data.label;

type Rect = { x: number; y: number; width: number; height: number };
const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

describe('generatedToDiagramContent', () => {
  const content = generatedToDiagramContent(diagram);
  const byKind = (kind: string) => content.nodes.filter((n) => n.type === kind);
  const rectOf = (n: (typeof content.nodes)[number]): Rect => ({
    ...n.position,
    ...(n.type === 'boundary'
      ? { width: n.width!, height: n.height! }
      : NODE_SIZE[n.type as 'actor' | 'usecase']),
  });

  test('produces content that passes the stored diagram schema', () => {
    expect(diagramContentSchema.safeParse(content).success).toBe(true);
  });

  test('creates one node per element plus a boundary labelled with the system name', () => {
    expect(byKind('actor').map((n) => n.data.label)).toEqual(['Customer', 'Admin']);
    expect(byKind('usecase').map((n) => n.data.label)).toEqual(diagram.useCases);
    expect(byKind('boundary')).toHaveLength(1);
    expect(byKind('boundary')[0].data.label).toBe('Bookstore');
    expect(content.nodes[0].type).toBe('boundary');
  });

  test('falls back to a default boundary label when the system name is empty', () => {
    const result = generatedToDiagramContent({ ...diagram, systemName: '' });
    expect(result.nodes.find((n) => n.type === 'boundary')?.data.label).toBe('System');
  });

  test('assigns unique ids and edges reference existing nodes by name', () => {
    const ids = [...content.nodes, ...content.edges].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);

    expect(
      content.edges.map((e) => [
        e.data.relation,
        labelOf(content, e.source),
        labelOf(content, e.target),
      ]),
    ).toEqual(diagram.relations.map((r) => [r.type, r.from, r.to]));
    expect(content.edges.every((e) => e.type === 'uml')).toBe(true);
  });

  test('places actors in a column left of the boundary and use cases inside it', () => {
    const boundary = rectOf(byKind('boundary')[0]);
    const actorXs = new Set(byKind('actor').map((n) => n.position.x));
    expect(actorXs.size).toBe(1);
    expect([...actorXs][0] + NODE_SIZE.actor.width).toBeLessThan(boundary.x);

    for (const uc of byKind('usecase').map(rectOf)) {
      expect(uc.x).toBeGreaterThanOrEqual(boundary.x);
      expect(uc.y).toBeGreaterThanOrEqual(boundary.y);
      expect(uc.x + uc.width).toBeLessThanOrEqual(boundary.x + boundary.width);
      expect(uc.y + uc.height).toBeLessThanOrEqual(boundary.y + boundary.height);
    }
  });

  test('no two element nodes overlap', () => {
    const rects = content.nodes.filter((n) => n.type !== 'boundary').map(rectOf);
    for (let i = 0; i < rects.length; i++)
      for (let j = i + 1; j < rects.length; j++) expect(overlaps(rects[i], rects[j])).toBe(false);
  });

  test('connects facing sides: actor right side to use case left side', () => {
    const association = content.edges.find((e) => e.data.relation === 'association')!;
    expect([association.sourceHandle, association.targetHandle]).toEqual(['right', 'left']);
  });

  test('handles a minimal diagram with a single actor and use case', () => {
    const result = generatedToDiagramContent({
      systemName: 'Todo',
      actors: ['User'],
      useCases: ['Add Task'],
      relations: [{ type: 'association', from: 'User', to: 'Add Task' }],
    });
    expect(result.nodes).toHaveLength(3);
    const boundary = result.nodes.find((n) => n.type === 'boundary')!;
    expect(boundary.width).toBeGreaterThanOrEqual(240);
    expect(boundary.height).toBeGreaterThanOrEqual(160);
  });
});
