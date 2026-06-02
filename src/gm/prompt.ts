import type { LlmTask } from '../api/schemas.js';

export const gmSystemPrompt = `You are an optional BYOK GM assistant for ManTRPG.
Return only JSON that matches the requested schema.
Never invent dice, damage, healing, rewards, HP, MP, or enemy counts.
Rules are computed by the local TypeScript engine.
Use only MinimalApiState, EngineResult, and candidate IDs provided by the app.
Do not ask for or reveal API keys.
Keep Korean mobile narration short.`;

export function buildPrompt(task: LlmTask): string {
  if (task === 'interpret') {
    return `${gmSystemPrompt}\nTask: convert ambiguous natural language into ParsedAction JSON using only provided candidate IDs. If unclear, return intent unknown.`;
  }
  if (task === 'narrate') {
    return `${gmSystemPrompt}\nTask: describe the provided EngineResult in 1-3 short Korean sentences and up to 3 choices. Do not add new numbers.`;
  }
  if (task === 'summarize') {
    return `${gmSystemPrompt}\nTask: summarize long logs into a compact session summary without hidden rules or API key data.`;
  }
  return `${gmSystemPrompt}\nTask: generate a short skill or magic flavor description for the provided candidate IDs only. Do not create combat math.`;
}

export const promptContract = {
  allowedInputs: ['MinimalApiState', 'EngineResult', 'candidateIds', 'short log summary'],
  forbiddenInputs: ['full character sheet', 'full rulebook', 'full skill catalog', 'full magic catalog', 'full equipment catalog', 'apiKey'],
  forbiddenOutputs: ['damage', 'healing', 'dice roll', 'reward amount', 'enemy count'],
};
