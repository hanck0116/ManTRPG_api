import { equipmentCatalog, type Equipment } from '../data/equipment.js';
import { itemCatalog } from '../data/items.js';
import type { PlayerState } from '../state/playerState.js';

export function getEquippedItems(player: PlayerState): Equipment[] {
  return Object.values(player.equipment)
    .filter((id): id is string => Boolean(id))
    .map((id) => equipmentCatalog[id])
    .filter((item): item is Equipment => Boolean(item));
}

export function getEquipmentAttackBonus(player: PlayerState): number {
  return getEquippedItems(player).reduce((sum, item) => sum + (item.attackBonus ?? 0), 0);
}

export function getEquipmentDefenseBonus(player: PlayerState): number {
  return getEquippedItems(player).reduce((sum, item) => sum + (item.defenseBonus ?? 0), 0);
}

export function useItem(player: PlayerState, itemId: string): { ok: boolean; healing: number; restoredMp: number; tags: string[] } {
  const item = itemCatalog[itemId];
  if (!item || (player.inventory[itemId] ?? 0) <= 0 || item.kind !== 'consumable') {
    return { ok: false, healing: 0, restoredMp: 0, tags: ['blocked', 'item_unavailable'] };
  }

  player.inventory[itemId] -= 1;
  const beforeHp = player.hp;
  const beforeMp = player.mp;
  player.hp = Math.min(player.maxHp, player.hp + (item.healHp ?? 0));
  player.mp = Math.min(player.maxMp, player.mp + (item.restoreMp ?? 0));

  return { ok: true, healing: player.hp - beforeHp, restoredMp: player.mp - beforeMp, tags: ['item', ...item.tags] };
}
