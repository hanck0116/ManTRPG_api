import type { EnemyActionIntent, EnemyDecision } from '../api/schemas.js';
import type { SessionState } from '../state/sessionState.js';

export function decideEnemyAction(session: SessionState, llmIntent?: EnemyActionIntent | null): EnemyDecision | null {
  if (session.scene !== 'combat') return null;
  if (!session.enemy || session.enemy.condition === 'defeated') return null;
  if (session.player.condition === 'down') return null;

  const intent = llmIntent?.intent ?? (session.enemy.condition === 'wounded' ? 'pressure' : 'attack');
  return {
    intent,
    target: 'player',
    method: intent === 'guard' ? 'enemy_guards' : intent === 'wait' ? 'enemy_waits' : 'basic_attack',
    reasonTag: llmIntent ? `llm_${llmIntent.style}` : 'single_hidden_enemy_code_ai',
    llmIntent: llmIntent ?? undefined,
  };
}
