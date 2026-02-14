import React, { useState, useEffect, useRef } from 'react';
import { gameState } from '../../services/gameState'; // Import GameState
import { Creature, Weapon } from '../../types';

// --- MOCK ASSET FILE SYSTEM ---
const INITIAL_ASSETS = {
    sprites: [
        'assets/sprites/creatures/loira_idle.png',
        'assets/sprites/creatures/corpo_seco.png',
        'assets/sprites/creatures/werewolf.png',
        'assets/sprites/weapons/revolver.png',
        'assets/sprites/weapons/whip.png',
        'assets/sprites/player/idle.png'
    ],
    illustrations: [
        'https://picsum.photos/256/256?grayscale',
        'https://picsum.photos/256/256?sepia',
        'https://picsum.photos/256/256',
        'assets/bestiary/loira_sketch.png',
        'assets/bestiary/corpo_seco_sketch.png'
    ]
};

// --- COMPONENTS ---

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] border border-stone-600 rounded-lg shadow-2xl w-[700px] max-h-[85vh] flex flex-col">
                <div className="p-4 border-b border-stone-700 flex justify-between items-center bg-[#2d2d2d]">
                    <div>
                        <h3 className="font-bold text-stone-200">Select {type === 'SPRITE' ? 'Sprite' : 'Illustration'} Asset</h3>
                        <p className="text-[10px] text-stone-500">Local Assets & Imported Files</p>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-white px-2">✕</button>
                </div>
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".png,.jpg,.jpeg" 
                    onChange={handleFileChange}
                />

                <div className="p-4 overflow-y-auto grid grid-cols-5 gap-4 flex-1 content-start">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="group flex flex-col items-center gap-2 p-2 rounded bg-[#222] border-2 border-dashed border-stone-600 hover:border-emerald-500 hover:bg-[#2a2a2a] transition-all min-h-[120px] justify-center"
                    >
                        <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-emerald-500 text-xl font-bold group-hover:scale-110 transition-transform">
                            +
                        </div>
                        <span className="text-[10px] text-stone-400 font-bold uppercase text-center">
                            Import PNG<br/>from Disk
                        </span>
                    </button>

                    {currentList.map((path, idx) => (
                        <button 
                            key={idx}
                            onClick={() => { onSelect(path); onClose(); }}
                            className="group flex flex-col items-center gap-2 p-2 rounded hover:bg-[#333] border border-transparent hover:border-emerald-500 transition-all relative"
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
                            {path.startsWith('blob:') && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" title="Newly Imported"></span>
                            )}
                        </button>
                    ))}
                </div>
                
                <div className="p-2 bg-[#222] border-t border-[#333] text-[10px] text-stone-500 text-center font-mono">
                    Target Folder: assets/{type === 'SPRITE' ? 'sprites/creatures/' : 'bestiary/'}
                </div>
            </div>
        </div>
    );
};

type EditorTab = 'CREATURES' | 'WEAPONS';

const DataEditor: React.FC = () => {
    const [activeTab, setActiveTab] = useState<EditorTab>('CREATURES');
    
    // Load initial state from GameState service
    const [creatures, setCreatures] = useState<Creature[]>(gameState.getCreatures());
    const [weapons, setWeapons] = useState<Weapon[]>(gameState.getWeapons());
    const [selectedId, setSelectedId] = useState<string>(gameState.getCreatures()[0].id);

    const [assets, setAssets] = useState(INITIAL_ASSETS);
    const [blobRegistry, setBlobRegistry] = useState<{[key: string]: string}>({});
    const [showAssetPicker, setShowAssetPicker] = useState<null | { type: 'SPRITE' | 'ILLUSTRATION', field: string }>(null);

    const activeCreature = creatures.find(c => c.id === selectedId);
    const activeWeapon = weapons.find(w => w.id === selectedId);

    useEffect(() => {
        if (activeTab === 'CREATURES') setSelectedId(creatures[0]?.id || '');
        else setSelectedId(weapons[0]?.id || '');
    }, [activeTab]);

    const handleUpdate = (field: string, value: any) => {
        if (activeTab === 'CREATURES') {
            setCreatures(prev => prev.map(c => c.id === selectedId ? { ...c, [field]: value } : c));
        } else {
            setWeapons(prev => prev.map(w => w.id === selectedId ? { ...w, [field]: value } : w));
        }
    };

    const handleSave = () => {
        if (activeTab === 'CREATURES' && activeCreature) {
            gameState.updateCreature(activeCreature);
            alert(`Saved ${activeCreature.name} to Game Engine. Changes will appear in next mission.`);
        } else if (activeTab === 'WEAPONS' && activeWeapon) {
            gameState.updateWeapon(activeWeapon);
            alert(`Saved ${activeWeapon.name} to Game Engine.`);
        }
    };

    const resolveAssetUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        if (blobRegistry[path]) return blobRegistry[path];
        return path;
    };

    const handleFileUpload = (file: File) => {
        if (!showAssetPicker) return;
        const folder = showAssetPicker.type === 'SPRITE' ? 'assets/sprites/creatures/' : 'assets/bestiary/';
        const virtualPath = `${folder}${file.name}`;
        const blobUrl = URL.createObjectURL(file);

        setBlobRegistry(prev => ({ ...prev, [virtualPath]: blobUrl }));
        setAssets(prev => ({
            ...prev,
            [showAssetPicker.type === 'SPRITE' ? 'sprites' : 'illustrations']: [
                virtualPath,
                ...prev[showAssetPicker.type === 'SPRITE' ? 'sprites' : 'illustrations']
            ]
        }));
        
        // Expose blob URL globally for the engine to use (simulating file system access)
        // @ts-ignore
        if (!window.GAME_BLOB_REGISTRY) window.GAME_BLOB_REGISTRY = {};
        // @ts-ignore
        window.GAME_BLOB_REGISTRY[virtualPath] = blobUrl;
    };

    return (
        <div className="flex h-full bg-[#111] text-stone-200 font-sans relative">
            {showAssetPicker && (
                <AssetPicker 
                    type={showAssetPicker.type}
                    currentList={showAssetPicker.type === 'SPRITE' ? assets.sprites : assets.illustrations}
                    onClose={() => setShowAssetPicker(null)}
                    onSelect={(path) => handleUpdate(showAssetPicker.field, path)}
                    onUpload={handleFileUpload}
                    resolveUrl={resolveAssetUrl}
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
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {(activeTab === 'CREATURES' ? creatures : weapons).map((item: any) => (
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
                    ))}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 p-8 overflow-y-auto border-r border-[#333] bg-[#161616]">
                    {activeTab === 'CREATURES' && activeCreature && (
                        <div className="space-y-6 max-w-xl mx-auto">
                            <div className="flex justify-between items-end mb-6 border-b border-[#333] pb-4">
                                <div>
                                    <label className="text-[10px] text-stone-500 uppercase tracking-widest">Editing ID</label>
                                    <div className="text-xl font-mono text-stone-400">{activeCreature.id}</div>
                                </div>
                                <button onClick={handleSave} className="bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-2 rounded text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all">
                                    SAVE & APPLY
                                </button>
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
                            </div>

                            <div className="space-y-4 pt-4 border-t border-[#333]">
                                <label className="block text-xs uppercase text-stone-500 font-bold mb-2">Visual Assets</label>
                                
                                <div className="flex items-center gap-4 bg-[#222] p-2 rounded border border-[#333]">
                                    <div className="w-12 h-12 bg-black border border-[#444] rounded flex items-center justify-center shrink-0 relative overflow-hidden">
                                         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')]"></div>
                                        <img src={resolveAssetUrl(activeCreature.spritePath)} className="max-w-full max-h-full relative z-10 image-pixelated" alt="sprite" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="text-[10px] text-stone-500 uppercase">In-Game Sprite</div>
                                        <div className="text-xs font-mono truncate text-yellow-500" title={activeCreature.spritePath}>{activeCreature.spritePath}</div>
                                    </div>
                                    <button 
                                        onClick={() => setShowAssetPicker({ type: 'SPRITE', field: 'spritePath' })}
                                        className="px-3 py-1 bg-[#444] hover:bg-[#555] text-xs rounded text-white border border-[#555]"
                                    >
                                        Browse / Import
                                    </button>
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
                                        <img src={resolveAssetUrl(activeCreature.illustrationPath)} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-serif font-bold text-center mb-1 border-b-2 border-stone-800 pb-2">{activeCreature.name}</h2>
                                <div className="flex justify-center mt-4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] uppercase font-bold text-stone-500 mb-1">In-Game Sprite</span>
                                        <img src={resolveAssetUrl(activeCreature.spritePath)} className="w-12 h-12 image-pixelated" />
                                    </div>
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