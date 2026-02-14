import React from 'react';
import { PlayerStats } from '../types';

interface CharacterSheetProps {
    stats: PlayerStats;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ stats }) => {
    return (
        <div className="bg-stone-800 border-b border-stone-700 p-4 flex items-center justify-between shadow-lg z-20 relative">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-stone-900 border border-stone-600 rounded-full flex items-center justify-center overflow-hidden">
                    {/* Placeholder Avatar */}
                    <div className="w-8 h-8 bg-stone-700 rounded-full"></div>
                </div>
                <div>
                    <h1 className="font-serif text-xl font-bold text-stone-200 leading-none">Investigator</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-stone-700 px-1.5 py-0.5 rounded text-stone-300">LVL {stats.level}</span>
                        <div className="w-32 h-2 bg-stone-900 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-yellow-600" 
                                style={{ width: `${(stats.xp / stats.nextLevelXp) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-6 text-sm font-pixel">
                <div className="flex flex-col items-center">
                    <span className="text-red-500 font-bold">{stats.attributes.hp}</span>
                    <span className="text-stone-500 text-[10px] uppercase">HP</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-green-500 font-bold">{stats.attributes.stamina}</span>
                    <span className="text-stone-500 text-[10px] uppercase">STM</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-stone-300 font-bold">{stats.attributes.baseDamage}</span>
                    <span className="text-stone-500 text-[10px] uppercase">DMG</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-blue-400 font-bold">{stats.attributes.speed}</span>
                    <span className="text-stone-500 text-[10px] uppercase">SPD</span>
                </div>
            </div>

            <div className="text-right">
                <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">Status</div>
                <div className="text-emerald-500 font-bold text-sm">HEALTHY</div>
            </div>
        </div>
    );
}

export default CharacterSheet;