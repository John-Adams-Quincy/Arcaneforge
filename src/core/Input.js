export class Input {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.keys = new Set();
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.pointerLocked = false;
    this.onKeyDown = (event) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault();
      if (!event.repeat) this.callbacks.keydown?.(event);
      this.keys.add(event.code);
    };
    this.onKeyUp = (event) => { this.keys.delete(event.code); };
    this.onMouseMove = (event) => {
      if (this.pointerLocked) { this.mouseDX += event.movementX; this.mouseDY += event.movementY; }
    };
    this.onPointerChange = () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
      this.callbacks.pointerlock?.(this.pointerLocked);
    };
    this.onMouseDown = (event) => {
      event.preventDefault();
      if (!this.pointerLocked) { this.canvas.requestPointerLock?.(); return; }
      this.callbacks.mousedown?.(event.button);
    };
    this.onContext = (event) => event.preventDefault();
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('pointerlockchange', this.onPointerChange);
    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('contextmenu', this.onContext);
    window.addEventListener('blur', () => this.keys.clear());
  }
  isDown(code) { return this.keys.has(code); }
  consumeMouseDelta() { const dx = this.mouseDX; const dy = this.mouseDY; this.mouseDX = 0; this.mouseDY = 0; return { dx, dy }; }
  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerlockchange', this.onPointerChange);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('contextmenu', this.onContext);
  }
}
