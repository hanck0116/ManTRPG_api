import { magicCatalog, type MagicDefinition } from '../data/magic.js';
import type { PlayerState } from '../state/playerState.js';

export function getMagic(magicId: string): MagicDefinition | undefined {
  return magicCatalog[magicId];
}

export function canCastMagic(player: PlayerState, magicId: string): { ok: boolean; reason?: string; magic?: MagicDefinition } {
  const magic = getMagic(magicId);
  if (!magic || !player.magic.includes(magicId)) return { ok: false, reason: 'unknown_magic' };
  if (player.mp < magic.costMp) return { ok: false, reason: 'not_enough_mp', magic };
  return { ok: true, magic };
}

export function spendMagicCost(player: PlayerState, magic: MagicDefinition): void {
  player.mp = Math.max(0, player.mp - magic.costMp);
}
