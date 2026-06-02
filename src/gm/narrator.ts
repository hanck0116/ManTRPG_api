import type { EnemyDecision, EngineResult, NarrationResult, ParsedAction } from '../api/schemas.js';
import type { MinimalApiState } from '../state/sessionState.js';

export interface NarrateTurnInput {
  action: ParsedAction;
  playerResult: EngineResult;
  enemyDecision: EnemyDecision | null;
  enemyResult: EngineResult | null;
  state: MinimalApiState;
}

const playerLine = (result: EngineResult): string => {
  if (result.result === 'blocked') return `행동이 막혔다: ${result.messageHint}.`;
  if (result.messageHint === 'player_defends') return '당신은 자세를 낮추고 다음 충돌에 대비한다.';
  if (result.damage > 0) return `당신의 행동이 적중해 적에게 ${result.damage} 피해를 준다.`;
  if (result.result === 'fail') return '시도는 빗나가고 적은 버텨낸다.';
  return '행동은 조용히 처리된다.';
};

const enemyLine = (result: EngineResult | null): string | null => {
  if (!result) return null;
  if (result.result === 'blocked') return `적은 행동하지 못한다: ${result.messageHint}.`;
  if (result.damage > 0) return `적의 반격으로 당신은 ${result.damage} 피해를 입는다.`;
  return '적의 반격은 결정적인 피해를 내지 못한다.';
};

export function narrateTurn(input: NarrateTurnInput): NarrationResult {
  const lines = [playerLine(input.playerResult)];
  const enemy = enemyLine(input.enemyResult);
  if (enemy) lines.push(enemy);

  if (input.playerResult.battleEnded || input.enemyResult?.battleEnded) {
    lines.push(input.state.player.condition === 'down' ? '전투가 패배로 끝났다.' : '전투가 끝났다.');
  } else if (input.playerResult.result === 'blocked') {
    lines.push('다른 짧은 행동을 고를 수 있다.');
  } else {
    lines.push('숨을 고를 틈은 짧다.');
  }

  const choices = input.playerResult.battleEnded || input.enemyResult?.battleEnded
    ? ['상태를 확인한다', '전리품을 살핀다', '휴식한다']
    : input.playerResult.result === 'blocked'
      ? ['공격한다', '방어한다', '상황을 살핀다']
      : ['공격한다', '기술을 쓴다', '방어한다'];

  return {
    text: lines.slice(0, 4).join(' '),
    choices: choices.slice(0, 3),
  };
}
