import type { TurnResult } from '../api/routes.js';
import { defaultRuntimeApiSettings, type RuntimeApiSettings } from './apiKeySettings.js';

export type AppTab = 'play' | 'api' | 'session';

export interface ClientUiState {
  sessionId: string;
  turn: TurnResult | null;
  settings: RuntimeApiSettings;
  apiStatus: string;
  apiBusy: boolean;
}

export const uiState: ClientUiState = {
  sessionId: 'pwa-demo',
  turn: null,
  settings: { ...defaultRuntimeApiSettings },
  apiStatus: 'API는 선택 기능입니다. 일반 전투는 API를 사용하지 않습니다.',
  apiBusy: false,
};

export function resetSessionState(sessionId = `pwa-${Date.now()}`): void {
  uiState.sessionId = sessionId;
  uiState.turn = null;
}
