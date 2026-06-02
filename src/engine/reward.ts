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
  session.player.inventory.herb_small = (session.player.inventory.herb_small ?? 0) + 1;
  return { coins: 8, items: { herb_small: 1 }, tags: ['reward', 'combat_end'] };
}
