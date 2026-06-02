import { skillCatalog, type SkillDefinition } from '../data/skills.js';
import type { PlayerState } from '../state/playerState.js';

export function getSkill(skillId: string): SkillDefinition | undefined {
  return skillCatalog[skillId];
}

export function canUseSkill(player: PlayerState, skillId: string): { ok: boolean; reason?: string; skill?: SkillDefinition } {
  const skill = getSkill(skillId);
  if (!skill || !player.skills.includes(skillId)) return { ok: false, reason: 'unknown_skill' };
  if (player.mp < skill.costMp) return { ok: false, reason: 'not_enough_mp', skill };
  return { ok: true, skill };
}

export function spendSkillCost(player: PlayerState, skill: SkillDefinition): void {
  player.mp = Math.max(0, player.mp - skill.costMp);
}
