import * * as THREE from 'three';
import { Input } from './Input.js';
import { BLOCK, REACH } from './Constants.js';
import { World } from '../world/World.js';
import { Player } from '../player/Player.js';
import { Collision } from '../player/Collision.js';
import { Inventory } from '../player/Inventory.js';
import { Renderer } from '../rendering/Renderer.js';
import { OutlineRenderer } from '../rendering/OutlineRenderer.js';
import { castFromCamera } from '../raycast/DDA.js';
import { SaveSystem } from '../save/SaveSystem.js';
import { HUD } from '../ui/HUD.js';
import { InventoryUI } from '../ui/InventoryUI.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas; this.renderer = new Renderer(canvas); this.saveSystem = new SaveSystem();
    const saved = this.saveSystem.load(); this.seed = saved?.seed ?? (Math.floor(Math.random() * 0xffffffff) >>> 0);
    this.world = new World(this.renderer.scene, this.seed, this.renderer.materials);
    this.player = new Player(this.world, this.renderer.camera, saved?.player);
    this.inventory = new Inventory(saved?.inventory); this.hud = new HUD(); this.inventoryUI = new InventoryUI(this.inventory, () => this.scheduleSave());
    this.outline = new OutlineRenderer(this.renderer.scene); this.hit = null; this.rayDirection = new THREE.Vector3();
    this.modified = new Map(saved?.modified ?? []); this.applyDeltas();
    this.input = new Input(canvas, { keydown: (event) => this.onKey(event), mousedown: (button) => this.onMouse(button), pointerlock: (locked) => this.onPointerLock(locked) });
    this.startPrompt = document.querySelector('#start-prompt');
    document.querySelector('#play-button').addEventListener('click', () => this.play());
    this.lastTime = 0; this.running = false; this.boundFrame = (time) => this.frame(time);
  }
  play() {
    const enableFallback = () => {
      if (document.pointerLockElement === this.canvas) return;
      this.input.setFallbackMouse(true);
      this.startPrompt.hidden = true;
    };

    if (typeof this.canvas.requestPointerLock !== 'function') {
      enableFallback();
      return;
    }

    try {
      const request = this.canvas.requestPointerLock();
      if (request && typeof request.catch === 'function') request.catch(enableFallback);
      window.setTimeout(enableFallback, 500);
    } catch {
      enableFallback();
    }
  }
  applyDeltas() {
    for (const [key, type] of this.modified) {
      const [x, y, z] = key.split(',').map(Number);
      // Deltas are applied when their chunk becomes available; keep them queued until then.
      this.pendingDeltas ??= [];
      this.pendingDeltas.push([x, y, z, type]);
    }
  }
  applyLoadedDeltas() {
    if (!this.pendingDeltas?.length) return;
    let write = 0;
    for (let i = 0; i < this.pendingDeltas.length; i++) {
      const [x, y, z, type] = this.pendingDeltas[i];
      if (this.world.setBlock(x, y, z, type)) continue;
      if (this.world.chunks.getChunk(Math.floor(x / 16), Math.floor(z / 16))) continue;
      this.pendingDeltas[write++] = this.pendingDeltas[i];
    }
    this.pendingDeltas.length = write;
  }
  start() { if (this.running) return; this.running = true; requestAnimationFrame(this.boundFrame); }
  frame(time) {
    if (!this.running) return;
    const dt = Math.min(0.05, this.lastTime ? (time - this.lastTime) / 1000 : 0); this.lastTime = time;
    if (!this.inventoryUI.open) this.player.update(dt, this.input);
    this.world.update(this.player.x, this.player.z); this.applyLoadedDeltas();
    this.hit = castFromCamera(this.world, this.renderer.camera, REACH);
    if (this.hit) this.outline.show(this.hit); else this.outline.hide();
    this.hud.update(Math.max(dt, 0.001), this.world.chunks.chunks.size); this.renderer.render();
    requestAnimationFrame(this.boundFrame);
  }
  onKey(event) {
    if (event.code === 'KeyE' && !event.repeat) { this.inventoryUI.toggle(); if (this.inventoryUI.open && document.pointerLockElement) document.exitPointerLock(); }
    if (event.code === 'Escape' && this.inventoryUI.open) this.inventoryUI.toggle(false);
    if (/^Digit[1-9]$/.test(event.code)) { this.inventory.select(Number(event.code.slice(5)) - 1); this.inventoryUI.render(); this.scheduleSave(); }
  }
  onPointerLock(locked) {
    if (locked) this.input.setFallbackMouse(false);
    this.startPrompt.hidden = locked || this.inventoryUI.open || (!locked && this.input.fallbackMouse);
  }
  onMouse(button) {
    if (!this.hit) return;
    if (button === 0) { this.world.setBlock(this.hit.x, this.hit.y, this.hit.z, BLOCK.AIR); this.modified.set(`${this.hit.x},${this.hit.y},${this.hit.z}`, BLOCK.AIR); this.scheduleSave(); }
    if (button === 1) { this.inventory.pick(this.hit.type); this.inventoryUI.render(); this.scheduleSave(); }
    if (button === 2) {
      const x = this.hit.x + this.hit.normal.x, y = this.hit.y + this.hit.normal.y, z = this.hit.z + this.hit.normal.z;
      const collision = new Collision(this.world);
      if (this.world.getBlock(x, y, z) === BLOCK.AIR && collision.canOccupyBlock(x, y, z, this.player)) {
        const type = this.inventory.selectedBlock(); this.world.setBlock(x, y, z, type); this.modified.set(`${x},${y},${z}`, type); this.scheduleSave();
      }
    }
  }
  scheduleSave() { this.saveSystem.schedule(() => this.saveData()); }
  saveData() { return { seed: this.seed, player: this.player.saveData(), modified: [...this.modified], inventory: this.inventory.toJSON() }; }
  save() { this.saveSystem.save(this.saveData()); }
  dispose() { this.running = false; this.save(); this.saveSystem.dispose(); this.input.dispose(); this.outline.dispose(); this.world.dispose(); this.renderer.dispose(); }
}
