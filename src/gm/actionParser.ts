import type { PlayerInput } from '../api/schemas.js';
import type { ParsedAction } from '../engine/judgment.js';
import type { MinimalApiState } from '../state/sessionState.js';

const makeAction = (partial: Omit<ParsedAction, 'rawText'>, rawText: string): ParsedAction => ({ ...partial, rawText });
const hasAny = (text: string, words: readonly string[]): boolean => words.some((word) => text.includes(word));
const findId = (text: string, ids: readonly string[] = []): string | null => ids.find((id) => text.includes(id.toLowerCase())) ?? null;

export function parseActionLocally(input: PlayerInput, state?: MinimalApiState): ParsedAction {
  const raw = input.text.trim();
  const text = raw.toLowerCase();
  const candidates = state?.candidateIds;

  if (text.startsWith('/attack')) return makeAction({ intent: 'attack', target: 'enemy', skillId: null, magicId: null, itemId: null, method: 'command:attack' }, raw);
  if (text.startsWith('/defend')) return makeAction({ intent: 'defend', target: 'self', skillId: null, magicId: null, itemId: null, method: 'command:defend' }, raw);
  if (text.startsWith('/skill')) return makeAction({ intent: 'skill', target: 'enemy', skillId: raw.split(/\s+/)[1] ?? candidates?.skills[0] ?? null, magicId: null, itemId: null, method: 'command:skill' }, raw);
  if (text.startsWith('/magic')) return makeAction({ intent: 'magic', target: 'enemy', skillId: null, magicId: raw.split(/\s+/)[1] ?? candidates?.magic[0] ?? null, itemId: null, method: 'command:magic' }, raw);
  if (text.startsWith('/item')) return makeAction({ intent: 'item', target: 'self', skillId: null, magicId: null, itemId: raw.split(/\s+/)[1] ?? candidates?.items[0] ?? null, method: 'command:item' }, raw);

  const skillId = findId(text, candidates?.skills) ?? findId(text, ['SK_REAPING_ARC']);
  if (skillId || hasAny(text, ['수확', '기술', '스킬'])) return makeAction({ intent: 'skill', target: 'enemy', skillId: skillId ?? candidates?.skills[0] ?? 'SK_REAPING_ARC', magicId: null, itemId: null, method: skillId ? 'candidate_id_match' : 'synonym:skill' }, raw);

  const magicId = findId(text, candidates?.magic) ?? findId(text, ['MG_EMBER_01']);
  if (magicId || hasAny(text, ['불', '화염', '마법', '주문'])) return makeAction({ intent: 'magic', target: 'enemy', skillId: null, magicId: magicId ?? candidates?.magic[0] ?? 'MG_EMBER_01', itemId: null, method: magicId ? 'candidate_id_match' : 'synonym:magic' }, raw);

  const itemId = findId(text, candidates?.items) ?? findId(text, ['IT_HERB_SMALL']);
  if (itemId || hasAny(text, ['회복', '약초', '포션', '아이템'])) return makeAction({ intent: 'item', target: 'self', skillId: null, magicId: null, itemId: itemId ?? candidates?.items[0] ?? 'IT_HERB_SMALL', method: itemId ? 'candidate_id_match' : 'synonym:item' }, raw);

  if (hasAny(text, ['막는다', '방어한다', '가드한다', '버틴다', '방어', '막', '가드'])) return makeAction({ intent: 'defend', target: 'self', skillId: null, magicId: null, itemId: null, method: 'synonym:defend' }, raw);
  if (hasAny(text, ['공격', '베다', '벤다', '베', '휘두른다', '휘둘', '내려친다', '찌른다', '때리', '찌르'])) return makeAction({ intent: 'attack', target: 'enemy', skillId: null, magicId: null, itemId: null, method: 'synonym:attack' }, raw);
  if (hasAny(text, ['대화', '말'])) return makeAction({ intent: 'talk', target: 'none', skillId: null, magicId: null, itemId: null, method: 'talk' }, raw);
  if (hasAny(text, ['살피', '조사', '관찰'])) return makeAction({ intent: 'inspect', target: 'none', skillId: null, magicId: null, itemId: null, method: 'inspect' }, raw);
  if (hasAny(text, ['휴식', '쉰'])) return makeAction({ intent: 'rest', target: 'self', skillId: null, magicId: null, itemId: null, method: 'rest' }, raw);
  return makeAction({ intent: 'unknown', target: 'none', skillId: null, magicId: null, itemId: null, method: null }, raw);
}
