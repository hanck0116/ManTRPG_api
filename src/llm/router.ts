import { LlmCallResultSchema, NarrationResultSchema, ParsedActionSchema, type LlmCallResult, type LlmProvider } from '../api/schemas.js';
import { narrateTurn } from '../gm/templateNarrator.js';
import type { LlmAdapter, LlmRequest } from './types.js';
import { groqAdapter } from './groqAdapter.js';
import { geminiAdapter } from './geminiAdapter.js';
import { openRouterAdapter } from './openRouterAdapter.js';
import { customOpenAIAdapter } from './customOpenAIAdapter.js';

const adapters: Record<LlmProvider, LlmAdapter> = {
  groq: groqAdapter,
  gemini: geminiAdapter,
  openrouter: openRouterAdapter,
  customOpenAI: customOpenAIAdapter,
};

export function hasApiKey(request: LlmRequest): boolean {
  return request.settings.apiKey.trim().length > 0;
}

export function shouldCallLlm(request: LlmRequest): boolean {
  if (!hasApiKey(request)) return false;
  if (request.task === 'interpret') return request.text.trim().length > 0;
  if (request.task === 'narrate') return request.engineResult.ok && (request.engineResult.battleEnded || request.engineResult.tags.includes('reward') || request.engineResult.tags.includes('scene_transition') || request.engineResult.tags.includes('generated_skill') || request.engineResult.tags.includes('generated_magic'));
  if (request.task === 'summarize') return request.logLines.length >= 8;
  if (request.task === 'generateSkill') return request.candidateIds.length > 0;
  return false;
}

export async function callLlm(request: LlmRequest): Promise<LlmCallResult> {
  if (!shouldCallLlm(request)) return { ok: false, task: request.task, error: 'llm_skipped' };

  try {
    const result = await adapters[request.settings.provider].call(request);
    return LlmCallResultSchema.parse(result);
  } catch (error) {
    return { ok: false, task: request.task, error: error instanceof Error ? error.message : 'llm_failed' };
  }
}

export function validateParsedActionJson(value: unknown) {
  return ParsedActionSchema.parse(value);
}

export function validateNarrationJson(value: unknown) {
  return NarrationResultSchema.parse(value);
}

export function templateNarrationFallback(input: Parameters<typeof narrateTurn>[0]) {
  return narrateTurn(input);
}
