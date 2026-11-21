'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  generateErrorSchema,
  type GenerateSuccess,
  generateSuccessSchema,
} from '@/features/diagram/ai/generate-api.schema';

export const GENERATE_ENDPOINT = '/api/ai/generate';

export type GenerateError = {
  title: string;
  message: string;
  details: string[];
};

const TITLES: Record<number, string> = {
  400: 'Check your description',
  401: 'You are signed out',
  422: 'Could not build a diagram',
  429: 'Limit reached',
  502: 'AI service unavailable',
};

const FALLBACK_ERROR: GenerateError = {
  title: 'Something went wrong',
  message: 'Generation failed. Try again.',
  details: [],
};

export const toGenerateError = (status: number, body: unknown): GenerateError => {
  const parsed = generateErrorSchema.safeParse(body);
  const title = TITLES[status] ?? FALLBACK_ERROR.title;
  if (status === 401) {
    return { title, message: 'Sign in again to generate diagrams.', details: [] };
  }
  if (!parsed.success) return { ...FALLBACK_ERROR, title };
  return { title, message: parsed.data.message, details: parsed.data.details ?? [] };
};

export type UseGenerateDiagramResult = {
  generate: (description: string) => Promise<GenerateSuccess | null>;
  cancel: () => void;
  reset: () => void;
  pending: boolean;
  error: GenerateError | null;
};

export const useGenerateDiagram = (): UseGenerateDiagramResult => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<GenerateError | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setPending(false);
  }, []);

  useEffect(() => cancel, [cancel]);

  const reset = useCallback(() => setError(null), []);

  const generate = useCallback(
    async (description: string) => {
      cancel();
      const controller = new AbortController();
      controllerRef.current = controller;
      setPending(true);
      setError(null);

      try {
        const response = await fetch(GENERATE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description }),
          signal: controller.signal,
        });
        const body: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          setError(toGenerateError(response.status, body));
          return null;
        }
        const parsed = generateSuccessSchema.safeParse(body);
        if (!parsed.success) {
          setError(FALLBACK_ERROR);
          return null;
        }
        return parsed.data;
      } catch {
        if (!controller.signal.aborted) {
          setError({
            title: 'Network error',
            message: 'Could not reach the server. Check your connection and try again.',
            details: [],
          });
        }
        return null;
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
          setPending(false);
        }
      }
    },
    [cancel],
  );

  return { generate, cancel, reset, pending, error };
};
