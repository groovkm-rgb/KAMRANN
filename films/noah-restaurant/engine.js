// Vertical (1080x1920, 30 fps) canvas engine for the Noah restaurant short.
// Set coordinates: (0,0) = screen centre at rest camera; 1 unit = 1 px at cam.z = 1.
const W = 1080, H = 1920, FPS = 30, CX = 540, CY = 960;
const OUT = '#211c1a';
const FONT = () => (typeof NOAH_FONT !== 'undefined' ? NOAH_FONT : 'Inter') + ', Inter, "DejaVu Sans", sans-serif';
function rnd(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const easeOut = k => 1 - Math.pow(1 - clamp(k), 3);
const easeIn = k => Math.pow(clamp(k), 3);
const easeBack = k => { const c1 = 1.9, c3 = c1 + 1; k = clamp(k); return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const seg = (t, a, b) => clamp((t - a) / (b - a));
const bump = (t, a, b) => { const k = seg(t, a, b); return Math.sin(k * Math.PI); };
function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function shade(hex, k) { const n = parseInt(hex.slice(1), 16); const f = v => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join(''); }
function rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
// fill + ink stroke
function fs(c, fill, w = 4, ink = OUT) { if (fill) { c.fillStyle = fill; c.fill(); } if (w) { c.lineWidth = w; c.strokeStyle = ink; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); } }
function line(c, pts, w, col) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.lineWidth = w; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); }
function box(c, x, y, w, h, fill, ink = 4) { c.beginPath(); c.rect(x, y, w, h); fs(c, fill, ink); }
function ell(c, x, y, rx, ry, fill, ink = 4) { c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2); fs(c, fill, ink); }
function txt(c, s, x, y, size, col, align = 'center', o = {}) {
  c.font = `${o.weight || 700} ${size}px ${FONT()}`; c.textAlign = align; c.textBaseline = o.base || 'alphabetic';
  if (o.stroke) { c.lineWidth = o.stroke; c.strokeStyle = o.ink || OUT; c.lineJoin = 'round'; c.strokeText(s, x, y); }
  c.fillStyle = col; c.fillText(s, x, y); return c.measureText(s).width;
}

// ---------- offscreen pools ----------
const POOL = [];
function pool(i) { if (!POOL[i]) { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; POOL[i] = cv; } const x = POOL[i].getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.filter = 'none'; x.clearRect(0, 0, W, H); return POOL[i]; }
let POOLD = 4;  // 0..3 reserved for lit(); blur layers use 4+
// draw fn into an offscreen with the same transform, then composite blurred
function blurred(c, px, fn, alpha = 1) {
  if (px <= .3) { fn(c); return; }
  const cv = pool(POOLD++), x = cv.getContext('2d'); x.setTransform(c.getTransform()); fn(x);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = alpha; c.filter = `blur(${px}px)`; c.drawImage(cv, 0, 0); c.restore(); POOLD--;
}

// ---------- camera / parallax ----------
// cam: { x, y, z, r }  p: depth factor (1 = subject plane, <1 far, >1 near)
function layer(c, cam, p, fn, blur = 0) {
  c.save(); const zp = Math.max(.05, 1 + (cam.z - 1) * p);
  c.translate(CX + (cam.sx || 0), CY + (cam.sy || 0)); c.rotate((cam.r || 0) * Math.min(1, p)); c.scale(zp, zp); c.translate(-cam.x * p, -cam.y * p);
  if (blur > .3) blurred(c, blur * zp, fn); else fn(c);
  c.restore();
}
// screen position of a set point on layer p
function toScreen(cam, p, x, y) { const zp = 1 + (cam.z - 1) * p, r = (cam.r || 0) * Math.min(1, p); const dx = (x - cam.x * p) * zp, dy = (y - cam.y * p) * zp; return [CX + dx * Math.cos(r) - dy * Math.sin(r), CY + dx * Math.sin(r) + dy * Math.cos(r)]; }

// ---------- character lighting: key/fill shading + rim light ----------
// L: { lx, ly (direction TO key light, screen), key:'r,g,b', keyA, fill:'r,g,b', fillA, rim:'r,g,b', rimA, rimW, rim2 (opposite rim) }
function lit(c, fn, L = {}) {
  const A = pool(0), a = A.getContext('2d'); a.setTransform(c.getTransform()); fn(a);
  a.setTransform(1, 0, 0, 1, 0, 0);
  const lx = L.lx ?? .7, ly = L.ly ?? -.7, n = Math.hypot(lx, ly) || 1, ux = lx / n, uy = ly / n;
  // shading gradient across the frame along the light direction, centered on L.cx/L.cy (screen)
  const cx = L.cx ?? CX, cy = L.cy ?? CY, R = L.R ?? 500;
  a.globalCompositeOperation = 'source-atop';
  const g = a.createLinearGradient(cx + ux * R, cy + uy * R, cx - ux * R, cy - uy * R);
  g.addColorStop(0, `rgba(${L.key || '255,210,150'},${L.keyA ?? .16})`); g.addColorStop(.45, `rgba(${L.key || '255,210,150'},0)`);
  g.addColorStop(.55, `rgba(${L.fill || '40,50,90'},0)`); g.addColorStop(1, `rgba(${L.fill || '40,50,90'},${L.fillA ?? .38})`);
  a.fillStyle = g; a.fillRect(0, 0, W, H);
  if (L.tint) { a.fillStyle = `rgba(${L.tint},${L.tintA ?? .12})`; a.fillRect(0, 0, W, H); }
  a.globalCompositeOperation = 'source-over';
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(A, 0, 0); c.restore();
  // rim
  const rims = [[ux, uy, L.rim || '255,225,170', L.rimA ?? .95, L.rimW ?? 9]];
  if (L.rim2) rims.push([-ux * .9 + .2, uy * .4 - .3, L.rim2, L.rim2A ?? .6, (L.rimW ?? 9) * .7]);
  for (const [rx, ry, col, ra, rw] of rims) {
    const B = pool(1), b = B.getContext('2d');
    b.drawImage(A, 0, 0); b.globalCompositeOperation = 'destination-out'; b.drawImage(A, -rx * rw, -ry * rw);
    b.globalCompositeOperation = 'source-in'; b.fillStyle = `rgb(${col})`; b.fillRect(0, 0, W, H);
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'screen'; c.globalAlpha = ra; c.filter = 'blur(1.6px)'; c.drawImage(B, 0, 0);
    c.globalAlpha = ra * .5; c.filter = 'blur(7px)'; c.drawImage(B, 0, 0); c.restore();
  }
}

function haze(c, col = '200,220,240', a = .25) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(${col},${a})`; c.fillRect(0, 0, W, H); c.restore(); }
// ---------- light helpers (screen-space unless noted) ----------
function glow(c, x, y, r, col = '255,210,140', a = .5, mode = 'screen') {
  const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(.3, `rgba(${col},${a * .4})`); g.addColorStop(1, `rgba(${col},0)`);
  c.save(); c.globalCompositeOperation = mode; c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
}
// volumetric beam from (x0,y0) to (x1,y1), widths w0 -> w1
function beam(c, x0, y0, x1, y1, w0, w1, col = '255,230,180', a = .25, t = 0, seed = 0) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), px = -dy / L, py = dx / L;
  c.save(); c.globalCompositeOperation = 'screen';
  const g = c.createLinearGradient(x0, y0, x1, y1), aa = a * (1 + Math.sin(t * 1.3 + seed) * .08);
  g.addColorStop(0, `rgba(${col},${aa})`); g.addColorStop(.55, `rgba(${col},${aa * .55})`); g.addColorStop(1, `rgba(${col},0)`);
  c.beginPath(); c.moveTo(x0 + px * w0 / 2, y0 + py * w0 / 2); c.lineTo(x1 + px * w1 / 2, y1 + py * w1 / 2); c.lineTo(x1 - px * w1 / 2, y1 - py * w1 / 2); c.lineTo(x0 - px * w0 / 2, y0 - py * w0 / 2); c.closePath();
  c.fillStyle = g; c.filter = 'blur(10px)'; c.fill(); c.filter = 'none';
  c.restore();
}
// dust motes in a region (any space)
function dust(c, x0, x1, y0, y1, t, o = {}) {
  c.save(); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < (o.n || 50); i++) {
    const s = (o.seed || 0) + i, ph = (t * (o.speed || .025) + rnd(s + 800)) % 1, x = x0 + rnd(s + 820) * (x1 - x0) + Math.sin(t * .5 + i) * 25;
    const y = o.fall ? y0 + ph * (y1 - y0) : y1 - ph * (y1 - y0), r = (o.r || 1) * (1.6 + rnd(s + 840) * 3.2), a = (o.alpha || .7) * Math.sin(ph * Math.PI) * (.4 + .6 * rnd(s + 860));
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = `rgba(${o.color || '255,245,215'},${a})`; c.fill();
  }
  c.restore();
}
// rain streaks over the whole screen
function rain(c, t, o = {}) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'screen'; c.lineCap = 'round';
  const n = o.n || 160, ang = o.ang ?? .12, sp = o.speed || 2400, len = o.len || 60;
  for (let i = 0; i < n; i++) {
    const z = .4 + rnd(i + 40) * .9, x0 = rnd(i + 11) * (W + 400) - 200, ph = (t * sp * z / H + rnd(i + 77)) % 1, y = ph * (H + 300) - 150, x = x0 + y * ang;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x - ang * len * z, y - len * z); c.lineWidth = 1.2 + z * 1.6; c.strokeStyle = `rgba(${o.col || '190,210,255'},${(o.a || .35) * z})`; c.stroke();
  }
  c.restore();
}
// splashes on a ground line (set space)
function splashes(c, x0, x1, y0, y1, t, n = 30) {
  for (let i = 0; i < n; i++) {
    const ph = (t * 2.2 + rnd(i + 300)) % 1, x = x0 + rnd(i + 310 + Math.floor(t * 2.2 + rnd(i + 300))) * (x1 - x0), y = y0 + rnd(i + 330) * (y1 - y0);
    c.beginPath(); c.ellipse(x, y, 4 + ph * 22, 1.5 + ph * 6, 0, 0, Math.PI * 2); c.strokeStyle = `rgba(200,220,255,${(1 - ph) * .5})`; c.lineWidth = 2; c.stroke();
  }
}
// whole-frame grade: warm light from (sx,sy), cool shadows, contrast tint, vignette
function gradeFrame(c, o = {}) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const sx = (o.sx ?? .5) * W, sy = (o.sy ?? .3) * H;
  let g = c.createRadialGradient(sx, sy, 0, sx, sy, H * (o.wr || .9)); g.addColorStop(0, `rgba(${o.warm || '255,190,110'},${o.warmA ?? .3})`); g.addColorStop(1, `rgba(${o.warm || '255,190,110'},0)`);
  c.globalCompositeOperation = 'soft-light'; c.fillStyle = g; c.fillRect(0, 0, W, H);
  if (o.tint) { c.globalCompositeOperation = 'soft-light'; c.fillStyle = `rgba(${o.tint},${o.tintA ?? .35})`; c.fillRect(0, 0, W, H); }
  g = c.createRadialGradient(sx, sy, H * .25, sx, sy, H * 1.1); g.addColorStop(0, `rgba(${o.cool || '20,25,60'},0)`); g.addColorStop(1, `rgba(${o.cool || '20,25,60'},${o.coolA ?? .45})`);
  c.globalCompositeOperation = 'multiply'; c.fillStyle = g; c.fillRect(0, 0, W, H);
  // vignette
  g = c.createRadialGradient(CX, CY * .95, H * .3, CX, CY, H * .78); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(5,4,10,${o.vig ?? .55})`);
  c.globalCompositeOperation = 'source-over'; c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.restore();
}
// halation / bloom of the finished frame + film grain
let GRAIN = null;
function postFx(c, t, o = {}) {
  const sm = pool(3); sm.width = 270; sm.height = 480; const s = sm.getContext('2d');
  s.filter = 'brightness(.9) contrast(2.2) blur(6px)'; s.drawImage(c.canvas, 0, 0, 270, 480); s.filter = 'none';
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'screen'; c.globalAlpha = o.bloom ?? .22; c.drawImage(sm, 0, 0, W, H); c.restore();
  sm.width = W; sm.height = H;
  if (!GRAIN) { GRAIN = document.createElement('canvas'); GRAIN.width = 512; GRAIN.height = 512; const g = GRAIN.getContext('2d'), d = g.createImageData(512, 512); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (rnd(i * .37) - .5) * 90; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); }
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'overlay'; c.globalAlpha = .07;
  const ox = Math.floor(rnd(Math.floor(t * 30)) * 512), oy = Math.floor(rnd(Math.floor(t * 30) + 9) * 512);
  for (let x = -ox; x < W; x += 512) for (let y = -oy; y < H; y += 512) c.drawImage(GRAIN, x, y);
  c.restore();
}

// ---------- shots / film ----------
const SHOTS = [];
function shot(t0, t1, draw, o = {}) { SHOTS.push(Object.assign({ t0, t1, draw }, o)); }
let DURATION = 0;
function drawShot(c, s, t) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.filter = 'none';
  c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  s.draw(c, t - s.t0, t, s); c.restore();
}
// transitions: s.tin = { type: 'whip', dir: [dx,dy], d } applied at the start of a shot
function renderAt(c, t) {
  let i = SHOTS.findIndex(s => t >= s.t0 && t < s.t1); if (i < 0) i = SHOTS.length - 1;
  const s = SHOTS[i];
  drawShot(c, s, t);
  const tr = s.tin;
  if (tr && i > 0 && t - s.t0 < (tr.d || .2)) {
    // whip: the previous shot streaks out, this one streaks in (incoming already drawn)
    const k = (t - s.t0) / (tr.d || .2), prev = SHOTS[i - 1];
    const P = pool(2), p = P.getContext('2d'); drawShot(p, prev, prev.t1 - .001 + (t - s.t0));
    const cur = pool(5), cc = cur.getContext('2d'); cc.drawImage(c.canvas, 0, 0);
    const [dx, dy] = tr.dir || [0, 1], D = (tr.type === 'whip' ? 900 : 0);
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    const mb = 26 * Math.sin(k * Math.PI) + 2;
    c.filter = `blur(${mb}px)`;
    c.globalAlpha = 1; c.drawImage(P, -dx * D * easeIn(k * .5 + .5) * 1.2, -dy * D * easeIn(k * .5 + .5) * 1.2);
    c.globalAlpha = easeOut(k * 1.3); c.drawImage(cur, dx * D * (1 - easeOut(k)), dy * D * (1 - easeOut(k)));
    c.restore();
  }
  if (tr && tr.type === 'flash' && t - s.t0 < .12) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(255,250,235,${1 - (t - s.t0) / .12})`; c.fillRect(0, 0, W, H); c.restore(); }
  postFx(c, t, s.post || {});
}
