import { rollCheck, type CheckResult } from './dice.js';
import { getEquipmentAttackBonus } from './inventory.js';
import type { PlayerState } from '../state/playerState.js';
import type { EnemyState } from '../state/sessionState.js';

export type ActionIntent = 'attack' | 'skill' | 'magic' | 'item' | 'defend' | 'talk' | 'inspect' | 'rest' | 'unknown';

export interface ParsedAction {
  intent: ActionIntent;
  target: 'enemy' | 'self' | 'none';
  skillId: string | null;
  magicId: string | null;
  itemId: string | null;
  method: string | null;
  rawText: string;
}

export interface JudgmentInput {
  action: ParsedAction;
  player: PlayerState;
  enemy: EnemyState;
  target?: number;
  stat?: keyof PlayerState['stats'];
  modifier?: number;
  rng?: () => number;
}

export interface JudgmentResult {
  ok: boolean;
  result: 'success' | 'fail' | 'blocked' | 'unknown_action';
  check: CheckResult | null;
  roll: number | null;
  total: number | null;
  target: number | null;
  modifier: number;
  grade: CheckResult['grade'] | null;
  success: boolean;
  tags: string[];
}

const supportedCheckIntents = new Set<ParsedAction['intent']>(['attack', 'skill', 'magic', 'item', 'defend']);

export function judgeAction(input: JudgmentInput): JudgmentResult {
  if (input.action.intent === 'unknown') {
    return {
      ok: false,
      result: 'unknown_action',
      check: null,
      roll: null,
      total: null,
      target: null,
      modifier: 0,
      grade: null,
      success: false,
      tags: ['blocked', 'unknown_action'],
    };
  }

  if (!supportedCheckIntents.has(input.action.intent)) {
    return {
      ok: false,
      result: 'blocked',
      check: null,
      roll: null,
      total: null,
      target: null,
      modifier: 0,
      grade: null,
      success: false,
      tags: ['blocked', input.action.intent],
    };
  }

  const stat = input.stat ?? (input.action.intent === 'magic' ? 'mind' : input.action.intent === 'defend' ? 'endurance' : 'strength');
  const statBonus = input.player.stats[stat] ?? 0;
  const equipmentBonus = input.action.intent === 'attack' || input.action.intent === 'skill' ? getEquipmentAttackBonus(input.player) : 0;
  const modifier = statBonus + equipmentBonus + (input.modifier ?? 0);
  const target = input.target ?? input.enemy.target;
  const check = rollCheck({ target, modifier, rng: input.rng });

  return {
    ok: true,
    result: check.success ? 'success' : 'fail',
    check,
    roll: check.roll,
    total: check.total,
    target: check.target,
    modifier: check.modifier,
    grade: check.grade,
    success: check.success,
    tags: [check.grade, check.success ? 'success' : 'fail', input.action.intent, stat],
  };
}
