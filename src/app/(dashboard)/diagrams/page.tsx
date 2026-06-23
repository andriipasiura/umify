import { type SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

import { PageHeader } from '@/components/page-header';
import { Show } from '@/components/utils/show';
import { DiagramBoard, DiagramFilters, DiagramListSkeleton } from '@/features/diagram/client';
import { getDiagramsList, listMyTags, loadDiagramFilters } from '@/features/diagram/server';

const HEADING = 'My Diagrams';
const SUBTITLE = 'Build, manage, and iterate on your use case diagrams — all in one place.';

type DiagramsPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function DiagramsPage({ searchParams }: DiagramsPageProps) {
  const [filters, availableTags] = await Promise.all([
    loadDiagramFilters(searchParams),
    listMyTags(),
  ]);

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader title={HEADING} subtitle={SUBTITLE} className="mt-20" />

      <DiagramFilters availableTags={availableTags} />

      <Suspense key={JSON.stringify(filters)} fallback={<DiagramListSkeleton />}>
        <DiagramsResolver filters={filters} />
      </Suspense>
    </div>
  );
}

type DiagramsResolverProps = {
  filters: Awaited<ReturnType<typeof loadDiagramFilters>>;
};

const DiagramsResolver = async ({ filters }: DiagramsResolverProps) => {
  const { diagrams, shownCount, totalCount } = await getDiagramsList(filters);

  return (
    <div className="flex flex-col gap-3">
      <Show when={totalCount > 0}>
        <p className="text-muted-foreground text-sm">
          Showing {shownCount} of {totalCount} diagrams
        </p>
      </Show>
      <DiagramBoard diagrams={diagrams} />
    </div>
  );
};
