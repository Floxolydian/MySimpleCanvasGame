import { clearCanvas, drawDivision } from './rendering.js';

export class Game {
  constructor({ ctx, width, height, divisions }) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.divisions = divisions;
    this.lastTimestamp = 0;
  }

  start() {
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  loop(timestamp) {
    const deltaTimeSeconds = this.lastTimestamp
      ? (timestamp - this.lastTimestamp) / 1000
      : 0;
    this.lastTimestamp = timestamp;

    this.draw();
    this.update(deltaTimeSeconds);

    requestAnimationFrame((nextTimestamp) => this.loop(nextTimestamp));
  }

  draw() {
    clearCanvas(this.ctx, this.width, this.height);

    for (const division of this.divisions) {
      drawDivision(this.ctx, division);
    }
  }

  update(deltaTimeSeconds) {
    for (const division of this.divisions) {
      division.moveTowardsTarget(deltaTimeSeconds);
    }
  }
}
