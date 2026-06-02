import { describe, expect, it } from 'vitest';
import { MinimalApiStateSchema } from '../src/api/schemas.js';
import { createSessionState, summarizeSession } from '../src/state/sessionState.js';

describe('MinimalApiState', () => {
  it('does not include full catalogs and caps candidateIds at 5 each', () => {
    const session = createSessionState('minimal-state');
    session.player.skills = ['a','b','c','d','e','f'];
    session.player.magic = ['a','b','c','d','e','f'];
    session.player.inventory = { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1 };
    const parsed = MinimalApiStateSchema.parse(summarizeSession(session));
    const serialized = JSON.stringify(parsed);
    expect(parsed.candidateIds.skills).toHaveLength(5);
    expect(parsed.candidateIds.magic).toHaveLength(5);
    expect(parsed.candidateIds.items).toHaveLength(5);
    expect(serialized).not.toContain('damageMultiplier');
    expect(serialized).not.toContain('itemCatalog');
  });
});
