export class Division {
  constructor({ team, type, position, targetPosition, speed = 50 }) {
    this.team = team;
    this.type = type;
    this.position = { ...position };
    this.targetPosition = { ...targetPosition };
    this.speed = speed;
    this.size = { width: 48, height: 34 };
    this.isSelected = false;
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

    return 1 - pulse * 0.4;
  }
}
