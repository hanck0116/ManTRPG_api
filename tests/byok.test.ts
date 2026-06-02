import { describe, expect, it } from 'vitest';
import { handleTurn } from '../src/api/routes.js';
import { MinimalApiStateSchema } from '../src/api/schemas.js';
import { createSessionState, summarizeSession } from '../src/state/sessionState.js';
import { MemorySessionStorageAdapter, createStoredSessionRecord } from '../src/state/storageAdapter.js';

const secret = 'sk-test-secret-do-not-log';

describe('BYOK optional LLM flow', () => {
  it('plays a full turn without an API key', async () => {
    const result = await handleTurn({ sessionId: 'no-key-turn', text: '낫으로 공격한다' });

    expect(result.action.intent).toBe('attack');
    expect(result.playerResult.damage).toBeGreaterThanOrEqual(0);
    expect(result.narration.text.length).toBeGreaterThan(0);
    expect(result.llm.used).toBe(false);
  });

  it('falls back to template narration when the API call is skipped or fails', async () => {
    const result = await handleTurn({
      sessionId: 'fallback-turn',
      text: '정체불명의 몸짓으로 위협한다',
      llm: { provider: 'customOpenAI', endpoint: 'https://example.invalid/v1/chat/completions', apiKey: secret, model: 'test' },
    });

    expect(result.llm.fallback).toBe(true);
    expect(result.narration.text).toContain('행동이 막혔다');
  });

  it('does not include API keys in turn results or stored sessions', async () => {
    const result = await handleTurn({
      sessionId: 'redaction-turn',
      text: '낫으로 공격한다',
      llm: { provider: 'groq', apiKey: secret },
    });
    expect(JSON.stringify(result)).not.toContain(secret);

    const adapter = new MemorySessionStorageAdapter();
    const session = createSessionState('stored-redaction');
    await adapter.saveSession(createStoredSessionRecord(session));
    expect(JSON.stringify(await adapter.loadSession('stored-redaction'))).not.toContain(secret);
  });

  it('keeps MinimalApiState compact and catalog-free', () => {
    const state = summarizeSession(createSessionState('minimal-state'));
    const parsed = MinimalApiStateSchema.parse(state);
    const serialized = JSON.stringify(parsed);

    expect(parsed.candidateIds.skills).toEqual(['SK_REAPING_ARC']);
    expect(serialized).not.toContain('damageMultiplier');
    expect(serialized).not.toContain('EQ_WEAPON_SCYTHE_BASIC');
    expect(serialized).not.toContain('itemCatalog');
  });
});
