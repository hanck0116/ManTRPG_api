import type { TurnResult } from '../api/routes.js';
import type { ClientUiState } from './uiState.js';
import { capChoices } from './uiHelpers.js';

const choices = (turn: TurnResult | null) => capChoices(turn?.narration.choices ?? ['/attack', '/defend', '/item IT_HERB_SMALL']);

function usageHtml(turn: TurnResult | null): string {
  const usage = turn?.llm.usageEstimate;
  if (!usage) {
    const reason = turn?.llm.skippedReason ? `<p class="muted">LLM: ${turn.llm.skippedReason}</p>` : '<p class="muted">LLM: 이번 턴 API 사용 없음</p>';
    return `<section class="card usage">${reason}</section>`;
  }
  return `<section class="card usage"><strong>API 사용량 추정</strong><p>${usage.provider} · ${usage.model}</p><p>prompt ${usage.promptTokens} / completion ${usage.completionTokens} tokens</p><p class="muted">실제 비용은 플레이어가 입력한 provider API Key 계정 정책에 따릅니다.</p></section>`;
}

export function playHtml(state: ClientUiState): string {
  const turn = state.turn;
  const apiMode = state.settings.apiEnabled ? 'API 선택 기능 켜짐' : '오프라인 템플릿 모드';
  const snapshot = turn?.state;
  return `<section class="card status-grid"><div class="pill">플레이어 HP ${snapshot?.player.hp ?? '40/40'} · MP ${snapshot?.player.mp ?? '25/25'}</div><div class="pill">적의 기척: ${snapshot?.enemy?.hint ?? '위협적인 기척'}</div><div class="pill">${apiMode}</div></section>
  <section class="card narration">${turn?.narration.text ?? '낯선 그림자가 앞을 가로막는다. 무엇을 할까?'}</section>
  ${usageHtml(turn)}
  <section class="card choices">${choices(turn).map((choice: string) => `<button data-choice="${choice}">${choice}</button>`).join('')}</section>
  <form class="card form-stack" id="turn-form"><label>자연어 입력<input id="turn-text" placeholder="예: 낫을 휘두른다" /></label><button type="submit">보내기</button></form>`;
}
