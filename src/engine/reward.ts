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

  session.player.coins += 8;
  session.player.inventory.IT_HERB_SMALL = (session.player.inventory.IT_HERB_SMALL ?? 0) + 1;
  return { coins: 8, items: { IT_HERB_SMALL: 1 }, tags: ['reward', 'combat_end'] };
}
