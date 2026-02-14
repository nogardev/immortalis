import { Creature, DamageType, Mission, PlayerStats, Weapon } from './types';

// ==========================================
// CONFIGURAÇÃO DE ASSETS (PIPELINE)
// ==========================================

// Mude para TRUE se você tornar seu repositório PÚBLICO no GitHub.
// Isso permitirá carregar imagens direto do código fonte via CDN.
export const IS_REPO_PUBLIC = false; 

// Seu usuário/repositório (usado apenas se IS_REPO_PUBLIC = true)
const REPO_PATH = 'nogardev/immortalis'; 
const BRANCH = 'main';

// LÓGICA DE URL:
// Se Público -> Usa JSDelivr (Rápido, CDN Global) ou Raw GitHub.
// Se Privado -> Usa caminho relativo (ex: /assets/...). O arquivo DEVE estar na pasta 'public/' do projeto.
export const GITHUB_ASSET_BASE_URL = IS_REPO_PUBLIC 
    ? `https://raw.githubusercontent.com/${REPO_PATH}/${BRANCH}/`
    : ''; // String vazia força o navegador a procurar na mesma pasta do site (Local/Vercel)

// Helper para construir URL
const asset = (path: string) => {
    // Se for link externo (Discord, Imgur) ou Base64, usa direto
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    
    // Limpeza do path
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // Se for privado, garante que começa com / para ser relativo à raiz do site
    if (!IS_REPO_PUBLIC && !path.startsWith('/')) {
        return `/${cleanPath}`;
    }

    return `${GITHUB_ASSET_BASE_URL}${cleanPath}`;
};

export const INITIAL_PLAYER_STATS: PlayerStats = {
  level: 1,
  xp: 0,
  nextLevelXp: 100,
  pointsAvailable: 0,
  attributes: {
    hp: 100,
    stamina: 50,
    baseDamage: 5,
    speed: 160
  }
};

export const WEAPONS: Weapon[] = [
  {
    id: 'rusty_revolver',
    name: 'Rusty Revolver',
    description: 'An old service weapon. Reliable, but loud.',
    damage: 15,
    type: DamageType.BALLISTIC,
    cooldown: 800,
    spritePath: asset('assets/sprites/weapons/revolver.png')
  },
  {
    id: 'silver_whip',
    name: 'Silver Whip',
    description: 'Blessed silver woven into leather.',
    damage: 8,
    type: DamageType.HOLY,
    cooldown: 400,
    spritePath: asset('assets/sprites/weapons/whip.png')
  }
];

export const BESTIARY_DATA: Creature[] = [
  {
    id: 'loira_banheiro',
    name: 'Loira do Banheiro',
    threatLevel: 1,
    description: 'A psychological manifestation born from school urban legends. Manifests near mirrors.',
    behavior: 'Teleports behind the player when looked at directly for too long.',
    weaknesses: [DamageType.HOLY, DamageType.OCCULT],
    drops: ['Mirror Shard', 'Ectoplasm'],
    spritePath: asset('assets/sprites/creatures/loira_idle.png'),
    illustrationPath: asset('assets/bestiary/loira_sketch.png'),
    unlocked: true
  },
  {
    id: 'corpo_seco',
    name: 'Corpo-Seco',
    threatLevel: 4,
    description: 'A dried corpse rejected by both heaven and hell. Clings to trees and unwary travelers.',
    behavior: 'Slow movement, high grappling damage. Immunue to physical pain.',
    weaknesses: [DamageType.FIRE, DamageType.HOLY],
    drops: ['Dry Bone', 'Cursed Soil'],
    spritePath: asset('assets/sprites/creatures/corpo_seco.png'),
    illustrationPath: asset('assets/bestiary/corpo_seco_sketch.png'),
    unlocked: false
  },
  {
    id: 'lobisomem',
    name: 'Lobisomem (Werewolf)',
    threatLevel: 12,
    description: 'A cursed human forced to transform under the full moon.',
    behavior: 'Extremely fast, aggressive melee attacks. Regenerates health.',
    weaknesses: [DamageType.BALLISTIC, DamageType.HOLY], 
    drops: ['Wolf Pelt', 'Cursed Blood'],
    spritePath: asset('assets/sprites/creatures/werewolf.png'),
    illustrationPath: asset('assets/bestiary/werewolf_sketch.png'),
    unlocked: false
  }
];

export const MISSIONS: Mission[] = [
  {
    id: 'm_001',
    title: 'The Crying Mirror',
    description: 'Students report sobbing coming from the 3rd-floor bathroom.',
    threatLevel: 1,
    bossId: 'loira_banheiro',
    rewardXp: 150,
    completed: false
  },
  {
    id: 'm_002',
    title: 'The Dried Orchard',
    description: 'Farmers are disappearing near the old withered fig tree.',
    threatLevel: 4,
    bossId: 'corpo_seco',
    rewardXp: 400,
    completed: false
  }
];