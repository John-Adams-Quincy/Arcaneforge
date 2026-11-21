import { CHUNK_SIZE } from '../core/Constants.js';
import { Generator } from './Generator.js';
import { ChunkManager } from './ChunkManager.js';
export class World {
  constructor(scene, seed, materials) { this.seed = seed >>> 0; this.generator = new Generator(this.seed); this.chunks = new ChunkManager(scene, this.generator, materials); }
  update(x, z) { this.chunks.update(x, z); }
  getBlock(x, y, z) { return this.chunks.getBlock(x, y, z); }
  setBlock(x, y, z, type) { return this.chunks.setBlock(x, y, z, type); }
  dispose() { this.chunks.dispose(); }
  static chunkCoordinate(value) { return Math.floor(value / CHUNK_SIZE); }
}
