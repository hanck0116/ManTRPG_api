import type { EngineResult, LlmSettings, LlmTask, ParsedAction } from '../api/schemas.js';
import type { LlmRequest } from '../llm/types.js';

export interface LlmPolicyOptions {
  apiEnabled: boolean;
  confirmBeforeCall?: boolean;
  userConfirmed?: boolean;
  sessionTokenBudget?: number;
  usedSessionTokens?: number;
  dailyTokenBudget?: number;
  usedDailyTokens?: number;
  enemyActionApiEnabled?: boolean;
}

export interface LlmPolicyDecision {
  allowed: boolean;
  reason: string;
  estimatedTokens: number;
  estimatedCostText: string;
}

const maxCompletionTokensByTask: Record<string, number> = {
  interpret: 80,
  'enemy-action': 80,
  narrate: 180,
  'compact-summary': 160,
  'generate-skill': 220,
  summarize: 160,
  generateSkill: 220,
};

export function maxTokensForTask(task: LlmTask): number {
  return maxCompletionTokensByTask[task] ?? 160;
}

export function estimateTokensForPayload(payload: string, task: LlmTask): number {
  return Math.ceil(payload.length / 4) + maxTokensForTask(task);
}

export function decideLlmCall(request: LlmRequest, options: LlmPolicyOptions, compactPayload = ''): LlmPolicyDecision {
  const estimatedTokens = estimateTokensForPayload(compactPayload || JSON.stringify(request), request.task);
  if (!options.apiEnabled) return deny('api_disabled', estimatedTokens);
  if (!request.settings.apiKey.trim()) return deny('api_key_missing', estimatedTokens);
  if (options.confirmBeforeCall && !options.userConfirmed) return deny('confirmation_required', estimatedTokens);
  if ((options.usedSessionTokens ?? 0) + estimatedTokens > (options.sessionTokenBudget ?? Number.POSITIVE_INFINITY)) return deny('session_token_budget_exceeded', estimatedTokens);
  if ((options.usedDailyTokens ?? 0) + estimatedTokens > (options.dailyTokenBudget ?? Number.POSITIVE_INFINITY)) return deny('daily_token_budget_exceeded', estimatedTokens);
  if (request.task === 'interpret' && isClearLocalAction(request.text)) return deny('clear_action_local_only', estimatedTokens);
  if (request.task === 'narrate' && !shouldNarrateWithApi(request.engineResult)) return deny('template_narration_preferred', estimatedTokens);
  if (request.task === 'enemy-action' && !options.enemyActionApiEnabled) return deny('enemy_action_api_disabled', estimatedTokens);
  return { allowed: true, reason: 'allowed', estimatedTokens, estimatedCostText: costText(estimatedTokens, request.settings) };
}

export function isClearLocalAction(text: string): boolean {
  return /^\s*\/(attack|skill|magic|item|defend|inspect|rest)\b/i.test(text) || /^(공격|방어|스킬|마법|아이템)\b/.test(text.trim());
}

export function shouldInterpretAction(action: ParsedAction, settings: LlmSettings | null): boolean {
  return Boolean(settings?.apiKey.trim()) && action.intent === 'unknown' && !isClearLocalAction(action.rawText);
}

export function shouldNarrateWithApi(result: EngineResult): boolean {
  return result.battleEnded || result.grade === 'criticalSuccess' || result.grade === 'criticalFail' || result.tags.some((tag) => ['reward', 'scene_transition', 'generated_skill', 'generated_magic', 'battle_start', 'battle_end'].includes(tag));
}

function deny(reason: string, estimatedTokens: number): LlmPolicyDecision {
  return { allowed: false, reason, estimatedTokens, estimatedCostText: 'API 호출 없음: 기본 비용 0원' };
}

function costText(tokens: number, settings: LlmSettings): string {
  return `예상 ${tokens} tokens · 비용은 ${settings.provider}에 입력한 플레이어 API Key 계정 정책을 따릅니다.`;
}
