import type { GeneratedSkillDraft } from '../api/schemas.js';
import type { SkillDefinition } from '../data/skills.js';

const forbiddenNumericKeys = ['damage', 'cost', 'costMp', 'multiplier', 'damageMultiplier', 'cooldown', 'power', 'hp', 'mp'];

export interface BalancedGeneratedSkill extends SkillDefinition {
  summary: string;
  flavor: string;
  allowed: true;
  pending: false;
}

export function sanitizeGeneratedSkillDraft(value: unknown): GeneratedSkillDraft {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('generated_skill_draft_invalid');
  const record = value as Record<string, unknown>;
  for (const key of forbiddenNumericKeys) {
    if (key in record) throw new Error(`generated_skill_numeric_effect_forbidden:${key}`);
  }
  return {
    name: typeof record.name === 'string' && record.name.trim() ? record.name.slice(0, 40) : '이름 없는 기술',
    summary: typeof record.summary === 'string' && record.summary.trim() ? record.summary.slice(0, 120) : '짧은 기술 설명 초안',
    flavor: typeof record.flavor === 'string' && record.flavor.trim() ? record.flavor.slice(0, 160) : String(record.summary ?? '').slice(0, 160),
    tags: Array.isArray(record.tags) ? record.tags.filter((tag): tag is string => typeof tag === 'string').slice(0, 5) : ['skill'],
  };
}

export function balanceGeneratedSkill(draft: GeneratedSkillDraft, seed = Date.now()): BalancedGeneratedSkill {
  const safeTags = Array.from(new Set(['skill', ...draft.tags.filter((tag) => !/\d|damage|cost|multiplier/i.test(tag)).slice(0, 4)]));
  return {
    id: `SK_GEN_${Math.abs(seed).toString(36).toUpperCase()}`,
    name: draft.name,
    summary: draft.summary,
    flavor: draft.flavor,
    costMp: 3,
    targetModifier: 0,
    damageMultiplier: 1.2,
    tags: safeTags,
    allowed: true,
    pending: false,
  };
}
