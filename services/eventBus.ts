import Phaser from 'phaser';

// Simple event bus using Phaser's built-in events system mechanism independent of a specific scene
export const eventBus = new Phaser.Events.EventEmitter();

export enum GameEvents {
  PLAYER_HP_CHANGE = 'player-hp-change',
  GAME_OVER = 'game-over',
  MISSION_COMPLETE = 'mission-complete',
  START_MISSION = 'start-mission',
  REQUEST_DEV_ACTION = 'request-dev-action'
}