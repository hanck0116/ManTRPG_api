import type { LlmProvider, LlmSettings } from '../api/schemas.js';

export type ApiKeyPersistence = 'sessionOnly' | 'deviceIndexedDb' | 'deviceIndexedDbEncrypted';

export interface MobilePwaSettings {
  mobileFirst: true;
  preferredViewportWidth: 390;
  apiEnabled: boolean;
  provider: LlmProvider;
  model?: string;
  endpoint?: string;
  apiKeyPersistence: ApiKeyPersistence;
  estimateUsage: boolean;
}

export const defaultPwaSettings: MobilePwaSettings = {
  mobileFirst: true,
  preferredViewportWidth: 390,
  apiEnabled: false,
  provider: 'groq',
  apiKeyPersistence: 'sessionOnly',
  estimateUsage: true,
};

export function toLlmSettings(settings: MobilePwaSettings, apiKey: string): LlmSettings | null {
  if (!settings.apiEnabled || apiKey.trim().length === 0) return null;
  return {
    provider: settings.provider,
    apiKey,
    endpoint: settings.endpoint,
    model: settings.model,
  };
}

export function estimateUsageText(promptChars: number, completionChars: number): string {
  const promptTokens = Math.ceil(promptChars / 4);
  const completionTokens = Math.ceil(completionChars / 4);
  return `약 ${promptTokens + completionTokens} tokens (${promptTokens} prompt + ${completionTokens} output)`;
}
