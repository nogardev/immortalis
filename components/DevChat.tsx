import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

const INITIAL_MESSAGES: ChatMessage[] = [
    {
        sender: 'AI DEV',
        text: 'IMMORTALIS Engine initialized. Systems: Online. Waiting for Director instructions.',
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

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            sender: 'Director',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate AI Response based on keywords
        setTimeout(() => {
            let responseText = "Acknowledged.";
            const lowerInput = userMsg.text.toLowerCase();

            if (lowerInput.includes('create enemy') || lowerInput.includes('add creature')) {
                responseText = "Request to create new entity received. Please specify: Name, Threat Level, and Sprite path. I will prepare the JSON entry.";
            } else if (lowerInput.includes('balance') || lowerInput.includes('nerf') || lowerInput.includes('buff')) {
                responseText = "Analyzing combat metrics. I can adjust damage values in constants.ts. Confirmation required before applying changes.";
            } else if (lowerInput.includes('map') || lowerInput.includes('tile')) {
                responseText = "Opening Tilemap Editor overlay. Remember: Collision layers must be named 'Collision' in Tiled.";
            } else if (lowerInput.includes('sprite') || lowerInput.includes('art')) {
                responseText = "I cannot generate art assets. Please provide the file path in the 'assets/sprites/' directory.";
            } else {
                responseText = `Processing command: "${userMsg.text}". Implementing logic within authorized systems.`;
            }

            const aiMsg: ChatMessage = {
                sender: 'AI DEV',
                text: responseText,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-full bg-stone-900 border-l border-stone-700 w-80 font-pixel">
            <div className="p-3 bg-stone-800 border-b border-stone-700 flex justify-between items-center">
                <span className="text-emerald-500 font-bold">● AI DEV SERVER</span>
                <span className="text-stone-500 text-xs">v0.1.4</span>
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
                            {msg.text}
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
                        placeholder="Command interface..."
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