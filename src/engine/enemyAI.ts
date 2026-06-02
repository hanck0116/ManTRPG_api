import type { EnemyDecision } from '../api/schemas.js';
import type { SessionState } from '../state/sessionState.js';

export function decideEnemyAction(session: SessionState): EnemyDecision | null {
  if (session.scene !== 'combat') return null;
  if (!session.enemy || session.enemy.condition === 'defeated') return null;
  if (session.player.condition === 'down') return null;

  return {
    intent: 'attack',
    target: 'player',
    method: 'basic_attack',
    reasonTag: 'single_enemy_default',
  };
}
