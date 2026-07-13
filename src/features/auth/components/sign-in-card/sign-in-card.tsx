import { type ReactNode } from 'react';

import { UmifyMark } from '@/components/icons/umify-mark';
import { PrivacyPolicyNotice } from '@/components/privacy-policy-notice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const DEFAULT_TITLE = 'Welcome to UmiFy';
const DEFAULT_DESCRIPTION = 'Sign in to create and manage your UML use-case diagrams.';

type SignInCardProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  terms?: string;
  className?: string;
};

export const SignInCard = ({
  children,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  terms,
  className,
}: SignInCardProps) => (
  <Card
    className={cn(
      'shadow-primary/10 dark:shadow-primary/20 flex w-2xs flex-col gap-6 p-8 shadow-2xl md:w-sm md:p-10',
      className,
    )}
  >
    <CardHeader className="flex flex-col items-center gap-4 px-0 text-center">
      <UmifyMark className="ring-foreground/10 shadow-primary/25 size-12 rounded-lg text-2xl shadow-lg ring-1" />
      <div className="flex flex-col gap-1.5">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-balance">{description}</CardDescription>
      </div>
    </CardHeader>
    <CardContent className="flex flex-col gap-3 px-0">
      {children}
      <PrivacyPolicyNotice terms={terms} className="mt-2" />
    </CardContent>
  </Card>
);
