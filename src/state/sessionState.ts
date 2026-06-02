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
  enemy: { hp: string; condition: EnemyState['condition'] } | null;
  availableActions: string[];
  candidateIds: {
    skills: string[];
    magic: string[];
    items: string[];
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
          hp: `${session.enemy.currentHp}/${session.enemy.hp}`,
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
