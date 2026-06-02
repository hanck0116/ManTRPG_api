import type { LlmCallResult, LlmSettings } from '../api/schemas.js';
import { LlmCallResultSchema } from '../api/schemas.js';
import { assertCompactPayloadSafe, serializeCompactPayload } from '../ai/compactPayload.js';
import { maxTokensForTask } from '../ai/callPolicy.js';
import { sanitizeResponse } from '../ai/types.js';
import { buildPrompt } from '../gm/prompt.js';
import type { LlmAdapter, LlmRequest } from './types.js';

const defaultModel = 'gemini-1.5-flash';
const endpointFor = (model: string, apiKey: string): string => `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

export const geminiAdapter: LlmAdapter = {
  provider: 'gemini',
  async call(request: LlmRequest): Promise<LlmCallResult> {
    const model = request.settings.model ?? defaultModel;
    const payload = serializeRequestPayload(request);
    assertCompactPayloadSafe(payload);
    const response = await fetch(request.settings.endpoint ?? endpointFor(model, request.settings.apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: maxTokensForTask(request.task) },
        systemInstruction: { parts: [{ text: buildPrompt(request.task) }] },
        contents: [{ role: 'user', parts: [{ text: payload }] }],
      }),
    });
    if (!response.ok) throw new Error(`gemini_http_${response.status}`);
    const body = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number } };
    const content = body.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    const parsed = parseJsonOnce(content);
    return LlmCallResultSchema.parse({
      ...sanitizeResponse(request.task, parsed, request.task === 'interpret' ? request.text : ''),
      usage: {
        promptTokens: body.usageMetadata?.promptTokenCount ?? Math.ceil(payload.length / 4),
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
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Return JSON {"ok":true}.' }] }], generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 20 } }),
    });
    return { ok: response.ok, message: response.ok ? 'provider reachable' : `gemini_http_${response.status}` };
  },
};

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
