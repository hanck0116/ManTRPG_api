import type { LlmProvider } from '../api/schemas.js';
import { keyStore, openManTrpgDb } from './indexedDbStore.js';
import type { ApiKeyPersistence } from './settings.js';

export interface StoredApiKeyRecord {
  provider: LlmProvider;
  encrypted: true;
  value: string;
  iv: string;
  salt: string;
  kdf: 'PBKDF2-SHA256';
  savedAt: string;
}

export const publicDeviceWarning = '기기 저장은 PBKDF2 + AES-GCM 암호화 저장만 지원합니다. PIN/passphrase는 저장하지 않습니다.';
export const unsafeDeviceWarning = '개발 전용 unsafe 평문 저장은 기본 UI에서 숨겨져 있으며 프로덕션 기본 흐름에서 사용하지 않습니다.';
const sessionKeys = new Map<LlmProvider, string>();

export function setSessionApiKey(provider: LlmProvider, apiKey: string): void { apiKey.trim() ? sessionKeys.set(provider, apiKey) : sessionKeys.delete(provider); }
export function getSessionApiKey(provider: LlmProvider): string | null { return sessionKeys.get(provider) ?? null; }
export function clearSessionApiKey(provider?: LlmProvider): void { if (provider) sessionKeys.delete(provider); else sessionKeys.clear(); }

export async function saveApiKey(provider: LlmProvider, apiKey: string, persistence: ApiKeyPersistence, passphrase?: string): Promise<void> {
  if (persistence === 'sessionOnly') { setSessionApiKey(provider, apiKey); return; }
  if (persistence === 'deviceIndexedDb') throw new Error('unsafe_plaintext_storage_disabled');
  const record = await encryptApiKeyRecord(provider, apiKey, passphrase);
  const db = await openManTrpgDb();
  const tx = db.transaction(keyStore, 'readwrite');
  tx.objectStore(keyStore).put(record);
  await txDone(tx);
  db.close();
}

export async function loadApiKey(provider: LlmProvider, passphrase?: string): Promise<string | null> {
  const sessionKey = getSessionApiKey(provider);
  if (sessionKey) return sessionKey;
  if (!passphrase?.trim()) return null;
  const db = await openManTrpgDb();
  const tx = db.transaction(keyStore, 'readonly');
  const request = tx.objectStore(keyStore).get(provider);
  const record = await new Promise<StoredApiKeyRecord | null>((resolve, reject) => {
    request.onerror = () => reject(request.error ?? new Error('api_key_load_failed'));
    request.onsuccess = () => resolve((request.result as StoredApiKeyRecord | undefined) ?? null);
  });
  await txDone(tx);
  db.close();
  return record ? decryptApiKeyRecord(record, passphrase) : null;
}

export async function deleteApiKey(provider?: LlmProvider): Promise<void> {
  clearSessionApiKey(provider);
  const db = await openManTrpgDb();
  const tx = db.transaction(keyStore, 'readwrite');
  if (provider) tx.objectStore(keyStore).delete(provider);
  else tx.objectStore(keyStore).clear();
  await txDone(tx);
  db.close();
}

function txDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('api_key_tx_failed'));
    transaction.onabort = () => reject(transaction.error ?? new Error('api_key_tx_aborted'));
  });
}

function requirePassphrase(passphrase?: string): string {
  if (!passphrase?.trim()) throw new Error('passphrase_required_for_encrypted_storage');
  return passphrase;
}

function bytesToBase64(bytes: Uint8Array): string { return btoa(String.fromCharCode(...bytes)); }
function base64ToBytes(value: string): Uint8Array { return Uint8Array.from(atob(value), (char) => char.charCodeAt(0)); }

async function deriveEncryptionKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  if (!globalThis.crypto?.subtle) throw new Error('web_crypto_unavailable');
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt as BufferSource, iterations: 210_000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function encryptApiKeyRecord(provider: LlmProvider, apiKey: string, passphrase?: string): Promise<StoredApiKeyRecord> {
  const pin = requirePassphrase(passphrase);
  if (!globalThis.crypto?.subtle) throw new Error('web_crypto_unavailable');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, await deriveEncryptionKey(pin, salt), new TextEncoder().encode(apiKey) as BufferSource);
  return { provider, encrypted: true, value: bytesToBase64(new Uint8Array(encrypted)), iv: bytesToBase64(iv), salt: bytesToBase64(salt), kdf: 'PBKDF2-SHA256', savedAt: new Date().toISOString() };
}

export async function decryptApiKeyRecord(record: StoredApiKeyRecord, passphrase?: string): Promise<string> {
  const pin = requirePassphrase(passphrase);
  const encrypted = base64ToBytes(record.value);
  const iv = base64ToBytes(record.iv);
  const salt = base64ToBytes(record.salt);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource }, await deriveEncryptionKey(pin, salt), encrypted as BufferSource);
  return new TextDecoder().decode(plain);
}
