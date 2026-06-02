import { blockedAction, defend, enemyAttack, playerAttack, playerMagic, playerSkill } from '../engine/combat.js';
import type { ParsedAction } from '../engine/judgment.js';
import { decideEnemyAction } from '../gm/enemyDecision.js';
import { narrateTurn } from '../gm/narrator.js';
import { createSessionState, summarizeSession, type MinimalApiState, type SessionState } from '../state/sessionState.js';
import type { EnemyDecision, EngineResult, NarrationResult, PlayerInput } from './schemas.js';
import { PlayerInputSchema } from './schemas.js';

const sessions = new Map<string, SessionState>();

export interface TurnResult {
  action: ParsedAction;
  playerResult: EngineResult;
  enemyDecision: EnemyDecision | null;
  enemyResult: EngineResult | null;
  narration: NarrationResult;
  state: MinimalApiState;
}

export function getSession(sessionId: string): SessionState {
  const existing = sessions.get(sessionId);
  if (existing) return existing;
  const created = createSessionState(sessionId);
  sessions.set(sessionId, created);
  return created;
}

export function parseActionLocally(input: PlayerInput): ParsedAction {
  const text = input.text.toLowerCase();
  if (text.includes('방어') || text.includes('막')) return { intent: 'defend', target: 'self', skillId: null, magicId: null, itemId: null, method: 'guard', rawText: input.text };
  if (text.includes('수확') || text.includes('기술')) return { intent: 'skill', target: 'enemy', skillId: 'SK_REAPING_ARC', magicId: null, itemId: null, method: 'skill', rawText: input.text };
  if (text.includes('불') || text.includes('마법')) return { intent: 'magic', target: 'enemy', skillId: null, magicId: 'MG_EMBER_01', itemId: null, method: 'spell', rawText: input.text };
  if (text.includes('약초') || text.includes('회복')) return { intent: 'item', target: 'self', skillId: null, magicId: null, itemId: 'IT_HERB_SMALL', method: 'use_item', rawText: input.text };
  if (text.includes('공격') || text.includes('베') || text.includes('휘둘')) return { intent: 'attack', target: 'enemy', skillId: null, magicId: null, itemId: null, method: 'basic_attack', rawText: input.text };
  if (text.includes('대화')) return { intent: 'talk', target: 'none', skillId: null, magicId: null, itemId: null, method: 'talk', rawText: input.text };
  if (text.includes('살피') || text.includes('조사')) return { intent: 'inspect', target: 'none', skillId: null, magicId: null, itemId: null, method: 'inspect', rawText: input.text };
  if (text.includes('휴식')) return { intent: 'rest', target: 'self', skillId: null, magicId: null, itemId: null, method: 'rest', rawText: input.text };
  return { intent: 'unknown', target: 'none', skillId: null, magicId: null, itemId: null, method: null, rawText: input.text };
}

function runPlayerAction(session: SessionState, action: ParsedAction): EngineResult {
  if (action.intent === 'attack') return playerAttack(session, action);
  if (action.intent === 'skill') return playerSkill(session, action);
  if (action.intent === 'magic') return playerMagic(session, action);
  if (action.intent === 'defend') return defend(session);
  if (action.intent === 'item') return blockedAction(session, 'item_not_implemented');
  if (action.intent === 'unknown') return blockedAction(session, 'unknown_action');
  return blockedAction(session, `${action.intent}_not_implemented`);
}

function runEnemyDecision(session: SessionState, decision: EnemyDecision): EngineResult {
  if (decision.intent === 'attack') return enemyAttack(session);
  return blockedAction(session, 'enemy_decision_not_supported');
}

export function handleTurn(inputBody: PlayerInput): TurnResult {
  const input = PlayerInputSchema.parse(inputBody);
  const session = getSession(input.sessionId);
  const action = parseActionLocally(input);
  const playerResult = runPlayerAction(session, action);

  const enemyDecision = !playerResult.battleEnded && session.scene === 'combat' ? decideEnemyAction(session) : null;
  const enemyResult = enemyDecision ? runEnemyDecision(session, enemyDecision) : null;

  session.turn += 1;
  const state = summarizeSession(session);
  const narration = narrateTurn({ action, playerResult, enemyDecision, enemyResult, state });

  return {
    action,
    playerResult,
    enemyDecision,
    enemyResult,
    narration,
    state,
  };
}
