import type { LlmCallResult, LlmTask, ParsedAction } from '../api/schemas.js';

export interface NarrationResponse { n: string; c: string[]; }
export interface EnemyIntentResponse { intent: 'attack' | 'guard' | 'wait' | 'pressure'; style: 'aggressive' | 'cautious' | 'desperate'; hint: string; }
export interface InterpretResponse { intent: ParsedAction['intent']; target: ParsedAction['target']; id: string | null; aim: string | null; }
export interface GeneratedSkillDraft { name: string; summary: string; flavor: string; tags: string[]; }

const forbiddenKeys = new Set([
  'stateDeltas', 'stateDelta', 'deltas', 'hp', 'mp', 'hpDelta', 'mpDelta', 'playerHp', 'playerMp', 'enemyHp',
  'damage', 'healing', 'reward', 'coins', 'coinDelta', 'items', 'equipment', 'level', 'enemyCount', 'boss', 'map',
  'cost', 'costMp', 'multiplier', 'damageMultiplier', 'cooldown', 'successRate', 'power',
]);

export function sanitizeResponse(task: LlmTask, value: unknown, rawText = ''): LlmCallResult {
  const cleaned = stripForbidden(value);
  const record = isRecord(cleaned) ? cleaned : {};
  const normalizedTask = task === 'summarize' ? 'compact-summary' : task === 'generateSkill' ? 'generate-skill' : task;
  const base: LlmCallResult = { ok: true, task };

  if (normalizedTask === 'narrate') {
    const n = typeof record.n === 'string' ? record.n : nestedString(record, ['narration', 'text']);
    const c = Array.isArray(record.c) ? record.c : nestedArray(record, ['narration', 'choices']);
    return { ...base, narration: { text: trimRequired(n, '묘사가 이어진다.'), choices: stringChoices(c) } };
  }

  if (normalizedTask === 'enemy-action') {
    const source = isRecord(record.enemyAction) ? record.enemyAction : record;
    return {
      ...base,
      enemyAction: {
        intent: enumOr(source.intent, ['attack', 'guard', 'wait', 'pressure'] as const, 'attack'),
        style: enumOr(source.style, ['aggressive', 'cautious', 'desperate'] as const, 'cautious'),
        hint: trimRequired(source.hint, '위협적인 움직임').slice(0, 40),
      },
    };
  }

  if (normalizedTask === 'interpret') {
    const source = isRecord(record.parsedAction) ? record.parsedAction : record;
    const intent = enumOr(source.intent, ['attack', 'skill', 'magic', 'item', 'defend', 'talk', 'inspect', 'rest', 'unknown'] as const, 'unknown');
    const id = typeof source.id === 'string' ? source.id : null;
    return {
      ...base,
      parsedAction: {
        intent,
        target: enumOr(source.target, ['enemy', 'self', 'none'] as const, 'none'),
        skillId: typeof source.skillId === 'string' ? source.skillId : intent === 'skill' ? id : null,
        magicId: typeof source.magicId === 'string' ? source.magicId : intent === 'magic' ? id : null,
        itemId: typeof source.itemId === 'string' ? source.itemId : intent === 'item' ? id : null,
        method: typeof source.method === 'string' ? source.method : typeof source.aim === 'string' ? source.aim : null,
        rawText: typeof source.rawText === 'string' ? source.rawText : rawText,
      },
    };
  }

  if (normalizedTask === 'compact-summary') {
    return { ...base, summary: trimRequired(record.summary ?? record.s, '').slice(0, 300) || '요약 없음' };
  }

  const source = isRecord(record.generatedSkillDraft) ? record.generatedSkillDraft : record;
  return {
    ...base,
    generatedSkillDraft: {
      name: trimRequired(source.name, '이름 없는 기술').slice(0, 40),
      summary: trimRequired(source.summary, '짧은 설명').slice(0, 120),
      flavor: trimRequired(source.flavor ?? source.summary, '분위기 설명').slice(0, 160),
      tags: stringChoices(Array.isArray(source.tags) ? source.tags : []).slice(0, 5),
    },
  };
}

function stripForbidden(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripForbidden);
  if (!isRecord(value)) return value;
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (forbiddenKeys.has(key)) continue;
    out[key] = stripForbidden(item);
  }
  return out;
}

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function nestedString(record: Record<string, unknown>, path: [string, string]): unknown { const first = record[path[0]]; return isRecord(first) ? first[path[1]] : undefined; }
function nestedArray(record: Record<string, unknown>, path: [string, string]): unknown[] { const first = record[path[0]]; const value = isRecord(first) ? first[path[1]] : undefined; return Array.isArray(value) ? value : []; }
function trimRequired(value: unknown, fallback: string): string { return typeof value === 'string' && value.trim() ? value.trim() : fallback; }
function stringChoices(value: unknown[]): string[] { const choices = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map((item) => item.trim()).slice(0, 3); return choices.length ? choices : ['계속한다']; }
function enumOr<T extends readonly string[]>(value: unknown, allowed: T, fallback: T[number]): T[number] { return typeof value === 'string' && allowed.includes(value) ? value as T[number] : fallback; }
