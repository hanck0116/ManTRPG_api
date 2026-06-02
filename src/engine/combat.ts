import type { SkillDefinition } from '../data/skills.js';
import type { MagicDefinition } from '../data/magic.js';
import type { CheckResult } from './dice.js';
import type { ParsedAction } from './judgment.js';
import { judgeAction } from './judgment.js';
import { getEquipmentAttackBonus, getEquipmentDefenseBonus, useItem } from './inventory.js';
import { canUseSkill, spendSkillCost } from './skills.js';
import { canCastMagic, spendMagicCost } from './magic.js';
import type { PlayerState } from '../state/playerState.js';
import type { EnemyState, Scene, SessionState } from '../state/sessionState.js';

export interface EngineResult {
  ok: boolean;
  scene: Scene;
  result: 'success' | 'fail' | 'partial' | 'blocked';
  check: CheckResult | null;
  roll: number | null;
  baseTarget: number | null;
  effectiveTarget: number | null;
  grade: CheckResult['grade'] | null;
  success: boolean;
  damage: number;
  healing: number;
  playerHp: number;
  playerMp: number;
  enemyHp: number | null;
  battleEnded: boolean;
  tags: string[];
  messageHint: string;
}

const clampEnemy = (enemy: EnemyState): void => {
  enemy.currentHp = Math.max(0, Math.min(enemy.hp, enemy.currentHp));
  enemy.condition = enemy.currentHp <= 0 ? 'defeated' : enemy.currentHp <= Math.floor(enemy.hp / 2) ? 'wounded' : 'normal';
};

const updatePlayerCondition = (player: PlayerState): void => {
  player.condition = player.hp <= 0 ? 'down' : player.hp <= Math.floor(player.maxHp / 2) ? 'wounded' : player.mp <= 0 ? 'exhausted' : 'normal';
};

const baseDamage = (player: PlayerState, enemy: EnemyState): number => Math.max(1, Math.floor(player.stats.strength / 20) + getEquipmentAttackBonus(player) - enemy.defense);

function blocked(session: SessionState, reason: string): EngineResult {
  return {
    ok: false,
    scene: session.scene,
    result: 'blocked',
    check: null,
    roll: null,
    baseTarget: null,
    effectiveTarget: null,
    grade: null,
    success: false,
    damage: 0,
    healing: 0,
    playerHp: session.player.hp,
    playerMp: session.player.mp,
    enemyHp: session.enemy?.currentHp ?? null,
    battleEnded: session.player.condition === 'down' || session.enemy?.condition === 'defeated',
    tags: ['blocked', reason],
    messageHint: reason,
  };
}

function applyPlayerHit(session: SessionState, action: ParsedAction, damage: number, extraTags: string[], targetOverride?: number, modifier = 0, rng?: () => number): EngineResult {
  if (!session.enemy) return blocked(session, 'enemy_missing');
  if (session.enemy.condition === 'defeated') return blocked(session, 'battle_already_ended');
  if (session.player.condition === 'down') return blocked(session, 'player_down');

  const judgment = judgeAction({ action, player: session.player, enemy: session.enemy, target: targetOverride, modifier, rng });
  if (!judgment.ok || !judgment.check) return blocked(session, judgment.result);

  const dealt = judgment.success ? damage : 0;
  session.enemy.currentHp -= dealt;
  clampEnemy(session.enemy);
  const battleEnded = session.enemy.currentHp <= 0;
  session.logSummary.push(`${action.intent}:${judgment.result}:${dealt}`);

  return {
    ok: true,
    scene: session.scene,
    result: judgment.success ? 'success' : 'fail',
    check: judgment.check,
    roll: judgment.roll,
    baseTarget: judgment.baseTarget,
    effectiveTarget: judgment.effectiveTarget,
    grade: judgment.grade,
    success: judgment.success,
    damage: dealt,
    healing: 0,
    playerHp: session.player.hp,
    playerMp: session.player.mp,
    enemyHp: session.enemy.currentHp,
    battleEnded,
    tags: [...judgment.tags, ...extraTags, ...(dealt > 0 ? ['hit'] : []), ...(battleEnded ? ['battle_end'] : [])],
    messageHint: dealt > 0 ? 'player_hit_enemy' : 'player_attack_missed',
  };
}

export function playerAttack(session: SessionState, action: ParsedAction, rng?: () => number): EngineResult {
  if (!session.enemy) return blocked(session, 'enemy_missing');
  return applyPlayerHit(session, action, baseDamage(session.player, session.enemy), ['physical'], undefined, 0, rng);
}

export function playerSkill(session: SessionState, action: ParsedAction, rng?: () => number): EngineResult {
  if (!session.enemy) return blocked(session, 'enemy_missing');
  if (!action.skillId) return blocked(session, 'skill_id_missing');
  const availability = canUseSkill(session.player, action.skillId);
  if (!availability.ok || !availability.skill) return blocked(session, availability.reason ?? 'skill_unavailable');

  const skill: SkillDefinition = availability.skill;
  spendSkillCost(session.player, skill);
  const damage = Math.ceil(baseDamage(session.player, session.enemy) * skill.damageMultiplier);
  return applyPlayerHit(session, action, damage, skill.tags, undefined, skill.targetModifier, rng);
}

export function playerMagic(session: SessionState, action: ParsedAction, rng?: () => number): EngineResult {
  if (!session.enemy) return blocked(session, 'enemy_missing');
  if (!action.magicId) return blocked(session, 'magic_id_missing');
  const availability = canCastMagic(session.player, action.magicId);
  if (!availability.ok || !availability.magic) return blocked(session, availability.reason ?? 'magic_unavailable');

  const magic: MagicDefinition = availability.magic;
  spendMagicCost(session.player, magic);
  return applyPlayerHit(session, action, magic.power, magic.tags, magic.target, 0, rng);
}


export function playerItem(session: SessionState, action: ParsedAction): EngineResult {
  if (!action.itemId) return blocked(session, 'item_id_missing');
  if (session.player.condition === 'down') return blocked(session, 'player_down');

  const outcome = useItem(session.player, action.itemId);
  if (!outcome.ok) return blocked(session, outcome.tags.at(-1) ?? 'item_unavailable');
  updatePlayerCondition(session.player);
  session.logSummary.push(`item:success:${outcome.healing}`);

  return {
    ok: true,
    scene: session.scene,
    result: 'success',
    check: null,
    roll: null,
    baseTarget: null,
    effectiveTarget: null,
    grade: null,
    success: true,
    damage: 0,
    healing: outcome.healing,
    playerHp: session.player.hp,
    playerMp: session.player.mp,
    enemyHp: session.enemy?.currentHp ?? null,
    battleEnded: session.enemy?.condition === 'defeated' || session.player.hp <= 0,
    tags: outcome.tags,
    messageHint: 'player_used_item',
  };
}

export function enemyAttack(session: SessionState, rng?: () => number): EngineResult {
  if (!session.enemy) return blocked(session, 'enemy_missing');
  if (session.enemy.condition === 'defeated') return blocked(session, 'enemy_defeated');
  if (session.player.condition === 'down') return blocked(session, 'player_down');

  const action: ParsedAction = { intent: 'attack', target: 'self', skillId: null, magicId: null, itemId: null, method: 'enemy_basic_attack', rawText: 'enemy attack' };
  const judgment = judgeAction({ action, player: session.player, enemy: session.enemy, stat: 'agility', rng });
  if (!judgment.ok || !judgment.check) return blocked(session, judgment.result);

  const damage = judgment.success ? Math.max(1, session.enemy.attack - getEquipmentDefenseBonus(session.player)) : 0;
  session.player.hp = Math.max(0, session.player.hp - damage);
  updatePlayerCondition(session.player);
  const battleEnded = session.player.hp <= 0;
  session.logSummary.push(`enemy:${judgment.result}:${damage}`);

  return {
    ok: true,
    scene: session.scene,
    result: judgment.success ? 'success' : 'fail',
    check: judgment.check,
    roll: judgment.roll,
    baseTarget: judgment.baseTarget,
    effectiveTarget: judgment.effectiveTarget,
    grade: judgment.grade,
    success: judgment.success,
    damage,
    healing: 0,
    playerHp: session.player.hp,
    playerMp: session.player.mp,
    enemyHp: session.enemy.currentHp,
    battleEnded,
    tags: [judgment.success ? 'success' : 'fail', judgment.grade ?? 'fail', 'enemy_action', 'physical', ...(battleEnded ? ['battle_end'] : [])],
    messageHint: damage > 0 ? 'enemy_hit_player' : 'enemy_missed',
  };
}

export function defend(session: SessionState): EngineResult {
  session.logSummary.push('player:defend');
  return {
    ok: true,
    scene: session.scene,
    result: 'success',
    check: null,
    roll: null,
    baseTarget: null,
    effectiveTarget: null,
    grade: null,
    success: true,
    damage: 0,
    healing: 0,
    playerHp: session.player.hp,
    playerMp: session.player.mp,
    enemyHp: session.enemy?.currentHp ?? null,
    battleEnded: session.enemy?.condition === 'defeated' || session.player.condition === 'down',
    tags: ['defend', 'guard'],
    messageHint: 'player_defends',
  };
}

export function blockedAction(session: SessionState, reason: string): EngineResult {
  return blocked(session, reason);
}
