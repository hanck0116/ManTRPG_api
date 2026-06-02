export interface ItemDefinition {
  id: string;
  name: string;
  kind: 'consumable' | 'material' | 'treasure';
  healHp?: number;
  restoreMp?: number;
  price?: number;
  tags: string[];
}

export const itemCatalog: Record<string, ItemDefinition> = {
  herb_small: {
    id: 'herb_small',
    name: '작은 약초',
    kind: 'consumable',
    healHp: 6,
    price: 5,
    tags: ['healing'],
  },
};
