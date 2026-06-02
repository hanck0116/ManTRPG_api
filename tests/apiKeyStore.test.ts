import { describe, expect, it } from 'vitest';
import { clearSessionApiKey, decryptApiKeyRecord, deleteApiKey, encryptApiKeyRecord, getSessionApiKey, saveApiKey } from '../src/pwa/apiKeyStore.js';

describe('apiKeyStore', () => {
  it('stores and loads sessionOnly keys in memory', async () => {
    await saveApiKey('groq', 'sk-session', 'sessionOnly');
    expect(getSessionApiKey('groq')).toBe('sk-session');
    clearSessionApiKey('groq');
    expect(getSessionApiKey('groq')).toBeNull();
  });

  it('delete key clears session key when IndexedDB is unavailable', async () => {
    await saveApiKey('gemini', 'sk-delete', 'sessionOnly');
    await expect(deleteApiKey('gemini')).rejects.toThrow('indexeddb_unavailable');
    expect(getSessionApiKey('gemini')).toBeNull();
  });

  it('encrypted storage requires a PIN/passphrase', async () => {
    await expect(encryptApiKeyRecord('groq', 'sk-secret')).rejects.toThrow('passphrase_required');
  });

  it('encrypts and decrypts with the correct passphrase only', async () => {
    const record = await encryptApiKeyRecord('openrouter', 'sk-encrypted', '1234');
    expect(record.value).not.toContain('sk-encrypted');
    await expect(decryptApiKeyRecord(record, 'bad-pin')).rejects.toThrow();
    await expect(decryptApiKeyRecord(record, '1234')).resolves.toBe('sk-encrypted');
  });
});
