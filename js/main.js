import { Game } from './game.js';
import { createBasicScenario } from './scenario.js';

const GAME_VERSION = '1.0.0';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

if (!ctx) {
  throw new Error('Could not get 2D context for game canvas.');
}

const initialWidth = window.innerWidth;
const initialHeight = window.innerHeight;

canvas.width = initialWidth;
canvas.height = initialHeight;

window.addEventListener('resize', () => {
  console.warn(
    'Window resize detected. Canvas size is intentionally locked to initial game size.'
  );
});

const divisions = createBasicScenario(initialWidth, initialHeight);
const game = new Game({
  ctx,
  canvas,
  width: initialWidth,
  height: initialHeight,
  divisions,
  version: GAME_VERSION,
});

game.start();
