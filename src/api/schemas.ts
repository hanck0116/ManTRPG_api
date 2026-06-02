import { z } from 'zod';

export const PlayerInputSchema = z.object({
  sessionId: z.string().min(1),
  text: z.string().min(1),
});

export const ParsedActionSchema = z.object({
  intent: z.enum(['attack', 'skill', 'magic', 'item', 'defend', 'talk', 'inspect', 'rest', 'unknown']),
  target: z.enum(['enemy', 'self', 'none']),
  skillId: z.string().nullable(),
  magicId: z.string().nullable(),
  itemId: z.string().nullable(),
  method: z.string().nullable(),
  rawText: z.string(),
});

export const CheckResultSchema = z.object({
  roll: z.number().int(),
  modifier: z.number().int(),
  total: z.number().int(),
  target: z.number().int(),
  success: z.boolean(),
  grade: z.enum(['criticalSuccess', 'success', 'fail', 'criticalFail']),
});

export const EngineResultSchema = z.object({
  ok: z.boolean(),
  scene: z.enum(['combat', 'rest', 'dialogue']),
  result: z.enum(['success', 'fail', 'partial', 'blocked']),
  check: CheckResultSchema.nullable(),
  roll: z.number().int().nullable(),
  target: z.number().int().nullable(),
  total: z.number().int().nullable(),
  grade: z.enum(['criticalSuccess', 'success', 'fail', 'criticalFail']).nullable(),
  success: z.boolean(),
  damage: z.number().int(),
  healing: z.number().int(),
  playerHp: z.number().int(),
  playerMp: z.number().int(),
  enemyHp: z.number().int().nullable(),
  battleEnded: z.boolean(),
  tags: z.array(z.string()),
  messageHint: z.string(),
});

export const EnemyDecisionSchema = z.object({
  intent: z.enum(['attack']),
  target: z.enum(['player']),
  method: z.string(),
  reasonTag: z.string(),
});

export const NarrationResultSchema = z.object({
  text: z.string(),
  choices: z.array(z.string()).max(3),
});

export const SessionSummarySchema = z.object({
  scene: z.enum(['combat', 'rest', 'dialogue']),
  player: z.object({ hp: z.string(), mp: z.string(), weapon: z.string(), condition: z.enum(['normal', 'wounded', 'exhausted', 'down']) }),
  enemy: z.object({ hp: z.string(), condition: z.enum(['normal', 'wounded', 'defeated']) }).nullable(),
  availableActions: z.array(z.string()),
});

export type PlayerInput = z.infer<typeof PlayerInputSchema>;
export type ParsedAction = z.infer<typeof ParsedActionSchema>;
export type CheckResult = z.infer<typeof CheckResultSchema>;
export type EngineResult = z.infer<typeof EngineResultSchema>;
export type EnemyDecision = z.infer<typeof EnemyDecisionSchema>;
export type NarrationResult = z.infer<typeof NarrationResultSchema>;
export type SessionSummary = z.infer<typeof SessionSummarySchema>;

export function parsePlayerInput(body: unknown): PlayerInput {
  return PlayerInputSchema.parse(body);
}
