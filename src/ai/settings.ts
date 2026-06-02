import type { LlmProvider } from '../api/schemas.js';
import {
  clearMemoryProviderKeys,
  deleteEncryptedProviderKey,
  getMemoryProviderKey,
  loadEncryptedProviderKey,
  saveEncryptedProviderKey,
  setMemoryProviderKey,
} from './secureKeyStore.js';

export interface AISettings {
  apiEnabled: boolean;
  provider: LlmProvider;
  model?: string;
  endpoint?: string;
  saveKeysOnDevice: boolean;
  confirmBeforeCall: boolean;
  sessionTokenBudget?: number;
  dailyTokenBudget?: number;
  enemyActionApiEnabled?: boolean;
  proxyModeEnabled?: boolean;
}

export const defaultAISettings: AISettings = {
  apiEnabled: false,
  provider: 'groq',
  saveKeysOnDevice: false,
  confirmBeforeCall: false,
  enemyActionApiEnabled: false,
  proxyModeEnabled: false,
};

const settingsKey = 'mantrpg.aiSettings';
const forbiddenPlainKeyFields = new Set(['apiKey', 'groqKey', 'geminiKey', 'openrouterKey', 'customOpenAIKey', 'playerKey']);

export { setMemoryProviderKey, getMemoryProviderKey, clearMemoryProviderKeys, saveEncryptedProviderKey, loadEncryptedProviderKey, deleteEncryptedProviderKey };

export function loadAISettings(): AISettings {
  const raw = localStorage.getItem(settingsKey);
  if (!raw) return { ...defaultAISettings };
  try {
    return sanitizeAISettings(JSON.parse(raw));
  } catch {
    return { ...defaultAISettings };
  }
}

export function saveAISettings(settings: Partial<AISettings> & Record<string, unknown>): AISettings {
  const safe = sanitizeAISettings(settings);
  localStorage.setItem(settingsKey, JSON.stringify(safe));
  return safe;
}

export function sanitizeAISettings(value: unknown): AISettings {
  const record = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
  for (const key of forbiddenPlainKeyFields) delete record[key];
  const provider = isProvider(record.provider) ? record.provider : defaultAISettings.provider;
  return {
    ...defaultAISettings,
    apiEnabled: typeof record.apiEnabled === 'boolean' ? record.apiEnabled : defaultAISettings.apiEnabled,
    provider,
    model: typeof record.model === 'string' && record.model.trim() ? record.model : undefined,
    endpoint: typeof record.endpoint === 'string' && record.endpoint.trim() ? record.endpoint : undefined,
    saveKeysOnDevice: typeof record.saveKeysOnDevice === 'boolean' ? record.saveKeysOnDevice : defaultAISettings.saveKeysOnDevice,
    confirmBeforeCall: typeof record.confirmBeforeCall === 'boolean' ? record.confirmBeforeCall : defaultAISettings.confirmBeforeCall,
    sessionTokenBudget: positiveInteger(record.sessionTokenBudget),
    dailyTokenBudget: positiveInteger(record.dailyTokenBudget),
    enemyActionApiEnabled: typeof record.enemyActionApiEnabled === 'boolean' ? record.enemyActionApiEnabled : defaultAISettings.enemyActionApiEnabled,
    proxyModeEnabled: typeof record.proxyModeEnabled === 'boolean' ? record.proxyModeEnabled : defaultAISettings.proxyModeEnabled,
  };
}

export async function storeProviderKey(provider: LlmProvider, apiKey: string, options: { saveKeysOnDevice?: boolean; passphrase?: string } = {}): Promise<void> {
  if (options.saveKeysOnDevice) {
    await saveEncryptedProviderKey(provider, apiKey, options.passphrase);
    clearMemoryProviderKeys(provider);
    return;
  }
  setMemoryProviderKey(provider, apiKey);
}

export async function resolveProviderKey(provider: LlmProvider, passphrase?: string): Promise<string | null> {
  return getMemoryProviderKey(provider) ?? (passphrase ? loadEncryptedProviderKey(provider, passphrase) : null);
}

export function clearAIKeys(provider?: LlmProvider): void {
  clearMemoryProviderKeys(provider);
  deleteEncryptedProviderKey(provider);
}

function isProvider(value: unknown): value is LlmProvider {
  return typeof value === 'string' && ['groq', 'gemini', 'openrouter', 'customOpenAI'].includes(value);
}

function positiveInteger(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : undefined;
}
