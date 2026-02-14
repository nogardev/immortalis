import React, { useState } from 'react';
import DataEditor from './DataEditor';
import MapEditor from './MapEditor';
import { gameState } from '../../services/gameState';

type EngineView = 'DASHBOARD' | 'DATA' | 'MAPS' | 'SETTINGS';

const EngineDashboard: React.FC = () => {
    const [view, setView] = useState<EngineView>('DASHBOARD');
    const [mode, setMode] = useState(gameState.getAssetSourceMode());

    const handleModeChange = (newMode: 'LOCAL' | 'GITHUB') => {
        const confirm = window.confirm(`Switching to ${newMode} mode will reload the page. Save changes?`);
        if (confirm) {
            gameState.setAssetSourceMode(newMode);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#1a1a1a] text-gray-200">
            {/* Top Toolbar */}
            <div className="h-12 bg-[#2d2d2d] border-b border-[#3d3d3d] flex items-center px-4 justify-between select-none">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-400 text-sm">IMMORTALIS ENGINE</span>
                    <span className="bg-[#3d3d3d] px-2 py-0.5 rounded text-[10px] text-emerald-500">v0.1.7</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${mode === 'GITHUB' ? 'border-blue-500 text-blue-400' : 'border-emerald-500 text-emerald-400'}`}>
                        {mode === 'GITHUB' ? '☁️ GITHUB LINKED' : '💻 LOCAL ONLY'}
                    </span>
                </div>
                
                <div className="flex gap-1">
                    <button 
                        onClick={() => setView('DATA')} 
                        className={`px-4 py-1.5 text-xs font-bold rounded hover:bg-[#3d3d3d] ${view === 'DATA' ? 'bg-[#3d3d3d] text-white' : 'text-gray-400'}`}
                    >
                        DATABASE
                    </button>
                    <button 
                         onClick={() => setView('MAPS')} 
                         className={`px-4 py-1.5 text-xs font-bold rounded hover:bg-[#3d3d3d] ${view === 'MAPS' ? 'bg-[#3d3d3d] text-white' : 'text-gray-400'}`}
                    >
                        MAP EDITOR
                    </button>
                    <button 
                         onClick={() => setView('SETTINGS')} 
                         className={`px-4 py-1.5 text-xs font-bold rounded hover:bg-[#3d3d3d] ${view === 'SETTINGS' ? 'bg-[#3d3d3d] text-white' : 'text-gray-400'}`}
                    >
                        SETTINGS
                    </button>
                </div>
            </div>

            {/* Workspace */}
            <div className="flex-1 overflow-hidden relative">
                {view === 'DASHBOARD' && (
                    <div className="flex items-center justify-center h-full flex-col text-gray-500 gap-4">
                        <div className="text-6xl opacity-20">🛡️</div>
                        <p>Secure Environment Active.</p>
                        
                        <div className="mt-4 p-4 border border-blue-900/50 rounded bg-blue-900/10 text-sm max-w-md text-center">
                            <strong className="text-blue-400 block mb-2">GITHUB SYNC ACTIVE</strong>
                            <p className="text-xs text-stone-400">
                                The engine is configured to read assets directly from your repository:
                                <br/>
                                <span className="font-mono text-stone-500">nogardev/immortalis</span>
                            </p>
                            <p className="text-xs text-stone-400 mt-2">
                                <strong>Your files are safe.</strong> Even if the AI Studio environment resets, 
                                the game will load your sprites from GitHub.
                            </p>
                        </div>

                        <div className="mt-4 p-4 border border-stone-800 rounded bg-stone-900/50 text-sm max-w-md text-center">
                            <p className="mb-2">Current Mode: <span className="font-bold text-white">{mode}</span></p>
                            <p className="text-xs">
                                {mode === 'GITHUB' 
                                    ? "Reading from 'public/assets/' folder in your GitHub Main Branch." 
                                    : "Reading from local temporary storage."}
                            </p>
                        </div>
                    </div>
                )}
                {view === 'DATA' && <DataEditor />}
                {view === 'MAPS' && <MapEditor />}
                {view === 'SETTINGS' && (
                     <div className="p-8">
                        <h2 className="text-xl font-bold mb-4">Engine Settings</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-[#2d2d2d] rounded border border-[#3d3d3d]">
                                <h3 className="text-sm font-bold text-gray-300 mb-4 border-b border-[#444] pb-2">Pipeline Configuration</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs text-gray-400 uppercase font-bold">Asset Source Mode</label>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleModeChange('LOCAL')}
                                                className={`flex-1 py-2 text-xs font-bold rounded border ${mode === 'LOCAL' ? 'bg-emerald-900 border-emerald-500 text-white' : 'bg-[#111] border-[#444] text-gray-400 hover:border-gray-200'}`}
                                            >
                                                LOCAL (Filesystem)
                                            </button>
                                            <button 
                                                onClick={() => handleModeChange('GITHUB')}
                                                className={`flex-1 py-2 text-xs font-bold rounded border ${mode === 'GITHUB' ? 'bg-blue-900 border-blue-500 text-white' : 'bg-[#111] border-[#444] text-gray-400 hover:border-gray-200'}`}
                                            >
                                                GITHUB (Remote)
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-1">
                                            Keep this on <strong>GITHUB</strong> to ensure your sprites never disappear, 
                                            as they are loaded from your permanent repository.
                                        </p>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-[#444]">
                                        <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Repository Actions</label>
                                        <a 
                                            href="https://github.com/nogardev/immortalis/settings" 
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full text-center bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-300 py-2 rounded text-xs font-bold transition-colors"
                                        >
                                            OPEN REPO SETTINGS ↗
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-[#2d2d2d] rounded border border-[#3d3d3d]">
                                <h3 className="text-sm font-bold text-gray-300 mb-4 border-b border-[#444] pb-2">Build Configuration</h3>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-gray-400">Target Platform</span>
                                    <select className="bg-[#1a1a1a] border border-[#3d3d3d] rounded px-2 py-1 text-xs text-white">
                                        <option>Electron (Desktop)</option>
                                        <option>Web (Vercel)</option>
                                    </select>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Pixel Art Scaling</span>
                                    <input type="checkbox" checked readOnly className="accent-emerald-500" />
                                </div>
                            </div>
                        </div>
                     </div>
                )}
            </div>
        </div>
    );
};

export default EngineDashboard;