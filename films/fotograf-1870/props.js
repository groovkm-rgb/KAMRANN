'use strict';
// ===== props (world units; 1 m ≈ 220) =====
const WOOD = { d: '#5a341c', m: '#7f4c28', l: '#a56a38', hi: '#c98b4e' }, BRASS = { d: '#9a7430', m: '#c99a45', l: '#efcf7a' }, IRON = { d: '#26262b', m: '#3d3d45', l: '#6a6a76' };
const VELVET = { d: '#5b1420', m: '#8a2230', l: '#b2404c' };
// ---------------- big bellows camera on a wooden tripod; lens points +x ----------------
function tripod(c, x, y, h = 205) {
  for (const [fx, w] of [[-78, 9], [70, 9], [8, 8]]) { c.beginPath(); c.moveTo(x - 6, y - h); c.lineTo(x + 6, y - h); c.lineTo(x + fx + w / 2, y + (fx === 8 ? 12 : 0)); c.lineTo(x + fx - w / 2, y + (fx === 8 ? 12 : 0)); c.closePath(); ff(c, fx === 8 ? WOOD.d : WOOD.m, PW * .8); }
  c.beginPath(); c.roundRect(x - 26, y - h - 12, 52, 18, 4); ff(c, WOOD.d, PW * .8);
  c.beginPath(); c.roundRect(x - 8, y - h * .55, 16, 12, 3); ff(c, BRASS.m, PW * .6);
}
function bigCamera(c, x, y, o = {}) {
  const ay = y - 268, t = o.t || 0;
  if (o.tripod !== false) tripod(c, x, y, 205);
  // rear standard (ground glass) box
  c.beginPath(); c.roundRect(x - 112, ay - 62, 62, 124, 5); ff(c, WOOD.m); c.beginPath(); c.roundRect(x - 104, ay - 54, 46, 108, 3); ff(c, WOOD.l, PW * .6);
  for (const [cx, cy] of [[-110, -60], [-52, -60], [-110, 60], [-52, 60]]) { c.beginPath(); c.arc(x + cx, ay + cy, 5, 0, 7); ff(c, BRASS.m, 1.2); }
  // bellows (accordion)
  const b0 = x - 50, b1 = x + 62, n = 9;
  c.beginPath(); c.moveTo(b0, ay - 56); c.lineTo(b1, ay - 46); c.lineTo(b1, ay + 46); c.lineTo(b0, ay + 56); c.closePath(); ff(c, '#5e1f1c');
  for (let i = 1; i < n; i++) { const xx = b0 + (b1 - b0) * i / n, hh = 56 - 10 * i / n; ln(c, [xx, ay - hh, xx + 5, ay, xx, ay + hh], 2.2, i % 2 ? '#3a1210' : '#8a3a33'); }
  // base rail
  c.beginPath(); c.roundRect(x - 118, ay + 58, 222, 14, 3); ff(c, WOOD.d); for (let i = 0; i < 12; i++) ln(c, [x - 110 + i * 18, ay + 60, x - 104 + i * 18, ay + 70], 1.4, BRASS.d);
  // front standard + lens
  c.beginPath(); c.roundRect(x + 60, ay - 64, 22, 128, 4); ff(c, WOOD.m);
  c.beginPath(); c.roundRect(x + 80, ay - 27, 44, 54, 6); ff(c, BRASS.m); c.beginPath(); c.roundRect(x + 84, ay - 22, 36, 6, 2); c.fillStyle = BRASS.l; c.fill();
  c.beginPath(); c.roundRect(x + 120, ay - 30, 12, 60, 4); ff(c, BRASS.d);
  c.beginPath(); c.ellipse(x + 133, ay, 6, 26, 0, 0, 7); ff(c, '#1b2a36', 2); c.beginPath(); c.ellipse(x + 134, ay - 8, 2.5, 8, 0, 0, 7); c.fillStyle = 'rgba(200,230,255,.8)'; c.fill();
  // lens cap: on (0) → lifted away in the hand (1)
  const cap = o.cap || 0;
  if (cap < .02) { c.beginPath(); c.roundRect(x + 128, ay - 30, 14, 60, 5); ff(c, '#2a2226'); c.beginPath(); c.roundRect(x + 131, ay - 26, 8, 52, 3); c.fillStyle = '#4a3c40'; c.fill(); }
  if (o.capAt) { const [cx, cy] = o.capAt; c.beginPath(); c.roundRect(cx - 7, cy - 30, 14, 60, 5); ff(c, '#2a2226'); }
  // brass plate
  c.beginPath(); c.roundRect(x - 100, ay + 22, 34, 12, 2); ff(c, BRASS.l, 1.2);
  // bulb release hanging (tube from lens)
  if (o.bulb !== false) {
    const [bx, by] = o.bulbAt || [x + 150, y - 150], sq = o.squeeze || 0;
    c.beginPath(); c.moveTo(x + 104, ay + 27); c.bezierCurveTo(x + 112, ay + 90, bx + 30, by - 60, bx, by - 14); c.lineWidth = 4; c.strokeStyle = '#2b2321'; c.stroke();
    c.beginPath(); c.ellipse(bx, by, 13 * (1 + sq * .25), 17 * (1 - sq * .35), 0, 0, 7); ff(c, '#4a2620', PW * .8); c.beginPath(); c.ellipse(bx - 4, by - 5, 3, 5, 0, 0, 7); c.fillStyle = 'rgba(255,200,180,.4)'; c.fill();
  }
}
// black focusing cloth on the camera back; lift 0 = draped, 1 = thrown up; bulge = someone under it; side x0
function cameraCloth(c, x, y, o = {}) {
  const ay = y - 268, t = o.t || 0, bul = o.bulge || 0, w = Math.sin(t * 2.2) * 4;
  c.beginPath(); c.moveTo(x - 40, ay - 64);
  c.bezierCurveTo(x - 60, ay - 90 - bul * 30, x - 150 - bul * 20, ay - 80 - bul * 50, x - 175 - bul * 10, ay - 10 - bul * 30 + w);
  c.quadraticCurveTo(x - 190, ay + 80, x - 170 + w, ay + 150 + bul * 40);
  for (let i = 0; i < 5; i++) c.quadraticCurveTo(x - 160 + i * 22 + 8, ay + 168 + bul * 40 + (i % 2) * 10, x - 148 + i * 22, ay + 150 + bul * 40 + Math.sin(t * 4 + i) * 4);
  c.quadraticCurveTo(x - 60, ay + 40, x - 40, ay + 60); c.closePath();
  const g = c.createLinearGradient(x - 180, ay - 80, x - 40, ay + 160); g.addColorStop(0, '#3a3040'); g.addColorStop(.5, '#1a1520'); g.addColorStop(1, '#100c14'); ff(c, g);
  c.save(); c.clip(); for (let i = 0; i < 4; i++) ln(c, [x - 150 + i * 28, ay - 40, x - 160 + i * 30 + w, ay + 160], 5, 'rgba(160,140,180,.22)'); c.restore();
}
// a cloth flying through the air: from points a (in hand) spreading as a sheet
function flyingCloth(c, pts, t) {
  smoothPath(c, pts); const g = c.createLinearGradient(pts[0][0], pts[0][1], pts[pts.length >> 1][0], pts[pts.length >> 1][1]); g.addColorStop(0, '#3a3046'); g.addColorStop(1, '#130f18'); ff(c, g, PW * 1.2);
  c.save(); smoothPath(c, pts); c.clip(); for (let i = 0; i < 6; i++) { const a = pts[i % pts.length], b = pts[(i + (pts.length >> 1)) % pts.length]; ln(c, [a[0], a[1], (a[0] + b[0]) / 2 + Math.sin(t * 5 + i) * 10, (a[1] + b[1]) / 2, b[0], b[1]], 6, 'rgba(170,150,195,.22)'); } c.restore();
}
// ---------------- the iron head rest ("Kopfhalter") ----------------
// headY = world y of the clamp centre; open 0 (closed) .. 1 (open)
function headStand(c, x, y, o = {}) {
  const hy = o.headY ?? y - 275, open = o.open ?? 1, half = o.half ?? 62, glow = o.glow || 0;
  // three curly cast-iron feet on casters
  for (const s of [-1, 1, 0]) { c.beginPath(); c.moveTo(x, y - 40); c.bezierCurveTo(x + s * 20, y - 10, x + s * 50, y - 30, x + s * (s ? 62 : 0) + (s ? 0 : 14), y - 6); c.lineWidth = 9; c.strokeStyle = IRON.d; c.lineCap = 'round'; c.stroke(); c.lineWidth = 3; c.strokeStyle = IRON.l; c.stroke();
    c.beginPath(); c.arc(x + s * (s ? 62 : 0) + (s ? 0 : 14), y - 2, 6, 0, 7); ff(c, BRASS.m, 1.6); }
  // column (two telescopic parts)
  c.beginPath(); c.roundRect(x - 7, y - 160, 14, 125, 3); ff(c, IRON.m, PW * .8); ln(c, [x - 2, y - 155, x - 2, y - 40], 2, IRON.l);
  c.beginPath(); c.roundRect(x - 4.5, hy + 4, 9, y - 160 - hy, 2); ff(c, IRON.d, PW * .7); ln(c, [x - 1, hy + 8, x - 1, y - 162], 1.6, IRON.l);
  c.beginPath(); c.roundRect(x - 11, y - 166, 22, 12, 3); ff(c, BRASS.m, 1.6); c.beginPath(); c.arc(x + 15, y - 160, 6, 0, 7); ff(c, BRASS.l, 1.4);
  // brass name plate
  if (o.plate !== false) {
    const py = y - 112; c.beginPath(); c.roundRect(x - 30, py - 8, 60, 16, 2.5); const g = c.createLinearGradient(x - 30, py - 8, x + 30, py + 8); g.addColorStop(0, BRASS.d); g.addColorStop(.5, BRASS.l); g.addColorStop(1, BRASS.m); ff(c, g, 1.4);
    serif(c, 'Kopfhalter', x, py + .5, 7.8, '#3b2a12');
    if (o.glint) { const gx = x - 30 + 60 * clamp(o.glint); c.save(); c.beginPath(); c.roundRect(x - 30, py - 8, 60, 16, 2.5); c.clip(); c.fillStyle = 'rgba(255,255,240,.85)'; c.beginPath(); c.moveTo(gx - 4, py - 9); c.lineTo(gx + 6, py - 9); c.lineTo(gx - 2, py + 9); c.lineTo(gx - 12, py + 9); c.fill(); c.restore(); sparkle(c, gx, py - 6, 9 * Math.sin(clamp(o.glint) * Math.PI), Math.sin(clamp(o.glint) * Math.PI)); }
  }
  if (o.back !== false) headClampBack(c, x, hy, o);
  if (o.front) headClampFront(c, x, hy, o);
  if (glow) bloom(c, x, hy, 90, '255,230,160', .5 * glow);
}
function headClampBack(c, x, hy, o = {}) {
  const half = o.half ?? 62;
  c.beginPath(); c.roundRect(x - half - 4, hy - 4, (half + 4) * 2, 9, 3); ff(c, IRON.m, PW * .7);
  c.beginPath(); c.arc(x, hy, 8, 0, 7); ff(c, BRASS.m, 1.6);
}
function headClampFront(c, x, hy, o = {}) { // the two forks (drawn over the head)
  const half = o.half ?? 62, open = o.open ?? 0;
  for (const s of [-1, 1]) {
    const px = x + s * half, ang = s * open * .7;
    c.save(); c.translate(px, hy); c.rotate(ang);
    ln(c, [0, 0, 0, -6, -s * 4, -20], 7, IRON.d); ln(c, [0, 0, 0, -6, -s * 4, -20], 2.5, IRON.l);
    c.beginPath(); c.ellipse(-s * 6, -26, 7, 12, 0, 0, 7); ff(c, '#6b3c22', 2);
    c.restore();
  }
}
// ---------------- ornate armchair (front view). part: 'back' | 'front' ----------------
function armchair(c, x, y, part = 'back') {
  if (part === 'back') {
    c.beginPath(); c.moveTo(x - 92, y - 70); c.lineTo(x - 98, y - 300); c.quadraticCurveTo(x - 100, y - 360, x - 50, y - 372); c.quadraticCurveTo(x, y - 400, x + 50, y - 372); c.quadraticCurveTo(x + 100, y - 360, x + 98, y - 300); c.lineTo(x + 92, y - 70); c.closePath(); ff(c, WOOD.m);
    c.beginPath(); c.moveTo(x - 78, y - 80); c.lineTo(x - 82, y - 300); c.quadraticCurveTo(x - 80, y - 345, x - 40, y - 352); c.quadraticCurveTo(x, y - 378, x + 40, y - 352); c.quadraticCurveTo(x + 80, y - 345, x + 82, y - 300); c.lineTo(x + 78, y - 80); c.closePath(); ff(c, VELVET.m, PW * .7);
    c.save(); c.clip(); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const bx = x - 50 + j * 50 + (i % 2) * 25 - 12, by = y - 320 + i * 60; c.beginPath(); c.arc(bx, by, 4, 0, 7); c.fillStyle = VELVET.d; c.fill(); ln(c, [bx, by, bx + 25, by + 30], 1.5, VELVET.d); ln(c, [bx, by, bx - 25, by + 30], 1.5, VELVET.d); }
    c.beginPath(); c.ellipse(x - 40, y - 300, 22, 60, 0, 0, 7); c.fillStyle = 'rgba(255,170,170,.15)'; c.fill(); c.restore();
    // carved crest
    c.beginPath(); c.moveTo(x - 30, y - 382); c.quadraticCurveTo(x, y - 430, x + 30, y - 382); ff(c, BRASS.m, PW * .7); c.beginPath(); c.arc(x, y - 402, 9, 0, 7); ff(c, BRASS.l, 1.5);
    // seat cushion + legs
    c.beginPath(); c.roundRect(x - 100, y - 98, 200, 40, 12); ff(c, VELVET.m); c.beginPath(); c.roundRect(x - 104, y - 62, 208, 18, 4); ff(c, WOOD.m);
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * 96, y - 46); c.lineTo(x + s * 84, y - 46); c.quadraticCurveTo(x + s * 86, y - 20, x + s * 92, y); c.lineTo(x + s * 100, y); c.closePath(); ff(c, WOOD.d); }
  } else {
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(x + s * 96, y - 50); c.lineTo(x + s * 100, y - 165); c.quadraticCurveTo(x + s * 104, y - 196, x + s * 126, y - 190); c.quadraticCurveTo(x + s * 140, y - 170, x + s * 124, y - 150); c.lineTo(x + s * 118, y - 50); c.closePath(); ff(c, WOOD.m);
      c.beginPath(); c.ellipse(x + s * 124, y - 172, 10, 10, 0, 0, 7); ff(c, BRASS.m, 1.5);
      c.beginPath(); c.roundRect(x + s * 99 - (s > 0 ? 0 : 18), y - 160, 18, 100, 6); ff(c, VELVET.m, PW * .6);
    }
  }
}
// ---------------- small round side table with a vase of flowers ----------------
function sideTable(c, x, y, t) {
  c.beginPath(); c.moveTo(x - 8, y - 150); c.lineTo(x + 8, y - 150); c.lineTo(x + 10, y - 24); c.quadraticCurveTo(x + 40, y - 10, x + 46, y); c.lineTo(x - 46, y); c.quadraticCurveTo(x - 40, y - 10, x - 10, y - 24); c.closePath(); ff(c, WOOD.m);
  c.beginPath(); c.ellipse(x, y - 156, 64, 13, 0, 0, 7); ff(c, WOOD.l); c.beginPath(); c.ellipse(x, y - 158, 50, 9, 0, 0, 7); ff(c, '#f6efe0', 1.4);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; c.beginPath(); c.arc(x + Math.cos(a) * 52, y - 152 + Math.sin(a) * 6 + 4, 4, 0, 7); c.fillStyle = '#f6efe0'; c.fill(); }
  // vase
  c.beginPath(); c.moveTo(x - 12, y - 160); c.quadraticCurveTo(x - 26, y - 190, x - 10, y - 214); c.lineTo(x + 10, y - 214); c.quadraticCurveTo(x + 26, y - 190, x + 12, y - 160); c.closePath(); ff(c, '#5f7f9a'); ln(c, [x - 14, y - 186, x + 14, y - 186], 2, '#d9c27a');
  // flowers swaying
  const fl = [[-34, -280, '#e9a3b5'], [-6, -300, '#f4e2a6'], [26, -286, '#d9667a'], [42, -258, '#f1c7d1'], [-46, -250, '#f4e2a6'], [8, -266, '#e98a9c']];
  fl.forEach(([dx, dy, col], i) => {
    const sw = Math.sin(t * 1.3 + i) * 4, fx = x + dx + sw, fy = y + dy;
    ln(c, [x + dx * .2, y - 212, x + dx * .6 + sw * .5, y + (dy - 212 + 212) * .5 - 106, fx, fy], 2, '#4d6b3a');
    for (let p = 0; p < 6; p++) { const a = p / 6 * Math.PI * 2 + t * .2; c.beginPath(); c.ellipse(fx + Math.cos(a) * 7, fy + Math.sin(a) * 7, 6, 4, a, 0, 7); c.fillStyle = col; c.fill(); }
    c.beginPath(); c.arc(fx, fy, 4, 0, 7); ff(c, '#f0c040', 1);
  });
  for (let i = 0; i < 4; i++) { const a = -2.4 + i * .7; c.beginPath(); c.ellipse(x + Math.cos(a) * 30, y - 230 + Math.sin(a) * 10, 14, 5, a, 0, 7); ff(c, '#5f8a48', 1.2); }
}
// ---------------- regulator wall clock with pendulum (period 2 s, tick each second at t = n + .5) ----------------
function wallClock(c, x, y, t, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-34, -40); c.quadraticCurveTo(0, -78, 34, -40); c.lineTo(32, 150); c.lineTo(20, 166); c.lineTo(-20, 166); c.lineTo(-32, 150); c.closePath(); ff(c, WOOD.d);
  c.beginPath(); c.roundRect(-22, 30, 44, 118, 4); ff(c, '#2a1c14', PW * .6);
  const pa = Math.sin(t * Math.PI) * .28; c.save(); c.translate(0, 30); c.rotate(pa); ln(c, [0, 0, 0, 90], 2.5, BRASS.m); c.beginPath(); c.arc(0, 96, 11, 0, 7); ff(c, BRASS.l, 1.6); c.restore();
  c.beginPath(); c.arc(0, -10, 28, 0, 7); ff(c, '#f4ead2', PW * .8); c.beginPath(); c.arc(0, -10, 31, 0, 7); c.lineWidth = 3; c.strokeStyle = BRASS.m; c.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ln(c, [Math.cos(a) * 21, -10 + Math.sin(a) * 21, Math.cos(a) * 25, -10 + Math.sin(a) * 25], i % 3 ? 1.2 : 2.4, '#3a2a20'); }
  const sec = Math.floor(t + .5); ln(c, [0, -10, Math.cos(-1.2 + t * .02) * 13, -10 + Math.sin(-1.2 + t * .02) * 13], 2.6, '#2a201a'); ln(c, [0, -10, Math.cos(-Math.PI / 2 + sec * .105) * 21, -10 + Math.sin(-Math.PI / 2 + sec * .105) * 21], 1.4, '#a02a20');
  c.beginPath(); c.arc(0, -10, 2.4, 0, 7); c.fillStyle = '#2a201a'; c.fill();
  c.restore();
}
// ---------------- velvet curtain hanging from y0 to y1 at x (width w), gathered by a tie-back ----------------
function curtain(c, x, y0, y1, w, t, side = 1, col = VELVET) {
  const tie = y0 + (y1 - y0) * .55, sw = Math.sin(t * 1.1 + x * .01) * 6;
  c.beginPath(); c.moveTo(x - w / 2, y0); c.lineTo(x + w / 2, y0);
  c.quadraticCurveTo(x + w / 2 + sw, (y0 + tie) / 2, x + side * w * .12 + w * .18, tie); c.quadraticCurveTo(x + w / 2 + w * .1 + sw * 1.4, (tie + y1) / 2, x + w / 2 + w * .14 + sw, y1);
  c.lineTo(x - w / 2 - w * .1 + sw, y1); c.quadraticCurveTo(x - w / 2 - w * .05 + sw * 1.4, (tie + y1) / 2, x + side * w * .12 - w * .18, tie); c.quadraticCurveTo(x - w / 2 + sw, (y0 + tie) / 2, x - w / 2, y0); c.closePath();
  const g = c.createLinearGradient(x - w, 0, x + w, 0); g.addColorStop(0, col.d); g.addColorStop(.5, col.m); g.addColorStop(1, col.d); ff(c, g, PW);
  c.save(); c.clip(); for (let i = 0; i < 7; i++) { const fx = x - w / 2 + w * (i + .5) / 7; ln(c, [fx, y0, fx * .5 + (x + side * w * .12) * .5 + sw * .5, tie, fx + (fx - x) * .3 + sw, y1], 6 + (i % 2) * 4, i % 2 ? col.l : col.d); } c.restore();
  c.beginPath(); c.ellipse(x + side * w * .12, tie, w * .28, 9, 0, 0, 7); ff(c, BRASS.m, 2); for (let i = 0; i < 6; i++) ln(c, [x + side * w * .12 - 10 + i * 4, tie + 8, x + side * w * .12 - 12 + i * 4 + Math.sin(t * 2 + i), tie + 34], 2, BRASS.l);
}
// ---------------- sepia portraits in frames (all serious faces) ----------------
function sepiaFace(c, cx, cy, r, seed, o = {}) {
  const v = rnd(seed), v2 = rnd(seed + 9), skin = '#efe0c4', ink = '#4a3624', hair = ['#5a4030', '#3a2a1e', '#7a6048', '#2f241c'][Math.floor(v2 * 4)];
  c.lineJoin = 'round'; c.lineCap = 'round';
  // shoulders
  c.beginPath(); c.moveTo(cx - r * 1.5, cy + r * 2.6); c.quadraticCurveTo(cx - r * 1.4, cy + r * 1.2, cx, cy + r * 1.15); c.quadraticCurveTo(cx + r * 1.4, cy + r * 1.2, cx + r * 1.5, cy + r * 2.6); c.fillStyle = ['#3d2c20', '#5a4330', '#2c241e'][Math.floor(v * 3)]; c.fill();
  if (o.lady || v > .7) { c.beginPath(); c.arc(cx, cy - r * 1.1, r * .45, 0, 7); c.fillStyle = hair; c.fill(); }
  c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fillStyle = skin; c.fill(); c.lineWidth = r * .07; c.strokeStyle = ink; c.stroke();
  c.beginPath(); c.arc(cx, cy, r, Math.PI * 1.05, Math.PI * 1.95); c.lineTo(cx + r * .7, cy - r * .35); c.quadraticCurveTo(cx, cy - r * .6, cx - r * .7, cy - r * .35); c.closePath(); c.fillStyle = hair; c.fill();
  for (const s of [-1, 1]) { c.beginPath(); c.ellipse(cx + s * r * .36, cy + r * .05, r * .08, r * .12, 0, 0, 7); c.fillStyle = ink; c.fill(); ln(c, [cx + s * r * .55, cy - r * .2 + (v > .5 ? r * .04 : 0), cx + s * r * .18, cy - r * .16 - (v > .5 ? r * .06 : 0)], r * .07, ink); }
  if (v2 < .45) { c.beginPath(); c.moveTo(cx, cy + r * .32); c.quadraticCurveTo(cx - r * .45, cy + r * .2, cx - r * .6, cy + r * .45); c.quadraticCurveTo(cx - r * .3, cy + r * .45, cx, cy + r * .42); c.quadraticCurveTo(cx + r * .3, cy + r * .45, cx + r * .6, cy + r * .45); c.quadraticCurveTo(cx + r * .45, cy + r * .2, cx, cy + r * .32); c.fillStyle = hair; c.fill(); }
  else if (v2 < .65) { c.beginPath(); c.moveTo(cx - r * .7, cy + r * .2); c.quadraticCurveTo(cx, cy + r * 1.6, cx + r * .7, cy + r * .2); c.quadraticCurveTo(cx, cy + r * .7, cx - r * .7, cy + r * .2); c.fillStyle = hair; c.fill(); }
  ln(c, [cx - r * .2, cy + r * .58, cx + r * .2, cy + r * .58], r * .06, ink); // serious mouth
}
function photoFrame(c, x, y, w, h, o = {}) { // x,y top-left
  const oval = o.oval, fr = o.frame || (oval ? '#8a6a34' : '#3a2a1c');
  c.beginPath(); c.roundRect(x, y, w, h, 3); ff(c, fr, PW * .7);
  c.beginPath(); c.roundRect(x + w * .06, y + w * .06, w * .88, h - w * .12, 2); c.fillStyle = '#e8dcc0'; c.fill();
  c.save(); c.beginPath(); if (oval) c.ellipse(x + w / 2, y + h / 2, w * .36, h * .4, 0, 0, 7); else c.rect(x + w * .12, y + w * .12, w * .76, h - w * .24); c.clip();
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#cdb48a'); g.addColorStop(1, '#a58960'); c.fillStyle = g; c.fillRect(x, y, w, h);
  if (o.draw) o.draw(c, x + w / 2, y + h / 2, w, h); else sepiaFace(c, x + w / 2, y + h * .45, Math.min(w, h) * .2, o.seed || 1, o);
  c.fillStyle = 'rgba(80,50,20,.12)'; c.fillRect(x, y, w, h); c.restore();
  if (oval) { c.beginPath(); c.ellipse(x + w / 2, y + h / 2, w * .36, h * .4, 0, 0, 7); c.lineWidth = 2; c.strokeStyle = BRASS.m; c.stroke(); }
  ln(c, [x + 3, y + 3, x + w * .5, y + 3], 1.4, 'rgba(255,230,180,.45)');
}
// sepia mini-photo of a baby on a hidden (draped) mother — used in the collage and the album
function hiddenMotherPhoto(c, cx, cy, w, h, seed = 1, o = {}) {
  const k = Math.min(w / 720, h / 1700) * (o.zoom || 1), v = rnd(seed);
  c.save(); c.translate(cx + (v - .5) * w * .1, cy + h * .46); c.scale(k, k);
  c.fillStyle = 'rgba(235,215,180,.35)'; c.fillRect(-1200, -2200, 2400, 1700); c.fillStyle = 'rgba(90,70,50,.3)'; c.fillRect(-1200, -40, 2400, 400);
  drawDraped(c, { x: 0, y: 0, k: 1, t: 0, sessel: v > .7 ? .35 : 0, baby: cc => drawBaby(cc, { x: 0, y: -560, k: .95, t: seed * 1.7, wig: 0, giggle: v > .5 ? .8 : .2 }), hand: o.hand });
  c.restore();
  // sepia tone over it
  c.save(); c.globalCompositeOperation = 'color'; c.fillStyle = '#a88660'; c.fillRect(cx - w / 2, cy - h / 2, w, h); c.restore();
}
// ---------------- glass plate (portrait) ----------------
function glassPlate(c, x, y, w, h, drawImg, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot || 0);
  c.beginPath(); c.roundRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 4); ff(c, 'rgba(210,230,235,.55)', PW * .8);
  c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip(); if (drawImg) drawImg(c, w, h);
  c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.moveTo(-w / 2, -h / 2); c.lineTo(-w / 2 + w * .4, -h / 2); c.lineTo(-w / 2, -h / 2 + h * .5); c.fill(); c.restore();
  c.restore();
}
// blurred customer photo: a comic smeared ghost blob in the chair
function blurPhoto(c, w, h, t) {
  c.fillStyle = '#c9b089'; c.fillRect(-w / 2, -h / 2, w, h);
  c.save(); c.globalAlpha = .5; c.fillStyle = '#9b7f5b'; c.fillRect(-w / 2, h * .18, w, h * .4); c.restore();
  c.save(); c.filter = `blur(${Math.max(1, w * .01)}px)`;
  // chair (sharp-ish)
  c.fillStyle = '#6e4a32'; c.fillRect(-w * .26, -h * .1, w * .52, h * .5);
  // smeared man: several offset copies of a hat+head+body blob
  for (let i = 0; i < 6; i++) { const dx = (i - 2.5) * w * .075 + Math.sin(i * 2.1) * w * .02, dy = Math.cos(i * 1.7) * h * .03, a = .3;
    c.fillStyle = `rgba(60,40,32,${a})`; c.beginPath(); c.ellipse(dx, h * .1 + dy, w * .2, h * .2, 0, 0, 7); c.fill();
    c.fillStyle = `rgba(245,235,220,${a + .1})`; c.beginPath(); c.arc(dx, -h * .14 + dy, w * .13, 0, 7); c.fill();
    c.fillStyle = `rgba(30,24,26,${a + .1})`; c.fillRect(dx - w * .09, -h * .42 + dy, w * .18, h * .18); }
  c.restore();
  // speed streaks
  c.save(); c.globalAlpha = .35; for (let i = 0; i < 7; i++) ln(c, [-w * .4, -h * .3 + i * h * .08, w * .4, -h * .28 + i * h * .08 + Math.sin(i) * 4], 3, '#f4ead6'); c.restore();
  c.save(); c.globalCompositeOperation = 'multiply'; const g = c.createRadialGradient(0, 0, w * .2, 0, 0, w * .8); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(120,80,50,.6)'); c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h); c.restore();
}
// ---------------- magnesium flash lamp (T-bar with a powder trough) ----------------
function flashLamp(c, x, y, ang = 0, fire = 0) {
  c.save(); c.translate(x, y); c.rotate(ang);
  ln(c, [0, 0, 0, -70], 6, IRON.d); ln(c, [-1, 0, -1, -68], 2, IRON.l);
  c.beginPath(); c.roundRect(-34, -82, 68, 12, 3); ff(c, IRON.m, PW * .7); c.beginPath(); c.roundRect(-30, -86, 60, 6, 2); c.fillStyle = '#e8e2d0'; c.fill();
  c.restore();
  if (fire > 0) { const px = x + Math.sin(ang) * 80, py = y - Math.cos(ang) * 80; bloom(c, px, py, 260 * fire, '255,255,245', 1 * fire); bloom(c, px, py, 90, '255,250,220', fire); }
}
// ---------------- a horse-drawn carriage silhouette (for the window) ----------------
function carriage(c, x, y, t, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#4a3a30';
  const leg = Math.sin(t * 12);
  c.beginPath(); c.ellipse(60, -40, 34, 16, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(86, -48); c.lineTo(104, -76); c.lineTo(116, -70); c.lineTo(96, -40); c.fill();
  for (const [lx, ph] of [[40, 0], [48, 2], [74, 1], [82, 3]]) ln(c, [lx, -30, lx + Math.sin(t * 12 + ph) * 8, 0], 4, '#4a3a30');
  c.fillRect(-60, -80, 80, 46); c.beginPath(); c.moveTo(-64, -80); c.quadraticCurveTo(-20, -104, 24, -80); c.fill(); ln(c, [20, -40, 40, -40], 3, '#4a3a30');
  for (const wx of [-44, 4]) { c.beginPath(); c.arc(wx, -14, 16, 0, 7); c.lineWidth = 3; c.strokeStyle = '#4a3a30'; c.stroke(); for (let i = 0; i < 4; i++) { const a = i * .78 + t * 8; ln(c, [wx, -14, wx + Math.cos(a) * 15, -14 + Math.sin(a) * 15], 1.4, '#4a3a30'); } }
  c.beginPath(); c.arc(-34, -96, 6, 0, 7); c.fill(); c.fillRect(-40, -116, 12, 14); // driver + hat
  c.restore();
}
function birds(c, x0, y0, t, n = 3, s = 1) {
  for (let i = 0; i < n; i++) { const x = x0 + ((t * (40 + i * 8) + i * 90) % 520) - 60, y = y0 + Math.sin(t * 2 + i) * 10 + i * 14, f = Math.sin(t * 14 + i * 2) * 6 * s;
    ln(c, [x - 9 * s, y - f, x, y, x + 9 * s, y - f], 2.2 * s, '#5a4a40'); }
}
// ---------------- modern living room props ----------------
function floorLamp(c, x, y, t, fl = 1) {
  ln(c, [x, y, x, y - 340], 6, '#3a3330'); c.beginPath(); c.ellipse(x, y, 40, 9, 0, 0, 7); ff(c, '#3a3330');
  const on = fl; bloom(c, x, y - 360, 420, '255,190,110', .55 * on); bloom(c, x, y - 360, 140, '255,220,160', .7 * on);
  c.beginPath(); c.moveTo(x - 46, y - 330); c.lineTo(x + 46, y - 330); c.lineTo(x + 30, y - 400); c.lineTo(x - 30, y - 400); c.closePath(); ff(c, `rgb(${Math.round(240 * (.75 + .25 * on))},${Math.round(196 * (.75 + .25 * on))},${Math.round(130 * (.75 + .25 * on))})`, PW * .7);
  c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(0, y - 330, 0, y - 40); g.addColorStop(0, `rgba(255,200,120,${.35 * on})`); g.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x - 46, y - 330); c.lineTo(x + 46, y - 330); c.lineTo(x + 150, y); c.lineTo(x - 150, y); c.fill(); c.restore();
}
function sofa(c, x, y, part = 'back') {
  const col = '#6f7f8c', d = '#55636e', l = '#8a9aa6';
  if (part === 'back') {
    c.beginPath(); c.roundRect(x - 240, y - 290, 480, 210, 40); ff(c, col); c.beginPath(); c.roundRect(x - 220, y - 270, 210, 170, 30); ff(c, l, PW * .6); c.beginPath(); c.roundRect(x + 10, y - 270, 210, 170, 30); ff(c, l, PW * .6);
    c.beginPath(); c.roundRect(x - 230, y - 110, 460, 70, 18); ff(c, col); c.beginPath(); c.roundRect(x - 250, y - 50, 500, 40, 10); ff(c, d);
    for (const s of [-1, 1]) { c.beginPath(); c.roundRect(x + s * 200 - 8, y - 12, 16, 12, 2); ff(c, '#3a2a20'); }
  } else for (const s of [-1, 1]) { c.beginPath(); c.roundRect(x + s * 250 - (s > 0 ? 50 : 0) - (s < 0 ? 0 : 0) - (s < 0 ? 0 : 0) + (s < 0 ? -0 : 0) - (s < 0 ? 0 : 0), y - 190, 50, 180, 22); ff(c, col); c.beginPath(); c.roundRect(x + s * 250 - (s > 0 ? 50 : 0), y - 200, 50, 40, 18); ff(c, l, PW * .6); }
}
function teaMug(c, x, y, t) { c.beginPath(); c.roundRect(x - 13, y - 30, 26, 30, 4); ff(c, '#c9573e', PW * .7); c.beginPath(); c.arc(x + 15, y - 16, 8, -1.3, 1.3); c.lineWidth = 3.4; c.strokeStyle = NOAH.out; c.stroke(); steam(c, x, y - 34, t, { n: 4, h: 70, r: 6, a: .35, w: 8 }); }
// photo album (open or closed); in world units, centred at x,y; open 0..1, cover title
function album(c, x, y, w, h, open, t, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot || 0);
  const pg = '#f1e6cf';
  if (open < .5) {
    const k = 1 - open * 2; // cover closing width as it opens
    c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, 5); ff(c, '#5a2c1e', PW);
    c.save(); c.translate(-w / 2, 0); c.scale(Math.max(.02, k), 1); c.beginPath(); c.roundRect(0, -h / 2, w, h, 5); ff(c, '#6e3424', PW);
    c.beginPath(); c.roundRect(w * .1, -h / 2 + h * .1, w * .8, h * .8, 4); c.lineWidth = 2; c.strokeStyle = BRASS.m; c.stroke();
    for (const [a, b] of [[.1, .1], [.9, .1], [.1, .9], [.9, .9]]) { c.beginPath(); c.arc(w * a, -h / 2 + h * b, 4, 0, 7); c.fillStyle = BRASS.l; c.fill(); }
    if (k > .3) serif(c, 'Familienalbum', w / 2, -h * .05, w * .105, BRASS.l);
    c.beginPath(); c.ellipse(w / 2, h * .2, w * .12, w * .045, 0, 0, 7); c.lineWidth = 1.6; c.strokeStyle = BRASS.m; c.stroke();
    c.restore();
  } else {
    // open spread: two pages
    c.beginPath(); c.roundRect(-w, -h / 2 - 4, w * 2, h + 8, 6); ff(c, '#5a2c1e', PW);
    for (const s of [-1, 1]) { c.beginPath(); c.roundRect(s < 0 ? -w + 6 : 2, -h / 2, w - 8, h, 3); ff(c, pg, PW * .6); }
    ln(c, [0, -h / 2, 0, h / 2], 3, 'rgba(90,60,40,.5)');
    if (o.left) o.left(c, -w / 2, 0, w, h); if (o.right) o.right(c, w / 2, 0, w, h);
  }
  c.restore();
}
