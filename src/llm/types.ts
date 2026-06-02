import type { EngineResult, LlmCallResult, LlmSettings, LlmTask, MinimalApiState, ParsedAction } from '../api/schemas.js';

export type { LlmCallResult, LlmSettings, LlmTask };

export interface LlmRequestBase {
  settings: LlmSettings;
  state: MinimalApiState;
}

export interface InterpretRequest extends LlmRequestBase { task: 'interpret'; text: string; }
export interface EnemyActionRequest extends LlmRequestBase { task: 'enemy-action'; engineResult?: EngineResult; }
export interface NarrateRequest extends LlmRequestBase { task: 'narrate'; action: ParsedAction; engineResult: EngineResult; }
export interface SummarizeRequest extends LlmRequestBase { task: 'compact-summary' | 'summarize'; logLines: string[]; }
export interface GenerateSkillRequest extends LlmRequestBase { task: 'generate-skill' | 'generateSkill'; candidateIds: string[]; theme: string; }

export type LlmRequest = InterpretRequest | EnemyActionRequest | NarrateRequest | SummarizeRequest | GenerateSkillRequest;

export interface LlmAdapter {
  provider: LlmSettings['provider'];
  call(request: LlmRequest): Promise<LlmCallResult>;
  test(settings: LlmSettings): Promise<{ ok: boolean; message: string }>;
}
