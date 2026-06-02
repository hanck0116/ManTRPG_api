import type { StatKey } from './stats.js';

export interface EquipmentDefinition {
  id: string;
  name: string;
  slot: 'main_weapon' | 'off_hand' | 'armor' | 'trinket';
  attackBonus?: number;
  defenseBonus?: number;
  statBonus?: Partial<Record<StatKey, number>>;
  tags: string[];
}

export interface SkillDefinition {
  id: string;
  name: string;
  costMp: number;
  targetModifier: number;
  damageMultiplier: number;
  tags: string[];
}

export interface MagicDefinition {
  id: string;
  name: string;
  costMp: number;
  target: number;
  power: number;
  tags: string[];
}

export interface ItemDefinition {
  id: string;
  name: string;
  kind: 'consumable' | 'material' | 'treasure';
  healHp?: number;
  restoreMp?: number;
  price?: number;
  tags: string[];
}

export interface EnemyTemplate {
  id: string;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  target: number;
  tags: string[];
}

export interface RewardTableEntry {
  id: string;
  label: string;
  coins?: number;
  itemId?: string;
  itemCount?: number;
  minAppearance?: number;
  tags: string[];
}

export interface TraitDefinition {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

export interface TechniqueDefinition {
  id: string;
  name: string;
  description: string;
  prerequisiteIds: string[];
  tags: string[];
}
