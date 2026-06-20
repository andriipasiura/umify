import Link from 'next/link';
import { type ReactNode } from 'react';

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
      'shadow-primary/10 bg-muted/30 border-0.5 flex w-2xs flex-col gap-4 rounded-md p-10 shadow-2xl md:w-sm',
      className,
    )}
  >
    <CardHeader className="px-0 text-center">
      <CardTitle className="text-xl">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-3 px-0">
      {children}
      <PrivacyPolicyNotice terms={terms} />
    </CardContent>
  </Card>
);
