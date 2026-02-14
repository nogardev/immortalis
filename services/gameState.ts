import { BESTIARY_DATA, WEAPONS, INITIAL_PLAYER_STATS } from '../constants';
import { Creature, Weapon, PlayerConfig } from '../types';

class GameStateManager {
    private creatures: Creature[] = [...BESTIARY_DATA];
    private weapons: Weapon[] = [...WEAPONS];
    private playerConfig: PlayerConfig = {
        spritePath: 'assets/sprites/player/idle.png',
        baseStats: { ...INITIAL_PLAYER_STATS.attributes }
    };

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
    }

    // Player
    getPlayerConfig() { return this.playerConfig; }
    
    updatePlayerConfig(config: PlayerConfig) {
        this.playerConfig = config;
    }
}

export const gameState = new GameStateManager();