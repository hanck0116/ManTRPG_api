export type V18StatKey = 'strength' | 'agility' | 'constitution' | 'intelligence' | 'wisdom' | 'appearance';
export type LegacyStatKey = 'endurance' | 'mind' | 'will';
export type StatKey = V18StatKey | LegacyStatKey;

export type Stats = Record<V18StatKey, number> & Partial<Record<LegacyStatKey, number>>;

export const basePlayerStats: Stats = {
  strength: 60,
  agility: 55,
  constitution: 58,
  intelligence: 45,
  wisdom: 45,
  appearance: 50,
  endurance: 58,
  mind: 45,
  will: 45,
};

export const v18StatLabels: Record<V18StatKey, string> = {
  strength: '힘',
  agility: '민첩',
  constitution: '체력',
  intelligence: '지능',
  wisdom: '지혜',
  appearance: '외모',
};
