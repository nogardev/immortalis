import React, { useState } from 'react';
import { gameState } from '../services/gameState';
import { Creature, DamageType } from '../types';
import { GITHUB_ASSET_BASE_URL } from '../constants';

const Bestiary: React.FC = () => {
    // Fetch dynamic data from GameState instead of static constants
    const creatures = gameState.getCreatures();
    
    const [selectedId, setSelectedId] = useState<string | null>(creatures[0]?.id || null);
    const selectedCreature = creatures.find(c => c.id === selectedId);

    const resolveUrl = (path: string) => {
        if (!path) return '';
        // Check global registry for blob URLs (from Editor imports)
        // @ts-ignore
        if (window.GAME_BLOB_REGISTRY && window.GAME_BLOB_REGISTRY[path]) return window.GAME_BLOB_REGISTRY[path];
        return path;
    };

    return (
        <div className="flex h-full w-full bg-stone-950 p-8">
            {/* Book Container */}
            <div className="flex w-full max-w-5xl mx-auto bg-[#eaddcf] text-stone-900 rounded-lg shadow-2xl overflow-hidden border-4 border-stone-800 relative">
                {/* Texture overlay for paper effect */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>

                {/* Left Page - List */}
                <div className="w-1/3 border-r-2 border-[#d3c2b0] p-6 flex flex-col relative z-10">
                    <h2 className="text-3xl font-bold mb-6 font-serif text-stone-800 border-b-2 border-stone-400 pb-2">Bestiary</h2>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {creatures.map(creature => (
                            <button
                                key={creature.id}
                                onClick={() => setSelectedId(creature.id)}
                                className={`w-full text-left p-3 rounded font-serif text-lg transition-all ${
                                    selectedId === creature.id 
                                        ? 'bg-stone-800 text-[#eaddcf] shadow-md' 
                                        : 'hover:bg-[#d3c2b0] text-stone-800'
                                }`}
                            >
                                {creature.unlocked ? creature.name : '?????????'}
                                <span className="block text-xs opacity-60 mt-1">
                                    Threat: {creature.unlocked ? creature.threatLevel : '?'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Page - Details */}
                <div className="w-2/3 p-8 flex flex-col relative z-10 bg-[#f3efe8]">
                    {selectedCreature ? (
                        selectedCreature.unlocked ? (
                            <div className="h-full flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-4xl font-serif font-bold text-stone-900">{selectedCreature.name}</h3>
                                        <p className="text-stone-600 italic mt-1 text-xl">Class: Supernatural Entity</p>
                                    </div>
                                    <div className="bg-red-900 text-white px-3 py-1 rounded text-sm font-bold">
                                        LVL {selectedCreature.threatLevel}
                                    </div>
                                </div>

                                <div className="flex gap-6 mb-6">
                                    <div className="w-48 h-48 bg-stone-900 border-4 border-stone-800 shadow-inner shrink-0 overflow-hidden">
                                        <img 
                                            src={resolveUrl(selectedCreature.illustrationPath)} 
                                            alt={selectedCreature.name} 
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                // Try GitHub fallback if local failed and not already tried
                                                if (!target.src.includes('raw.githubusercontent.com') && !selectedCreature.illustrationPath.startsWith('http')) {
                                                    target.src = `${GITHUB_ASSET_BASE_URL}${selectedCreature.illustrationPath}`;
                                                }
                                            }}
                                            className="w-full h-full object-cover opacity-90" 
                                        />
                                    </div>
                                    <p className="text-lg leading-relaxed font-serif text-stone-800">
                                        {selectedCreature.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mt-auto">
                                    <div className="bg-[#eaddcf] p-4 rounded border border-[#d3c2b0]">
                                        <h4 className="font-bold text-stone-700 uppercase tracking-widest text-sm mb-2 border-b border-stone-400 pb-1">Behavior</h4>
                                        <p className="font-serif">{selectedCreature.behavior}</p>
                                    </div>
                                    <div className="bg-[#eaddcf] p-4 rounded border border-[#d3c2b0]">
                                        <h4 className="font-bold text-stone-700 uppercase tracking-widest text-sm mb-2 border-b border-stone-400 pb-1">Known Weaknesses</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCreature.weaknesses.map(w => (
                                                <span key={w} className="px-2 py-1 bg-stone-800 text-[#eaddcf] text-xs uppercase font-bold rounded">
                                                    {w}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-span-2 bg-[#eaddcf] p-4 rounded border border-[#d3c2b0]">
                                        <h4 className="font-bold text-stone-700 uppercase tracking-widest text-sm mb-2 border-b border-stone-400 pb-1">Potential Drops</h4>
                                        <p className="font-serif italic">{selectedCreature.drops.join(', ')}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center flex-col text-stone-400">
                                <span className="text-6xl mb-4">🔒</span>
                                <h3 className="text-2xl font-serif">Research Required</h3>
                                <p>Encounter this entity to reveal its nature.</p>
                            </div>
                        )
                    ) : (
                        <div className="h-full flex items-center justify-center text-stone-400">
                            Select an entry
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Bestiary;