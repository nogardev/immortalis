import React, { useEffect, useRef } from 'react';
import { ImmortalisEngine } from '../game/main';
import { eventBus, GameEvents } from '../services/eventBus';
import { Mission } from '../types';

interface GameCanvasProps {
    mission: Mission | null;
    onGameOver: () => void;
    onMissionComplete: (result: any) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ mission, onGameOver, onMissionComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<ImmortalisEngine | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Initialize Custom Engine with Mission Data
        const engine = new ImmortalisEngine(canvasRef.current, mission || undefined);
        engineRef.current = engine;
        engine.start();

        // Listen for events from Engine
        eventBus.on(GameEvents.GAME_OVER, onGameOver);
        eventBus.on(GameEvents.MISSION_COMPLETE, onMissionComplete);

        return () => {
            engine.stop();
            eventBus.off(GameEvents.GAME_OVER, onGameOver);
            eventBus.off(GameEvents.MISSION_COMPLETE, onMissionComplete);
        };
    }, [onGameOver, onMissionComplete, mission]);

    return (
        <canvas 
            ref={canvasRef} 
            width={800} 
            height={600} 
            className="rounded-lg overflow-hidden border-2 border-stone-700 shadow-2xl shadow-black bg-black"
        />
    );
}

export default GameCanvas;