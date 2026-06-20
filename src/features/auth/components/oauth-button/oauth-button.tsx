import { type ReactNode } from 'react';

import { GitHubIcon } from '@/components/icons/github-icon';
import { GoogleIcon } from '@/components/icons/google-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Provider = 'google' | 'github';

type ProviderConfig = {
  label: string;
  Icon: (props: { className?: string }) => ReactNode;
};

const PROVIDERS: Record<Provider, ProviderConfig> = {
  google: { label: 'Continue with Google', Icon: GoogleIcon },
  github: { label: 'Continue with GitHub', Icon: GitHubIcon },
};

type OAuthButtonProps = {
  provider: Provider;
  className?: string;
};

export const OAuthButton = ({ provider, className }: OAuthButtonProps) => {
  const { label, Icon } = PROVIDERS[provider];

  return (
    <Button type="submit" variant="outline" className={cn('w-full', className)} size="lg">
      <Icon className="size-5" />
      {label}
    </Button>
  );
};
