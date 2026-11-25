'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Show } from '@/components/utils/show';
import {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  type GenerateRequest,
  generateRequestSchema,
  type GenerateSuccess,
} from '@/features/diagram/ai/generate-api.schema';
import {
  type GenerateError,
  useGenerateDiagram,
} from '@/features/diagram/hooks/use-generate-diagram';
import { writeGeneratedDiagram } from '@/features/diagram/lib/generated-diagram-storage';
import { useGenerateDraftStore } from '@/features/diagram/store/generate-draft-store';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';

import { ExamplePrompts } from './example-prompts';
import { GenerateErrorCard } from './generate-error-card';
import { GenerationGhost } from './generation-ghost';

const TITLE = 'Generate with AI';
const DESCRIPTION =
  'Describe the system: who uses it and what they want to do. You can edit the result before saving.';
const REGENERATE_DESCRIPTION =
  'Generating again replaces the current diagram, including any edits you made to it.';
const PLACEHOLDER =
  'e.g. An online bookstore. Customers browse books, add them to a cart and check out, which always requires paying through a payment gateway. Customers may apply a coupon at checkout. Admins manage the catalogue.';
const EXAMPLES_LABEL = 'Try an example';
const SUBMIT_LABEL = 'Generate';
const PENDING_LABEL = 'Generating…';
const CANCEL_LABEL = 'Cancel';
const PENDING_ANNOUNCEMENT = 'Generating diagram. This usually takes a few seconds.';
const RATE_LIMIT_TICK_MS = 15_000;
const NEAR_MAX_RATIO = 0.9;

type CardError = GenerateError & { kind: Exclude<GenerateError['kind'], 'invalid_input'> };

const isCardError = (error: GenerateError | null): error is CardError =>
  !!error && error.kind !== 'invalid_input';

const ShortcutHint = () => {
  const [isMac] = useState(() => /Mac|iPhone|iPad/.test(navigator.userAgent));
  return (
    <p className="text-muted-foreground hidden text-xs sm:pointer-fine:block">
      <kbd className="bg-background rounded border px-1 font-sans">{isMac ? '⌘' : 'Ctrl'}</kbd>{' '}
      <kbd className="bg-background rounded border px-1 font-sans">Enter</kbd> to generate
    </p>
  );
};

const useRateLimitClock = (retryAt: number | null, onExpire: () => void) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (retryAt === null) return;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      if (current >= retryAt) onExpire();
    };
    const id = setInterval(tick, RATE_LIMIT_TICK_MS);
    const first = setTimeout(tick, 0);
    return () => {
      clearInterval(id);
      clearTimeout(first);
    };
  }, [retryAt, onExpire]);

  return now;
};

type GenerateDiagramDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated?: (draft: GenerateSuccess) => void;
};

export const GenerateDiagramDialog = ({
  open,
  onOpenChange,
  onGenerated,
}: GenerateDiagramDialogProps) => {
  const router = useRouter();
  const { generate, cancel, reset, pending, error } = useGenerateDiagram();
  const setDraft = useGenerateDraftStore((s) => s.setDescription);
  const form = useForm<GenerateRequest>({
    resolver: zodResolver(generateRequestSchema),
    defaultValues: { description: useGenerateDraftStore.getState().description },
  });
  const description = useWatch({ control: form.control, name: 'description' });
  const length = description.length;
  const trimmedLength = description.trim().length;

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const actionRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  const retryAt = error?.kind === 'rate_limited' ? error.retryAt : null;
  const now = useRateLimitClock(retryAt, reset);
  const coolingDown = retryAt !== null && now < retryAt;
  const canSubmit =
    !pending && !coolingDown && trimmedLength >= DESCRIPTION_MIN && length <= DESCRIPTION_MAX;

  useEffect(() => {
    if (open) form.reset({ description: useGenerateDraftStore.getState().description });
  }, [open, form]);

  useEffect(() => {
    if (pending) cancelRef.current?.focus();
  }, [pending]);

  useEffect(() => {
    if (!error) return;
    if (error.kind === 'invalid_input') {
      form.setError(
        'description',
        { type: 'server', message: error.message },
        { shouldFocus: true },
      );
      return;
    }
    (actionRef.current ?? textareaRef.current)?.focus();
  }, [error, form]);

  const setDescription = (value: string) => {
    form.setValue('description', value, { shouldValidate: form.formState.isSubmitted });
    setDraft(value);
  };

  const pickExample = (value: string) => {
    setDescription(value);
    if (error && error.kind !== 'rate_limited') reset();
    textareaRef.current?.focus();
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) cancel();
    onOpenChange(next);
  };

  const submit = form.handleSubmit(async ({ description: value }) => {
    if (!canSubmit) return;
    const result = await generate(value);
    if (!result) return;
    writeGeneratedDiagram(result);
    onOpenChange(false);
    if (onGenerated) onGenerated(result);
    else router.push(routes.newDiagram);
  });

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || !(e.metaKey || e.ctrlKey)) return;
    e.preventDefault();
    if (canSubmit) void submit();
  };

  const belowMin = trimmedLength < DESCRIPTION_MIN;
  const nearMax = length >= DESCRIPTION_MAX * NEAR_MAX_RATIO;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader className="flex-row items-start gap-3 pr-8">
          <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Sparkles className="size-4.5" aria-hidden />
          </span>
          <div className="flex flex-col gap-1">
            <DialogTitle>{TITLE}</DialogTitle>
            <DialogDescription>
              {onGenerated ? REGENERATE_DESCRIPTION : DESCRIPTION}
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System description</FormLabel>
                  <div className="relative h-52 sm:h-56">
                    <FormControl>
                      <Textarea
                        {...field}
                        ref={(el) => {
                          field.ref(el);
                          textareaRef.current = el;
                        }}
                        onChange={(e) => {
                          field.onChange(e);
                          setDraft(e.target.value);
                          if (error && error.kind !== 'rate_limited') reset();
                        }}
                        onKeyDown={onKeyDown}
                        placeholder={PLACEHOLDER}
                        disabled={pending}
                        maxLength={DESCRIPTION_MAX}
                        className={cn(
                          'field-sizing-fixed h-full resize-none',
                          pending && 'invisible',
                        )}
                      />
                    </FormControl>
                    <Show when={pending}>
                      <div className="motion-safe:animate-in motion-safe:fade-in-0 absolute inset-0 motion-safe:duration-150">
                        <GenerationGhost description={description} />
                      </div>
                    </Show>
                  </div>
                  <div className="flex min-h-4 items-start justify-between gap-2 text-xs">
                    <FormMessage className="text-xs" />
                    <span
                      className={cn(
                        'text-muted-foreground ml-auto shrink-0 tabular-nums',
                        nearMax && 'text-amber-600 dark:text-amber-400',
                      )}
                    >
                      <Show when={belowMin && length > 0}>
                        <span>min {DESCRIPTION_MIN} · </span>
                      </Show>
                      {length} / {DESCRIPTION_MAX}
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <div className="h-32">
              <Show
                when={isCardError(error)}
                fallback={
                  <div className="flex flex-col gap-2 pt-1">
                    <p className="text-muted-foreground text-xs font-medium">{EXAMPLES_LABEL}</p>
                    <ExamplePrompts onPick={pickExample} disabled={pending} />
                  </div>
                }
              >
                {isCardError(error) && (
                  <GenerateErrorCard
                    error={error}
                    now={now}
                    onRetry={() => void submit()}
                    onPickExample={pickExample}
                    actionRef={actionRef}
                  />
                )}
              </Show>
            </div>

            <DialogFooter className="sm:items-center sm:justify-between">
              <ShortcutHint />
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Show when={pending}>
                  <Button ref={cancelRef} type="button" variant="outline" onClick={cancel}>
                    {CANCEL_LABEL}
                  </Button>
                </Show>
                <Button type="submit" disabled={!canSubmit} className="sm:min-w-32">
                  {pending ? (
                    <LoaderCircle className="motion-safe:animate-spin" aria-hidden />
                  ) : (
                    <Sparkles aria-hidden />
                  )}
                  {pending ? PENDING_LABEL : SUBMIT_LABEL}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
        <p className="sr-only" aria-live="polite">
          {pending ? PENDING_ANNOUNCEMENT : ''}
        </p>
      </DialogContent>
    </Dialog>
  );
};
