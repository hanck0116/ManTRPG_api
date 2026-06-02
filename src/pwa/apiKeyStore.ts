import type { LlmProvider } from '../api/schemas.js';
import { keyStore, openManTrpgDb } from './indexedDbStore.js';
import type { ApiKeyPersistence } from './settings.js';

export interface StoredApiKeyRecord {
  provider: LlmProvider;
  encrypted: boolean;
  value: string;
  iv?: string;
  savedAt: string;
}

const sessionKeys = new Map<LlmProvider, string>();

export function setSessionApiKey(provider: LlmProvider, apiKey: string): void {
  sessionKeys.set(provider, apiKey);
}

export function getSessionApiKey(provider: LlmProvider): string | null {
  return sessionKeys.get(provider) ?? null;
}

export function clearSessionApiKey(provider?: LlmProvider): void {
  if (provider) sessionKeys.delete(provider);
  else sessionKeys.clear();
}

export async function saveApiKey(provider: LlmProvider, apiKey: string, persistence: ApiKeyPersistence): Promise<void> {
  if (persistence === 'sessionOnly') {
    setSessionApiKey(provider, apiKey);
    return;
  }

  const record = persistence === 'deviceIndexedDbEncrypted'
    ? await encryptApiKeyRecord(provider, apiKey)
    : { provider, encrypted: false, value: apiKey, savedAt: new Date().toISOString() } satisfies StoredApiKeyRecord;

  const db = await openManTrpgDb();
  const tx = db.transaction(keyStore, 'readwrite');
  tx.objectStore(keyStore).put(record);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('api_key_save_failed'));
    tx.onabort = () => reject(tx.error ?? new Error('api_key_save_aborted'));
  });
  db.close();
}

export async function loadApiKey(provider: LlmProvider): Promise<string | null> {
  const sessionKey = getSessionApiKey(provider);
  if (sessionKey) return sessionKey;

  const db = await openManTrpgDb();
  const tx = db.transaction(keyStore, 'readonly');
  const request = tx.objectStore(keyStore).get(provider);
  const record = await new Promise<StoredApiKeyRecord | null>((resolve, reject) => {
    request.onerror = () => reject(request.error ?? new Error('api_key_load_failed'));
    request.onsuccess = () => resolve((request.result as StoredApiKeyRecord | undefined) ?? null);
  });
  db.close();
  if (!record) return null;
  return record.encrypted ? decryptApiKeyRecord(record) : record.value;
}

export async function deleteApiKey(provider?: LlmProvider): Promise<void> {
  clearSessionApiKey(provider);
  const db = await openManTrpgDb();
  const tx = db.transaction(keyStore, 'readwrite');
  if (provider) tx.objectStore(keyStore).delete(provider);
  else tx.objectStore(keyStore).clear();
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('api_key_delete_failed'));
    tx.onabort = () => reject(tx.error ?? new Error('api_key_delete_aborted'));
  });
  db.close();
}

async function encryptionKey(): Promise<CryptoKey> {
  const material = new TextEncoder().encode('mantrpg-local-device-key');
  const digest = await crypto.subtle.digest('SHA-256', material);
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function encryptApiKeyRecord(provider: LlmProvider, apiKey: string): Promise<StoredApiKeyRecord> {
  if (!globalThis.crypto?.subtle) throw new Error('web_crypto_unavailable');
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await encryptionKey(), new TextEncoder().encode(apiKey));
  return {
    provider,
    encrypted: true,
    value: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
    savedAt: new Date().toISOString(),
  };
}

async function decryptApiKeyRecord(record: StoredApiKeyRecord): Promise<string> {
  if (!globalThis.crypto?.subtle || !record.iv) throw new Error('web_crypto_unavailable');
  const encrypted = Uint8Array.from(atob(record.value), (char) => char.charCodeAt(0));
  const iv = Uint8Array.from(atob(record.iv), (char) => char.charCodeAt(0));
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, await encryptionKey(), encrypted);
  return new TextDecoder().decode(plain);
}
