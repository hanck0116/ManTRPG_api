import { equipmentCatalog } from '../data/equipment.js';
import { basePlayerStats, type Stats } from '../data/stats.js';

export interface PlayerState {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  stats: Stats;
  equipment: {
    main_weapon: string | null;
    off_hand: string | null;
    armor: string | null;
    trinket: string | null;
  };
  skills: string[];
  magic: string[];
  inventory: Record<string, number>;
  coins: number;
  condition: 'normal' | 'wounded' | 'exhausted' | 'down';
}

export interface PlayerSummary {
  hp: string;
  mp: string;
  weapon: string;
  condition: PlayerState['condition'];
}

export function createDefaultPlayerState(): PlayerState {
  return {
    id: 'player',
    name: '하르벤',
    hp: 40,
    maxHp: 40,
    mp: 25,
    maxMp: 25,
    stats: { ...basePlayerStats },
    equipment: {
      main_weapon: 'EQ_WEAPON_SCYTHE_BASIC',
      off_hand: null,
      armor: 'EQ_ARMOR_TRAVELER_COAT',
      trinket: null,
    },
    skills: ['SK_REAPING_ARC'],
    magic: ['MG_EMBER_01'],
    inventory: { IT_HERB_SMALL: 1 },
    coins: 0,
    condition: 'normal',
  };
}

export function summarizePlayer(player: PlayerState): PlayerSummary {
  const weapon = player.equipment.main_weapon ? equipmentCatalog[player.equipment.main_weapon]?.name ?? player.equipment.main_weapon : '맨손';

  return {
    hp: `${player.hp}/${player.maxHp}`,
    mp: `${player.mp}/${player.maxMp}`,
    weapon,
    condition: player.condition,
  };
}
