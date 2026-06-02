import type { LlmCallResult, LlmSettings } from '../api/schemas.js';
import { LlmCallResultSchema } from '../api/schemas.js';
import { assertCompactPayloadSafe, serializeCompactPayload } from '../ai/compactPayload.js';
import { maxTokensForTask } from '../ai/callPolicy.js';
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
      const payload = serializeRequestPayload(request);
      assertCompactPayloadSafe(payload);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.authHeader?.(request.settings.apiKey) ?? { Authorization: `Bearer ${request.settings.apiKey}` }),
        },
        body: JSON.stringify({
          model,
          response_format: { type: 'json_object' },
          max_tokens: maxTokensForTask(request.task),
          messages: [
            { role: 'system', content: buildPrompt(request.task) },
            { role: 'user', content: payload },
          ],
        }),
      });

      if (!response.ok) throw new Error(`${options.provider}_http_${response.status}`);
      const body = await response.json() as { choices?: Array<{ message?: { content?: string } }>; usage?: { prompt_tokens?: number; completion_tokens?: number } };
      const content = body.choices?.[0]?.message?.content ?? '{}';
      const parsed = parseJsonOnce(content);
      return LlmCallResultSchema.parse({
        ok: true,
        task: request.task,
        ...(typeof parsed === 'object' && parsed !== null ? parsed : {}),
        usage: {
          promptTokens: body.usage?.prompt_tokens ?? estimateTokens(payload),
          completionTokens: body.usage?.completion_tokens ?? estimateTokens(content),
          provider: options.provider,
          model,
        },
      });
    },
    async test(settings: LlmSettings) {
      const endpoint = settings.endpoint ?? options.defaultEndpoint;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.authHeader?.(settings.apiKey) ?? { Authorization: `Bearer ${settings.apiKey}` }),
        },
        body: JSON.stringify({ model: settings.model ?? options.defaultModel, max_tokens: 20, messages: [{ role: 'user', content: 'Return {"ok":true} as JSON.' }], response_format: { type: 'json_object' } }),
      });
      return { ok: response.ok, message: response.ok ? 'provider reachable' : `${options.provider}_http_${response.status}` };
    },
  };
}

function serializeRequestPayload(request: LlmRequest): string {
  return serializeCompactPayload({
    task: request.task,
    state: request.state,
    text: request.task === 'interpret' ? request.text : undefined,
    action: request.task === 'narrate' ? request.action : undefined,
    engineResult: request.task === 'narrate' ? request.engineResult : request.task === 'enemy-action' ? request.engineResult : undefined,
    candidateIds: request.task === 'generate-skill' || request.task === 'generateSkill' ? request.candidateIds : undefined,
    theme: request.task === 'generate-skill' || request.task === 'generateSkill' ? request.theme : undefined,
    logLines: request.task === 'compact-summary' || request.task === 'summarize' ? request.logLines : undefined,
  });
}

function parseJsonOnce(content: string): unknown {
  try { return JSON.parse(content) as unknown; }
  catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('json_parse_failed');
    return JSON.parse(match[0]) as unknown;
  }
}

function estimateTokens(text: string): number { return Math.ceil(text.length / 4); }

export function redactRequest<T extends { settings: LlmSettings }>(request: T): Omit<T, 'settings'> & { settings: Omit<LlmSettings, 'apiKey'> & { apiKey: '[redacted]' } } {
  return { ...request, settings: { ...request.settings, apiKey: '[redacted]' } } as Omit<T, 'settings'> & { settings: Omit<LlmSettings, 'apiKey'> & { apiKey: '[redacted]' } };
}
