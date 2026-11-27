// Cast sheet: Noah + every CAST member, front row and side (walking) row.
function renderFrame(c, t) {
  c.fillStyle = '#efe6d8'; c.fillRect(0, 0, W, H);
  const names = Object.keys(CAST), k = .17, gap = 1920 / (names.length + 1.4);
  c.save(); c.translate(0, 0);
  drawNoah(c, { x: gap * .75, y: 500, k, ink: 1.8 });
  names.forEach((n, i) => drawPerson(c, CAST[n], { x: gap * (i + 1.75), y: 500, k, expr: { mouth: i % 3 ? 'smile' : 'grin' } }));
  drawNoahSide(c, { x: gap * .75, y: 1040, k, ink: 1.8, walk: 1 });
  names.forEach((n, i) => drawPersonSide(c, CAST[n], { x: gap * (i + 1.75), y: 1040, k, walk: 1 + i * .7, s: 1 }));
  c.restore();
}
