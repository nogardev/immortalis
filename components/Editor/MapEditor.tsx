import React, { useState, useRef, useEffect } from 'react';

const TILE_SIZE = 32;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;

const MapEditor: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedTileType, setSelectedTileType] = useState<number>(1); // 0: Floor, 1: Wall/Collision
    const [mapData, setMapData] = useState<number[][]>(
        Array(MAP_HEIGHT).fill(0).map(() => Array(MAP_WIDTH).fill(0))
    );
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        drawMap();
    }, [mapData]);

    const drawMap = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Tiles
        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                const tileType = mapData[y][x];
                
                // Render Logic (Placeholder colors)
                if (tileType === 0) {
                    ctx.fillStyle = '#1c1917'; // Dark floor
                } else if (tileType === 1) {
                    ctx.fillStyle = '#44403c'; // Wall
                } else if (tileType === 2) {
                    ctx.fillStyle = '#ef4444'; // Enemy Spawn
                }

                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                
                // Grid lines
                ctx.strokeStyle = '#292524';
                ctx.lineWidth = 1;
                ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    };

    const handleCanvasAction = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
        const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);

        if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
            const newMap = [...mapData];
            newMap[y] = [...newMap[y]];
            newMap[y][x] = selectedTileType;
            setMapData(newMap);
        }
    };

    return (
        <div className="flex h-full bg-stone-900 font-pixel">
            {/* Toolbar */}
            <div className="w-48 bg-stone-950 border-r border-stone-700 p-4 flex flex-col gap-4">
                <h3 className="text-emerald-500 font-bold border-b border-stone-700 pb-2">Tools</h3>
                
                <div className="space-y-2">
                    <button 
                        onClick={() => setSelectedTileType(0)}
                        className={`w-full text-left p-2 rounded border ${selectedTileType === 0 ? 'border-emerald-500 bg-emerald-900/20' : 'border-stone-700 hover:bg-stone-800'}`}
                    >
                        <div className="w-4 h-4 inline-block bg-[#1c1917] mr-2 border border-stone-600 align-middle"></div>
                        Floor
                    </button>
                    <button 
                        onClick={() => setSelectedTileType(1)}
                        className={`w-full text-left p-2 rounded border ${selectedTileType === 1 ? 'border-emerald-500 bg-emerald-900/20' : 'border-stone-700 hover:bg-stone-800'}`}
                    >
                        <div className="w-4 h-4 inline-block bg-[#44403c] mr-2 border border-stone-600 align-middle"></div>
                        Wall / Collision
                    </button>
                    <button 
                        onClick={() => setSelectedTileType(2)}
                        className={`w-full text-left p-2 rounded border ${selectedTileType === 2 ? 'border-emerald-500 bg-emerald-900/20' : 'border-stone-700 hover:bg-stone-800'}`}
                    >
                        <div className="w-4 h-4 inline-block bg-red-500 mr-2 border border-stone-600 align-middle"></div>
                        Enemy Spawn
                    </button>
                </div>

                <div className="mt-auto">
                    <button className="w-full bg-emerald-700 hover:bg-emerald-600 text-white py-2 rounded text-sm mb-2">
                        Export Map JSON
                    </button>
                    <p className="text-[10px] text-stone-500">
                        Map Size: {MAP_WIDTH}x{MAP_HEIGHT}
                    </p>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 bg-stone-800 flex items-center justify-center overflow-auto p-8">
                <div className="shadow-2xl border-4 border-stone-950">
                    <canvas 
                        ref={canvasRef}
                        width={MAP_WIDTH * TILE_SIZE}
                        height={MAP_HEIGHT * TILE_SIZE}
                        className="cursor-crosshair bg-stone-900"
                        onMouseDown={(e) => { setIsDrawing(true); handleCanvasAction(e); }}
                        onMouseMove={(e) => { if(isDrawing) handleCanvasAction(e); }}
                        onMouseUp={() => setIsDrawing(false)}
                        onMouseLeave={() => setIsDrawing(false)}
                    />
                </div>
            </div>
        </div>
    );
};

export default MapEditor;