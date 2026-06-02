import { rewardCatalog } from '../data/catalogIndex.js';
import type { RewardTableEntry } from '../data/catalogTypes.js';
import type { SessionState } from '../state/sessionState.js';

export interface RewardResult {
  coins: number;
  items: Record<string, number>;
  tags: string[];
}

export interface RewardCandidate extends RewardTableEntry {
  coins: number;
  itemCount: number;
}

export function calculateRewardOfferByAppearance(appearance: number): RewardResult {
  const appearanceBonus = Math.max(0, Math.floor((appearance - 50) / 20));
  return { coins: 8 + appearanceBonus, items: { IT_HERB_SMALL: 1 }, tags: ['reward', 'combat_end', 'appearance_scaled', 'temporary_reward'] };
}

export function createRewardCandidates(session: SessionState): RewardCandidate[] {
  const offer = calculateRewardOfferByAppearance(session.player.stats.appearance);
  return Object.values(rewardCatalog)
    .filter((entry) => entry.minAppearance === undefined || session.player.stats.appearance >= entry.minAppearance)
    .map((entry) => ({
      ...entry,
      coins: entry.id === 'RW_COIN_SMALL' ? offer.coins : entry.coins ?? 0,
      itemCount: entry.itemCount ?? 0,
    }));
}

export function applySelectedReward(session: SessionState, rewardId: string): RewardResult {
  const candidate = createRewardCandidates(session).find((entry) => entry.id === rewardId);
  if (!candidate) return { coins: 0, items: {}, tags: ['blocked', 'reward_not_found'] };

  const items: Record<string, number> = {};
  if (candidate.coins > 0) session.player.coins += candidate.coins;
  if (candidate.itemId && candidate.itemCount > 0) {
    session.player.inventory[candidate.itemId] = (session.player.inventory[candidate.itemId] ?? 0) + candidate.itemCount;
    items[candidate.itemId] = candidate.itemCount;
  }
  return { coins: candidate.coins, items, tags: candidate.tags };
}

/** @deprecated Temporary fallback until the full V18 reward table is migrated. Use createRewardCandidates/applySelectedReward for V18-shaped reward flows. */
export function grantCombatReward(session: SessionState): RewardResult {
  if (session.enemy && session.enemy.condition !== 'defeated') {
    return { coins: 0, items: {}, tags: ['blocked', 'enemy_alive'] };
  }

  const offer = calculateRewardOfferByAppearance(session.player.stats.appearance);
  session.player.coins += offer.coins;
  for (const [itemId, count] of Object.entries(offer.items)) {
    session.player.inventory[itemId] = (session.player.inventory[itemId] ?? 0) + count;
  }
  return offer;
}
