import type { LlmProvider } from '../api/schemas.js';

export interface EncryptedProviderKeyEnvelope {
  provider: LlmProvider;
  alg: 'AES-GCM';
  kdf: 'PBKDF2-SHA256';
  iterations: number;
  salt: string;
  iv: string;
  value: string;
  savedAt: string;
}

const memoryKeys = new Map<LlmProvider, string>();
const storagePrefix = 'mantrpg.encryptedApiKey.';
const iterations = 210_000;

export function setMemoryProviderKey(provider: LlmProvider, apiKey: string): void {
  if (apiKey.trim()) memoryKeys.set(provider, apiKey);
  else memoryKeys.delete(provider);
}

export function getMemoryProviderKey(provider: LlmProvider): string | null {
  return memoryKeys.get(provider) ?? null;
}

export function clearMemoryProviderKeys(provider?: LlmProvider): void {
  if (provider) memoryKeys.delete(provider);
  else memoryKeys.clear();
}

export async function saveEncryptedProviderKey(provider: LlmProvider, apiKey: string, passphrase?: string): Promise<void> {
  const envelope = await encryptProviderKey(provider, apiKey, passphrase);
  localStorage.setItem(storageKey(provider), JSON.stringify(envelope));
}

export async function loadEncryptedProviderKey(provider: LlmProvider, passphrase?: string): Promise<string | null> {
  const raw = localStorage.getItem(storageKey(provider));
  if (!raw) return null;
  const envelope = JSON.parse(raw) as EncryptedProviderKeyEnvelope;
  return decryptProviderKey(envelope, passphrase);
}

export function deleteEncryptedProviderKey(provider?: LlmProvider): void {
  if (provider) {
    localStorage.removeItem(storageKey(provider));
    return;
  }
  const keys: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(storagePrefix)) keys.push(key);
  }
  for (const key of keys) localStorage.removeItem(key);
}

export async function getProviderKey(provider: LlmProvider, passphrase?: string): Promise<string | null> {
  return getMemoryProviderKey(provider) ?? (passphrase ? loadEncryptedProviderKey(provider, passphrase) : null);
}

function storageKey(provider: LlmProvider): string {
  return `${storagePrefix}${provider}`;
}

function requirePassphrase(passphrase?: string): string {
  if (!passphrase?.trim()) throw new Error('passphrase_required_for_encrypted_storage');
  return passphrase;
}

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  if (!globalThis.crypto?.subtle) throw new Error('web_crypto_unavailable');
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function encryptProviderKey(provider: LlmProvider, apiKey: string, passphrase?: string): Promise<EncryptedProviderKeyEnvelope> {
  const pin = requirePassphrase(passphrase);
  if (!globalThis.crypto?.subtle) throw new Error('web_crypto_unavailable');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, await deriveKey(pin, salt), new TextEncoder().encode(apiKey) as BufferSource);
  return { provider, alg: 'AES-GCM', kdf: 'PBKDF2-SHA256', iterations, salt: bytesToBase64(salt), iv: bytesToBase64(iv), value: bytesToBase64(new Uint8Array(cipher)), savedAt: new Date().toISOString() };
}

export async function decryptProviderKey(envelope: EncryptedProviderKeyEnvelope, passphrase?: string): Promise<string> {
  const pin = requirePassphrase(passphrase);
  const iv = base64ToBytes(envelope.iv);
  const salt = base64ToBytes(envelope.salt);
  const cipher = base64ToBytes(envelope.value);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource }, await deriveKey(pin, salt), cipher as BufferSource);
  return new TextDecoder().decode(plain);
}
