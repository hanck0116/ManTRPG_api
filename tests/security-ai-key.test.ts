import { describe, expect, it, beforeEach } from 'vitest';
import { clearMemoryProviderKeys, deleteEncryptedProviderKey, getProviderKey, loadEncryptedProviderKey, saveEncryptedProviderKey, setMemoryProviderKey } from '../src/ai/secureKeyStore.js';
import { compactPayloadForRequest } from '../src/llm/router.js';
import { createSessionState, summarizeSession } from '../src/state/sessionState.js';

const secret = 'sk-security-raw-secret';

function installLocalStorage(): void {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      get length() { return store.size; },
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key, value); },
      removeItem: (key: string) => { store.delete(key); },
      clear: () => { store.clear(); },
    },
  });
}

describe('security-ai-key', () => {
  beforeEach(() => { installLocalStorage(); localStorage.clear(); clearMemoryProviderKeys(); });

  it('stores encrypted API key without raw localStorage value and decrypts only with passphrase', async () => {
    await saveEncryptedProviderKey('groq', secret, '1234');
    expect(JSON.stringify(localStorage)).not.toContain(secret);
    expect(await loadEncryptedProviderKey('groq', '1234')).toBe(secret);
    await expect(loadEncryptedProviderKey('groq', 'wrong')).rejects.toThrow();
  });

  it('fails encrypted storage without passphrase and clears memory plus storage', async () => {
    await expect(saveEncryptedProviderKey('groq', secret, '')).rejects.toThrow(/passphrase/);
    setMemoryProviderKey('groq', secret);
    await saveEncryptedProviderKey('groq', secret, '1234');
    clearMemoryProviderKeys();
    deleteEncryptedProviderKey();
    expect(await getProviderKey('groq', '1234')).toBeNull();
    expect(JSON.stringify(localStorage)).not.toContain(secret);
  });

  it('does not include API key names or raw values in prompt payload', () => {
    const state = summarizeSession(createSessionState('secure-prompt'));
    const payload = compactPayloadForRequest({ task: 'interpret', settings: { provider: 'groq', apiKey: secret }, text: '공격', state });
    expect(payload).not.toContain(secret);
    expect(payload).not.toContain('apiKey');
    expect(payload).not.toContain('groqKey');
    expect(payload).not.toContain('geminiKey');
    expect(payload).not.toContain('openrouterKey');
  });
});
