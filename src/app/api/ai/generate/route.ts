import { auth } from '@/auth';
import { diagramModel } from '@/features/diagram/ai/diagram-model';
import { generateRequestSchema } from '@/features/diagram/ai/generate-api.schema';
import { generateDiagram } from '@/features/diagram/ai/generate-diagram';
import { consumeRateLimit } from '@/lib/rate-limit';

const RATE_LIMIT = { limit: 10, windowMs: 60 * 60 * 1000 };

const errorResponse = (
  status: number,
  error: string,
  message: string,
  extra: Record<string, unknown> = {},
  headers?: HeadersInit,
) => Response.json({ error, message, ...extra }, { status, headers });

const handleGenerate = async (req: Request): Promise<Response> => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return errorResponse(401, 'unauthorized', 'Sign in to generate diagrams.');

  const parsed = generateRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return errorResponse(
      400,
      'invalid_input',
      parsed.error.issues[0]?.message ?? 'Invalid input.',
      { details: parsed.error.issues.map((i) => i.message) },
    );
  }

  const limit = await consumeRateLimit({ key: `ai-generate:${userId}`, ...RATE_LIMIT });
  if (!limit.ok) {
    return errorResponse(
      429,
      'rate_limited',
      `Generation limit reached. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} min.`,
      { retryAfterSeconds: limit.retryAfterSeconds },
      { 'Retry-After': String(limit.retryAfterSeconds) },
    );
  }

  const result = await generateDiagram(parsed.data.description, {
    model: diagramModel,
    onAttempt: (log) => console.info('[ai/generate] attempt', JSON.stringify({ userId, ...log })),
  });

  if (result.ok) {
    return Response.json({ title: result.title, content: result.content });
  }

  switch (result.reason) {
    case 'not_a_system':
      return errorResponse(422, 'not_a_system', result.message);
    case 'invalid_diagram':
      return errorResponse(
        422,
        'invalid_diagram',
        'The AI could not produce a valid diagram. Try rephrasing or adding detail.',
        { details: result.errors },
      );
    case 'provider_error':
      console.error('[ai/generate] provider error', result.error);
      return errorResponse(
        502,
        'provider_error',
        'The AI service is unavailable right now. Try again later.',
      );
  }
};

export async function POST(req: Request) {
  try {
    return await handleGenerate(req);
  } catch (error) {
    console.error('[ai/generate] unexpected error', error);
    return errorResponse(500, 'internal_error', 'Something went wrong. Try again.');
  }
}
