import { defend, playerAttack, playerMagic, playerSkill } from '../engine/combat.js';
import type { ParsedAction } from '../engine/judgment.js';
import { narrateEngineResult } from '../gm/narrator.js';
import { createSessionState, summarizeSession, type SessionState } from '../state/sessionState.js';
import type { PlayerInput } from './schemas.js';

const sessions = new Map<string, SessionState>();

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
  if (text.includes('수확') || text.includes('기술')) return { intent: 'skill', target: 'enemy', skillId: 'reaping_arc', magicId: null, itemId: null, method: 'skill', rawText: input.text };
  if (text.includes('불') || text.includes('마법')) return { intent: 'magic', target: 'enemy', skillId: null, magicId: 'ember', itemId: null, method: 'spell', rawText: input.text };
  if (text.includes('공격') || text.includes('베') || text.includes('휘둘')) return { intent: 'attack', target: 'enemy', skillId: null, magicId: null, itemId: null, method: 'basic_attack', rawText: input.text };
  return { intent: 'unknown', target: 'none', skillId: null, magicId: null, itemId: null, method: null, rawText: input.text };
}

export function handleTurn(input: PlayerInput) {
  const session = getSession(input.sessionId);
  const action = parseActionLocally(input);
  const engineResult = action.intent === 'attack'
    ? playerAttack(session, action)
    : action.intent === 'skill'
      ? playerSkill(session, action)
      : action.intent === 'magic'
        ? playerMagic(session, action)
        : action.intent === 'defend'
          ? defend(session)
          : defend(session);

  session.turn += 1;

  return {
    action,
    engineResult,
    narration: narrateEngineResult(engineResult),
    state: summarizeSession(session),
  };
}
