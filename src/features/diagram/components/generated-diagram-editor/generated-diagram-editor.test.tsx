import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const replace = vi.fn();
const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace }) }));

const importGuestDiagram = vi.fn();
vi.mock('@/features/diagram/server/diagram.actions', () => ({
  importGuestDiagram: (...args: unknown[]) => importGuestDiagram(...args),
  saveDiagramThumbnail: vi.fn().mockResolvedValue({ ok: true, data: undefined }),
}));

vi.mock('@/features/diagram/lib/capture-thumbnail', () => ({
  captureThumbnail: vi.fn().mockResolvedValue({ light: '', dark: '' }),
}));

vi.mock('@/features/diagram/components/diagram-zoom-controls', () => ({
  DiagramZoomControlsPanel: () => <div />,
}));

vi.mock('@/features/diagram/components/diagram-canvas', () => ({
  DiagramCanvas: ({
    topLeftPanel,
    topCenterPanel,
    topRightPanel,
  }: {
    topLeftPanel?: React.ReactNode;
    topCenterPanel?: React.ReactNode;
    topRightPanel?: React.ReactNode;
  }) => (
    <div>
      {topLeftPanel}
      {topCenterPanel}
      {topRightPanel}
    </div>
  ),
}));

vi.mock('@/components/ui/sidebar', () => ({
  SidebarInset: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarTrigger: () => null,
}));

import {
  readGeneratedDiagram,
  writeGeneratedDiagram,
} from '@/features/diagram/lib/generated-diagram-storage';
import { type DiagramContent } from '@/features/diagram/schema/diagram-content';
import { useDiagramStore } from '@/features/diagram/store/diagram-store';
import { useGenerateDraftStore } from '@/features/diagram/store/generate-draft-store';
import { render, screen } from '@/test/render';

import { GeneratedDiagramEditor } from './generated-diagram-editor';

const content: DiagramContent = {
  version: 1,
  nodes: [
    {
      id: 'a1',
      type: 'actor',
      position: { x: 0, y: 0 },
      data: { kind: 'actor', label: 'Customer' },
    },
  ],
  edges: [],
};

beforeEach(() => {
  window.sessionStorage.clear();
  useDiagramStore.getState().load({ nodes: [], edges: [] });
  importGuestDiagram.mockReset();
  push.mockReset();
  replace.mockReset();
  useGenerateDraftStore.setState({ description: '' });
});

describe('GeneratedDiagramEditor', () => {
  test('shows an empty state when there is no generated diagram', async () => {
    render(<GeneratedDiagramEditor />);
    expect(await screen.findByText('No generated diagram to open')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to diagrams' })).toHaveAttribute('href', '/');
  });

  test('loads the draft into the store as unsaved', async () => {
    writeGeneratedDiagram({ title: 'Bookstore', content });
    render(<GeneratedDiagramEditor />);

    expect(await screen.findByText('Bookstore')).toBeInTheDocument();
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    expect(useDiagramStore.getState().nodes.map((n) => n.id)).toEqual(['a1']);
    expect(useDiagramStore.getState().dirty).toBe(true);
  });

  test('saves through importGuestDiagram, clears the draft and opens the saved diagram', async () => {
    importGuestDiagram.mockResolvedValue({ ok: true, data: { id: 'saved_id' } });
    writeGeneratedDiagram({ title: 'Bookstore', content });
    render(<GeneratedDiagramEditor />);

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }));

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/diagrams/saved_id'));
    expect(importGuestDiagram).toHaveBeenCalledWith({
      title: 'Bookstore',
      content: expect.objectContaining({ nodes: [expect.objectContaining({ id: 'a1' })] }),
    });
    expect(readGeneratedDiagram()).toBeNull();
    expect(useDiagramStore.getState().dirty).toBe(false);
  });

  test('keeps the draft and shows a retry status when saving fails', async () => {
    importGuestDiagram.mockResolvedValue({ ok: false, error: 'Invalid input' });
    writeGeneratedDiagram({ title: 'Bookstore', content });
    render(<GeneratedDiagramEditor />);

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Save failed — click to retry')).toBeInTheDocument();
    expect(readGeneratedDiagram()).not.toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });

  test('shows the AI banner and restores the Save button when it is dismissed', async () => {
    writeGeneratedDiagram({ title: 'Bookstore', content });
    render(<GeneratedDiagramEditor />);

    expect(await screen.findByText('Generated with AI.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save diagram' })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss banner' }));

    expect(screen.queryByText('Generated with AI.')).toBeNull();
    expect(screen.getByRole('button', { name: 'Save diagram' })).toBeInTheDocument();
  });

  test('discards the draft after confirmation', async () => {
    useGenerateDraftStore.setState({ description: 'An online bookstore for customers' });
    writeGeneratedDiagram({ title: 'Bookstore', content });
    render(<GeneratedDiagramEditor />);

    await userEvent.click(await screen.findByRole('button', { name: 'Discard' }));
    expect(screen.getByText('Discard generated diagram?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Discard' }));

    expect(push).toHaveBeenCalledWith('/');
    expect(readGeneratedDiagram()).toBeNull();
    expect(useDiagramStore.getState().dirty).toBe(false);
    expect(useGenerateDraftStore.getState().description).toBe('');
  });

  test('reopens the generate dialog with the same description', async () => {
    useGenerateDraftStore.setState({ description: 'An online bookstore for customers' });
    writeGeneratedDiagram({ title: 'Bookstore', content });
    render(<GeneratedDiagramEditor />);

    await userEvent.click(await screen.findByRole('button', { name: 'Regenerate' }));

    expect(await screen.findByLabelText('System description')).toHaveValue(
      'An online bookstore for customers',
    );
    expect(screen.getByText(/replaces the current diagram/)).toBeInTheDocument();
  });

  test('persists edits so a reload restores them', async () => {
    writeGeneratedDiagram({ title: 'Bookstore', content });
    render(<GeneratedDiagramEditor />);
    await screen.findByText('Bookstore');

    useDiagramStore.getState().updateNodeLabel('a1', 'Shopper');

    await vi.waitFor(() =>
      expect(readGeneratedDiagram()?.content.nodes[0].data.label).toBe('Shopper'),
    );
  });
});
