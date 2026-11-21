import 'server-only';

import { createDeepSeek } from '@ai-sdk/deepseek';

import { env } from '@/env';

export const DIAGRAM_MODEL_ID = 'deepseek-flash';

export const diagramModel = createDeepSeek({ apiKey: env.DEEPSEEK_API_KEY }).responses(
  DIAGRAM_MODEL_ID,
);
