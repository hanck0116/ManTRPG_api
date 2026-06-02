import type { EngineResult } from '../engine/combat.js';
import type { ParsedAction } from '../engine/judgment.js';

export interface PlayerInput {
  sessionId: string;
  text: string;
}

export type { ParsedAction, EngineResult };

export interface NarrationResult {
  text: string;
  choices: string[];
}

export function parsePlayerInput(body: unknown): PlayerInput {
  if (!body || typeof body !== 'object') throw new Error('body must be an object');
  const candidate = body as Record<string, unknown>;
  if (typeof candidate.sessionId !== 'string' || typeof candidate.text !== 'string') {
    throw new Error('sessionId and text are required strings');
  }
  return { sessionId: candidate.sessionId, text: candidate.text };
}
