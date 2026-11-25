'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  generateErrorSchema,
  type GenerateSuccess,
  generateSuccessSchema,
} from '@/features/diagram/ai/generate-api.schema';

export const GENERATE_ENDPOINT = '/api/ai/generate';

export type GenerateErrorKind =
  | 'invalid_input'
  | 'unauthorized'
  | 'not_a_system'
  | 'invalid_diagram'
  | 'rate_limited'
  | 'provider_error'
  | 'network'
  | 'unknown';

export type GenerateError = {
  kind: GenerateErrorKind;
  message: string;
  details: string[];
  retryAt: number | null;
};

const FALLBACK_MESSAGE = 'Generation failed. Try again.';
const UNAUTHORIZED_MESSAGE = 'Sign in again to generate diagrams.';
const NETWORK_MESSAGE = 'Could not reach the server. Check your connection and try again.';

const kindFor = (status: number, code: string | undefined): GenerateErrorKind => {
  switch (status) {
    case 400:
      return 'invalid_input';
    case 401:
      return 'unauthorized';
    case 422:
      return code === 'not_a_system' ? 'not_a_system' : 'invalid_diagram';
    case 429:
      return 'rate_limited';
    case 502:
      return 'provider_error';
    default:
      return 'unknown';
  }
};

const parseRetryAfter = (header: string | null): number | undefined => {
  const seconds = Number(header);
  return header && Number.isFinite(seconds) ? seconds : undefined;
};

export const toGenerateError = (
  status: number,
  body: unknown,
  {
    retryAfterHeader = null,
    now = Date.now(),
  }: { retryAfterHeader?: string | null; now?: number } = {},
): GenerateError => {
  const parsed = generateErrorSchema.safeParse(body);
  const data = parsed.success ? parsed.data : undefined;
  const kind = kindFor(status, data?.error);

  const retryAfterSeconds = data?.retryAfterSeconds ?? parseRetryAfter(retryAfterHeader);
  const retryAt =
    kind === 'rate_limited' && retryAfterSeconds !== undefined
      ? now + retryAfterSeconds * 1000
      : null;

  const message =
    kind === 'unauthorized' ? UNAUTHORIZED_MESSAGE : (data?.message ?? FALLBACK_MESSAGE);

  return { kind, message, details: data?.details ?? [], retryAt };
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

  const generate = useCallback(async (description: string) => {
    if (controllerRef.current) return null;
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
      if (controller.signal.aborted) return null;

      if (!response.ok) {
        setError(
          toGenerateError(response.status, body, {
            retryAfterHeader: response.headers.get('Retry-After'),
          }),
        );
        return null;
      }
      const parsed = generateSuccessSchema.safeParse(body);
      if (!parsed.success) {
        setError(toGenerateError(500, null));
        return null;
      }
      return parsed.data;
    } catch {
      if (!controller.signal.aborted) {
        setError({ kind: 'network', message: NETWORK_MESSAGE, details: [], retryAt: null });
      }
      return null;
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setPending(false);
      }
    }
  }, []);

  return { generate, cancel, reset, pending, error };
};
