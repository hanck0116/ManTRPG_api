import type { NarrationResult } from '../api/schemas.js';
import type { EngineResult } from '../engine/combat.js';

export function narrateEngineResult(result: EngineResult): NarrationResult {
  const damageText = result.damage > 0 ? ` 피해 ${result.damage}.` : '';
  const text = result.result === 'blocked'
    ? `그 행동은 지금 처리할 수 없다. ${result.messageHint}`
    : result.result === 'success'
      ? `행동이 선명하게 이어진다. ${result.messageHint}.${damageText}`
      : `흐름이 빗나가며 기회가 사라진다. ${result.messageHint}.${damageText}`;

  return {
    text: text.trim(),
    choices: result.battleEnded ? ['상황을 확인한다', '전리품을 챙긴다'] : ['공격한다', '기술을 쓴다', '방어한다'],
  };
}
