const TEAM_COLORS = {
  1: '#4da3ff',
  2: '#ff6b6b',
};

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

export function drawDivision(ctx, division) {
  const color = TEAM_COLORS[division.team] ?? '#dddddd';
  const { width, height } = division.size;
  const x = division.position.x - width / 2;
  const y = division.position.y - height / 2;

  drawFrame(ctx, x, y, width, height, color);

  if (division.type === 'infantry') {
    drawDiagonal(ctx, x, y, x + width, y + height);
    drawDiagonal(ctx, x, y + height, x + width, y);
  } else if (division.type === 'cavalry') {
    drawDiagonal(ctx, x, y + height, x + width, y);
  }
}

export function clearCanvas(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
}
