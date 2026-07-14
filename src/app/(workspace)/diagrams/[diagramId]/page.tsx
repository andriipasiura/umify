import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DiagramEditor } from '@/features/diagram/client';
import { getDiagramForEdit } from '@/features/diagram/server';

type DiagramWorkspacePageProps = {
  params: Promise<{ diagramId: string }>;
};

export const metadata: Metadata = { title: 'Diagram editor' };

export default async function DiagramWorkspacePage({ params }: DiagramWorkspacePageProps) {
  const { diagramId } = await params;

  const diagram = await getDiagramForEdit(diagramId);
  if (!diagram) notFound();

  return (
    <DiagramEditor
      id={diagram.id}
      title={diagram.title}
      visibility={diagram.visibility}
      nodes={diagram.nodes}
      edges={diagram.edges}
    />
  );
}
