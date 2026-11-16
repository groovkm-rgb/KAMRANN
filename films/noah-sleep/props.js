// Bedroom set and bed for "Noah Goes to Sleep".
const BED = { x: 150, w: 620 };
function bedroomSet(c, cam, t, o) {
  const wall = '#9db3cf';
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = wall; c.fillRect(0, 0, W, H);
  layer(c, cam, .75, c => {
    floorBoards(c, '#9a7250');
    c.fillStyle = wall; c.fillRect(-3000, -2400, 6000, 2260);
    c.fillStyle = shade(wall, -.04); for (let x = -3000; x < 3000; x += 140) c.fillRect(x, -2400, 70, 2260);
    c.beginPath(); c.rect(-3000, -170, 6000, 30); fs(c, '#eef0f4', 4);
    windowPane(c, -560, -1350, 380, 520, { frame: '#f2f0ea', view: cityView('night') });
    for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(-370 + sx * 230, -1420); c.quadraticCurveTo(-370 + sx * 300, -1100, -370 + sx * 255, -760); c.lineTo(-370 + sx * 180, -760); c.quadraticCurveTo(-370 + sx * 200, -1100, -370 + sx * 170, -1420); c.closePath(); fs(c, '#5c6fa8', 6); }
    line(c, [-640, -1420, -100, -1420], 10, '#6b3f22');
    // picture frame above the bed
    c.beginPath(); c.rect(BED.x - 110, -1250, 220, 160); fs(c, '#f2e3b8', 7); c.beginPath(); c.moveTo(BED.x - 90, -1110); c.lineTo(BED.x - 20, -1200); c.lineTo(BED.x + 30, -1150); c.lineTo(BED.x + 60, -1180); c.lineTo(BED.x + 90, -1110); c.closePath(); fs(c, '#7fa66a', 4);
  });
  layer(c, cam, 1, c => { ell(c, BED.x - 150, 160, 760, 130); fs(c, '#6d5a8a', 8); ell(c, BED.x - 150, 160, 640, 95); fs(c, null, 5, '#c9b8e0'); });
  return { base: wall, tint: null };
}
function bedBack(c) {
  const x = BED.x;
  rrect(c, x - BED.w / 2, -760, BED.w, 520, 80); fs(c, '#7a4a2e', 8);
  rrect(c, x - BED.w / 2 + 40, -720, BED.w - 80, 400, 60); fs(c, '#8d5a39', 5);
  ell(c, x, -560, 200, 78); fs(c, '#f6f3ec', 7); line(c, [x - 120, -560, x + 120, -560], 4, '#ddd8cc');
}
function bedFront(c, t, o = {}) {
  const x = BED.x, top = (o.top ?? -470) + (o.breathe || 0), hw = BED.w / 2 + 10;
  // blanket hump, folded sheet edge, footboard
  c.beginPath(); c.moveTo(x - hw, -200); c.lineTo(x - hw, top + 40); c.quadraticCurveTo(x - hw, top, x - hw + 60, top); c.lineTo(x + hw - 60, top); c.quadraticCurveTo(x + hw, top, x + hw, top + 40); c.lineTo(x + hw, -200); c.closePath(); fs(c, '#4f74b8', 8);
  c.save(); c.clip(); for (let i = 0; i < 6; i++) line(c, [x - hw + 40 + i * 110, top + 60, x - hw + 10 + i * 110, -200], 5, '#6a8fd0'); c.restore();
  rrect(c, x - hw + 8, top - 4, hw * 2 - 16, 52, 20); fs(c, '#f6f3ec', 7);
  rrect(c, x - hw - 20, -300, hw * 2 + 40, 280, 40); fs(c, '#7a4a2e', 8);
  rrect(c, x - hw + 20, -270, hw * 2 - 40, 210, 30); fs(c, '#8d5a39', 5);
  for (const s of [-1, 1]) { c.beginPath(); c.rect(x + s * (hw - 10) - 18, -30, 36, 30); fs(c, '#5a341c', 6); }
}
function nightstand(c, lampOn) {
  const x = BED.x + BED.w / 2 + 170;
  c.beginPath(); c.rect(x - 110, -400, 220, 400); fs(c, '#8d5a39', 8); c.beginPath(); c.rect(x - 90, -360, 180, 140); fs(c, '#7a4a2e', 5); circle(c, x, -290, 10); fs(c, '#f2d58a', 4);
  line(c, [x, -400, x, -560], 10); ell(c, x, -404, 50, 14); fs(c, '#5a341c', 5);
  c.beginPath(); c.moveTo(x - 90, -560); c.lineTo(x + 90, -560); c.lineTo(x + 55, -690); c.lineTo(x - 55, -690); c.closePath(); fs(c, lampOn ? '#ffe39a' : '#c9b98a', 7);
}
function lampGlow(c, k) {
  if (k <= 0) return; const x = BED.x + BED.w / 2 + 170, y = -620;
  const g = c.createRadialGradient(x, y, 20, x, y, 700); g.addColorStop(0, `rgba(255,220,140,${.45 * k})`); g.addColorStop(1, 'rgba(255,220,140,0)');
  c.fillStyle = g; c.fillRect(x - 700, y - 700, 1400, 1400);
}
