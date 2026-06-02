import test from 'node:test';
import assert from 'node:assert/strict';
import { playerAttack } from '../dist/src/engine/combat.js';
import { createSessionState } from '../dist/src/state/sessionState.js';

const attackAction = {
  intent: 'attack',
  target: 'enemy',
  skillId: null,
  magicId: null,
  itemId: null,
  method: 'basic_attack',
  rawText: '낫을 휘두른다',
};

test('combat handles a successful single-enemy player attack', () => {
  const session = createSessionState('combat-test');
  const result = playerAttack(session, attackAction, () => 0.95);
  assert.equal(result.result, 'success');
  assert.equal(result.damage, 4);
  assert.equal(result.enemyHp, 16);
  assert.equal(session.enemy?.condition, 'normal');
});

test('combat never creates multiple enemies', () => {
  const session = createSessionState('single-enemy-test');
  assert.notEqual(session.enemy, null);
  assert.equal(Array.isArray(session.enemy), false);
});
