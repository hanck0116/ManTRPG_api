import { blockedAction, defend, enemyAttack, playerAttack, playerItem, playerMagic, playerSkill } from '../engine/combat.js';
import type { ParsedAction } from '../engine/judgment.js';
import { decideEnemyAction } from '../engine/enemyAI.js';
import { parseActionLocally } from '../gm/actionParser.js';
import { narrateTurn } from '../gm/templateNarrator.js';
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
    skippedReason?: string;
  };
}

export function getSession(sessionId: string): SessionState {
  const existing = sessions.get(sessionId);
  if (existing) return existing;
  const created = createSessionState(sessionId);
  sessions.set(sessionId, created);
  return created;
}

export function runPlayerAction(session: SessionState, action: ParsedAction): EngineResult {
  if (action.intent === 'attack') return playerAttack(session, action);
  if (action.intent === 'skill') return playerSkill(session, action);
  if (action.intent === 'magic') return playerMagic(session, action);
  if (action.intent === 'defend') return defend(session);
  if (action.intent === 'item') return playerItem(session, action);
  if (action.intent === 'unknown') return blockedAction(session, 'unknown_action');
  return blockedAction(session, `${action.intent}_not_implemented`);
}

export function runEnemyDecision(session: SessionState, decision: EnemyDecision): EngineResult {
  if (decision.intent === 'attack') return enemyAttack(session);
  return blockedAction(session, 'enemy_decision_not_supported');
}

export async function handleTurn(inputBody: PlayerInput): Promise<TurnResult> {
  const input = PlayerInputSchema.parse(inputBody);
  const session = getSession(input.sessionId);
  const action = parseActionLocally(input);
  const playerResult = runPlayerAction(session, action);

  const enemyDecision = !playerResult.battleEnded && session.scene === 'combat' ? decideEnemyAction(session) : null;
  const enemyResult = enemyDecision ? runEnemyDecision(session, enemyDecision) : null;

  session.turn += 1;
  const state = summarizeSession(session);
  const templateNarration = narrateTurn({ action, playerResult, enemyDecision, enemyResult, state });
  const narration = templateNarration;
  const llmResults: LlmCallResult[] = [];

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
