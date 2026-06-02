import type { EngineResult, LlmCallResult, LlmSettings, LlmTask, MinimalApiState, ParsedAction } from '../api/schemas.js';

export type { LlmCallResult, LlmSettings, LlmTask };

export interface LlmRequestBase {
  settings: LlmSettings;
  state: MinimalApiState;
}

export interface InterpretRequest extends LlmRequestBase {
  task: 'interpret';
  text: string;
}

export interface NarrateRequest extends LlmRequestBase {
  task: 'narrate';
  action: ParsedAction;
  engineResult: EngineResult;
}

export interface SummarizeRequest extends LlmRequestBase {
  task: 'summarize';
  logLines: string[];
}

export interface GenerateSkillRequest extends LlmRequestBase {
  task: 'generateSkill';
  candidateIds: string[];
  theme: string;
}

export type LlmRequest = InterpretRequest | NarrateRequest | SummarizeRequest | GenerateSkillRequest;

export interface LlmAdapter {
  provider: LlmSettings['provider'];
  call(request: LlmRequest): Promise<LlmCallResult>;
  test(settings: LlmSettings): Promise<{ ok: boolean; message: string }>;
}
