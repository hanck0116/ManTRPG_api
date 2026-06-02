import type { LlmTask } from '../api/schemas.js';

export const gmSystemPrompt = 'You are ManTRPG GM assistant. Never calculate HP/MP/damage/rewards/dice/state. Hidden enemy: no stats/name. Compact JSON only. Korean narration, 1-3 short sentences.';

export function buildPrompt(task: LlmTask): string {
  const normalized = task === 'summarize' ? 'compact-summary' : task === 'generateSkill' ? 'generate-skill' : task;
  if (normalized === 'interpret') return `${gmSystemPrompt}\nMap player text only. Return keys: intent,target,id,aim. id may be null. No state changes.`;
  if (normalized === 'enemy-action') return `${gmSystemPrompt}\nChoose hidden enemy intent only: attack/guard/wait/pressure. Return keys: intent,style,hint. Hint is short Korean, no name/stats.`;
  if (normalized === 'narrate') return `${gmSystemPrompt}\nDescribe only the code result. Return keys: n,c. n is Korean; c has up to 3 short choices. Do not invent numbers.`;
  if (normalized === 'compact-summary') return `${gmSystemPrompt}\nSummarize visible recent play only. Return key: summary. Max 300 Korean chars. Exclude secrets/hidden stats.`;
  return `${gmSystemPrompt}\nDraft flavor only. Return keys: name,summary,flavor,tags. No damage/cost/multiplier/cooldown/success numeric effects.`;
}

export const promptContract = {
  allowedInputs: ['compact payload', 'player visible tuple', 'candidate IDs', 'engine result summary', 'hidden enemy hint', 'short log summary'],
  forbiddenInputs: ['full character sheet', 'full rulebook', 'full catalog', 'enemy stats', 'apiKey'],
  forbiddenOutputs: ['stateDeltas', 'damage math', 'healing math', 'dice roll', 'reward amount', 'enemy count', 'boss', 'map'],
};
