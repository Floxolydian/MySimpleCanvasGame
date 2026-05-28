import { Division } from './division.js';

export function createBasicScenario(canvasWidth, canvasHeight) {
  const midX = canvasWidth / 2;
  const midY = canvasHeight / 2;
  const horizontalOffset = 260;
  const verticalOffset = 120;

  return [
    new Division({
      team: 1,
      type: 'infantry',
      position: { x: midX - horizontalOffset, y: midY - verticalOffset },
      targetPosition: { x: midX - horizontalOffset, y: midY - verticalOffset },
      speed: 40,
    }),
    new Division({
      team: 1,
      type: 'cavalry',
      position: { x: midX - horizontalOffset, y: midY + verticalOffset },
      targetPosition: { x: midX - horizontalOffset, y: midY + verticalOffset },
      speed: 65,
    }),
    new Division({
      team: 2,
      type: 'infantry',
      position: { x: midX + horizontalOffset, y: midY - verticalOffset },
      targetPosition: { x: midX + horizontalOffset, y: midY - verticalOffset },
      speed: 40,
    }),
    new Division({
      team: 2,
      type: 'cavalry',
      position: { x: midX + horizontalOffset, y: midY + verticalOffset },
      targetPosition: { x: midX + horizontalOffset, y: midY + verticalOffset },
      speed: 65,
    }),
  ];
}
