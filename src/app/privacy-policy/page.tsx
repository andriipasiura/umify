import type { Metadata } from 'next';

import { PageHeader } from '@/components/page-header';
import { PRIVACY_POLICY_SECTIONS, PRIVACY_POLICY_UPDATED_AT } from '@/lib/constants/privacy-policy';

const HEADING = 'Privacy Policy';
const SUBTITLE = 'What UmiFy stores, why it stores it, and how to get rid of it.';

export const metadata: Metadata = {
  title: 'Privacy Policy — UmiFy',
  description: 'How UmiFy collects, uses, and stores your data.',
};

const formatUpdatedAt = (date: string) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(date));

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-20">
      <PageHeader title={HEADING} subtitle={SUBTITLE} />

      <p className="text-muted-foreground text-center text-xs">
        Last updated {formatUpdatedAt(PRIVACY_POLICY_UPDATED_AT)}
      </p>

      <div className="flex flex-col gap-8">
        {PRIVACY_POLICY_SECTIONS.map((section) => (
          <section key={section.title} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold">{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="text-muted-foreground text-sm leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
