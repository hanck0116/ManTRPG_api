import { describe, expect, it } from 'vitest';
import { balanceGeneratedSkill, sanitizeGeneratedSkillDraft } from '../src/engine/generatedSkill.js';
import { runEnemyDecision, runPlayerAction } from '../src/api/routes.js';
import { createSessionState } from '../src/state/sessionState.js';

describe('engine-authority', () => {
  it('ignores LLM-like state changes; code computes damage and keeps one hidden enemy', () => {
    const session = createSessionState('engine-authority');
    const beforeHp = session.player.hp;
    const result = runPlayerAction(session, { intent: 'defend', target: 'self', skillId: null, magicId: null, itemId: null, method: null, rawText: '/defend' });
    expect(result.playerHp).toBe(beforeHp);
    expect(session.enemy).not.toBeNull();
    expect(Array.isArray(session.enemy)).toBe(false);
  });

  it('does not allow boss creation and computes enemy intent result in code', () => {
    const session = createSessionState('enemy-code');
    const result = runEnemyDecision(session, { intent: 'guard', target: 'player', method: 'enemy_guards', reasonTag: 'test' });
    expect(result.result).toBe('blocked');
    expect(session.enemy?.tags).not.toContain('boss');
  });

  it('rejects generated skill numeric effects and code assigns final balance', () => {
    expect(() => sanitizeGeneratedSkillDraft({ name: '강타', summary: 'x', flavor: 'x', tags: [], damage: 999 })).toThrow();
    const balanced = balanceGeneratedSkill(sanitizeGeneratedSkillDraft({ name: '강타', summary: 'x', flavor: 'x', tags: ['slash'] }), 1);
    expect(balanced.costMp).toBe(3);
    expect(balanced.damageMultiplier).toBe(1.2);
  });
});
