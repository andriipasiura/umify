import {
  generateText,
  type LanguageModel,
  type LanguageModelUsage,
  type ModelMessage,
  NoObjectGeneratedError,
  Output,
} from 'ai';

import { type DiagramContent } from '../schema/diagram-content';
import { type GeneratedDiagram, generatedDiagramSchema } from './generated-diagram.schema';
import { generatedToDiagramContent } from './generated-to-content';
import { buildRepairPrompt, buildUserPrompt, SYSTEM_PROMPT } from './system-prompt';
import { validateGeneratedDiagram } from './validate-generated-diagram';

const TEMPERATURE = 0.2;
const MAX_OUTPUT_TOKENS = 2000;
const ATTEMPT_TIMEOUT_MS = 30_000;
const DEFAULT_REJECTION = 'The text does not describe a system to model.';

export type AttemptLog = {
  attempt: 1 | 2;
  modelId: string | undefined;
  inputTokens: number | undefined;
  cachedInputTokens: number | undefined;
  outputTokens: number | undefined;
  latencyMs: number;
  outcome: 'ok' | 'not_a_system' | 'invalid' | 'provider_error';
};

type Final =
  | { ok: true; title: string; content: DiagramContent }
  | { ok: false; reason: 'not_a_system'; message: string }
  | { ok: false; reason: 'invalid_diagram'; errors: string[] }
  | { ok: false; reason: 'provider_error'; error: unknown };

export type GenerateDiagramResult = Final & { attempts: AttemptLog[] };

type AttemptResult =
  | { final: Final; outcome: AttemptLog['outcome'] }
  | { final: null; outcome: 'invalid'; errors: string[]; previousText: string };

const describeSchemaError = (error: NoObjectGeneratedError): string[] => {
  const inner = (error.cause as { cause?: unknown } | undefined)?.cause;
  const issues = (inner as { issues?: { path: PropertyKey[]; message: string }[] } | undefined)
    ?.issues;
  if (Array.isArray(issues) && issues.length > 0) {
    return issues.map(
      (i) => `Schema error at "${i.path.map(String).join('.') || '(root)'}": ${i.message}`,
    );
  }
  if ((error.cause as Error | undefined)?.name === 'AI_JSONParseError')
    return ['The output was not valid JSON.'];
  return ['The output did not match the required schema.'];
};

const evaluateOutput = (diagram: GeneratedDiagram): AttemptResult => {
  if (!diagram.isSystemDescription) {
    const message = diagram.rejectionReason?.trim() || DEFAULT_REJECTION;
    return { final: { ok: false, reason: 'not_a_system', message }, outcome: 'not_a_system' };
  }
  const validation = validateGeneratedDiagram(diagram);
  if (!validation.ok) {
    return {
      final: null,
      outcome: 'invalid',
      errors: validation.errors,
      previousText: JSON.stringify(diagram),
    };
  }
  return {
    final: {
      ok: true,
      title: validation.diagram.systemName,
      content: generatedToDiagramContent(validation.diagram),
    },
    outcome: 'ok',
  };
};

type Options = {
  model: LanguageModel;
  onAttempt?: (log: AttemptLog) => void;
};

export const generateDiagram = async (
  description: string,
  { model, onAttempt }: Options,
): Promise<GenerateDiagramResult> => {
  const attempts: AttemptLog[] = [];

  const runAttempt = async (attempt: 1 | 2, messages: ModelMessage[]): Promise<AttemptResult> => {
    const startedAt = Date.now();
    let modelId: string | undefined;
    let usage: LanguageModelUsage | undefined;
    let output: GeneratedDiagram | undefined;
    let result: AttemptResult | undefined;

    try {
      const response = await generateText({
        model,
        system: SYSTEM_PROMPT,
        messages,
        output: Output.object({ name: 'UseCaseDiagram', schema: generatedDiagramSchema }),
        temperature: TEMPERATURE,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        maxRetries: 1,
        abortSignal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
        providerOptions: { deepseek: { thinking: { type: 'disabled' } } },
      });
      modelId = response.response.modelId;
      usage = response.usage;
      output = response.output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        modelId = error.response?.modelId;
        usage = error.usage;
        result = {
          final: null,
          outcome: 'invalid',
          errors: describeSchemaError(error),
          previousText: error.text ?? '',
        };
      } else {
        result = {
          final: { ok: false, reason: 'provider_error', error },
          outcome: 'provider_error',
        };
      }
    }
    result ??= evaluateOutput(output!);

    const log: AttemptLog = {
      attempt,
      modelId,
      inputTokens: usage?.inputTokens,
      cachedInputTokens: usage?.inputTokenDetails?.cacheReadTokens,
      outputTokens: usage?.outputTokens,
      latencyMs: Date.now() - startedAt,
      outcome: result.outcome,
    };
    attempts.push(log);
    onAttempt?.(log);
    return result;
  };

  const userMessage: ModelMessage = { role: 'user', content: buildUserPrompt(description) };

  const first = await runAttempt(1, [userMessage]);
  if (first.final) return { ...first.final, attempts };

  const second = await runAttempt(2, [
    userMessage,
    ...(first.previousText
      ? [{ role: 'assistant', content: first.previousText } satisfies ModelMessage]
      : []),
    { role: 'user', content: buildRepairPrompt(first.errors) },
  ]);
  if (second.final) return { ...second.final, attempts };

  return { ok: false, reason: 'invalid_diagram', errors: second.errors, attempts };
};
