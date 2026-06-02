import type { RollMode } from './dice.js';
import { rollD20, type RollResult } from './dice.js';
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
  mode?: RollMode;
  rng?: () => number;
}

export interface JudgmentResult {
  ok: boolean;
  result: 'success' | 'fail' | 'partial' | 'blocked';
  roll: RollResult;
  target: number;
  modifier: number;
  tags: string[];
}

export function judgeAction(input: JudgmentInput): JudgmentResult {
  const stat = input.stat ?? (input.action.intent === 'magic' ? 'mind' : 'strength');
  const statBonus = input.player.stats[stat] ?? 0;
  const equipmentBonus = input.action.intent === 'attack' || input.action.intent === 'skill' ? getEquipmentAttackBonus(input.player) : 0;
  const modifier = statBonus + equipmentBonus + (input.modifier ?? 0);
  const target = input.target ?? input.enemy.target;
  const roll = rollD20({ modifier, mode: input.mode, rng: input.rng });
  const success = roll.total >= target;

  return {
    ok: true,
    result: success ? 'success' : 'fail',
    roll,
    target,
    modifier,
    tags: [success ? 'success' : 'fail', input.action.intent, stat],
  };
}
