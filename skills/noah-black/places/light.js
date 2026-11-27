// CINEMATIC LIGHT helpers (world space unless noted). Scale: 1 m ≈ 280 world units; Noah at k=.32 ≈ 1.75 m.
const M = 280;
const LIGHT = {};
// god rays / sun shafts fanning from (x, y) in direction dir (rad, 0 = right, PI/2 = down)
function sunRays(c, x, y, o = {}) {
  const n = o.n || 8, len = o.len || 5000, spread = o.spread || .8, dir = o.dir ?? Math.PI / 2 + .45, col = o.color || '255,238,190', a = o.alpha ?? .22, t = o.t || 0;
  c.save(); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const ang = dir + (n > 1 ? (i / (n - 1) - .5) * spread : 0) + Math.sin(t * .4 + i * 1.7) * .006, w = .012 + rnd(i + 500) * .03;
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len, px = -Math.sin(ang), py = Math.cos(ang);
    const g = c.createLinearGradient(x, y, ex, ey), aa = a * (.5 + rnd(i + 520) * .7) * (1 + Math.sin(t * .8 + i) * .12);
    g.addColorStop(0, `rgba(${col},${aa})`); g.addColorStop(.6, `rgba(${col},${aa * .45})`); g.addColorStop(1, `rgba(${col},0)`);
    c.beginPath(); c.moveTo(x + px * 10, y + py * 10); c.lineTo(ex + px * len * w, ey + py * len * w); c.lineTo(ex - px * len * w, ey - py * len * w); c.lineTo(x - px * 10, y - py * 10); c.closePath();
    c.fillStyle = g; c.fill();
  }
  c.restore();
}
// soft glow around a light source
function bloom(c, x, y, r, col = '255,220,150', a = .5, mode = 'screen') {
  const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(.35, `rgba(${col},${a * .35})`); g.addColorStop(1, `rgba(${col},0)`);
  c.save(); c.globalCompositeOperation = mode; c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
}
// dappled sunlight spots on the ground between x0..x1 around y
function dappled(c, x0, x1, y, t, o = {}) {
  c.save(); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < (o.n || 26); i++) {
    const x = x0 + rnd(i + 700) * (x1 - x0), yy = y + (rnd(i + 730) - .5) * (o.depth || 260), r = (o.r || 1) * (25 + rnd(i + 760) * 70), a = (o.alpha || .22) * (.6 + .4 * Math.sin(t * .7 + i));
    c.beginPath(); c.ellipse(x, yy, r, r * .28, 0, 0, Math.PI * 2); c.fillStyle = `rgba(255,240,180,${a})`; c.fill();
  }
  c.restore();
}
// contact + cast shadow for someone standing at x (sun from sunX side), width in world units
function castShadow(c, x, w = 160, o = {}) {
  const len = o.len ?? 1.8, dir = o.dir ?? 1, a = o.alpha ?? .32;
  c.save(); c.fillStyle = `rgba(20,15,30,${a})`;
  c.beginPath(); c.ellipse(x, 4, w * .55, w * .14, 0, 0, Math.PI * 2); c.fill();
  c.globalAlpha = .55; c.beginPath(); c.moveTo(x - w * .3, 4); c.lineTo(x + dir * w * len, 30); c.lineTo(x + dir * w * len + dir * 30, 55); c.lineTo(x + w * .3, 8); c.closePath(); c.fill();
  c.restore();
}
// floating dust motes / pollen catching the light
function motes(c, x0, x1, y0, y1, t, o = {}) {
  c.save(); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < (o.n || 40); i++) {
    const ph = (t * (o.speed || .03) + rnd(i + 800)) % 1, x = x0 + rnd(i + 820) * (x1 - x0) + Math.sin(t * .6 + i) * 30, y = y1 - ph * (y1 - y0);
    c.beginPath(); c.arc(x, y, 2 + rnd(i + 840) * 3.5, 0, Math.PI * 2); c.fillStyle = `rgba(${o.color || '255,245,210'},${(o.alpha || .7) * Math.sin(ph * Math.PI)})`; c.fill();
  }
  c.restore();
}
function fireflies(c, x0, x1, y0, y1, t, n = 24) {
  for (let i = 0; i < n; i++) {
    const x = x0 + rnd(i + 900) * (x1 - x0) + Math.sin(t * .9 + i * 2) * 60, y = y0 + rnd(i + 930) * (y1 - y0) + Math.cos(t * .7 + i) * 40, a = .5 + .5 * Math.sin(t * 3 + i * 1.3);
    bloom(c, x, y, 26, '220,255,140', .5 * a); c.beginPath(); c.arc(x, y, 3.5, 0, Math.PI * 2); c.fillStyle = `rgba(240,255,190,${a})`; c.fill();
  }
}
// screen-space colour grade: warm light from (sx, sy) (0..1 of the screen), darker cooler far corner
function grade(c, o = {}) {
  const sx = (o.sx ?? .1) * W, sy = (o.sy ?? 0) * H, warm = o.warm || '255,190,110', cool = o.cool || '30,30,80';
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  let g = c.createRadialGradient(sx, sy, 0, sx, sy, Math.max(W, H) * 1.1); g.addColorStop(0, `rgba(${warm},${o.warmA ?? .28})`); g.addColorStop(1, `rgba(${warm},0)`);
  c.globalCompositeOperation = 'soft-light'; c.fillStyle = g; c.fillRect(0, 0, W, H);
  g = c.createLinearGradient(sx, sy, W - sx, H - sy); g.addColorStop(0, `rgba(${cool},0)`); g.addColorStop(1, `rgba(${cool},${o.coolA ?? .25})`);
  c.globalCompositeOperation = 'multiply'; c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.restore();
}
// two-pass blob cluster: one shared outline, then fills (no inner outlines)
function blobs(c, list, lw = 7) {
  for (const b of list) { c.beginPath(); c.arc(b[0], b[1], b[2] + lw / 2, 0, Math.PI * 2); c.fillStyle = OUT; c.fill(); }
  for (const b of list) { c.beginPath(); c.arc(b[0], b[1], b[2] - lw / 2, 0, Math.PI * 2); c.fillStyle = b[3]; c.fill(); }
}
// atmospheric haze between parallax layers (cartoon-short-kit 'fog'): call right after drawing a far layer
function haze(c, col = '200,220,240', a = .25) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(${col},${a})`; c.fillRect(0, 0, W, H); c.restore(); }
// ground mist band (screen-space-ish, in a layer): soft horizontal glow at world y
function mist(c, y, col = '255,255,255', a = .25, h = 300) { const g = c.createLinearGradient(0, y - h, 0, y + h); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(.5, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(-9000, y - h, 18000, h * 2); }
// base line of a parallax layer p that meets the ground horizon HZ on screen (works for any cam.z)
function layerBase(cam, HZ, p) { const zp = 1 + (cam.z - 1) * p; return (HZ - cam.y) * cam.z / zp + cam.y * p; }
