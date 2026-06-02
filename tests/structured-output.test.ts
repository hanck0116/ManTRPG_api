import { describe, expect, it } from 'vitest';
import { EnemyActionIntentSchema, GeneratedSkillDraftSchema, LlmCallResultSchema, NarrationResultSchema, ParsedActionSchema } from '../src/api/schemas.js';
import { sanitizeResponse } from '../src/ai/types.js';

describe('structured-output', () => {
  it('validates task schemas and strips stateDeltas from LLM results', () => {
    expect(ParsedActionSchema.parse({ intent: 'attack', target: 'enemy', skillId: null, magicId: null, itemId: null, method: null, rawText: 'x' }).intent).toBe('attack');
    expect(EnemyActionIntentSchema.parse({ intent: 'pressure', style: 'aggressive', hint: '거칠게 다가온다' }).intent).toBe('pressure');
    expect(NarrationResultSchema.parse({ text: '짧은 묘사', choices: ['a', 'b', 'c'] }).choices).toHaveLength(3);
    expect(GeneratedSkillDraftSchema.parse({ name: '빛', summary: '설명', flavor: '분위기', tags: ['holy'] }).name).toBe('빛');
    const result = LlmCallResultSchema.parse({ ok: true, task: 'narrate', narration: { text: '묘사', choices: ['a'] }, stateDeltas: [{ hp: -999 }] });
    expect(JSON.stringify(result)).not.toContain('stateDeltas');
    const compactNarration = sanitizeResponse('narrate', { n: '낫끝이 어둠을 가른다.', c: ['몰아친다'], stateDeltas: [{ hp: -999 }] });
    expect(compactNarration.narration?.text).toBe('낫끝이 어둠을 가른다.');
    expect(JSON.stringify(compactNarration)).not.toContain('stateDeltas');
    const draft = sanitizeResponse('generate-skill', { name: '휘광', summary: '빛을 두른다', flavor: '찬란하다', tags: ['holy'], damage: 999, cost: 1 });
    expect(JSON.stringify(draft)).not.toContain('damage');
  });
});
