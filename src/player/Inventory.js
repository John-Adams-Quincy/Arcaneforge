import { BLOCK } from '../core/Constants.js';
export class Inventory {
  constructor(data = null) {
    this.hotbar = data?.hotbar?.slice(0, 9) ?? [BLOCK.GRASS, BLOCK.DIRT, BLOCK.STONE, BLOCK.LOG, BLOCK.LEAVES, BLOCK.GRASS, BLOCK.DIRT, BLOCK.STONE, BLOCK.LOG];
    this.slots = data?.slots?.slice(0, 27) ?? Array(27).fill(0);
    while (this.hotbar.length < 9) this.hotbar.push(BLOCK.GRASS);
    while (this.slots.length < 27) this.slots.push(0);
    this.selected = Math.max(0, Math.min(8, data?.selected ?? 0));
  }
  select(index) { this.selected = (index + 9) % 9; }
  selectedBlock() { return this.hotbar[this.selected] || BLOCK.GRASS; }
  pick(type) { if (type > BLOCK.AIR && type <= BLOCK.LEAVES) this.hotbar[this.selected] = type; }
  toJSON() { return { hotbar: this.hotbar, slots: this.slots, selected: this.selected }; }
}
