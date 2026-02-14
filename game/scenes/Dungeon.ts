import Phaser from 'phaser';
import { eventBus, GameEvents } from '../../services/eventBus';
import { INITIAL_PLAYER_STATS } from '../../constants';

export class Dungeon extends Phaser.Scene {
    // Explicitly declare properties to satisfy TS
    public add!: Phaser.GameObjects.GameObjectFactory;
    public physics!: Phaser.Physics.Arcade.ArcadePhysics;
    public make!: Phaser.GameObjects.GameObjectCreator;
    public cameras!: Phaser.Cameras.Scene2D.CameraManager;
    public input!: Phaser.Input.InputPlugin;
    public time!: Phaser.Time.Clock;

    private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private attackKey!: Phaser.Input.Keyboard.Key;
    private speed: number = INITIAL_PLAYER_STATS.attributes.speed;
    private isAttacking: boolean = false;
    private enemies!: Phaser.Physics.Arcade.Group;
    private bullets!: Phaser.Physics.Arcade.Group;

    constructor() {
        super('Dungeon');
    }

    create() {
        // 1. Map Generation (Mockup for Top-Down)
        // Creating a simple dark floor
        const mapWidth = 1600;
        const mapHeight = 1200;
        this.add.grid(mapWidth/2, mapHeight/2, mapWidth, mapHeight, 32, 32, 0x1c1917, 1, 0x292524, 1);
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

        // 2. Create Player (Placeholder graphics)
        const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        playerGraphics.fillStyle(0xef4444, 1); // Red player
        playerGraphics.fillRect(0, 0, 32, 32);
        playerGraphics.generateTexture('player_placeholder', 32, 32);

        this.player = this.physics.add.sprite(400, 300, 'player_placeholder');
        this.player.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(2);

        // 3. Inputs
        if(this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        }

        // 4. Enemies Group
        this.enemies = this.physics.add.group();
        
        // Spawn a dummy enemy
        this.spawnEnemy(600, 400, 'Loira do Banheiro');

        // 5. Bullets/Weapon Effects
        this.bullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 10,
            runChildUpdate: true
        });

        // 6. Collisions
        this.physics.add.collider(this.player, this.enemies, this.handlePlayerHit, undefined, this);
        this.physics.add.overlap(this.bullets, this.enemies, this.handleBulletHit, undefined, this);
    }

    spawnEnemy(x: number, y: number, type: string) {
        const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        enemyGraphics.fillStyle(0x44403c, 1); // Dark stone color
        enemyGraphics.fillRect(0, 0, 32, 32);
        enemyGraphics.generateTexture('enemy_placeholder', 32, 32);

        const enemy = this.enemies.create(x, y, 'enemy_placeholder');
        enemy.setCollideWorldBounds(true);
        enemy.setData('hp', 50);
        enemy.setData('type', type);
        
        // Simple AI: Move towards player
        this.time.addEvent({
            delay: 500,
            callback: () => {
                if (enemy.active) {
                    this.physics.moveToObject(enemy, this.player, 50);
                }
            },
            loop: true
        });
    }

    update() {
        if (!this.cursors) return;

        this.player.setVelocity(0);

        // Movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-this.speed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(this.speed);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-this.speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(this.speed);
        }

        // Normalization
        this.player.body.velocity.normalize().scale(this.speed);

        // Attack
        if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking) {
            this.attack();
        }
    }

    attack() {
        this.isAttacking = true;
        
        // Simple projectile logic (Pistol style)
        const bullet = this.make.graphics({x:0, y:0, add: false});
        bullet.fillStyle(0xffd700, 1);
        bullet.fillCircle(4,4,4);
        bullet.generateTexture('bullet', 8, 8);

        const projectile = this.bullets.create(this.player.x, this.player.y, 'bullet');
        if (projectile) {
            // Fire in direction of mouse or movement? Let's do movement for simplicity or right if idle
            let vx = 0; 
            let vy = 0;
            
            if (this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0) {
                 vx = 400; // default right
            } else {
                 vx = this.player.body.velocity.x * 3;
                 vy = this.player.body.velocity.y * 3;
            }
            
            // Normalize really fast
            if (vx === 0 && vy === 0) vx = 400;
            
            projectile.setVelocity(vx, vy);
            projectile.setLifeTime = 1000; // custom prop
        }

        // Cooldown
        this.time.delayedCall(500, () => {
            this.isAttacking = false;
        });
    }

    handlePlayerHit(player: any, enemy: any) {
        // Knockback
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
        const vector = new Phaser.Math.Vector2();
        vector.setToPolar(angle, 200);
        player.setVelocity(vector.x, vector.y);
        
        // Signal React UI
        eventBus.emit(GameEvents.PLAYER_HP_CHANGE, -10);
    }

    handleBulletHit(bullet: any, enemy: any) {
        bullet.destroy();
        const currentHp = enemy.getData('hp');
        const newHp = currentHp - 15; // Weapon damage
        
        enemy.setData('hp', newHp);
        
        // Flash white
        enemy.setTint(0xff0000);
        this.time.delayedCall(100, () => enemy.clearTint());

        if (newHp <= 0) {
            enemy.destroy();
            // Signal mission progress or xp gain
        }
    }
}