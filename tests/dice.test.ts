import { describe, expect, it } from 'vitest';
import { rollCheck, rollD100, rollD20, rollDie } from '../src/engine/dice.js';

describe('dice', () => {
  it('returns JSON-friendly d100 roll results', () => {
    const result = rollD100({ rng: () => 0.16 });
    expect({ die: result.die, rolls: result.rolls, kept: result.kept, total: result.total, mode: result.mode }).toEqual({
      die: 'd100',
      rolls: [17],
      kept: 17,
      total: 17,
      mode: 'normal',
    });
  });

  it('supports d20 advantage', () => {
    const rolls = [0.2, 0.9];
    const result = rollD20({ mode: 'advantage', rng: () => rolls.shift() ?? 0 });
    expect(result.rolls).toEqual([5, 19]);
    expect(result.kept).toBe(19);
  });

  it('rolls single dice and d100 checks with grades', () => {
    expect(rollDie(100, () => 0.99)).toBe(100);
    expect(rollCheck({ target: 60, modifier: 5, rng: () => 0.71 })).toEqual({
      roll: 72,
      modifier: 5,
      total: 77,
      target: 60,
      success: true,
      grade: 'success',
    });
    expect(rollCheck({ target: 60, rng: () => 0 })).toMatchObject({ roll: 1, success: false, grade: 'criticalFail' });
    expect(rollCheck({ target: 60, rng: () => 0.99 })).toMatchObject({ roll: 100, success: true, grade: 'criticalSuccess' });
  });
});
