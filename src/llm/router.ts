import { LlmCallResultSchema, NarrationResultSchema, ParsedActionSchema, type LlmCallResult, type LlmProvider } from '../api/schemas.js';
import { decideLlmCall } from '../ai/callPolicy.js';
import { serializeCompactPayload } from '../ai/compactPayload.js';
import { narrateTurn } from '../gm/templateNarrator.js';
import type { LlmAdapter, LlmRequest } from './types.js';
import { groqAdapter } from './groqAdapter.js';
import { geminiAdapter } from './geminiAdapter.js';
import { openRouterAdapter } from './openRouterAdapter.js';
import { customOpenAIAdapter } from './customOpenAIAdapter.js';

const adapters: Record<LlmProvider, LlmAdapter> = { groq: groqAdapter, gemini: geminiAdapter, openrouter: openRouterAdapter, customOpenAI: customOpenAIAdapter };

export function hasApiKey(request: LlmRequest): boolean { return request.settings.apiKey.trim().length > 0; }

export function shouldCallLlm(request: LlmRequest): boolean {
  const compactPayload = compactPayloadForRequest(request);
  return decideLlmCall(request, { apiEnabled: true, enemyActionApiEnabled: false }, compactPayload).allowed;
}

export async function callLlm(request: LlmRequest): Promise<LlmCallResult> {
  const compactPayload = compactPayloadForRequest(request);
  const decision = decideLlmCall(request, { apiEnabled: true, enemyActionApiEnabled: false }, compactPayload);
  if (!decision.allowed) return { ok: false, task: request.task, error: decision.reason, usage: { promptTokens: Math.ceil(compactPayload.length / 4), completionTokens: 0, provider: request.settings.provider, model: request.settings.model ?? 'default' } };

  try { return LlmCallResultSchema.parse(await adapters[request.settings.provider].call(request)); }
  catch (error) { return { ok: false, task: request.task, error: error instanceof Error ? error.message : 'llm_failed' }; }
}

export function compactPayloadForRequest(request: LlmRequest): string {
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

export function validateParsedActionJson(value: unknown) { return ParsedActionSchema.parse(value); }
export function validateNarrationJson(value: unknown) { return NarrationResultSchema.parse(value); }
export function templateNarrationFallback(input: Parameters<typeof narrateTurn>[0]) { return narrateTurn(input); }
