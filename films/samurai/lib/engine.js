// Minimal 16:9 shot engine for the samurai film (1920x1080, 30 fps).
// Shots: { name, dur, draw(c, lt, T, t), tr: { type, dur } }  — tr = transition INTO this shot.
// Transitions run over the first tr.dur seconds of the shot; the previous shot keeps running (lt > T).
const W = 1920, H = 1080, FPS = 30;
const OUT = '#1d1715';
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const easeOut = k => 1 - Math.pow(1 - k, 3);
const easeIn = k => k * k * k;
const bump = (t, a, b) => { const k = seg(t, a, b); return k > 0 && k < 1 ? Math.sin(Math.PI * k) : 0; };
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const rgba = (rgb, a) => `rgba(${rgb},${a})`;
function keys(t, kf) {
  if (t <= kf[0][0]) return kf[0][1];
  for (let i = 1; i < kf.length; i++) if (t <= kf[i][0]) { const [t0, a] = kf[i - 1], [t1, b] = kf[i], k = ease(seg(t, t0, t1)); return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], k)) : lerp(a, b, k); }
  return kf[kf.length - 1][1];
}
// blink helper: returns lid override 0..1 (1 = closed) for natural blinks every ~3-5 s
function blink(t, seed = 0, every = 4) {
  const per = every + rnd(seed) * 1.2, ph = (t + seed * 1.7) % per;
  return ph < .14 ? Math.sin(ph / .14 * Math.PI) : 0;
}
function withBlink(e, t, seed, every) { const b = blink(t, seed, every); if (b > .6) return Object.assign({}, e, { eyes: 'closed' }); return Object.assign({}, e, { lid: Math.max(e.lid || 0, b) }); }

// camera: world point (x, y) at screen centre, zoom z, roll r
function camT(c, cam) { c.translate(W / 2, H / 2); if (cam.r) c.rotate(cam.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); }
// parallax layer p (0 = infinitely far, 1 = the camera plane of the subject)
function layer(c, cam, p, fn) {
  c.save(); c.translate(W / 2, H / 2); if (cam.r) c.rotate(cam.r); const z = 1 + (cam.z - 1) * p; c.scale(z, z); c.translate(-(W / 2 + (cam.x - W / 2) * p), -(H / 2 + (cam.y - H / 2) * p)); fn(c); c.restore();
}
function world(c, cam, fn) { c.save(); camT(c, cam); fn(c); c.restore(); }
function shake(t, amt, seed = 0) { return [Math.sin(t * 61 + seed) * amt + Math.sin(t * 37) * amt * .5, Math.cos(t * 53 + seed) * amt]; }
function fill(c, col) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = col; c.fillRect(0, 0, W, H); c.restore(); }
function vignette(c, a = .45, col = '0,0,0') {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05); g.addColorStop(0, rgba(col, 0)); g.addColorStop(1, rgba(col, a));
  c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
}
function vgrad(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; }
function poly(c, pts) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); }
function stroke(c, pts, w, col, cap = 'round') { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.lineWidth = w; c.strokeStyle = col; c.lineCap = cap; c.lineJoin = 'round'; c.stroke(); }
function fo(c, fillCol, lw = 0, col = OUT) { if (fillCol) { c.fillStyle = fillCol; c.fill(); } if (lw) { c.lineWidth = lw; c.strokeStyle = col; c.lineJoin = 'round'; c.stroke(); } }
function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, Math.max(.1, r), 0, Math.PI * 2); }
function ell(c, x, y, rx, ry, rot = 0) { c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, Math.PI * 2); }

// ---------------- film ----------------
const FILM = { shots: [], dur: 0, post: null };
const _bufA = document.createElement('canvas'), _bufB = document.createElement('canvas');
_bufA.width = _bufB.width = W; _bufA.height = _bufB.height = H;
function defineShots(list, opts = {}) {
  let t = 0; FILM.shots = list.map(s => { const o = Object.assign({}, s, { start: t }); t += s.dur; return o; });
  FILM.dur = opts.duration || t; FILM.post = opts.post || null; FILM.audioOffset = opts.audioOffset || 0;
}
function shotAt(t) { let i = 0; while (i < FILM.shots.length - 1 && t >= FILM.shots[i + 1].start) i++; return i; }
function drawShot(c, i, t) {
  const s = FILM.shots[i]; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  s.draw(c, t - s.start, s.dur, t); c.restore();
}
function renderAt(t) {
  const cv = document.getElementById('film'), c = cv.getContext('2d');
  const i = shotAt(t), s = FILM.shots[i], lt = t - s.start;
  if (s.tr && i > 0 && lt < s.tr.dur) {
    const a = _bufA.getContext('2d'), b = _bufB.getContext('2d');
    drawShot(a, i - 1, t); drawShot(b, i, t);
    TRANS[s.tr.type](c, _bufA, _bufB, lt / s.tr.dur, s.tr, t);
  } else drawShot(c, i, t);
  if (FILM.post) FILM.post(c, t);
}
window.__film = { renderAt, get DURATION() { return FILM.dur; }, FPS, get shots() { return FILM.shots.map(s => ({ name: s.name, start: s.start, dur: s.dur, tr: s.tr ? s.tr.type : null })); } };

// draw something into an offscreen layer, then tint it as a silhouette (col, a) — optional rim light colour
const _sil = document.createElement('canvas'); _sil.width = W; _sil.height = H;
function silhouette(c, fn, col = '12,10,14', a = .92, rim = null) {
  const s = _sil.getContext('2d'); s.setTransform(1, 0, 0, 1, 0, 0); s.clearRect(0, 0, W, H); s.globalCompositeOperation = 'source-over';
  s.save(); s.setTransform(c.getTransform()); fn(s); s.restore();
  s.globalCompositeOperation = 'source-atop'; s.setTransform(1, 0, 0, 1, 0, 0);
  if (rim) { s.fillStyle = `rgba(${col},${a})`; s.fillRect(0, 0, W, H); const g = s.createLinearGradient(rim.x0 ?? 0, 0, rim.x1 ?? W, 0); g.addColorStop(0, `rgba(${rim.col},0)`); g.addColorStop(1, `rgba(${rim.col},${rim.a ?? .25})`); s.fillStyle = g; s.fillRect(0, 0, W, H); }
  else { s.fillStyle = `rgba(${col},${a})`; s.fillRect(0, 0, W, H); }
  s.globalCompositeOperation = 'source-over';
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(_sil, 0, 0); c.restore();
}
// film grain (fixed noise tile, shifted per frame)
const _grain = document.createElement('canvas'); _grain.width = _grain.height = 256;
{ const g = _grain.getContext('2d'), d = g.createImageData(256, 256); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); }
function grain(c, t, a = .05) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a; c.globalCompositeOperation = 'overlay'; const ox = Math.floor(rnd(Math.floor(t * 30)) * 256), oy = Math.floor(rnd(Math.floor(t * 30) + 9) * 256); c.translate(-ox, -oy); c.fillStyle = c.createPattern(_grain, 'repeat'); c.fillRect(0, 0, W + 256, H + 256); c.restore(); }
