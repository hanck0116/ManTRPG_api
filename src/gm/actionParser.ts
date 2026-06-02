import type { PlayerInput } from '../api/schemas.js';
import type { ParsedAction } from '../engine/judgment.js';

const hasAny = (text: string, words: string[]): boolean => words.some((word) => text.includes(word));

export function parseActionLocally(input: PlayerInput): ParsedAction {
  const text = input.text.toLowerCase();
  if (hasAny(text, ['방어', '막', '가드'])) return { intent: 'defend', target: 'self', skillId: null, magicId: null, itemId: null, method: 'guard', rawText: input.text };
  if (hasAny(text, ['수확', '기술', '스킬'])) return { intent: 'skill', target: 'enemy', skillId: 'SK_REAPING_ARC', magicId: null, itemId: null, method: 'skill', rawText: input.text };
  if (hasAny(text, ['불', '마법', '주문'])) return { intent: 'magic', target: 'enemy', skillId: null, magicId: 'MG_EMBER_01', itemId: null, method: 'spell', rawText: input.text };
  if (hasAny(text, ['약초', '회복', '아이템'])) return { intent: 'item', target: 'self', skillId: null, magicId: null, itemId: 'IT_HERB_SMALL', method: 'use_item', rawText: input.text };
  if (hasAny(text, ['공격', '베', '휘둘', '때리', '찌르'])) return { intent: 'attack', target: 'enemy', skillId: null, magicId: null, itemId: null, method: 'basic_attack', rawText: input.text };
  if (hasAny(text, ['대화', '말'])) return { intent: 'talk', target: 'none', skillId: null, magicId: null, itemId: null, method: 'talk', rawText: input.text };
  if (hasAny(text, ['살피', '조사', '관찰'])) return { intent: 'inspect', target: 'none', skillId: null, magicId: null, itemId: null, method: 'inspect', rawText: input.text };
  if (hasAny(text, ['휴식', '쉰'])) return { intent: 'rest', target: 'self', skillId: null, magicId: null, itemId: null, method: 'rest', rawText: input.text };
  return { intent: 'unknown', target: 'none', skillId: null, magicId: null, itemId: null, method: null, rawText: input.text };
}
