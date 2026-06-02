export interface SkillDefinition {
  id: string;
  name: string;
  costMp: number;
  targetModifier: number;
  damageMultiplier: number;
  tags: string[];
}

export const skillCatalog: Record<string, SkillDefinition> = {
  SK_REAPING_ARC: {
    id: 'SK_REAPING_ARC',
    name: '수확의 호',
    costMp: 3,
    targetModifier: 5,
    damageMultiplier: 1.5,
    tags: ['physical', 'slash', 'skill'],
  },
};
