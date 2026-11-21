import { BLOCK } from '../core/Constants.js';
export const BlockRegistry = Object.freeze({
  [BLOCK.AIR]: { id: BLOCK.AIR, name: 'Air', color: 0x000000, solid: false },
  [BLOCK.GRASS]: { id: BLOCK.GRASS, name: 'Grass', color: 0x68a84b, solid: true },
  [BLOCK.DIRT]: { id: BLOCK.DIRT, name: 'Dirt', color: 0x8b6040, solid: true },
  [BLOCK.STONE]: { id: BLOCK.STONE, name: 'Stone', color: 0x888d91, solid: true },
  [BLOCK.LOG]: { id: BLOCK.LOG, name: 'Log', color: 0x765034, solid: true },
  [BLOCK.LEAVES]: { id: BLOCK.LEAVES, name: 'Leaves', color: 0x4d8c45, solid: true }
});
export function isSolid(type) { return !!BlockRegistry[type]?.solid; }
