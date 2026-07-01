import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render } from '@/test/render';

import { DiagramExportDialog } from './diagram-export-dialog';

const baseProps = {
  open: true,
  onOpenChange: vi.fn(),
  fileName: 'My Diagram',
  onFileNameChange: vi.fn(),
  transparent: false,
  onTransparentChange: vi.fn(),
  previewSrc: 'data:image/png;base64,abc',
  isPreviewLoading: false,
  isEmpty: false,
  isExporting: false,
  onExport: vi.fn(),
};

describe('DiagramExportDialog', () => {
  it('renders title and description', () => {
    render(<DiagramExportDialog {...baseProps} />);
    expect(screen.getByText('Export diagram')).toBeInTheDocument();
    expect(screen.getByText('Preview and download your diagram.')).toBeInTheDocument();
  });

  it('shows the preview image when previewSrc is set', () => {
    render(<DiagramExportDialog {...baseProps} />);
    expect(screen.getByAltText('Diagram preview')).toBeInTheDocument();
  });

  it('shows a skeleton when isPreviewLoading=true', () => {
    render(<DiagramExportDialog {...baseProps} previewSrc={null} isPreviewLoading={true} />);
    expect(screen.queryByAltText('Diagram preview')).not.toBeInTheDocument();
  });

  it('shows empty state message when isEmpty=true', () => {
    render(<DiagramExportDialog {...baseProps} isEmpty={true} />);
    expect(screen.getByText('No nodes to export')).toBeInTheDocument();
  });

  it('reflects fileName in the input', () => {
    render(<DiagramExportDialog {...baseProps} />);
    expect(screen.getByDisplayValue('My Diagram')).toBeInTheDocument();
  });

  it('calls onFileNameChange when input changes', async () => {
    const onFileNameChange = vi.fn();
    render(<DiagramExportDialog {...baseProps} onFileNameChange={onFileNameChange} />);
    await userEvent.clear(screen.getByDisplayValue('My Diagram'));
    expect(onFileNameChange).toHaveBeenCalled();
  });

  it('calls onTransparentChange when switch is clicked', async () => {
    const onTransparentChange = vi.fn();
    render(<DiagramExportDialog {...baseProps} onTransparentChange={onTransparentChange} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onTransparentChange).toHaveBeenCalledWith(true);
  });

  it('calls onExport with "png" when PNG button clicked', async () => {
    const onExport = vi.fn();
    render(<DiagramExportDialog {...baseProps} onExport={onExport} />);
    await userEvent.click(screen.getByRole('button', { name: /png/i }));
    expect(onExport).toHaveBeenCalledWith('png');
  });

  it('calls onExport with "jpeg" when JPEG button clicked', async () => {
    const onExport = vi.fn();
    render(<DiagramExportDialog {...baseProps} onExport={onExport} />);
    await userEvent.click(screen.getByRole('button', { name: /jpeg/i }));
    expect(onExport).toHaveBeenCalledWith('jpeg');
  });

  it('calls onExport with "svg" when SVG button clicked', async () => {
    const onExport = vi.fn();
    render(<DiagramExportDialog {...baseProps} onExport={onExport} />);
    await userEvent.click(screen.getByRole('button', { name: /svg/i }));
    expect(onExport).toHaveBeenCalledWith('svg');
  });

  it('disables all export buttons when isEmpty=true', () => {
    render(<DiagramExportDialog {...baseProps} isEmpty={true} />);
    const buttons = screen.getAllByRole('button', { name: /png|jpeg|svg/i });
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('disables all export buttons when isExporting=true', () => {
    render(<DiagramExportDialog {...baseProps} isExporting={true} />);
    const buttons = screen.getAllByRole('button', { name: /png|jpeg|svg/i });
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });
});
