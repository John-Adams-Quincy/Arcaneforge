import { Game } from './core/Game.js';

const canvas = document.querySelector('#game-canvas');
const game = new Game(canvas);
game.start();
window.addEventListener('pagehide', () => game.save(), { once: true });
