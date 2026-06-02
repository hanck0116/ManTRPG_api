import type { LlmCallResult, LlmSettings } from '../api/schemas.js';
import { LlmCallResultSchema } from '../api/schemas.js';
import type { LlmAdapter, LlmRequest } from './types.js';
import { buildPrompt } from '../gm/prompt.js';

interface OpenAICompatibleOptions {
  provider: LlmSettings['provider'];
  defaultEndpoint: string;
  defaultModel: string;
  authHeader?: (apiKey: string) => Record<string, string>;
}

export function createOpenAICompatibleAdapter(options: OpenAICompatibleOptions): LlmAdapter {
  return {
    provider: options.provider,
    async call(request: LlmRequest): Promise<LlmCallResult> {
      const endpoint = request.settings.endpoint ?? options.defaultEndpoint;
      const model = request.settings.model ?? options.defaultModel;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.authHeader?.(request.settings.apiKey) ?? { Authorization: `Bearer ${request.settings.apiKey}` }),
        },
        body: JSON.stringify({
          model,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: buildPrompt(request.task) },
            { role: 'user', content: JSON.stringify(redactRequest(request)) },
          ],
        }),
      });

      if (!response.ok) throw new Error(`${options.provider}_http_${response.status}`);
      const body = await response.json() as { choices?: Array<{ message?: { content?: string } }>; usage?: { prompt_tokens?: number; completion_tokens?: number } };
      const content = body.choices?.[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(content) as unknown;
      const result = LlmCallResultSchema.parse({
        ok: true,
        task: request.task,
        ...(typeof parsed === 'object' && parsed !== null ? parsed : {}),
        usage: {
          promptTokens: body.usage?.prompt_tokens ?? estimateTokens(JSON.stringify(request)),
          completionTokens: body.usage?.completion_tokens ?? estimateTokens(content),
          provider: options.provider,
          model,
        },
      });
      return result;
    },
    async test(settings: LlmSettings) {
      const endpoint = settings.endpoint ?? options.defaultEndpoint;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.authHeader?.(settings.apiKey) ?? { Authorization: `Bearer ${settings.apiKey}` }),
        },
        body: JSON.stringify({ model: settings.model ?? options.defaultModel, messages: [{ role: 'user', content: 'Return {"ok":true} as JSON.' }], response_format: { type: 'json_object' } }),
      });
      return { ok: response.ok, message: response.ok ? 'provider reachable' : `${options.provider}_http_${response.status}` };
    },
  };
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function redactRequest(request: LlmRequest): Omit<LlmRequest, 'settings'> & { settings: Omit<LlmSettings, 'apiKey'> & { apiKey: '[redacted]' } } {
  return {
    ...request,
    settings: { ...request.settings, apiKey: '[redacted]' },
  } as Omit<LlmRequest, 'settings'> & { settings: Omit<LlmSettings, 'apiKey'> & { apiKey: '[redacted]' } };
}
