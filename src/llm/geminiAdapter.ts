import type { LlmCallResult, LlmSettings } from '../api/schemas.js';
import { LlmCallResultSchema } from '../api/schemas.js';
import { buildPrompt } from '../gm/prompt.js';
import type { LlmAdapter, LlmRequest } from './types.js';

const defaultModel = 'gemini-1.5-flash';
const endpointFor = (model: string, apiKey: string): string => `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

export const geminiAdapter: LlmAdapter = {
  provider: 'gemini',
  async call(request: LlmRequest): Promise<LlmCallResult> {
    const model = request.settings.model ?? defaultModel;
    const response = await fetch(request.settings.endpoint ?? endpointFor(model, request.settings.apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generationConfig: { responseMimeType: 'application/json' },
        systemInstruction: { parts: [{ text: buildPrompt(request.task) }] },
        contents: [{ role: 'user', parts: [{ text: JSON.stringify(redactRequest(request)) }] }],
      }),
    });
    if (!response.ok) throw new Error(`gemini_http_${response.status}`);
    const body = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number } };
    const content = body.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    const parsed = JSON.parse(content) as unknown;
    return LlmCallResultSchema.parse({
      ok: true,
      task: request.task,
      ...(typeof parsed === 'object' && parsed !== null ? parsed : {}),
      usage: {
        promptTokens: body.usageMetadata?.promptTokenCount ?? Math.ceil(JSON.stringify(request).length / 4),
        completionTokens: body.usageMetadata?.candidatesTokenCount ?? Math.ceil(content.length / 4),
        provider: 'gemini',
        model,
      },
    });
  },
  async test(settings: LlmSettings) {
    const model = settings.model ?? defaultModel;
    const response = await fetch(settings.endpoint ?? endpointFor(model, settings.apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Return JSON {"ok":true}.' }] }], generationConfig: { responseMimeType: 'application/json' } }),
    });
    return { ok: response.ok, message: response.ok ? 'provider reachable' : `gemini_http_${response.status}` };
  },
};

function redactRequest(request: LlmRequest): Omit<LlmRequest, 'settings'> & { settings: Omit<LlmSettings, 'apiKey'> & { apiKey: '[redacted]' } } {
  return {
    ...request,
    settings: { ...request.settings, apiKey: '[redacted]' },
  } as Omit<LlmRequest, 'settings'> & { settings: Omit<LlmSettings, 'apiKey'> & { apiKey: '[redacted]' } };
}
