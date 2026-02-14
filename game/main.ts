import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Dungeon } from './scenes/Dungeon';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#000000',
    pixelArt: true, // Critical for the aesthetic
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 }, // Top down, no gravity
            debug: false
        }
    },
    scene: [
        Boot,
        Dungeon
    ]
};

const StartGame = (parent: string) => {
    return new Phaser.Game({ ...config, parent });
}

export default StartGame;