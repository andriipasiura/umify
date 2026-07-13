import { type ReactNode } from 'react';

import { Card } from '@/components/ui/card';

type SettingsSectionProps = {
  title: string;
  children: ReactNode;
  withWrapper?: boolean;
};

export const SettingsSection = ({ title, children, withWrapper = true }: SettingsSectionProps) => (
  <section className="flex flex-col gap-3">
    <h2 className="text-sm font-semibold">{title}</h2>
    {withWrapper ? <Card>{children}</Card> : children}
  </section>
);
