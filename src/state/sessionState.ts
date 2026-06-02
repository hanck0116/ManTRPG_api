import { enemyCatalog, type EnemyTemplate } from '../data/enemies.js';
import { createDefaultPlayerState, summarizePlayer, type PlayerState, type PlayerSummary } from './playerState.js';

export type Scene = 'combat' | 'rest' | 'dialogue';

export interface EnemyState extends EnemyTemplate {
  currentHp: number;
  condition: 'normal' | 'wounded' | 'defeated';
}

export interface SessionState {
  sessionId: string;
  scene: Scene;
  player: PlayerState;
  enemy: EnemyState | null;
  turn: number;
  logSummary: string[];
}

export interface MinimalApiState {
  scene: Scene;
  turn: number;
  player: PlayerSummary;
  enemy: { hint: string; condition: EnemyState['condition'] } | null;
  availableActions: readonly string[];
  candidateIds: {
    skills: readonly string[];
    magic: readonly string[];
    items: readonly string[];
  };
}

export function createEnemyState(enemyId = 'ENEMY_STRAY_SHADOW'): EnemyState {
  const template = enemyCatalog[enemyId];
  if (!template) {
    throw new Error(`Unknown enemy id: ${enemyId}`);
  }

  return {
    ...template,
    currentHp: template.hp,
    condition: 'normal',
  };
}

export function createSessionState(sessionId = 'demo'): SessionState {
  return {
    sessionId,
    scene: 'combat',
    player: createDefaultPlayerState(),
    enemy: createEnemyState(),
    turn: 1,
    logSummary: [],
  };
}

export function summarizeSession(session: SessionState): MinimalApiState {
  return {
    scene: session.scene,
    turn: session.turn,
    player: summarizePlayer(session.player),
    enemy: session.enemy
      ? {
          hint: enemyVisibleHint(session.enemy),
          condition: session.enemy.condition,
        }
      : null,
    availableActions: session.scene === 'combat' ? ['attack', 'skill', 'magic', 'item', 'defend'] : ['talk', 'inspect', 'rest'],
    candidateIds: {
      skills: session.player.skills.slice(0, 5),
      magic: session.player.magic.slice(0, 5),
      items: Object.entries(session.player.inventory).filter(([, count]) => count > 0).map(([itemId]) => itemId).slice(0, 5),
    },
  };
}

export function enemyVisibleHint(enemy: EnemyState): string {
  if (enemy.condition === 'defeated') return '쓰러진 기척';
  if (enemy.condition === 'wounded') return '상처 입은 듯함';
  return '위협적인 기척';
}
