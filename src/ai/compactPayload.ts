import type { EngineResult, LlmTask, MinimalApiState, ParsedAction } from '../api/schemas.js';

export interface CompactPayloadInput {
  task: LlmTask;
  text?: string;
  state: MinimalApiState;
  action?: ParsedAction;
  engineResult?: EngineResult;
  candidateIds?: readonly string[];
  theme?: string;
  logLines?: readonly string[];
  enemyHint?: string;
}

export type CompactPayload = Record<string, unknown>;

const maxCandidates = 5;
const maxSummaryChars = 300;

export function buildCompactPayload(input: CompactPayloadInput): CompactPayload {
  const state = input.state;
  const payload: CompactPayload = {
    t: normalizeTask(input.task),
    p: playerTuple(state),
    ids: {
      sk: state.candidateIds.skills.slice(0, maxCandidates),
      mg: state.candidateIds.magic.slice(0, maxCandidates),
      it: state.candidateIds.items.slice(0, maxCandidates),
    },
    s: compactSummary(input.logLines ?? [], maxSummaryChars),
  };
  if (input.text) payload.a = input.text.slice(0, 180);
  if (input.action) payload.pa = compactAction(input.action);
  if (input.engineResult) payload.r = compactEngineResult(input.engineResult);
  if (input.candidateIds) payload.cid = input.candidateIds.slice(0, maxCandidates);
  if (input.theme) payload.th = input.theme.slice(0, 80);
  payload.eh = (input.enemyHint ?? enemyHintFromState(state)).slice(0, 40);
  return payload;
}

export function serializeCompactPayload(input: CompactPayloadInput): string {
  return JSON.stringify(buildCompactPayload(input));
}

export function assertCompactPayloadSafe(serialized: string, budget = 1200): void {
  if (serialized.length > budget) throw new Error('compact_payload_budget_exceeded');
  for (const forbidden of ['apiKey', 'groqKey', 'geminiKey', 'openrouterKey', 'enemyHp', 'currentHp', 'catalog', 'rulebook']) {
    if (serialized.includes(forbidden)) throw new Error(`compact_payload_forbidden_field:${forbidden}`);
  }
}

export function compactSummary(lines: readonly string[], maxChars = maxSummaryChars): string {
  return lines.join(' | ').replace(/apiKey|groqKey|geminiKey|openrouterKey/gi, '[redacted]').slice(-maxChars);
}

function normalizeTask(task: LlmTask): string {
  if (task === 'summarize') return 'compact-summary';
  if (task === 'generateSkill') return 'generate-skill';
  return task;
}

function playerTuple(state: MinimalApiState): [number, number, string, string] {
  return [toCurrent(state.player.hp), toCurrent(state.player.mp), state.player.condition, state.player.weapon];
}

function toCurrent(value: string): number {
  const parsed = Number.parseInt(value.split('/')[0] ?? '0', 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function compactAction(action: ParsedAction): Record<string, unknown> {
  return { i: action.intent, tg: action.target, sk: action.skillId, mg: action.magicId, it: action.itemId, aim: action.method };
}

function compactEngineResult(result: EngineResult): Record<string, unknown> {
  return { ok: result.ok, hit: result.success, dmg: result.damage, heal: result.healing, end: result.battleEnded, tags: result.tags.slice(0, 5), hint: result.messageHint };
}

function enemyHintFromState(state: MinimalApiState): string {
  if (!state.enemy) return '기척 없음';
  return state.enemy.hint;
}
