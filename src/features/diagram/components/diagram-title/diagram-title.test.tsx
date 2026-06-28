import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import type { DiagramTitleResult } from '@/features/diagram/hooks/use-diagram-title';

import { DiagramTitle } from './diagram-title';

const makeProps = (overrides: Partial<DiagramTitleResult> = {}): DiagramTitleResult => ({
  value: 'My Diagram',
  isEditing: false,
  draft: 'My Diagram',
  onDoubleClick: vi.fn(),
  inputProps: {
    value: 'My Diagram',
    onChange: vi.fn(),
    onBlur: vi.fn(),
    onKeyDown: vi.fn(),
    autoFocus: false,
  },
  ...overrides,
});

describe('DiagramTitle', () => {
  test('shows value in display mode', () => {
    render(<DiagramTitle {...makeProps()} />);
    expect(screen.getByText('My Diagram')).toBeDefined();
  });

  test('calls onDoubleClick when double-clicked', async () => {
    const onDoubleClick = vi.fn();
    const user = userEvent.setup();
    render(<DiagramTitle {...makeProps({ onDoubleClick })} />);
    await user.dblClick(screen.getByText('My Diagram'));
    expect(onDoubleClick).toHaveBeenCalled();
  });

  test('shows input in editing mode', () => {
    render(<DiagramTitle {...makeProps({ isEditing: true, draft: 'editing…' })} />);
    expect(screen.getByRole('textbox')).toBeDefined();
  });

  test('does not show input in display mode', () => {
    render(<DiagramTitle {...makeProps({ isEditing: false })} />);
    expect(screen.queryByRole('textbox')).toBeNull();
  });
});
