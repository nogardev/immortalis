import { Creature, DamageType, Mission, PlayerStats, Weapon } from './types';
import { ASSET_REGISTRY } from './game/asset_registry';

// ==========================================
// CONFIGURAÇÃO DE ASSETS (SMART PIPELINE)
// ==========================================

const REPO_PATH = 'nogardev/immortalis'; 
const BRANCH = 'main';

/**
 * Helper to determine asset mode without circular dependency on GameState
 */
const getIsRepoPublic = (): boolean => {
    try {
        const STORAGE_KEY = 'IMMORTALIS_GAME_STATE_V8';
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Se o usuário explicitamente setou LOCAL, respeitamos. Caso contrário, GITHUB.
            return parsed.assetSourceMode !== 'LOCAL'; 
        }
    } catch (e) {
        // Fallback
    }
    return true; // DEFAULT: GitHub Public Mode (Agora que o repo é público)
};

export const IS_REPO_PUBLIC = getIsRepoPublic();

/**
 * RESOLVE ASSET PATH
 * Centraliza a lógica de carregamento de imagens.
 */
export const resolveAssetPath = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;

    // Normalização Inteligente:
    // Remove barra inicial '/'
    let cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // Se o usuário colou "public/assets/..." mas o Vite (Local) precisa de "assets/..."
    // Ou se o GitHub precisa de "public/assets/..."
    
    const useGitHub = IS_REPO_PUBLIC;

    if (useGitHub) {
        // GITHUB RAW MODE
        // O GitHub Raw PRECISA da pasta 'public' no caminho para este projeto específico
        // baseado na estrutura vista: immortalis/public/assets/...
        let repoPath = cleanPath;
        
        // Se o caminho NÃO começa com 'public/', adicionamos.
        if (!repoPath.startsWith('public/')) {
            repoPath = `public/${repoPath}`;
        }
        
        return `https://raw.githubusercontent.com/${REPO_PATH}/${BRANCH}/${repoPath}`;
    } else {
        // LOCAL/VERCEL MODE
        // O servidor de desenvolvimento serve a pasta 'public' na raiz.
        // Logo, 'public/assets/img.png' deve ser acessado como '/assets/img.png'
        
        let servePath = cleanPath;
        
        // Se o caminho COMEÇA com 'public/', removemos para o modo local.
        if (servePath.startsWith('public/')) {
            servePath = servePath.replace(/^public\//, '');
        }
        
        return `/${servePath}`;
    }
};

// Wrapper simples para usar nas definições abaixo
const asset = (path: string) => path; 

export const GITHUB_ASSET_BASE_URL = `https://raw.githubusercontent.com/${REPO_PATH}/${BRANCH}/public/`;

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
    spritePath: asset(ASSET_REGISTRY.WEAPONS.REVOLVER)
  },
  {
    id: 'silver_whip',
    name: 'Silver Whip',
    description: 'Blessed silver woven into leather.',
    damage: 8,
    type: DamageType.HOLY,
    cooldown: 400,
    spritePath: asset(ASSET_REGISTRY.WEAPONS.WHIP)
  }
];

export const BESTIARY_DATA: Creature[] = [
  {
    id: 'loira_banheiro',
    name: 'Loira do Banheiro',
    threatLevel: 1,
    baseHp: 60,
    baseDamage: 12,
    description: 'A psychological manifestation born from school urban legends. Manifests near mirrors.',
    behavior: 'Teleports behind the player when looked at directly for too long.',
    weaknesses: [DamageType.HOLY, DamageType.OCCULT],
    drops: ['Mirror Shard', 'Ectoplasm'],
    spritePath: asset(ASSET_REGISTRY.CREATURES.LOIRA_IDLE),
    illustrationPath: asset(ASSET_REGISTRY.ILLUSTRATIONS.LOIRA_SKETCH),
    unlocked: true
  },
  {
    id: 'corpo_seco',
    name: 'Corpo-Seco',
    threatLevel: 4,
    baseHp: 150,
    baseDamage: 8,
    description: 'A dried corpse rejected by both heaven and hell. Clings to trees and unwary travelers.',
    behavior: 'Slow movement, high grappling damage. Immunue to physical pain.',
    weaknesses: [DamageType.FIRE, DamageType.HOLY],
    drops: ['Dry Bone', 'Cursed Soil'],
    spritePath: asset(ASSET_REGISTRY.CREATURES.CORPO_SECO),
    illustrationPath: asset(ASSET_REGISTRY.ILLUSTRATIONS.CORPO_SECO_SKETCH),
    unlocked: false
  },
  {
    id: 'lobisomem',
    name: 'Lobisomem (Werewolf)',
    threatLevel: 12,
    baseHp: 300,
    baseDamage: 25,
    description: 'A cursed human forced to transform under the full moon.',
    behavior: 'Extremely fast, aggressive melee attacks. Regenerates health.',
    weaknesses: [DamageType.BALLISTIC, DamageType.HOLY], 
    drops: ['Wolf Pelt', 'Cursed Blood'],
    spritePath: asset(ASSET_REGISTRY.CREATURES.WEREWOLF),
    illustrationPath: asset(ASSET_REGISTRY.ILLUSTRATIONS.WEREWOLF_SKETCH),
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