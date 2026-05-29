export const TEAM_COLORS = {
  1: '#4da3ff',
  2: '#ff6b6b',
  3: '#65d16f',
};

const CONTROL_HEX_COLORS = {
  1: {
    fill: 'rgba(77, 163, 255, 0.16)',
    stroke: 'rgba(77, 163, 255, 0.24)',
  },
  2: {
    fill: 'rgba(255, 107, 107, 0.16)',
    stroke: 'rgba(255, 107, 107, 0.24)',
  },
  3: {
    fill: 'rgba(101, 209, 111, 0.16)',
    stroke: 'rgba(101, 209, 111, 0.24)',
  },
};

function traceHex(ctx, hex) {
  ctx.beginPath();

  for (let index = 0; index < 6; index += 1) {
    const angle = (Math.PI / 3) * index;
    const x = hex.x + hex.radius * Math.cos(angle);
    const y = hex.y + hex.radius * Math.sin(angle);

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
}


function drawCity(ctx, hex) {
  const colors = CONTROL_HEX_COLORS[hex.team];
  const cityRadius = Math.max(8, hex.radius * 0.28);

  ctx.save();
  ctx.fillStyle = 'rgba(255, 238, 170, 0.92)';
  ctx.strokeStyle = colors?.stroke ?? 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(hex.x, hex.y, cityRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = '35px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.lineWidth = 4;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.strokeText(hex.city.name, hex.x, hex.y + cityRadius + 6);
  ctx.fillText(hex.city.name, hex.x, hex.y + cityRadius + 6);
  ctx.restore();
}

export function drawControlHexes(ctx, hexes) {
  ctx.save();

  for (const hex of hexes) {
    const colors = CONTROL_HEX_COLORS[hex.team];

    if (!colors) {
      continue;
    }

    traceHex(ctx, hex);
    ctx.fillStyle = colors.fill;
    ctx.fill();
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 1;
    ctx.stroke();

    if (hex.city) {
      drawCity(ctx, hex);
    }
  }

  ctx.restore();
}

function drawFrame(ctx, x, y, width, height, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
}

function drawDiagonal(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawVerticalMeter(ctx, x, y, height, percent, color) {
  const barWidth = 3;
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const fillHeight = height * (clampedPercent / 100);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(x, y, barWidth, height);

  ctx.fillStyle = color;
  ctx.fillRect(x, y + height - fillHeight, barWidth, fillHeight);
}

function drawStatusMeters(ctx, division, x, y, width, height) {
  const meterX = x + width + 5;

  drawVerticalMeter(ctx, meterX, y, height, division.strength, '#35e05a');
  drawVerticalMeter(
    ctx,
    meterX + 4,
    y,
    height,
    division.morale,
    division.isBroken ? '#ffffff' : '#5bbcff'
  );

  ctx.font = '8px Arial, sans-serif';
  ctx.fillStyle = division.isBroken ? '#ffffff' : 'rgba(255, 255, 255, 0.82)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${Math.round(division.morale)}%`, meterX + 10, y + height / 2);
}

export function drawDivision(ctx, division) {
  const color = TEAM_COLORS[division.team] ?? '#dddddd';
  const { width, height } = division.size;
  const x = division.position.x - width / 2;
  const y = division.position.y - height / 2;
  const alpha = division.alpha ?? 1;

  ctx.save();
  ctx.globalAlpha = alpha;

  const combatFlashAlpha = division.combatFlashAlpha ?? 0;
  if (combatFlashAlpha > 0) {
    ctx.fillStyle = `rgba(255, 0, 0, ${combatFlashAlpha.toFixed(3)})`;
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  }
  ctx.fillRect(x, y, width, height);

  const brokenFlashAlpha = division.brokenFlashAlpha ?? 0;
  if (brokenFlashAlpha > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${brokenFlashAlpha.toFixed(3)})`;
    ctx.fillRect(x, y, width, height);
  }

  drawFrame(ctx, x, y, width, height, color);

  if (division.type === 'infantry') {
    drawDiagonal(ctx, x, y, x + width, y + height);
    drawDiagonal(ctx, x, y + height, x + width, y);
  } else if (division.type === 'cavalry') {
    drawDiagonal(ctx, x, y + height, x + width, y);
  }

  drawStatusMeters(ctx, division, x, y, width, height);
  drawCombatRange(ctx, division);
  drawTargetArrow(ctx, division);

  ctx.restore();
}

function drawCombatRange(ctx, division) {
  ctx.save();
  ctx.strokeStyle = division.inCombat ? 'rgba(255, 80, 80, 0.8)' : 'rgba(180, 180, 180, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(division.position.x, division.position.y, division.combatRange, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawTargetArrow(ctx, division) {
  const dx = division.targetPosition.x - division.position.x;
  const dy = division.targetPosition.y - division.position.y;
  const distance = Math.hypot(dx, dy);

  if (distance < 2) {
    return;
  }

  const unitX = dx / distance;
  const unitY = dy / distance;
  const startX = division.position.x;
  const startY = division.position.y;
  const arrowLength = Math.min(distance, 36);
  const endX = startX + unitX * arrowLength;
  const endY = startY + unitY * arrowLength;
  const headSize = 6;

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - unitX * headSize - unitY * headSize * 0.7, endY - unitY * headSize + unitX * headSize * 0.7);
  ctx.lineTo(endX - unitX * headSize + unitY * headSize * 0.7, endY - unitY * headSize - unitX * headSize * 0.7);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fill();
  ctx.restore();
}

export function clearCanvas(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
}

export function drawGameVersion(ctx, version) {
  ctx.save();
  ctx.font = '30px Arial, sans-serif';
  ctx.fillStyle = '#999999';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`v${version}`, 30, 30);
  ctx.restore();
}

export function drawFpsCounter(ctx, averageFps) {
  if (averageFps === null) {
    return;
  }

  ctx.save();
  ctx.font = '30px Arial, sans-serif';
  ctx.fillStyle = '#999999';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`FPS: ${averageFps.toFixed(1)}`, 30, 60);
  ctx.restore();
}
