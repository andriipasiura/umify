import type { Metadata } from 'next';

import { GeneratedDiagramEditor } from '@/features/diagram/client';

export const metadata: Metadata = { title: 'Generated diagram' };

export default function GeneratedDiagramPage() {
  return <GeneratedDiagramEditor />;
}
