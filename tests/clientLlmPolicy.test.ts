import { describe, expect, it } from 'vitest';
import type { EngineResult, LlmSettings, ParsedAction } from '../src/api/schemas.js';
import { shouldInterpretWithClientLlm, shouldNarrateWithClientLlm } from '../src/client/gameRuntime.js';

const settings: LlmSettings = { provider: 'groq', apiKey: 'sk-test' };
const attackAction: ParsedAction = { intent: 'attack', target: 'enemy', skillId: null, magicId: null, itemId: null, method: 'slash', rawText: '/attack' };
const unknownAction: ParsedAction = { ...attackAction, intent: 'unknown', method: null, rawText: '무언가 이상한 행동' };
const result: EngineResult = { ok: true, scene: 'combat', result: 'success', check: null, roll: null, baseTarget: null, effectiveTarget: null, grade: null, success: true, damage: 1, healing: 0, playerHp: 40, playerMp: 25, enemyHp: 19, battleEnded: false, tags: ['success', 'hit', 'physical'], messageHint: 'player_hit_enemy' };

describe('client LLM policy', () => {
  it('does not narrate normal attacks through the API', () => {
    expect(shouldNarrateWithClientLlm(result, settings)).toBe(false);
  });

  it('interprets only unknown actions when API is enabled', () => {
    expect(shouldInterpretWithClientLlm(unknownAction, settings)).toBe(true);
    expect(shouldInterpretWithClientLlm(attackAction, settings)).toBe(false);
  });

  it('does not call any LLM policy when API is disabled', () => {
    expect(shouldInterpretWithClientLlm(unknownAction, null)).toBe(false);
    expect(shouldNarrateWithClientLlm({ ...result, battleEnded: true }, null)).toBe(false);
  });
});
