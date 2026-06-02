import { describe, expect, it } from 'vitest';
import { EnemyActionIntentSchema, GeneratedSkillDraftSchema, LlmCallResultSchema, NarrationResultSchema, ParsedActionSchema } from '../src/api/schemas.js';

describe('structured-output', () => {
  it('validates task schemas and strips stateDeltas from LLM results', () => {
    expect(ParsedActionSchema.parse({ intent: 'attack', target: 'enemy', skillId: null, magicId: null, itemId: null, method: null, rawText: 'x' }).intent).toBe('attack');
    expect(EnemyActionIntentSchema.parse({ intent: 'pressure', style: 'aggressive', hint: '거칠게 다가온다' }).intent).toBe('pressure');
    expect(NarrationResultSchema.parse({ text: '짧은 묘사', choices: ['a', 'b', 'c'] }).choices).toHaveLength(3);
    expect(GeneratedSkillDraftSchema.parse({ name: '빛', summary: '설명', flavor: '분위기', tags: ['holy'] }).name).toBe('빛');
    const result = LlmCallResultSchema.parse({ ok: true, task: 'narrate', narration: { text: '묘사', choices: ['a'] }, stateDeltas: [{ hp: -999 }] });
    expect(JSON.stringify(result)).not.toContain('stateDeltas');
  });
});
