import { describe, expect, it } from 'vitest';
import { playerMagic } from '../src/engine/combat.js';
import { createSessionState } from '../src/state/sessionState.js';

const magicAction = {
  intent: 'magic' as const,
  target: 'enemy' as const,
  skillId: null,
  magicId: 'MG_EMBER_01',
  itemId: null,
  method: 'spell',
  rawText: '작은 불씨를 던진다',
};

describe('magic', () => {
  it('spends mana and applies engine-calculated magic damage', () => {
    const session = createSessionState('magic-test');
    const result = playerMagic(session, magicAction, () => 0.95);
    expect(result.result).toBe('success');
    expect(result.damage).toBe(7);
    expect(result.playerMp).toBe(21);
    expect(result.tags.includes('magic')).toBe(true);
  });

  it('blocks magic when MP is not enough without changing MP or enemy HP', () => {
    const session = createSessionState('magic-mp-test');
    session.player.mp = 3;
    const enemyHpBefore = session.enemy?.currentHp;

    const result = playerMagic(session, magicAction, () => 0.95);

    expect(result.result).toBe('blocked');
    expect(result.playerMp).toBe(3);
    expect(session.player.mp).toBe(3);
    expect(result.enemyHp).toBe(enemyHpBefore);
    expect(session.enemy?.currentHp).toBe(enemyHpBefore);
    expect(result.tags).toContain('blocked');
    expect(result.tags).toContain('not_enough_mp');
  });
});
