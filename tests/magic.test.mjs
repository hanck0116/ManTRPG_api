import test from 'node:test';
import assert from 'node:assert/strict';
import { playerMagic } from '../dist/src/engine/combat.js';
import { createSessionState } from '../dist/src/state/sessionState.js';

const magicAction = {
  intent: 'magic',
  target: 'enemy',
  skillId: null,
  magicId: 'ember',
  itemId: null,
  method: 'spell',
  rawText: '작은 불씨를 던진다',
};

test('magic spends mana and applies engine-calculated magic damage', () => {
  const session = createSessionState('magic-test');
  const result = playerMagic(session, magicAction, () => 0.95);
  assert.equal(result.result, 'success');
  assert.equal(result.damage, 7);
  assert.equal(result.playerMp, 21);
  assert.equal(result.tags.includes('magic'), true);
});
