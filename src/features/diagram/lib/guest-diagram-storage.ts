import { type GuestDiagram, guestDiagramSchema } from '@/features/diagram/schema/guest-diagram';
import { createStoredItem } from '@/lib/storage';

export const GUEST_DIAGRAM_STORAGE_KEY = 'umify:guest-diagram';

const guestDiagramItem = createStoredItem(
  'localStorage',
  GUEST_DIAGRAM_STORAGE_KEY,
  guestDiagramSchema,
);

export const readGuestDiagram = guestDiagramItem.read;
export const writeGuestDiagram = guestDiagramItem.write;
export const clearGuestDiagram = guestDiagramItem.clear;

export const isGuestDiagramEmpty = (diagram: GuestDiagram): boolean =>
  diagram.content.nodes.length === 0 && diagram.content.edges.length === 0;
