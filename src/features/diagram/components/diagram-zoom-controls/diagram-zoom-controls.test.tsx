import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { DiagramZoomControls } from './diagram-zoom-controls';

const defaultProps = {
  zoomPercent: 100,
  onZoomIn: vi.fn(),
  onZoomOut: vi.fn(),
  onFitView: vi.fn(),
  onResetZoom: vi.fn(),
};

describe('DiagramZoomControls', () => {
  test('renders all four buttons by accessible name', () => {
    render(<DiagramZoomControls {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset zoom to 100%' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fit view' })).toBeInTheDocument();
  });

  test('displays the zoom percentage', () => {
    render(<DiagramZoomControls {...defaultProps} zoomPercent={150} />);
    expect(screen.getByRole('button', { name: 'Reset zoom to 100%' })).toHaveTextContent('150%');
  });

  test('clicking zoom in calls onZoomIn', async () => {
    const onZoomIn = vi.fn();
    const user = userEvent.setup();
    render(<DiagramZoomControls {...defaultProps} onZoomIn={onZoomIn} />);
    await user.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(onZoomIn).toHaveBeenCalled();
  });

  test('clicking zoom out calls onZoomOut', async () => {
    const onZoomOut = vi.fn();
    const user = userEvent.setup();
    render(<DiagramZoomControls {...defaultProps} onZoomOut={onZoomOut} />);
    await user.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(onZoomOut).toHaveBeenCalled();
  });

  test('clicking fit view calls onFitView', async () => {
    const onFitView = vi.fn();
    const user = userEvent.setup();
    render(<DiagramZoomControls {...defaultProps} onFitView={onFitView} />);
    await user.click(screen.getByRole('button', { name: 'Fit view' }));
    expect(onFitView).toHaveBeenCalled();
  });

  test('clicking the percentage readout calls onResetZoom', async () => {
    const onResetZoom = vi.fn();
    const user = userEvent.setup();
    render(<DiagramZoomControls {...defaultProps} onResetZoom={onResetZoom} />);
    await user.click(screen.getByRole('button', { name: 'Reset zoom to 100%' }));
    expect(onResetZoom).toHaveBeenCalled();
  });
});
