import { render } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

const { useGuestDiagramMigrationMock } = vi.hoisted(() => ({
  useGuestDiagramMigrationMock: vi.fn(),
}));

vi.mock('@/features/diagram/hooks/use-guest-diagram-migration', () => ({
  useGuestDiagramMigration: useGuestDiagramMigrationMock,
}));

import { GuestDiagramMigrator } from './guest-diagram-migrator';

describe('GuestDiagramMigrator', () => {
  test('runs the migration hook and renders nothing', () => {
    const { container } = render(<GuestDiagramMigrator />);
    expect(useGuestDiagramMigrationMock).toHaveBeenCalled();
    expect(container).toBeEmptyDOMElement();
  });
});
