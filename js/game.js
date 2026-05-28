import { clearCanvas, drawDivision, drawGameVersion } from './rendering.js';

export class Game {
  constructor({ ctx, canvas, width, height, divisions, version }) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.divisions = divisions;
    this.version = version;
    this.lastTimestamp = 0;
    this.elapsedSeconds = 0;
    this.selectedDivision = null;
  }

  start() {
    this.canvas.addEventListener('click', (event) => this.handleCanvasClick(event));
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  loop(timestamp) {
    const deltaTimeSeconds = this.lastTimestamp
      ? (timestamp - this.lastTimestamp) / 1000
      : 0;
    this.lastTimestamp = timestamp;
    this.elapsedSeconds += deltaTimeSeconds;

    this.draw();
    this.update(deltaTimeSeconds);

    requestAnimationFrame((nextTimestamp) => this.loop(nextTimestamp));
  }

  draw() {
    clearCanvas(this.ctx, this.width, this.height);

    for (const division of this.divisions) {
      division.alpha = division.getAlpha(this.elapsedSeconds);
      drawDivision(this.ctx, division);
    }

    drawGameVersion(this.ctx, this.version);
  }

  update(deltaTimeSeconds) {
    for (const division of this.divisions) {
      division.moveTowardsTarget(deltaTimeSeconds);
    }
  }

  handleCanvasClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    let clickedDivision = null;

    for (let index = this.divisions.length - 1; index >= 0; index -= 1) {
      const division = this.divisions[index];
      if (division.containsPoint(mouseX, mouseY)) {
        clickedDivision = division;
        break;
      }
    }

    if (this.selectedDivision) {
      this.selectedDivision.isSelected = false;
    }

    this.selectedDivision = clickedDivision;

    if (this.selectedDivision) {
      this.selectedDivision.isSelected = true;
    }
  }
}
