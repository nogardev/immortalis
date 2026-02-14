import React, { useState, useEffect } from 'react';
import { MISSIONS, resolveAssetPath } from '../constants';
import { Mission } from '../types';
import { gameState } from '../services/gameState';

interface MissionBoardProps {
    onStartMission: (mission: Mission) => void;
}

const MissionBoard: React.FC<MissionBoardProps> = ({ onStartMission }) => {
    // Force re-render to get latest GameState data (in case editor changed something)
    const [, setTick] = useState(0);
    useEffect(() => setTick(t => t + 1), []);

    return (
        <div className="p-8 h-full bg-stone-900 overflow-y-auto">
            <h2 className="text-4xl font-serif text-stone-200 mb-2">Investigation Board</h2>
            <p className="text-stone-500 mb-8 max-w-2xl">
                Reports of supernatural activity in the region. Select a case file to begin investigation. 
                Warning: Death may result in loss of sanity and progress.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MISSIONS.map(mission => {
                    const bossData = gameState.getCreatureById(mission.bossId);
                    const bossSprite = bossData ? resolveAssetPath(bossData.spritePath) : null;

                    return (
                        <div 
                            key={mission.id}
                            className="group bg-stone-800 border border-stone-600 hover:border-red-800 hover:bg-stone-750 transition-all duration-300 p-6 rounded relative overflow-hidden"
                        >
                            {/* Background Icon (Faded) */}
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-5 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold font-serif text-stone-100">{mission.title}</h3>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                        mission.threatLevel > 3 ? 'border-red-500 text-red-500' : 'border-emerald-500 text-emerald-500'
                                    }`}>
                                        THREAT {mission.threatLevel}
                                    </span>
                                </div>

                                {/* Boss Preview Section */}
                                <div className="flex gap-4 mb-4 items-center bg-stone-900/50 p-2 rounded border border-stone-700">
                                    <div className="w-12 h-12 bg-stone-950 border border-stone-600 flex items-center justify-center overflow-hidden">
                                        {bossSprite ? (
                                            <img 
                                                src={bossSprite} 
                                                alt="Boss" 
                                                className="w-10 h-10 object-contain image-pixelated" 
                                            />
                                        ) : (
                                            <span className="text-xs text-stone-600">?</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                         <div className="text-[10px] text-stone-500 uppercase">Target Entity</div>
                                         <div className="text-stone-300 capitalize text-sm font-bold">
                                            {bossData ? bossData.name : mission.bossId.replace('_', ' ')}
                                         </div>
                                    </div>
                                </div>

                                <p className="text-stone-400 text-sm mb-6 h-10 line-clamp-2">
                                    {mission.description}
                                </p>

                                <div className="space-y-2 mb-6 text-sm border-t border-stone-700 pt-2">
                                    <div className="flex justify-between text-stone-500">
                                        <span>Reward:</span>
                                        <span className="text-yellow-600 font-pixel">{mission.rewardXp} XP</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => onStartMission(mission)}
                                    className="w-full bg-stone-900 border border-stone-600 text-stone-300 py-3 font-serif uppercase tracking-widest hover:bg-red-900 hover:text-white hover:border-red-700 transition-colors"
                                >
                                    Accept Case
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default MissionBoard;