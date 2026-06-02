import { runEnemyDecision, runPlayerAction, type TurnResult } from '../api/routes.js';
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
  const llmSettings = await resolveClientLlmSettings(input.apiSettings ?? { mobileFirst: true, preferredViewportWidth: 390, apiEnabled: false, provider: 'groq', apiKeyPersistence: 'sessionOnly', estimateUsage: true });
  const interpretResult = localAction.intent === 'unknown' && llmSettings ? await callLlm({ task: 'interpret', settings: llmSettings, text: input.text, state: beforeState }) : null;
  const action = interpretResult?.ok && interpretResult.parsedAction ? interpretResult.parsedAction : localAction;
  const playerResult = runPlayerAction(session, action);
  const enemyDecision = !playerResult.battleEnded && session.scene === 'combat' ? decideEnemyAction(session) : null;
  const enemyResult = enemyDecision ? runEnemyDecision(session, enemyDecision) : null;
  session.turn += 1;
  const state = summarizeSession(session);
  const fallbackNarration = narrateTurn({ action, playerResult, enemyDecision, enemyResult, state });
  const narrateResult = llmSettings ? await callLlm({ task: 'narrate', settings: llmSettings, state, action, engineResult: playerResult }) : null;
  const narration = narrateResult?.ok && narrateResult.narration ? narrateResult.narration : fallbackNarration;
  await saveClientSession(session);
  const llmResults = [interpretResult, narrateResult].filter(Boolean);
  return { action, playerResult, enemyDecision, enemyResult, narration, state, llm: { used: llmResults.some((r) => r.ok), tasks: llmResults.map((r) => r.task), fallback: llmResults.some((r) => !r.ok), usageEstimate: llmResults.find((r) => r.usage)?.usage ?? null } };
}
