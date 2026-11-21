import { CHUNK_SIZE, LOAD_RADIUS, MAX_REMESHES_PER_FRAME, UNLOAD_RADIUS } from '../core/Constants.js';
import { Chunk } from './Chunk.js';
import { MeshBuilder } from '../rendering/MeshBuilder.js';

export class ChunkManager {
  constructor(scene, generator, materials) {
    this.scene = scene; this.generator = generator; this.materials = materials;
    this.chunks = new Map(); this.pending = []; this.pendingSet = new Set(); this.dirtyQueue = []; this.dirtySet = new Set();
    this.centerX = NaN; this.centerZ = NaN;
  }
  key(cx, cz) { return `${cx},${cz}`; }
  getChunk(cx, cz) { return this.chunks.get(this.key(cx, cz)); }
  getBlock(x, y, z) {
    if (y < 0 || y >= 256) return 0;
    const cx = Math.floor(x / CHUNK_SIZE), cz = Math.floor(z / CHUNK_SIZE);
    const chunk = this.getChunk(cx, cz);
    return chunk ? chunk.get(x - cx * CHUNK_SIZE, y, z - cz * CHUNK_SIZE) : 0;
  }
  setBlock(x, y, z, type) {
    if (y < 0 || y >= 256) return false;
    const cx = Math.floor(x / CHUNK_SIZE), cz = Math.floor(z / CHUNK_SIZE), chunk = this.getChunk(cx, cz);
    if (!chunk || !chunk.set(x - cx * CHUNK_SIZE, y, z - cz * CHUNK_SIZE, type)) return false;
    this.markDirty(chunk);
    const lx = x - cx * CHUNK_SIZE, lz = z - cz * CHUNK_SIZE;
    if (lx === 0) this.markDirty(this.getChunk(cx - 1, cz));
    if (lx === CHUNK_SIZE - 1) this.markDirty(this.getChunk(cx + 1, cz));
    if (lz === 0) this.markDirty(this.getChunk(cx, cz - 1));
    if (lz === CHUNK_SIZE - 1) this.markDirty(this.getChunk(cx, cz + 1));
    return true;
  }
  markDirty(chunk) { if (!chunk || this.dirtySet.has(chunk)) return; chunk.dirty = true; this.dirtySet.add(chunk); this.dirtyQueue.push(chunk); }
  update(playerX, playerZ) {
    const cx = Math.floor(playerX / CHUNK_SIZE), cz = Math.floor(playerZ / CHUNK_SIZE);
    if (cx !== this.centerX || cz !== this.centerZ) this.refreshLoadQueue(cx, cz);
    // Spread generation over frames, closest chunks first.
    for (let i = 0; i < 4 && this.pending.length; i++) {
      const item = this.pending.shift(); this.pendingSet.delete(this.key(item.x, item.z));
      if (Math.abs(item.x - cx) > LOAD_RADIUS || Math.abs(item.z - cz) > LOAD_RADIUS) continue;
      if (this.chunks.has(this.key(item.x, item.z))) continue;
      const chunk = new Chunk(item.x, item.z); chunk.generate(this.generator); this.chunks.set(this.key(item.x, item.z), chunk); this.scene.add(chunk.mesh = MeshBuilder.build(chunk, this));
      this.markDirty(chunk);
      for (const [dx, dz] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) this.markDirty(this.getChunk(item.x + dx, item.z + dz));
    }
    for (const [key, chunk] of this.chunks) {
      if (Math.abs(chunk.cx - cx) > UNLOAD_RADIUS || Math.abs(chunk.cz - cz) > UNLOAD_RADIUS) {
        chunk.dispose(); this.chunks.delete(key); this.dirtySet.delete(chunk);
      }
    }
    let rebuilt = 0;
    while (rebuilt < MAX_REMESHES_PER_FRAME && this.dirtyQueue.length) {
      const chunk = this.dirtyQueue.shift(); this.dirtySet.delete(chunk);
      if (!chunk.disposed && chunk.dirty) { MeshBuilder.rebuild(chunk, this); rebuilt++; }
    }
  }
  refreshLoadQueue(cx, cz) {
    this.centerX = cx; this.centerZ = cz;
    const next = [];
    for (let z = cz - LOAD_RADIUS; z <= cz + LOAD_RADIUS; z++) for (let x = cx - LOAD_RADIUS; x <= cx + LOAD_RADIUS; x++) {
      if (!this.chunks.has(this.key(x, z))) next.push({ x, z, distance: (x - cx) ** 2 + (z - cz) ** 2 });
    }
    next.sort((a, b) => a.distance - b.distance);
    this.pending = next; this.pendingSet = new Set(next.map((v) => this.key(v.x, v.z)));
  }
  dispose() { for (const chunk of this.chunks.values()) chunk.dispose(); this.chunks.clear(); this.pending.length = 0; this.dirtyQueue.length = 0; this.dirtySet.clear(); }
}
