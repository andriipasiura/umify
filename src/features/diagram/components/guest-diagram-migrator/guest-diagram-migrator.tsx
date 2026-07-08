'use client';

import { useGuestDiagramMigration } from '@/features/diagram/hooks/use-guest-diagram-migration';

export const GuestDiagramMigrator = () => {
  useGuestDiagramMigration();
  return null;
};
