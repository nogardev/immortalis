import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Creature } from '../types';
import { GITHUB_ASSET_BASE_URL, IS_REPO_PUBLIC } from '../constants';
import { gameState } from '../services/gameState';
import { eventBus, GameEvents } from '../services/eventBus';

const INITIAL_MESSAGES: ChatMessage[] = [
    {
        sender: 'AI DEV',
        text: 'IMMORTALIS Engine initialized. \n\n✅ MODE: ' + (IS_REPO_PUBLIC ? 'PUBLIC (GitHub Raw)' : 'PRIVATE (Local)') + '\n\nI can now modify game parameters in real-time. Try commands like:\n- "Set Loira HP to 1000"\n- "Set Loira Phases to 3"\n- "Unlock all"',
        timestamp: new Date()
    }
];

const DevChat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
    const [input, setInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const findCreature = (name: string): Creature | undefined => {
        const creatures = gameState.getCreatures();
        const lowerName = name.toLowerCase();
        
        // Exact ID match first
        let found = creatures.find(c => c.id === lowerName);
        if (found) return found;

        // Then generic name search
        return creatures.find(c => 
            c.name.toLowerCase().includes(lowerName) || 
            c.id.toLowerCase().includes(lowerName)
        );
    };

    const processCommand = (text: string): string => {
        const cmd = text.toLowerCase();

        // --- COMMAND: SET STATS (HP, DAMAGE, PHASES) ---
        // Regex: "Set [Name] [Stat] to [Value]"
        const setRegex = /(?:set|change|update)\s+(.+?)\s+(hp|health|damage|dmg|speed|phases|threat)\s+(?:to\s+)?(\d+)/i;
        const setMatch = cmd.match(setRegex);

        if (setMatch) {
            const targetName = setMatch[1];
            const stat = setMatch[2];
            const value = parseInt(setMatch[3]);

            if (targetName.includes('player')) {
                // Update Player
                const config = gameState.getPlayerConfig();
                if (stat.includes('hp') || stat.includes('health')) config.baseStats.hp = value;
                if (stat.includes('speed')) config.baseStats.speed = value;
                if (stat.includes('dmg') || stat.includes('damage')) config.baseStats.baseDamage = value;
                
                gameState.updatePlayerConfig(config);
                return `ACTUALIZING PLAYER: ${stat.toUpperCase()} set to ${value}. Changes saved to storage.`;
            } else {
                // Update Creature
                const creature = findCreature(targetName);
                if (creature) {
                    if (stat.includes('hp') || stat.includes('health')) creature.baseHp = value;
                    if (stat.includes('dmg') || stat.includes('damage')) creature.baseDamage = value;
                    if (stat.includes('phases')) creature.maxPhases = value;
                    if (stat.includes('threat')) creature.threatLevel = value;
                    
                    gameState.updateCreature(creature);
                    return `DATABASE UPDATE: ${creature.name} now has ${stat.toUpperCase()} = ${value}. \n(Note: If boss is alive, respawn needed to apply)`;
                } else {
                    return `ERROR: Entity "${targetName}" not found in database.`;
                }
            }
        }

        // --- COMMAND: UNLOCK ALL ---
        if (cmd.includes('unlock all') || cmd.includes('reveal bestiary')) {
            const creatures = gameState.getCreatures();
            creatures.forEach(c => {
                c.unlocked = true;
                gameState.updateCreature(c);
            });
            return "DATABASE HACK: All Bestiary entries decrypted and unlocked.";
        }

        // --- COMMAND: SPAWN ---
        if (cmd.startsWith('spawn') || cmd.startsWith('create enemy')) {
            const name = cmd.replace('spawn', '').replace('create enemy', '').trim();
            const creature = findCreature(name);
            if (creature) {
                eventBus.emit(GameEvents.REQUEST_DEV_ACTION, { type: 'SPAWN', id: creature.id });
                return `ENGINE ACTION: Spawning ${creature.name} near player coordinates.`;
            } else {
                return `ERROR: Cannot spawn unknown entity "${name}".`;
            }
        }

        // --- COMMAND: KILL ALL ---
        if (cmd.includes('kill all') || cmd.includes('nuke')) {
            eventBus.emit(GameEvents.REQUEST_DEV_ACTION, { type: 'KILL_ALL' });
            return "ENGINE ACTION: Executing 'kill_all' signal. Clearing screen.";
        }

        // --- COMMAND: HEAL ---
        if (cmd.includes('heal') || cmd.includes('full hp')) {
            eventBus.emit(GameEvents.REQUEST_DEV_ACTION, { type: 'HEAL_PLAYER' });
            return "ENGINE ACTION: Player Health restored.";
        }

        // --- EXPLANATION FOR LOGIC ---
        if (cmd.includes('mechanic') || cmd.includes('code') || cmd.includes('script')) {
            return "SYSTEM NOTICE: I can modify NUMERICAL PARAMETERS (HP, Speed, Phases) and DATA structures.\n\nI cannot write new Typescript logic (like new movement patterns) in runtime. \n\nHowever, I have enabled the 'maxPhases' parameter in the database, so you can now change how many phases a boss has by typing 'Set Loira phases to 3'.";
        }

        return `Unknown command "${text}". \nTry: "Set Loira HP 500", "Spawn Werewolf", "Heal Player".`;
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            sender: 'Director',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate processing delay
        setTimeout(() => {
            const responseText = processCommand(userMsg.text);
            
            const aiMsg: ChatMessage = {
                sender: 'AI DEV',
                text: responseText,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 600);
    };

    return (
        <div className="flex flex-col h-full bg-stone-900 border-l border-stone-700 w-80 font-pixel">
            <div className="p-3 bg-stone-800 border-b border-stone-700 flex justify-between items-center">
                <span className="text-emerald-500 font-bold">● AI DEV SERVER</span>
                <span className="text-stone-500 text-xs">v0.2.0 (CONNECTED)</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === 'Director' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[90%] p-2 rounded text-sm ${
                            msg.sender === 'Director' 
                                ? 'bg-stone-700 text-stone-200 border border-stone-600' 
                                : 'bg-emerald-900/20 text-emerald-400 border border-emerald-900'
                        }`}>
                            <div className="font-bold text-[10px] uppercase mb-1 opacity-75">{msg.sender}</div>
                            <pre className="whitespace-pre-wrap font-sans leading-tight">{msg.text}</pre>
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            <div className="p-3 bg-stone-800 border-t border-stone-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ex: Set Loira HP 500"
                        className="flex-1 bg-stone-950 border border-stone-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500 text-stone-200 placeholder-stone-600"
                    />
                    <button 
                        onClick={handleSend}
                        className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                        EXEC
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DevChat;