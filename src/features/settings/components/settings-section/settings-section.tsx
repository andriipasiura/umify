import { type ReactNode } from 'react';

import { Card } from '@/components/ui/card';

type SettingsSectionProps = {
  title: string;
  children: ReactNode;
};

export const SettingsSection = ({ title, children }: SettingsSectionProps) => (
  <section className="flex flex-col gap-3">
    <h2 className="text-sm font-semibold">{title}</h2>
    <Card>{children}</Card>
  </section>
);
