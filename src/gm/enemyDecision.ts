import type { EnemyDecision } from '../api/schemas.js';
import type { SessionState } from '../state/sessionState.js';

export function decideEnemyAction(session: SessionState): EnemyDecision | null {
  if (session.scene !== 'combat') return null;
  if (!session.enemy || session.enemy.condition === 'defeated' || session.enemy.currentHp <= 0) return null;
  if (session.player.condition === 'down' || session.player.hp <= 0) return null;

  return {
    intent: 'attack',
    target: 'player',
    method: 'basic_attack',
    reasonTag: 'default_aggressive',
  };
}
