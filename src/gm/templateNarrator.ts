import type { EnemyDecision, EngineResult, NarrationResult, ParsedAction } from '../api/schemas.js';
import type { MinimalApiState } from '../state/sessionState.js';

export interface NarrateTurnInput { action: ParsedAction; playerResult: EngineResult; enemyDecision: EnemyDecision | null; enemyResult: EngineResult | null; state: MinimalApiState; }

const methodTone = (action: ParsedAction): string => {
  if (action.method?.includes('command')) return '짧은 명령처럼 움직임이 이어지고,';
  if (action.method?.includes('candidate_id_match')) return '익숙한 수를 골라,';
  if (action.method?.includes('magic') || action.intent === 'magic') return '손끝에 작은 불빛을 모아,';
  if (action.method?.includes('defend') || action.intent === 'defend') return '호흡을 낮추고,';
  return '망설임을 누르고,';
};

const playerLine = (action: ParsedAction, result: EngineResult): string => {
  if (result.result === 'blocked') return `행동이 막혔다: ${result.messageHint}.`;
  if (result.messageHint === 'player_defends') return `${methodTone(action)} 당신은 빈틈을 줄인 채 버틴다.`;
  if (result.healing > 0) return `${methodTone(action)} ${result.healing}만큼 체력을 되찾았다.`;
  if (result.damage > 0) return `${methodTone(action)} 적에게 ${result.damage} 피해를 남긴다.`;
  if (result.result === 'fail') return `${methodTone(action)} 시도했지만 적은 간발의 차로 버텨낸다.`;
  return `${methodTone(action)} 행동을 마무리한다.`;
};

const enemyLine = (result: EngineResult | null): string | null => {
  if (!result) return null;
  if (result.result === 'blocked') return `적은 바로 움직이지 못한다: ${result.messageHint}.`;
  if (result.damage > 0) return `곧장 이어진 반격에 당신은 ${result.damage} 피해를 입는다.`;
  return '적의 반격은 옷깃을 스칠 뿐이다.';
};

export function narrateTurn(input: NarrateTurnInput): NarrationResult {
  const lines = [playerLine(input.action, input.playerResult)];
  const enemy = enemyLine(input.enemyResult);
  if (enemy) lines.push(enemy);
  if (input.playerResult.battleEnded || input.enemyResult?.battleEnded) lines.push(input.state.player.condition === 'down' ? '전투가 패배로 끝났다.' : '눈앞의 적은 더 움직이지 않는다.');
  else if (input.playerResult.result === 'blocked') lines.push('다른 짧은 행동을 고를 수 있다.');

  const choices = input.playerResult.battleEnded || input.enemyResult?.battleEnded
    ? ['상태를 확인한다', '전리품을 살핀다', '휴식한다']
    : input.playerResult.result === 'blocked'
      ? ['공격한다', '방어한다', '상황을 살핀다']
      : ['공격한다', '기술을 쓴다', '방어한다'];

  return { text: lines.slice(0, 3).join(' '), choices: choices.slice(0, 3) };
}
