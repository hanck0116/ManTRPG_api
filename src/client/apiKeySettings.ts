import type { LlmProvider, LlmSettings } from '../api/schemas.js';
import { getSessionApiKey, loadApiKey, saveApiKey, deleteApiKey, publicDeviceWarning } from '../pwa/apiKeyStore.js';
import type { ApiKeyPersistence, MobilePwaSettings } from '../pwa/settings.js';
import { defaultPwaSettings } from '../pwa/settings.js';

export { publicDeviceWarning };
export interface RuntimeApiSettings extends MobilePwaSettings { passphrase?: string; }
export const defaultRuntimeApiSettings: RuntimeApiSettings = { ...defaultPwaSettings };

export async function persistApiKey(provider: LlmProvider, apiKey: string, persistence: ApiKeyPersistence, passphrase?: string): Promise<void> {
  await saveApiKey(provider, apiKey, persistence, passphrase);
}

export async function removeApiKey(provider?: LlmProvider): Promise<void> { await deleteApiKey(provider); }

export async function resolveClientLlmSettings(settings: RuntimeApiSettings): Promise<LlmSettings | null> {
  if (!settings.apiEnabled) return null;
  const apiKey = getSessionApiKey(settings.provider) ?? await loadApiKey(settings.provider, settings.passphrase);
  if (!apiKey?.trim()) return null;
  return { provider: settings.provider, apiKey, endpoint: settings.endpoint, model: settings.model };
}
