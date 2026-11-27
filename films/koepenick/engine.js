// Vertical 9:16 film engine (1080x1920, 30 fps). Pure function of time: renderAt(t).
// Simple pinhole projection: world X right, Y down (ground = 0, up negative), Z depth (away from camera).
const W = 1080, H = 1920, FPS = 30;
const OUT = '#211c1a';
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const ease5 = t => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eseg = (t, a, b) => ease(seg(t, a, b));
const bump = (t, a, b) => { const u = seg(t, a, b); return Math.sin(u * Math.PI); };
function rnd(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
const rgba = (rgb, a) => `rgba(${rgb},${a})`;

// ---------- drawing primitives ----------
function P(c, pts, close = true) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); if (close) c.closePath(); }
function fs(c, fill, lw = 0, stroke = OUT) { if (fill) { c.fillStyle = fill; c.fill(); } if (lw) { c.lineWidth = lw; c.strokeStyle = stroke; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); } }
function ln(c, pts, w, col) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.lineWidth = w; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); }
function el(c, x, y, rx, ry, r = 0) { c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), r, 0, TAU); }
function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function lg(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; }
function rg(c, x, y, r0, r1, stops) { const g = c.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; }
function glow(c, x, y, r, col, a, mode = 'lighter') { c.save(); c.globalCompositeOperation = mode; c.fillStyle = rg(c, x, y, 0, r, [[0, rgba(col, a)], [.3, rgba(col, a * .4)], [1, rgba(col, 0)]]); c.fillRect(x - r, y - r, r * 2, r * 2); c.restore(); }
// volumetric beam (screen space): from (x0,y0) width w0 to (x1,y1) width w1
function beam(c, x0, y0, x1, y1, w0, w1, col, a, mode = 'screen') {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  c.save(); c.globalCompositeOperation = mode;
  c.fillStyle = lg(c, x0, y0, x1, y1, [[0, rgba(col, a)], [.55, rgba(col, a * .5)], [1, rgba(col, 0)]]);
  P(c, [x0 + nx * w0 / 2, y0 + ny * w0 / 2, x1 + nx * w1 / 2, y1 + ny * w1 / 2, x1 - nx * w1 / 2, y1 - ny * w1 / 2, x0 - nx * w0 / 2, y0 - ny * w0 / 2]); c.fill();
  c.restore();
}
function txt(c, s, x, y, size, col, o = {}) {
  c.save(); c.font = `${o.weight || 700} ${size}px ${o.font || '"DejaVu Serif"'}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
  if (o.spacing) c.letterSpacing = o.spacing + 'px';
  if (o.stroke) { c.lineWidth = o.stroke; c.strokeStyle = o.strokeCol || OUT; c.lineJoin = 'round'; c.strokeText(s, x, y); }
  c.fillStyle = col; c.fillText(s, x, y); c.restore();
}

// ---------- offscreen pool ----------
const POOL = {};
function off(name) { let o = POOL[name]; if (!o) { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; o = POOL[name] = { cv, c: cv.getContext('2d') }; } o.c.setTransform(1, 0, 0, 1, 0, 0); o.c.globalAlpha = 1; o.c.globalCompositeOperation = 'source-over'; o.c.filter = 'none'; o.c.clearRect(0, 0, W, H); return o; }

// ---------- camera / projection ----------
// cam: { x, y (eye height, negative), z, f (focal px), hy (horizon screen y) }
function proj(cam, X, Y, Z) { const d = Z - cam.z, s = cam.f / d; return { x: W / 2 + (X - cam.x) * s, y: cam.hy + (Y - cam.y) * s, s }; }
// run fn in a local frame placed at world (X,Y,Z) with scale s (flat billboard facing camera)
function at(c, cam, X, Y, Z, fn) { const p = proj(cam, X, Y, Z); if (Z - cam.z < 20) return; c.save(); c.translate(p.x, p.y); c.scale(p.s, p.s); fn(c, p.s); c.restore(); }
// ground point to screen
function gp(cam, X, Z, Y = 0) { return proj(cam, X, Y, Z); }
// fill ground quad between x0..x1 and z0..z1 (world)
function groundQuad(c, cam, x0, x1, z0, z1, fill, Y = 0) { if (z1 < cam.z + 60) return; z0 = Math.max(z0, cam.z + 60); const a = gp(cam, x0, z0, Y), b = gp(cam, x1, z0, Y), d = gp(cam, x1, z1, Y), e = gp(cam, x0, z1, Y); P(c, [a.x, a.y, b.x, b.y, d.x, d.y, e.x, e.y]); c.fillStyle = fill; c.fill(); }

// ---------- depth layers with soft depth of field ----------
// Scene draws into three buffers: bg (soft), mid (sharp), fg (very soft). compose() merges them.
function layers() { return { bg: off('L_bg'), mid: off('L_mid'), fg: off('L_fg') }; }
function compose(c, Ls, o = {}) {
  const bb = o.bgBlur ?? 2.2, fb = o.fgBlur ?? 9;
  c.save(); c.filter = bb > .3 ? `blur(${bb}px)` : 'none'; c.drawImage(Ls.bg.cv, 0, 0); c.filter = 'none';
  c.drawImage(Ls.mid.cv, 0, 0);
  c.filter = fb > .3 ? `blur(${fb}px)` : 'none'; c.drawImage(Ls.fg.cv, 0, 0); c.restore();
}

// ---------- character lighting: draw characters into a sprite, add key/fill shading + rim ----------
// light: { kx, ky: key direction (screen, unit-ish; light COMES FROM this direction), key: 'r,g,b', keyA, fill:'r,g,b', fillA (shadow side tint), rim:'r,g,b', rimA, rimW }
function litChars(c, drawFn, L) {
  const S = off('C_s'), R = off('C_r');
  drawFn(S.c);
  // shading: gradient across the screen along the key direction, multiplied onto the sprite
  const kx = L.kx ?? -1, ky = L.ky ?? -.3, n = Math.hypot(kx, ky), ux = kx / n, uy = ky / n;
  const cx = L.cx ?? W / 2, cy = L.cy ?? H / 2, span = L.span ?? 420;
  S.c.save(); S.c.globalCompositeOperation = 'source-atop';
  S.c.fillStyle = lg(S.c, cx + ux * span, cy + uy * span, cx - ux * span, cy - uy * span, [[0, rgba(L.key || '255,210,150', L.keyA ?? .22)], [.5, 'rgba(0,0,0,0)'], [1, rgba(L.fill || '40,50,90', L.fillA ?? .38)]]);
  S.c.fillRect(0, 0, W, H); S.c.restore();
  // rim: silhouette minus the silhouette shifted away from the rim light
  const rx = L.rx ?? -kx, ry = L.ry ?? -.2, rn = Math.hypot(rx, ry), rw = L.rimW ?? 9;
  R.c.drawImage(S.cv, 0, 0); R.c.globalCompositeOperation = 'source-in'; R.c.fillStyle = rgba(L.rim || '255,230,190', 1); R.c.fillRect(0, 0, W, H);
  R.c.globalCompositeOperation = 'destination-out'; R.c.drawImage(S.cv, -rx / rn * rw, -ry / rn * rw);
  R.c.globalCompositeOperation = 'source-over';
  S.c.save(); S.c.globalCompositeOperation = 'source-atop'; S.c.globalAlpha = L.rimA ?? .85; S.c.filter = 'blur(1.5px)'; S.c.drawImage(R.cv, 0, 0); S.c.restore();
  if (L.rim2) { // second, dimmer rim from the other side
    R.c.globalCompositeOperation = 'source-over'; R.c.clearRect(0, 0, W, H); R.c.drawImage(S.cv, 0, 0); R.c.globalCompositeOperation = 'source-in'; R.c.fillStyle = rgba(L.rim2, 1); R.c.fillRect(0, 0, W, H);
    R.c.globalCompositeOperation = 'destination-out'; R.c.drawImage(S.cv, rx / rn * rw * .7, ry / rn * rw * .7); R.c.globalCompositeOperation = 'source-over';
    S.c.save(); S.c.globalCompositeOperation = 'source-atop'; S.c.globalAlpha = L.rim2A ?? .45; S.c.drawImage(R.cv, 0, 0); S.c.restore();
  }
  c.drawImage(S.cv, 0, 0);
}

// ---------- screen grade ----------
function grade(c, o) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  if (o.lift) { c.globalCompositeOperation = 'screen'; c.fillStyle = rgba(o.lift, o.liftA ?? .06); c.fillRect(0, 0, W, H); }
  if (o.warm) { c.globalCompositeOperation = 'soft-light'; c.fillStyle = rg(c, (o.wx ?? .3) * W, (o.wy ?? .3) * H, 0, H * 1.1, [[0, rgba(o.warm, o.warmA ?? .35)], [1, rgba(o.warm, 0)]]); c.fillRect(0, 0, W, H); }
  if (o.cool) { c.globalCompositeOperation = 'multiply'; c.fillStyle = lg(c, (o.wx ?? .3) * W, (o.wy ?? .3) * H, (1 - (o.wx ?? .3)) * W, H, [[0, rgba(o.cool, 0)], [1, rgba(o.cool, o.coolA ?? .35)]]); c.fillRect(0, 0, W, H); }
  if (o.tint) { c.globalCompositeOperation = o.tintMode || 'color'; c.fillStyle = rgba(o.tint, o.tintA ?? .3); c.fillRect(0, 0, W, H); }
  c.globalCompositeOperation = 'multiply'; // vignette
  c.fillStyle = rg(c, W / 2, H * (o.vy ?? .5), H * .28, H * .72, [[0, 'rgba(255,255,255,1)'], [1, rgba(o.vig || '20,14,24', 1)]]);
  c.globalAlpha = o.vigA ?? .55; c.fillRect(0, 0, W, H);
  c.restore();
}

// ---------- particles ----------
function dust(c, x0, x1, y0, y1, t, o = {}) {
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < (o.n || 40); i++) {
    const s = o.seed || 0, ph = (t * (o.speed || .025) + rnd(i + 11 + s)) % 1;
    const x = x0 + rnd(i + 37 + s) * (x1 - x0) + Math.sin(t * .5 + i) * 18, y = y1 - ph * (y1 - y0) * (o.rise ?? 1) - (1 - (o.rise ?? 1)) * rnd(i + 59 + s) * (y1 - y0);
    const r = (o.r || 2.2) * (.6 + rnd(i + 71 + s)), a = (o.a || .5) * Math.sin(ph * Math.PI) * (.5 + .5 * Math.sin(t * 1.3 + i * 2));
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = rgba(o.col || '255,225,170', a); c.fill();
  }
  c.restore();
}
function leaf(c, x, y, r, a, col) { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.moveTo(-r, 0); c.quadraticCurveTo(0, -r * .7, r, 0); c.quadraticCurveTo(0, r * .7, -r, 0); c.fillStyle = col; c.fill(); c.lineWidth = Math.max(1, r * .12); c.strokeStyle = 'rgba(60,30,10,.6)'; c.stroke(); c.restore(); }
const LEAFC = ['#e0a030', '#d06a22', '#c9471e', '#f0c24a', '#b9581c'];
// leaves drifting left->right across the screen
function leaves(c, t, o = {}) {
  for (let i = 0; i < (o.n || 18); i++) {
    const s = o.seed || 0, sp = (o.speed || 90) * (.6 + rnd(i + s + 3) * .8), ph = rnd(i + s + 9) * (W + 400);
    const x = ((ph + t * sp) % (W + 400)) - 200, y = (o.y0 ?? 0) + rnd(i + s + 21) * ((o.y1 ?? H) - (o.y0 ?? 0)) + Math.sin(t * 1.4 + i) * 40 + t * (o.fall || 25);
    leaf(c, x, ((y % H) + H) % H, (o.r || 14) * (.6 + rnd(i + s + 33) * .8), t * 2 + i, LEAFC[i % 5]);
  }
}
function fog(c, y, h, col, a, t, o = {}) {
  c.save(); c.globalCompositeOperation = o.mode || 'screen';
  for (let i = 0; i < (o.n || 6); i++) {
    const x = ((rnd(i + 400) * W * 1.6 + t * (o.speed || 12) * (1 + i * .2)) % (W * 1.6)) - W * .3, yy = y + (rnd(i + 410) - .5) * h;
    const r = (o.r || 420) * (.7 + rnd(i + 420) * .6);
    c.fillStyle = rg(c, x, yy, 0, r, [[0, rgba(col, a)], [1, rgba(col, 0)]]); c.beginPath(); c.ellipse(x, yy, r, r * .35, 0, 0, TAU); c.fill();
  }
  c.restore();
}
function steam(c, x, y, t, o = {}) { // rising puffs from a point (screen space)
  c.save(); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < (o.n || 10); i++) {
    const ph = (t * (o.speed || .25) + i / (o.n || 10)) % 1, r = (o.r || 60) * (.4 + ph * 1.8);
    const xx = x + Math.sin(i * 2.1 + t) * 30 * ph + (o.dx || 0) * ph, yy = y - ph * (o.rise || 500);
    c.fillStyle = rg(c, xx, yy, 0, r, [[0, rgba(o.col || '235,235,240', (o.a || .45) * (1 - ph))], [1, rgba(o.col || '235,235,240', 0)]]);
    c.beginPath(); c.arc(xx, yy, r, 0, TAU); c.fill();
  }
  c.restore();
}
function flame(c, x, y, s, t, i = 0) { // candle flame at (x,y) = wick top
  const fl = 1 + Math.sin(t * 13 + i) * .06 + Math.sin(t * 7.3 + i * 2) * .05, sw = Math.sin(t * 5 + i) * .08;
  glow(c, x, y - 14 * s, 260 * s * fl, '255,170,80', .55);
  c.save(); c.translate(x, y); c.scale(s, s * fl); c.rotate(sw);
  c.beginPath(); c.moveTo(0, -46); c.quadraticCurveTo(14, -16, 9, -2); c.quadraticCurveTo(0, 6, -9, -2); c.quadraticCurveTo(-14, -16, 0, -46); c.fillStyle = '#ffd27a'; c.fill();
  c.beginPath(); c.moveTo(0, -30); c.quadraticCurveTo(6, -10, 4, -2); c.quadraticCurveTo(0, 2, -4, -2); c.quadraticCurveTo(-6, -10, 0, -30); c.fillStyle = '#fff6dc'; c.fill();
  c.restore();
}
function candle(c, x, y, s, t, i = 0, h = 120) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rr(c, -16, -h, 32, h, 4); fs(c, lg(c, -16, 0, 16, 0, [[0, '#f3e2bf'], [.6, '#e9cf9c'], [1, '#b89a68']]), 3);
  P(c, [-16, -h + 4, -8, -h + 22, -4, -h + 6, 6, -h + 30, 10, -h + 4]); c.fillStyle = '#fbf0d4'; c.fill();
  ln(c, [0, -h, 0, -h - 10], 3, '#2a2018');
  c.restore();
  flame(c, x, y - (h + 8) * s, s, t, i);
}

// ---------- film timeline ----------
// SHOTS: [{ t0, t1, draw(c, lt, gt) }]; TR: transitions between i and i+1: { type: 'dis'|'dip', d }
let SHOTS = [], TR = [], DURATION = 1;
function defineFilm(o) { SHOTS = o.shots; TR = o.tr || []; DURATION = o.duration; window.__film = { FPS, DURATION, renderAt }; }
const main = document.getElementById('film'), MC = main.getContext('2d');
function drawShot(i, c, gt) { const s = SHOTS[i]; c.save(); c.fillStyle = '#000'; c.fillRect(0, 0, W, H); s.draw(c, gt - s.t0, gt); c.restore(); }
function renderAt(gt) {
  const c = MC; c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  let i = SHOTS.findIndex(s => gt < s.t1); if (i < 0) i = SHOTS.length - 1;
  // transition with previous or next shot
  const tp = i > 0 ? TR[i - 1] : null, tn = TR[i], b0 = SHOTS[i].t0, b1 = SHOTS[i].t1;
  let A = i, B = -1, u = 0, type = null;
  if (tp && gt < b0 + tp.d / 2) { A = i - 1; B = i; u = (gt - (b0 - tp.d / 2)) / tp.d; type = tp.type; }
  else if (tn && i < SHOTS.length - 1 && gt > b1 - tn.d / 2) { A = i; B = i + 1; u = (gt - (b1 - tn.d / 2)) / tn.d; type = tn.type; }
  if (B < 0) { drawShot(A, c, gt); }
  else if (type === 'dip') {
    const k = ease(u < .5 ? u * 2 : (u - .5) * 2);
    drawShot(u < .5 ? A : B, c, gt);
    c.fillStyle = `rgba(0,0,0,${(u < .5 ? k : 1 - k) * .9})`; c.fillRect(0, 0, W, H);
  } else {
    const o = off('T_b'); drawShot(A, c, gt); drawShot(B, o.c, gt);
    c.globalAlpha = ease(u); c.drawImage(o.cv, 0, 0); c.globalAlpha = 1;
  }
  if (window.__fadeOut) { const f = seg(gt, DURATION - .35, DURATION); if (f > 0) { c.fillStyle = `rgba(0,0,0,${ease(f)})`; c.fillRect(0, 0, W, H); } }
}
