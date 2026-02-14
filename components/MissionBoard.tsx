import React from 'react';
import { MISSIONS } from '../constants';
import { Mission } from '../types';

interface MissionBoardProps {
    onStartMission: (mission: Mission) => void;
}

const MissionBoard: React.FC<MissionBoardProps> = ({ onStartMission }) => {
    return (
        <div className="p-8 h-full bg-stone-900 overflow-y-auto">
            <h2 className="text-4xl font-serif text-stone-200 mb-2">Investigation Board</h2>
            <p className="text-stone-500 mb-8 max-w-2xl">
                Reports of supernatural activity in the region. Select a case file to begin investigation. 
                Warning: Death may result in loss of sanity and progress.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MISSIONS.map(mission => (
                    <div 
                        key={mission.id}
                        className="group bg-stone-800 border border-stone-600 hover:border-red-800 hover:bg-stone-750 transition-all duration-300 p-6 rounded relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
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

                            <p className="text-stone-400 text-sm mb-6 h-12 line-clamp-2">
                                {mission.description}
                            </p>

                            <div className="space-y-2 mb-6 text-sm">
                                <div className="flex justify-between text-stone-500">
                                    <span>Target:</span>
                                    <span className="text-stone-300 capitalize">{mission.bossId.replace('_', ' ')}</span>
                                </div>
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
                ))}
            </div>
        </div>
    );
}

export default MissionBoard;