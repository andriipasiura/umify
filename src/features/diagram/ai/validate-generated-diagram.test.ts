import { describe, expect, test } from 'vitest';

import { type GeneratedDiagram } from './generated-diagram.schema';
import { validateGeneratedDiagram } from './validate-generated-diagram';

const base = (overrides: Partial<GeneratedDiagram> = {}): GeneratedDiagram => ({
  isSystemDescription: true,
  rejectionReason: null,
  systemName: 'Bookstore',
  actors: ['Customer', 'Admin'],
  useCases: ['Checkout', 'Make Payment', 'Apply Coupon'],
  relations: [],
  ...overrides,
});

const errorsOf = (d: GeneratedDiagram) => {
  const result = validateGeneratedDiagram(d);
  return result.ok ? [] : result.errors;
};

describe('validateGeneratedDiagram', () => {
  test('accepts a valid diagram and normalises association direction and name casing', () => {
    const result = validateGeneratedDiagram(
      base({
        relations: [
          { type: 'association', from: 'Customer', to: 'Checkout' },
          { type: 'association', from: 'make payment', to: 'customer' },
          { type: 'include', from: 'Checkout', to: 'Make Payment' },
          { type: 'extend', from: 'Apply Coupon', to: 'Checkout' },
          { type: 'generalization', from: 'Admin', to: 'Customer' },
        ],
      }),
    );

    expect(result).toEqual({
      ok: true,
      diagram: {
        systemName: 'Bookstore',
        actors: ['Customer', 'Admin'],
        useCases: ['Checkout', 'Make Payment', 'Apply Coupon'],
        relations: [
          { type: 'association', from: 'Customer', to: 'Checkout' },
          { type: 'association', from: 'Customer', to: 'Make Payment' },
          { type: 'include', from: 'Checkout', to: 'Make Payment' },
          { type: 'extend', from: 'Apply Coupon', to: 'Checkout' },
          { type: 'generalization', from: 'Admin', to: 'Customer' },
        ],
      },
    });
  });

  test('requires at least one actor and one use case', () => {
    expect(errorsOf(base({ actors: [], useCases: [] }))).toEqual([
      'The diagram needs at least one actor.',
      'The diagram needs at least one use case.',
    ]);
  });

  test('rejects duplicate names within a kind and across kinds, ignoring case and spacing', () => {
    expect(
      errorsOf(
        base({ actors: ['Customer', ' customer ', 'Admin'], useCases: ['Checkout', 'Admin'] }),
      ),
    ).toEqual([
      'Duplicate actor "customer".',
      '"Admin" is used as both an actor and a use case; names must be unique.',
    ]);
  });

  test('rejects relations to unknown elements', () => {
    expect(
      errorsOf(base({ relations: [{ type: 'association', from: 'Guest', to: 'Browse' }] })),
    ).toEqual([
      'Relation association "Guest" → "Browse": "Guest" is not a listed actor or use case.',
      'Relation association "Guest" → "Browse": "Browse" is not a listed actor or use case.',
    ]);
  });

  test('rejects self relations', () => {
    expect(
      errorsOf(base({ relations: [{ type: 'include', from: 'Checkout', to: 'checkout' }] })),
    ).toEqual([
      'Relation include "Checkout" → "checkout": an element cannot be related to itself.',
    ]);
  });

  test.each([
    {
      relation: { type: 'association', from: 'Customer', to: 'Admin' },
      error:
        'Relation association "Customer" → "Admin": association must connect an actor and a use case, but both are actors.',
    },
    {
      relation: { type: 'association', from: 'Checkout', to: 'Make Payment' },
      error:
        'Relation association "Checkout" → "Make Payment": association must connect an actor and a use case, but both are use cases.',
    },
    {
      relation: { type: 'include', from: 'Customer', to: 'Checkout' },
      error:
        'Relation include "Customer" → "Checkout": "Customer" is an actor; include is only allowed between use cases.',
    },
    {
      relation: { type: 'extend', from: 'Checkout', to: 'Admin' },
      error:
        'Relation extend "Checkout" → "Admin": "Admin" is an actor; extend is only allowed between use cases.',
    },
    {
      relation: { type: 'generalization', from: 'Apply Coupon', to: 'Checkout' },
      error:
        'Relation generalization "Apply Coupon" → "Checkout": generalization is only allowed between two actors.',
    },
    {
      relation: { type: 'generalization', from: 'Customer', to: 'Checkout' },
      error:
        'Relation generalization "Customer" → "Checkout": generalization is only allowed between two actors.',
    },
  ] as const)(
    'rejects $relation.type between wrong kinds: $relation.from → $relation.to',
    ({ relation, error }) => {
      expect(errorsOf(base({ relations: [relation] }))).toEqual([error]);
    },
  );

  test('rejects duplicate relations, treating association as undirected', () => {
    expect(
      errorsOf(
        base({
          relations: [
            { type: 'association', from: 'Customer', to: 'Checkout' },
            { type: 'association', from: 'Checkout', to: 'Customer' },
            { type: 'include', from: 'Checkout', to: 'Make Payment' },
            { type: 'include', from: 'checkout', to: 'make payment' },
          ],
        }),
      ),
    ).toEqual([
      'Relation association "Checkout" → "Customer": duplicate relation.',
      'Relation include "checkout" → "make payment": duplicate relation.',
    ]);
  });

  test('rejects include cycles', () => {
    expect(
      errorsOf(
        base({
          relations: [
            { type: 'include', from: 'Checkout', to: 'Make Payment' },
            { type: 'include', from: 'Make Payment', to: 'Apply Coupon' },
            { type: 'include', from: 'Apply Coupon', to: 'Checkout' },
          ],
        }),
      ),
    ).toEqual([
      'Cycle of include relations: "Checkout" → "Make Payment" → "Apply Coupon" → "Checkout". include must not form a cycle.',
    ]);
  });

  test('rejects generalization cycles', () => {
    expect(
      errorsOf(
        base({
          relations: [
            { type: 'generalization', from: 'Admin', to: 'Customer' },
            { type: 'generalization', from: 'Customer', to: 'Admin' },
          ],
        }),
      ),
    ).toEqual([
      'Cycle of generalization relations: "Admin" → "Customer" → "Admin". generalization must not form a cycle.',
    ]);
  });

  test('does not treat extend in the opposite direction of include as a cycle', () => {
    expect(
      errorsOf(
        base({
          relations: [
            { type: 'include', from: 'Checkout', to: 'Make Payment' },
            { type: 'extend', from: 'Make Payment', to: 'Checkout' },
          ],
        }),
      ),
    ).toEqual([]);
  });

  test('collects every error in one pass', () => {
    expect(
      errorsOf(
        base({
          actors: [],
          relations: [
            { type: 'include', from: 'Checkout', to: 'Nope' },
            { type: 'generalization', from: 'Checkout', to: 'Make Payment' },
          ],
        }),
      ),
    ).toHaveLength(3);
  });
});
