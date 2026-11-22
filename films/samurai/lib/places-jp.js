// Japanese places and props for the samurai film (world = screen units when cam = { x: 960, y: 540, z: 1 }).
const JP = {
  wood: '#6b4a30', woodD: '#3f2a1a', woodL: '#8f6a46', roof: '#24252b', roofL: '#3d3f48', plaster: '#ece6d8', stone: '#8d8a84', stoneD: '#5f5c57',
  tatami: '#b9ab76', tatamiD: '#9b8e5d', tatamiEdge: '#22201c', washi: '#efe6d0', moss: '#5f7a43', mossD: '#3f5530', maple: '#b8442e',
  night: '#16203a', dawn: '#41526f',
};
function skyGrad(c, stops, y0 = 0, y1 = H) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = vgrad(c, 0, y0, 0, y1, stops); c.fillRect(0, 0, W, H); c.restore(); }
function moonDisc(c, x, y, r, a = 1, col = '250,246,228') {
  bloom(c, x, y, r * 7, '200,215,255', .35 * a);
  circ(c, x, y, r); c.fillStyle = `rgba(${col},${a})`; c.fill();
  c.save(); c.globalAlpha = .12 * a; for (const [dx, dy, rr] of [[-.3, -.2, .25], [.25, .1, .18], [-.05, .35, .14]]) { circ(c, x + dx * r, y + dy * r, rr * r); c.fillStyle = '#8f8a7a'; c.fill(); } c.restore();
}
function stars(c, n, t, a = .8, ymax = H * .55) { for (let i = 0; i < n; i++) { const x = rnd(i + 11) * W, y = rnd(i + 23) * ymax, tw = .5 + .5 * Math.sin(t * 2 + i); circ(c, x, y, 1 + rnd(i + 5) * 1.6); c.fillStyle = `rgba(230,235,255,${a * tw * rnd(i + 7)})`; c.fill(); } }
// a mountain ridge across x0..x1 with base at y
function ridge(c, x0, x1, y, amp, col, seed = 1, o = {}) {
  c.beginPath(); c.moveTo(x0, y + 2000); c.lineTo(x0, y);
  const n = o.n || 40;
  for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n), u = i / n * (o.freq || 6);
    const h = (Math.sin(u + seed) * .5 + Math.sin(u * 2.3 + seed * 2) * .28 + Math.sin(u * 5.1 + seed * 3) * .12 + .5) * amp; c.lineTo(x, y - Math.max(0, h)); }
  c.lineTo(x1, y + 2000); c.closePath(); c.fillStyle = col; c.fill();
  if (o.snow) { c.save(); c.clip(); c.fillStyle = 'rgba(245,248,255,.85)'; c.fillRect(x0, y - amp * 1.2, x1 - x0, amp * .35); c.restore(); }
}
function mistBand2(c, y, h, col, a) { const g = c.createLinearGradient(0, y - h, 0, y + h); g.addColorStop(0, rgba(col, 0)); g.addColorStop(.5, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); c.fillStyle = g; c.fillRect(-4000, y - h, 12000, h * 2); }
// drifting mist blobs
function mistBlobs(c, x0, x1, y, t, o = {}) {
  const n = o.n || 14, col = o.col || '220,225,230';
  for (let i = 0; i < n; i++) { const x = x0 + ((rnd(i + 3) * (x1 - x0) + t * (o.speed || 20) * (.5 + rnd(i))) % (x1 - x0)), yy = y + (rnd(i + 5) - .5) * (o.h || 120), r = (o.r || 260) * (.6 + rnd(i + 9) * .8);
    const g = c.createRadialGradient(x, yy, 0, x, yy, r); g.addColorStop(0, rgba(col, o.a || .35)); g.addColorStop(1, rgba(col, 0)); c.fillStyle = g; c.fillRect(x - r, yy - r, r * 2, r * 2); }
}

// ---------------------------------------------------------------- architecture
// curved tile roof (irimoya-ish), centred at x, eave line at y, width w
function tileRoof(c, x, y, w, h, o = {}) {
  const col = o.col || JP.roof, lw = o.lw ?? 3, curl = o.curl ?? .16;
  c.beginPath(); c.moveTo(x - w / 2 - w * .05, y - h * curl);
  c.quadraticCurveTo(x - w * .38, y + h * .05, x - w * .3, y); c.lineTo(x + w * .3, y); c.quadraticCurveTo(x + w * .38, y + h * .05, x + w / 2 + w * .05, y - h * curl);
  c.quadraticCurveTo(x + w * .3, y - h * .55, x + w * .2, y - h); c.lineTo(x - w * .2, y - h); c.quadraticCurveTo(x - w * .3, y - h * .55, x - w / 2 - w * .05, y - h * curl); c.closePath();
  fo(c, col, lw, o.ink || OUT);
  if (o.tiles !== false) { c.save(); c.clip(); for (let i = -30; i <= 30; i++) { const xx = x + i * w / 40; stroke(c, [xx, y + 5, x + i * w / 40 * .45, y - h], 2, o.tileCol || 'rgba(120,125,140,.35)'); } c.restore(); }
  // ridge
  c.beginPath(); c.rect(x - w * .22, y - h - 10, w * .44, 14); fo(c, o.ridge || '#16171b', lw * .7, o.ink || OUT);
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * w * .22, y - h - 10); c.quadraticCurveTo(x + s * w * .26, y - h - 26, x + s * w * .24, y - h - 36); c.lineWidth = 8; c.strokeStyle = o.ridge || '#16171b'; c.stroke(); }
}
// generic castle keep (not a copy of a real castle): stone base, white plastered tiers, black curved roofs
function castle(c, x, y, s = 1, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const lw = o.lw ?? 3, ink = o.ink || OUT, sil = o.sil;
  // sloped stone base
  c.beginPath(); c.moveTo(-330, 0); c.quadraticCurveTo(-300, -120, -250, -200); c.lineTo(250, -200); c.quadraticCurveTo(300, -120, 330, 0); c.closePath(); fo(c, sil || JP.stone, lw, ink);
  if (!sil) { c.save(); c.clip(); for (let r = 0; r < 9; r++) for (let i = 0; i < 16; i++) { c.beginPath(); c.rect(-340 + i * 44 + (r % 2) * 22, -200 + r * 23, 42, 22); c.lineWidth = 1.5; c.strokeStyle = JP.stoneD; c.stroke(); } c.restore(); }
  const tiers = [[-200, 230, 120], [-330, 190, 110], [-450, 150, 100], [-560, 110, 90]];
  tiers.forEach(([ty, hw, th], i) => {
    c.beginPath(); c.rect(-hw, ty - th + 20, hw * 2, th); fo(c, sil || JP.plaster, lw, ink);
    if (!sil) { for (let k = -2; k <= 2; k++) { c.beginPath(); c.rect(k * hw * .35 - 12, ty - th * .6, 24, 30); fo(c, '#2a2622', 1.5, ink); } c.fillStyle = 'rgba(0,0,0,.1)'; c.fillRect(-hw, ty - 26, hw * 2, 6); }
    tileRoof(c, 0, ty - th + 24, hw * 2.5, 70, { col: sil || JP.roof, lw, ink, tiles: !sil, ridge: sil || '#16171b' });
    if (i === 1 && !sil) { tileRoof(c, -hw * .1, ty - th + 2, hw * .9, 60, { lw, ink, tiles: false }); }
  });
  // gold roof-ridge ornaments
  if (!sil) for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 30, -660); c.quadraticCurveTo(sx * 60, -720, sx * 40, -740); c.lineWidth = 9; c.strokeStyle = '#c9a24a'; c.stroke(); }
  c.restore();
}
// shoji wall panel row; light: 0..1 glow behind the paper
function shojiWall(c, x0, y0, w, h, o = {}) {
  const cols = o.cols || 4, rows = o.rows || 6, fr = o.frame || JP.woodD, paper = o.paper || JP.washi;
  c.fillStyle = paper; c.fillRect(x0, y0, w, h);
  if (o.glow) { const g = c.createLinearGradient(x0, y0, x0, y0 + h); g.addColorStop(0, rgba(o.glowCol || '255,210,140', o.glow)); g.addColorStop(1, rgba(o.glowCol || '255,210,140', o.glow * .4)); c.fillStyle = g; c.fillRect(x0, y0, w, h); }
  if (o.dark) { c.fillStyle = `rgba(20,25,45,${o.dark})`; c.fillRect(x0, y0, w, h); }
  c.fillStyle = fr; const panels = o.panels || 4, pw = w / panels;
  for (let p = 0; p < panels; p++) {
    const px = x0 + p * pw; c.fillRect(px, y0, 10, h); c.fillRect(px + pw - 10, y0, 10, h);
    for (let i = 1; i < cols; i++) c.fillRect(px + i * pw / cols - 3, y0, 6, h);
    for (let j = 1; j < rows; j++) c.fillRect(px, y0 + j * h / rows - 3, pw, 6);
  }
  c.fillRect(x0, y0, w, 14); c.fillRect(x0, y0 + h - 30, w, 30);
  if (o.shadowOf) o.shadowOf(c);
}
// tatami floor in perspective from above (top-down): mats with dark cloth borders
function tatamiTop(c, x0, y0, cols, rows, mw, mh, o = {}) {
  for (let r = 0; r < rows; r++) for (let i = 0; i < cols; i++) {
    const rot = (r + i) % 2, w = rot ? mh : mw, h = rot ? mw : mh, x = x0 + i * mw, y = y0 + r * mh;
    c.fillStyle = o.col || JP.tatami; c.fillRect(x, y, mw, mh);
    c.save(); c.beginPath(); c.rect(x, y, mw, mh); c.clip();
    for (let k = 0; k < (rot ? mw : mh) / 7; k++) { c.fillStyle = k % 2 ? 'rgba(90,80,40,.12)' : 'rgba(255,250,200,.06)'; rot ? c.fillRect(x + k * 7, y, 3.5, mh) : c.fillRect(x, y + k * 7, mw, 3.5); }
    c.restore();
    c.fillStyle = o.edge || JP.tatamiEdge; if (rot) { c.fillRect(x, y, mw, 10); c.fillRect(x, y + mh - 10, mw, 10); } else { c.fillRect(x, y, 10, mh); c.fillRect(x + mw - 10, y, 10, mh); }
  }
}
// floor in perspective (side view): tatami receding to a horizon line
function tatamiPersp(c, yTop, yBot, o = {}) {
  c.fillStyle = vgrad(c, 0, yTop, 0, yBot, [[0, o.far || '#6d6545'], [1, o.near || JP.tatami]]); c.fillRect(-2000, yTop, 6000, yBot - yTop + 400);
  const cx = o.vx ?? W / 2;
  for (let i = -12; i <= 12; i++) { const xb = cx + i * 260, xt = cx + i * 40; if (i % 2 === 0) stroke(c, [xt, yTop, xb, yBot + 300], 6, o.edge || 'rgba(30,26,20,.8)', 'butt'); }
  for (let j = 1; j < 6; j++) { const yy = yTop + (yBot - yTop) * Math.pow(j / 6, 1.7); stroke(c, [-2000, yy, 6000, yy], 4, 'rgba(30,26,20,.55)', 'butt'); }
}
function stoneLantern(c, x, y, s = 1, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s); const lw = o.lw ?? 3, col = o.col || JP.stone, d = o.dark || JP.stoneD;
  c.beginPath(); c.rect(-40, -30, 80, 30); fo(c, d, lw); c.beginPath(); c.rect(-14, -150, 28, 120); fo(c, col, lw);
  c.beginPath(); c.moveTo(-46, -150); c.lineTo(46, -150); c.lineTo(36, -175); c.lineTo(-36, -175); c.closePath(); fo(c, col, lw);
  c.beginPath(); c.rect(-30, -240, 60, 65); fo(c, col, lw); c.beginPath(); c.rect(-15, -228, 30, 36); fo(c, o.lit ? '#ffcc77' : '#2b2a2a', lw * .6);
  if (o.lit) bloom(c, 0, -210, 120, '255,190,100', .5 * o.lit);
  c.beginPath(); c.moveTo(-70, -240); c.quadraticCurveTo(0, -300, 70, -240); c.lineTo(60, -232); c.lineTo(-60, -232); c.closePath(); fo(c, col, lw);
  ell(c, 0, -290, 12, 16); fo(c, col, lw);
  // moss
  c.fillStyle = JP.moss; for (let i = 0; i < 10; i++) { ell(c, -50 + rnd(i) * 100, -250 + rnd(i + 1) * 14, 10, 5); c.fill(); }
  c.restore();
}
function mapleTree(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s); const lw = o.lw ?? 3;
  c.beginPath(); c.moveTo(-18, 0); c.quadraticCurveTo(-30, -150, 10, -260); c.quadraticCurveTo(60, -330, 140, -360); c.lineTo(146, -346); c.quadraticCurveTo(70, -300, 30, -250); c.quadraticCurveTo(10, -140, 22, 0); c.closePath(); fo(c, o.trunk || '#3a2c24', lw);
  const cols = o.leaves || ['#8e2f23', '#b8442e', '#d0623a', '#6f241c'];
  for (let i = 0; i < 70; i++) { const a = rnd(i + 31) * Math.PI * 2, r = rnd(i + 37) * 1, lx = 80 + Math.cos(a) * 190 * r + Math.sin(t * .8 + i) * 3, ly = -360 + Math.sin(a) * 110 * r; ell(c, lx, ly, 36 + rnd(i) * 24, 24 + rnd(i + 2) * 14); c.fillStyle = cols[i % cols.length]; c.fill(); }
  c.restore();
}
function pineTree(c, x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s); const lw = o.lw ?? 3;
  c.beginPath(); c.moveTo(-14, 0); c.bezierCurveTo(-40, -120, 40, -200, -20, -330); c.lineTo(-4, -334); c.bezierCurveTo(60, -200, -14, -120, 16, 0); c.closePath(); fo(c, o.trunk || '#3d2e25', lw);
  for (const [px, py, w] of [[-60, -330, 150], [60, -260, 170], [-40, -190, 130], [40, -400, 110]]) { c.beginPath(); c.ellipse(px, py, w, 32, 0, Math.PI, 0); c.closePath(); fo(c, o.col || '#2f4a33', lw); }
  c.restore();
}
// nobori: tall narrow war banner on an L-shaped pole
function nobori(c, x, y, h, o = {}) {
  const w = o.w || h * .18, t = o.t || 0, lw = o.lw ?? 2, ink = o.ink || OUT;
  stroke(c, [x, y, x, y - h], o.pole || 6, o.poleCol || '#2a2018');
  stroke(c, [x, y - h + 4, x + w, y - h + 4], (o.pole || 6) * .8, o.poleCol || '#2a2018');
  c.beginPath(); c.moveTo(x + 2, y - h + 6);
  for (let i = 0; i <= 8; i++) c.lineTo(x + 2 + Math.sin(t * 3 + i * .6 + (o.seed || 0)) * w * .06 * i / 8, y - h + 6 + i * h * .8 / 8);
  for (let i = 8; i >= 0; i--) c.lineTo(x + w + Math.sin(t * 3 + i * .6 + (o.seed || 0)) * w * .06 * i / 8, y - h + 6 + i * h * .8 / 8);
  c.closePath(); fo(c, o.col || '#f1ece0', lw, ink);
  if (o.mon) { c.save(); c.beginPath(); c.rect(x, y - h, w + 10, h); c.clip(); o.mon(c, x + w / 2 + 1, y - h + h * .2, w * .3); c.restore(); }
  if (o.band) { c.fillStyle = o.band; c.fillRect(x + 2, y - h + h * .6, w - 2, h * .06); }
}
// tiny generic soldier silhouette (for armies), facing s
function tinySoldier(c, x, y, h, s = 1, col = '#1d1b1f', o = {}) {
  c.save(); c.translate(x, y); c.scale(s * h / 100, h / 100); c.fillStyle = col;
  c.beginPath(); c.moveTo(-14, 0); c.lineTo(-10, -45); c.lineTo(-18, -78); c.lineTo(18, -78); c.lineTo(12, -45); c.lineTo(16, 0); c.closePath(); c.fill();
  circ(c, 0, -90, 13); c.fill();
  if (o.helmet) { c.beginPath(); c.moveTo(-22, -92); c.lineTo(0, -116); c.lineTo(22, -92); c.closePath(); c.fill(); }
  if (o.spear) { c.fillRect(14, -150, 3, 150); poly(c, [12, -150, 15.5, -166, 19, -150]); c.fill(); }
  if (o.flag) { c.fillRect(-4, -170, 3, 80); c.fillStyle = o.flag; c.fillRect(-2, -168, 20, 52); }
  c.restore();
}
// rice terraces / flooded paddies reflecting the sky
function paddies(c, y0, y1, skyCol, o = {}) {
  const rows = o.rows || 7;
  for (let r = 0; r < rows; r++) {
    const ya = lerp(y0, y1, Math.pow(r / rows, 1.6)), yb = lerp(y0, y1, Math.pow((r + 1) / rows, 1.6));
    c.fillStyle = vgrad(c, 0, ya, 0, yb, [[0, skyCol[0]], [1, skyCol[1]]]); c.fillRect(-3000, ya, 9000, yb - ya);
    stroke(c, [-3000, yb, 9000, yb + (r % 2 ? 6 : -4)], 3 + r * 1.5, o.dike || '#4a5a34', 'butt');
    if (o.sprouts) for (let i = 0; i < 40; i++) { const x = -200 + i * 60 + (r % 2) * 30, yy = lerp(ya, yb, .5); stroke(c, [x, yy, x - 4, yy - 6 - r], 1 + r * .4, 'rgba(90,130,60,.7)'); }
  }
}
function crane(c, x, y, s, t) { // flying crane silhouette
  c.save(); c.translate(x, y); c.scale(s, s); const f = Math.sin(t * 5);
  c.fillStyle = '#f2f0ea'; c.strokeStyle = '#1d1715'; c.lineWidth = 3;
  ell(c, 0, 0, 40, 9); c.fill(); c.stroke();
  stroke(c, [36, -2, 78, -10], 4, '#1d1715'); stroke(c, [-38, 0, -80, 6], 3, '#1d1715');
  c.beginPath(); c.moveTo(-10, -2); c.quadraticCurveTo(0, -40 * f - 10, 30 * f, -70 * f); c.lineTo(20, -2); c.closePath(); c.fillStyle = '#f2f0ea'; c.fill(); c.stroke();
  circ(c, 76, -10, 3); c.fillStyle = '#c0392b'; c.fill();
  c.restore();
}
function crow(c, x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); const f = Math.sin(t * 9) * 18; c.fillStyle = '#111'; c.beginPath(); c.moveTo(-26, 0); c.quadraticCurveTo(-12, -f, 0, 0); c.quadraticCurveTo(12, -f, 26, 0); c.quadraticCurveTo(0, 6, -26, 0); c.fill(); c.restore(); }
// futon seen from above
function futonTop(c, x, y, w, h, o = {}) {
  c.save(); c.translate(x, y);
  c.beginPath(); c.roundRect(-w / 2 - 20, -h / 2 - 16, w + 40, h + 32, 30); fo(c, o.under || '#d9d1c0', 4);
  c.beginPath(); c.roundRect(-w / 2, -h / 2 + h * .26, w, h * .74, 40); fo(c, o.cover || '#2f3a5c', 4);
  c.save(); c.clip(); for (let i = 0; i < 8; i++) { stroke(c, [-w / 2, -h / 2 + h * .3 + i * h * .1, w / 2, -h / 2 + h * .32 + i * h * .1], 2, 'rgba(255,255,255,.07)'); }
  for (let i = 0; i < 10; i++) drawKamon(c, -w / 2 + 70 + (i % 3) * w / 3, -h / 2 + h * .4 + Math.floor(i / 3) * h * .2, 20, 'rgba(230,226,215,.25)'); c.restore();
  // pillow (buckwheat roll)
  c.beginPath(); c.roundRect(-110, -h / 2 + 10, 220, 90, 40); fo(c, o.pillow || '#c9b48c', 4);
  c.restore();
}
// katana-kake: two-tier lacquered sword stand (side view), swords resting with hilts to the left
function swordRack(c, x, y, s = 1, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s); const lw = o.lw ?? 4;
  for (const sx of [-260, 260]) { c.beginPath(); c.moveTo(sx - 70, 0); c.lineTo(sx + 70, 0); c.lineTo(sx + 50, -24); c.lineTo(sx + 20, -24); c.lineTo(sx + 26, -230); c.quadraticCurveTo(sx, -260, sx - 26, -230); c.lineTo(sx - 20, -24); c.lineTo(sx - 50, -24); c.closePath(); fo(c, SAM.lacquer, lw);
    stroke(c, [sx - 14, -40, sx - 12, -220], 3, 'rgba(200,210,230,.35)');
    for (const hy of [-110, -200]) { c.beginPath(); c.moveTo(sx - 34, hy); c.lineTo(sx + 34, hy); c.lineTo(sx + 34, hy + 18); c.lineTo(sx - 34, hy + 18); c.closePath(); fo(c, SAM.lacquer, lw * .7); } }
  if (o.swords !== false) {
    c.save(); c.translate(-420, -218); drawSword(c, { kind: 'katana', gleam: o.gleam }); c.restore();
    c.save(); c.translate(-300, -128); drawSword(c, { kind: 'waki', gleam: o.gleam2 }); c.restore();
  }
  c.restore();
}
