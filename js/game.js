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
      division.combatFlashAlpha = division.getCombatFlashAlpha(this.elapsedSeconds);
      drawDivision(this.ctx, division);
    }

    drawGameVersion(this.ctx, this.version);
  }

  update(deltaTimeSeconds) {
    for (const division of this.divisions) {
      division.inCombat = false;
      division.combatContacts = 0;
    }

    for (const division of this.divisions) {
      division.applyVelocity(deltaTimeSeconds);
      division.moveTowardsTarget(deltaTimeSeconds);
      division.dampVelocity();
    }

    this.resolveCollisions();
    this.updateCombatContacts();

    for (const division of this.divisions) {
      division.applyCombatEffects(deltaTimeSeconds);
    }
  }

  resolveCollisions() {
    for (let i = 0; i < this.divisions.length; i += 1) {
      const a = this.divisions[i];

      for (let j = i + 1; j < this.divisions.length; j += 1) {
        const b = this.divisions[j];
        const dx = b.position.x - a.position.x;
        const dy = b.position.y - a.position.y;
        const distance = Math.hypot(dx, dy) || 0.0001;
        const minDistance = a.getCollisionRadius() + b.getCollisionRadius();

        if (distance >= minDistance) {
          continue;
        }

        const overlap = minDistance - distance;
        const unitX = dx / distance;
        const unitY = dy / distance;
        const pushDistance = overlap / 2;
        const repelStrength = 120;

        a.position.x -= unitX * pushDistance;
        a.position.y -= unitY * pushDistance;
        b.position.x += unitX * pushDistance;
        b.position.y += unitY * pushDistance;

        a.xVelocity -= unitX * repelStrength;
        a.yVelocity -= unitY * repelStrength;
        b.xVelocity += unitX * repelStrength;
        b.yVelocity += unitY * repelStrength;
      }
    }
  }

  updateCombatContacts() {
    for (let i = 0; i < this.divisions.length; i += 1) {
      const a = this.divisions[i];

      for (let j = i + 1; j < this.divisions.length; j += 1) {
        const b = this.divisions[j];

        if (a.team === b.team) {
          continue;
        }

        const dx = b.position.x - a.position.x;
        const dy = b.position.y - a.position.y;
        const distance = Math.hypot(dx, dy);
        const contactDistance = a.combatRange + b.combatRange;

        if (distance <= contactDistance) {
          a.inCombat = true;
          b.inCombat = true;
          a.combatContacts += 1;
          b.combatContacts += 1;
        }
      }
    }
  }

  handleCanvasClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (event.ctrlKey && this.selectedDivision) {
      this.selectedDivision.targetPosition = { x: mouseX, y: mouseY };
      return;
    }

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
