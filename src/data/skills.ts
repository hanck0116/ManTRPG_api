export interface SkillDefinition {
  id: string;
  name: string;
  costMp: number;
  targetModifier: number;
  damageMultiplier: number;
  tags: string[];
}

export const skillCatalog: Record<string, SkillDefinition> = {
  reaping_arc: {
    id: 'reaping_arc',
    name: '수확의 호',
    costMp: 3,
    targetModifier: -1,
    damageMultiplier: 1.5,
    tags: ['physical', 'slash', 'skill'],
  },
};
