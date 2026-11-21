import { BLOCK, CHUNK_SIZE } from '../core/Constants.js';

function hash2(x, z, seed) {
  let h = (Math.imul(x, 374761393) + Math.imul(z, 668265263) + Math.imul(seed, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function smooth(t) { return t * t * (3 - 2 * t); }
function lerp(a, b, t) { return a + (b - a) * t; }

export class Generator {
  constructor(seed = 20251121) { this.seed = seed >>> 0; }
  valueNoise(x, z, scale, salt = 0) {
    const fx = x / scale, fz = z / scale;
    const ix = Math.floor(fx), iz = Math.floor(fz);
    const tx = smooth(fx - ix), tz = smooth(fz - iz);
    const a = hash2(ix, iz, this.seed + salt), b = hash2(ix + 1, iz, this.seed + salt);
    const c = hash2(ix, iz + 1, this.seed + salt), d = hash2(ix + 1, iz + 1, this.seed + salt);
    return lerp(lerp(a, b, tx), lerp(c, d, tx), tz) * 2 - 1;
  }
  fbm(x, z, baseScale, octaves = 4) {
    let total = 0, amplitude = 0.5, norm = 0, scale = baseScale;
    for (let i = 0; i < octaves; i++, scale *= 0.5, amplitude *= 0.5) {
      total += this.valueNoise(x, z, scale, i * 1013) * amplitude; norm += amplitude;
    }
    return total / norm;
  }
  biomeWeights(x, z) {
    const field = this.valueNoise(x, z, 180, 8101);
    const mountain = smooth(Math.max(0, Math.min(1, (field + 0.05) * 2.1));
    const forestField = this.valueNoise(x, z, 110, 3299);
    const forest = Math.max(0, Math.min(1, (1 - mountain) * smooth((forestField + 0.2) * 1.8)));
    return { plains: Math.max(0, 1 - mountain - forest), forest, mountain };
  }
  heightAt(x, z) {
    const w = this.biomeWeights(x, z);
    const broad = this.fbm(x, z, 95, 4);
    const detail = this.fbm(x, z, 27, 3);
    const mountainShape = Math.max(0, this.fbm(x, z, 115, 4) + 0.12);
    const plains = 42 + broad * 7 + detail * 2.5;
    const forest = 44 + broad * 8 + detail * 3;
    const mountains = 58 + mountainShape * 82 + detail * 5;
    return Math.max(4, Math.min(220, Math.round(plains * w.plains + forest * w.forest + mountains * w.mountain)));
  }
  terrainType(x, y, z, height) {
    if (y > height) return BLOCK.AIR;
    if (y === height) return BLOCK.GRASS;
    if (y > height - 4) return BLOCK.DIRT;
    return BLOCK.STONE;
  }
  generateChunk(chunk) {
    const ox = chunk.cx * CHUNK_SIZE, oz = chunk.cz * CHUNK_SIZE;
    for (let z = 0; z < CHUNK_SIZE; z++) for (let x = 0; x < CHUNK_SIZE; x++) {
      const wx = ox + x, wz = oz + z, h = this.heightAt(wx, wz);
      for (let y = 0; y <= h; y++) chunk.blocks[chunk.index(x, y, z)] = this.terrainType(wx, y, wz, h);
    }
    // Evaluate a one-tree-radius halo so trees match exactly across chunk borders.
    for (let tz = oz - 2; tz < oz + CHUNK_SIZE + 2; tz++) for (let tx = ox - 2; tx < ox + CHUNK_SIZE + 2; tx++) {
      const biome = this.biomeWeights(tx, tz);
      if (biome.forest < 0.26 || hash2(tx, tz, this.seed + 197) > 0.035 * biome.forest) continue;
      const ground = this.heightAt(tx, tz);
      if (ground < 35 || ground > 150) continue;
      const trunkHeight = 4 + Math.floor(hash2(tx, tz, this.seed + 211) * 3);
      for (let dy = 1; dy <= trunkHeight; dy++) this.writeIfInside(chunk, tx, ground + dy, tz, BLOCK.LOG, ox, oz);
      const crownY = ground + trunkHeight;
      for (let dy = -2; dy <= 1; dy++) {
        const radius = dy === 1 ? 1 : 2;
        for (let dz = -radius; dz <= radius; dz++) for (let dx = -radius; dx <= radius; dx++) {
          if (Math.abs(dx) === radius && Math.abs(dz) === radius && (hash2(tx + dx, tz + dz, this.seed + dy + 17) > 0.36)) continue;
          const wx = tx + dx, wz = tz + dz;
          this.writeIfInside(chunk, wx, crownY + dy, wz, BLOCK.LEAVES, ox, oz, true);
        }
      }
    }
  }
  writeIfInside(chunk, wx, y, wz, type, ox, oz, preserveLog = false) {
    const x = wx - ox, z = wz - oz;
    if (x < 0 || x >= CHUNK_SIZE || z < 0 || z >= CHUNK_SIZE || y < 0 || y >= 256) return;
    const i = chunk.index(x, y, z);
    if (preserveLog && chunk.blocks[i] === BLOCK.LOG) return;
    chunk.blocks[i] = type;
  }
}
