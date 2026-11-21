import { SAVE_KEY } from '../core/Constants.js';
export class SaveSystem {
  constructor() { this.timer = 0; }
  load() {
    try { const raw = localStorage.getItem(SAVE_KEY); return raw ? JSON.parse(raw) : null; }
    catch (error) { console.warn('Could not read Voxel Walk save:', error); return null; }
  }
  save(data) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); return true; }
    catch (error) { console.warn('Could not save Voxel Walk world:', error); return false; }
  }
  schedule(dataProvider, delay = 450) {
    clearTimeout(this.timer); this.timer = setTimeout(() => this.save(dataProvider()), delay);
  }
  dispose() { clearTimeout(this.timer); }
}
