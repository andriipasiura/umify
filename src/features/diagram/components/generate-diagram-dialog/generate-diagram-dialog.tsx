'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  type GenerateRequest,
  generateRequestSchema,
} from '@/features/diagram/ai/generate-api.schema';
import { useGenerateDiagram } from '@/features/diagram/hooks/use-generate-diagram';
import { writeGeneratedDiagram } from '@/features/diagram/lib/generated-diagram-storage';
import { routes } from '@/lib/routes';

const TITLE = 'Generate with AI';
const DESCRIPTION =
  'Describe the system: who uses it and what they want to do. You can edit the result before saving.';
const PLACEHOLDER =
  'e.g. An online bookstore. Customers browse books, add them to a cart and check out, which always requires paying through a payment gateway. Customers may apply a coupon at checkout. Admins manage the catalogue.';
const SUBMIT_LABEL = 'Generate';
const PENDING_LABEL = 'Generating…';

type GenerateDiagramDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const GenerateDiagramDialog = ({ open, onOpenChange }: GenerateDiagramDialogProps) => {
  const router = useRouter();
  const { generate, cancel, reset, pending, error } = useGenerateDiagram();
  const form = useForm<GenerateRequest>({
    resolver: zodResolver(generateRequestSchema),
    defaultValues: { description: '' },
  });
  const length = useWatch({ control: form.control, name: 'description' }).length;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      cancel();
      reset();
    }
    onOpenChange(next);
  };

  const onSubmit = form.handleSubmit(async ({ description }) => {
    const result = await generate(description);
    if (!result) return;
    writeGeneratedDiagram(result);
    onOpenChange(false);
    form.reset();
    router.push(routes.newDiagram);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{TITLE}</DialogTitle>
          <DialogDescription>{DESCRIPTION}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={PLACEHOLDER}
                      disabled={pending}
                      maxLength={DESCRIPTION_MAX}
                      className="max-h-72 min-h-32"
                    />
                  </FormControl>
                  <div className="flex items-start justify-between gap-2">
                    <FormMessage />
                    <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                      {length}/{DESCRIPTION_MAX}
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <Show when={!!error}>
              <div
                role="alert"
                className="border-destructive/30 bg-destructive/10 text-destructive flex flex-col gap-1 rounded-lg border p-3 text-sm"
              >
                <p className="font-medium">{error?.title}</p>
                <p>{error?.message}</p>
                <Show when={(error?.details.length ?? 0) > 0}>
                  <ul className="mt-1 max-h-32 list-disc overflow-y-auto pl-5 text-xs">
                    {error?.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </Show>
              </div>
            </Show>

            <DialogFooter>
              <Show when={pending}>
                <Button type="button" variant="outline" onClick={cancel}>
                  Cancel
                </Button>
              </Show>
              <Button type="submit" disabled={pending || length === 0}>
                {pending ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
                {pending ? PENDING_LABEL : SUBMIT_LABEL}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
