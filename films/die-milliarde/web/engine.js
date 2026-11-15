// engine.js: time-based shot engine. Shots are authored in seconds (voice timings); frames = seconds * FPS.
import * as TT from './toon.js';
export const FPS = 30, DUR = 597.81, TOTAL = Math.round(DUR * FPS);
export const SH = [];
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const easeOut = (t) => 1 - (1 - clamp(t)) ** 3.2;
export const easeIn = (t) => clamp(t) ** 2.4;
export const lerp = (a, b, t) => a + (b - a) * t;
export const lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
export const ramp = (x, a, b) => clamp((x - a) / (b - a));
export const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
export const pulse = (x, a, d = 0.25) => { const k = (x - a) / d; return k < 0 || k > 1 ? 0 : Math.sin(k * Math.PI); };

/** add a shot: t0 seconds, set name, options {light, cam, act, fx, w, dof, shake, flash, xf, tint, lightMod} */
export const S = (t0, set, o = {}) => { SH.push({ t0, set, ...o }); };
export function finalize() {
  SH.sort((a, b) => a.t0 - b.t0);
  SH.forEach((s, i) => { s.i = i; s.t1 = i + 1 < SH.length ? SH[i + 1].t0 : DUR; s.a = Math.round(s.t0 * FPS); s.b = Math.round(s.t1 * FPS) - 1; s.d = s.t1 - s.t0; s.id = s.id || `${s.set}${i}`; });
}
let cacheF = null, cacheV = null;
export function ev(f) {
  const force = globalThis.FORCE_SHOT;
  if (cacheF === f && cacheV && cacheV.force === force) return cacheV;
  const t = f / FPS; let s;
  if (force !== undefined && force !== null) s = SH[force];
  else { let lo = 0, hi = SH.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (SH[m].t0 <= t + 1e-6) lo = m; else hi = m - 1; } s = SH[lo]; }
  const lt = t - s.t0, u = lt / s.d;
  const c = { f, t, lt, u, s, force };
  cacheF = f; cacheV = c; return c;
}
// ------------- camera -------------
/** keys: [{u|at, p, l, fov, roll, e}] */
export function camKeys(keys, c) {
  const K = keys.map((k) => ({ ...k, tt: k.at !== undefined ? (k.at < 0 ? c.s.d + k.at : k.at) : (k.u ?? 0) * c.s.d }));
  const x = c.lt;
  if (x <= K[0].tt) return { p: K[0].p, l: K[0].l, fov: K[0].fov ?? 40, roll: K[0].roll || 0 };
  for (let i = 0; i < K.length - 1; i++) { const a = K[i], b = K[i + 1]; if (x >= a.tt && x < b.tt) {
    const r = (x - a.tt) / Math.max(1e-6, b.tt - a.tt), e = b.e || 'io', k = e === 'out' ? easeOut(r) : e === 'lin' ? r : e === 'in' ? easeIn(r) : smooth(r);
    const fa = a.fov ?? 40, fb = b.fov ?? fa;
    return { p: lerp3(a.p, b.p ?? a.p, k), l: lerp3(a.l, b.l ?? a.l, k), fov: lerp(fa, fb, k), roll: lerp(a.roll || 0, b.roll ?? a.roll ?? 0, k) }; } }
  const z = K[K.length - 1]; return { p: z.p, l: z.l, fov: z.fov ?? 40, roll: z.roll || 0 };
}
/** hold with a slow creep toward the look point (k = fraction of distance) */
export const hold = (p, l, fov = 40, o = {}) => { const k = o.creep ?? 0.08; const p2 = lerp3(p, l, k); if (o.drift) p2[0] += o.drift[0], p2[1] += o.drift[1], p2[2] += o.drift[2]; return [{ u: 0, p, l, fov, roll: o.roll || 0 }, { u: 1, p: p2, l: o.l2 || l, fov: fov * (o.zoom ?? 1), roll: o.roll2 ?? o.roll ?? 0, e: 'lin' }]; };
/** fast ease-out arrival (dur seconds) from p0 to p1, then creep */
export const burst = (p0, p1, l, fov = 40, o = {}) => { const d = o.dur ?? 0.45, l0 = o.l0 || l; const p2 = lerp3(p1, l, o.creep ?? 0.06); return [{ at: 0, p: p0, l: l0, fov: o.fov0 ?? fov, roll: o.roll0 || 0 }, { at: d, p: p1, l, fov, roll: o.roll || 0, e: 'out' }, { u: 1, p: p2, l, fov, roll: o.roll || 0, e: 'lin' }]; };

// ------------- characters -------------
export const blinkAt = (t, seed) => { const per = 2.6 + (seed * 0.37) % 1.6, ph = (t + seed * 0.71) % per; return ph < 0.07 ? 1 : 0; };
export const talkMouth = (t, seed = 0) => { const k = Math.floor(t * 7.5 + seed) % 4; return k === 0 || k === 2 ? 'o' : k === 1 ? 'open' : null; };
let ACT_SEED = 0;
/** actor card. spec = cast object, o = toonChar opts (+ talk:boolean, noBlink), pos [x,y,z], ex = card opts {s, flip, order, tint, blob, alpha} */
export function A(c, spec, o, pos, ex = {}) {
  const seed = spec.seed ?? 1, opts = { ...o };
  if (!opts.noBlink && opts.blink === undefined && !['laugh', 'sleep'].includes(opts.expr)) opts.blink = blinkAt(c.t, seed);
  if (opts.talk) { const m = talkMouth(c.t, seed); if (m) opts.mouth = m; }
  delete opts.talk; delete opts.noBlink;
  for (const k of ['bob', 'tilt', 'headTilt', 'step', 'look', 'turn']) if (typeof opts[k] === 'number') opts[k] = q(opts[k], 3);
  const key = JSON.stringify([spec.seed, spec.body, spec.hairStyle, spec.detail, opts]);
  return { key, draw: (p) => TT.toonChar(p, spec, opts), x: pos[0], y: pos[1], z: pos[2], s: ex.s ?? 1, flip: ex.flip, order: ex.order ?? 2, tint: ex.tint, blob: ex.blob, alpha: ex.alpha, yaw: ex.yaw, roll: ex.roll, shadow: ex.shadow };
}
/** fx card centred at world point P with diameter m metres; draw(g, k) in a 600x1000 design canvas centred at (300,500) */
export function FX(key, draw, P, m = 1, ex = {}) {
  const s = m / 1.35; if (String(key).startsWith('G:')) ex = { ...ex, add: true }; return { key: 'fx' + key, draw: (p) => draw(p.g, p), x: P[0], y: P[1] - 1.069 * s, z: P[2], s, blob: false, shadow: false, order: ex.order ?? 6, tint: ex.tint, alpha: ex.alpha, roll: ex.roll, add: ex.add };
}
// ------------- fx drawings (600x1000 design, centre 300,500) -------------
const CK = '#1a1416';
const star = (g, x, y, r1, r2, n, col, lw = 6) => { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? r2 : r1; g.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); } g.closePath(); g.fillStyle = col; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = CK; g.lineJoin = 'round'; g.stroke(); } };
export const fx = {
  sparkle: (k, col = '#ffe27a') => (g) => { const e = 1 - (1 - k) ** 3; for (let i = 0; i < 9; i++) { const a = i * 0.698 + 0.3, d = 60 + 210 * e; const r = (34 - 20 * k) * (i % 2 ? 0.7 : 1); if (r > 2) star(g, 300 + d * Math.cos(a), 500 + d * Math.sin(a), r, r * 0.38, 4, col, 4); } if (k < 0.4) star(g, 300, 500, 140 * (1 - k * 2), 40 * (1 - k * 2), 4, '#fffbe8', 5); },
  burst: (k, col = '#fff3b0') => (g, p) => TT.fxBurst(p, k, col, 12, 50, 270),
  pop: (k) => (g) => { // "pat" impact lines
    const e = 1 - (1 - k) ** 2; g.lineCap = 'round'; for (let i = 0; i < 10; i++) { const a = i * 0.628, r0 = 80 + 120 * e, r1 = r0 + 90 * (1 - k); if (r1 > r0) { g.lineWidth = 12 * (1 - k) + 2; g.strokeStyle = CK; g.beginPath(); g.moveTo(300 + r0 * Math.cos(a), 500 + r0 * Math.sin(a)); g.lineTo(300 + r1 * Math.cos(a), 500 + r1 * Math.sin(a)); g.stroke(); g.lineWidth = 6 * (1 - k); g.strokeStyle = '#ffd23a'; g.stroke(); } } },
  stars: (k) => (g, p) => { g.save(); g.translate(90, 380); TT.fxStars(p, k); g.restore(); },
  sweat: (k) => (g) => { const y = 400 + 80 * k; g.beginPath(); g.moveTo(300, y - 70); g.bezierCurveTo(250, y, 260, y + 50, 300, y + 50); g.bezierCurveTo(340, y + 50, 350, y, 300, y - 70); g.fillStyle = '#9adcff'; g.fill(); g.lineWidth = 7; g.strokeStyle = CK; g.stroke(); },
  speed: (k) => (g) => { g.lineCap = 'round'; for (let i = 0; i < 9; i++) { const y = 200 + i * 70, x0 = 40 + ((i * 97) % 120) + k * 200; g.lineWidth = 8; g.strokeStyle = `rgba(26,20,22,${0.7 * (1 - k)})`; g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + 200 + (i % 3) * 60, y); g.stroke(); } },
  puff: (k, col = '238,232,220') => (g) => { for (let i = 0; i < 9; i++) { const a = i * 0.7, d = 40 + 190 * k, r = (70 + 30 * (i % 3)) * (1 - 0.5 * k); g.beginPath(); g.arc(300 + d * Math.cos(a), 520 + d * 0.6 * Math.sin(a), r, 0, 7); g.fillStyle = `rgba(${col},${(1 - k) * 0.9})`; g.fill(); } },
  heart: (k, col = '#e8304a') => (g) => { const s = 1 + 0.15 * Math.sin(k * 12), y = 500 - k * 160; g.save(); g.translate(300, y); g.scale(s, s); g.beginPath(); g.moveTo(0, -30); g.bezierCurveTo(0, -90, 110, -90, 110, -20); g.bezierCurveTo(110, 40, 20, 80, 0, 120); g.bezierCurveTo(-20, 80, -110, 40, -110, -20); g.bezierCurveTo(-110, -90, 0, -90, 0, -30); g.globalAlpha = 1 - k * k; g.fillStyle = col; g.fill(); g.lineWidth = 9; g.strokeStyle = CK; g.stroke(); g.restore(); },
  note: (k, col = '#ff3a8a') => (g, p) => { g.save(); g.translate(150, 300 - k * 150); g.globalAlpha = 1 - k; TT.fxNote(p, Math.floor(k * 3) % 2, col); g.restore(); },
  firework: (k, col = '#ffd23a', n = 16) => (g) => { const e = 1 - (1 - k) ** 2.5; g.lineCap = 'round'; for (let i = 0; i < n; i++) { const a = i * Math.PI * 2 / n, d = 260 * e; const x = 300 + d * Math.cos(a), y = 500 + d * Math.sin(a) + 80 * k * k; g.strokeStyle = col; g.globalAlpha = 1 - k; g.lineWidth = 10 * (1 - k) + 2; g.beginPath(); g.moveTo(300 + d * 0.7 * Math.cos(a), 500 + d * 0.7 * Math.sin(a) + 60 * k * k); g.lineTo(x, y); g.stroke(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, 7 * (1 - k) + 2, 0, 7); g.fill(); } g.globalAlpha = 1; },
  splash: (k) => (g, p) => { g.save(); g.translate(-100, 50); g.scale(1, 1.1); TT.fxSplash(p, k); g.restore(); },
  drops: (k) => (g) => { for (let i = 0; i < 6; i++) { const y = 300 + ((k * 2 + i / 6) % 1) * 500, x = 220 + (i * 37) % 160; g.beginPath(); g.ellipse(x, y, 10, 16, 0, 0, 7); g.fillStyle = '#9adcff'; g.fill(); g.lineWidth = 4; g.strokeStyle = CK; g.stroke(); } },
  question: (k) => (g) => { g.save(); g.translate(300, 500); g.rotate(Math.sin(k * 10) * 0.15); g.font = '900 300px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 16; g.strokeStyle = CK; g.strokeText('?', 0, 0); g.fillStyle = '#ffd23a'; g.fillText('?', 0, 0); g.restore(); },
  bang: (k) => (g) => { g.save(); g.translate(300, 500); g.scale(0.6 + 0.4 * easeOut(k * 3), 0.6 + 0.4 * easeOut(k * 3)); g.font = '900 320px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 16; g.strokeStyle = CK; g.strokeText('!', 0, 0); g.fillStyle = '#ff3a3a'; g.fillText('!', 0, 0); g.restore(); },
  zzz: (k) => (g) => { g.font = '900 120px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; for (let i = 0; i < 3; i++) { const kk = (k + i / 3) % 1; g.globalAlpha = Math.sin(kk * Math.PI); g.lineWidth = 8; g.strokeStyle = CK; g.strokeText('z', 250 + kk * 120, 650 - kk * 300); g.fillStyle = '#ffffff'; g.fillText('z', 250 + kk * 120, 650 - kk * 300); } g.globalAlpha = 1; },
  shake: (k) => (g) => { g.lineCap = 'round'; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { g.lineWidth = 9; g.strokeStyle = CK; g.beginPath(); g.arc(300, 500, 150 + i * 45, s < 0 ? Math.PI * 0.8 : -Math.PI * 0.2, s < 0 ? Math.PI * 1.2 : Math.PI * 0.2); g.stroke(); } },
  coffee: (k) => (g) => { // thought bubble with a coffee cup
    g.globalAlpha = Math.min(1, k * 4); for (const [x, y, r] of [[160, 860, 22], [200, 780, 34]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 7; g.strokeStyle = CK; g.stroke(); }
    g.beginPath(); for (let i = 0; i < 10; i++) { const a = i * 0.628; g.arc(320 + 150 * Math.cos(a), 480 + 120 * Math.sin(a), 70, a - 1, a + 1); } g.closePath(); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 8; g.stroke();
    g.fillStyle = '#e8d6a0'; g.fillRect(260, 440, 110, 110); g.lineWidth = 8; g.strokeRect(260, 440, 110, 110); g.beginPath(); g.arc(380, 495, 30, -1.2, 1.2); g.stroke(); g.fillStyle = '#6a3a1a'; g.fillRect(266, 446, 98, 22);
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(285 + i * 30, 420); g.bezierCurveTo(275 + i * 30, 390, 300 + i * 30, 380, 290 + i * 30, 350); g.lineWidth = 6; g.stroke(); } g.globalAlpha = 1; },
  confetti: (k, seed = 1) => (g) => { for (let i = 0; i < 40; i++) { const x = (i * 137 + seed * 53) % 600, y = ((i * 71) % 1000 + k * 900) % 1000; g.save(); g.translate(x, y); g.rotate(i + k * 12); g.fillStyle = ['#ffd23a', '#ff3a8a', '#3ad0ff', '#6ad04a', '#ffffff'][i % 5]; g.fillRect(-10, -6, 20, 12); g.restore(); } },
  money: (k, seed = 1) => (g) => { for (let i = 0; i < 14; i++) { const x = (i * 157 + seed * 71) % 560 + 20, y = ((i * 89) % 1000 + k * 1000) % 1000; g.save(); g.translate(x, y); g.rotate(Math.sin(i + k * 9) * 0.8); g.fillStyle = '#7ac86a'; g.fillRect(-50, -26, 100, 52); g.lineWidth = 5; g.strokeStyle = CK; g.strokeRect(-50, -26, 100, 52); g.fillStyle = '#3a8a3a'; g.font = 'bold 34px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('€', 0, 2); g.restore(); } },
  water: (k) => (g) => { // water running through cupped hands
    g.lineCap = 'round'; for (let i = 0; i < 7; i++) { const x = 230 + i * 22, y = 560 + ((k * 3 + i * 0.13) % 1) * 420; g.beginPath(); g.ellipse(x, y, 9, 18, 0, 0, 7); g.fillStyle = '#7ad0ff'; g.fill(); g.lineWidth = 4; g.strokeStyle = CK; g.stroke(); } },
  glowDot: (k, col = '255,220,120') => (g) => { const r = g.createRadialGradient(300, 500, 0, 300, 500, 290); r.addColorStop(0, `rgba(${col},${0.85 * k})`); r.addColorStop(0.3, `rgba(${col},${0.35 * k})`); r.addColorStop(1, `rgba(${col},0)`); g.fillStyle = r; g.fillRect(0, 200, 600, 600); },
};
/** hands drawing (for the "Geld ist wie Wasser" insert): mode 'cup' | 'open' */
export const handsDraw = (k, mode = 'cup', water = 1) => (g) => {
  const ink = (pts, fill) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 9; g.strokeStyle = CK; g.lineJoin = 'round'; g.stroke(); };
  const sp = mode === 'open' ? 40 : 0;
  ink([[120 - sp, 560], [290 - sp * 0.2, 640], [300, 700], [290, 760], [160, 740], [80, 640]], '#fbfaf7');
  ink([[480 + sp, 560], [310 + sp * 0.2, 640], [300, 700], [310, 760], [440, 740], [520, 640]], '#fbfaf7');
  for (let i = 0; i < 4; i++) { g.lineWidth = 5; g.strokeStyle = '#c8c0b8'; g.beginPath(); g.moveTo(130 + i * 30, 590 + i * 10); g.lineTo(150 + i * 30, 640 + i * 6); g.stroke(); g.beginPath(); g.moveTo(470 - i * 30, 590 + i * 10); g.lineTo(450 - i * 30, 640 + i * 6); g.stroke(); }
  if (water > 0) { g.beginPath(); g.ellipse(300, 640, 150 * water, 34 * water, 0, 0, 7); g.fillStyle = 'rgba(110,200,255,0.85)'; g.fill(); g.lineWidth = 5; g.strokeStyle = '#2a6aa0'; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.ellipse(250, 630, 40 * water, 8 * water, -0.2, 0, 7); g.fill(); }
};
export const sproutDraw = (k) => (g) => { // a sprout growing out of soil, with sparkles
  g.fillStyle = '#7a4a2a'; g.beginPath(); g.ellipse(300, 880, 220, 60, 0, 0, 7); g.fill(); g.lineWidth = 9; g.strokeStyle = CK; g.stroke();
  const h = 320 * easeOut(k); g.lineWidth = 16; g.strokeStyle = '#3a8a3a'; g.lineCap = 'round'; g.beginPath(); g.moveTo(300, 870); g.bezierCurveTo(290, 870 - h * 0.4, 320, 870 - h * 0.7, 300, 870 - h); g.stroke();
  const lf = (dir, y, s) => { g.save(); g.translate(300, y); g.scale(dir * s, s); g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(40, -70, 140, -60, 160, -10); g.bezierCurveTo(100, 20, 40, 20, 0, 0); g.fillStyle = '#6ad04a'; g.fill(); g.lineWidth = 7 / s; g.strokeStyle = CK; g.stroke(); g.restore(); };
  if (k > 0.3) lf(1, 870 - h * 0.55, easeOut((k - 0.3) / 0.4)); if (k > 0.45) lf(-1, 870 - h * 0.8, easeOut((k - 0.45) / 0.4));
  if (k > 0.7) { const f = easeOut((k - 0.7) / 0.3); for (let i = 0; i < 6; i++) { const a = i * 1.047; g.beginPath(); g.arc(300 + 34 * f * Math.cos(a), 870 - h - 30 + 34 * f * Math.sin(a), 22 * f, 0, 7); g.fillStyle = '#ffd23a'; g.fill(); g.lineWidth = 5; g.stroke(); } g.beginPath(); g.arc(300, 870 - h - 30, 18 * f, 0, 7); g.fillStyle = '#e8803a'; g.fill(); }
};
export const iceHead = (melt = 0) => (g) => { // Leon's head carved in ice (bluish, translucent look)
  const m = clamp(melt);
  g.save(); g.translate(300, 620); g.scale(1, 1 - m * 0.35); g.translate(-300, -620);
  g.beginPath(); g.ellipse(300, 520 + m * 60, 190, 170 - m * 20, 0, 0, 7); g.fillStyle = '#cfeeff'; g.fill(); g.lineWidth = 10; g.strokeStyle = '#3a6a9a'; g.stroke();
  for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(130 + i * 40, 400 + m * 60); g.lineTo(150 + i * 40, 330 + (i % 2) * 30 + m * 60); g.lineTo(170 + i * 40, 400 + m * 60); g.fillStyle = '#a8dcff'; g.fill(); g.stroke(); }
  for (const s of [-1, 1]) { g.beginPath(); g.arc(300 + s * 60, 520 + m * 60, 40, 0, 7); g.lineWidth = 8; g.stroke(); }
  g.beginPath(); if (m < 0.5) g.arc(300, 600 + m * 60, 50, 0.2, Math.PI - 0.2); else g.arc(300, 660 + m * 60, 40, Math.PI + 0.3, -0.3); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(220, 450 + m * 60, 30, 60, -0.5, 0, 7); g.fill();
  g.restore();
  g.fillStyle = '#bfe6ff'; g.fillRect(170, 760, 260, 200); g.lineWidth = 10; g.strokeStyle = '#3a6a9a'; g.strokeRect(170, 760, 260, 200);
  if (m > 0) { g.fillStyle = 'rgba(150,210,255,0.8)'; g.beginPath(); g.ellipse(300, 970, 200 + m * 120, 20, 0, 0, 7); g.fill(); for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(190 + i * 55, 800 + ((m * 7 + i * 0.3) % 1) * 160, 8, 14, 0, 0, 7); g.fillStyle = '#9adcff'; g.fill(); } }
};
