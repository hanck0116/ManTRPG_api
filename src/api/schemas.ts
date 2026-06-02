export const actionIntents = ['attack', 'skill', 'magic', 'item', 'defend', 'talk', 'inspect', 'rest', 'unknown'] as const;
export const targets = ['enemy', 'self', 'none'] as const;
export const scenes = ['combat', 'rest', 'dialogue'] as const;
export const grades = ['criticalSuccess', 'success', 'fail', 'criticalFail'] as const;
export const llmTasks = ['interpret', 'narrate', 'summarize', 'generateSkill'] as const;
export const providers = ['groq', 'gemini', 'openrouter', 'customOpenAI'] as const;

export type ActionIntent = typeof actionIntents[number];
export type Scene = typeof scenes[number];
export type CheckGrade = typeof grades[number];
export type LlmTask = typeof llmTasks[number];
export type LlmProvider = typeof providers[number];

export interface LlmSettings {
  provider: LlmProvider;
  apiKey: string;
  endpoint?: string;
  model?: string;
}

export interface PlayerInput {
  sessionId: string;
  text: string;
}

export interface ParsedAction {
  intent: ActionIntent;
  target: typeof targets[number];
  skillId: string | null;
  magicId: string | null;
  itemId: string | null;
  method: string | null;
  rawText: string;
}

export interface CheckResult {
  roll: number;
  baseTarget: number;
  modifier: number;
  effectiveTarget: number;
  success: boolean;
  grade: CheckGrade;
  formula: '1d100 <= effectiveTarget';
}

export interface EngineResult {
  ok: boolean;
  scene: Scene;
  result: 'success' | 'fail' | 'partial' | 'blocked';
  check: CheckResult | null;
  roll: number | null;
  baseTarget: number | null;
  effectiveTarget: number | null;
  grade: CheckGrade | null;
  success: boolean;
  damage: number;
  healing: number;
  playerHp: number;
  playerMp: number;
  enemyHp: number | null;
  battleEnded: boolean;
  tags: readonly string[];
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
  choices: readonly string[];
}

export interface SessionSummary {
  scene: Scene;
  player: {
    hp: string;
    mp: string;
    weapon: string;
    condition: 'normal' | 'wounded' | 'exhausted' | 'down';
  };
  enemy: { hp: string; condition: 'normal' | 'wounded' | 'defeated' } | null;
  availableActions: readonly string[];
}

export interface MinimalApiState extends SessionSummary {
  turn: number;
  candidateIds: {
    skills: readonly string[];
    magic: readonly string[];
    items: readonly string[];
  };
}

export interface LlmUsageEstimate {
  promptTokens: number;
  completionTokens: number;
  provider: LlmProvider;
  model: string;
}

export type LlmCallResult = {
  ok: boolean;
  task: LlmTask;
  parsedAction?: ParsedAction;
  narration?: NarrationResult;
  summary?: string;
  generatedText?: string;
  usage?: LlmUsageEstimate;
  error?: string;
};

interface Schema<T> {
  parse(value: unknown): T;
}

function schema<T>(parse: (value: unknown) => T): Schema<T> {
  return { parse };
}

function fail(message: string): never {
  throw new Error(message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function strictRecord(value: unknown, allowedKeys: readonly string[], name: string): Record<string, unknown> {
  if (!isRecord(value)) fail(`${name} must be an object`);
  const extra = Object.keys(value).filter((key) => !allowedKeys.includes(key));
  if (extra.length > 0) fail(`${name} contains unsupported keys: ${extra.join(', ')}`);
  return value;
}

function requiredRecord(value: unknown, name: string): Record<string, unknown> {
  if (!isRecord(value)) fail(`${name} must be an object`);
  return value;
}

function nonEmptyString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.length < 1) fail(`${name} must be a non-empty string`);
  return value;
}

function optionalNonEmptyString(value: unknown, name: string): string | undefined {
  if (value === undefined) return undefined;
  return nonEmptyString(value, name);
}

function nullableNonEmptyString(value: unknown, name: string): string | null {
  if (value === null) return null;
  return nonEmptyString(value, name);
}

function booleanValue(value: unknown, name: string): boolean {
  if (typeof value !== 'boolean') fail(`${name} must be a boolean`);
  return value;
}

function integer(value: unknown, name: string, options: { min?: number; max?: number } = {}): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) fail(`${name} must be an integer`);
  if (options.min !== undefined && value < options.min) fail(`${name} must be >= ${options.min}`);
  if (options.max !== undefined && value > options.max) fail(`${name} must be <= ${options.max}`);
  return value;
}

function nullableInteger(value: unknown, name: string, options: { min?: number; max?: number } = {}): number | null {
  if (value === null) return null;
  return integer(value, name, options);
}

function enumValue<T extends readonly string[]>(value: unknown, values: T, name: string): T[number] {
  if (typeof value !== 'string' || !values.includes(value)) fail(`${name} must be one of ${values.join(', ')}`);
  return value as T[number];
}

function stringArray(value: unknown, name: string, options: { max?: number; nonEmpty?: boolean } = {}): string[] {
  if (!Array.isArray(value)) fail(`${name} must be an array`);
  if (options.max !== undefined && value.length > options.max) fail(`${name} must contain at most ${options.max} values`);
  return value.map((entry, index) => options.nonEmpty ? nonEmptyString(entry, `${name}[${index}]`) : typeof entry === 'string' ? entry : fail(`${name}[${index}] must be a string`));
}

function optionalSchema<T>(value: unknown, itemSchema: Schema<T>, name: string): T | undefined {
  if (value === undefined) return undefined;
  try {
    return itemSchema.parse(value);
  } catch (error) {
    fail(`${name}: ${error instanceof Error ? error.message : 'invalid value'}`);
  }
}

function parseUrl(value: unknown, name: string): string | undefined {
  const url = optionalNonEmptyString(value, name);
  if (url === undefined) return undefined;
  try {
    new URL(url);
    return url;
  } catch {
    fail(`${name} must be a valid URL`);
  }
}

export const LlmSettingsSchema: Schema<LlmSettings> = schema((value) => {
  const record = strictRecord(value, ['provider', 'apiKey', 'endpoint', 'model'], 'LlmSettings');
  return {
    provider: enumValue(record.provider, providers, 'provider'),
    apiKey: nonEmptyString(record.apiKey, 'apiKey'),
    endpoint: parseUrl(record.endpoint, 'endpoint'),
    model: optionalNonEmptyString(record.model, 'model'),
  };
});

export const PlayerInputSchema: Schema<PlayerInput> = schema((value) => {
  const record = strictRecord(value, ['sessionId', 'text'], 'PlayerInput');
  return {
    sessionId: nonEmptyString(record.sessionId, 'sessionId'),
    text: nonEmptyString(record.text, 'text'),
  };
});

export const ParsedActionSchema: Schema<ParsedAction> = schema((value) => {
  const record = requiredRecord(value, 'ParsedAction');
  return {
    intent: enumValue(record.intent, actionIntents, 'intent'),
    target: enumValue(record.target, targets, 'target'),
    skillId: nullableNonEmptyString(record.skillId, 'skillId'),
    magicId: nullableNonEmptyString(record.magicId, 'magicId'),
    itemId: nullableNonEmptyString(record.itemId, 'itemId'),
    method: nullableNonEmptyString(record.method, 'method'),
    rawText: record.rawText === undefined ? '' : nonEmptyString(record.rawText, 'rawText'),
  };
});

export const CheckResultSchema: Schema<CheckResult> = schema((value) => {
  const record = requiredRecord(value, 'CheckResult');
  const formula = record.formula;
  if (formula !== '1d100 <= effectiveTarget') fail('formula must be 1d100 <= effectiveTarget');
  return {
    roll: integer(record.roll, 'roll', { min: 1, max: 100 }),
    baseTarget: integer(record.baseTarget, 'baseTarget'),
    modifier: integer(record.modifier, 'modifier'),
    effectiveTarget: integer(record.effectiveTarget, 'effectiveTarget'),
    success: booleanValue(record.success, 'success'),
    grade: enumValue(record.grade, grades, 'grade'),
    formula,
  };
});

export const EngineResultSchema: Schema<EngineResult> = schema((value) => {
  const record = requiredRecord(value, 'EngineResult');
  return {
    ok: booleanValue(record.ok, 'ok'),
    scene: enumValue(record.scene, scenes, 'scene'),
    result: enumValue(record.result, ['success', 'fail', 'partial', 'blocked'] as const, 'result'),
    check: record.check === null ? null : CheckResultSchema.parse(record.check),
    roll: nullableInteger(record.roll, 'roll'),
    baseTarget: nullableInteger(record.baseTarget, 'baseTarget'),
    effectiveTarget: nullableInteger(record.effectiveTarget, 'effectiveTarget'),
    grade: record.grade === null ? null : enumValue(record.grade, grades, 'grade'),
    success: booleanValue(record.success, 'success'),
    damage: integer(record.damage, 'damage', { min: 0 }),
    healing: integer(record.healing, 'healing', { min: 0 }),
    playerHp: integer(record.playerHp, 'playerHp', { min: 0 }),
    playerMp: integer(record.playerMp, 'playerMp', { min: 0 }),
    enemyHp: nullableInteger(record.enemyHp, 'enemyHp', { min: 0 }),
    battleEnded: booleanValue(record.battleEnded, 'battleEnded'),
    tags: stringArray(record.tags, 'tags'),
    messageHint: nonEmptyString(record.messageHint, 'messageHint'),
  };
});

export const EnemyDecisionSchema: Schema<EnemyDecision> = schema((value) => {
  const record = requiredRecord(value, 'EnemyDecision');
  if (record.intent !== 'attack') fail('intent must be attack');
  if (record.target !== 'player') fail('target must be player');
  return {
    intent: 'attack',
    target: 'player',
    method: nonEmptyString(record.method, 'method'),
    reasonTag: nonEmptyString(record.reasonTag, 'reasonTag'),
  };
});

export const NarrationResultSchema: Schema<NarrationResult> = schema((value) => {
  const record = requiredRecord(value, 'NarrationResult');
  return {
    text: nonEmptyString(record.text, 'text'),
    choices: stringArray(record.choices, 'choices', { max: 3, nonEmpty: true }),
  };
});

export const SessionSummarySchema: Schema<SessionSummary> = schema((value) => {
  const record = requiredRecord(value, 'SessionSummary');
  const player = requiredRecord(record.player, 'player');
  const enemy = record.enemy === null ? null : requiredRecord(record.enemy, 'enemy');
  return {
    scene: enumValue(record.scene, scenes, 'scene'),
    player: {
      hp: nonEmptyString(player.hp, 'player.hp'),
      mp: nonEmptyString(player.mp, 'player.mp'),
      weapon: nonEmptyString(player.weapon, 'player.weapon'),
      condition: enumValue(player.condition, ['normal', 'wounded', 'exhausted', 'down'] as const, 'player.condition'),
    },
    enemy: enemy ? { hp: nonEmptyString(enemy.hp, 'enemy.hp'), condition: enumValue(enemy.condition, ['normal', 'wounded', 'defeated'] as const, 'enemy.condition') } : null,
    availableActions: stringArray(record.availableActions, 'availableActions'),
  };
});

export const MinimalApiStateSchema: Schema<MinimalApiState> = schema((value) => {
  const summary = SessionSummarySchema.parse(value);
  const record = requiredRecord(value, 'MinimalApiState');
  const candidateIds = requiredRecord(record.candidateIds, 'candidateIds');
  return {
    ...summary,
    turn: integer(record.turn, 'turn', { min: 1 }),
    candidateIds: {
      skills: stringArray(candidateIds.skills, 'candidateIds.skills', { max: 5 }),
      magic: stringArray(candidateIds.magic, 'candidateIds.magic', { max: 5 }),
      items: stringArray(candidateIds.items, 'candidateIds.items', { max: 5 }),
    },
  };
});

export const LlmTaskSchema: Schema<LlmTask> = schema((value) => enumValue(value, llmTasks, 'task'));
export const LlmProviderSchema: Schema<LlmProvider> = schema((value) => enumValue(value, providers, 'provider'));

export const LlmUsageEstimateSchema: Schema<LlmUsageEstimate> = schema((value) => {
  const record = requiredRecord(value, 'LlmUsageEstimate');
  return {
    promptTokens: integer(record.promptTokens, 'promptTokens', { min: 0 }),
    completionTokens: integer(record.completionTokens, 'completionTokens', { min: 0 }),
    provider: enumValue(record.provider, providers, 'provider'),
    model: nonEmptyString(record.model, 'model'),
  };
});

export const LlmCallResultSchema: Schema<LlmCallResult> = schema((value) => {
  const record = requiredRecord(value, 'LlmCallResult');
  const task = enumValue(record.task, llmTasks, 'task');
  const result: LlmCallResult = {
    ok: booleanValue(record.ok, 'ok'),
    task,
    parsedAction: optionalSchema(record.parsedAction, ParsedActionSchema, 'parsedAction'),
    narration: optionalSchema(record.narration, NarrationResultSchema, 'narration'),
    summary: optionalNonEmptyString(record.summary, 'summary'),
    generatedText: optionalNonEmptyString(record.generatedText, 'generatedText'),
    usage: optionalSchema(record.usage, LlmUsageEstimateSchema, 'usage'),
    error: optionalNonEmptyString(record.error, 'error'),
  };
  if (result.ok && result.task === 'interpret' && !result.parsedAction) fail('interpret result requires parsedAction');
  if (result.ok && result.task === 'narrate' && !result.narration) fail('narrate result requires narration');
  if (result.ok && result.task === 'summarize' && !result.summary) fail('summarize result requires summary');
  if (result.ok && result.task === 'generateSkill' && !result.generatedText) fail('generateSkill result requires generatedText');
  return result;
});

export function parsePlayerInput(body: unknown): PlayerInput {
  return PlayerInputSchema.parse(body);
}
