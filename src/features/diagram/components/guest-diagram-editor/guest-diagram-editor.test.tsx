import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@/features/diagram/components/diagram-zoom-controls', () => ({
  DiagramZoomControlsPanel: () => <div />,
}));

vi.mock('@/features/diagram/components/diagram-canvas', () => ({
  DiagramCanvas: ({
    topLeftPanel,
    topCenterPanel,
    topRightPanel,
    bottomLeftPanel,
  }: {
    topLeftPanel?: React.ReactNode;
    topCenterPanel?: React.ReactNode;
    topRightPanel?: React.ReactNode;
    bottomLeftPanel?: React.ReactNode;
  }) => (
    <div>
      {topLeftPanel}
      {topCenterPanel}
      {topRightPanel}
      {bottomLeftPanel}
    </div>
  ),
}));

import { useDiagramStore } from '@/features/diagram/store/diagram-store';
import { render } from '@/test/render';

import { GuestDiagramEditor } from './guest-diagram-editor';

beforeEach(() => {
  window.localStorage.clear();
  useDiagramStore.getState().load({ nodes: [], edges: [] });
});

const SIGN_IN_SLOT = <button type="button">Continue with Google</button>;

describe('GuestDiagramEditor', () => {
  test('opens the sign-in dialog when Save is clicked', async () => {
    const { getByRole, queryByText } = render(<GuestDiagramEditor signInSlot={SIGN_IN_SLOT} />);

    expect(queryByText('Sign in to save your work')).not.toBeInTheDocument();
    await userEvent.click(getByRole('button', { name: 'Save' }));
    expect(queryByText('Sign in to save your work')).toBeInTheDocument();
  });

  test('opens the sign-in dialog when Share is clicked', async () => {
    const { getByRole, queryByText } = render(<GuestDiagramEditor signInSlot={SIGN_IN_SLOT} />);

    await userEvent.click(getByRole('button', { name: /Share/ }));
    expect(queryByText('Sign in to save your work')).toBeInTheDocument();
  });

  test('opens the sign-in dialog when Export is clicked', async () => {
    const { getByRole, queryByText } = render(<GuestDiagramEditor signInSlot={SIGN_IN_SLOT} />);

    await userEvent.click(getByRole('button', { name: /Export/ }));
    expect(queryByText('Sign in to save your work')).toBeInTheDocument();
  });

  test('opens the sign-in dialog when the header Sign in button is clicked', async () => {
    const { getByRole, queryByText } = render(<GuestDiagramEditor signInSlot={SIGN_IN_SLOT} />);

    await userEvent.click(getByRole('button', { name: 'Sign in' }));
    expect(queryByText('Sign in to save your work')).toBeInTheDocument();
  });

  test('opens the sign-in dialog on Ctrl+S', async () => {
    const { queryByText } = render(<GuestDiagramEditor signInSlot={SIGN_IN_SLOT} />);

    await userEvent.keyboard('{Control>}s{/Control}');
    expect(queryByText('Sign in to save your work')).toBeInTheDocument();
  });

  test('renders the passed-in signInSlot inside the dialog', async () => {
    const { getByRole, getAllByRole } = render(<GuestDiagramEditor signInSlot={SIGN_IN_SLOT} />);

    await userEvent.click(getByRole('button', { name: 'Save' }));
    expect(getAllByRole('button', { name: 'Continue with Google' })[0]).toBeInTheDocument();
  });
});
