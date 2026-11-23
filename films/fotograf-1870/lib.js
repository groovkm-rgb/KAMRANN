'use strict';
// ===== film helpers: parallax layers, rim-lit characters, Noah wrappers/IK, small props =====
const NK = .25;                 // Noah scale (skill rule)
const INKW = 13 * 1.8;          // character ink in local units (same as Noah with ink 1.8)
const PW = 3.2;                 // prop ink in world units
const LX = (cam, x, p) => { const zp = 1 + (cam.z - 1) * p; return cam.z * (x - cam.x) / zp + cam.x * p; };
const FY = (cam, y, p) => layerBase(cam, y, p);
function L(c, cam, p, fn, blur = 0) {
  if (blur > .3) { c.save(); c.filter = `blur(${blur}px)`; layer(c, cam, p, fn); c.restore(); } else layer(c, cam, p, fn);
}
function scr(c) { c.setTransform(1, 0, 0, 1, 0, 0); }
// ---- rim light + soft form shading for characters (screen-space, uses two offscreen canvases) ----
const _cv = [0, 1].map(() => { const k = document.createElement('canvas'); k.width = W; k.height = H; return k; });
function litLayer(c, cam, p, fn, o = {}) {
  const A = _cv[0], a = A.getContext('2d'), B = _cv[1], b = B.getContext('2d');
  for (const x of [a, b]) { x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.filter = 'none'; x.globalAlpha = 1; x.clearRect(0, 0, W, H); }
  layer(a, cam, p, fn);
  const zp = 1 + (cam.z - 1) * p, lx = (o.lx ?? .5) * W, ly = (o.ly ?? -.15) * H, cx = (o.cx ?? .5) * W, cy = (o.cy ?? .55) * H;
  let dx = lx - cx, dy = ly - cy; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
  const off = (o.off ?? 2.0) * zp;
  b.drawImage(A, 0, 0); b.globalCompositeOperation = 'source-in'; b.fillStyle = `rgb(${o.rim || '255,228,170'})`; b.fillRect(0, 0, W, H); b.globalCompositeOperation = 'source-over';
  // form shading (light side warm, far side cool)
  a.globalCompositeOperation = 'source-atop';
  const g = a.createLinearGradient(cx + dx * 520, cy + dy * 520, cx - dx * 520, cy - dy * 520);
  g.addColorStop(0, `rgba(${o.warm || '255,214,150'},${o.warmA ?? .16})`); g.addColorStop(.5, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(${o.cool || '40,24,50'},${o.coolA ?? .2})`);
  a.fillStyle = g; a.fillRect(0, 0, W, H); a.globalCompositeOperation = 'source-over';
  c.save(); scr(c); if (o.blur) c.filter = `blur(${o.blur}px)`;
  c.save(); c.filter = `blur(${Math.max(1, zp * .9)}px)`; c.globalAlpha = o.rimA ?? .95; c.drawImage(B, dx * off, dy * off); c.restore();
  c.drawImage(A, 0, 0); c.restore();
}
// ---- Noah wrappers ----
function noah(c, o) { drawNoah(c, Object.assign({ k: NK, ink: 1.8 }, o)); }
function noahSide(c, o) { drawNoahSide(c, Object.assign({ k: NK, ink: 1.8 }, o)); }
// solve Noah's front-view arm for a wrist target (local units, torso space)
function armIK(side, tx, ty, flip = 1) {
  const sx = side * NOAH.SHOULDER.x, sy = NOAH.SHOULDER.y, U = NOAH.UPPER, F = NOAH.FORE;
  const ux = side * (tx - sx), uy = ty - sy, d = Math.max(1, Math.hypot(ux, uy)), dm = clamp(d, Math.abs(U - F) + 2, U + F - 2);
  const th = Math.atan2(ux, uy), al = Math.acos(clamp((U * U + dm * dm - F * F) / (2 * U * dm), -1, 1));
  const a = th + flip * al, ex = Math.sin(a) * U, ey = Math.cos(a) * U, wx = ux / d * dm, wy = uy / d * dm;
  return { a, b: Math.atan2(wx - ex, wy - ey) - a };
}
// world position of Noah's wrist (and a palm point a bit further along the hand)
function noahHandPos(o, side, palm = 60) {
  const spec = (o.arms && (side < 0 ? o.arms.l : o.arms.r)) || NOAH.ARMS.l, k = o.k ?? NK, s = o.s || 1;
  const sx = side * NOAH.SHOULDER.x, sy = NOAH.SHOULDER.y, a = spec.a, a2 = a + (spec.b || 0);
  const ex = sx + side * Math.sin(a) * NOAH.UPPER, ey = sy + Math.cos(a) * NOAH.UPPER;
  let wx = ex + side * Math.sin(a2) * (NOAH.FORE + palm), wy = ey + Math.cos(a2) * (NOAH.FORE + palm);
  const dy = o.sit ? (-(o.seatH ?? 250)) - (NOAH.HEM + 40) - 60 : 0;
  return [(o.x || 0) + wx * k * s, (o.y || 0) + (wy + dy + (o.bob || 0)) * k];
}
const noahHeadPos = o => [(o.x || 0), (o.y || 0) + (NOAH.HEAD.y + (o.sit ? (-(o.seatH ?? 250)) - (NOAH.HEM + 40) - 60 : 0) + (o.bob || 0)) * (o.k ?? NK)];
// raised index finger ("psst") drawn over a hand at world point, in world units
function fingerHand(c, x, y, k = NK, ang = 0) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(k, k);
  const w0 = NOAH.W; NOAH.W = INKW;
  c.beginPath(); c.roundRect(-34, -150, 40, 140, 20); nFill(c, NOAH.skin);
  c.beginPath(); c.ellipse(0, 0, 52, 58, 0, 0, 7); nFill(c, NOAH.skin);
  nLine(c, [-30, -8, 30, -8], 5, NOAH.out); nLine(c, [-28, 18, 30, 18], 5, NOAH.out);
  c.beginPath(); c.ellipse(-44, 10, 22, 34, -.4, 0, 7); nFill(c, NOAH.skin, INKW * .7);
  NOAH.W = w0; c.restore();
}
// ---- small generic drawing helpers (world units) ----
function pth(c, pts, close = true) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); if (close) c.closePath(); }
function smoothPath(c, P, closed = true) {
  const n = P.length; c.beginPath();
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (closed) { const m0 = mid(P[n - 1], P[0]); c.moveTo(m0[0], m0[1]); for (let i = 0; i < n; i++) { const m = mid(P[i], P[(i + 1) % n]); c.quadraticCurveTo(P[i][0], P[i][1], m[0], m[1]); } c.closePath(); }
  else { c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < n - 1; i++) { const m = mid(P[i], P[i + 1]); c.quadraticCurveTo(P[i][0], P[i][1], m[0], m[1]); } c.lineTo(P[n - 1][0], P[n - 1][1]); }
}
function ff(c, fill, lw = PW, col = NOAH.out) { if (fill) { c.fillStyle = fill; c.fill(); } if (lw) { c.lineWidth = lw; c.strokeStyle = col; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); } }
function ln(c, pts, lw, col = NOAH.out) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.lineWidth = lw; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); }
function serif(c, s, x, y, size, col, align = 'center', weight = 'bold') { c.font = `${weight} ${size}px 'DejaVu Serif', 'Liberation Serif', serif`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function sans(c, s, x, y, size, col, align = 'center') { c.font = hudFont(size); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function glowDot(c, x, y, r, col, a) { bloom(c, x, y, r, col, a); }
// steam / vapour wisps rising from (x, y)
function steam(c, x, y, t, o = {}) {
  c.save(); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < (o.n || 5); i++) {
    const ph = (((t * (o.speed || .35) + i / (o.n || 5)) % 1) + 1) % 1, yy = y - ph * (o.h || 120), xx = x + Math.sin(ph * 6 + i * 2 + t) * (o.wob || 14) * (1 + ph) + (rnd(i + 3) - .5) * (o.w || 20);
    const r = (o.r || 10) * (1 + ph * 2.2);
    const g = c.createRadialGradient(xx, yy, 0, xx, yy, r); g.addColorStop(0, `rgba(${o.col || '255,240,225'},${(o.a || .28) * Math.sin(ph * Math.PI)})`); g.addColorStop(1, `rgba(${o.col || '255,240,225'},0)`);
    c.fillStyle = g; c.fillRect(xx - r, yy - r, r * 2, r * 2);
  }
  c.restore();
}
function smoke(c, x, y, t0, t, o = {}) { // magnesium smoke puff that grows and drifts up
  const age = t - t0; if (age < 0 || age > (o.life || 3)) return;
  c.save();
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * Math.PI * 2 + rnd(i) * .6, sp = 30 + rnd(i + 4) * 40;
    const xx = x + Math.cos(a) * sp * Math.min(1, age * 2) + Math.sin(age * 1.5 + i) * 10, yy = y + Math.sin(a) * sp * .5 * Math.min(1, age * 2) - age * (o.rise || 45);
    const r = (o.r || 26) * (.5 + Math.min(1, age * 1.6)) * (.8 + rnd(i + 9) * .5), al = (o.a || .55) * (1 - age / (o.life || 3));
    const g = c.createRadialGradient(xx, yy, 0, xx, yy, r); g.addColorStop(0, `rgba(${o.col || '235,228,215'},${al})`); g.addColorStop(1, `rgba(${o.col || '235,228,215'},0)`);
    c.fillStyle = g; c.beginPath(); c.arc(xx, yy, r, 0, 7); c.fill();
  }
  c.restore();
}
function sparkle(c, x, y, r, a = 1, col = '#fff7d6') {
  if (a <= 0) return; c.save(); c.globalAlpha = clamp(a); c.fillStyle = col; c.beginPath();
  c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r * .3, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r * .3, y); c.quadraticCurveTo(x, y, x, y - r);
  c.moveTo(x - r * .8, y); c.quadraticCurveTo(x, y, x, y - r * .22); c.quadraticCurveTo(x, y, x + r * .8, y); c.quadraticCurveTo(x, y, x, y + r * .22); c.quadraticCurveTo(x, y, x - r * .8, y);
  c.fill(); c.restore(); bloom(c, x, y, r * 2.2, '255,240,190', .45 * a);
}
function drop(c, x, y, s = 1, a = 1) { // sweat drop (world units)
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(9, 2, 7, 6); c.arc(0, 6, 7, 0, Math.PI); c.quadraticCurveTo(-9, 2, 0, -12); ff(c, '#cdeeff', 1.8);
  c.beginPath(); c.ellipse(-2.5, 3, 1.6, 3, -.3, 0, 7); c.fillStyle = '#fff'; c.fill(); c.restore();
}
function fly(c, x, y, t, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const fl = Math.sin(t * 160) * .5 + .5;
  c.fillStyle = `rgba(220,235,255,${.35 + fl * .3})`; for (const d of [-1, 1]) { c.beginPath(); c.ellipse(d * 5, -6 - fl * 2, 6, 3.4, d * (.5 + fl * .4), 0, 7); c.fill(); }
  c.beginPath(); c.ellipse(0, 0, 5.5, 4, 0, 0, 7); ff(c, '#2a2628', .9);
  c.beginPath(); c.arc(4.6, -.5, 2.6, 0, 7); ff(c, '#3a2f30', .8); c.fillStyle = '#c43'; c.beginPath(); c.arc(5.6, -1.2, 1.1, 0, 7); c.fill();
  c.restore();
}
function motionLines(c, x, y, r, n, a, col = '#2a2220') { if (a <= 0) return; c.save(); c.globalAlpha = a; for (let i = 0; i < n; i++) { const an = i / n * Math.PI * 2 + .3; ln(c, [x + Math.cos(an) * r, y + Math.sin(an) * r, x + Math.cos(an) * r * 1.35, y + Math.sin(an) * r * 1.35], 2.6, col); } c.restore(); }
