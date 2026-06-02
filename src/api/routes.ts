import { blockedAction, defend, enemyAttack, playerAttack, playerItem, playerMagic, playerSkill } from '../engine/combat.js';
import type { ParsedAction } from '../engine/judgment.js';
import { decideEnemyAction } from '../engine/enemyAI.js';
import { parseActionLocally } from '../gm/actionParser.js';
import { narrateTurn } from '../gm/templateNarrator.js';
import { callLlm } from '../llm/router.js';
import { createSessionState, summarizeSession, type MinimalApiState, type SessionState } from '../state/sessionState.js';
import type { EnemyDecision, EngineResult, LlmCallResult, NarrationResult, PlayerInput } from './schemas.js';
import { PlayerInputSchema } from './schemas.js';

const sessions = new Map<string, SessionState>();

export interface TurnResult {
  action: ParsedAction;
  playerResult: EngineResult;
  enemyDecision: EnemyDecision | null;
  enemyResult: EngineResult | null;
  narration: NarrationResult;
  state: MinimalApiState;
  llm: {
    used: boolean;
    tasks: LlmCallResult['task'][];
    fallback: boolean;
    usageEstimate: LlmCallResult['usage'] | null;
  };
}

export function getSession(sessionId: string): SessionState {
  const existing = sessions.get(sessionId);
  if (existing) return existing;
  const created = createSessionState(sessionId);
  sessions.set(sessionId, created);
  return created;
}

function runPlayerAction(session: SessionState, action: ParsedAction): EngineResult {
  if (action.intent === 'attack') return playerAttack(session, action);
  if (action.intent === 'skill') return playerSkill(session, action);
  if (action.intent === 'magic') return playerMagic(session, action);
  if (action.intent === 'defend') return defend(session);
  if (action.intent === 'item') return playerItem(session, action);
  if (action.intent === 'unknown') return blockedAction(session, 'unknown_action');
  return blockedAction(session, `${action.intent}_not_implemented`);
}

function runEnemyDecision(session: SessionState, decision: EnemyDecision): EngineResult {
  if (decision.intent === 'attack') return enemyAttack(session);
  return blockedAction(session, 'enemy_decision_not_supported');
}

async function resolveAction(input: PlayerInput, state: MinimalApiState): Promise<{ action: ParsedAction; llmResult: LlmCallResult | null }> {
  const localAction = parseActionLocally(input);
  if (localAction.intent !== 'unknown' || !input.llm?.apiKey) return { action: localAction, llmResult: null };

  const llmResult = await callLlm({ task: 'interpret', settings: input.llm, text: input.text, state });
  if (llmResult.ok && llmResult.parsedAction) return { action: llmResult.parsedAction, llmResult };
  return { action: localAction, llmResult };
}

export async function handleTurn(inputBody: PlayerInput): Promise<TurnResult> {
  const input = PlayerInputSchema.parse(inputBody);
  const session = getSession(input.sessionId);
  const beforeState = summarizeSession(session);
  const { action, llmResult: interpretResult } = await resolveAction(input, beforeState);
  const playerResult = runPlayerAction(session, action);

  const enemyDecision = !playerResult.battleEnded && session.scene === 'combat' ? decideEnemyAction(session) : null;
  const enemyResult = enemyDecision ? runEnemyDecision(session, enemyDecision) : null;

  session.turn += 1;
  const state = summarizeSession(session);
  const templateNarration = narrateTurn({ action, playerResult, enemyDecision, enemyResult, state });
  const narrateResult = input.llm?.apiKey
    ? await callLlm({ task: 'narrate', settings: input.llm, state, action, engineResult: playerResult })
    : null;
  const narration = narrateResult?.ok && narrateResult.narration ? narrateResult.narration : templateNarration;
  const llmResults = [interpretResult, narrateResult].filter((result): result is LlmCallResult => Boolean(result));

  return {
    action,
    playerResult,
    enemyDecision,
    enemyResult,
    narration,
    state,
    llm: {
      used: llmResults.some((result) => result.ok),
      tasks: llmResults.map((result) => result.task),
      fallback: llmResults.some((result) => !result.ok),
      usageEstimate: llmResults.find((result) => result.usage)?.usage ?? null,
    },
  };
}
