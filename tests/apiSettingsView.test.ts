import { describe, expect, it } from 'vitest';
import { apiSettingsHtml } from '../src/client/apiSettingsView.js';
import { uiState } from '../src/client/uiState.js';

describe('API settings view', () => {
  const html = apiSettingsHtml(uiState);

  it('contains no API option and supported provider choices', () => {
    expect(html).toContain('API 사용 안 함');
    expect(html).toContain('Groq');
    expect(html).toContain('Gemini');
    expect(html).toContain('OpenRouter');
    expect(html).toContain('Custom OpenAI-compatible');
  });

  it('contains all storage modes and delete button', () => {
    expect(html).toContain('sessionOnly');
    expect(html).toContain('deviceIndexedDb');
    expect(html).toContain('deviceIndexedDbEncrypted');
    expect(html).toContain('API Key 삭제');
  });
});
