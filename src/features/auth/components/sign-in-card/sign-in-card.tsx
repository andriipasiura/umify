import Link from 'next/link';
import { type ReactNode } from 'react';

import { UmifyMark } from '@/components/icons/umify-mark';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';

const DEFAULT_TITLE = 'Welcome to UmiFy';
const DEFAULT_DESCRIPTION = 'Sign in to create and manage your UML use-case diagrams.';
const DEFAULT_TERMS_TEXT = 'By continuing, you agree to the';

type SignInCardProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  terms?: string;
  className?: string;
};

const PrivacyPolicyNotice = ({ terms }: { terms: string }) => (
  <p className="text-muted-foreground mt-2 text-center text-xs">
    {terms}{' '}
    <Link href={routes.privacyPolicy} className="text-foreground underline">
      Privacy Policy
    </Link>
  </p>
);

export const SignInCard = ({
  children,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  terms = DEFAULT_TERMS_TEXT,
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
      <PrivacyPolicyNotice terms={terms} />
    </CardContent>
  </Card>
);
