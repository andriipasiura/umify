import { type Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { UmifyMark } from '@/components/icons/umify-mark';
import { Badge } from '@/components/ui/badge';
import { DiagramViewer } from '@/features/diagram/client';
import { getPublicDiagram } from '@/features/diagram/server';
import { SITE_OG_IMAGE } from '@/lib/constants/site';
import { routes } from '@/lib/routes';

type SharePageProps = {
  params: Promise<{ diagramId: string }>;
};

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { diagramId } = await params;
  const diagram = await getPublicDiagram(diagramId);

  if (!diagram) {
    return { title: 'Diagram not found', robots: { index: false, follow: false } };
  }

  const description = `View "${diagram.title}", a UML use-case diagram shared with UmiFy.`;

  return {
    title: diagram.title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      type: 'website',
      title: diagram.title,
      description,
      url: routes.share(diagram.id),
      images: [{ url: SITE_OG_IMAGE, width: 1200, height: 630, alt: diagram.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: diagram.title,
      description,
      images: [SITE_OG_IMAGE],
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { diagramId } = await params;

  const diagram = await getPublicDiagram(diagramId);
  if (!diagram) notFound();

  return (
    <>
      <header className="bg-background flex h-12 shrink-0 items-center gap-3 border-b px-4">
        <Link href={routes.home} className="flex items-center gap-2">
          <UmifyMark className="size-6 text-sm" />
          <span className="text-sm font-semibold">UmiFy</span>
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="truncate text-sm font-medium">{diagram.title}</h1>
        <Badge variant="secondary" className="ml-auto">
          Read-only
        </Badge>
      </header>
      <div className="flex-1 overflow-hidden">
        <DiagramViewer nodes={diagram.nodes} edges={diagram.edges} />
      </div>
    </>
  );
}
