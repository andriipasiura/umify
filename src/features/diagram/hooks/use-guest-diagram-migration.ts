'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import {
  clearGuestDiagram,
  isGuestDiagramEmpty,
  readGuestDiagram,
} from '@/features/diagram/lib/guest-diagram-storage';
import { importGuestDiagram } from '@/features/diagram/server/diagram.actions';
import { routes } from '@/lib/routes';

const SUCCESS_MESSAGE = 'Your guest diagram was saved to your account';

export const useGuestDiagramMigration = (): void => {
  const router = useRouter();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const stored = readGuestDiagram();
    if (!stored) return;

    if (isGuestDiagramEmpty(stored)) {
      clearGuestDiagram();
      return;
    }

    void (async () => {
      const result = await importGuestDiagram({ title: stored.title, content: stored.content });

      if (result.ok) {
        clearGuestDiagram();
        toast.success(SUCCESS_MESSAGE);
        router.push(routes.diagram(result.data.id));
      } else {
        toast.error(result.error ?? 'Failed to save your guest diagram');
      }
    })();
  }, [router]);
};
