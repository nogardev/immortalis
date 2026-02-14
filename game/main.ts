import { eventBus, GameEvents } from '../services/eventBus';
import { gameState } from '../services/gameState';
import { Mission } from '../types';
import { resolveAssetPath, GITHUB_ASSET_BASE_URL } from '../constants';

// --- ENGINE TYPES ---
interface Point { x: number; y: number; }

type EntityType = 'PLAYER' | 'ENEMY' | 'PROJECTILE' | 'MIRROR';
type BossState = 'NEUTRAL' | 'SCREAMING_TRANSITION' | 'HIDING' | 'TELEGRAPH' | 'DASHING' | 'STUNNED';

interface Entity {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    type: EntityType;
    vx: number;
    vy: number;
    hp: number;
    maxHp: number;
    damage?: number; 
    spritePath?: string;
    spriteLoaded?: boolean;
    spriteError?: boolean;
    opacity?: number; // Visual fade for telegraphing
    
    // Boss & AI States
    isBoss?: boolean;
    bossState?: BossState;
    stateTimer?: number;    // Generic timer for states
    phase?: number;         // Current Phase (1, 2, 3)
    maxPhases?: number;     // Total phases
    
    // Phase 3 Mechanics
    nextMirrorThreshold?: number; // 0.8, 0.6, 0.4, 0.2
    
    // Abilities
    lastSpecialTime?: number; // Scream cooldown
    isScreaming?: boolean;    // Visual state for scream
    
    lastDashTime?: number;    // Dash cooldown
    isDashing?: boolean;      // Is currently dashing?
    dashDuration?: number;    // How long left in dash
    
    // Player Specific
    lastDamageTime?: number;  // Invulnerability frame tracker
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
    private zoom: number = 1.8; // Zoomed in for the small room feel

    // Juice Effects (Screen Shake)
    private shakeX: number = 0;
    private shakeY: number = 0;
    private shakeDuration: number = 0;
    private shakeIntensity: number = 0;
    
    // Map Data - REDUCED SIZE FOR CLAUSTROPHOBIC BATHROOM FEEL
    private mapWidth = 24; 
    private mapHeight = 18;
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
        
        // Spawn Player in the middle-ish
        this.player = {
            id: 'player',
            x: (this.mapWidth * this.tileSize) / 2,
            y: (this.mapHeight * this.tileSize) / 2 + 100,
            width: 32, 
            height: 32,
            color: '#ef4444',
            type: 'PLAYER',
            vx: 0,
            vy: 0,
            hp: playerConfig.baseStats.hp,
            maxHp: playerConfig.baseStats.hp,
            spritePath: playerConfig.spritePath,
            spriteLoaded: false,
            opacity: 1,
            lastDamageTime: 0
        };

        this.entities.push(this.player);
        
        // Listen for DevChat events to modify entities in real-time
        eventBus.on(GameEvents.REQUEST_DEV_ACTION, this.handleDevAction);

        // Spawn Boss near the top
        const bossX = (this.mapWidth * this.tileSize) / 2;
        const bossY = (this.mapHeight * this.tileSize) / 2 - 100;

        if (this.currentMission) {
            this.spawnEnemy(bossX, bossY, this.currentMission.bossId);
        } else {
            this.spawnEnemy(bossX, bossY, 'loira_banheiro');
        }

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        canvas.addEventListener('mousemove', this.handleMouseMove);
        canvas.addEventListener('mousedown', this.handleMouseDown);
    }
    
    private handleDevAction = (action: any) => {
        if (action.type === 'HEAL_PLAYER') {
            this.player.hp = this.player.maxHp;
            eventBus.emit(GameEvents.PLAYER_HP_CHANGE, this.player.hp);
            this.triggerShake(0.2, 5);
        }
        if (action.type === 'KILL_ALL') {
             this.entities.forEach(e => {
                 if (e.type === 'ENEMY') e.hp = 0;
             });
             this.triggerShake(0.5, 20);
        }
        if (action.type === 'SPAWN') {
             this.spawnEnemy(this.player.x + 100, this.player.y, action.id);
        }
    };

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
        eventBus.off(GameEvents.REQUEST_DEV_ACTION, this.handleDevAction);
    }

    // --- SCREEN SHAKE UTILS ---
    private triggerShake(duration: number, intensity: number) {
        this.shakeDuration = duration;
        this.shakeIntensity = intensity;
    }

    private updateShake(dt: number) {
        if (this.shakeDuration > 0) {
            this.shakeDuration -= dt;
            this.shakeX = (Math.random() * 2 - 1) * this.shakeIntensity;
            this.shakeY = (Math.random() * 2 - 1) * this.shakeIntensity;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }
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
        // Handle Global Effects
        this.updateShake(dt);

        const playerConfig = gameState.getPlayerConfig();
        const speed = playerConfig.baseStats.speed;

        this.player.vx = 0;
        this.player.vy = 0;
        if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) this.player.vy = -speed;
        if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) this.player.vy = speed;
        if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) this.player.vx = -speed;
        if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) this.player.vx = speed;

        const now = Date.now();

        // PLAYER INVULNERABILITY BLINK
        if (this.player.lastDamageTime && now - this.player.lastDamageTime < 1000) {
            // Blinking effect
            this.player.opacity = Math.floor(now / 100) % 2 === 0 ? 0.5 : 1;
        } else {
            this.player.opacity = 1;
        }

        this.entities.forEach(entity => {
            if (entity.type === 'ENEMY') {
                const dx = this.player.x - entity.x;
                const dy = this.player.y - entity.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                // Initialize timings
                if (!entity.lastSpecialTime) entity.lastSpecialTime = now;
                if (!entity.lastDashTime) entity.lastDashTime = now;
                if (!entity.dashDuration) entity.dashDuration = 0;
                if (!entity.stateTimer) entity.stateTimer = 0;
                if (!entity.bossState) entity.bossState = 'NEUTRAL';
                
                // Reset visuals
                entity.isScreaming = false;
                entity.isDashing = false;
                entity.opacity = 1;

                // --- PLAYER DAMAGE LOGIC ---
                // Check collision with player
                if (entity.bossState !== 'HIDING' && entity.bossState !== 'TELEGRAPH') {
                    if (this.checkEntityCollision(this.player, entity)) {
                        this.damagePlayer(entity.damage || 10);
                    }
                }

                // --- BOSS LOGIC: LOIRA DO BANHEIRO ---
                if (entity.id === 'loira_banheiro') {
                    
                    // 1. HANDLE TRANSITION STATE (SCREAMING BETWEEN PHASES)
                    if (entity.bossState === 'SCREAMING_TRANSITION') {
                        entity.vx = 0;
                        entity.vy = 0;
                        entity.isScreaming = true;
                        
                        // Continue shaking screen
                        this.shakeDuration = 0.1; 
                        this.shakeIntensity = 8;

                        entity.stateTimer -= dt;
                        if (entity.stateTimer <= 0) {
                            // Transition Finished
                            entity.phase = (entity.phase || 1) + 1;
                            entity.bossState = 'NEUTRAL';
                            entity.hp = entity.maxHp; // Heal to full for next phase
                            entity.nextMirrorThreshold = 0.8; // Reset threshold logic for Phase 3
                        }
                        return; // SKIP OTHER LOGIC
                    }

                    // 2. HANDLE PHASE 3 MIRROR MECHANICS
                    if (entity.phase === 3) {
                         // CHECK HP THRESHOLD (80%, 60%, 40%, 20%)
                         const hpPercent = entity.hp / entity.maxHp;
                         if (entity.bossState === 'NEUTRAL' && entity.nextMirrorThreshold && hpPercent <= entity.nextMirrorThreshold) {
                             entity.bossState = 'HIDING';
                             entity.stateTimer = 1.0; // Hide for 1s
                             entity.nextMirrorThreshold -= 0.2; // Next threshold
                         }

                         if (entity.bossState === 'HIDING') {
                             entity.opacity = 0;
                             entity.vx = 0;
                             entity.vy = 0;
                             entity.stateTimer -= dt;
                             
                             if (entity.stateTimer <= 0) {
                                 // Pick random mirror
                                 const mirrors = this.entities.filter(e => e.type === 'MIRROR');
                                 if (mirrors.length > 0) {
                                     const targetMirror = mirrors[Math.floor(Math.random() * mirrors.length)];
                                     entity.x = targetMirror.x;
                                     entity.y = targetMirror.y;
                                 }
                                 
                                 entity.bossState = 'TELEGRAPH';
                                 entity.stateTimer = 1.5; // Telegraph time
                             }
                             return;
                         }

                         if (entity.bossState === 'TELEGRAPH') {
                             entity.opacity = 0.15; // VERY GHOSTLY (Requested)
                             entity.vx = 0;
                             entity.vy = 0;
                             entity.stateTimer -= dt;
                             
                             if (entity.stateTimer <= 0) {
                                 // LAUNCH DASH
                                 entity.bossState = 'DASHING';
                                 entity.opacity = 1;
                                 
                                 const speedMult = 700;
                                 const dashDx = this.player.x - entity.x;
                                 const dashDy = this.player.y - entity.y;
                                 const dashDist = Math.sqrt(dashDx*dashDx + dashDy*dashDy);
                                 
                                 entity.vx = (dashDx / dashDist) * speedMult;
                                 entity.vy = (dashDy / dashDist) * speedMult;
                                 
                                 entity.dashDuration = 0.5; // Long dash
                                 this.triggerShake(0.2, 5);
                             }
                             return;
                         }
                    }

                    // 3. HANDLE MOVEMENT & ATTACKS (NEUTRAL STATE)
                    
                    // Handle Active Dash Duration (from Phase 2 skill or Phase 3 mechanic)
                    if (entity.dashDuration > 0 || entity.bossState === 'DASHING') {
                        entity.dashDuration -= dt;
                        entity.isDashing = true;
                        
                        // Dash deals damage if colliding
                        if (this.checkEntityCollision(this.player, entity)) {
                             this.damagePlayer((entity.damage || 10) * 1.5); // Dash hurts more
                        }

                        if (entity.dashDuration <= 0) {
                            entity.bossState = 'NEUTRAL';
                        }
                    } 
                    else {
                        // STANDARD BEHAVIOR
                        const phase = entity.phase || 1;

                        // ABILITY: DASH (Phase 2 Only - Regular Cooldown)
                        const dashCooldown = 4000;
                        if (phase === 2 && now - entity.lastDashTime > dashCooldown && dist > 100 && dist < 400) {
                             entity.lastDashTime = now;
                             const speedMult = 500;
                             entity.vx = (dx / dist) * speedMult;
                             entity.vy = (dy / dist) * speedMult;
                             entity.dashDuration = 0.3;
                             this.triggerShake(0.1, 2);
                        } 
                        // ABILITY: SCREAM (Phase 1 & Phase 3 randomly)
                        else if ((phase === 1 || phase === 3) && now - entity.lastSpecialTime > 5000 && dist < 250) {
                            if (Math.random() < 0.02) { 
                                entity.lastSpecialTime = now;
                                entity.isScreaming = true;
                                this.triggerShake(0.5, 10);
                                this.damagePlayer(5); // Sonic damage?
                                
                                // Knockback Player
                                const recoilX = (this.player.x - entity.x) / dist * 120;
                                const recoilY = (this.player.y - entity.y) / dist * 120;
                                const nextPlayerX = this.player.x + recoilX;
                                const nextPlayerY = this.player.y + recoilY;

                                if (!this.checkMapCollision(nextPlayerX, this.player.y, this.player.width, this.player.height)) {
                                    this.player.x = nextPlayerX;
                                }
                                if (!this.checkMapCollision(this.player.x, nextPlayerY, this.player.width, this.player.height)) {
                                    this.player.y = nextPlayerY;
                                }
                            }
                        }
                        // STANDARD MOVEMENT
                        else {
                            if (dist > 30) {
                                const moveSpeed = phase === 3 ? 130 : 100;
                                entity.vx = (dx / dist) * moveSpeed;
                                entity.vy = (dy / dist) * moveSpeed;
                            } else {
                                entity.vx = 0;
                                entity.vy = 0;
                            }
                        }
                    }
                } 
                // GENERIC ENEMY LOGIC
                else {
                    if (dist > 30) {
                        entity.vx = (dx / dist) * 100;
                        entity.vy = (dy / dist) * 100;
                    } else {
                        entity.vx = 0;
                        entity.vy = 0;
                    }
                }
            }

            // Apply Velocity
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
                // Ignore Boss if she is hiding in mirror
                const hit = this.entities.find(e => 
                    e.type === 'ENEMY' && 
                    e.bossState !== 'HIDING' && // Can't hit while hiding
                    this.checkEntityCollision(entity, e)
                );
                
                if (hit) {
                    hit.hp -= 10;
                    
                    // BOSS DEATH/PHASE LOGIC
                    if (hit.hp <= 0 && hit.isBoss) {
                        const currentPhase = hit.phase || 1;
                        const maxPhases = hit.maxPhases || 1;

                        if (currentPhase < maxPhases) {
                            // IF NOT LAST PHASE -> TRIGGER TRANSITION STATE
                            if (hit.bossState !== 'SCREAMING_TRANSITION') {
                                hit.bossState = 'SCREAMING_TRANSITION';
                                hit.stateTimer = 3.0; // 3 Seconds Transition
                                hit.hp = 1; // Prevent death logic removal
                                
                                this.triggerShake(0.5, 15);
                                // Optional: Push player away
                                const dx = this.player.x - hit.x;
                                const dy = this.player.y - hit.y;
                                const dist = Math.sqrt(dx*dx + dy*dy);
                                if (dist > 0) {
                                    const pushX = (dx/dist) * 100;
                                    const pushY = (dy/dist) * 100;
                                     if (!this.checkMapCollision(this.player.x + pushX, this.player.y, this.player.width, this.player.height)) {
                                        this.player.x += pushX;
                                    }
                                    if (!this.checkMapCollision(this.player.x, this.player.y + pushY, this.player.width, this.player.height)) {
                                        this.player.y += pushY;
                                    }
                                }
                            }
                        } else {
                            // LAST PHASE - DIE FOR REAL
                            if (this.currentMission && hit.id === this.currentMission.bossId) {
                                setTimeout(() => {
                                    eventBus.emit(GameEvents.MISSION_COMPLETE, { victory: true, mission: this.currentMission });
                                }, 500);
                            }
                            return false; // Remove entity
                        }
                    }
                    else if (hit.hp <= 0) {
                        return false; // Remove normal enemy
                    }
                    
                    return false; // Remove bullet
                }
                const distFromStart = Math.sqrt((entity.x - this.player.x)**2 + (entity.y - this.player.y)**2);
                if (distFromStart > 800) return false;
            }
            return true;
        });

        this.camera.x = this.player.x - (this.canvas.width / this.zoom) / 2;
        this.camera.y = this.player.y - (this.canvas.height / this.zoom) / 2;
    }

    private damagePlayer(amount: number) {
        const now = Date.now();
        // 1 second invulnerability
        if (this.player.lastDamageTime && now - this.player.lastDamageTime < 1000) {
            return;
        }

        this.player.hp -= amount;
        this.player.lastDamageTime = now;
        this.triggerShake(0.3, 10);
        
        // Sync with UI
        eventBus.emit(GameEvents.PLAYER_HP_CHANGE, this.player.hp);

        if (this.player.hp <= 0) {
            this.player.hp = 0;
            eventBus.emit(GameEvents.GAME_OVER);
            this.stop();
        }
    }

    private render() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.scale(this.zoom, this.zoom);
        // Apply Camera + Screen Shake
        this.ctx.translate(-this.camera.x + this.shakeX, -this.camera.y + this.shakeY);

        const startCol = Math.floor(this.camera.x / this.tileSize);
        const endCol = startCol + (this.canvas.width / this.zoom / this.tileSize) + 1;
        const startRow = Math.floor(this.camera.y / this.tileSize);
        const endRow = startRow + (this.canvas.height / this.zoom / this.tileSize) + 1;

        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                // Determine visibility for optimization
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
            // DRAW MIRRORS
            if (e.type === 'MIRROR') {
                this.ctx.fillStyle = '#06b6d4'; // Cyan
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillRect(e.x, e.y, e.width, e.height);
                this.ctx.strokeStyle = '#22d3ee';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(e.x, e.y, e.width, e.height);
                this.ctx.globalAlpha = 1.0;
                return; // Skip normal drawing
            }

            let drawn = false;
            const currentOpacity = e.opacity !== undefined ? e.opacity : 1.0;
            this.ctx.globalAlpha = currentOpacity;

            // DRAW SPRITE
            if (e.spritePath) {
                const img = this.getImage(e.spritePath);
                // Draw if img is loaded and has dimensions
                if (img && img.complete && img.naturalHeight !== 0) {
                    const drawX = e.x - (48 - e.width)/2; 
                    const drawY = e.y - (48 - e.height)/2;
                    this.ctx.drawImage(img, drawX, drawY, 48, 48);
                    drawn = true;
                }
            }

            // FALLBACK / RECT DRAW
            if (!drawn) {
                // Determine if we should draw a "Missing Texture" block or just the simple rect
                if (e.spritePath && this.brokenImages.has(e.spritePath)) {
                    // Magenta Box for error
                    this.ctx.fillStyle = '#ff00ff'; 
                    this.ctx.globalAlpha = 0.5;
                    this.ctx.fillRect(e.x, e.y, e.width, e.height);
                } else {
                    // Simple shape fallback
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
            
            this.ctx.globalAlpha = 1.0; // Reset

            // --- VISUAL EFFECTS (DASH GHOSTS & SCREAM) ---
            if (e.isDashing) {
                // Ghost trail
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(e.x - e.vx * 0.05, e.y - e.vy * 0.05, e.width, e.height);
                this.ctx.globalAlpha = 1.0;
            }

            if (e.isScreaming && this.shakeDuration > 0) {
                 this.ctx.beginPath();
                 // Pulse effect
                 const pulse = (Math.sin(Date.now() / 50) + 1) / 2;
                 this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + pulse * 0.5})`;
                 this.ctx.lineWidth = 2;
                 this.ctx.arc(e.x + 16, e.y + 16, 40 + pulse * 20, 0, Math.PI * 2);
                 this.ctx.stroke();
            }

            // --- HEALTH BARS ---
            // 1. ENEMY/BOSS BARS
            if (e.type === 'ENEMY' && e.bossState !== 'HIDING') {
                 if (e.isBoss) {
                     // BOSS HP BAR (Larger, Phases)
                     const barWidth = 64;
                     const barHeight = 8;
                     const xOffset = (barWidth - e.width) / 2;
                     const yOffset = 16;

                     // Determine Color based on Phase
                     let hpColor = '#22c55e'; // Phase 1: Green
                     if (e.phase === 2) hpColor = '#f97316'; // Phase 2: Orange
                     if (e.phase === 3) hpColor = '#9333ea'; // Phase 3: Purple

                     this.ctx.fillStyle = '#000';
                     this.ctx.fillRect(e.x - xOffset, e.y - yOffset, barWidth, barHeight);
                     
                     this.ctx.fillStyle = hpColor;
                     this.ctx.fillRect(e.x - xOffset, e.y - yOffset, barWidth * (e.hp/e.maxHp), barHeight);
                     
                     // Border
                     this.ctx.strokeStyle = '#fff';
                     this.ctx.lineWidth = 1;
                     this.ctx.strokeRect(e.x - xOffset, e.y - yOffset, barWidth, barHeight);

                     // Phase Indicators (dots)
                     if (e.maxPhases && e.phase) {
                         const remainingPhases = (e.maxPhases - e.phase) + 1; // 1 means current
                         for(let i=0; i< e.maxPhases; i++) {
                             this.ctx.fillStyle = i < remainingPhases ? hpColor : '#333';
                             this.ctx.beginPath();
                             this.ctx.arc(e.x - xOffset + (i * 10) + 4, e.y - yOffset - 4, 3, 0, Math.PI*2);
                             this.ctx.fill();
                         }
                     }
                 } else {
                     // STANDARD ENEMY HP BAR
                     this.ctx.fillStyle = 'red';
                     this.ctx.fillRect(e.x, e.y - 8, 32, 4);
                     this.ctx.fillStyle = 'green';
                     this.ctx.fillRect(e.x, e.y - 8, 32 * (e.hp/e.maxHp), 4);
                 }
            }

            // 2. PLAYER HP BAR
            if (e.type === 'PLAYER') {
                const barWidth = 32;
                const barHeight = 4;
                const xOffset = 0;
                const yOffset = 10;
                
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(e.x, e.y - yOffset, barWidth, barHeight);
                
                // Blue color for player
                this.ctx.fillStyle = '#3b82f6'; 
                const hpPercent = Math.max(0, e.hp / e.maxHp);
                this.ctx.fillRect(e.x, e.y - yOffset, barWidth * hpPercent, barHeight);
                
                this.ctx.strokeStyle = '#93c5fd';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(e.x, e.y - yOffset, barWidth, barHeight);
            }
        });

        this.ctx.restore();
    }

    // --- ASSET LOADER WITH GITHUB FALLBACK ---
    private getImage(path: string): HTMLImageElement | null {
        // Use central resolver from constants
        const resolvedPath = resolveAssetPath(path);

        // Check registry for blobs (local editor uploads)
        const registry = window.GAME_BLOB_REGISTRY || {};
        const finalPath = registry[path] || resolvedPath;

        // If we already know this image is absolutely broken, return null to trigger rect fallback
        if (this.brokenImages.has(finalPath)) {
            return null; 
        }

        if (this.imageCache.has(finalPath)) {
            return this.imageCache.get(finalPath)!;
        }

        const img = new Image();
        img.crossOrigin = "Anonymous"; 
        
        img.onerror = () => {
            if (!finalPath.startsWith('http')) {
                let cleanPath = path;
                if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);
                if (cleanPath.startsWith('public/')) cleanPath = cleanPath.replace('public/', '');
                const fallbackUrl = `${GITHUB_ASSET_BASE_URL}${cleanPath}`;
                img.src = fallbackUrl;
                
                img.onerror = () => {
                    this.brokenImages.add(finalPath);
                };
            } else {
                this.brokenImages.add(finalPath);
            }
        };

        img.src = finalPath;
        
        this.imageCache.set(finalPath, img);
        return img;
    }

    private spawnEnemy(x: number, y: number, creatureId: string) {
        const creatureData = gameState.getCreatureById(creatureId);
        const spritePath = creatureData?.spritePath || 'assets/sprites/creatures/loira_idle.png';
        
        const hp = creatureData?.baseHp || (50 + (creatureData?.threatLevel || 1) * 10);
        const dmg = creatureData?.baseDamage || 5;

        // BOSS CONFIGURATION
        let isBoss = false;
        let phases = 1;
        let currentHp = hp;

        if (creatureData?.maxPhases && creatureData.maxPhases > 1) {
            isBoss = true;
            phases = creatureData.maxPhases;
        } else if (creatureId === 'loira_banheiro') {
            isBoss = true;
            phases = 3; 
        }

        if (isBoss) {
            // Spawn Mirrors for Boss Fight (Phase 3 Prep)
            // UPDATED: Tighter spread for the smaller room (24x18 tiles)
            // Tile size 32. Room approx 768x576. 
            // Walls are at index 0 and 23 (x), 0 and 17 (y)
            const mirrorLocs = [
                {x: 64, y: 100},   // Left Wall Top
                {x: 64, y: 400},   // Left Wall Bottom
                {x: 670, y: 100},  // Right Wall Top
                {x: 670, y: 400},  // Right Wall Bottom
                {x: 350, y: 64}    // Top Center
            ];
            
            mirrorLocs.forEach(loc => {
                this.entities.push({
                    id: 'mirror',
                    x: loc.x, y: loc.y,
                    width: 32, height: 64,
                    color: 'cyan',
                    type: 'MIRROR',
                    vx: 0, vy: 0,
                    hp: 9999, maxHp: 9999
                });
            });
        }

        this.entities.push({
            id: creatureId, 
            x, y,
            width: 32, height: 32, 
            color: '#78716c',
            type: 'ENEMY',
            vx: 0, vy: 0,
            hp: currentHp,
            maxHp: currentHp,
            damage: dmg,
            spritePath: spritePath,
            spriteLoaded: false,
            isBoss: isBoss,
            bossState: 'NEUTRAL',
            phase: 1,
            maxPhases: phases,
            nextMirrorThreshold: 0.8 // 80% HP
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