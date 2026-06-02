import type { EngineResult, LlmCallResult, LlmSettings, MinimalApiState, ParsedAction, NarrationResult } from '../api/schemas.js';
import { callLlm } from '../llm/router.js';
import { groqAdapter } from '../llm/groqAdapter.js';
import { geminiAdapter } from '../llm/geminiAdapter.js';
import { openRouterAdapter } from '../llm/openRouterAdapter.js';
import { customOpenAIAdapter } from '../llm/customOpenAIAdapter.js';

export async function interpretWithClientLlm(settings: LlmSettings, text: string, state: MinimalApiState): Promise<LlmCallResult> {
  return callLlm({ task: 'interpret', settings, text, state });
}

export async function narrateWithClientLlm(settings: LlmSettings, state: MinimalApiState, action: ParsedAction, engineResult: EngineResult): Promise<LlmCallResult> {
  return callLlm({ task: 'narrate', settings, state, action, engineResult });
}

export async function testClientApiKey(settings: LlmSettings): Promise<{ ok: boolean; message: string }> {
  const adapters = { groq: groqAdapter, gemini: geminiAdapter, openrouter: openRouterAdapter, customOpenAI: customOpenAIAdapter };
  return adapters[settings.provider as keyof typeof adapters].test(settings);
}

export function pickNarration(llmResult: LlmCallResult | null, fallback: NarrationResult): NarrationResult {
  return llmResult?.ok && llmResult.narration ? llmResult.narration : fallback;
}
