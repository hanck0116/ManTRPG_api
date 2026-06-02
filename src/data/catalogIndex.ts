export { equipmentCatalog } from './equipment.js';
export { skillCatalog } from './skills.js';
export { magicCatalog } from './magic.js';
export { itemCatalog } from './items.js';
export { enemyCatalog } from './enemies.js';
import type { RewardTableEntry } from './catalogTypes.js';

export const rewardCatalog: Record<string, RewardTableEntry> = {
  RW_COIN_SMALL: { id: 'RW_COIN_SMALL', label: '소량의 코인', coins: 8, tags: ['reward', 'combat_end', 'fallback'] },
  RW_HERB_SMALL: { id: 'RW_HERB_SMALL', label: '작은 약초', itemId: 'IT_HERB_SMALL', itemCount: 1, tags: ['reward', 'item', 'fallback'] },
  RW_APPEARANCE_BONUS: { id: 'RW_APPEARANCE_BONUS', label: '외모 기반 교섭 보너스', coins: 1, minAppearance: 70, tags: ['reward', 'appearance_scaled', 'fallback'] },
};
