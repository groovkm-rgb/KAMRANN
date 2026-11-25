// LUXURY RESTAURANT (Altbau dining room) + props + light. World units: 1 m ≈ 220; Noah at k .25 stands on y = 0.
//   salon(c, cam, t, { tod: 'golden' | 'evening' | 'night', full: 0..1 guests drawn by the scene })
//   salonLight(c, cam, t, { tod }) in `screen`: window beams + pane patches on the floor, motes, bloom, grade
//   props (world): dineTable(c, x, o) chairBack(c, x, o) wineGlass waterGlass candle menuCard ...
const SAL = {
  HZ: -300, wall: '#d9c7a4', wall2: '#c9b38c', wain: '#5b3a2a', wainHi: '#7a503a', gold: '#c9a24a', goldDark: '#8a6a24', floor: '#8a5a36', floor2: '#6e4528',
  velvet: '#6e1f2c', velvetHi: '#8f2d3c', cloth: '#f7f3ea', clothShade: '#ddd5c4', wood: '#5a3622', green: '#2f5a3a',
  windows: [-2600, -1300, 0, 1300, 2600], WS: .6, MS: .8,
};
function toScreen(cam, p, x, y) { const zp = 1 + (cam.z - 1) * p; return [W / 2 + zp * (x - cam.x * p), H / 2 + zp * (y - cam.y * p)]; }
const SALSKY = {
  golden: { sky: ['#f6b26b', '#ffe0a8'], far: '#c98a6a', far2: '#a8707a', sun: 'rgba(255,210,140,' },
  evening: { sky: ['#3d4a8a', '#f0a070'], far: '#6a5070', far2: '#4a3a5a', sun: 'rgba(255,170,110,' },
  night: { sky: ['#070b1e', '#1a2550'], far: '#141a36', far2: '#0e1228', sun: 'rgba(170,190,255,' },
};
// ---------- small props ----------
function wineGlass(c, x, y, s = 1, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.ellipse(0, -1, 13, 3.5, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(230,240,245,.8)'; c.fill(); c.lineWidth = 1.8; c.strokeStyle = 'rgba(40,40,50,.8)'; c.stroke();
  line(c, [0, -2, 0, -36], 3.2, 'rgba(40,40,50,.85)'); line(c, [0, -2, 0, -36], 1.4, 'rgba(240,248,255,.9)');
  c.beginPath(); c.moveTo(-15, -76); c.bezierCurveTo(-17, -50, -8, -38, 0, -37); c.bezierCurveTo(8, -38, 17, -50, 15, -76); c.closePath();
  c.fillStyle = 'rgba(215,232,240,.35)'; c.fill();
  if (o.wine) { c.save(); c.clip(); c.fillStyle = o.wine; c.fillRect(-20, -58, 40, 30); c.beginPath(); c.ellipse(0, -58, 14, 3, 0, 0, Math.PI * 2); c.fillStyle = shade(o.wine, .25); c.fill(); c.restore(); }
  c.beginPath(); c.moveTo(-15, -76); c.bezierCurveTo(-17, -50, -8, -38, 0, -37); c.bezierCurveTo(8, -38, 17, -50, 15, -76); c.lineWidth = 2; c.strokeStyle = 'rgba(40,40,50,.8)'; c.stroke();
  c.beginPath(); c.ellipse(0, -76, 15, 3.5, 0, 0, Math.PI * 2); c.lineWidth = 1.6; c.stroke();
  line(c, [-9, -70, -10, -50], 2.5, 'rgba(255,255,255,.85)');
  if (o.glint) bloom(c, -9, -64, 26, '255,240,200', o.glint);
  c.restore();
}
function waterGlass(c, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-11, -40); c.lineTo(-9, 0); c.lineTo(9, 0); c.lineTo(11, -40); c.closePath(); c.fillStyle = 'rgba(205,228,238,.4)'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(40,40,50,.8)'; c.stroke();
  c.fillStyle = 'rgba(160,205,225,.45)'; c.fillRect(-9.5, -24, 19, 23); line(c, [-6, -34, -5, -6], 2.4, 'rgba(255,255,255,.85)');
  c.beginPath(); c.ellipse(0, -40, 11, 2.6, 0, 0, Math.PI * 2); c.lineWidth = 1.5; c.stroke();
  c.restore();
}
function candle(c, x, y, t, s = 1, lit = true) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.ellipse(0, 0, 16, 4, 0, 0, Math.PI * 2); fs(c, '#c9a24a', 1.5); line(c, [0, 0, 0, -12], 5, '#a8842e');
  c.beginPath(); c.rect(-6, -60, 12, 48); fs(c, '#f8f1de', 1.5); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(2, -60, 4, 48);
  if (lit) { const fl = 1 + Math.sin(t * 13) * .08 + Math.sin(t * 7.3) * .06; c.beginPath(); c.moveTo(0, -84 * fl + 24); c.quadraticCurveTo(7, -66, 0, -61); c.quadraticCurveTo(-7, -66, 0, -84 * fl + 24); c.fillStyle = '#ffd36a'; c.fill(); c.beginPath(); c.ellipse(0, -66, 2.4, 4, 0, 0, Math.PI * 2); c.fillStyle = '#fff6d8'; c.fill(); bloom(c, 0, -70, 110 * fl, '255,200,120', .5); }
  c.restore();
}
function cutlery(c, x, y, side, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s); const col = '#c8ccd2';
  for (let i = 0; i < 2; i++) { const dx = side * (i * 9); line(c, [dx, 0, dx + side * 2, -2], 3, col); c.beginPath(); c.ellipse(dx, 0, 10, 1.6, 0, 0, Math.PI * 2); c.fillStyle = col; c.fill(); }
  c.restore();
}
function napkinFold(c, x, y, s = 1, col = '#f8f5ee') {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-14, 0); c.lineTo(-8, -34); c.lineTo(0, -40); c.lineTo(8, -34); c.lineTo(14, 0); c.closePath(); fs(c, col, 1.8);
  line(c, [0, -38, 0, -2], 1.5, '#d6cfc2'); line(c, [-8, -32, -4, -2], 1.2, '#e0dacd'); c.restore();
}
function menuCard(c, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-18, 0); c.lineTo(-14, -48); c.lineTo(14, -48); c.lineTo(18, 0); c.closePath(); fs(c, '#efe6d2', 1.6);
  c.font = hudFont(8.5); c.fillStyle = '#5a3a24'; c.textAlign = 'center'; c.fillText('MENÜ', 0, -36);
  for (let i = 0; i < 4; i++) line(c, [-9, -27 + i * 6, 9 - (i % 2) * 4, -27 + i * 6], 1.2, '#a08870');
  c.restore();
}
function saltPepper(c, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const [dx, col] of [[-7, '#f4f4f4'], [7, '#3a3434']]) { c.beginPath(); c.roundRect(dx - 4.5, -18, 9, 18, 3); fs(c, col, 1.4); c.beginPath(); c.arc(dx, -18, 4.5, Math.PI, 0); fs(c, '#c8ccd2', 1.2); }
  c.restore();
}
function plateSet(c, x, y, s = 1) { // empty place setting on the table top
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.ellipse(0, 1, 40, 9, 0, 0, Math.PI * 2); fs(c, '#fbfaf6', 1.8); c.beginPath(); c.ellipse(0, 0, 30, 6.5, 0, 0, Math.PI * 2); c.lineWidth = 1.5; c.strokeStyle = '#c9a85a'; c.stroke();
  cutlery(c, -50, 2, -1); cutlery(c, 50, 2, 1); c.restore();
}
// table seen from the front, cloth hanging; o: { w, top (y of near top edge), items(c, topY), cloth, seed }
function dineTable(c, x, o = {}) {
  const w = o.w || 360, top = o.top ?? -128, depth = o.depth ?? 22, hem = o.hem ?? -20, seed = o.seed || 1;
  c.save(); c.translate(x, 0);
  // floor shadow
  c.beginPath(); c.ellipse(0, 2, w * .62, 16, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(30,15,15,.32)'; c.fill();
  // top surface (seen slightly from above)
  c.beginPath(); c.moveTo(-w / 2 + 10, top - depth); c.lineTo(w / 2 - 10, top - depth); c.lineTo(w / 2, top); c.lineTo(-w / 2, top); c.closePath(); fs(c, o.cloth || SAL.cloth, 2.5);
  // hanging cloth with folds
  c.beginPath(); c.moveTo(-w / 2, top); c.lineTo(w / 2, top); c.lineTo(w / 2 + 8, hem);
  for (let i = 0; i <= 8; i++) { const xx = w / 2 + 8 - i * (w + 16) / 8; c.quadraticCurveTo(xx + (w + 16) / 16, hem + (i % 2 ? 8 : -4), xx, hem); }
  c.closePath(); fs(c, o.cloth || SAL.cloth, 2.5);
  c.save(); c.clip();
  for (let i = 1; i < 8; i++) { const xx = -w / 2 + i * w / 8 + (rnd(seed + i) - .5) * 10, g = c.createLinearGradient(xx - 16, 0, xx + 16, 0); g.addColorStop(0, 'rgba(120,100,80,0)'); g.addColorStop(.5, 'rgba(120,100,80,.18)'); g.addColorStop(1, 'rgba(120,100,80,0)'); c.fillStyle = g; c.fillRect(xx - 16, top + 8, 32, hem - top); }
  const g = c.createLinearGradient(0, top, 0, hem); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(60,40,40,.22)'); c.fillStyle = g; c.fillRect(-w, top, w * 2, hem - top);
  c.restore();
  nLineSafe(c, [-w / 2 + 4, top + 3, w / 2 - 4, top + 3], 2, 'rgba(255,255,255,.7)');
  if (o.items) o.items(c, top - depth * .45);
  c.restore();
}
function nLineSafe(c, pts, w, col) { line(c, pts, w, col); }
// a standard luxurious setting on a table
function tableDressing(c, w, ty, t, o = {}) {
  plateSet(c, -w * .25, ty + 6); plateSet(c, w * .25, ty + 6);
  wineGlass(c, -w * .25 + 36, ty - 2, .8, { glint: o.glint }); wineGlass(c, w * .25 + 36, ty - 2, .8, { glint: o.glint }); waterGlass(c, -w * .25 + 58, ty - 2, .7); waterGlass(c, w * .25 + 58, ty - 2, .7);
  napkinFold(c, -w * .25, ty + 4, .7); napkinFold(c, w * .25, ty + 4, .7);
  candle(c, -10, ty - 6, t + (o.seed || 0), .8, o.lit !== false); clayFlowers(c, 22, ty - 6, .6); saltPepper(c, -34, ty - 4, .8); if (o.menu !== false) menuCard(c, 52, ty - 4, .85);
}
function chairBack(c, x, o = {}) { // chair standing behind a table (seen from the front: back rest visible)
  const col = o.col || SAL.velvet, s = (o.s || 1) * .72;
  c.save(); c.translate(x, 0); c.scale(s, s);
  line(c, [-48, 0, -46, -150], 9, '#2a1a10'); line(c, [48, 0, 46, -150], 9, '#2a1a10');
  c.beginPath(); c.moveTo(-50, -150); c.lineTo(-56, -330); c.quadraticCurveTo(0, -360, 56, -330); c.lineTo(50, -150); c.closePath(); fs(c, SAL.wood, 3);
  c.beginPath(); c.moveTo(-40, -165); c.lineTo(-44, -318); c.quadraticCurveTo(0, -342, 44, -318); c.lineTo(40, -165); c.closePath(); fs(c, col, 2);
  for (const [bx, by] of [[-20, -290], [20, -290], [0, -250], [-20, -210], [20, -210]]) { c.beginPath(); c.arc(bx, by, 3, 0, Math.PI * 2); c.fillStyle = shade(col, -.35); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.moveTo(-34, -310); c.quadraticCurveTo(-30, -240, -32, -175); c.lineTo(-24, -175); c.quadraticCurveTo(-22, -240, -26, -312); c.fill();
  c.restore();
}
// ---------- wall decor ----------
function goldFrame(c, x, y, w, h, paint) {
  c.beginPath(); c.rect(x - 16, y - 16, w + 32, h + 32); fs(c, SAL.gold, 3);
  c.beginPath(); c.rect(x - 8, y - 8, w + 16, h + 16); fs(c, SAL.goldDark, 2);
  for (const [cx, cy] of [[x - 8, y - 8], [x + w + 8, y - 8], [x - 8, y + h + 8], [x + w + 8, y + h + 8]]) { c.beginPath(); c.arc(cx, cy, 10, 0, Math.PI * 2); fs(c, '#e0bd62', 2); }
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); paint(c, x, y, w, h); c.restore(); c.beginPath(); c.rect(x, y, w, h); fs(c, null, 2);
  c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w * .4, y); c.lineTo(x, y + h * .5); c.fill();
}
const PAINT = {
  stillLife: (c, x, y, w, h) => { let g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#2a2018'); g.addColorStop(1, '#4a3424'); c.fillStyle = g; c.fillRect(x, y, w, h);
    c.fillStyle = '#6a4a30'; c.fillRect(x, y + h * .72, w, h * .28);
    ell(c, x + w * .35, y + h * .62, w * .14, h * .12); c.fillStyle = '#b8402a'; c.fill(); ell(c, x + w * .55, y + h * .66, w * .1, h * .09); c.fillStyle = '#d8a040'; c.fill(); ell(c, x + w * .66, y + h * .6, w * .08, h * .08); c.fillStyle = '#6a2a4a'; c.fill();
    c.beginPath(); c.moveTo(x + w * .2, y + h * .72); c.quadraticCurveTo(x + w * .16, y + h * .3, x + w * .28, y + h * .24); c.lineTo(x + w * .32, y + h * .24); c.quadraticCurveTo(x + w * .44, y + h * .3, x + w * .4, y + h * .72); c.fillStyle = '#7a8a7a'; c.fill();
    c.fillStyle = 'rgba(255,240,200,.25)'; c.fillRect(x + w * .22, y + h * .3, w * .04, h * .3); },
  landscape: (c, x, y, w, h) => { let g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#9ab8c8'); g.addColorStop(.6, '#e8d8b0'); g.addColorStop(1, '#7a8a5a'); c.fillStyle = g; c.fillRect(x, y, w, h);
    c.fillStyle = '#7a8aa0'; c.beginPath(); c.moveTo(x, y + h * .6); c.lineTo(x + w * .3, y + h * .35); c.lineTo(x + w * .5, y + h * .55); c.lineTo(x + w * .75, y + h * .3); c.lineTo(x + w, y + h * .55); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.fill();
    c.fillStyle = '#5a6a3a'; c.fillRect(x, y + h * .7, w, h * .3); for (let i = 0; i < 5; i++) { ell(c, x + w * (.1 + i * .2), y + h * .7, w * .06, h * .12); c.fillStyle = '#3f5a2a'; c.fill(); } },
  portrait: (c, x, y, w, h) => { c.fillStyle = '#3a2a22'; c.fillRect(x, y, w, h); ell(c, x + w / 2, y + h * .4, w * .2, h * .18); c.fillStyle = '#e8d0b0'; c.fill(); c.beginPath(); c.moveTo(x + w * .15, y + h); c.quadraticCurveTo(x + w / 2, y + h * .5, x + w * .85, y + h); c.fillStyle = '#5a2a30'; c.fill(); ell(c, x + w / 2, y + h * .3, w * .24, h * .12); c.fillStyle = '#4a3020'; c.fill(); },
};
function sconce(c, x, y, lit, t) {
  c.beginPath(); c.ellipse(x, y + 20, 10, 18, 0, 0, Math.PI * 2); fs(c, SAL.gold, 2); line(c, [x, y + 10, x - 22, y - 10, x - 22, y - 26], 4, SAL.goldDark); line(c, [x, y + 10, x + 22, y - 10, x + 22, y - 26], 4, SAL.goldDark);
  for (const d of [-22, 22]) { c.beginPath(); c.moveTo(x + d - 14, y - 26); c.lineTo(x + d + 14, y - 26); c.lineTo(x + d + 9, y - 52); c.lineTo(x + d - 9, y - 52); c.closePath(); fs(c, lit ? '#fff1cf' : '#d8ccb4', 2); if (lit) bloom(c, x + d, y - 40, 90, '255,205,130', .45); }
}
function chandelier(c, x, y, s, t, lit = true) {
  c.save(); c.translate(x, y); c.scale(s, s);
  line(c, [0, -400, 0, -60], 4, '#5a4a2a');
  c.beginPath(); c.ellipse(0, -60, 20, 30, 0, 0, Math.PI * 2); fs(c, SAL.gold, 2.5);
  for (let i = -3; i <= 3; i++) { const ax = i * 42, ay = -20 + Math.abs(i) * -4; c.beginPath(); c.moveTo(0, -40); c.quadraticCurveTo(ax * .6, 10, ax, ay); c.lineWidth = 5; c.strokeStyle = SAL.goldDark; c.stroke();
    c.beginPath(); c.rect(ax - 4, ay - 30, 8, 26); fs(c, '#f8f1de', 1.5); if (lit) { c.beginPath(); c.ellipse(ax, ay - 38, 4, 8, 0, 0, Math.PI * 2); c.fillStyle = '#ffe9a8'; c.fill(); }
    for (let k = 0; k < 3; k++) { const px = ax * .7 + (k - 1) * 8, py = 0 + k * 12 + Math.sin(t * 1.3 + i) * 1.5; c.beginPath(); c.moveTo(px, py); c.lineTo(px + 4, py + 9); c.lineTo(px, py + 18); c.lineTo(px - 4, py + 9); c.closePath(); c.fillStyle = lit ? 'rgba(255,245,220,.95)' : 'rgba(200,210,230,.6)'; c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(60,50,30,.6)'; c.stroke(); } }
  c.beginPath(); c.moveTo(-130, -6); c.quadraticCurveTo(0, 46, 130, -6); c.lineWidth = 3; c.strokeStyle = 'rgba(255,240,210,.7)'; c.stroke();
  for (let k = 0; k < 9; k++) { const px = -112 + k * 28, py = 14 + Math.sin(k / 8 * Math.PI) * 20; c.beginPath(); c.arc(px, py, 4, 0, Math.PI * 2); c.fillStyle = 'rgba(255,250,235,.9)'; c.fill(); }
  c.beginPath(); c.moveTo(-10, 40); c.lineTo(0, 74); c.lineTo(10, 40); c.closePath(); c.fillStyle = 'rgba(255,245,220,.9)'; c.fill();
  if (lit) { bloom(c, 0, -30, 330, '255,210,140', .55); bloom(c, 0, -30, 120, '255,240,200', .6); }
  c.restore();
}
function bigPlant(c, x, y, s = 1, t = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (i - 6.5) * .2 + Math.sin(t * .7 + i) * .02, L = 220 + rnd(i + 70) * 160, ex = Math.cos(a) * L, ey = -150 + Math.sin(a) * L;
    c.beginPath(); c.moveTo(0, -140); c.quadraticCurveTo(ex * .4, -140 + (ey + 140) * .7, ex, ey); c.lineWidth = 5; c.strokeStyle = '#2f4a2a'; c.stroke();
    c.save(); c.translate(ex, ey); c.rotate(a + Math.PI / 2); c.beginPath(); c.ellipse(0, 40, 22, 60, 0, 0, Math.PI * 2); fs(c, i % 2 ? '#3f7a44' : '#4f8f50', 2.5); line(c, [0, -10, 0, 90], 2, '#2f5a30'); c.restore(); }
  c.beginPath(); c.moveTo(-80, -150); c.lineTo(80, -150); c.lineTo(60, 0); c.lineTo(-60, 0); c.closePath(); fs(c, '#c9b08a', 3); c.beginPath(); c.rect(-88, -165, 176, 22); fs(c, '#b89a72', 3); line(c, [-70, -100, 70, -100], 3, SAL.gold);
  c.restore();
}
function curtain(c, x, y, h, side, col, t) {
  // heavy velvet drape with tie-back, side -1 = left of window
  c.beginPath(); c.moveTo(x, y); c.lineTo(x + side * 150, y);
  c.quadraticCurveTo(x + side * 70, y + h * .45, x + side * 40, y + h * .55); c.quadraticCurveTo(x + side * 110, y + h * .7, x + side * 140, y + h); c.lineTo(x - side * 20, y + h); c.lineTo(x - side * 20, y); c.closePath(); fs(c, col, 3);
  c.save(); c.clip(); for (let i = 0; i < 6; i++) { const xx = x - side * 10 + side * i * 26, g = c.createLinearGradient(xx - 12, 0, xx + 12, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.5, i % 2 ? 'rgba(0,0,0,.28)' : 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(xx - 12, y, 24, h); } c.restore();
  c.beginPath(); c.ellipse(x + side * 46, y + h * .55, 30, 12, side * .3, 0, Math.PI * 2); fs(c, SAL.gold, 2.5); line(c, [x + side * 46, y + h * .55 + 10, x + side * 52, y + h * .55 + 60], 4, SAL.gold); c.beginPath(); c.ellipse(x + side * 52, y + h * .55 + 70, 7, 14, 0, 0, Math.PI * 2); fs(c, SAL.gold, 2);
}
function stuccoBand(c, x0, x1, y, h) {
  c.beginPath(); c.rect(x0, y, x1 - x0, h); fs(c, '#efe6d2', 2);
  c.fillStyle = 'rgba(120,100,70,.18)'; c.fillRect(x0, y + h * .65, x1 - x0, h * .12); c.fillRect(x0, y + h * .2, x1 - x0, h * .06);
  for (let x = Math.floor(x0 / 40) * 40; x < x1; x += 40) { c.beginPath(); c.ellipse(x + 20, y + h * .45, 12, h * .16, 0, 0, Math.PI * 2); c.fillStyle = '#f7f0e0'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(110,90,60,.45)'; c.stroke(); line(c, [x + 40, y + h * .3, x + 40, y + h * .6], 2, 'rgba(110,90,60,.4)'); }
  for (let x = Math.floor(x0 / 24) * 24; x < x1; x += 24) { c.beginPath(); c.rect(x + 4, y + h * .8, 14, h * .16); c.fillStyle = 'rgba(110,90,60,.2)'; c.fill(); }
}
function rosette(c, x, y, r) { for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.beginPath(); c.ellipse(x + Math.cos(a) * r * .55, y + Math.sin(a) * r * .2, r * .3, r * .1, a, 0, Math.PI * 2); c.fillStyle = '#f2e9d6'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(110,90,60,.4)'; c.stroke(); } c.beginPath(); c.ellipse(x, y, r * .22, r * .08, 0, 0, Math.PI * 2); fs(c, '#e8dcc4', 1.5); }
function wineRack(c, x, y, w, h, lit) {
  c.beginPath(); c.rect(x, y, w, h); fs(c, '#3a2418', 3);
  const cols = Math.floor(w / 46), rows = Math.floor(h / 46);
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) { const cx = x + 23 + k * 46, cy = y + 23 + r * 46; c.beginPath(); c.arc(cx, cy, 19, 0, Math.PI * 2); fs(c, '#1e120c', 1.5);
    if (rnd(r * 17 + k * 5 + 3) > .18) { c.beginPath(); c.arc(cx, cy, 13, 0, Math.PI * 2); c.fillStyle = ['#3a0e18', '#1e2a14', '#4a1a10', '#2a1a2a'][(r + k) % 4]; c.fill(); c.beginPath(); c.arc(cx, cy, 6, 0, Math.PI * 2); c.fillStyle = rnd(r + k * 3) > .5 ? '#c9a24a' : '#7a1e2c'; c.fill(); c.beginPath(); c.arc(cx - 4, cy - 5, 3, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill(); } }
  for (let k = 0; k <= cols; k++) line(c, [x + k * 46, y, x + k * 46, y + h], 3, '#5a3a24');
  if (lit) bloom(c, x + w / 2, y + 20, w * .7, '255,190,110', .25);
}
function barCounter(c, x, w, t, o = {}) {
  const top = -250;
  c.beginPath(); c.rect(x, top, w, -top); fs(c, '#4a2c1c', 3);
  for (let i = 0; i < w / 80; i++) { c.beginPath(); c.rect(x + 12 + i * 80, top + 30, 66, -top - 50); fs(c, '#5a3622', 2); c.beginPath(); c.rect(x + 22 + i * 80, top + 42, 46, -top - 74); fs(c, null, 1.5, 'rgba(255,220,160,.25)'); }
  c.beginPath(); c.rect(x - 20, top - 22, w + 40, 26); fs(c, '#2a1a12', 3); c.fillStyle = 'rgba(255,230,180,.3)'; c.fillRect(x - 16, top - 20, w + 32, 4);
  line(c, [x - 10, -40, x + w + 10, -40], 6, SAL.gold);
  // bottles + glasses + tap + register on the counter
  for (let i = 0; i < 6; i++) { const bx = x + 30 + i * 34; c.beginPath(); c.rect(bx - 9, top - 80, 18, 58); fs(c, ['#2a4a2a', '#6a1a1a', '#c9a24a', '#2a2a4a'][i % 4], 1.5); c.beginPath(); c.rect(bx - 4, top - 104, 8, 26); fs(c, '#1a1a1a', 1.2); }
  for (let i = 0; i < 4; i++) wineGlass(c, x + w - 160 + i * 30, top - 22, .7);
  c.beginPath(); c.rect(x + w * .5 - 40, top - 70, 80, 48); fs(c, '#2a2a2e', 2); c.beginPath(); c.rect(x + w * .5 - 30, top - 64, 60, 18); c.fillStyle = '#7ad0a0'; c.fill();
}
// ---------- the dining room ----------
function salon(c, cam, t, o = {}) {
  const tod = o.tod || 'golden', S = SALSKY[tod], night = tod === 'night', HZ = o.hz ?? SAL.HZ, WS = SAL.WS;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = night ? '#141626' : SAL.wall; c.fillRect(0, 0, W, H);
  const pw = .72, bw = layerBase(cam, HZ, pw);
  layer(c, cam, pw, c => {
    c.translate(0, bw); c.scale(WS, WS); const b = 0, top = b - 1180;
    // wall + subtle damask stripes
    c.fillStyle = SAL.wall; c.fillRect(-6000, top, 12000, 1300);
    for (let x = -6000; x < 6000; x += 90) { c.fillStyle = 'rgba(120,90,50,.06)'; c.fillRect(x, top, 45, 1300); }
    for (let x = -6000; x < 6000; x += 90) for (let y = top + 140; y < b - 260; y += 110) { c.beginPath(); c.ellipse(x + 22, y, 8, 16, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(150,110,60,.08)'; c.fill(); }
    // ceiling + stucco
    c.fillStyle = '#efe7d4'; c.fillRect(-6000, top - 900, 12000, 900); stuccoBand(c, -6000, 6000, top - 70, 70); stuccoBand(c, -6000, 6000, top - 150, 36);
    for (let x = -5200; x <= 5200; x += 1300) rosette(c, x + 650, top - 190, 120);
    // wainscot panels
    c.beginPath(); c.rect(-6000, b - 260, 12000, 260); fs(c, SAL.wain, 3);
    for (let x = -6000; x < 6000; x += 220) { c.beginPath(); c.rect(x + 18, b - 236, 184, 190); fs(c, SAL.wainHi, 2); c.beginPath(); c.rect(x + 34, b - 220, 152, 158); fs(c, null, 1.5, 'rgba(0,0,0,.25)'); }
    c.beginPath(); c.rect(-6000, b - 272, 12000, 18); fs(c, '#3a2418', 2); c.beginPath(); c.rect(-6000, b - 34, 12000, 34); fs(c, '#3a2418', 2);
    // windows with view, curtains
    for (const wx of SAL.windows) {
      const ww = 300, wh = 640, wy = b - 260 - wh - 40;
      c.save(); c.beginPath(); c.rect(wx - ww / 2, wy, ww, wh); c.arc(wx, wy, ww / 2, Math.PI, 0); c.clip();
      let g = c.createLinearGradient(0, wy - ww / 2, 0, wy + wh); g.addColorStop(0, S.sky[0]); g.addColorStop(1, S.sky[1]); c.fillStyle = g; c.fillRect(wx - ww, wy - ww, ww * 2, wh + ww * 2);
      if (night) { for (let i = 0; i < 14; i++) { c.fillStyle = `rgba(255,255,255,${.4 + rnd(i + wx) * .5})`; c.fillRect(wx - ww / 2 + rnd(i * 3 + wx) * ww, wy - ww / 2 + rnd(i * 7 + wx) * wh * .5, 2.5, 2.5); } if (wx === SAL.windows[1]) { c.beginPath(); c.arc(wx + 60, wy + 40, 34, 0, Math.PI * 2); c.fillStyle = '#eef2ff'; c.fill(); bloom(c, wx + 60, wy + 40, 160, '190,210,255', .5); } }
      else if (tod === 'golden' && wx === SAL.windows[1]) { bloom(c, wx - 30, wy + wh * .55, 260, '255,235,180', .9); c.beginPath(); c.arc(wx - 30, wy + wh * .55, 46, 0, Math.PI * 2); c.fillStyle = '#fff3d0'; c.fill(); }
      // opposite houses (Altbau facades) through the window
      for (let i = 0; i < 4; i++) { const hx = wx - ww / 2 - 20 + i * 90, hh = 260 + rnd(i + wx * .01) * 160; c.fillStyle = i % 2 ? S.far : S.far2; c.fillRect(hx, wy + wh - hh, 86, hh); for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) { c.fillStyle = night ? (rnd(i * 9 + r * 2 + k) > .55 ? '#ffd98a' : '#1a2040') : 'rgba(255,240,210,.35)'; c.fillRect(hx + 14 + k * 38, wy + wh - hh + 30 + r * 58, 20, 32); } c.beginPath(); c.moveTo(hx - 4, wy + wh - hh); c.lineTo(hx + 43, wy + wh - hh - 40); c.lineTo(hx + 90, wy + wh - hh); c.fillStyle = shade(S.far2, -.2); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.moveTo(wx - ww / 2, wy + wh); c.lineTo(wx - ww / 2 + 120, wy - 100); c.lineTo(wx - ww / 2 + 170, wy - 100); c.lineTo(wx - ww / 2 + 50, wy + wh); c.fill();
      c.restore();
      // frame + mullions + sill
      c.beginPath(); c.rect(wx - ww / 2, wy, ww, wh); c.arc(wx, wy, ww / 2, Math.PI, 0); c.lineWidth = 18; c.strokeStyle = '#f4efe4'; c.stroke(); c.lineWidth = 2.5; c.strokeStyle = OUT; c.stroke();
      line(c, [wx, wy - ww / 2, wx, wy + wh], 9, '#f4efe4'); for (let k = 1; k < 4; k++) line(c, [wx - ww / 2, wy + k * wh / 4, wx + ww / 2, wy + k * wh / 4], 7, '#f4efe4');
      c.beginPath(); c.rect(wx - ww / 2 - 30, wy + wh, ww + 60, 22); fs(c, '#e8e0d0', 2.5);
      // curtain rod + drapes
      line(c, [wx - ww / 2 - 120, wy - ww / 2 - 50, wx + ww / 2 + 120, wy - ww / 2 - 50], 9, SAL.goldDark); for (const s of [-1, 1]) { c.beginPath(); c.arc(wx + s * (ww / 2 + 126), wy - ww / 2 - 50, 12, 0, Math.PI * 2); fs(c, SAL.gold, 2); }
      c.beginPath(); c.moveTo(wx - ww / 2 - 110, wy - ww / 2 - 44); for (let i = 0; i <= 8; i++) c.quadraticCurveTo(wx - ww / 2 - 110 + (i + .5) * (ww + 220) / 8, wy - ww / 2 + 20 + (i % 2) * 14, wx - ww / 2 - 110 + (i + 1) * (ww + 220) / 8, wy - ww / 2 - 30); c.lineTo(wx + ww / 2 + 110, wy - ww / 2 - 44); c.closePath(); fs(c, SAL.velvetHi, 2.5);
      curtain(c, wx - ww / 2 - 10, wy - ww / 2 - 44, wh + ww / 2 + 44 + 40, -1, SAL.velvet, t); curtain(c, wx + ww / 2 + 10, wy - ww / 2 - 44, wh + ww / 2 + 44 + 40, 1, SAL.velvet, t);
    }
    // paintings, mirror and sconces between windows
    const between = [-1950, -650, 650, 1950, -3250, 3250];
    between.forEach((x, i) => {
      if (i === 2) { // tall mirror
        c.beginPath(); c.rect(x - 110, b - 980, 220, 620); fs(c, SAL.gold, 3); c.beginPath(); c.rect(x - 92, b - 962, 184, 584); let g = c.createLinearGradient(x - 92, 0, x + 92, 0); g.addColorStop(0, night ? '#20283a' : '#a9b4b8'); g.addColorStop(1, night ? '#30384c' : '#d8dcd6'); c.fillStyle = g; c.fill(); c.lineWidth = 2; c.strokeStyle = OUT; c.stroke();
        c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.moveTo(x - 60, b - 962); c.lineTo(x - 20, b - 962); c.lineTo(x - 92, b - 700); c.lineTo(x - 92, b - 820); c.fill();
        chandelier(c, x - 10, b - 760, .5, t, !night);
      } else {
        const kind = ['stillLife', 'landscape', 'stillLife', 'portrait', 'landscape', 'portrait'][i], pw2 = kind === 'portrait' ? 200 : 300, ph = kind === 'portrait' ? 260 : 220;
        goldFrame(c, x - pw2 / 2, b - 700 - ph / 2, pw2, ph, PAINT[kind]); line(c, [x - 24, b - 700 - ph / 2 - 16, x, b - 700 - ph / 2 - 70, x + 24, b - 700 - ph / 2 - 16], 2, SAL.goldDark);
        if (!night && kind !== 'portrait') { c.beginPath(); c.moveTo(x - 50, b - 700 - ph / 2 - 30); c.lineTo(x + 50, b - 700 - ph / 2 - 30); c.lineTo(x + 40, b - 700 - ph / 2 - 20); c.lineTo(x - 40, b - 700 - ph / 2 - 20); c.closePath(); fs(c, SAL.gold, 1.5); bloom(c, x, b - 700, 160, '255,220,160', .18); }
      }
      sconce(c, x - 230, b - 520, !night || o.sconces, t); sconce(c, x + 230, b - 520, !night || o.sconces, t);
    });
    // bar + wine rack on the right end
    wineRack(c, 3700, b - 900, 560, 600, !night); barCounter(c, 3620, 720, t);
    c.beginPath(); c.rect(3600, b - 950, 760, 50); fs(c, '#3a2418', 3); for (let i = 0; i < 6; i++) { const lx = 3680 + i * 120; line(c, [lx, b - 900, lx, b - 760], 2, '#2a1a12'); c.beginPath(); c.moveTo(lx - 22, b - 760); c.lineTo(lx + 22, b - 760); c.lineTo(lx + 14, b - 790); c.lineTo(lx - 14, b - 790); c.closePath(); fs(c, '#c9a24a', 2); if (!night) bloom(c, lx, b - 750, 80, '255,200,120', .45); }
    // a wall clock (used in night shots)
    circle(c, -3250, b - 980, 46); fs(c, '#f4efe4', 4); line(c, [-3250, b - 980, -3250 + Math.cos(t * .05 - 1.6) * 26, b - 980 + Math.sin(t * .05 - 1.6) * 26], 5); line(c, [-3250, b - 980, -3250 + Math.cos(t * 1.0472 - 1.57) * 36, b - 980 + Math.sin(t * 1.0472 - 1.57) * 36], 2, '#b02a2a');
  });
  haze(c, night ? '30,40,90' : '255,220,170', night ? .18 : .1);
  // world floor: parquet herringbone in perspective (drawn behind everything in the world)
  layer(c, cam, 1, c => {
    const y0 = layerBase(cam, HZ, 1) - 2, vpx = cam.x;
    let g = c.createLinearGradient(0, y0, 0, 900); g.addColorStop(0, night ? '#2a2030' : SAL.floor2); g.addColorStop(1, night ? '#3a2a30' : SAL.floor); c.fillStyle = g; c.fillRect(cam.x - 6000, y0, 12000, 3000);
    for (let i = 0; i < 26; i++) { const yy = y0 + Math.pow(i / 25, 1.7) * 1400; line(c, [cam.x - 6000, yy, cam.x + 6000, yy], 1.6, night ? 'rgba(0,0,0,.35)' : 'rgba(60,30,10,.28)'); }
    for (let i = -60; i <= 60; i++) { const x0 = Math.round(cam.x / 70) * 70 + i * 70; line(c, [x0, y0, x0 + (x0 - vpx) * 3.2, y0 + 1400], 1.2, night ? 'rgba(0,0,0,.25)' : 'rgba(60,30,10,.18)'); }
    // a runner rug
    c.beginPath(); c.moveTo(cam.x - 6000, 60); c.lineTo(cam.x + 6000, 60); c.lineTo(cam.x + 6000, 260); c.lineTo(cam.x - 6000, 260); c.closePath(); c.fillStyle = night ? 'rgba(70,20,40,.5)' : 'rgba(120,30,40,.55)'; c.fill();
    line(c, [cam.x - 6000, 72, cam.x + 6000, 72], 4, night ? 'rgba(160,130,60,.4)' : 'rgba(220,180,90,.7)'); line(c, [cam.x - 6000, 248, cam.x + 6000, 248], 4, night ? 'rgba(160,130,60,.4)' : 'rgba(220,180,90,.7)');
  });
  // midground: back row of tables and chairs + plants
  const pm = .86, bm = layerBase(cam, o.midY ?? (HZ + 120), pm);
  layer(c, cam, pm, c => {
    c.save(); c.translate(0, bm); c.scale(SAL.MS, SAL.MS);
    for (let i = -6; i <= 6; i++) chandelier(c, i * 640 + 480, -700, .95, t + i, !night);
    for (let i = -6; i <= 6; i++) { const tx = i * 640 + 160; chairBack(c, tx - 90, { s: .9 }); chairBack(c, tx + 90, { s: .9 }); dineTable(c, tx, { w: 330, seed: i + 20, items: (c, ty) => tableDressing(c, 330, ty, t, { seed: i, lit: !night || o.candles, glint: night ? 0 : .3 }) }); if (o.midGuests) o.midGuests(c, tx, i); }
    for (const px of [-2900, -1580, 1720, 3060]) bigPlant(c, px, 40, .9, t);
    c.restore();
  });
  // second row (closer), with gaps so the main action stays readable
  if (o.row2 !== false) { const p2 = .94, b2 = layerBase(cam, o.row2Y ?? -70, p2);
    layer(c, cam, p2, c => { c.save(); c.translate(0, b2); c.scale(.92, .92);
      for (const tx of o.row2X || [-2350, -1450, 1350, 2250]) { chairBack(c, tx - 95); chairBack(c, tx + 95); dineTable(c, tx, { w: 340, seed: tx, items: (c, ty) => tableDressing(c, 340, ty, t, { seed: tx, lit: !night || o.candles, glint: night ? 0 : .4 }) }); if (o.row2Guests) o.row2Guests(c, tx); }
      for (const px of o.row2Plants || [-1900, 1800]) bigPlant(c, px, 30, .75, t);
      c.restore(); }); }
  return { base: night ? '#141626' : SAL.wall, tint: night ? 'rgba(20,30,80,.22)' : null };
}
// beams of light through the windows onto the floor (screen list)
function salonLight(c, cam, t, o = {}) {
  const tod = o.tod || 'golden', night = tod === 'night', pw = .72, bw = layerBase(cam, o.hz ?? SAL.HZ, pw), WS = SAL.WS;
  const col = night ? '150,175,255' : (tod === 'evening' ? '255,180,120' : '255,214,150'), a = o.alpha ?? (night ? .16 : .22);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'screen';
  for (const wx of SAL.windows) {
    const ww = 300 * WS, wh = 640 * WS, wy = bw + (-260 - 640 - 40) * WS, wxs = wx * WS;
    const [ax, ay] = toScreen(cam, pw, wxs - ww / 2, wy), [bx, by] = toScreen(cam, pw, wxs + ww / 2, wy + wh);
    // floor patch in world space (shifted along the light direction)
    const shift = night ? 180 : 520, fx0 = wxs + shift - 180, fx1 = fx0 + 300;
    const [p0x, p0y] = toScreen(cam, 1, fx0, 40), [p1x, p1y] = toScreen(cam, 1, fx1, 40), [p2x, p2y] = toScreen(cam, 1, fx1 + 260, 360), [p3x, p3y] = toScreen(cam, 1, fx0 + 260, 360);
    const g = c.createLinearGradient(ax, ay, p0x, p2y); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},${a * .25})`);
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, ay); c.lineTo(p2x, p2y); c.lineTo(p3x, p3y); c.closePath(); c.fillStyle = g; c.fill();
    // projected window panes on the floor
    c.save(); c.beginPath(); c.moveTo(p0x, p0y); c.lineTo(p1x, p1y); c.lineTo(p2x, p2y); c.lineTo(p3x, p3y); c.closePath(); c.clip();
    c.fillStyle = `rgba(${col},${a * 1.6})`; c.fill();
    c.globalCompositeOperation = 'multiply'; c.fillStyle = night ? 'rgba(20,20,40,.9)' : 'rgba(110,70,40,.7)';
    for (let k = 1; k < 4; k++) { const q = k / 4, lx0 = p0x + (p3x - p0x) * q, ly0 = p0y + (p3y - p0y) * q, lx1 = p1x + (p2x - p1x) * q, ly1 = p1y + (p2y - p1y) * q; c.beginPath(); c.moveTo(lx0, ly0 - 5); c.lineTo(lx1, ly1 - 5); c.lineTo(lx1, ly1 + 5); c.lineTo(lx0, ly0 + 5); c.fill(); }
    const mx0 = (p0x + p1x) / 2, my0 = (p0y + p1y) / 2, mx1 = (p3x + p2x) / 2, my1 = (p3y + p2y) / 2; c.beginPath(); c.moveTo(mx0 - 6, my0); c.lineTo(mx0 + 6, my0); c.lineTo(mx1 + 8, my1); c.lineTo(mx1 - 8, my1); c.fill();
    c.restore();
  }
  c.restore();
  // dust motes in the beams (screen space)
  if (!o.noMotes) { const [sx] = toScreen(cam, pw, SAL.windows[1], 0); motes(c, 0, W, 60, H - 60, t, { n: night ? 30 : 70, speed: .02, alpha: night ? .35 : .6, color: night ? '200,215,255' : '255,240,200' }); }
  grade(c, night ? { sx: .25, sy: .1, warm: '120,150,255', warmA: .18, cool: '10,10,40', coolA: .45 } : { sx: .15, sy: .15, warm: '255,180,90', warmA: .3, cool: '60,30,80', coolA: .22 });
}

function tableLamp(c, x, y, t, lit = true, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.ellipse(0, 0, 22, 6, 0, 0, Math.PI * 2); fs(c, '#b8923a', 2); line(c, [0, 0, 0, -58], 5, '#8a6a24');
  c.beginPath(); c.moveTo(-34, -56); c.lineTo(34, -56); c.lineTo(22, -96); c.lineTo(-22, -96); c.closePath(); fs(c, lit ? '#ffe7b0' : '#d8c8a8', 2.5);
  if (lit) { c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(-14, -90, 6, 30); bloom(c, 0, -60, 260, '255,190,100', .55); bloom(c, 0, -40, 90, '255,235,180', .7); c.beginPath(); c.ellipse(0, -54, 30, 6, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(255,240,200,.9)'; c.fill(); }
  c.restore();
}
