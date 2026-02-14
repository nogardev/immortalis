
import { Creature, DamageType, Mission, PlayerStats, Weapon } from './types';
import { ASSET_REGISTRY } from './game/asset_registry';

// ==========================================
// CONFIGURAÇÃO DE ASSETS (SMART PIPELINE)
// ==========================================

const REPO_PATH = 'nogardev/immortalis'; 
const BRANCH = 'main';

// ==========================================
// CONFIGURAÇÃO DE DESENVOLVIMENTO
// ==========================================

/**
 * Define se as ferramentas de Debug (Engine Tools e Chat AI) iniciam visíveis.
 * FALSE = Modo Produção (Oculto, ative com o código 'immortalis')
 * TRUE = Modo Desenvolvimento (Sempre visível)
 */
export const ENABLE_DEV_TOOLS = false;

/**
 * Helper to determine asset mode without circular dependency on GameState
 */
const getIsRepoPublic = (): boolean => {
    try {
        const STORAGE_KEY = 'IMMORTALIS_GAME_STATE_V8';
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.assetSourceMode !== 'LOCAL'; 
        }
    } catch (e) {
        // Fallback
    }
    return true; // DEFAULT: GitHub Public Mode
};

export const IS_REPO_PUBLIC = getIsRepoPublic();

/**
 * RESOLVE ASSET PATH
 * Centraliza a lógica de carregamento de imagens.
 * 
 * PADRÃO: As imagens devem estar fisicamente em "public/assets/..."
 * No código, referenciamos apenas como "assets/..."
 */
export const resolveAssetPath = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;

    // Normalização: Remove barra inicial
    let cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // Se o caminho começar com "public/", removemos para evitar duplicidade na lógica abaixo,
    // pois o Vite serve o conteudo de 'public' na raiz.
    if (cleanPath.startsWith('public/')) {
        cleanPath = cleanPath.replace(/^public\//, '');
    }

    const useGitHub = IS_REPO_PUBLIC;

    if (useGitHub) {
        // GITHUB MODE:
        // No GitHub, a estrutura de pastas é real. Precisamos apontar para /public/assets.
        // cleanPath agora é algo como "assets/sprites/..."
        return `https://raw.githubusercontent.com/${REPO_PATH}/${BRANCH}/public/${cleanPath}`;
    } else {
        // LOCAL MODE:
        // O servidor dev serve a pasta 'public' na raiz URL.
        // Logo, "public/assets/img.png" vira "/assets/img.png"
        return `/${cleanPath}`;
    }
};

// Wrapper simples
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
    baseHp: 500, // Updated: Boss level HP
    baseDamage: 15,
    maxPhases: 3,
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
