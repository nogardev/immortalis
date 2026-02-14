
// ==========================================
// CENTRAL DE REGISTRO DE ASSETS
// ==========================================
// 🛡️ PROTECTED FILE: DO NOT OVERWRITE PATHS WITH PLACEHOLDERS.
//
// INSTRUÇÕES DE UPLOAD (ATUALIZADO):
// Salve suas imagens na NOVA PASTA SEGURA no GitHub:
// 📂 public/external_assets/...
//
// Exemplo: public/external_assets/sprites/player/idle.png
//
// Motivo: A pasta antiga 'assets' causava conflitos.
// A pasta 'external_assets' é ignorada localmente, protegendo seus arquivos no GitHub.
// ==========================================

export const ASSET_REGISTRY = {
    PLAYER: {
        IDLE: 'external_assets/sprites/player/idle.png', 
    },
    WEAPONS: {
        REVOLVER: 'external_assets/sprites/weapons/revolver.png',
        WHIP: 'external_assets/sprites/weapons/whip.png',
    },
    CREATURES: {
        LOIRA_IDLE: 'external_assets/sprites/creatures/loira_idle.png',
        CORPO_SECO: 'external_assets/sprites/creatures/corpo_seco.png',
        WEREWOLF: 'external_assets/sprites/creatures/werewolf.png',
    },
    ILLUSTRATIONS: {
        // Bestiary Sketches
        LOIRA_SKETCH: 'external_assets/bestiary/loira_sketch.png',
        CORPO_SECO_SKETCH: 'external_assets/bestiary/corpo_seco_sketch.png',
        WEREWOLF_SKETCH: 'external_assets/bestiary/werewolf_sketch.png'
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
