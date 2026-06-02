import './styles.css';
import { toLlmSettings } from './apiSettingsView.js';
import { readInput, readSelect, getAppRoot } from './dom.js';
import { deleteClientSession, runClientTurn } from './gameRuntime.js';
import { persistApiKey, removeApiKey, type RuntimeApiSettings } from './apiKeySettings.js';
import { testClientApiKey } from './llmClientRuntime.js';
import { renderApp } from './render.js';
import { resetSessionState, uiState, type AppTab } from './uiState.js';

const app = getAppRoot();
let currentTab: AppTab = 'play';

async function submit(text: string) {
  uiState.turn = await runClientTurn({ sessionId: uiState.sessionId, text, apiSettings: uiState.settings });
  render('play');
}

function render(tab: AppTab = currentTab) {
  currentTab = tab;
  app.innerHTML = renderApp(uiState, tab);
  app.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((button) => button.addEventListener('click', () => render(button.dataset.tab as AppTab)));
  bindPlay();
  bindApi();
  bindSession();
}

function bindPlay() {
  app.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach((button) => button.addEventListener('click', () => submit(button.dataset.choice ?? '/attack')));
  app.querySelector<HTMLFormElement>('#turn-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = readInput(app, '#turn-text');
    if (text) void submit(text);
  });
}

function readApiSettings(): { providerValue: string; key: string; nextSettings: RuntimeApiSettings } {
  const providerValue = readSelect(app, '#provider', 'none');
  const nextSettings: RuntimeApiSettings = {
    ...uiState.settings,
    apiEnabled: providerValue !== 'none',
    provider: providerValue === 'none' ? uiState.settings.provider : providerValue as RuntimeApiSettings['provider'],
    model: readInput(app, '#model') || undefined,
    endpoint: readInput(app, '#endpoint') || undefined,
    apiKeyPersistence: readSelect(app, '#persistence', 'sessionOnly') as RuntimeApiSettings['apiKeyPersistence'],
    passphrase: readInput(app, '#passphrase') || undefined,
  };
  return { providerValue, key: app.querySelector<HTMLInputElement>('#api-key')?.value ?? '', nextSettings };
}

function bindApi() {
  app.querySelector<HTMLFormElement>('#api-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const { providerValue, key, nextSettings } = readApiSettings();
    uiState.settings = nextSettings;

    if (providerValue === 'none') {
      uiState.apiStatus = 'API 사용 안 함으로 설정했습니다. 오프라인 기본 플레이를 계속합니다.';
      render('api');
      return;
    }
    if (!key.trim()) {
      uiState.apiStatus = 'API Key를 입력해야 테스트하고 저장할 수 있습니다.';
      render('api');
      return;
    }

    uiState.apiBusy = true;
    uiState.apiStatus = 'API Key 테스트 중...';
    render('api');
    const testSettings = toLlmSettings(nextSettings, key);
    const result = await testClientApiKey(testSettings);
    uiState.apiBusy = false;

    if (result.ok) {
      await persistApiKey(nextSettings.provider, key, nextSettings.apiKeyPersistence, nextSettings.passphrase);
      uiState.apiStatus = `테스트 성공: ${result.message}. API Key를 저장했습니다.`;
    } else {
      uiState.apiStatus = `테스트 실패: ${result.message}. 저장하지 않았습니다. 브라우저 CORS 정책 또는 provider endpoint/model 설정을 확인하세요.`;
    }
    render('api');
  });

  app.querySelector<HTMLButtonElement>('#delete-key')?.addEventListener('click', async () => {
    await removeApiKey(uiState.settings.provider);
    uiState.apiStatus = '현재 provider의 API Key를 삭제했습니다.';
    render('api');
  });
}

function bindSession() {
  app.querySelector<HTMLButtonElement>('#new-game')?.addEventListener('click', () => { resetSessionState(); render('play'); });
  app.querySelector<HTMLButtonElement>('#continue-game')?.addEventListener('click', () => render('play'));
  app.querySelector<HTMLButtonElement>('#delete-save')?.addEventListener('click', async () => { await deleteClientSession(uiState.sessionId); uiState.turn = null; render('play'); });
}

if ('serviceWorker' in navigator) void navigator.serviceWorker.register('/service-worker.js');
render();
