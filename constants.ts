import { Creature, DamageType, Mission, PlayerStats, Weapon } from './types';

export const INITIAL_PLAYER_STATS: PlayerStats = {
  level: 1,
  xp: 0,
  nextLevelXp: 100,
  pointsAvailable: 0,
  attributes: {
    hp: 100,
    stamina: 50,
    baseDamage: 5,
    speed: 160 // Phaser velocity
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
    spritePath: 'assets/sprites/weapons/revolver.png'
  },
  {
    id: 'silver_whip',
    name: 'Silver Whip',
    description: 'Blessed silver woven into leather.',
    damage: 8,
    type: DamageType.HOLY,
    cooldown: 400,
    spritePath: 'assets/sprites/weapons/whip.png'
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
    spritePath: 'assets/sprites/creatures/loira_idle.png',
    illustrationPath: 'https://picsum.photos/256/256?grayscale', // Placeholder
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
    spritePath: 'assets/sprites/creatures/corpo_seco.png',
    illustrationPath: 'https://picsum.photos/256/256?sepia', // Placeholder
    unlocked: false
  },
  {
    id: 'lobisomem',
    name: 'Lobisomem (Werewolf)',
    threatLevel: 12,
    description: 'A cursed human forced to transform under the full moon.',
    behavior: 'Extremely fast, aggressive melee attacks. Regenerates health.',
    weaknesses: [DamageType.BALLISTIC, DamageType.HOLY], // Traditionally silver, mapped to holy/ballistic combo in logic
    drops: ['Wolf Pelt', 'Cursed Blood'],
    spritePath: 'assets/sprites/creatures/werewolf.png',
    illustrationPath: 'https://picsum.photos/256/256', // Placeholder
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