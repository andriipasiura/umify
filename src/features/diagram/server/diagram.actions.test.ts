import { beforeEach, describe, expect, test, vi } from 'vitest';

const {
  requireUserMock,
  findOwner,
  create,
  updateMeta,
  remove,
  setFavorite,
  setVisibility,
  revalidatePath,
} = vi.hoisted(() => ({
  requireUserMock: vi.fn(),
  findOwner: vi.fn(),
  create: vi.fn(),
  updateMeta: vi.fn(),
  remove: vi.fn(),
  setFavorite: vi.fn(),
  setVisibility: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/auth/require-user', () => ({ requireUser: requireUserMock }));
vi.mock('./diagram.repository', () => ({
  diagramRepository: { findOwner, create, updateMeta, remove, setFavorite, setVisibility },
}));
vi.mock('next/cache', () => ({ revalidatePath }));

import {
  createDiagram,
  deleteDiagram,
  setDiagramVisibility,
  toggleFavorite,
  updateDiagramMeta,
} from './diagram.actions';

const validMeta = { title: 'Login Flow', category: '', tags: [], visibility: 'public' } as const;

describe('createDiagram', () => {
  beforeEach(() => {
    requireUserMock.mockReset().mockResolvedValue({ id: 'user_1' });
    create.mockReset().mockResolvedValue({ id: 'new_id' });
    revalidatePath.mockReset();
  });

  test('rejects when unauthenticated', async () => {
    requireUserMock.mockRejectedValue(new Error('Unauthorized'));
    expect(createDiagram(validMeta)).rejects.toThrow('Unauthorized');
  });

  test('returns validation error for invalid input', async () => {
    const result = await createDiagram({ title: '', category: '', tags: [], visibility: 'public' });
    expect(result).toMatchObject({ ok: false, error: 'Invalid input' });
    expect(create).not.toHaveBeenCalled();
  });

  test('creates and revalidates on valid input', async () => {
    const result = await createDiagram(validMeta);
    expect(result).toEqual({ ok: true, data: { id: 'new_id' } });
    expect(create).toHaveBeenCalledWith('user_1', expect.objectContaining({ title: 'Login Flow' }));
    expect(revalidatePath).toHaveBeenCalledWith('/diagrams');
  });
});

describe('updateDiagramMeta', () => {
  beforeEach(() => {
    requireUserMock.mockReset().mockResolvedValue({ id: 'user_1' });
    findOwner.mockReset().mockResolvedValue({ ownerId: 'user_1', isFavorite: false });
    updateMeta.mockReset().mockResolvedValue({ id: 'd1' });
    revalidatePath.mockReset();
  });

  test('rejects when unauthenticated', async () => {
    requireUserMock.mockRejectedValue(new Error('Unauthorized'));
    expect(updateDiagramMeta('d1', validMeta)).rejects.toThrow('Unauthorized');
  });

  test('returns validation error for invalid input', async () => {
    const result = await updateDiagramMeta('d1', { title: '' });
    expect(result).toMatchObject({ ok: false, error: 'Invalid input' });
  });

  test('returns Not found when diagram does not exist', async () => {
    findOwner.mockResolvedValue(null);
    const result = await updateDiagramMeta('d1', validMeta);
    expect(result).toEqual({ ok: false, error: 'Not found' });
  });

  test('returns Forbidden for non-owner', async () => {
    findOwner.mockResolvedValue({ ownerId: 'other_user', isFavorite: false });
    const result = await updateDiagramMeta('d1', validMeta);
    expect(result).toEqual({ ok: false, error: 'Forbidden' });
  });

  test('updates and revalidates for the owner', async () => {
    const result = await updateDiagramMeta('d1', validMeta);
    expect(result).toEqual({ ok: true, data: { id: 'd1' } });
    expect(updateMeta).toHaveBeenCalledWith('d1', expect.objectContaining({ title: 'Login Flow' }));
    expect(revalidatePath).toHaveBeenCalledWith('/diagrams');
  });
});

describe('deleteDiagram', () => {
  beforeEach(() => {
    requireUserMock.mockReset().mockResolvedValue({ id: 'user_1' });
    findOwner.mockReset().mockResolvedValue({ ownerId: 'user_1', isFavorite: false });
    remove.mockReset().mockResolvedValue(undefined);
    revalidatePath.mockReset();
  });

  test('rejects when unauthenticated', async () => {
    requireUserMock.mockRejectedValue(new Error('Unauthorized'));
    expect(deleteDiagram('d1')).rejects.toThrow('Unauthorized');
  });

  test('returns Not found when diagram does not exist', async () => {
    findOwner.mockResolvedValue(null);
    const result = await deleteDiagram('d1');
    expect(result).toEqual({ ok: false, error: 'Not found' });
  });

  test('returns Forbidden for non-owner', async () => {
    findOwner.mockResolvedValue({ ownerId: 'other_user', isFavorite: false });
    const result = await deleteDiagram('d1');
    expect(result).toEqual({ ok: false, error: 'Forbidden' });
  });

  test('deletes and revalidates for the owner', async () => {
    const result = await deleteDiagram('d1');
    expect(result).toEqual({ ok: true, data: undefined });
    expect(remove).toHaveBeenCalledWith('d1');
    expect(revalidatePath).toHaveBeenCalledWith('/diagrams');
  });
});

describe('setDiagramVisibility', () => {
  beforeEach(() => {
    requireUserMock.mockReset().mockResolvedValue({ id: 'user_1' });
    findOwner.mockReset().mockResolvedValue({ ownerId: 'user_1', isFavorite: false });
    setVisibility.mockReset().mockResolvedValue({ visibility: 'public' });
    revalidatePath.mockReset();
  });

  test('rejects when unauthenticated', async () => {
    requireUserMock.mockRejectedValue(new Error('Unauthorized'));
    expect(setDiagramVisibility('d1', 'public')).rejects.toThrow('Unauthorized');
  });

  test('returns validation error for an invalid visibility value', async () => {
    const result = await setDiagramVisibility('d1', 'friends-only');
    expect(result).toMatchObject({ ok: false, error: 'Invalid input' });
    expect(setVisibility).not.toHaveBeenCalled();
  });

  test('returns Not found when diagram does not exist', async () => {
    findOwner.mockResolvedValue(null);
    const result = await setDiagramVisibility('d1', 'public');
    expect(result).toEqual({ ok: false, error: 'Not found' });
  });

  test('returns Forbidden for non-owner', async () => {
    findOwner.mockResolvedValue({ ownerId: 'other_user', isFavorite: false });
    const result = await setDiagramVisibility('d1', 'public');
    expect(result).toEqual({ ok: false, error: 'Forbidden' });
    expect(setVisibility).not.toHaveBeenCalled();
  });

  test('updates visibility and revalidates lists, editor, and share page', async () => {
    const result = await setDiagramVisibility('d1', 'public');
    expect(result).toEqual({ ok: true, data: { visibility: 'public' } });
    expect(setVisibility).toHaveBeenCalledWith('d1', 'public');
    expect(revalidatePath).toHaveBeenCalledWith('/diagrams');
    expect(revalidatePath).toHaveBeenCalledWith('/favorites');
    expect(revalidatePath).toHaveBeenCalledWith('/diagrams/d1');
    expect(revalidatePath).toHaveBeenCalledWith('/share/d1');
  });
});

describe('toggleFavorite', () => {
  beforeEach(() => {
    requireUserMock.mockReset().mockResolvedValue({ id: 'user_1' });
    findOwner.mockReset().mockResolvedValue({ ownerId: 'user_1', isFavorite: false });
    setFavorite.mockReset().mockResolvedValue({ id: 'd1', isFavorite: true });
    revalidatePath.mockReset();
  });

  test('rejects when unauthenticated', async () => {
    requireUserMock.mockRejectedValue(new Error('Unauthorized'));
    expect(toggleFavorite('d1')).rejects.toThrow('Unauthorized');
  });

  test('returns Forbidden for non-owner', async () => {
    findOwner.mockResolvedValue({ ownerId: 'other_user', isFavorite: false });
    const result = await toggleFavorite('d1');
    expect(result).toEqual({ ok: false, error: 'Forbidden' });
  });

  test('flips isFavorite and revalidates', async () => {
    const result = await toggleFavorite('d1');
    expect(result).toEqual({ ok: true, data: { isFavorite: true } });
    expect(setFavorite).toHaveBeenCalledWith('d1', true);
    expect(revalidatePath).toHaveBeenCalledWith('/diagrams');
  });
});
