export interface MagicDefinition {
  id: string;
  name: string;
  costMp: number;
  target: number;
  power: number;
  tags: string[];
}

export const magicCatalog: Record<string, MagicDefinition> = {
  ember: {
    id: 'ember',
    name: '작은 불씨',
    costMp: 4,
    target: 13,
    power: 7,
    tags: ['magic', 'fire'],
  },
};
