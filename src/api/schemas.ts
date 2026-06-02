import * as z from 'zod';

export const actionIntents = ['attack', 'skill', 'magic', 'item', 'defend', 'talk', 'inspect', 'rest', 'unknown'] as const;
export const targets = ['enemy', 'self', 'none'] as const;
export const scenes = ['combat', 'rest', 'dialogue'] as const;
export const grades = ['criticalSuccess', 'success', 'fail', 'criticalFail'] as const;
export const llmTasks = ['interpret', 'narrate', 'summarize', 'generateSkill'] as const;
export const providers = ['groq', 'gemini', 'openrouter', 'customOpenAI'] as const;

export const LlmSettingsSchema = z.object({
  provider: z.enum(providers),
  apiKey: z.string().min(1),
  endpoint: z.string().url().optional(),
  model: z.string().min(1).optional(),
});

export const PlayerInputSchema = z.object({
  sessionId: z.string().min(1),
  text: z.string().min(1),
}).strict();

export const ParsedActionSchema = z.object({
  intent: z.enum(actionIntents),
  target: z.enum(targets),
  skillId: z.string().min(1).nullable(),
  magicId: z.string().min(1).nullable(),
  itemId: z.string().min(1).nullable(),
  method: z.string().min(1).nullable(),
  rawText: z.string().default(''),
});

export const CheckResultSchema = z.object({
  roll: z.number().int().min(1).max(100),
  baseTarget: z.number().int(),
  modifier: z.number().int(),
  effectiveTarget: z.number().int(),
  success: z.boolean(),
  grade: z.enum(grades),
  formula: z.literal('1d100 <= effectiveTarget'),
});

export const EngineResultSchema = z.object({
  ok: z.boolean(),
  scene: z.enum(scenes),
  result: z.enum(['success', 'fail', 'partial', 'blocked']),
  check: CheckResultSchema.nullable(),
  roll: z.number().int().nullable(),
  baseTarget: z.number().int().nullable(),
  effectiveTarget: z.number().int().nullable(),
  grade: z.enum(grades).nullable(),
  success: z.boolean(),
  damage: z.number().int().min(0),
  healing: z.number().int().min(0),
  playerHp: z.number().int().min(0),
  playerMp: z.number().int().min(0),
  enemyHp: z.number().int().min(0).nullable(),
  battleEnded: z.boolean(),
  tags: z.array(z.string()),
  messageHint: z.string(),
});

export const EnemyDecisionSchema = z.object({
  intent: z.literal('attack'),
  target: z.literal('player'),
  method: z.string().min(1),
  reasonTag: z.string().min(1),
});

export const NarrationResultSchema = z.object({
  text: z.string().min(1),
  choices: z.array(z.string().min(1)).max(3),
});

export const SessionSummarySchema = z.object({
  scene: z.enum(scenes),
  player: z.object({
    hp: z.string(),
    mp: z.string(),
    weapon: z.string(),
    condition: z.enum(['normal', 'wounded', 'exhausted', 'down']),
  }),
  enemy: z.object({ hp: z.string(), condition: z.enum(['normal', 'wounded', 'defeated']) }).nullable(),
  availableActions: z.array(z.string()),
});

export const MinimalApiStateSchema = SessionSummarySchema.extend({
  turn: z.number().int().min(1),
  candidateIds: z.object({
    skills: z.array(z.string()).max(5),
    magic: z.array(z.string()).max(5),
    items: z.array(z.string()).max(5),
  }),
});

export const LlmTaskSchema = z.enum(llmTasks);
export const LlmProviderSchema = z.enum(providers);

export const LlmUsageEstimateSchema = z.object({
  promptTokens: z.number().int().min(0),
  completionTokens: z.number().int().min(0),
  provider: z.enum(providers),
  model: z.string().min(1),
});

export const LlmCallResultSchema = z.object({
  ok: z.boolean(),
  task: z.enum(llmTasks),
  parsedAction: ParsedActionSchema.optional(),
  narration: NarrationResultSchema.optional(),
  summary: z.string().optional(),
  generatedText: z.string().optional(),
  usage: LlmUsageEstimateSchema.optional(),
  error: z.string().optional(),
}).superRefine((value: any, ctx: any) => {
  if (value.ok && value.task === 'interpret' && !value.parsedAction) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'interpret result requires parsedAction' });
  if (value.ok && value.task === 'narrate' && !value.narration) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'narrate result requires narration' });
  if (value.ok && value.task === 'summarize' && !value.summary) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'summarize result requires summary' });
  if (value.ok && value.task === 'generateSkill' && !value.generatedText) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'generateSkill result requires generatedText' });
});

export type ActionIntent = z.infer<typeof ParsedActionSchema>['intent'];
export type Scene = z.infer<typeof SessionSummarySchema>['scene'];
export type CheckGrade = z.infer<typeof CheckResultSchema>['grade'];
export type LlmTask = z.infer<typeof LlmTaskSchema>;
export type LlmProvider = z.infer<typeof LlmProviderSchema>;
export type LlmSettings = z.infer<typeof LlmSettingsSchema>;
export type PlayerInput = z.infer<typeof PlayerInputSchema>;
export type ParsedAction = z.infer<typeof ParsedActionSchema>;
export type CheckResult = z.infer<typeof CheckResultSchema>;
export type EngineResult = z.infer<typeof EngineResultSchema>;
export type EnemyDecision = z.infer<typeof EnemyDecisionSchema>;
export type NarrationResult = z.infer<typeof NarrationResultSchema>;
export type SessionSummary = z.infer<typeof SessionSummarySchema>;
export type MinimalApiState = z.infer<typeof MinimalApiStateSchema>;
export type LlmUsageEstimate = z.infer<typeof LlmUsageEstimateSchema>;
export type LlmCallResult = z.infer<typeof LlmCallResultSchema>;

export function parsePlayerInput(body: unknown): PlayerInput {
  return PlayerInputSchema.parse(body);
}
