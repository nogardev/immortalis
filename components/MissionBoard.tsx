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
        <div className="p-8 h-full bg-[#1c1917] overflow-y-auto">
            <div className="max-w-6xl mx-auto border-[8px] border-[#3f2e22] bg-[#5d4037] p-8 shadow-2xl min-h-full">
                <div className="bg-[#2d221c] p-4 mb-8 retro-border text-center">
                     <h2 className="text-4xl font-pixel text-[#ffcc00] tracking-widest uppercase drop-shadow-md">
                        CASE FILES
                    </h2>
                    <p className="text-stone-400 font-pixel text-lg mt-1">
                        Select a pending investigation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {MISSIONS.map(mission => {
                        const bossData = gameState.getCreatureById(mission.bossId);
                        const bossSprite = bossData ? resolveAssetPath(bossData.spritePath) : null;

                        return (
                            <div 
                                key={mission.id}
                                className="group relative bg-[#f3e5ab] p-6 shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-200"
                                style={{
                                    clipPath: "polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)" // Folded corner
                                }}
                            >
                                {/* Pin */}
                                <div className="absolute top-[-10px] left-1/2 -ml-2 w-4 h-4 rounded-full bg-red-800 shadow-md border border-red-950 z-20"></div>

                                <div className="border-b-2 border-stone-800 pb-2 mb-4 flex justify-between items-start">
                                    <h3 className="text-xl font-bold font-serif text-black leading-none">{mission.title}</h3>
                                    <span className="font-pixel text-xs bg-black text-white px-1">
                                        LV {mission.threatLevel}
                                    </span>
                                </div>

                                {/* Boss Preview */}
                                <div className="flex gap-4 mb-4 items-center">
                                    <div className="w-16 h-16 border-2 border-black bg-white flex items-center justify-center p-1">
                                        {bossSprite ? (
                                            <img 
                                                src={bossSprite} 
                                                alt="Boss" 
                                                className="w-full h-full object-contain image-pixelated" 
                                            />
                                        ) : (
                                            <span className="text-xl text-black font-bold">?</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                         <div className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Target</div>
                                         <div className="text-red-900 capitalize text-lg font-serif font-bold leading-tight">
                                            {bossData ? bossData.name : mission.bossId.replace('_', ' ')}
                                         </div>
                                    </div>
                                </div>

                                <p className="text-stone-800 font-serif text-md italic mb-6 leading-snug">
                                    "{mission.description}"
                                </p>

                                <div className="space-y-2 mb-6 text-sm border-t-2 border-dotted border-stone-400 pt-2">
                                    <div className="flex justify-between text-stone-800 font-bold font-pixel">
                                        <span>BOUNTY:</span>
                                        <span>{mission.rewardXp} XP</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => onStartMission(mission)}
                                    className="w-full retro-btn bg-[#8b0000] text-[#ffcc00] py-3 font-pixel text-xl uppercase tracking-widest hover:bg-[#a50000] transition-colors"
                                >
                                    INVESTIGATE
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default MissionBoard;