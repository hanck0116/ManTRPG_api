import type { SessionState } from '../state/sessionState.js';

export interface RewardResult {
  coins: number;
  items: Record<string, number>;
  tags: string[];
}

export function grantCombatReward(session: SessionState): RewardResult {
  if (session.enemy && session.enemy.condition !== 'defeated') {
    return { coins: 0, items: {}, tags: ['blocked', 'enemy_alive'] };
  }

  const appearanceBonus = Math.max(0, Math.floor((session.player.stats.appearance - 50) / 20));
  const coins = 8 + appearanceBonus;
  session.player.coins += coins;
  session.player.inventory.IT_HERB_SMALL = (session.player.inventory.IT_HERB_SMALL ?? 0) + 1;
  return { coins, items: { IT_HERB_SMALL: 1 }, tags: ['reward', 'combat_end', 'appearance_scaled'] };
}
