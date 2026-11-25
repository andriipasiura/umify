'use client';

import {
  CircleAlert,
  Clock,
  CloudOff,
  FileQuestion,
  LogIn,
  type LucideIcon,
  RotateCw,
  TriangleAlert,
} from 'lucide-react';
import Link from 'next/link';
import { type Ref } from 'react';

import { Button } from '@/components/ui/button';
import { Show } from '@/components/utils/show';
import { type GenerateError } from '@/features/diagram/hooks/use-generate-diagram';
import { routes } from '@/lib/routes';

import { ExamplePrompts } from './example-prompts';

type CardKind = Exclude<GenerateError['kind'], 'invalid_input'>;

const CARD: Record<CardKind, { icon: LucideIcon; title: string }> = {
  unauthorized: { icon: LogIn, title: 'Your session ended' },
  not_a_system: { icon: FileQuestion, title: 'That does not read like a system description' },
  invalid_diagram: { icon: TriangleAlert, title: 'The AI could not build a valid diagram' },
  rate_limited: { icon: Clock, title: 'Generation limit reached' },
  provider_error: { icon: CloudOff, title: 'AI provider unavailable' },
  network: { icon: CloudOff, title: 'You seem to be offline' },
  unknown: { icon: CircleAlert, title: 'Something went wrong' },
};

const INVALID_DIAGRAM_HINT =
  'Try naming who uses the system and what each of them wants to do, then generate again.';
const NOT_A_SYSTEM_HINT = 'Describe who uses a system and what they do with it. Try one of these:';

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

export const formatRetry = (retryAt: number, now: number) => {
  const minutes = Math.max(1, Math.ceil((retryAt - now) / 60_000));
  return `You can try again at ${timeFormat.format(retryAt)} (in ${minutes} min).`;
};

type GenerateErrorCardProps = {
  error: GenerateError & { kind: CardKind };
  now: number;
  onRetry: () => void;
  onPickExample: (description: string) => void;
  actionRef?: Ref<HTMLButtonElement | HTMLAnchorElement>;
};

export const GenerateErrorCard = ({
  error,
  now,
  onRetry,
  onPickExample,
  actionRef,
}: GenerateErrorCardProps) => {
  const { icon: Icon, title } = CARD[error.kind];
  const retryable =
    error.kind === 'provider_error' || error.kind === 'network' || error.kind === 'unknown';

  return (
    <div
      role="alert"
      className="border-destructive/25 bg-destructive/5 dark:bg-destructive/10 motion-safe:animate-in motion-safe:fade-in-0 flex h-full gap-3 overflow-y-auto rounded-lg border p-3 text-sm motion-safe:duration-150"
    >
      <Icon className="text-destructive mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="text-foreground font-medium">{title}</p>

        <Show when={error.kind === 'rate_limited'}>
          <p className="text-muted-foreground">
            {error.retryAt ? formatRetry(error.retryAt, now) : error.message}
          </p>
        </Show>

        <Show when={error.kind === 'not_a_system'}>
          <p className="text-muted-foreground">{error.message}</p>
          <p className="text-muted-foreground">{NOT_A_SYSTEM_HINT}</p>
          <ExamplePrompts onPick={onPickExample} />
        </Show>

        <Show when={error.kind === 'invalid_diagram'}>
          <p className="text-muted-foreground">{INVALID_DIAGRAM_HINT}</p>
          <Show when={error.details.length > 0}>
            <details className="group">
              <summary className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 w-fit cursor-pointer rounded text-xs outline-none select-none focus-visible:ring-3">
                Show {error.details.length} {error.details.length === 1 ? 'issue' : 'issues'}
              </summary>
              <ul className="text-muted-foreground mt-1.5 list-disc space-y-0.5 pl-5 text-xs">
                {error.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </details>
          </Show>
        </Show>

        <Show when={error.kind === 'unauthorized'}>
          <p className="text-muted-foreground">
            {error.message} Your description is kept for when you come back.
          </p>
          <Button asChild size="sm" className="mt-1 w-fit">
            <Link href={routes.signIn} ref={actionRef as Ref<HTMLAnchorElement>}>
              <LogIn />
              Sign in
            </Link>
          </Button>
        </Show>

        <Show when={retryable}>
          <p className="text-muted-foreground">{error.message}</p>
          <Button
            ref={actionRef as Ref<HTMLButtonElement>}
            type="button"
            size="sm"
            variant="outline"
            className="mt-1 w-fit"
            onClick={onRetry}
          >
            <RotateCw />
            Retry
          </Button>
        </Show>
      </div>
    </div>
  );
};
