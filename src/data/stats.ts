export type StatKey = 'strength' | 'agility' | 'mind' | 'will' | 'endurance';

export type Stats = Record<StatKey, number>;

export const basePlayerStats: Stats = {
  strength: 3,
  agility: 3,
  mind: 2,
  will: 2,
  endurance: 3,
};
