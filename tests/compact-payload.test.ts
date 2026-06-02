import { describe, expect, it } from 'vitest';
import { buildCompactPayload, serializeCompactPayload } from '../src/ai/compactPayload.js';
import { createSessionState, summarizeSession } from '../src/state/sessionState.js';

describe('compact-payload', () => {
  it('omits full state, catalogs, API keys, and enemy details under budget', () => {
    const session = createSessionState('compact');
    session.player.skills = ['a', 'b', 'c', 'd', 'e', 'f'];
    session.player.magic = ['a', 'b', 'c', 'd', 'e', 'f'];
    session.player.inventory = { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1 };
    session.logSummary = ['x'.repeat(500)];
    const state = summarizeSession(session);
    const serialized = serializeCompactPayload({ task: 'narrate', state, logLines: session.logSummary, engineResult: {
      ok: true, scene: 'combat', result: 'success', check: null, roll: null, baseTarget: null, effectiveTarget: null, grade: null, success: true, damage: 7, healing: 0, playerHp: 40, playerMp: 20, enemyHp: 13, battleEnded: false, tags: ['physical'], messageHint: 'player_hit_enemy'
    } });
    const payload = buildCompactPayload({ task: 'narrate', state, logLines: session.logSummary });
    expect(serialized.length).toBeLessThanOrEqual(1200);
    expect(serialized).not.toContain('apiKey');
    expect(serialized).not.toContain('currentHp');
    expect(serialized).not.toContain('enemyHp');
    expect(serialized).not.toContain('damageMultiplier');
    expect(serialized).not.toContain('skillCatalog');
    expect(((payload.ids as { sk: string[] }).sk)).toHaveLength(5);
    expect(String(payload.s)).toHaveLength(300);
  });
});
