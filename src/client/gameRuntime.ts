import { runEnemyDecision, runPlayerAction, type TurnResult } from '../api/routes.js';
import type { EngineResult, LlmCallResult, LlmSettings, ParsedAction } from '../api/schemas.js';
import { decideEnemyAction } from '../engine/enemyAI.js';
import { parseActionLocally } from '../gm/actionParser.js';
import { narrateTurn } from '../gm/templateNarrator.js';
import { callLlm } from '../llm/router.js';
import { IndexedDbSessionStorageAdapter } from '../pwa/indexedDbStore.js';
import { createStoredSessionRecord } from '../state/storageAdapter.js';
import { createSessionState, summarizeSession, type SessionState } from '../state/sessionState.js';
import { resolveClientLlmSettings, type RuntimeApiSettings } from './apiKeySettings.js';

export interface ClientTurnInput { sessionId: string; text: string; apiSettings?: RuntimeApiSettings; choiceText?: string; }

const storage = new IndexedDbSessionStorageAdapter();
const defaultDisabledApiSettings: RuntimeApiSettings = { mobileFirst: true, preferredViewportWidth: 390, apiEnabled: false, provider: 'groq', apiKeyPersistence: 'sessionOnly', estimateUsage: true };

export function shouldInterpretWithClientLlm(action: ParsedAction, llmSettings: LlmSettings | null): boolean {
  return Boolean(llmSettings) && action.intent === 'unknown';
}

export function shouldNarrateWithClientLlm(result: EngineResult, llmSettings: LlmSettings | null): boolean {
  if (!llmSettings) return false;
  return result.battleEnded
    || result.tags.includes('reward')
    || result.tags.includes('scene_transition')
    || result.tags.includes('generated_skill')
    || result.tags.includes('generated_magic');
}

function llmSkippedReason(llmSettings: LlmSettings | null, interpretAllowed: boolean, narrateAllowed: boolean): string {
  if (!llmSettings) return 'api_disabled_or_missing_key';
  if (!interpretAllowed && !narrateAllowed) return 'local_template_combat';
  return 'not_skipped';
}

export async function loadOrCreateSession(sessionId: string): Promise<SessionState> {
  try { return (await storage.loadSession(sessionId))?.session ?? createSessionState(sessionId); }
  catch { return createSessionState(sessionId); }
}

export async function deleteClientSession(sessionId: string): Promise<void> { await storage.deleteSession(sessionId); }
export async function saveClientSession(session: SessionState): Promise<void> { await storage.saveSession(createStoredSessionRecord(session)); }

export async function runClientTurn(input: ClientTurnInput): Promise<TurnResult> {
  const session = await loadOrCreateSession(input.sessionId);
  const beforeState = summarizeSession(session);
  const localAction = parseActionLocally({ sessionId: input.sessionId, text: input.choiceText ?? input.text }, beforeState);
  const llmSettings = await resolveClientLlmSettings(input.apiSettings ?? defaultDisabledApiSettings);
  const interpretAllowed = shouldInterpretWithClientLlm(localAction, llmSettings);
  const interpretResult = interpretAllowed && llmSettings ? await callLlm({ task: 'interpret', settings: llmSettings, text: input.text, state: beforeState }) : null;
  const action = interpretResult?.ok && interpretResult.parsedAction ? interpretResult.parsedAction : localAction;
  const playerResult = runPlayerAction(session, action);
  const enemyDecision = !playerResult.battleEnded && session.scene === 'combat' ? decideEnemyAction(session) : null;
  const enemyResult = enemyDecision ? runEnemyDecision(session, enemyDecision) : null;
  session.turn += 1;
  const state = summarizeSession(session);
  const fallbackNarration = narrateTurn({ action, playerResult, enemyDecision, enemyResult, state });
  const narrateAllowed = shouldNarrateWithClientLlm(playerResult, llmSettings);
  const narrateResult = narrateAllowed && llmSettings ? await callLlm({ task: 'narrate', settings: llmSettings, state, action, engineResult: playerResult }) : null;
  const narration = narrateResult?.ok && narrateResult.narration ? narrateResult.narration : fallbackNarration;
  await saveClientSession(session);
  const attemptedLlmResults = [interpretResult, narrateResult].filter((result): result is LlmCallResult => result !== null);
  return {
    action,
    playerResult,
    enemyDecision,
    enemyResult,
    narration,
    state,
    llm: {
      used: attemptedLlmResults.some((result) => result.ok),
      tasks: attemptedLlmResults.map((result) => result.task),
      fallback: attemptedLlmResults.some((result) => !result.ok),
      skippedReason: attemptedLlmResults.length === 0 ? llmSkippedReason(llmSettings, interpretAllowed, narrateAllowed) : undefined,
      usageEstimate: attemptedLlmResults.find((result) => result.usage)?.usage ?? null,
    },
  };
}
