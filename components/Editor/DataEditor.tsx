import React, { useState, useEffect, useRef } from 'react';
import { gameState } from '../../services/gameState'; // Import GameState
import { Creature, Weapon, PlayerConfig } from '../../types';
import { resolveAssetPath, GITHUB_ASSET_BASE_URL } from '../../constants';
import { getAllRegisteredAssets } from '../../game/asset_registry';

// --- MOCK ASSET FILE SYSTEM ---
const INITIAL_ASSETS = {
    sprites: [
        'game_assets/sprites/creatures/loira_idle.png',
        'game_assets/sprites/creatures/corpo_seco.png',
        'game_assets/sprites/creatures/werewolf.png',
        'game_assets/sprites/weapons/revolver.png',
        'game_assets/sprites/weapons/whip.png',
        'game_assets/sprites/player/idle.png'
    ],
    illustrations: [
        'https://picsum.photos/256/256?grayscale',
        'https://picsum.photos/256/256?sepia',
        'https://picsum.photos/256/256',
        'game_assets/bestiary/loira_sketch.png',
        'game_assets/bestiary/corpo_seco_sketch.png'
    ]
};

// --- COMPONENTS ---

interface Notification {
    message: string;
    type: 'success' | 'error';
}

interface AssetPickerProps {
    type: 'SPRITE' | 'ILLUSTRATION';
    currentList: string[];
    onSelect: (path: string) => void;
    onUpload: (file: File) => void;
    onClose: () => void;
    resolveUrl: (path: string) => string;
}

const AssetPicker: React.FC<AssetPickerProps> = ({ type, currentList, onSelect, onUpload, onClose, resolveUrl }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [customUrl, setCustomUrl] = useState('');
    const [activeTab, setActiveTab] = useState<'REGISTERED' | 'UPLOAD'>('REGISTERED');
    const isGithubMode = gameState.getAssetSourceMode() === 'GITHUB';

    // Get assets from registry
    const registeredAssets = getAllRegisteredAssets();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    const handleCustomUrlSubmit = () => {
        if (customUrl.trim()) {
            onSelect(customUrl.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] border border-stone-600 rounded-lg shadow-2xl w-[700px] max-h-[85vh] flex flex-col">
                <div className="p-4 border-b border-stone-700 flex justify-between items-center bg-[#2d2d2d]">
                    <div>
                        <h3 className="font-bold text-stone-200">Select {type === 'SPRITE' ? 'Sprite' : 'Illustration'} Asset</h3>
                        <div className="flex gap-2 items-center mt-1">
                            <span className={`text-[9px] px-1.5 rounded uppercase font-bold border ${isGithubMode ? 'border-blue-500 text-blue-400' : 'border-emerald-500 text-emerald-400'}`}>
                                {isGithubMode ? 'PUBLIC REPO MODE' : 'PRIVATE/LOCAL MODE'}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-white px-2">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-stone-800 bg-[#111]">
                    <button 
                        onClick={() => setActiveTab('REGISTERED')}
                        className={`px-4 py-2 text-xs font-bold ${activeTab === 'REGISTERED' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-stone-500'}`}
                    >
                        FROM REGISTRY
                    </button>
                     <button 
                        onClick={() => setActiveTab('UPLOAD')}
                        className={`px-4 py-2 text-xs font-bold ${activeTab === 'UPLOAD' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-stone-500'}`}
                    >
                        MANUAL / UPLOAD
                    </button>
                </div>
                
                {activeTab === 'REGISTERED' && (
                     <div className="p-4 bg-[#111] overflow-y-auto grid grid-cols-5 gap-4 flex-1 content-start">
                         {registeredAssets.length === 0 && <div className="col-span-5 text-center text-stone-500 text-xs">No assets in asset_registry.ts</div>}
                         {registeredAssets.map((path, idx) => (
                             <button 
                                key={idx}
                                onClick={() => { onSelect(path); onClose(); }}
                                className="group flex flex-col items-center gap-2 p-2 rounded hover:bg-[#333] border border-transparent hover:border-emerald-500 transition-all relative"
                                title={resolveUrl(path)}
                            >
                                <div className="w-24 h-24 bg-[#111] border border-stone-700 flex items-center justify-center overflow-hidden relative">
                                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')]"></div>
                                    <img 
                                        src={resolveUrl(path)} 
                                        alt="asset" 
                                        className="max-w-full max-h-full object-contain relative z-10 image-pixelated" 
                                    />
                                </div>
                                <span className="text-[10px] text-stone-400 break-all w-full text-center font-mono truncate px-1">
                                    {path.split('/').pop()}
                                </span>
                            </button>
                         ))}
                     </div>
                )}

                {activeTab === 'UPLOAD' && (
                    <>
                        {/* External URL Input Section */}
                        <div className="p-4 bg-[#111] border-b border-stone-800 flex gap-2 items-center">
                            <span className="text-xs font-bold text-stone-500 uppercase whitespace-nowrap">External URL:</span>
                            <input 
                                type="text" 
                                value={customUrl}
                                onChange={(e) => setCustomUrl(e.target.value)}
                                placeholder="Paste link (public/game_assets/...)"
                                className="flex-1 bg-[#0a0a0a] border border-[#333] rounded px-3 py-1.5 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none font-mono"
                            />
                            <button 
                                onClick={handleCustomUrlSubmit}
                                disabled={!customUrl}
                                className="bg-stone-700 hover:bg-emerald-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors"
                            >
                                USE URL
                            </button>
                        </div>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept=".png,.jpg,.jpeg" 
                            onChange={handleFileChange}
                        />

                        <div className="p-4 overflow-y-auto grid grid-cols-5 gap-4 flex-1 content-start bg-[#111]">
                            {/* Upload Button */}
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="group flex flex-col items-center gap-2 p-2 rounded bg-[#222] border-2 border-dashed border-stone-600 hover:border-emerald-500 hover:bg-[#2a2a2a] transition-all min-h-[120px] justify-center relative"
                            >
                                <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-emerald-500 text-xl font-bold group-hover:scale-110 transition-transform">
                                    +
                                </div>
                                <span className="text-[10px] text-stone-400 font-bold uppercase text-center">
                                    Upload Local<br/>(Preview Only)
                                </span>
                                <div className="absolute top-1 right-1 bg-yellow-600 text-[8px] font-bold px-1 rounded text-black" title="Local only">
                                    LOCAL
                                </div>
                            </button>

                            {/* Legacy List */}
                            {currentList.map((path, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => { onSelect(path); onClose(); }}
                                    className="group flex flex-col items-center gap-2 p-2 rounded hover:bg-[#333] border border-transparent hover:border-emerald-500 transition-all relative"
                                    title={resolveUrl(path)}
                                >
                                    <div className="w-24 h-24 bg-[#111] border border-stone-700 flex items-center justify-center overflow-hidden relative">
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')]"></div>
                                        <img 
                                            src={resolveUrl(path)} 
                                            alt="asset" 
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM1NSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIj48L2NpcmNsZT48bGluZSB4MT0iMTIiIHkxPSI4IiB4Mj0iMTIiIHkyPSIxMiI+PC9saW5lPjxsaW5lIHgxPSIxMiIgeTE9IjE2IiB4Mj0iMTIuMDEiIHkyPSIxNiI+PC9saW5lPjwvc3ZnPg==';
                                            }}
                                            className="max-w-full max-h-full object-contain relative z-10 image-pixelated" 
                                        />
                                    </div>
                                    <span className="text-[10px] text-stone-400 break-all w-full text-center font-mono truncate px-1">
                                        {path.startsWith('data:') ? 'Local Asset' : (path.startsWith('http') ? 'External Link' : path.split('/').pop())}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

type EditorTab = 'CREATURES' | 'WEAPONS' | 'PLAYER';

const DataEditor: React.FC = () => {
    const [activeTab, setActiveTab] = useState<EditorTab>('CREATURES');
    const [notification, setNotification] = useState<Notification | null>(null);
    const [showExportModal, setShowExportModal] = useState(false);
    
    // Local state to handle edits before saving
    const [creatures, setCreatures] = useState<Creature[]>(gameState.getCreatures());
    const [weapons, setWeapons] = useState<Weapon[]>(gameState.getWeapons());
    const [playerConfig, setPlayerConfig] = useState<PlayerConfig>(gameState.getPlayerConfig());
    
    const [selectedId, setSelectedId] = useState<string>('');

    const [assets, setAssets] = useState(INITIAL_ASSETS);
    const [showAssetPicker, setShowAssetPicker] = useState<null | { type: 'SPRITE' | 'ILLUSTRATION', field: string }>(null);

    // Sync from GameState when tab changes to ensure fresh data
    useEffect(() => {
        if (activeTab === 'CREATURES') {
            const currentCreatures = gameState.getCreatures();
            setCreatures([...currentCreatures]); 
            setSelectedId(currentCreatures[0]?.id || '');
        } else if (activeTab === 'WEAPONS') {
            const currentWeapons = gameState.getWeapons();
            setWeapons([...currentWeapons]);
            setSelectedId(currentWeapons[0]?.id || '');
        } else if (activeTab === 'PLAYER') {
            setPlayerConfig({ ...gameState.getPlayerConfig() });
            setSelectedId('PLAYER_CONFIG');
        }
    }, [activeTab]);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const activeCreature = creatures.find(c => c.id === selectedId);
    const activeWeapon = weapons.find(w => w.id === selectedId);

    const handleUpdate = (field: string, value: any) => {
        if (activeTab === 'CREATURES') {
            setCreatures(prev => prev.map(c => c.id === selectedId ? { ...c, [field]: value } : c));
        } else if (activeTab === 'WEAPONS') {
            setWeapons(prev => prev.map(w => w.id === selectedId ? { ...w, [field]: value } : w));
        } else if (activeTab === 'PLAYER') {
            setPlayerConfig(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handlePlayerStatsUpdate = (stat: string, value: number) => {
        setPlayerConfig(prev => ({
            ...prev,
            baseStats: {
                ...prev.baseStats,
                [stat]: value
            }
        }));
    };

    const handleSave = () => {
        if (activeTab === 'CREATURES' && activeCreature) {
            gameState.updateCreature(activeCreature);
            showNotification(`Saved ${activeCreature.name} data to LocalStorage.`);
        } else if (activeTab === 'WEAPONS' && activeWeapon) {
            gameState.updateWeapon(activeWeapon);
            showNotification(`Saved ${activeWeapon.name} data to LocalStorage.`);
        } else if (activeTab === 'PLAYER') {
            gameState.updatePlayerConfig(playerConfig);
            showNotification(`Player Config saved to LocalStorage.`);
        }
    };

    const handleExport = () => {
        // Generate the constants.ts file content
        const creaturesData = JSON.stringify(creatures, null, 2);
        // Note: We need to clean the JSON to match Typescript variable format roughly, 
        // or just give the user the array content.
        setShowExportModal(true);
    };

    const handleFileUpload = (file: File) => {
        if (!showAssetPicker) return;
        
        // Convert to Base64 for Persistence
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            
            setAssets(prev => ({
                ...prev,
                [showAssetPicker.type === 'SPRITE' ? 'sprites' : 'illustrations']: [
                    base64String,
                    ...prev[showAssetPicker.type === 'SPRITE' ? 'sprites' : 'illustrations']
                ]
            }));

            // Auto-select the uploaded asset
            handleUpdate(showAssetPicker.field, base64String);
            setShowAssetPicker(null);
            showNotification("Asset Imported & Encoded locally.", "success");
        };
        reader.readAsDataURL(file);
    };

    // Helper to render preview image with error handling
    const PreviewImage = ({ src, alt, className }: { src: string, alt: string, className: string }) => {
        const [currentSrc, setCurrentSrc] = useState(resolveAssetPath(src));
        const [error, setError] = useState(false);
        const [fallbackTried, setFallbackTried] = useState(false);

        // Update when prop changes
        useEffect(() => {
            setCurrentSrc(resolveAssetPath(src));
            setError(false);
            setFallbackTried(false);
        }, [src]);

        const handleError = () => {
            // Smart Fallback similar to Main Engine
            if (!fallbackTried && !currentSrc.startsWith('http')) {
                setFallbackTried(true);
                let cleanPath = src;
                if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);
                if (cleanPath.startsWith('public/')) cleanPath = cleanPath.replace('public/', '');
                
                const githubUrl = `${GITHUB_ASSET_BASE_URL}${cleanPath}`;
                console.log("Preview Image missing locally, trying GitHub:", githubUrl);
                setCurrentSrc(githubUrl);
            } else {
                setError(true);
            }
        };

        if (error || !src) {
             return (
                 <div className={`${className} bg-red-900/50 flex flex-col items-center justify-center border border-red-500 text-red-500 text-center`}>
                     <span className="text-xl font-bold">!</span>
                     <span className="text-[8px] uppercase">Missing</span>
                     <a href={resolveAssetPath(src)} target="_blank" rel="noopener noreferrer" className="text-[8px] underline text-blue-400 mt-1">Check URL</a>
                 </div>
             );
        }

        return (
            <div className="relative group w-full h-full flex items-center justify-center">
                <img 
                    src={currentSrc} 
                    alt={alt} 
                    className={className} 
                    onError={handleError}
                    title={`Source: ${src}`}
                />
                {/* Debug Tooltip on Hover */}
                <div className="absolute hidden group-hover:flex bottom-0 left-0 right-0 bg-black/80 text-[8px] text-white p-1 break-all flex-col z-50">
                    <div>Res: {currentSrc}</div>
                    <a href={currentSrc} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-bold mt-1">Open Original</a>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-full bg-[#111] text-stone-200 font-sans relative">
            
            {/* Notification Toast */}
            {notification && (
                <div className={`absolute bottom-8 right-8 z-50 px-6 py-4 rounded shadow-2xl flex items-center gap-3 animate-bounce ${
                    notification.type === 'success' ? 'bg-emerald-900 border border-emerald-500 text-white' : 'bg-red-900 border border-red-500 text-white'
                }`}>
                    <span className="text-xl">{notification.type === 'success' ? '💾' : '⚠️'}</span>
                    <span className="font-bold">{notification.message}</span>
                </div>
            )}

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur">
                    <div className="bg-[#1a1a1a] border border-stone-600 rounded-lg w-[800px] h-[600px] flex flex-col shadow-2xl">
                         <div className="p-4 border-b border-stone-700 flex justify-between items-center bg-[#2d2d2d]">
                             <h3 className="font-bold text-emerald-400">DATA EXPORT (CONSTANTS.TS)</h3>
                             <button onClick={() => setShowExportModal(false)} className="text-stone-400 hover:text-white">✕</button>
                         </div>
                         <div className="flex-1 p-4 overflow-hidden flex flex-col gap-4">
                             <p className="text-sm text-stone-400">
                                 Copy this JSON array and paste it into <code>constants.ts</code> under <code>BESTIARY_DATA</code> to sync your changes to the codebase.
                             </p>
                             <textarea 
                                readOnly 
                                className="flex-1 bg-black border border-stone-700 p-4 font-mono text-xs text-green-500 rounded resize-none focus:outline-none"
                                value={JSON.stringify(creatures, null, 2)} 
                             />
                             <div className="flex justify-end gap-2">
                                 <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(JSON.stringify(creatures, null, 2));
                                        showNotification("Copied to clipboard!");
                                    }}
                                    className="bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-2 rounded text-sm font-bold"
                                 >
                                     COPY TO CLIPBOARD
                                 </button>
                             </div>
                         </div>
                    </div>
                </div>
            )}

            {showAssetPicker && (
                <AssetPicker 
                    type={showAssetPicker.type}
                    currentList={showAssetPicker.type === 'SPRITE' ? assets.sprites : assets.illustrations}
                    onClose={() => setShowAssetPicker(null)}
                    onSelect={(path) => handleUpdate(showAssetPicker.field, path)}
                    onUpload={handleFileUpload}
                    resolveUrl={resolveAssetPath}
                />
            )}

            <div className="w-64 border-r border-[#333] flex flex-col bg-[#1a1a1a]">
                <div className="flex border-b border-[#333]">
                    <button 
                        onClick={() => setActiveTab('CREATURES')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'CREATURES' ? 'bg-[#2d2d2d] text-emerald-500 border-b-2 border-emerald-500' : 'text-stone-500 hover:bg-[#222]'}`}
                    >
                        Creatures
                    </button>
                    <button 
                        onClick={() => setActiveTab('WEAPONS')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'WEAPONS' ? 'bg-[#2d2d2d] text-emerald-500 border-b-2 border-emerald-500' : 'text-stone-500 hover:bg-[#222]'}`}
                    >
                        Weapons
                    </button>
                     <button 
                        onClick={() => setActiveTab('PLAYER')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'PLAYER' ? 'bg-[#2d2d2d] text-emerald-500 border-b-2 border-emerald-500' : 'text-stone-500 hover:bg-[#222]'}`}
                    >
                        Player
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {activeTab === 'PLAYER' ? (
                        <div className="p-3 text-sm text-stone-400 italic">
                            Editing Global Player Config
                        </div>
                    ) : (
                        (activeTab === 'CREATURES' ? creatures : weapons).map((item: any) => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedId(item.id)}
                                className={`w-full text-left px-3 py-3 rounded text-sm flex items-center justify-between group transition-all ${
                                    selectedId === item.id 
                                        ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-900/50' 
                                        : 'hover:bg-[#252525] text-stone-400 border border-transparent'
                                }`}
                            >
                                <span className="font-medium">{item.name}</span>
                                {activeTab === 'CREATURES' && (
                                    <span className={`text-[10px] px-1.5 rounded ${item.threatLevel > 10 ? 'bg-red-900/50 text-red-300' : 'bg-stone-700 text-stone-400'}`}>
                                        LV {item.threatLevel}
                                    </span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 p-8 overflow-y-auto border-r border-[#333] bg-[#161616]">
                    
                    {/* CREATURE EDITOR */}
                    {activeTab === 'CREATURES' && activeCreature && (
                        <div className="space-y-6 max-w-xl mx-auto">
                            <div className="flex justify-between items-end mb-6 border-b border-[#333] pb-4">
                                <div>
                                    <label className="text-[10px] text-stone-500 uppercase tracking-widest">Editing ID</label>
                                    <div className="text-xl font-mono text-stone-400">{activeCreature.id}</div>
                                </div>
                                <div className="flex gap-2">
                                     <button onClick={() => gameState.resetData()} className="text-[#555] hover:text-red-500 px-3 py-2 text-xs uppercase font-bold">
                                        Reset All
                                    </button>
                                     <button onClick={handleExport} className="bg-stone-700 hover:bg-stone-600 text-white px-3 py-2 rounded text-sm font-bold border border-stone-600">
                                        EXPORT CODE
                                    </button>
                                    <button onClick={handleSave} className="bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-2 rounded text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all">
                                        SAVE LOCAL
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs uppercase text-stone-500 mb-1 font-bold">Display Name</label>
                                    <input 
                                        type="text" 
                                        value={activeCreature.name} 
                                        onChange={(e) => handleUpdate('name', e.target.value)}
                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded p-3 text-stone-200 focus:border-emerald-500 focus:outline-none" 
                                    />
                                </div>
                                {/* NEW: Stats Editor */}
                                <div className="col-span-1">
                                    <label className="block text-xs uppercase text-stone-500 mb-1 font-bold">Base HP</label>
                                    <input 
                                        type="number" 
                                        value={activeCreature.baseHp || 50} 
                                        onChange={(e) => handleUpdate('baseHp', parseInt(e.target.value))}
                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded p-3 text-stone-200 focus:border-emerald-500 focus:outline-none" 
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs uppercase text-stone-500 mb-1 font-bold">Base Damage</label>
                                    <input 
                                        type="number" 
                                        value={activeCreature.baseDamage || 5} 
                                        onChange={(e) => handleUpdate('baseDamage', parseInt(e.target.value))}
                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded p-3 text-stone-200 focus:border-emerald-500 focus:outline-none" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-[#333]">
                                <label className="block text-xs uppercase text-stone-500 font-bold mb-2">Visual Assets</label>
                                
                                <div className="flex items-center gap-4 bg-[#222] p-2 rounded border border-[#333]">
                                    <div className="w-12 h-12 bg-black border border-[#444] rounded flex items-center justify-center shrink-0 relative overflow-hidden">
                                         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')]"></div>
                                         <PreviewImage 
                                            src={activeCreature.spritePath} 
                                            alt="sprite" 
                                            className="max-w-full max-h-full relative z-10 image-pixelated" 
                                         />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] text-stone-500 uppercase">In-Game Sprite</div>
                                        <div className="text-xs font-mono text-yellow-500 break-all select-all">
                                            {activeCreature.spritePath}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowAssetPicker({ type: 'SPRITE', field: 'spritePath' })}
                                        className="px-3 py-1 bg-[#444] hover:bg-[#555] text-xs rounded text-white border border-[#555]"
                                    >
                                        Import
                                    </button>
                                </div>

                                {/* BESTIARY ILLUSTRATION PICKER */}
                                <div className="flex items-center gap-4 bg-[#222] p-2 rounded border border-[#333]">
                                    <div className="w-12 h-12 bg-black border border-[#444] rounded flex items-center justify-center shrink-0 relative overflow-hidden">
                                        <PreviewImage 
                                            src={activeCreature.illustrationPath} 
                                            alt="illustration" 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] text-stone-500 uppercase">Bestiary Illustration</div>
                                        <div className="text-xs font-mono text-yellow-500 break-all select-all">
                                            {activeCreature.illustrationPath}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowAssetPicker({ type: 'ILLUSTRATION', field: 'illustrationPath' })}
                                        className="px-3 py-1 bg-[#444] hover:bg-[#555] text-xs rounded text-white border border-[#555]"
                                    >
                                        Import
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PLAYER EDITOR */}
                    {activeTab === 'PLAYER' && (
                        <div className="space-y-6 max-w-xl mx-auto">
                            <div className="flex justify-between items-end mb-6 border-b border-[#333] pb-4">
                                <div>
                                    <label className="text-[10px] text-stone-500 uppercase tracking-widest">Configuring</label>
                                    <div className="text-xl font-mono text-stone-400">THE INVESTIGATOR</div>
                                </div>
                                <button onClick={handleSave} className="bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-2 rounded text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all">
                                    SAVE PLAYER CONFIG
                                </button>
                            </div>

                             <div className="space-y-4 pt-4">
                                <label className="block text-xs uppercase text-stone-500 font-bold mb-2">Player Visual</label>
                                <div className="flex items-center gap-4 bg-[#222] p-2 rounded border border-[#333]">
                                    <div className="w-12 h-12 bg-black border border-[#444] rounded flex items-center justify-center shrink-0 relative overflow-hidden">
                                         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')]"></div>
                                        <PreviewImage 
                                            src={playerConfig.spritePath} 
                                            alt="sprite" 
                                            className="max-w-full max-h-full relative z-10 image-pixelated" 
                                         />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] text-stone-500 uppercase">Investigator Sprite (Top-Down)</div>
                                        <div className="text-xs font-mono text-yellow-500 break-all select-all">
                                            {playerConfig.spritePath}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowAssetPicker({ type: 'SPRITE', field: 'spritePath' })}
                                        className="px-3 py-1 bg-[#444] hover:bg-[#555] text-xs rounded text-white border border-[#555]"
                                    >
                                        Import
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-[#333]">
                                <label className="block text-xs uppercase text-stone-500 font-bold mb-2">Base Attributes</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-stone-500 mb-1">Max HP</label>
                                        <input 
                                            type="number" 
                                            value={playerConfig.baseStats.hp} 
                                            onChange={(e) => handlePlayerStatsUpdate('hp', parseInt(e.target.value))}
                                            className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-stone-200" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-stone-500 mb-1">Base Speed</label>
                                        <input 
                                            type="number" 
                                            value={playerConfig.baseStats.speed} 
                                            onChange={(e) => handlePlayerStatsUpdate('speed', parseInt(e.target.value))}
                                            className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-stone-200" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-[400px] bg-[#0c0c0c] border-l border-[#333] flex flex-col">
                    <div className="p-3 border-b border-[#222] bg-[#111]">
                        <h3 className="text-xs font-bold uppercase text-stone-500 text-center">Live Data Preview</h3>
                    </div>
                    
                    <div className="flex-1 p-8 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                        {activeTab === 'CREATURES' && activeCreature && (
                            <div className="w-full bg-[#eaddcf] text-stone-900 rounded-sm shadow-2xl overflow-hidden border-4 border-stone-800 relative p-6">
                                <div className="flex justify-center mb-6">
                                    <div className="w-32 h-32 border-4 border-stone-800 bg-black shadow-inner">
                                        <PreviewImage 
                                            src={activeCreature.illustrationPath} 
                                            alt="illustration"
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-serif font-bold text-center mb-1 border-b-2 border-stone-800 pb-2">{activeCreature.name}</h2>
                                <div className="flex justify-center mt-4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] uppercase font-bold text-stone-500 mb-1">In-Game Sprite</span>
                                        <div className="w-12 h-12">
                                            <PreviewImage 
                                                src={activeCreature.spritePath} 
                                                alt="sprite"
                                                className="w-full h-full image-pixelated object-contain" 
                                            />
                                        </div>
                                    </div>
                                    {/* LIVE STATS PREVIEW */}
                                    <div className="flex flex-col items-center ml-4 border-l border-stone-400 pl-4">
                                        <div className="text-center mb-2">
                                            <div className="text-xl font-bold font-mono text-red-700">{activeCreature.baseHp || 50}</div>
                                            <div className="text-[8px] uppercase font-bold text-stone-500">HP</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold font-mono text-stone-800">{activeCreature.baseDamage || 5}</div>
                                            <div className="text-[8px] uppercase font-bold text-stone-500">DMG</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'PLAYER' && (
                             <div className="flex flex-col items-center gap-4">
                                <div className="w-32 h-32 bg-[#1c1917] border border-stone-700 flex items-center justify-center">
                                     <PreviewImage 
                                        src={playerConfig.spritePath} 
                                        alt="sprite"
                                        className="w-16 h-16 image-pixelated" 
                                     />
                                </div>
                                <div className="text-center text-stone-400">
                                    <p className="font-serif text-lg text-emerald-500">The Investigator</p>
                                    <p className="text-xs font-mono mt-2">HP: {playerConfig.baseStats.hp} | SPD: {playerConfig.baseStats.speed}</p>
                                </div>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataEditor;