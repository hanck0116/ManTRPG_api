import { describe, expect, it } from 'vitest';
import { defend, playerAttack } from '../src/engine/combat.js';
import { decideEnemyAction } from '../src/gm/enemyDecision.js';
import { createSessionState } from '../src/state/sessionState.js';

const attackAction = {
  intent: 'attack' as const,
  target: 'enemy' as const,
  skillId: null,
  magicId: null,
  itemId: null,
  method: 'basic_attack',
  rawText: '낫을 휘두른다',
};

describe('combat', () => {
  it('handles a successful single-enemy player attack', () => {
    const session = createSessionState('combat-test');
    const result = playerAttack(session, attackAction, () => 0.1);
    expect(result.result).toBe('success');
    expect(result.damage).toBe(4);
    expect(result.enemyHp).toBe(16);
    expect(session.enemy?.condition).toBe('normal');
  });

  it('keeps enemy as a single object, not an array', () => {
    const session = createSessionState('single-enemy-test');
    expect(session.enemy).not.toBeNull();
    expect(Array.isArray(session.enemy)).toBe(false);
  });

  it('ends battle when enemy HP reaches 0 and suppresses enemy decisions', () => {
    const session = createSessionState('battle-end-test');
    if (!session.enemy) throw new Error('enemy missing');
    session.enemy.currentHp = 1;
    const result = playerAttack(session, attackAction, () => 0.1);

    expect(result.battleEnded).toBe(true);
    expect(result.enemyHp).toBe(0);
    expect(session.enemy.condition).toBe('defeated');
    expect(decideEnemyAction(session)).toBeNull();
  });

  it('defense action does not create damage', () => {
    const session = createSessionState('defend-test');
    const result = defend(session);
    expect(result.result).toBe('success');
    expect(result.damage).toBe(0);
    expect(result.healing).toBe(0);
    expect(result.tags).toContain('defend');
  });
});
