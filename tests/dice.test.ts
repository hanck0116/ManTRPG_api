import { describe, expect, it } from 'vitest';
import { rollAbsoluteCheck, rollCheck, rollD100, rollD20, rollDie, rollStatDie } from '../src/engine/dice.js';

describe('dice', () => {
  it('returns JSON-friendly d100 roll results', () => {
    const result = rollD100({ rng: () => 0.16 });
    expect({ die: result.die, rolls: result.rolls, kept: result.kept, total: result.total, mode: result.mode }).toEqual({ die: 'd100', rolls: [17], kept: 17, total: 17, mode: 'normal' });
  });

  it('supports d20 advantage as a non-V18 helper roll', () => {
    const rolls = [0.2, 0.9];
    const result = rollD20({ mode: 'advantage', rng: () => rolls.shift() ?? 0 });
    expect(result.rolls).toEqual([5, 19]);
    expect(result.kept).toBe(19);
  });

  it('uses V18 absolute d100 grades', () => {
    expect(rollDie(100, () => 0.99)).toBe(100);
    expect(rollAbsoluteCheck({ baseTarget: 60, modifier: 5, rng: () => 0 })).toMatchObject({ roll: 1, success: true, grade: 'criticalSuccess', effectiveTarget: 65, formula: '1d100 <= effectiveTarget' });
    expect(rollCheck({ baseTarget: 60, rng: () => 0.99 })).toMatchObject({ roll: 100, success: false, grade: 'criticalFail' });
  });

  it('succeeds when roll <= effectiveTarget and fails above it', () => {
    expect(rollAbsoluteCheck({ baseTarget: 60, modifier: 5, rng: () => 0.64 })).toMatchObject({ roll: 65, baseTarget: 60, modifier: 5, effectiveTarget: 65, success: true, grade: 'success' });
    expect(rollAbsoluteCheck({ baseTarget: 60, modifier: 5, rng: () => 0.65 })).toMatchObject({ roll: 66, effectiveTarget: 65, success: false, grade: 'fail' });
  });

  it('rolls a V18 regular stat die separately from absolute checks', () => {
    expect(rollStatDie({ effectiveStat: 6, rng: () => 0.5 }).die).toBe('d6');
  });
});
