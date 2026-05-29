const MAX_PERCENT = 100;
const BROKEN_MORALE_THRESHOLD = 20;

const DIVISION_TYPE_CONFIG = {
  infantry: {
    label: 'Infantry',
    speed: 40,
    size: { width: 48, height: 34 },
    combatRange: 85,
  },
  cavalry: {
    label: 'cavalry',
    speed: 65,
    size: { width: 48, height: 34 },
    combatRange: 85,
  },
  tank: {
    label: 'tank',
    speed: 45,
    size: { width: 58, height: 38 },
    combatRange: 105,
  },
};

export const DIVISION_TYPES = Object.freeze(
  Object.entries(DIVISION_TYPE_CONFIG).map(([id, config]) => ({
    id,
    label: config.label,
  }))
);

export function getDivisionTypeConfig(type) {
  return DIVISION_TYPE_CONFIG[type] ?? DIVISION_TYPE_CONFIG.infantry;
}

export function isDivisionType(type) {
  return Object.prototype.hasOwnProperty.call(DIVISION_TYPE_CONFIG, type);
}

function clampPercent(value) {
  return Math.max(0, Math.min(MAX_PERCENT, value));
}

export class Division {
  constructor({
    team,
    type = 'infantry',
    position,
    targetPosition,
    speed,
    strength = 100,
    morale = 100,
    combatRange,
  }) {
    const typeConfig = getDivisionTypeConfig(type);

    this.team = team;
    this.type = type;
    this.position = { ...position };
    this.targetPosition = { ...targetPosition };
    this.speed = speed ?? typeConfig.speed;
    this.xVelocity = 0;
    this.yVelocity = 0;
    this.size = { ...typeConfig.size };
    this.strength = clampPercent(strength);
    this.morale = clampPercent(morale);
    this.combatRange = combatRange ?? typeConfig.combatRange;
    this.isSelected = false;
    this.inCombat = false;
    this.combatContacts = 0;
    this.isBroken = this.morale < BROKEN_MORALE_THRESHOLD;
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

    this.strength = clampPercent(
      this.strength - strengthLossPerSecond * multiplier * deltaTimeSeconds
    );
    this.morale = clampPercent(
      this.morale - moraleLossPerSecond * multiplier * deltaTimeSeconds
    );

    if (this.morale < BROKEN_MORALE_THRESHOLD) {
      this.isBroken = true;
    }
  }

  recoverMorale(deltaTimeSeconds) {
    if (this.inCombat || !this.isStationary()) {
      return;
    }

    const moraleRecoveryPerSecond = 5;
    this.morale = clampPercent(
      this.morale + moraleRecoveryPerSecond * deltaTimeSeconds
    );

    if (this.morale === MAX_PERCENT) {
      this.isBroken = false;
    }
  }

  isStationary() {
    const targetDx = this.targetPosition.x - this.position.x;
    const targetDy = this.targetPosition.y - this.position.y;
    const distanceToTarget = Math.hypot(targetDx, targetDy);
    const velocity = Math.hypot(this.xVelocity, this.yVelocity);

    return distanceToTarget < 1 && velocity < 1;
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

  getBrokenFlashAlpha(elapsedSeconds) {
    if (!this.isBroken) {
      return 0;
    }

    const pulse = (Math.sin(elapsedSeconds * 18) + 1) / 2;
    return 0.25 + pulse * 0.65;
  }
}
