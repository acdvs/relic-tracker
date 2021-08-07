import { RelicCollection } from '../structures';

export const TIER_COUNTS = [14, 10, 8];
export const RELIC_NAMES = [
  [
    'Man',
    'Man with Club',
    'Man with Club and Shield',
    'Blowdart',
    'Pharaoh',
    'UFO',
    'Bowl',
    'Angry Demon',
    'Pyramid Head',
    'Sphere',
    'Snake',
    'Staring Man',
    'Skull',
    'Dragon Head',
  ],
  [
    'Scroll',
    'Snake',
    'King',
    'Crocodile',
    'Vase in Hands',
    'Coin',
    'Golden Skull',
    'Stuff in Bowl',
    'Golden Pharaoh',
    'Bonsai Tree',
  ],
  [
    'Fragile Box',
    'Dragon',
    'Shield',
    'Panda',
    'Hammer',
    'Sword',
    'Crystal Ball',
    'Egg',
  ],
];

export const allRelics = new RelicCollection(
  TIER_COUNTS.map((count) => Array(...Array(count)).map((v, i) => i + 1))
);
