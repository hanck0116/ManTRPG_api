import type { StatKey } from './stats.js';

export interface Equipment {
  id: string;
  name: string;
  slot: 'main_weapon' | 'off_hand' | 'armor' | 'trinket';
  attackBonus?: number;
  defenseBonus?: number;
  statBonus?: Partial<Record<StatKey, number>>;
  tags: string[];
}

export const equipmentCatalog: Record<string, Equipment> = {
  EQ_WEAPON_SCYTHE_BASIC: {
    id: 'EQ_WEAPON_SCYTHE_BASIC',
    name: '낫',
    slot: 'main_weapon',
    attackBonus: 2,
    tags: ['physical', 'slash'],
  },
  EQ_ARMOR_TRAVELER_COAT: {
    id: 'EQ_ARMOR_TRAVELER_COAT',
    name: '여행자의 코트',
    slot: 'armor',
    defenseBonus: 1,
    tags: ['light_armor'],
  },
};
