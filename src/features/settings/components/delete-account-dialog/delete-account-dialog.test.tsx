import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

vi.mock('../../server/account.actions', () => ({ deleteAccount: vi.fn() }));

import { DeleteAccountDialog } from './delete-account-dialog';

const EMAIL = 'user@example.com';

const renderDialog = (open = true) =>
  render(<DeleteAccountDialog open={open} email={EMAIL} onOpenChange={vi.fn()} />);

describe('DeleteAccountDialog', () => {
  test('renders the dialog when open', () => {
    renderDialog();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    renderDialog(false);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  test('Delete button is disabled initially', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: 'Delete my account' })).toBeDisabled();
  });

  test('Delete button remains disabled with a non-matching email', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(screen.getByRole('textbox'), 'wrong@example.com');
    expect(screen.getByRole('button', { name: 'Delete my account' })).toBeDisabled();
  });

  test('Delete button enables when the correct email is typed', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(screen.getByRole('textbox'), EMAIL);
    expect(screen.getByRole('button', { name: 'Delete my account' })).toBeEnabled();
  });

  test('email match is case-insensitive', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(screen.getByRole('textbox'), EMAIL.toUpperCase());
    expect(screen.getByRole('button', { name: 'Delete my account' })).toBeEnabled();
  });

  test('calls onOpenChange when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<DeleteAccountDialog open={true} email={EMAIL} onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
