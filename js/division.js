export class Division {
  constructor({
    team,
    type,
    position,
    targetPosition,
    speed = 50,
    strength = 100,
    morale = 100,
    combatRange = 85,
  }) {
    this.team = team;
    this.type = type;
    this.position = { ...position };
    this.targetPosition = { ...targetPosition };
    this.speed = speed;
    this.xVelocity = 0;
    this.yVelocity = 0;
    this.size = { width: 48, height: 34 };
    this.strength = strength;
    this.morale = morale;
    this.combatRange = combatRange;
    this.isSelected = false;
    this.inCombat = false;
    this.combatContacts = 0;
  }

  moveTowardsTarget(deltaTimeSeconds) {
    const dx = this.targetPosition.x - this.position.x;
    const dy = this.targetPosition.y - this.position.y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) {
      return;
    }

    const maxDistance = this.speed * deltaTimeSeconds;

    if (distance <= maxDistance) {
      this.position.x = this.targetPosition.x;
      this.position.y = this.targetPosition.y;
      return;
    }

    const unitX = dx / distance;
    const unitY = dy / distance;

    this.position.x += unitX * maxDistance;
    this.position.y += unitY * maxDistance;
  }

  applyVelocity(deltaTimeSeconds) {
    this.position.x += this.xVelocity * deltaTimeSeconds;
    this.position.y += this.yVelocity * deltaTimeSeconds;
  }

  dampVelocity() {
    this.xVelocity *= 0.84;
    this.yVelocity *= 0.84;

    if (Math.abs(this.xVelocity) < 0.5) {
      this.xVelocity = 0;
    }

    if (Math.abs(this.yVelocity) < 0.5) {
      this.yVelocity = 0;
    }
  }

  getCollisionRadius() {
    return Math.hypot(this.size.width / 2, this.size.height / 2);
  }

  applyCombatEffects(deltaTimeSeconds) {
    if (!this.inCombat || this.combatContacts === 0) {
      return;
    }

    const strengthLossPerSecond = 1.4;
    const moraleLossPerSecond = 2.2;
    const multiplier = this.combatContacts;

    this.strength = Math.max(0, this.strength - strengthLossPerSecond * multiplier * deltaTimeSeconds);
    this.morale = Math.max(0, this.morale - moraleLossPerSecond * multiplier * deltaTimeSeconds);
  }

  containsPoint(x, y) {
    const left = this.position.x - this.size.width / 2;
    const top = this.position.y - this.size.height / 2;
    const right = left + this.size.width;
    const bottom = top + this.size.height;

    return x >= left && x <= right && y >= top && y <= bottom;
  }

  getAlpha(elapsedSeconds) {
    if (!this.isSelected) {
      return 1;
    }

    const cycleDuration = 1;
    const normalizedTime = (elapsedSeconds % cycleDuration) / cycleDuration;
    const pulse = 1 - Math.abs(normalizedTime * 2 - 1);

    return 1 - pulse * 0.6;
  }

  getCombatFlashAlpha(elapsedSeconds) {
    if (!this.inCombat) {
      return 0;
    }

    const pulse = (Math.sin(elapsedSeconds * 10) + 1) / 2;
    return 0.2 + pulse * 0.45;
  }
}
