import { Division } from './division.js';

export function createBasicScenario(canvasWidth, canvasHeight) {
  const midX = canvasWidth / 2;
  const midY = canvasHeight / 2;

  return [
    new Division({
      team: 1,
      type: 'infantry',
      position: { x: midX - 260, y: midY - 120 },
      targetPosition: { x: midX - 60, y: midY - 50 },
      speed: 40,
    }),
    new Division({
      team: 1,
      type: 'cavalry',
      position: { x: midX - 260, y: midY + 120 },
      targetPosition: { x: midX - 80, y: midY + 40 },
      speed: 65,
    }),
    new Division({
      team: 2,
      type: 'infantry',
      position: { x: midX + 260, y: midY - 120 },
      targetPosition: { x: midX + 60, y: midY - 50 },
      speed: 40,
    }),
    new Division({
      team: 2,
      type: 'cavalry',
      position: { x: midX + 260, y: midY + 120 },
      targetPosition: { x: midX + 80, y: midY + 40 },
      speed: 65,
    }),
  ];
}
