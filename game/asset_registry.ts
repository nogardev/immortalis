// ==========================================
// CENTRAL DE REGISTRO DE ASSETS
// Edite este arquivo para registrar novas imagens.
// O jogo usará esses caminhos como referência.
// ==========================================

export const ASSET_REGISTRY = {
    PLAYER: {
        // O caminho deve ser relativo à pasta 'public'
        // Exemplo: se o arquivo está em 'public/assets/sprites/player/idle.png',
        // você pode colocar 'assets/sprites/player/idle.png' ou o caminho completo com 'public/'
        IDLE: 'assets/sprites/player/idle.png',
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