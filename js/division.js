export class Division {
  constructor({ team, type, position, targetPosition, speed = 50 }) {
    this.team = team;
    this.type = type;
    this.position = { ...position };
    this.targetPosition = { ...targetPosition };
    this.speed = speed;
    this.size = { width: 48, height: 34 };
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
}
