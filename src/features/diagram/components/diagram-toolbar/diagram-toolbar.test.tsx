import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { DiagramToolbar } from './diagram-toolbar';

const defaultProps = {
  tool: 'select' as const,
  onSelectTool: vi.fn(),
  activeRelation: 'include' as const,
  onSelectRelation: vi.fn(),
  onUndo: vi.fn(),
  onRedo: vi.fn(),
  canUndo: true,
  canRedo: true,
};

describe('DiagramToolbar', () => {
  test('renders all tool buttons by accessible name', () => {
    render(<DiagramToolbar {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Eraser' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Actor' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Boundary' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Use Case' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Note' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Choose relation type' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Redo' })).toBeInTheDocument();
  });

  test('clicking a tool button calls onSelectTool with the correct tool', async () => {
    const onSelectTool = vi.fn();
    const user = userEvent.setup();
    render(<DiagramToolbar {...defaultProps} onSelectTool={onSelectTool} />);

    await user.click(screen.getByRole('button', { name: 'Pan' }));
    expect(onSelectTool).toHaveBeenCalledWith('pan');

    await user.click(screen.getByRole('button', { name: 'Actor' }));
    expect(onSelectTool).toHaveBeenCalledWith('actor');
  });

  test('active tool button has aria-pressed=true', () => {
    render(<DiagramToolbar {...defaultProps} tool="pan" />);
    expect(screen.getByRole('button', { name: 'Pan' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Select' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('undo button is disabled when canUndo is false', () => {
    render(<DiagramToolbar {...defaultProps} canUndo={false} />);
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
  });

  test('redo button is disabled when canRedo is false', () => {
    render(<DiagramToolbar {...defaultProps} canRedo={false} />);
    expect(screen.getByRole('button', { name: 'Redo' })).toBeDisabled();
  });

  test('clicking undo calls onUndo', async () => {
    const onUndo = vi.fn();
    const user = userEvent.setup();
    render(<DiagramToolbar {...defaultProps} onUndo={onUndo} />);
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalled();
  });

  test('clicking redo calls onRedo', async () => {
    const onRedo = vi.fn();
    const user = userEvent.setup();
    render(<DiagramToolbar {...defaultProps} onRedo={onRedo} />);
    await user.click(screen.getByRole('button', { name: 'Redo' }));
    expect(onRedo).toHaveBeenCalled();
  });
});
