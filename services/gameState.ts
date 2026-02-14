import { BESTIARY_DATA, WEAPONS, INITIAL_PLAYER_STATS, GITHUB_ASSET_BASE_URL } from '../constants';
import { Creature, Weapon, PlayerConfig } from '../types';
import { ASSET_REGISTRY } from '../game/asset_registry';

// Bump to V8: Add assetSourceMode
const STORAGE_KEY = 'IMMORTALIS_GAME_STATE_V8';

type AssetSourceMode = 'LOCAL' | 'GITHUB';

class GameStateManager {
    private creatures: Creature[];
    private weapons: Weapon[];
    private playerConfig: PlayerConfig;
    private assetSourceMode: AssetSourceMode;

    constructor() {
        // Try to load from LocalStorage
        const savedState = localStorage.getItem(STORAGE_KEY);
        
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                this.creatures = parsed.creatures || [...BESTIARY_DATA];
                this.weapons = parsed.weapons || [...WEAPONS];
                // Default to GITHUB if not explicit, assuming public repo
                this.assetSourceMode = parsed.assetSourceMode || 'GITHUB'; 
                
                // Ensure player config has a valid sprite path (fallback to constant if missing/broken)
                this.playerConfig = parsed.playerConfig || {
                    spritePath: ASSET_REGISTRY.PLAYER.IDLE,
                    baseStats: { ...INITIAL_PLAYER_STATS.attributes }
                };

                // CLEANUP: If the saved state contains the old raw.github URL, strip it out 
                // so we can use the new relative path / external URL logic.
                const cleanup = (path: string) => {
                     if (path.includes('raw.githubusercontent.com')) {
                         // Attempt to find the relative part
                         const marker = '/main/';
                         const idx = path.indexOf(marker);
                         if (idx !== -1) {
                             return path.substring(idx + marker.length);
                         }
                     }
                     return path;
                };

                this.playerConfig.spritePath = cleanup(this.playerConfig.spritePath);
                this.creatures.forEach(c => {
                    c.spritePath = cleanup(c.spritePath);
                    c.illustrationPath = cleanup(c.illustrationPath);
                });
                this.weapons.forEach(w => {
                    w.spritePath = cleanup(w.spritePath);
                });

                console.log('IMMORTALIS: State loaded from LocalStorage (V8)');
            } catch (e) {
                console.error('IMMORTALIS: Failed to parse save data, reverting to defaults', e);
                this.resetToDefaults();
            }
        } else {
            this.resetToDefaults();
        }
    }

    private resetToDefaults() {
        this.creatures = [...BESTIARY_DATA];
        this.weapons = [...WEAPONS];
        this.assetSourceMode = 'GITHUB'; // Default to GITHUB (Public)
        this.playerConfig = {
            spritePath: ASSET_REGISTRY.PLAYER.IDLE,
            baseStats: { ...INITIAL_PLAYER_STATS.attributes }
        };
    }

    private save() {
        const state = {
            creatures: this.creatures,
            weapons: this.weapons,
            playerConfig: this.playerConfig,
            assetSourceMode: this.assetSourceMode
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn("IMMORTALIS: Storage Quota Exceeded. Assets might be too large.");
        }
    }

    // Settings
    getAssetSourceMode() { return this.assetSourceMode; }
    setAssetSourceMode(mode: AssetSourceMode) {
        this.assetSourceMode = mode;
        this.save();
        // Force reload to apply constant changes effectively
        window.location.reload(); 
    }

    // Creatures
    getCreatures() { return this.creatures; }
    
    getCreatureById(id: string) { 
        return this.creatures.find(c => c.id === id); 
    }

    updateCreature(updatedCreature: Creature) {
        const index = this.creatures.findIndex(c => c.id === updatedCreature.id);
        if (index !== -1) {
            this.creatures[index] = updatedCreature;
        } else {
            this.creatures.push(updatedCreature);
        }
        this.save();
    }

    // Weapons
    getWeapons() { return this.weapons; }

    updateWeapon(updatedWeapon: Weapon) {
        const index = this.weapons.findIndex(w => w.id === updatedWeapon.id);
        if (index !== -1) {
            this.weapons[index] = updatedWeapon;
        } else {
            this.weapons.push(updatedWeapon);
        }
        this.save();
    }

    // Player
    getPlayerConfig() { return this.playerConfig; }
    
    updatePlayerConfig(config: PlayerConfig) {
        this.playerConfig = config;
        this.save();
    }
    
    // Utils
    resetData() {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
    }
}

export const gameState = new GameStateManager();