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
  IT_HERB_SMALL: {
    id: 'IT_HERB_SMALL',
    name: '작은 약초',
    kind: 'consumable',
    healHp: 6,
    price: 5,
    tags: ['healing'],
  },
};
