import type { LlmSettings } from '../api/schemas.js';
import { publicDeviceWarning, type RuntimeApiSettings } from './apiKeySettings.js';
import type { ClientUiState } from './uiState.js';

export function apiSettingsHtml(state: ClientUiState): string {
  const disabled = state.apiBusy ? 'disabled' : '';
  return `<form class="card form-stack" id="api-form">
    <div class="info"><strong>API는 선택 기능입니다.</strong><p>API Key 없이도 기본 플레이가 가능합니다. 일반 전투와 명확한 행동은 API를 사용하지 않습니다.</p><p>개발자 API Key는 사용하지 않으며 기본 비용은 0원입니다. 플레이어가 입력한 Key를 쓸 때만 해당 계정에서 비용이 발생할 수 있습니다.</p></div>
    <label>Provider<select id="provider" ${disabled}><option value="none">API 사용 안 함</option><option value="groq">Groq</option><option value="gemini">Gemini</option><option value="openrouter">OpenRouter</option><option value="customOpenAI">Custom OpenAI-compatible</option></select></label>
    <label>API Key<input id="api-key" type="password" autocomplete="off" ${disabled} /></label><label><input id="confirm-before-call" type="checkbox" /> API 호출 전 항상 확인</label><p class="info">예상 비용: 호출 전 compact payload 기준 토큰 예산을 표시합니다. Worker proxy는 기본값이 아니며, proxy 모드에서는 API Key가 Worker를 통과할 수 있습니다.</p>
    <label>모델<input id="model" value="${state.settings.model ?? ''}" ${disabled} /></label>
    <label>endpoint<input id="endpoint" value="${state.settings.endpoint ?? ''}" ${disabled} /></label>
    <label>저장 방식<select id="persistence" ${disabled}><option value="sessionOnly">이번 접속에서만 사용</option><option value="deviceIndexedDbEncrypted">암호화 저장</option></select></label>
    <label>PIN/passphrase<input id="passphrase" type="password" ${disabled} /></label>
    <p class="warning">${publicDeviceWarning} 암호화 저장은 PIN/passphrase를 저장하지 않습니다. 브라우저 CORS 정책으로 provider 테스트가 실패할 수 있습니다.</p>
    <p class="api-status" role="status">${state.apiBusy ? 'API Key 테스트 중...' : state.apiStatus}</p>
    <button type="submit" ${disabled}>API Key 테스트/저장</button><button class="danger" type="button" id="delete-key" ${disabled}>API Key 삭제</button>
  </form>`;
}

export function toLlmSettings(settings: RuntimeApiSettings, apiKey: string): LlmSettings {
  return { provider: settings.provider, apiKey, endpoint: settings.endpoint, model: settings.model };
}
