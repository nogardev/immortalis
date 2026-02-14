import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import StartGame from '../game/main';
import { eventBus, GameEvents } from '../services/eventBus';

interface GameCanvasProps {
    onGameOver: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver }) => {
    const gameInstanceRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        // Avoid double initialization in React Strict Mode
        if (gameInstanceRef.current === null) {
            gameInstanceRef.current = StartGame('game-container');
            
            // Listen for events from Phaser
            eventBus.on(GameEvents.GAME_OVER, onGameOver);
        }

        return () => {
            if (gameInstanceRef.current) {
                gameInstanceRef.current.destroy(true);
                gameInstanceRef.current = null;
                eventBus.off(GameEvents.GAME_OVER, onGameOver);
            }
        };
    }, [onGameOver]);

    return (
        <div id="game-container" className="rounded-lg overflow-hidden border-2 border-stone-700 shadow-2xl shadow-black" />
    );
}

export default GameCanvas;