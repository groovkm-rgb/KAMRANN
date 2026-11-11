// post.js: 2D compositing on the output canvas.
// - finishLayer: legend look (painted brushy border, flicker, warm fairy-tale glow) on sepia shots
// - compose: transitions (page turn, smoke, bubble pop, fade, whip, flash) between two rendered layers
// - overlay: floating legend bubbles in the archive (snapshots of legend shots that pop one by one)
// No text is ever drawn here.
const W = 1080, H = 1920;
const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const cv = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const easeOut = (t) => 1 - (1 - clamp(t)) ** 3;

let borders = [], grain = null, smokeTex = [], snaps = [];
const SNAP_FILES = ['snap/s1.jpg', 'snap/s2.jpg', 'snap/s3.jpg', 'snap/s4.jpg', 'snap/s5.jpg'];

function makeBorder(seed) {
  const c = cv(), g = c.getContext('2d'), r = rng(seed);
  // soft warm vignette
  const vg = g.createRadialGradient(W / 2, H * 0.48, H * 0.28, W / 2, H * 0.5, H * 0.66);
  vg.addColorStop(0, 'rgba(60,34,16,0)'); vg.addColorStop(1, 'rgba(46,24,10,0.55)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // brush strokes along the four edges, like the unpainted rim of an old oil painting
  const stroke = (x0, y0, x1, y1, w, a) => {
    g.lineCap = 'round'; g.strokeStyle = `rgba(${34 + r() * 30 | 0},${18 + r() * 16 | 0},${8 + r() * 8 | 0},${a})`; g.lineWidth = w;
    g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + (r() - 0.5) * 20, (y0 + y1) / 2 + (r() - 0.5) * 20, x1, y1); g.stroke();
  };
  for (let pass = 0; pass < 3; pass++) {
    const depth = [26, 60, 110][pass], al = [0.95, 0.6, 0.28][pass], n = [140, 200, 160][pass];
    for (let i = 0; i < n; i++) {
      const e = i % 4, t = r(), len = depth * (0.4 + r()), w = 8 + r() * (pass === 0 ? 26 : 16), jitter = (r() - 0.5) * 40;
      if (e === 0) stroke(t * W - 40, -10 + r() * depth * 0.3, t * W + 60 + jitter, r() * len, w, al);
      if (e === 1) stroke(t * W - 40, H + 10 - r() * depth * 0.3, t * W + 60 + jitter, H - r() * len, w, al);
      if (e === 2) stroke(-10 + r() * depth * 0.3, t * H - 50, r() * len, t * H + 70 + jitter, w, al);
      if (e === 3) stroke(W + 10 - r() * depth * 0.3, t * H - 50, W - r() * len, t * H + 70 + jitter, w, al);
    }
  }
  // light highlight dabs in the rim (impasto)
  for (let i = 0; i < 90; i++) {
    const e = i % 4, t = r(), d = 10 + r() * 50; g.strokeStyle = `rgba(230,196,140,${0.08 + r() * 0.12})`; g.lineWidth = 3 + r() * 5; g.lineCap = 'round';
    const pts = e === 0 ? [t * W, d] : e === 1 ? [t * W, H - d] : e === 2 ? [d, t * H] : [W - d, t * H];
    g.beginPath(); g.moveTo(pts[0], pts[1]); g.lineTo(pts[0] + (e < 2 ? 30 + r() * 30 : (r() - 0.5) * 8), pts[1] + (e < 2 ? (r() - 0.5) * 8 : 30 + r() * 30)); g.stroke();
  }
  return c;
}
function makeGrain(seed) { // canvas weave + brush texture (used with 'overlay')
  const c = document.createElement('canvas'); c.width = 540; c.height = 960; const g = c.getContext('2d'), r = rng(seed);
  g.fillStyle = '#808080'; g.fillRect(0, 0, 540, 960);
  for (let i = 0; i < 2600; i++) { const x = r() * 540, y = r() * 960, a = r() * Math.PI, L = 6 + r() * 22, v = r() > 0.5 ? 255 : 0;
    g.strokeStyle = `rgba(${v},${v},${v},${0.05 + r() * 0.07})`; g.lineWidth = 1.5 + r() * 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L * 0.4); g.stroke(); }
  for (let y = 0; y < 960; y += 3) { g.fillStyle = `rgba(0,0,0,${0.025})`; g.fillRect(0, y, 540, 1); }
  for (let x = 0; x < 540; x += 3) { g.fillStyle = `rgba(255,255,255,${0.02})`; g.fillRect(x, 0, 1, 960); }
  return c;
}
function makePuff(seed) {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), r = rng(seed);
  for (let i = 0; i < 18; i++) { const x = 256 + (r() - 0.5) * 240, y = 256 + (r() - 0.5) * 240, rad = 60 + r() * 110;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); }
  return c;
}
const loadImg = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });

export async function init() {
  borders = [makeBorder(11), makeBorder(23), makeBorder(37)];
  grain = makeGrain(5); smokeTex = [makePuff(3), makePuff(8), makePuff(13)];
  snaps = await Promise.all(SNAP_FILES.map(loadImg));
}

// ---------- legend look ----------
const flick = (f) => { const a = Math.sin(f * 1.7) * 0.5 + Math.sin(f * 4.3 + 1) * 0.3 + Math.sin(f * 0.37) * 0.2; return a; };
function weather(g, kind, f) {
  const r = rng(1000 + f * 7); g.save(); g.lineCap = 'round';
  if (kind === 'rain') { for (let i = 0; i < 160; i++) { const x = r() * (W + 400) - 200, y = r() * H, L = 60 + r() * 80; g.strokeStyle = `rgba(230,236,240,${0.25 + r() * 0.3})`; g.lineWidth = 2 + r() * 2.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x - L * 0.35, y + L); g.stroke(); } }
  if (kind === 'snow') { const r2 = rng(42); for (let i = 0; i < 140; i++) { const sp = 6 + r2() * 14, x0 = r2() * W, y0 = r2() * H, sz = 3 + r2() * 9; const y = (y0 + f * sp) % (H + 40) - 20, x = (x0 - f * sp * 0.9 + Math.sin(f * 0.1 + i) * 20 + W * 10) % W;
    g.fillStyle = `rgba(250,250,255,${0.55 + r2() * 0.4})`; g.beginPath(); g.ellipse(x, y, sz * 1.6, sz, -0.5, 0, Math.PI * 2); g.fill(); } }
  g.restore();
}
export function finishLayer(g, S, f) {
  if (S.weather) weather(g, S.weather, f);
  if (!S.legend || location.hash === '#nosep') return;
  g.save();
  // paint texture
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.55; g.drawImage(grain, 0, 0, W, H);
  // warm fairy-tale glow in the middle
  g.globalCompositeOperation = 'screen'; g.globalAlpha = 1;
  const gl = g.createRadialGradient(W / 2, H * 0.52, 0, W / 2, H * 0.52, H * 0.55);
  gl.addColorStop(0, `rgba(255,214,150,${0.13 + 0.03 * flick(f)})`); gl.addColorStop(1, 'rgba(255,214,150,0)');
  g.fillStyle = gl; g.fillRect(0, 0, W, H);
  // flicker like an old lantern-lit painting
  g.globalCompositeOperation = 'source-over'; g.fillStyle = `rgba(30,16,6,${0.045 + 0.035 * flick(f + 7)})`; g.fillRect(0, 0, W, H);
  // brushy painted rim, boiling every 3 frames
  g.globalAlpha = 1; g.drawImage(borders[Math.floor(f / 3) % 3], 0, 0);
  g.restore();
}

// ---------- transitions ----------
let bufB = null, mask = null;
function clipHalf(poly, P, d, s, keepLess) { // keep points with (p-P)·d < s (or > s)
  const out = [], f = (p) => (p[0] - P[0]) * d[0] + (p[1] - P[1]) * d[1] - s;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], fa = f(a) * (keepLess ? 1 : -1), fb = f(b) * (keepLess ? 1 : -1);
    if (fa <= 0) out.push(a);
    if ((fa < 0) !== (fb < 0)) { const t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
  }
  return out;
}
const poly = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };

function pageTurn(g, A, t) {
  const d0 = [-1, -0.36], dl = Math.hypot(...d0), d = [d0[0] / dl, d0[1] / dl], P = [W, H];
  const span = W * -d[0] + H * -d[1] + 30, s = easeOut(t) * span * 1.02;
  const rect = [[0, 0], [W, 0], [W, H], [0, H]];
  const keep = clipHalf(rect, P, d, s, false); // old page still lying flat
  const lifted = clipHalf(rect, P, d, s, true); // part that has turned over
  const L = [P[0] + d[0] * s, P[1] + d[1] * s];
  const refl = lifted.map(([x, y]) => { const k = (x - P[0]) * d[0] + (y - P[1]) * d[1]; const m = 2 * (s - k); return [x + d[0] * m, y + d[1] * m]; });
  // shadow on the new page along the fold
  g.save(); poly(g, lifted); g.clip();
  const sg = g.createLinearGradient(L[0], L[1], L[0] - d[0] * 160, L[1] - d[1] * 160); sg.addColorStop(0, 'rgba(20,10,4,0.55)'); sg.addColorStop(1, 'rgba(20,10,4,0)');
  g.fillStyle = sg; g.fillRect(0, 0, W, H); g.restore();
  if (keep.length > 2) { g.save(); poly(g, keep); g.clip(); g.drawImage(A, 0, 0); g.restore(); }
  if (refl.length > 2) {
    g.save(); g.beginPath(); g.rect(0, 0, W, H); g.clip();
    g.shadowColor = 'rgba(20,10,4,0.6)'; g.shadowBlur = 40; g.shadowOffsetX = -14; g.shadowOffsetY = -6;
    poly(g, refl); g.fillStyle = '#e9d6ae'; g.fill(); g.shadowColor = 'transparent';
    poly(g, refl); g.clip();
    const pg = g.createLinearGradient(L[0], L[1], L[0] + d[0] * 420, L[1] + d[1] * 420);
    pg.addColorStop(0, 'rgba(255,248,226,0.9)'); pg.addColorStop(0.35, 'rgba(236,214,170,0.2)'); pg.addColorStop(1, 'rgba(150,110,60,0.55)');
    g.fillStyle = pg; g.fillRect(0, 0, W, H);
    // faint paper fibres
    const r = rng(77); g.strokeStyle = 'rgba(120,86,40,0.18)'; g.lineWidth = 2;
    for (let i = 0; i < 60; i++) { const x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 30 + r() * 40, y + (r() - 0.5) * 6); g.stroke(); }
    g.restore();
    g.save(); poly(g, refl); g.lineWidth = 5; g.strokeStyle = 'rgba(70,44,20,0.85)'; g.stroke(); g.restore();
  }
}
function smoke(g, A, t, seed) {
  mask = mask || cv(); const m = mask.getContext('2d'), r = rng(seed);
  m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, W, H); m.drawImage(A, 0, 0);
  m.globalCompositeOperation = 'destination-out';
  const k = ease(t * 1.15);
  for (let i = 0; i < 26; i++) { const x = r() * W, y = r() * H, r0 = 160 + r() * 260, delay = r() * 0.45, kk = clamp((k - delay) / (1 - delay + 0.01) * 1.3);
    if (kk <= 0) continue; const rad = r0 * (0.3 + kk * 1.6); m.globalAlpha = clamp(kk * 1.4); m.drawImage(smokeTex[i % 3], x - rad, y - rad, rad * 2, rad * 2); m.drawImage(smokeTex[(i + 1) % 3], x - rad, y - rad, rad * 2, rad * 2); }
  m.globalAlpha = 1; if (k > 0.85) { m.globalAlpha = (k - 0.85) / 0.15; m.fillRect(0, 0, W, H); m.globalAlpha = 1; }
  g.drawImage(mask, 0, 0);
  // drifting smoke puffs over the cut
  const a = Math.sin(clamp(t) * Math.PI);
  g.save(); g.globalCompositeOperation = 'screen';
  for (let i = 0; i < 12; i++) { const x = r() * W, y = H * (0.15 + r() * 0.75) - t * 160, rad = (220 + r() * 260) * (0.8 + t * 0.6);
    g.globalAlpha = a * 0.55; g.drawImage(smokeTex[i % 3], x - rad, y - rad, rad * 2, rad * 2); }
  g.restore();
}
function bubblePop(g, A, t) {
  const R0 = 1150, cx = 540, cy0 = 960, cy1 = 880;
  if (t < 0.62) {
    const k = easeOut(t / 0.62), r = R0 + (330 - R0) * k, cy = cy0 + (cy1 - cy0) * k, wob = Math.sin(t * 40) * 0.035 * k;
    const rx = r * (1 + wob), ry = r * (1 - wob), sc = Math.max(0.42, r / R0 * 1.05);
    g.save(); g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.clip();
    g.drawImage(A, cx - W * sc / 2, cy - H * sc / 2 * 0.95, W * sc, H * sc);
    const sh = g.createRadialGradient(cx - rx * 0.3, cy - ry * 0.35, rx * 0.1, cx, cy, rx); sh.addColorStop(0, 'rgba(255,255,255,0.0)'); sh.addColorStop(0.8, 'rgba(255,255,255,0.05)'); sh.addColorStop(1, 'rgba(200,230,255,0.45)');
    g.fillStyle = sh; g.fillRect(cx - rx, cy - ry, rx * 2, ry * 2); g.restore();
    g.save(); g.lineWidth = 7; g.strokeStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 16; g.strokeStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.ellipse(cx, cy, rx * 0.84, ry * 0.84, 0, Math.PI * 1.08, Math.PI * 1.38); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(cx - rx * 0.46, cy - ry * 0.62, Math.max(6, rx * 0.05), 0, Math.PI * 2); g.fill(); g.restore();
  } else {
    const k = (t - 0.62) / 0.38, r = 330, cy = cy1, a = 1 - k;
    g.save(); g.lineCap = 'round';
    for (let i = 0; i < 14; i++) { const an = i / 14 * Math.PI * 2 + 0.2, r1 = r * (0.95 + k * 0.5), r2 = r1 + 50 + 40 * (1 - k);
      g.strokeStyle = `rgba(255,255,255,${0.9 * a})`; g.lineWidth = 10 * a + 2; g.beginPath(); g.moveTo(cx + Math.cos(an) * r1, cy + Math.sin(an) * r1); g.lineTo(cx + Math.cos(an) * r2, cy + Math.sin(an) * r2); g.stroke(); }
    const rr = rng(4);
    for (let i = 0; i < 26; i++) { const an = rr() * Math.PI * 2, dd = r * (0.8 + rr() * 0.6) + k * (120 + rr() * 260), s = (6 + rr() * 12) * a;
      g.fillStyle = `rgba(235,245,255,${0.9 * a})`; g.beginPath(); g.arc(cx + Math.cos(an) * dd, cy + Math.sin(an) * dd + k * k * 120, s, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
}
function whip(g, A, t, dir) {
  bufB = bufB || cv(); const b = bufB.getContext('2d'); b.clearRect(0, 0, W, H); b.drawImage(g.canvas, 0, 0);
  const src = t < 0.5 ? A : bufB, k = t < 0.5 ? t / 0.5 : (1 - t) / 0.5, off = (t < 0.5 ? -1 : 1) * dir * ease(k) * 380;
  g.save(); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 9; i++) { g.globalAlpha = i === 0 ? 1 : 0.22; g.drawImage(src, off + (i - 4) * k * 70 * dir, 0); }
  g.restore();
}

export function compose(g, A, tr, f) {
  const t = clamp((f - tr.f0) / tr.n);
  if (tr.type === 'page') pageTurn(g, A, t);
  else if (tr.type === 'smoke') smoke(g, A, t, tr.seed || 5);
  else if (tr.type === 'bubble') bubblePop(g, A, t);
  else if (tr.type === 'whip') whip(g, A, t, tr.dir || 1);
  else if (tr.type === 'fade') { g.save(); g.globalAlpha = 1 - ease(t); g.drawImage(A, 0, 0); g.restore(); }
  else if (tr.type === 'flash') { g.save(); if (t < 0.25) g.drawImage(A, 0, 0); g.fillStyle = `rgba(255,252,240,${t < 0.25 ? t / 0.25 : (1 - (t - 0.25) / 0.75) ** 1.5})`; g.fillRect(0, 0, W, H); g.restore(); }
}

// ---------- overlays ----------
// legend bubbles drifting over the archive and popping one by one (shot S.bubbles = [{x,y,r,img,pop}] with pop frame)
export function overlay(g, S, f) {
  if (!S.bubbles) return;
  for (const B of S.bubbles) {
    const age = f - S.a, x = B.x + Math.sin(age * 0.09 + B.x) * 22, y = B.y - age * (B.v || 3) + Math.cos(age * 0.07 + B.y) * 14;
    const wob = Math.sin(age * 0.5 + B.x) * 0.03, rx = B.r * (1 + wob), ry = B.r * (1 - wob);
    if (f < B.pop) {
      const im = snaps[B.img];
      g.save(); g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.clip();
      if (im) { const s = (B.r * 2.3) / Math.min(im.width, im.height); g.drawImage(im, x - im.width * s / 2, y - im.height * s * (B.cy || 0.45), im.width * s, im.height * s); }
      else { g.fillStyle = '#b48a56'; g.fill(); }
      const sh = g.createRadialGradient(x - rx * 0.3, y - ry * 0.35, rx * 0.1, x, y, rx); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.75, 'rgba(255,255,255,0.06)'); sh.addColorStop(1, 'rgba(200,230,255,0.5)');
      g.fillStyle = sh; g.fillRect(x - rx, y - ry, rx * 2, ry * 2); g.restore();
      g.save(); g.lineWidth = 5; g.strokeStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 10; g.strokeStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(x, y, rx * 0.82, ry * 0.82, 0, Math.PI * 1.1, Math.PI * 1.4); g.stroke(); g.restore();
    } else if (f < B.pop + 8) {
      const k = (f - B.pop) / 8, a = 1 - k; g.save(); g.lineCap = 'round';
      for (let i = 0; i < 10; i++) { const an = i / 10 * Math.PI * 2, r1 = B.r * (0.9 + k * 0.5), r2 = r1 + 30 * a + 10;
        g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = 7 * a + 1; g.beginPath(); g.moveTo(x + Math.cos(an) * r1, y + Math.sin(an) * r1); g.lineTo(x + Math.cos(an) * r2, y + Math.sin(an) * r2); g.stroke(); }
      const rr = rng(B.pop);
      for (let i = 0; i < 12; i++) { const an = rr() * Math.PI * 2, dd = B.r * (0.7 + rr() * 0.5) + k * 90; g.fillStyle = `rgba(240,248,255,${a})`; g.beginPath(); g.arc(x + Math.cos(an) * dd, y + Math.sin(an) * dd + k * k * 60, (4 + rr() * 7) * a, 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
  }
}
