import { apiSettingsHtml } from './apiSettingsView.js';
import { playHtml } from './playView.js';
import { sessionHtml } from './sessionView.js';
import type { AppTab, ClientUiState } from './uiState.js';

export function renderApp(state: ClientUiState, tab: AppTab = 'play'): string {
  return `<section class="card header"><strong>ManTRPG</strong><div class="tabs"><button class="secondary" data-tab="play">플레이</button><button class="secondary" data-tab="api">API</button><button class="secondary" data-tab="session">세션</button></div></section>
    ${tab === 'play' ? playHtml(state) : tab === 'api' ? apiSettingsHtml(state) : sessionHtml()}`;
}
