import { Game } from './game.js';
import { createBasicScenario } from './scenario.js';
import { RENDER_SCALE, ZOOM_OUT_FACTOR } from './scale.js';

const GAME_VERSION = '1.0.11';

const canvas = document.getElementById('game-canvas');
const teamPanel = document.getElementById('team-panel');
const ctx = canvas.getContext('2d');

if (!ctx) {
  throw new Error('Could not get 2D context for game canvas.');
}

const initialWidth = canvas.clientWidth || window.innerWidth;
const initialHeight = canvas.clientHeight || window.innerHeight;

canvas.width = initialWidth;
canvas.height = initialHeight;

window.addEventListener('resize', () => {
  console.warn(
    'Window resize detected. Canvas size is intentionally locked to initial game size.'
  );
});

const worldWidth = initialWidth * ZOOM_OUT_FACTOR;
const worldHeight = initialHeight * ZOOM_OUT_FACTOR;

const { divisions, teams, citySeeds } = createBasicScenario(worldWidth, worldHeight);
const game = new Game({
  ctx,
  canvas,
  width: worldWidth,
  height: worldHeight,
  renderScale: RENDER_SCALE,
  divisions,
  teams,
  citySeeds,
  teamPanel,
  version: GAME_VERSION,
});

game.start();
