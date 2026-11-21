import { BLOCK, CHUNK_AREA, CHUNK_SIZE, CHUNK_VOLUME, WORLD_HEIGHT } from '../core/Constants.js';

export class Chunk {
  constructor(cx, cz) {
    this.cx = cx; this.cz = cz;
    this.blocks = new Uint8Array(CHUNK_VOLUME);
    this.mesh = null;
    this.dirty = true;
    this.disposed = false;
  }
  index(x, y, z) { return x + CHUNK_SIZE * (z + CHUNK_SIZE * y); }
  get(x, y, z) {
    if (y < 0 || y >= WORLD_HEIGHT || x < 0 || x >= CHUNK_SIZE || z < 0 || z >= CHUNK_SIZE) return BLOCK.AIR;
    return this.blocks[x + CHUNK_SIZE * (z + CHUNK_SIZE * y)];
  }
  set(x, y, z, type) {
    if (y < 0 || y >= WORLD_HEIGHT || x < 0 || x >= CHUNK_SIZE || z < 0 || z >= CHUNK_SIZE) return false;
    const i = x + CHUNK_SIZE * (z + CHUNK_SIZE * y);
    if (this.blocks[i] === type) return false;
    this.blocks[i] = type; this.dirty = true; return true;
  }
  generate(generator) { generator.generateChunk(this); this.dirty = true; }
  dispose() {
    if (this.mesh) { this.mesh.geometry.dispose(); this.mesh.parent?.remove(this.mesh); this.mesh = null; }
    this.disposed = true;
  }
}
