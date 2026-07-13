import Link from 'next/link';

import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';

const DEFAULT_TERMS_TEXT = 'By continuing, you agree to the';
const LINK_LABEL = 'Privacy Policy';

type PrivacyPolicyNoticeProps = {
  terms?: string;
  className?: string;
};

export const PrivacyPolicyNotice = ({
  terms = DEFAULT_TERMS_TEXT,
  className,
}: PrivacyPolicyNoticeProps) => (
  <p className={cn('text-muted-foreground text-center text-xs', className)}>
    {terms}{' '}
    <Link href={routes.privacyPolicy} className="text-foreground underline underline-offset-3">
      {LINK_LABEL}
    </Link>
  </p>
);
