import { BLOCK_NAMES } from '../core/Constants.js';
import { BlockRegistry } from '../world/BlockRegistry.js';
export class HUD {
  constructor() { this.chunkCount = document.querySelector('#chunk-count'); this.fps = document.querySelector('#fps'); this.frames = 0; this.elapsed = 0; }
  update(dt, count) {
    this.chunkCount.textContent = `Chunks: ${count}`;
    this.frames++; this.elapsed += dt;
    if (this.elapsed >= 0.5) { this.fps.textContent = `FPS: ${Math.round(this.frames / this.elapsed)}`; this.frames = 0; this.elapsed = 0; }
  }
  static blockName(type) { return BLOCK_NAMES[type] ?? 'Block'; }
  static blockColor(type) { return `#${(BlockRegistry[type]?.color ?? 0xffffff).toString(16).padStart(6, '0')}`; }
}
