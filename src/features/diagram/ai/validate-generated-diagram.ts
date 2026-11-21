import {
  KIND_ACTOR,
  KIND_USECASE,
  RELATION_ASSOCIATION,
  RELATION_EXTEND,
  RELATION_GENERALIZATION,
  RELATION_INCLUDE,
  type UmlRelation,
} from '../types';
import { type GeneratedDiagram, type GeneratedRelation } from './generated-diagram.schema';

type ElementKind = typeof KIND_ACTOR | typeof KIND_USECASE;

export type ValidatedDiagram = {
  systemName: string;
  actors: string[];
  useCases: string[];
  relations: { type: UmlRelation; from: string; to: string }[];
};

export type DiagramValidationResult =
  | { ok: true; diagram: ValidatedDiagram }
  | { ok: false; errors: string[] };

const normalize = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

const describe = (r: GeneratedRelation) => `Relation ${r.type} "${r.from}" → "${r.to}"`;

const KIND_PLURAL: Record<ElementKind, string> = { actor: 'actors', usecase: 'use cases' };

const indexElements = (diagram: GeneratedDiagram, errors: string[]) => {
  const elements = new Map<string, { name: string; kind: ElementKind }>();
  const add = (name: string, kind: ElementKind) => {
    const key = normalize(name);
    const existing = elements.get(key);
    if (!existing) {
      elements.set(key, { name: name.trim(), kind });
    } else if (existing.kind === kind) {
      errors.push(`Duplicate ${kind === KIND_ACTOR ? 'actor' : 'use case'} "${name.trim()}".`);
    } else {
      errors.push(
        `"${name.trim()}" is used as both an actor and a use case; names must be unique.`,
      );
    }
  };
  diagram.actors.forEach((n) => add(n, KIND_ACTOR));
  diagram.useCases.forEach((n) => add(n, KIND_USECASE));
  return elements;
};

const kindError = (r: GeneratedRelation, a: ElementKind, b: ElementKind): string | null => {
  switch (r.type) {
    case RELATION_ASSOCIATION:
      return a !== b
        ? null
        : `${describe(r)}: association must connect an actor and a use case, but both are ${KIND_PLURAL[a]}.`;
    case RELATION_INCLUDE:
    case RELATION_EXTEND: {
      if (a === KIND_USECASE && b === KIND_USECASE) return null;
      const actor = a === KIND_ACTOR ? r.from : r.to;
      return `${describe(r)}: "${actor}" is an actor; ${r.type} is only allowed between use cases.`;
    }
    case RELATION_GENERALIZATION:
      return a === KIND_ACTOR && b === KIND_ACTOR
        ? null
        : `${describe(r)}: generalization is only allowed between two actors.`;
  }
};

const findCycle = (edges: [string, string][]): string[] | null => {
  const graph = new Map<string, string[]>();
  for (const [from, to] of edges) graph.set(from, [...(graph.get(from) ?? []), to]);

  const state = new Map<string, 'visiting' | 'done'>();
  const path: string[] = [];

  const visit = (node: string): string[] | null => {
    if (state.get(node) === 'done') return null;
    if (state.get(node) === 'visiting') return [...path.slice(path.indexOf(node)), node];
    state.set(node, 'visiting');
    path.push(node);
    for (const next of graph.get(node) ?? []) {
      const cycle = visit(next);
      if (cycle) return cycle;
    }
    path.pop();
    state.set(node, 'done');
    return null;
  };

  for (const node of graph.keys()) {
    const cycle = visit(node);
    if (cycle) return cycle;
  }
  return null;
};

export const validateGeneratedDiagram = (diagram: GeneratedDiagram): DiagramValidationResult => {
  const errors: string[] = [];

  if (diagram.actors.length === 0) errors.push('The diagram needs at least one actor.');
  if (diagram.useCases.length === 0) errors.push('The diagram needs at least one use case.');

  const elements = indexElements(diagram, errors);
  const relations: ValidatedDiagram['relations'] = [];
  const seen = new Set<string>();

  for (const r of diagram.relations) {
    const from = elements.get(normalize(r.from));
    const to = elements.get(normalize(r.to));

    if (!from || !to) {
      for (const [raw, found] of [
        [r.from, from],
        [r.to, to],
      ] as const) {
        if (!found) errors.push(`${describe(r)}: "${raw}" is not a listed actor or use case.`);
      }
      continue;
    }
    if (from === to) {
      errors.push(`${describe(r)}: an element cannot be related to itself.`);
      continue;
    }

    const kindProblem = kindError(r, from.kind, to.kind);
    if (kindProblem) {
      errors.push(kindProblem);
      continue;
    }

    const [source, target] =
      r.type === RELATION_ASSOCIATION && from.kind === KIND_USECASE ? [to, from] : [from, to];
    const key = `${r.type}|${normalize(source.name)}|${normalize(target.name)}`;
    if (seen.has(key)) {
      errors.push(`${describe(r)}: duplicate relation.`);
      continue;
    }
    seen.add(key);
    relations.push({ type: r.type, from: source.name, to: target.name });
  }

  for (const type of [RELATION_INCLUDE, RELATION_GENERALIZATION] as const) {
    const cycle = findCycle(
      relations.filter((r) => r.type === type).map((r) => [r.from, r.to] as [string, string]),
    );
    if (cycle) {
      errors.push(
        `Cycle of ${type} relations: ${cycle.map((n) => `"${n}"`).join(' → ')}. ${type} must not form a cycle.`,
      );
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    diagram: {
      systemName: diagram.systemName.trim(),
      actors: [...elements.values()].filter((e) => e.kind === KIND_ACTOR).map((e) => e.name),
      useCases: [...elements.values()].filter((e) => e.kind === KIND_USECASE).map((e) => e.name),
      relations,
    },
  };
};
