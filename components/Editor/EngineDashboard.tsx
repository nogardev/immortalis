import React, { useState } from 'react';
import DataEditor from './DataEditor';
import MapEditor from './MapEditor';

type EngineView = 'DASHBOARD' | 'DATA' | 'MAPS' | 'SETTINGS';

const EngineDashboard: React.FC = () => {
    const [view, setView] = useState<EngineView>('DASHBOARD');

    return (
        <div className="flex flex-col h-full w-full bg-[#1a1a1a] text-gray-200">
            {/* Top Toolbar */}
            <div className="h-12 bg-[#2d2d2d] border-b border-[#3d3d3d] flex items-center px-4 justify-between select-none">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-400 text-sm">IMMORTALIS ENGINE</span>
                    <span className="bg-[#3d3d3d] px-2 py-0.5 rounded text-[10px] text-emerald-500">v0.1.4</span>
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
                        <div className="text-6xl opacity-20">⚙️</div>
                        <p>Select a tool to begin editing.</p>
                    </div>
                )}
                {view === 'DATA' && <DataEditor />}
                {view === 'MAPS' && <MapEditor />}
                {view === 'SETTINGS' && (
                     <div className="p-8">
                        <h2 className="text-xl font-bold mb-4">Engine Settings</h2>
                        <div className="p-4 bg-[#2d2d2d] rounded border border-[#3d3d3d] max-w-md">
                            <h3 className="text-sm font-bold text-gray-300 mb-2">Build Configuration</h3>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-400">Target Platform</span>
                                <select className="bg-[#1a1a1a] border border-[#3d3d3d] rounded px-2 py-1 text-xs">
                                    <option>Electron (Desktop)</option>
                                    <option>Web (Vercel)</option>
                                </select>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">Pixel Art Scaling</span>
                                <input type="checkbox" checked readOnly />
                            </div>
                        </div>
                     </div>
                )}
            </div>
        </div>
    );
};

export default EngineDashboard;