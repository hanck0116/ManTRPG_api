import './styles.css';
import type { TurnResult } from '../api/routes.js';
import { deleteClientSession, runClientTurn } from './gameRuntime.js';
import { defaultRuntimeApiSettings, persistApiKey, removeApiKey, publicDeviceWarning, type RuntimeApiSettings } from './apiKeySettings.js';

const appRoot = document.querySelector<HTMLElement>('#app');
if (!appRoot) throw new Error('app root missing');
const app = appRoot;

let sessionId = 'pwa-demo';
let turn: TurnResult | null = null;
let settings: RuntimeApiSettings = { ...defaultRuntimeApiSettings };

const choices = () => (turn?.narration.choices ?? ['/attack', '/defend', '/item IT_HERB_SMALL']).slice(0, 3);

async function submit(text: string) {
  turn = await runClientTurn({ sessionId, text, apiSettings: settings });
  render('play');
}

function render(tab: 'play' | 'api' | 'session' = 'play') {
  app.innerHTML = `
    <section class="card header"><strong>ManTRPG</strong><div class="tabs"><button class="secondary" data-tab="play">플레이</button><button class="secondary" data-tab="api">API</button><button class="secondary" data-tab="session">세션</button></div></section>
    ${tab === 'play' ? playHtml() : tab === 'api' ? apiHtml() : sessionHtml()}`;
  app.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((button) => button.addEventListener('click', () => render(button.dataset.tab as 'play' | 'api' | 'session')));
  bindPlay(); bindApi(); bindSession();
}

function playHtml() {
  const state = turn?.state;
  return `<section class="card status-grid"><div class="pill">플레이어 HP ${state?.player.hp ?? '40/40'} · MP ${state?.player.mp ?? '25/25'}</div><div class="pill">적 HP ${state?.enemy?.hp ?? '20/20'} · ${state?.enemy?.condition ?? 'normal'}</div></section>
  <section class="card narration">${turn?.narration.text ?? '낯선 그림자가 앞을 가로막는다. 무엇을 할까?'}</section>
  <section class="card choices">${choices().map((choice: string) => `<button data-choice="${choice}">${choice}</button>`).join('')}</section>
  <form class="card form-stack" id="turn-form"><label>자연어 입력<input id="turn-text" placeholder="예: 낫을 휘두른다" /></label><button type="submit">보내기</button></form>`;
}

function apiHtml() {
  return `<form class="card form-stack" id="api-form"><label>Provider<select id="provider"><option value="none">API 사용 안 함</option><option value="groq">Groq</option><option value="gemini">Gemini</option><option value="openrouter">OpenRouter</option><option value="customOpenAI">Custom OpenAI-compatible</option></select></label><label>API Key<input id="api-key" type="password" autocomplete="off" /></label><label>모델<input id="model" /></label><label>endpoint<input id="endpoint" /></label><label>저장 방식<select id="persistence"><option value="sessionOnly">이번 접속에서만 사용</option><option value="deviceIndexedDb">이 기기에 저장</option><option value="deviceIndexedDbEncrypted">암호화 저장</option></select></label><label>PIN/passphrase<input id="passphrase" type="password" /></label><p class="warning">${publicDeviceWarning} 암호화 저장은 PIN/passphrase를 저장하지 않습니다.</p><button type="submit">API Key 테스트/저장</button><button class="danger" type="button" id="delete-key">API Key 삭제</button></form>`;
}

function sessionHtml() { return `<section class="card session-actions"><button id="new-game">새 게임</button><button id="continue-game" class="secondary">이어하기</button><button id="delete-save" class="danger">저장 삭제</button></section>`; }
function bindPlay() { app.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach((b) => b.addEventListener('click', () => submit(b.dataset.choice ?? '/attack'))); app.querySelector<HTMLFormElement>('#turn-form')?.addEventListener('submit', (e) => { e.preventDefault(); const text = app.querySelector<HTMLInputElement>('#turn-text')?.value.trim(); if (text) void submit(text); }); }
function bindApi() { app.querySelector<HTMLFormElement>('#api-form')?.addEventListener('submit', async (e) => { e.preventDefault(); const provider = app.querySelector<HTMLSelectElement>('#provider')?.value; settings = { ...settings, apiEnabled: provider !== 'none', provider: provider === 'none' ? 'groq' : provider as RuntimeApiSettings['provider'], model: app.querySelector<HTMLInputElement>('#model')?.value || undefined, endpoint: app.querySelector<HTMLInputElement>('#endpoint')?.value || undefined, apiKeyPersistence: app.querySelector<HTMLSelectElement>('#persistence')?.value as RuntimeApiSettings['apiKeyPersistence'], passphrase: app.querySelector<HTMLInputElement>('#passphrase')?.value || undefined }; const key = app.querySelector<HTMLInputElement>('#api-key')?.value ?? ''; if (settings.apiEnabled && key) await persistApiKey(settings.provider, key, settings.apiKeyPersistence, settings.passphrase); alert('저장되었습니다. 실제 provider 테스트는 브라우저 CORS 정책에 따라 실패할 수 있습니다.'); }); app.querySelector<HTMLButtonElement>('#delete-key')?.addEventListener('click', async () => { await removeApiKey(settings.provider); alert('삭제되었습니다.'); }); }
function bindSession() { app.querySelector<HTMLButtonElement>('#new-game')?.addEventListener('click', () => { sessionId = `pwa-${Date.now()}`; turn = null; render('play'); }); app.querySelector<HTMLButtonElement>('#continue-game')?.addEventListener('click', () => render('play')); app.querySelector<HTMLButtonElement>('#delete-save')?.addEventListener('click', async () => { await deleteClientSession(sessionId); turn = null; render('play'); }); }

if ('serviceWorker' in navigator) void navigator.serviceWorker.register('/service-worker.js');
render();
