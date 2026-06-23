'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { type DiagramMetaInput, diagramMetaSchema } from '@/features/diagram/schema/diagram-meta';
import { type ActionResult } from '@/features/diagram/server/types';

type UseDiagramFormOptions = {
  defaultValues: DiagramMetaInput;
  action: (values: DiagramMetaInput) => Promise<ActionResult<{ id: string }>>;
  onSuccess?: (id: string) => void;
};

export const useDiagramForm = ({ defaultValues, action, onSuccess }: UseDiagramFormOptions) => {
  const form = useForm<DiagramMetaInput>({
    resolver: zodResolver(diagramMetaSchema),
    defaultValues,
  });

  const [state, dispatch, pending] = useActionState(
    async (_prev: unknown, values: DiagramMetaInput) => action(values),
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.ok === false) {
      const { fieldErrors } = state;
      if (fieldErrors) {
        for (const [field, messages] of Object.entries(fieldErrors)) {
          form.setError(field as keyof DiagramMetaInput, { message: messages[0] });
        }
      } else {
        form.setError('root', { message: state.error });
      }
    }
    if (state.ok === true) {
      onSuccess?.(state.data.id);
    }
  }, [state, form, onSuccess]);

  const onSubmit = form.handleSubmit((values) => {
    dispatch(values);
  });

  return { form, onSubmit, pending };
};
