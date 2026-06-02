import { describe, expect, it } from 'vitest';
import { decideLlmCall, shouldNarrateWithApi } from '../src/ai/callPolicy.js';
import { createSessionState, summarizeSession } from '../src/state/sessionState.js';

const state = summarizeSession(createSessionState('policy'));
const settings = { provider: 'groq', apiKey: 'sk-test' } as const;

describe('llm-policy', () => {
  it('blocks calls without API key and clear /attack interpret', () => {
    expect(decideLlmCall({ task: 'interpret', settings: { provider: 'groq', apiKey: '' }, text: 'hello', state }, { apiEnabled: true }).allowed).toBe(false);
    expect(decideLlmCall({ task: 'interpret', settings, text: '/attack', state }, { apiEnabled: true }).reason).toBe('clear_action_local_only');
  });

  it('uses template narration for normal combat and allows critical/end scenes', () => {
    const base = { ok: true, scene: 'combat', result: 'success', check: null, roll: null, baseTarget: null, effectiveTarget: null, success: true, damage: 1, healing: 0, playerHp: 40, playerMp: 20, enemyHp: 10, tags: ['physical'], messageHint: 'hit' } as const;
    expect(shouldNarrateWithApi({ ...base, grade: null, battleEnded: false })).toBe(false);
    expect(shouldNarrateWithApi({ ...base, grade: 'criticalSuccess', battleEnded: false })).toBe(true);
    expect(shouldNarrateWithApi({ ...base, grade: null, battleEnded: true })).toBe(true);
  });

  it('blocks when token budget is exceeded', () => {
    const decision = decideLlmCall({ task: 'narrate', settings, state, action: { intent: 'attack', target: 'enemy', skillId: null, magicId: null, itemId: null, method: null, rawText: '/attack' }, engineResult: { ok: true, scene: 'combat', result: 'success', check: null, roll: null, baseTarget: null, effectiveTarget: null, grade: 'criticalSuccess', success: true, damage: 1, healing: 0, playerHp: 40, playerMp: 20, enemyHp: 10, battleEnded: false, tags: [], messageHint: 'hit' } }, { apiEnabled: true, sessionTokenBudget: 1 }, '{}');
    expect(decision.allowed).toBe(false);
  });
});
