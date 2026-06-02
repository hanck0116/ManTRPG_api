import test from 'node:test';
import assert from 'node:assert/strict';
import { rollD100, rollD20 } from '../dist/src/engine/dice.js';

test('dice returns JSON-friendly d100 roll results', () => {
  const result = rollD100({ rng: () => 0.16 });
  assert.deepEqual({ die: result.die, rolls: result.rolls, kept: result.kept, total: result.total, mode: result.mode }, {
    die: 'd100',
    rolls: [17],
    kept: 17,
    total: 17,
    mode: 'normal',
  });
});

test('dice supports d20 advantage', () => {
  const rolls = [0.2, 0.9];
  const result = rollD20({ mode: 'advantage', rng: () => rolls.shift() ?? 0 });
  assert.deepEqual(result.rolls, [5, 19]);
  assert.equal(result.kept, 19);
});
