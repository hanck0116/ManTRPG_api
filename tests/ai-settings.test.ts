import { describe, expect, it, beforeEach } from 'vitest';
import { clearAIKeys, defaultAISettings, getMemoryProviderKey, saveAISettings, setMemoryProviderKey } from '../src/ai/settings.js';

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

describe('ai-settings', () => {
  beforeEach(() => { installLocalStorage(); localStorage.clear(); clearAIKeys(); });

  it('defaults to no device key saving and strips plaintext keys from localStorage settings', () => {
    expect(defaultAISettings.saveKeysOnDevice).toBe(false);
    saveAISettings({ apiEnabled: true, provider: 'groq', saveKeysOnDevice: true, groqKey: 'gsk-secret', apiKey: 'raw-secret' });
    const raw = localStorage.getItem('mantrpg.aiSettings') ?? '';
    expect(raw).not.toContain('gsk-secret');
    expect(raw).not.toContain('raw-secret');
    expect(raw).not.toContain('groqKey');
    expect(raw).not.toContain('apiKey');
  });

  it('clearAIKeys clears memory provider keys', () => {
    setMemoryProviderKey('groq', 'gsk-secret');
    expect(getMemoryProviderKey('groq')).toBe('gsk-secret');
    clearAIKeys('groq');
    expect(getMemoryProviderKey('groq')).toBeNull();
  });
});
