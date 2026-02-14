// ==========================================
// CENTRAL DE REGISTRO DE ASSETS
// ==========================================
// 🛡️ PROTECTED FILE: DO NOT OVERWRITE PATHS WITH PLACEHOLDERS.
//
// INSTRUÇÕES DE UPLOAD:
// Salve suas imagens na pasta: public/assets/...
// Exemplo: public/assets/sprites/player/idle.png
//
// No código abaixo, use apenas: 'assets/sprites/player/idle.png'
// O sistema adicionará 'public/' automaticamente quando buscar do GitHub.
// ==========================================

export const ASSET_REGISTRY = {
    PLAYER: {
        IDLE: 'assets/sprites/player/idle.png', // Red Detective
    },
    WEAPONS: {
        REVOLVER: 'assets/sprites/weapons/revolver.png',
        WHIP: 'assets/sprites/weapons/whip.png',
    },
    CREATURES: {
        LOIRA_IDLE: 'assets/sprites/creatures/loira_idle.png',
        CORPO_SECO: 'assets/sprites/creatures/corpo_seco.png',
        WEREWOLF: 'assets/sprites/creatures/werewolf.png',
    },
    ILLUSTRATIONS: {
        // Bestiary Sketches
        LOIRA_SKETCH: 'assets/bestiary/loira_sketch.png',
        CORPO_SECO_SKETCH: 'assets/bestiary/corpo_seco_sketch.png',
        WEREWOLF_SKETCH: 'assets/bestiary/werewolf_sketch.png'
    }
};

// Helper para listar todos os assets para o Editor
export const getAllRegisteredAssets = () => {
    const list: string[] = [];
    const traverse = (obj: any) => {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                list.push(obj[key]);
            } else {
                traverse(obj[key]);
            }
        }
    };
    traverse(ASSET_REGISTRY);
    return list;
};