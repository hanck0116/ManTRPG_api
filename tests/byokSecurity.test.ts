import { describe, expect, it } from 'vitest';
import { handleTurn, getSession } from '../src/api/routes.js';
import { redactRequest } from '../src/llm/openAICompatible.js';
import { PlayerInputSchema } from '../src/api/schemas.js';
import { createSessionState } from '../src/state/sessionState.js';

const secret = 'sk-test-secret-do-not-log';

describe('BYOK security', () => {
  it('PlayerInputSchema rejects llm/apiKey request payloads', () => {
    expect(() => PlayerInputSchema.parse({ sessionId: 'bad-schema', text: '/attack', llm: { provider: 'groq', apiKey: secret } })).toThrow();
  });
  it('does not accept apiKey on /turn and never returns it', async () => {
    await expect(handleTurn({ sessionId: 'bad-key', text: '/attack', llm: { provider: 'groq', apiKey: secret } } as never)).rejects.toThrow();
    const result = await handleTurn({ sessionId: 'safe-key', text: '/attack' });
    expect(JSON.stringify(result)).not.toContain(secret);
  });

  it('does not store apiKey in SessionState or logSummary', () => {
    const session = getSession('session-redaction');
    session.logSummary.push('attack:success:1');
    expect(JSON.stringify(session)).not.toContain(secret);
    expect(JSON.stringify(session.logSummary)).not.toContain(secret);
  });

  it('redactRequest does not include apiKey in prompt payload', () => {
    const state = { scene: 'combat', turn: 1, player: { hp: '1/1', mp: '1/1', weapon: 'x', condition: 'normal' }, enemy: null, availableActions: [], candidateIds: { skills: [], magic: [], items: [] } } as const;
    const request = { task: 'interpret', settings: { provider: 'groq', apiKey: secret }, text: 'test', state } as const;
    const payload = JSON.stringify(redactRequest(request));
    expect(payload).not.toContain(secret);
    expect(payload).toContain('[redacted]');
  });
});
