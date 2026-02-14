// Enums
export enum DamageType {
  PHYSICAL = 'Physical',
  BALLISTIC = 'Ballistic',
  HOLY = 'Holy',
  FIRE = 'Fire',
  OCCULT = 'Occult'
}

export enum ThreatLevel {
  INITIAL = 'Initial (1-3)',
  INTERMEDIATE = 'Intermediate (4-10)',
  DANGEROUS = 'Dangerous (11-20)',
  ENDGAME = 'Endgame (21-25)'
}

// Interfaces
export interface PlayerConfig {
    spritePath: string;
    baseStats: {
        hp: number;
        stamina: number;
        baseDamage: number;
        speed: number;
    }
}

export interface PlayerStats {
  level: number;
  xp: number;
  nextLevelXp: number;
  pointsAvailable: number;
  attributes: {
    hp: number;
    stamina: number;
    baseDamage: number;
    speed: number;
  }
}

export interface Weapon {
  id: string;
  name: string;
  description: string;
  damage: number;
  type: DamageType;
  cooldown: number; // in ms
  spritePath: string;
}

export interface Creature {
  id: string;
  name: string;
  threatLevel: number; // 1-25
  baseHp: number; // New Custom Field
  baseDamage: number; // New Custom Field
  maxPhases?: number; // How many boss phases (1-3)
  description: string;
  behavior: string;
  weaknesses: DamageType[];
  drops: string[];
  spritePath: string; // "assets/sprites/creatures/..."
  illustrationPath: string; // "assets/bestiary/..."
  unlocked: boolean; // For Bestiary
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  threatLevel: number;
  bossId: string;
  rewardXp: number;
  completed: boolean;
}

export interface ChatMessage {
  sender: 'Director' | 'AI DEV';
  text: string;
  timestamp: Date;
}

export interface TileMapData {
    width: number;
    height: number;
    tiles: number[][]; // 0 = floor, 1 = wall/collision
    spawnX: number;
    spawnY: number;
}

// Global Declaration for Asset Registry
declare global {
    interface Window {
        GAME_BLOB_REGISTRY: { [key: string]: string };
    }
}