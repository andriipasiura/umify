import { cookies } from 'next/headers';
import { type SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

import { auth } from '@/auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { PageHeader } from '@/components/page-header';
import { Show } from '@/components/utils/show';
import { OAuthButton } from '@/features/auth/client';
import { signInWithGithub, signInWithGoogle, signOutAction } from '@/features/auth/server';
import {
  DiagramBoard,
  DiagramFilters,
  DiagramListSkeleton,
  GuestDiagramEditor,
  GuestDiagramMigrator,
} from '@/features/diagram/client';
import { getDiagramsList, listMyTags, loadDiagramFilters } from '@/features/diagram/server';
import { toSessionUser } from '@/lib/auth/session-user';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/constants/site';

const HEADING = 'My Diagrams';
const SUBTITLE = 'Build, manage, and iterate on your use case diagrams — all in one place.';

const SIDEBAR_STATE_COOKIE = 'sidebar_state';

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

const JsonLd = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
  />
);

type HomePageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="h-svh overflow-hidden">
        <JsonLd />
        <GuestDiagramEditor
          signInSlot={
            <>
              <form action={signInWithGoogle}>
                <OAuthButton provider="google" />
              </form>
              <form action={signInWithGithub}>
                <OAuthButton provider="github" />
              </form>
            </>
          }
        />
      </div>
    );
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get(SIDEBAR_STATE_COOKIE)?.value !== 'false';
  const user = toSessionUser(session.user);

  const [filters, availableTags] = await Promise.all([
    loadDiagramFilters(searchParams),
    listMyTags(),
  ]);

  return (
    <DashboardShell user={user} signOutAction={signOutAction} defaultOpen={defaultOpen}>
      <JsonLd />
      <GuestDiagramMigrator />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6">
        <PageHeader title={HEADING} subtitle={SUBTITLE} className="mt-20" />

        <DiagramFilters availableTags={availableTags} />

        <Suspense key={JSON.stringify(filters)} fallback={<DiagramListSkeleton />}>
          <DiagramsResolver filters={filters} />
        </Suspense>
      </div>
    </DashboardShell>
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
