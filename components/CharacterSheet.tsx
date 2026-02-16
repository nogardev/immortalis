import React from 'react';
import { PlayerStats } from '../types';

interface CharacterSheetProps {
    stats: PlayerStats;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ stats }) => {
    return (
        <div className="retro-border bg-stone-900 p-2 flex items-center justify-between z-20 relative mx-4 mt-4">
            {/* Left: Name & Level */}
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-[#000080] border-2 border-white flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-full"></div> {/* Placeholder Face */}
                </div>
                <div>
                    <h1 className="font-pixel text-2xl text-white leading-none tracking-widest drop-shadow-md">DETECTIVE</h1>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-pixel text-[#ffff00]">LV {stats.level}</span>
                        <div className="w-24 h-2 bg-stone-800 border border-stone-600 relative">
                            <div 
                                className="h-full bg-[#ffff00]" 
                                style={{ width: `${(stats.xp / stats.nextLevelXp) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle: Stats Block */}
            <div className="flex gap-8 text-lg font-pixel">
                <div className="flex flex-col items-center">
                    <span className="text-stone-400 text-[10px] leading-none mb-1">HP</span>
                    <span className="text-white font-bold text-shadow">{stats.attributes.hp}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-stone-400 text-[10px] leading-none mb-1">STM</span>
                    <span className="text-white font-bold">{stats.attributes.stamina}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-stone-400 text-[10px] leading-none mb-1">ATK</span>
                    <span className="text-white font-bold">{stats.attributes.baseDamage}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-stone-400 text-[10px] leading-none mb-1">SPD</span>
                    <span className="text-white font-bold">{stats.attributes.speed}</span>
                </div>
            </div>

            {/* Right: Status */}
            <div className="bg-[#000080] border-2 border-white px-3 py-1">
                <span className="font-pixel text-[#00ff00] animate-pulse">CONDITION: GOOD</span>
            </div>
        </div>
    );
}

export default CharacterSheet;