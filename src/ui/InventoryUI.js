import { HUD } from './HUD.js';
export class InventoryUI {
  constructor(inventory, onChange) {
    this.inventory = inventory; this.onChange = onChange; this.hotbar = document.querySelector('#hotbar'); this.panel = document.querySelector('#inventory-panel'); this.open = false;
    this.render();
  }
  makeSlot(type, index, selected, onClick) {
    const slot = document.createElement('button'); slot.className = `slot${selected ? ' selected' : ''}`; slot.type = 'button'; slot.title = HUD.blockName(type); slot.setAttribute('aria-label', `${HUD.blockName(type)}${selected ? ', selected' : ''}`);
    const label = document.createElement('span'); label.className = 'slot-label'; label.textContent = String(index + 1); slot.append(label);
    if (type) { const swatch = document.createElement('span'); swatch.className = 'swatch'; swatch.style.backgroundColor = HUD.blockColor(type); slot.append(swatch); const name = document.createElement('span'); name.className = 'block-name'; name.textContent = HUD.blockName(type); slot.append(name); }
    slot.addEventListener('click', onClick); return slot;
  }
  render() {
    this.hotbar.replaceChildren();
    this.inventory.hotbar.forEach((type, i) => this.hotbar.append(this.makeSlot(type, i, i === this.inventory.selected, () => { this.inventory.select(i); this.render(); this.onChange?.(); })));
    if (!this.open) return;
    this.panel.replaceChildren(); const title = document.createElement('h2'); title.textContent = 'Inventory'; this.panel.append(title);
    const grid = document.createElement('div'); grid.className = 'grid';
    this.inventory.slots.forEach((type, i) => grid.append(this.makeSlot(type, i, false, () => { if (!type) this.inventory.slots[i] = this.inventory.selectedBlock(); this.render(); this.onChange?.(); })));
    this.panel.append(grid); const hint = document.createElement('p'); hint.className = 'hint'; hint.textContent = 'Creative mode · Unlimited blocks · Press E or Esc to close'; this.panel.append(hint);
  }
  toggle(force = !this.open) { this.open = force; this.panel.hidden = !this.open; this.render(); }
}
