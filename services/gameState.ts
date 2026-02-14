import { BESTIARY_DATA, WEAPONS, INITIAL_PLAYER_STATS } from '../constants';
import { Creature, Weapon, PlayerConfig } from '../types';

const STORAGE_KEY = 'IMMORTALIS_GAME_STATE_V1';

class GameStateManager {
    private creatures: Creature[];
    private weapons: Weapon[];
    private playerConfig: PlayerConfig;

    constructor() {
        // Try to load from LocalStorage
        const savedState = localStorage.getItem(STORAGE_KEY);
        
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                this.creatures = parsed.creatures || [...BESTIARY_DATA];
                this.weapons = parsed.weapons || [...WEAPONS];
                this.playerConfig = parsed.playerConfig || {
                    spritePath: 'assets/sprites/player/idle.png',
                    baseStats: { ...INITIAL_PLAYER_STATS.attributes }
                };
                console.log('IMMORTALIS: State loaded from LocalStorage');
            } catch (e) {
                console.error('IMMORTALIS: Failed to parse save data, reverting to defaults', e);
                this.creatures = [...BESTIARY_DATA];
                this.weapons = [...WEAPONS];
                this.playerConfig = {
                    spritePath: 'assets/sprites/player/idle.png',
                    baseStats: { ...INITIAL_PLAYER_STATS.attributes }
                };
            }
        } else {
            // Default Initialization
            this.creatures = [...BESTIARY_DATA];
            this.weapons = [...WEAPONS];
            this.playerConfig = {
                spritePath: 'assets/sprites/player/idle.png',
                baseStats: { ...INITIAL_PLAYER_STATS.attributes }
            };
        }
    }

    private save() {
        const state = {
            creatures: this.creatures,
            weapons: this.weapons,
            playerConfig: this.playerConfig
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn("IMMORTALIS: Storage Quota Exceeded. Assets might be too large.");
        }
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