export type ActionIntent = 'attack' | 'skill' | 'magic' | 'item' | 'defend' | 'talk' | 'inspect' | 'rest' | 'unknown';
export type Scene = 'combat' | 'rest' | 'dialogue';
export type CheckGrade = 'criticalSuccess' | 'success' | 'fail' | 'criticalFail';
export type LlmTask = 'interpret' | 'narrate' | 'summarize' | 'generateSkill';
export type LlmProvider = 'groq' | 'gemini' | 'openrouter' | 'customOpenAI';

export interface LlmSettings {
  provider: LlmProvider;
  apiKey: string;
  endpoint?: string;
  model?: string;
}

export interface PlayerInput {
  sessionId: string;
  text: string;
  llm?: LlmSettings;
}

export interface ParsedAction {
  intent: ActionIntent;
  target: 'enemy' | 'self' | 'none';
  skillId: string | null;
  magicId: string | null;
  itemId: string | null;
  method: string | null;
  rawText: string;
}

export interface CheckResult {
  roll: number;
  modifier: number;
  total: number;
  target: number;
  success: boolean;
  grade: CheckGrade;
}

export interface EngineResult {
  ok: boolean;
  scene: Scene;
  result: 'success' | 'fail' | 'partial' | 'blocked';
  check: CheckResult | null;
  roll: number | null;
  target: number | null;
  total: number | null;
  grade: CheckGrade | null;
  success: boolean;
  damage: number;
  healing: number;
  playerHp: number;
  playerMp: number;
  enemyHp: number | null;
  battleEnded: boolean;
  tags: string[];
  messageHint: string;
}

export interface EnemyDecision {
  intent: 'attack';
  target: 'player';
  method: string;
  reasonTag: string;
}

export interface NarrationResult {
  text: string;
  choices: string[];
}

export interface SessionSummary {
  scene: Scene;
  player: { hp: string; mp: string; weapon: string; condition: 'normal' | 'wounded' | 'exhausted' | 'down' };
  enemy: { hp: string; condition: 'normal' | 'wounded' | 'defeated' } | null;
  availableActions: string[];
}

export interface MinimalApiState extends SessionSummary {
  turn: number;
  candidateIds: { skills: string[]; magic: string[]; items: string[] };
}

export interface LlmUsageEstimate {
  promptTokens: number;
  completionTokens: number;
  provider: LlmProvider;
  model: string;
}

export interface LlmCallResult {
  ok: boolean;
  task: LlmTask;
  parsedAction?: ParsedAction;
  narration?: NarrationResult;
  summary?: string;
  generatedText?: string;
  usage?: LlmUsageEstimate;
  error?: string;
}

type Schema<T> = { parse(value: unknown): T };

const actionIntents: ActionIntent[] = ['attack', 'skill', 'magic', 'item', 'defend', 'talk', 'inspect', 'rest', 'unknown'];
const targets: ParsedAction['target'][] = ['enemy', 'self', 'none'];
const scenes: Scene[] = ['combat', 'rest', 'dialogue'];
const grades: CheckGrade[] = ['criticalSuccess', 'success', 'fail', 'criticalFail'];
const llmTasks: LlmTask[] = ['interpret', 'narrate', 'summarize', 'generateSkill'];
const providers: LlmProvider[] = ['groq', 'gemini', 'openrouter', 'customOpenAI'];

function object(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${name} must be an object`);
  return value as Record<string, unknown>;
}

function stringValue(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${name} must be a non-empty string`);
  return value;
}

function optionalString(value: unknown, name: string): string | undefined {
  if (value === undefined) return undefined;
  return stringValue(value, name);
}

function nullableString(value: unknown, name: string): string | null {
  if (value === null) return null;
  return stringValue(value, name);
}

function intValue(value: unknown, name: string): number {
  if (!Number.isInteger(value)) throw new Error(`${name} must be an integer`);
  return value as number;
}

function boolValue(value: unknown, name: string): boolean {
  if (typeof value !== 'boolean') throw new Error(`${name} must be boolean`);
  return value;
}

function enumValue<T extends string>(value: unknown, allowed: readonly T[], name: string): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) throw new Error(`${name} must be one of ${allowed.join(', ')}`);
  return value as T;
}

function stringArray(value: unknown, name: string, max?: number): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) throw new Error(`${name} must be a string array`);
  if (max !== undefined && value.length > max) throw new Error(`${name} must have at most ${max} items`);
  return value;
}

export const LlmSettingsSchema: Schema<LlmSettings> = {
  parse(value) {
    const data = object(value, 'LlmSettings');
    return {
      provider: enumValue(data.provider, providers, 'provider'),
      apiKey: stringValue(data.apiKey, 'apiKey'),
      endpoint: optionalString(data.endpoint, 'endpoint'),
      model: optionalString(data.model, 'model'),
    };
  },
};

export const PlayerInputSchema: Schema<PlayerInput> = {
  parse(value) {
    const data = object(value, 'PlayerInput');
    return {
      sessionId: stringValue(data.sessionId, 'sessionId'),
      text: stringValue(data.text, 'text'),
      llm: data.llm === undefined ? undefined : LlmSettingsSchema.parse(data.llm),
    };
  },
};

export const ParsedActionSchema: Schema<ParsedAction> = {
  parse(value) {
    const data = object(value, 'ParsedAction');
    return {
      intent: enumValue(data.intent, actionIntents, 'intent'),
      target: enumValue(data.target, targets, 'target'),
      skillId: nullableString(data.skillId, 'skillId'),
      magicId: nullableString(data.magicId, 'magicId'),
      itemId: nullableString(data.itemId, 'itemId'),
      method: nullableString(data.method, 'method'),
      rawText: typeof data.rawText === 'string' ? data.rawText : '',
    };
  },
};

export const CheckResultSchema: Schema<CheckResult> = {
  parse(value) {
    const data = object(value, 'CheckResult');
    return { roll: intValue(data.roll, 'roll'), modifier: intValue(data.modifier, 'modifier'), total: intValue(data.total, 'total'), target: intValue(data.target, 'target'), success: boolValue(data.success, 'success'), grade: enumValue(data.grade, grades, 'grade') };
  },
};

export const EngineResultSchema: Schema<EngineResult> = {
  parse(value) {
    const data = object(value, 'EngineResult');
    return {
      ok: boolValue(data.ok, 'ok'), scene: enumValue(data.scene, scenes, 'scene'), result: enumValue(data.result, ['success', 'fail', 'partial', 'blocked'] as const, 'result'),
      check: data.check === null ? null : CheckResultSchema.parse(data.check), roll: data.roll === null ? null : intValue(data.roll, 'roll'), target: data.target === null ? null : intValue(data.target, 'target'), total: data.total === null ? null : intValue(data.total, 'total'), grade: data.grade === null ? null : enumValue(data.grade, grades, 'grade'), success: boolValue(data.success, 'success'), damage: intValue(data.damage, 'damage'), healing: intValue(data.healing, 'healing'), playerHp: intValue(data.playerHp, 'playerHp'), playerMp: intValue(data.playerMp, 'playerMp'), enemyHp: data.enemyHp === null ? null : intValue(data.enemyHp, 'enemyHp'), battleEnded: boolValue(data.battleEnded, 'battleEnded'), tags: stringArray(data.tags, 'tags'), messageHint: stringValue(data.messageHint, 'messageHint'),
    };
  },
};

export const EnemyDecisionSchema: Schema<EnemyDecision> = { parse(value) { const data = object(value, 'EnemyDecision'); return { intent: enumValue(data.intent, ['attack'] as const, 'intent'), target: enumValue(data.target, ['player'] as const, 'target'), method: stringValue(data.method, 'method'), reasonTag: stringValue(data.reasonTag, 'reasonTag') }; } };

export const NarrationResultSchema: Schema<NarrationResult> = { parse(value) { const data = object(value, 'NarrationResult'); return { text: stringValue(data.text, 'text'), choices: stringArray(data.choices, 'choices', 3) }; } };

export const SessionSummarySchema: Schema<SessionSummary> = { parse(value) { const data = object(value, 'SessionSummary'); const player = object(data.player, 'player'); const enemy = data.enemy === null ? null : object(data.enemy, 'enemy'); return { scene: enumValue(data.scene, scenes, 'scene'), player: { hp: stringValue(player.hp, 'player.hp'), mp: stringValue(player.mp, 'player.mp'), weapon: stringValue(player.weapon, 'player.weapon'), condition: enumValue(player.condition, ['normal', 'wounded', 'exhausted', 'down'] as const, 'player.condition') }, enemy: enemy ? { hp: stringValue(enemy.hp, 'enemy.hp'), condition: enumValue(enemy.condition, ['normal', 'wounded', 'defeated'] as const, 'enemy.condition') } : null, availableActions: stringArray(data.availableActions, 'availableActions') }; } };

export const MinimalApiStateSchema: Schema<MinimalApiState> = { parse(value) { const data = object(value, 'MinimalApiState'); const summary = SessionSummarySchema.parse(data); const candidateIds = object(data.candidateIds, 'candidateIds'); return { ...summary, turn: intValue(data.turn, 'turn'), candidateIds: { skills: stringArray(candidateIds.skills, 'candidateIds.skills', 5), magic: stringArray(candidateIds.magic, 'candidateIds.magic', 5), items: stringArray(candidateIds.items, 'candidateIds.items', 5) } }; } };

export const LlmTaskSchema: Schema<LlmTask> = { parse(value) { return enumValue(value, llmTasks, 'task'); } };
export const LlmProviderSchema: Schema<LlmProvider> = { parse(value) { return enumValue(value, providers, 'provider'); } };

export const LlmUsageEstimateSchema: Schema<LlmUsageEstimate> = { parse(value) { const data = object(value, 'usage'); return { promptTokens: intValue(data.promptTokens, 'promptTokens'), completionTokens: intValue(data.completionTokens, 'completionTokens'), provider: enumValue(data.provider, providers, 'provider'), model: stringValue(data.model, 'model') }; } };

export const LlmCallResultSchema: Schema<LlmCallResult> = {
  parse(value) {
    const data = object(value, 'LlmCallResult');
    const ok = boolValue(data.ok, 'ok');
    const task = enumValue(data.task, llmTasks, 'task');
    const result: LlmCallResult = {
      ok,
      task,
      parsedAction: data.parsedAction === undefined ? undefined : ParsedActionSchema.parse(data.parsedAction),
      narration: data.narration === undefined ? undefined : NarrationResultSchema.parse(data.narration),
      summary: optionalString(data.summary, 'summary'),
      generatedText: optionalString(data.generatedText, 'generatedText'),
      usage: data.usage === undefined ? undefined : LlmUsageEstimateSchema.parse(data.usage),
      error: optionalString(data.error, 'error'),
    };

    if (ok && task === 'interpret' && !result.parsedAction) throw new Error('interpret result requires parsedAction');
    if (ok && task === 'narrate' && !result.narration) throw new Error('narrate result requires narration');
    if (ok && task === 'summarize' && !result.summary) throw new Error('summarize result requires summary');
    if (ok && task === 'generateSkill' && !result.generatedText) throw new Error('generateSkill result requires generatedText');
    return result;
  },
};

export function parsePlayerInput(body: unknown): PlayerInput {
  return PlayerInputSchema.parse(body);
}
