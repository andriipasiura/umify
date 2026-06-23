'use client';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Show } from '@/components/utils/show';
import { useDiagramForm } from '@/features/diagram/hooks/use-diagram-form';
import { type DiagramMetaInput } from '@/features/diagram/schema/diagram-meta';
import { type ActionResult } from '@/features/diagram/server/types';

import { DiagramFormFields } from '../diagram-form-fields';

type DiagramFormProps = {
  defaultValues: DiagramMetaInput;
  action: (values: DiagramMetaInput) => Promise<ActionResult<{ id: string }>>;
  submitLabel: string;
  onSuccess?: (id: string) => void;
};

export const DiagramForm = ({
  defaultValues,
  action,
  submitLabel,
  onSuccess,
}: DiagramFormProps) => {
  const { form, onSubmit, pending } = useDiagramForm({ defaultValues, action, onSuccess });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <DiagramFormFields control={form.control} />

        <Show when={!!form.formState.errors.root}>
          <p className="text-destructive text-sm" role="alert">
            {form.formState.errors.root?.message}
          </p>
        </Show>

        <Button type="submit" disabled={pending} className="self-end">
          {pending ? 'Saving…' : submitLabel}
        </Button>
      </form>
    </Form>
  );
};
