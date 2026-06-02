export interface EnemyTemplate {
  id: string;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  target: number;
  tags: string[];
}

export const enemyCatalog: Record<string, EnemyTemplate> = {
  stray_shadow: {
    id: 'stray_shadow',
    name: '떠도는 그림자',
    hp: 20,
    attack: 5,
    defense: 1,
    target: 14,
    tags: ['single_enemy', 'normal'],
  },
};
