import type { LlmTask } from '../api/schemas.js';

export const gmSystemPrompt = 'You are ManTRPG GM assistant. Do not calculate HP, MP, damage, rewards, dice, or state changes. Use only the compact payload. Enemy is hidden; never reveal enemy stats or name. Return compact JSON only. Narration must be Korean, 1-3 short sentences.';

export function buildPrompt(task: LlmTask): string {
  const normalized = task === 'summarize' ? 'compact-summary' : task === 'generateSkill' ? 'generate-skill' : task;
  if (normalized === 'interpret') return `${gmSystemPrompt}\nTask: map player text to JSON. Output {"parsedAction":{"intent":"attack|skill|magic|item|defend|talk|inspect|unknown","target":"enemy|self|none","skillId":null,"magicId":null,"itemId":null,"method":null,"rawText":""}}.`;
  if (normalized === 'enemy-action') return `${gmSystemPrompt}\nTask: choose only hidden enemy intent. Output {"enemyAction":{"intent":"attack|guard|wait|pressure","style":"aggressive|cautious|desperate","hint":"짧은 힌트"}}.`;
  if (normalized === 'narrate') return `${gmSystemPrompt}\nTask: describe code result only. Output {"narration":{"text":"짧은 한국어 묘사","choices":["선택1","선택2","선택3"]}}. No new numbers.`;
  if (normalized === 'compact-summary') return `${gmSystemPrompt}\nTask: compress visible log. Output {"summary":"300 Korean chars max"}. Exclude secrets and hidden stats.`;
  return `${gmSystemPrompt}\nTask: draft skill/magic flavor only. Output {"generatedSkillDraft":{"name":"","summary":"","flavor":"","tags":[]}}. No damage, cost, multiplier, cooldown, or numeric effects.`;
}

export const promptContract = {
  allowedInputs: ['compact payload', 'player visible tuple', 'candidate IDs', 'engine result summary', 'hidden enemy hint', 'short log summary'],
  forbiddenInputs: ['full character sheet', 'full rulebook', 'full catalog', 'enemy stats', 'apiKey'],
  forbiddenOutputs: ['stateDeltas', 'damage math', 'healing math', 'dice roll', 'reward amount', 'enemy count', 'boss', 'map'],
};
