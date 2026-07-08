import { type GuestDiagram, guestDiagramSchema } from '@/features/diagram/schema/guest-diagram';

export const GUEST_DIAGRAM_STORAGE_KEY = 'umify:guest-diagram';

export const readGuestDiagram = (): GuestDiagram | null => {
  const raw = window.localStorage.getItem(GUEST_DIAGRAM_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = guestDiagramSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export const writeGuestDiagram = (diagram: GuestDiagram): void => {
  window.localStorage.setItem(GUEST_DIAGRAM_STORAGE_KEY, JSON.stringify(diagram));
};

export const clearGuestDiagram = (): void => {
  window.localStorage.removeItem(GUEST_DIAGRAM_STORAGE_KEY);
};

export const isGuestDiagramEmpty = (diagram: GuestDiagram): boolean =>
  diagram.content.nodes.length === 0 && diagram.content.edges.length === 0;
