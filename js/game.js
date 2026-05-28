import { clearCanvas, drawDivision, drawGameVersion } from './rendering.js';

const FLEE_DISTANCE = 220;
const FLEE_PADDING = 32;

function getDivisionBounds(division, canvasWidth, canvasHeight, padding = 0) {
  const halfWidth = division.size.width / 2;
  const halfHeight = division.size.height / 2;

  return {
    minX: halfWidth + padding,
    maxX: canvasWidth - halfWidth - padding,
    minY: halfHeight + padding,
    maxY: canvasHeight - halfHeight - padding,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

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
      division.brokenFlashAlpha = division.getBrokenFlashAlpha(this.elapsedSeconds);
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
      this.keepDivisionOnMap(division);
      division.dampVelocity();
    }

    this.resolveCollisions();

    for (const division of this.divisions) {
      this.keepDivisionOnMap(division);
    }

    this.updateCombatContacts();

    for (const division of this.divisions) {
      const wasBroken = division.isBroken;
      division.applyCombatEffects(deltaTimeSeconds);

      if (!wasBroken && division.isBroken) {
        this.setFleeTarget(division);
      }
    }

    for (const division of this.divisions) {
      if (division.isBroken && division.inCombat) {
        this.setFleeTarget(division);
      }

      division.recoverMorale(deltaTimeSeconds);
    }

    this.removeDestroyedDivisions();
  }

  setFleeTarget(division) {
    let awayX = 0;
    let awayY = 0;

    for (const other of this.divisions) {
      if (other === division || other.team === division.team) {
        continue;
      }

      const dx = division.position.x - other.position.x;
      const dy = division.position.y - other.position.y;
      const distance = Math.hypot(dx, dy);
      const influenceDistance = division.combatRange + other.combatRange;

      if (distance > influenceDistance) {
        continue;
      }

      const safeDistance = distance || 0.0001;
      const weight = 1 + (influenceDistance - distance) / influenceDistance;
      awayX += (dx / safeDistance) * weight;
      awayY += (dy / safeDistance) * weight;
    }

    if (awayX === 0 && awayY === 0) {
      awayX = division.position.x - this.width / 2;
      awayY = division.position.y - this.height / 2;
    }

    const magnitude = Math.hypot(awayX, awayY) || 1;
    const unitX = awayX / magnitude;
    const unitY = awayY / magnitude;

    division.targetPosition = this.clampPointToMap(
      division,
      division.position.x + unitX * FLEE_DISTANCE,
      division.position.y + unitY * FLEE_DISTANCE,
      FLEE_PADDING
    );
  }

  clampPointToMap(division, x, y, padding = 0) {
    const bounds = getDivisionBounds(division, this.width, this.height, padding);

    return {
      x: clamp(x, bounds.minX, bounds.maxX),
      y: clamp(y, bounds.minY, bounds.maxY),
    };
  }

  keepDivisionOnMap(division) {
    const clampedPosition = this.clampPointToMap(
      division,
      division.position.x,
      division.position.y
    );

    if (clampedPosition.x !== division.position.x) {
      division.position.x = clampedPosition.x;
      division.xVelocity = 0;
    }

    if (clampedPosition.y !== division.position.y) {
      division.position.y = clampedPosition.y;
      division.yVelocity = 0;
    }

    division.targetPosition = this.clampPointToMap(
      division,
      division.targetPosition.x,
      division.targetPosition.y
    );
  }

  removeDestroyedDivisions() {
    const survivors = this.divisions.filter((division) => division.strength > 0);

    if (survivors.length === this.divisions.length) {
      return;
    }

    if (this.selectedDivision && !survivors.includes(this.selectedDivision)) {
      this.selectedDivision.isSelected = false;
      this.selectedDivision = null;
    }

    this.divisions = survivors;
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
      this.selectedDivision.targetPosition = this.clampPointToMap(
        this.selectedDivision,
        mouseX,
        mouseY
      );
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
