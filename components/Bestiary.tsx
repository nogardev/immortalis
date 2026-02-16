import React, { useState } from 'react';
import { gameState } from '../services/gameState';
import { Creature, DamageType } from '../types';
import { resolveAssetPath } from '../constants';

const Bestiary: React.FC = () => {
    // Fetch dynamic data from GameState instead of static constants
    const creatures = gameState.getCreatures();
    
    const [selectedId, setSelectedId] = useState<string | null>(creatures[0]?.id || null);
    const selectedCreature = creatures.find(c => c.id === selectedId);

    return (
        <div className="flex h-full w-full bg-stone-950 p-8 items-center justify-center">
            {/* GRIMM BOOK CONTAINER */}
            <div className="relative flex w-[900px] h-[600px] bg-[#4a3b32] border-[12px] border-[#2d221c] rounded-lg shadow-2xl">
                
                {/* Book Spine Shadow */}
                <div className="absolute inset-y-0 left-1/2 w-16 -ml-8 bg-gradient-to-r from-transparent via-black/40 to-transparent z-20 pointer-events-none"></div>

                {/* LEFT PAGE (List) */}
                <div className="w-1/2 h-full bg-[#dfd3c3] p-8 border-r border-[#c4b6a6] rounded-l-md relative overflow-hidden flex flex-col">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] pointer-events-none"></div>
                    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#b5a695] to-transparent pointer-events-none z-10"></div>

                    <h2 className="text-4xl font-serif text-[#2d221c] text-center border-b-2 border-[#2d221c] pb-2 mb-6 tracking-wider">
                        Bestiarium
                    </h2>
                    
                    <div className="flex-1 overflow-y-auto space-y-2 pr-4 custom-scrollbar z-10">
                        {creatures.map(creature => (
                            <button
                                key={creature.id}
                                onClick={() => setSelectedId(creature.id)}
                                className={`w-full text-left font-serif text-xl px-4 py-2 transition-all border-b border-[#c4b6a6]/50 ${
                                    selectedId === creature.id 
                                        ? 'text-[#8b0000] font-bold bg-[#c4b6a6]/30 -ml-2 pl-6' 
                                        : 'text-[#4a3b32] hover:text-[#6d564a] hover:pl-6'
                                }`}
                            >
                                {creature.unlocked ? creature.name : 'Unknown Entity'}
                            </button>
                        ))}
                    </div>
                    
                    <div className="mt-4 text-center">
                        <span className="font-serif text-[#4a3b32] opacity-50 text-sm">- I -</span>
                    </div>
                </div>

                {/* RIGHT PAGE (Details) */}
                <div className="w-1/2 h-full bg-[#dfd3c3] p-8 rounded-r-md relative flex flex-col">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] pointer-events-none"></div>
                    <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#b5a695] to-transparent pointer-events-none z-10"></div>

                    {selectedCreature ? (
                        selectedCreature.unlocked ? (
                            <div className="relative z-10 h-full flex flex-col">
                                <h3 className="text-3xl font-serif font-bold text-[#2d221c] mb-1">{selectedCreature.name}</h3>
                                <p className="text-[#8b0000] font-serif italic text-sm mb-4 border-b border-[#c4b6a6] pb-2">
                                    Threat Classification: Class {selectedCreature.threatLevel}
                                </p>

                                <div className="flex gap-4 mb-4">
                                    <div className="w-40 h-40 bg-[#c4b6a6] border-4 border-[#2d221c] p-1 shadow-inner rotate-[-2deg]">
                                        <div className="w-full h-full bg-[#e8e0d5] overflow-hidden">
                                            <img 
                                                src={resolveAssetPath(selectedCreature.illustrationPath)} 
                                                alt={selectedCreature.name} 
                                                className="w-full h-full object-cover sepia contrast-125" 
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                         <p className="font-serif text-[#2d221c] text-lg leading-6 first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-1 first-letter:text-[#8b0000]">
                                            {selectedCreature.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-auto space-y-4">
                                    <div className="bg-[#d5c8b8] p-3 border border-[#b5a695] rounded-sm">
                                        <h4 className="font-bold text-[#4a3b32] uppercase text-xs mb-1">Observed Behavior</h4>
                                        <p className="font-serif text-[#2d221c] text-md italic">{selectedCreature.behavior}</p>
                                    </div>
                                    
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-[#4a3b32] uppercase text-xs mb-1">Vulnerabilities</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedCreature.weaknesses.map(w => (
                                                    <span key={w} className="px-2 py-0.5 border border-[#8b0000] text-[#8b0000] text-xs font-serif font-bold bg-[#e8e0d5]">
                                                        {w}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-[#4a3b32] uppercase text-xs mb-1">Harvest</h4>
                                            <p className="font-serif text-[#2d221c] text-sm">{selectedCreature.drops.join(', ')}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 text-center">
                                    <span className="font-serif text-[#4a3b32] opacity-50 text-sm">- II -</span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center flex-col text-[#8b0000]/50 relative z-10">
                                <div className="text-8xl font-serif mb-4">?</div>
                                <h3 className="text-2xl font-serif">Research Required</h3>
                                <p className="font-serif italic">This page is torn and unreadable.</p>
                            </div>
                        )
                    ) : (
                        <div className="h-full flex items-center justify-center text-[#4a3b32]/50 font-serif italic relative z-10">
                            Select an entry from the index...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Bestiary;