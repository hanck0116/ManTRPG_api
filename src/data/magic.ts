export interface MagicDefinition {
  id: string;
  name: string;
  costMp: number;
  target: number;
  power: number;
  tags: string[];
}

export const magicCatalog: Record<string, MagicDefinition> = {
  MG_EMBER_01: {
    id: 'MG_EMBER_01',
    name: '작은 불씨',
    costMp: 4,
    target: 60,
    power: 7,
    tags: ['magic', 'fire'],
  },
};
