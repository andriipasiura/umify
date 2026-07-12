import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { DiagramStatus } from './diagram-status';

describe('DiagramStatus', () => {
  test.each([
    ['saving', 'Saving…'],
    ['error', 'Save failed — click to retry'],
    ['unsaved', 'Unsaved changes'],
    ['saved', 'Saved'],
  ] as const)('renders correct label for status "%s"', (status, label) => {
    render(<DiagramStatus status={status} />);
    expect(screen.getAllByText(label).length).toBeGreaterThan(0);
  });
});
