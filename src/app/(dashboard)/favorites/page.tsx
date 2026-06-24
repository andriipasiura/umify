import { type SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

import { PageHeader } from '@/components/page-header';
import { Show } from '@/components/utils/show';
import { DiagramBoard, DiagramFilters, DiagramListSkeleton } from '@/features/diagram/client';
import { getFavoriteDiagramsList, listMyTags, loadDiagramFilters } from '@/features/diagram/server';

const HEADING = 'Favorites';
const SUBTITLE = "Diagrams you've starred — your most important work, always within reach.";

type FavoritesPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function FavoritesPage({ searchParams }: FavoritesPageProps) {
  const [filters, availableTags] = await Promise.all([
    loadDiagramFilters(searchParams),
    listMyTags(),
  ]);

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader title={HEADING} subtitle={SUBTITLE} className="mt-20" />

      <DiagramFilters availableTags={availableTags} />

      <Suspense key={JSON.stringify(filters)} fallback={<DiagramListSkeleton />}>
        <FavoritesResolver filters={filters} />
      </Suspense>
    </div>
  );
}

type FavoritesResolverProps = {
  filters: Awaited<ReturnType<typeof loadDiagramFilters>>;
};

const FavoritesResolver = async ({ filters }: FavoritesResolverProps) => {
  const { diagrams, shownCount, totalCount } = await getFavoriteDiagramsList(filters);

  return (
    <div className="flex flex-col gap-3">
      <Show when={totalCount > 0}>
        <p className="text-muted-foreground text-sm">
          Showing {shownCount} of {totalCount} favorite diagrams
        </p>
      </Show>
      <DiagramBoard variant="favorites" diagrams={diagrams} />
    </div>
  );
};
