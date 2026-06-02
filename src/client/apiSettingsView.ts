import type { LlmSettings } from '../api/schemas.js';
import { publicDeviceWarning, type RuntimeApiSettings } from './apiKeySettings.js';
import type { ClientUiState } from './uiState.js';

export function apiSettingsHtml(state: ClientUiState): string {
  const disabled = state.apiBusy ? 'disabled' : '';
  return `<form class="card form-stack" id="api-form">
    <div class="info"><strong>API는 선택 기능입니다.</strong><p>일반 전투는 API를 사용하지 않습니다. 중요한 장면 또는 해석이 필요한 입력에서만 호출합니다.</p><p>사용 비용은 입력한 API Key의 계정에 청구될 수 있습니다.</p></div>
    <label>Provider<select id="provider" ${disabled}><option value="none">API 사용 안 함</option><option value="groq">Groq</option><option value="gemini">Gemini</option><option value="openrouter">OpenRouter</option><option value="customOpenAI">Custom OpenAI-compatible</option></select></label>
    <label>API Key<input id="api-key" type="password" autocomplete="off" ${disabled} /></label>
    <label>모델<input id="model" value="${state.settings.model ?? ''}" ${disabled} /></label>
    <label>endpoint<input id="endpoint" value="${state.settings.endpoint ?? ''}" ${disabled} /></label>
    <label>저장 방식<select id="persistence" ${disabled}><option value="sessionOnly">이번 접속에서만 사용</option><option value="deviceIndexedDb">이 기기에 저장</option><option value="deviceIndexedDbEncrypted">암호화 저장</option></select></label>
    <label>PIN/passphrase<input id="passphrase" type="password" ${disabled} /></label>
    <p class="warning">${publicDeviceWarning} 암호화 저장은 PIN/passphrase를 저장하지 않습니다. 브라우저 CORS 정책으로 provider 테스트가 실패할 수 있습니다.</p>
    <p class="api-status" role="status">${state.apiBusy ? 'API Key 테스트 중...' : state.apiStatus}</p>
    <button type="submit" ${disabled}>API Key 테스트/저장</button><button class="danger" type="button" id="delete-key" ${disabled}>API Key 삭제</button>
  </form>`;
}

export function toLlmSettings(settings: RuntimeApiSettings, apiKey: string): LlmSettings {
  return { provider: settings.provider, apiKey, endpoint: settings.endpoint, model: settings.model };
}
