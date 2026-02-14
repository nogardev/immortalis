import { eventBus, GameEvents } from '../services/eventBus';
import { gameState } from '../services/gameState';
import { Mission } from '../types';
import { GITHUB_ASSET_BASE_URL } from '../constants';

// --- ENGINE TYPES ---
interface Point { x: number; y: number; }
interface Entity {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    type: 'PLAYER' | 'ENEMY' | 'PROJECTILE';
    vx: number;
    vy: number;
    hp: number;
    maxHp: number;
    spritePath?: string;
    spriteLoaded?: boolean;
    spriteError?: boolean;
}

// --- ENGINE CORE ---
export class ImmortalisEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private running: boolean = false;
    private lastTime: number = 0;

    // Game State
    private keys: Set<string> = new Set();
    private mouse: Point = { x: 0, y: 0 };
    private player: Entity;
    private entities: Entity[] = [];
    private camera: Point = { x: 0, y: 0 };
    private currentMission: Mission | null = null;
    private zoom: number = 1.6;
    
    // Map Data
    private mapWidth = 50;
    private mapHeight = 50;
    private tileSize = 32;
    private tiles: number[][] = [];
    
    // Image Cache
    private imageCache: Map<string, HTMLImageElement> = new Map();
    private brokenImages: Set<string> = new Set(); 

    constructor(canvas: HTMLCanvasElement, mission?: Mission) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) throw new Error("Could not get 2D context");
        this.ctx = context;
        this.ctx.imageSmoothingEnabled = false; 
        this.currentMission = mission || null;

        // Initialize Map
        for(let y=0; y<this.mapHeight; y++) {
            const row = [];
            for(let x=0; x<this.mapWidth; x++) {
                if(x===0 || x===this.mapWidth-1 || y===0 || y===this.mapHeight-1) row.push(1);
                else row.push(0);
            }
            this.tiles.push(row);
        }

        const playerConfig = gameState.getPlayerConfig();
        
        this.player = {
            id: 'player',
            x: 400,
            y: 300,
            width: 32, 
            height: 32,
            color: '#ef4444',
            type: 'PLAYER',
            vx: 0,
            vy: 0,
            hp: playerConfig.baseStats.hp,
            maxHp: playerConfig.baseStats.hp,
            spritePath: playerConfig.spritePath,
            spriteLoaded: false
        };

        this.entities.push(this.player);

        if (this.currentMission) {
            this.spawnEnemy(600, 400, this.currentMission.bossId);
        } else {
            this.spawnEnemy(600, 400, 'loira_banheiro');
        }

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        canvas.addEventListener('mousemove', this.handleMouseMove);
        canvas.addEventListener('mousedown', this.handleMouseDown);
    }

    private handleKeyDown = (e: KeyboardEvent) => this.keys.add(e.code);
    private handleKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code);
    private handleMouseMove = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const canvasX = (e.clientX - rect.left) * scaleX;
        const canvasY = (e.clientY - rect.top) * scaleY;

        this.mouse.x = canvasX / this.zoom + this.camera.x;
        this.mouse.y = canvasY / this.zoom + this.camera.y;
    }
    private handleMouseDown = () => {
        this.attack();
    }

    public start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop);
    }

    public stop() {
        this.running = false;
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }

    private loop = (timestamp: number) => {
        if (!this.running) return;
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(dt);
        this.render();

        requestAnimationFrame(this.loop);
    }

    private update(dt: number) {
        const playerConfig = gameState.getPlayerConfig();
        const speed = playerConfig.baseStats.speed;

        this.player.vx = 0;
        this.player.vy = 0;
        if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) this.player.vy = -speed;
        if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) this.player.vy = speed;
        if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) this.player.vx = -speed;
        if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) this.player.vx = speed;

        this.entities.forEach(entity => {
            if (entity.type === 'ENEMY') {
                const dx = this.player.x - entity.x;
                const dy = this.player.y - entity.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist > 30) {
                    entity.vx = (dx / dist) * 100;
                    entity.vy = (dy / dist) * 100;
                } else {
                    entity.vx = 0;
                    entity.vy = 0;
                }
            }

            const nextX = entity.x + entity.vx * dt;
            const nextY = entity.y + entity.vy * dt;

            if (!this.checkMapCollision(nextX, entity.y, entity.width, entity.height)) {
                entity.x = nextX;
            }
            if (!this.checkMapCollision(entity.x, nextY, entity.width, entity.height)) {
                entity.y = nextY;
            }
        });

        this.entities = this.entities.filter(entity => {
            if (entity.type === 'PROJECTILE') {
                const hit = this.entities.find(e => e.type === 'ENEMY' && this.checkEntityCollision(entity, e));
                if (hit) {
                    hit.hp -= 10;
                    if (hit.hp <= 0) return false; 
                    return false; 
                }
                const distFromStart = Math.sqrt((entity.x - this.player.x)**2 + (entity.y - this.player.y)**2);
                if (distFromStart > 800) return false;
            }
            
            if (entity.type === 'ENEMY' && entity.hp <= 0) {
                if (this.currentMission && entity.id === this.currentMission.bossId) {
                    setTimeout(() => {
                        eventBus.emit(GameEvents.MISSION_COMPLETE, { victory: true, mission: this.currentMission });
                    }, 500);
                }
                return false; 
            }
            return true;
        });

        this.camera.x = this.player.x - (this.canvas.width / this.zoom) / 2;
        this.camera.y = this.player.y - (this.canvas.height / this.zoom) / 2;
    }

    private render() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);

        const startCol = Math.floor(this.camera.x / this.tileSize);
        const endCol = startCol + (this.canvas.width / this.zoom / this.tileSize) + 1;
        const startRow = Math.floor(this.camera.y / this.tileSize);
        const endRow = startRow + (this.canvas.height / this.zoom / this.tileSize) + 1;

        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (x >= startCol -1 && x <= endCol +1 && y >= startRow -1 && y <= endRow +1) {
                    const tile = this.tiles[y][x];
                    if (tile === 1) this.ctx.fillStyle = '#44403c'; 
                    else this.ctx.fillStyle = '#1c1917'; 
                    this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                    this.ctx.strokeStyle = '#292524';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }

        this.entities.forEach(e => {
            let drawn = false;

            if (e.spritePath) {
                const img = this.getImage(e.spritePath);
                if (img && img.complete && img.naturalHeight !== 0) {
                    const drawX = e.x - (48 - e.width)/2; 
                    const drawY = e.y - (48 - e.height)/2;
                    this.ctx.drawImage(img, drawX, drawY, 48, 48);
                    drawn = true;
                }
            }

            if (!drawn) {
                if (e.spritePath && this.brokenImages.has(e.spritePath)) {
                    this.ctx.fillStyle = '#ff00ff'; 
                    this.ctx.globalAlpha = 0.5;
                    this.ctx.fillRect(e.x, e.y, e.width, e.height);
                    this.ctx.globalAlpha = 1.0;
                    
                    this.ctx.fillStyle = 'white';
                    this.ctx.font = '10px monospace';
                    this.ctx.fillText("404", e.x + 6, e.y + 20);
                } else {
                    this.ctx.fillStyle = e.color;
                    if (e.type === 'PROJECTILE') {
                        this.ctx.beginPath();
                        this.ctx.arc(e.x + 4, e.y + 4, 4, 0, Math.PI * 2);
                        this.ctx.fill();
                    } else {
                        this.ctx.fillRect(e.x, e.y, e.width, e.height);
                    }
                }
            }

            if (e.type === 'ENEMY') {
                 this.ctx.fillStyle = 'red';
                 this.ctx.fillRect(e.x, e.y - 8, 32, 4);
                 this.ctx.fillStyle = 'green';
                 this.ctx.fillRect(e.x, e.y - 8, 32 * (e.hp/e.maxHp), 4);
            }
        });

        this.ctx.restore();
    }

    // --- UTILS ---
    private getImage(path: string): HTMLImageElement | null {
        // Resolve path via global registry if it's a blob
        const registry = window.GAME_BLOB_REGISTRY || {};
        const resolvedPath = registry[path] || path;

        if (this.brokenImages.has(resolvedPath)) {
            return null; 
        }

        if (this.imageCache.has(resolvedPath)) {
            return this.imageCache.get(resolvedPath)!;
        }

        const img = new Image();
        img.crossOrigin = "Anonymous"; 
        
        let src = resolvedPath;

        // NEW LOGIC: Support External URLs AND Relative Paths
        // If it starts with http or data, use it as is.
        // If it doesn't, allow it to be relative (don't prepend github raw url).
        if (!src.startsWith('http') && !src.startsWith('data:') && GITHUB_ASSET_BASE_URL) {
            src = `${GITHUB_ASSET_BASE_URL}${src}`;
        }
        // If GITHUB_ASSET_BASE_URL is empty (default now), 'src' stays as 'assets/...' which is relative to domain.

        img.src = src;
        
        img.onload = () => {
             // Success
        };
        
        img.onerror = () => {
            console.warn(`IMMORTALIS ENGINE: Asset Load Error: ${path} | Final URL: ${img.src}`);
            this.brokenImages.add(resolvedPath);
        };

        this.imageCache.set(resolvedPath, img);
        return img;
    }

    private spawnEnemy(x: number, y: number, creatureId: string) {
        const creatureData = gameState.getCreatureById(creatureId);
        const spritePath = creatureData?.spritePath || 'assets/sprites/creatures/loira_idle.png';

        this.entities.push({
            id: creatureId, 
            x, y,
            width: 32, height: 32, 
            color: '#78716c',
            type: 'ENEMY',
            vx: 0, vy: 0,
            hp: 50 + (creatureData?.threatLevel || 1) * 10,
            maxHp: 50 + (creatureData?.threatLevel || 1) * 10,
            spritePath: spritePath,
            spriteLoaded: false
        });
    }

    private attack() {
        const centerX = this.player.x + this.player.width/2;
        const centerY = this.player.y + this.player.height/2;
        
        const dx = this.mouse.x - centerX;
        const dy = this.mouse.y - centerY;
        const len = Math.sqrt(dx*dx + dy*dy);
        
        if (len === 0) return;

        const bulletSpeed = 600;

        this.entities.push({
            id: `bullet_${Date.now()}`,
            x: centerX,
            y: centerY,
            width: 8, height: 8,
            color: '#fbbf24',
            type: 'PROJECTILE',
            vx: (dx/len) * bulletSpeed,
            vy: (dy/len) * bulletSpeed,
            hp: 1, maxHp: 1
        });
    }

    private checkMapCollision(x: number, y: number, w: number, h: number): boolean {
        const points = [
            {x: x, y: y},
            {x: x + w, y: y},
            {x: x, y: y + h},
            {x: x + w, y: y + h}
        ];

        for (const p of points) {
            const tx = Math.floor(p.x / this.tileSize);
            const ty = Math.floor(p.y / this.tileSize);
            if (ty < 0 || ty >= this.mapHeight || tx < 0 || tx >= this.mapWidth || this.tiles[ty][tx] === 1) {
                return true;
            }
        }
        return false;
    }

    private checkEntityCollision(a: Entity, b: Entity): boolean {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }
}