// story.js — "Der Letzte" (10:47, 16:9). Every shot starts on a phrase boundary from work/phrases.json (silence-aligned).
// Locations (set-local coords, see scene.js): shop(+street) · lab · home · void · space.  One Jonas: chars.js.
import * as C from './chars.js';
import { OFF } from './scene.js';
export const FPS = 30, TOTAL = 19419;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const easeOut = (t) => 1 - (1 - clamp(t)) ** 3;
const lerp = (a, b, t) => a + (b - a) * t, lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const ramp = (x, a, b) => clamp((x - a) / (b - a));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
let TT = null;

// ------------------------------------------------------------------ lights
const BASE = { az: 90, el: 45, sky: '#c4d6f2', ground: '#7a7088', hemi: 1.2, sun: '#fff1dc', sunI: 2.2, fog: '#c6daf2', fogNear: 60, fogFar: 600, skyTop: '#3d7fd6', skyHor: '#c8ddf4', sat: 1.18,
  waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#effaff', vig: 0.22, shadowExt: 14, gain: '#ffffff', lift: '#000000' };
export const LIGHTS = {
  night: { ...BASE, az: 75, el: 38, sky: '#4a5aa0', ground: '#2a2440', hemi: 1.25, sun: '#a8bcff', sunI: 1.3, fog: '#1a2246', fogNear: 35, fogFar: 220, skyTop: '#070c26', skyHor: '#26346a', vig: 0.32, shadowExt: 24 },
  shop: { ...BASE, az: 95, el: 42, sky: '#fff2dc', ground: '#8a6a5a', hemi: 1.55, sun: '#fff0d8', sunI: 1.35, fog: '#1a2246', fogNear: 40, fogFar: 260, skyTop: '#070c26', skyHor: '#26346a', vig: 0.26, shadowExt: 9 },
  shopDay: { ...BASE, az: 100, el: 40, sky: '#ffffff', ground: '#9a8a7a', hemi: 1.5, sun: '#fff4e0', sunI: 1.6, vig: 0.22, shadowExt: 9 },
  cold: { ...BASE, az: 90, el: 60, sky: '#d8f0ff', ground: '#8aa0b8', hemi: 1.5, sun: '#d8ecff', sunI: 0.9, gain: '#d8ecff', vig: 0.34, shadowExt: 6 },
  morning: { ...BASE, az: 120, el: 24, sky: '#d8e0f4', ground: '#8a7a70', hemi: 1.25, sun: '#ffe2b8', sunI: 2.2, fog: '#e8dcd0', fogNear: 60, fogFar: 380, skyTop: '#5a96e0', skyHor: '#f4dcc0', shadowExt: 26 },
  day: { ...BASE, az: 125, el: 48, hemi: 1.25, sunI: 2.3, fog: '#d0e2f6', fogNear: 70, fogFar: 420, shadowExt: 26 },
  lab: { ...BASE, az: 95, el: 65, sky: '#ffffff', ground: '#c8d0d8', hemi: 1.85, sun: '#ffffff', sunI: 1.1, fog: '#e8eef4', fogNear: 40, fogFar: 200, skyTop: '#e8eef4', skyHor: '#e8eef4', sat: 1.12, vig: 0.15, shadowExt: 12 },
  labNight: { ...BASE, az: 95, el: 60, sky: '#8a9ad0', ground: '#3a4060', hemi: 1.1, sun: '#b0c0ff', sunI: 0.7, fog: '#1a2040', fogNear: 40, fogFar: 200, skyTop: '#0a1030', skyHor: '#1a2040', gain: '#c8d4ff', vig: 0.4, shadowExt: 10 },
  home: { ...BASE, az: 60, el: 40, sky: '#ffd8a0', ground: '#6a4a3a', hemi: 1.2, sun: '#ffd090', sunI: 1.3, fog: '#1a1a30', fogNear: 30, fogFar: 160, skyTop: '#070c26', skyHor: '#26346a', gain: '#ffe8c8', vig: 0.38, shadowExt: 8 },
  memory: { ...BASE, az: 60, el: 40, sky: '#ffd8a0', ground: '#6a4a3a', hemi: 1.3, sun: '#ffd090', sunI: 1.3, gain: '#ffe0b0', sat: 0.55, vig: 0.5, shadowExt: 9, fog: '#2a2030', skyTop: '#070c26', skyHor: '#26346a' },
  void: { ...BASE, az: 90, el: 60, sky: '#ffffff', ground: '#ffffff', hemi: 2.1, sun: '#ffffff', sunI: 0.55, fog: '#f4f6f8', fogNear: 18, fogFar: 150, skyTop: '#f4f6f8', skyHor: '#f4f6f8', sat: 1.1, vig: 0.1, shadowExt: 20 },
  voidPlan: { ...BASE, az: 90, el: 60, sky: '#ffffff', ground: '#ffffff', hemi: 2.0, sun: '#ffffff', sunI: 0.5, fog: '#dfe9f8', fogNear: 18, fogFar: 140, skyTop: '#dfe9f8', skyHor: '#dfe9f8', gain: '#bcd4ff', sat: 0.7, vig: 0.35 },
  space: { ...BASE, az: 150, el: 25, sky: '#4a5a8a', ground: '#101020', hemi: 0.7, sun: '#ffffff', sunI: 2.4, fog: '#000000', fogNear: 400, fogFar: 3000, skyTop: '#02030a', skyHor: '#0a1030', vig: 0.4, shadowExt: 30 },
  candles: { ...BASE, az: 80, el: 35, sky: '#5a5aa0', ground: '#3a2a30', hemi: 1.3, sun: '#ffd8a8', sunI: 1.2, fog: '#1a1a3a', fogNear: 35, fogFar: 220, skyTop: '#070c26', skyHor: '#2a2a5a', vig: 0.34, shadowExt: 24 },
};

// ------------------------------------------------------------------ helpers for actors / fx
const bl = (f, seed) => { const per = 70 + (seed * 37) % 50, ph = (f + seed * 13) % per; return ph < 4 ? 1 : 0; };
const tk = (s, ranges, base = 'neutral') => { for (const [a, b] of ranges) if (s >= a && s <= b) return Math.floor(s * 30 / 4) % 2 ? 'talk' : base; return base; };
const wk = (s, sp = 1.6) => ({ legs: 'walk', step: q((s * sp) % 1, 2), bob: q(Math.abs(Math.sin(s * sp * Math.PI * 2)) * 0.012, 3) });
const ch = (spec, o, set, x, z, ex = {}) => ({ key: JSON.stringify([spec, o]), draw: (p) => TT.toonChar(p, spec, o), x: x + OFF[set], y: ex.y || 0, z, s: ex.s ?? 1.0, flip: ex.flip, order: ex.order, roll: ex.roll, alpha: ex.alpha, blob: ex.blob, tint: ex.tint, yaw: ex.yaw, shadow: ex.shadow });
const fx = (key, draw, set, x, y, z, s = 1, ex = {}) => ({ key, draw, x: x + OFF[set], y, z, s, blob: false, shadow: false, order: 6, ...ex });
const J = (o, set, x, z, ex) => ch(C.JONAS, o, set, x, z, ex), JL = (o, set, x, z, ex) => ch(C.JONAS_LAB, o, set, x, z, ex), JR = (o, set, x, z, ex) => ch(C.JONAS_ROPE, o, set, x, z, ex), JM = (o, set, x, z, ex) => ch(C.JONAS_MEDAL, o, set, x, z, ex);
const GRANNY = { body: '#8a6ab0', bw: 200, robe: true, detail: [{ t: 'scarf', c: '#e8d0e0' }], hair: '#dcdce2', hairStyle: 'bun', glasses: true, shoes: '#4a3030', seed: 91 };
const TEACHER = { body: '#c86a8a', bw: 195, robe: true, detail: ['collar'], hair: '#c8c8d0', hairStyle: 'bun', glasses: true, shoes: '#4a3030', seed: 93 };
const KID = { body: '#f0c030', bw: 160, detail: ['pocket'], hair: '#a83a20', hairStyle: 'bob', legs: '#3a5aa0', shoes: '#e04a3a', headScale: 1.05, seed: 95 };
const PRES = { ...C.GUARD, shades: false, hair: '#b8b8c0', hairStyle: 'sides', glasses: true, seed: 97 };
const BUILDER = (i) => ({ ...C.woman(i), robe: false, legs: '#3a4a6a', detail: [{ t: 'straps', c: '#f2a030' }], hat: { type: 'hard', color: '#f2c43a' } });
const DERTEE = (i) => ({ ...C.woman(i), body: '#ffffff', detail: [{ t: 'text', text: 'Der|Letzte', c: '#1a1416', size: 38, y: 120 }] });
// fx drawers (600x1000 design canvas)
const ink = '#1a1416';
const bubble = (spec, o) => (p) => { const g = p.g; g.save(); g.lineWidth = 9; g.strokeStyle = ink; g.fillStyle = '#ffffff';
  g.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.arc(300 + Math.cos(a) * 210, 400 + Math.sin(a) * 200, 70, a - 0.9, a + 0.9); } g.closePath(); g.fill(); g.stroke();
  for (const [x, y, r] of [[120, 720, 34], [80, 820, 22], [55, 900, 14]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.stroke(); }
  g.beginPath(); g.ellipse(300, 400, 230, 220, 0, 0, 7); g.clip(); g.translate(300 - 600 * 0.5 / 2 - 0, 230); g.scale(0.5, 0.5); TT.toonChar(p, spec, o); g.restore(); };
const money = (p) => { const g = p.g; g.save(); g.translate(300, 500); g.rotate(-0.15); g.fillStyle = '#7ac0a0'; g.strokeStyle = ink; g.lineWidth = 9; g.fillRect(-200, -100, 400, 200); g.strokeRect(-200, -100, 400, 200);
  g.strokeStyle = '#3a8a6a'; g.lineWidth = 5; g.strokeRect(-170, -72, 340, 144); g.fillStyle = '#1a5a4a'; g.font = 'bold 110px "DejaVu Sans"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('20 €', 0, 6); g.restore(); };
const zzz = (t) => (p) => { const g = p.g; g.strokeStyle = '#2a3a6a'; g.lineCap = g.lineJoin = 'round'; for (let k = 0; k < 3; k++) { const tt = (t + k / 3) % 1, x = 260 + tt * 160, y = 800 - tt * 520, s = 30 + tt * 50; g.globalAlpha = Math.sin(tt * Math.PI); g.lineWidth = 9 + tt * 6; g.beginPath(); g.moveTo(x - s, y - s); g.lineTo(x + s, y - s); g.lineTo(x - s, y + s); g.lineTo(x + s, y + s); g.stroke(); } g.globalAlpha = 1; };
const heart = (k) => (p) => { const g = p.g; g.save(); g.translate(300, 500); g.scale(k, k); g.fillStyle = '#e8303a'; g.strokeStyle = ink; g.lineWidth = 10; g.beginPath(); g.moveTo(0, 120); g.bezierCurveTo(-220, -20, -120, -200, 0, -80); g.bezierCurveTo(120, -200, 220, -20, 0, 120); g.fill(); g.stroke(); g.restore(); };
const drops = (t, col = '#8fd0ff') => (p) => { const g = p.g; for (let k = 0; k < 4; k++) { const a = -2.4 + k * 0.5, d = 120 + t * 200; const x = 300 + Math.cos(a) * d, y = 400 + Math.sin(a) * d + t * t * 300; g.globalAlpha = 1 - t; g.fillStyle = col; g.strokeStyle = ink; g.lineWidth = 6; g.beginPath(); g.ellipse(x, y, 16, 24, 0, 0, 7); g.fill(); g.stroke(); } g.globalAlpha = 1; };
const sparkle = (t, col = '#4dff7a') => (p) => { const g = p.g; for (let k = 0; k < 9; k++) { const a = k * 0.7 + t * 2, d = 60 + t * 260, x = 300 + Math.cos(a) * d, y = 480 + Math.sin(a) * d * 1.2, r = 40 * (1 - t); g.globalAlpha = 1 - t; g.fillStyle = col; g.beginPath(); for (let i = 0; i < 8; i++) { const b = i * Math.PI / 4, rr = i % 2 ? r * 0.3 : r; g.lineTo(x + Math.cos(b) * rr, y + Math.sin(b) * rr); } g.fill(); } g.globalAlpha = 1; };
const glowFx = (col, k) => (p) => TT.fxGlow(p, col, k);
const rings = (t) => (p) => { const g = p.g; g.strokeStyle = '#8a9ab8'; for (let k = 0; k < 3; k++) { const tt = (t + k / 3) % 1; g.globalAlpha = 1 - tt; g.lineWidth = 8; g.beginPath(); g.arc(300, 500, 60 + tt * 260, -0.9, 0.9); g.stroke(); g.beginPath(); g.arc(300, 500, 60 + tt * 260, Math.PI - 0.9, Math.PI + 0.9); g.stroke(); } g.globalAlpha = 1; };
const confetti = (t, seed = 1) => (p) => { const g = p.g; const cols = ['#e8303a', '#f0c030', '#3a8ae8', '#3ac86a', '#e85ab0']; for (let k = 0; k < 40; k++) { const r = (n) => ((Math.sin((k + seed * 7) * 91.7 + n) * 43758.5) % 1 + 1) % 1; const x = r(1) * 600, y = ((r(2) * 1000 + t * 900 * (0.6 + r(3))) % 1000); g.save(); g.translate(x, y); g.rotate(t * 8 + k); g.fillStyle = cols[k % 5]; g.fillRect(-12, -6, 24, 12); g.restore(); } };
const flashPop = (t) => (p) => TT.fxBurst(p, t, '#ffffff', 10, 30, 180);
const glassesFx = (rot) => (p) => { const g = p.g; g.save(); g.translate(300, 500); g.rotate(rot); g.strokeStyle = ink; g.lineWidth = 12; g.fillStyle = 'rgba(200,230,255,0.4)'; for (const x of [-70, 70]) { g.beginPath(); g.arc(x, 0, 56, 0, 7); g.fill(); g.stroke(); } g.beginPath(); g.moveTo(-14, -6); g.lineTo(14, -6); g.stroke(); g.restore(); };
const tufts = (t) => (p) => { const g = p.g; g.strokeStyle = '#18141c'; g.lineWidth = 8; for (let k = 0; k < 6; k++) { const x = 200 + k * 40 + Math.sin(t * 6 + k) * 30, y = 200 + t * 700 + k * 20; g.beginPath(); g.arc(x, y, 14, 0, 4.5); g.stroke(); } };
const spray = (t) => (p) => { const g = p.g; g.fillStyle = `rgba(200,230,255,${1 - t})`; for (let k = 0; k < 24; k++) { const a = -0.5 + (k % 8) * 0.12, d = 40 + t * 380 * (0.5 + (k * 7 % 10) / 20); g.beginPath(); g.arc(150 + Math.cos(a) * d, 420 + Math.sin(a) * d, 10, 0, 7); g.fill(); } };
const heatFx = (t) => (p) => { const g = p.g; for (let k = 0; k < 10; k++) { const a = k * 0.63, d = 40 + ((t * 3 + k * 0.17) % 1) * 200; g.fillStyle = k % 2 ? '#ff6a2a' : '#ffd23a'; g.globalAlpha = 0.9; g.beginPath(); g.arc(300 + Math.cos(a) * d, 500 - Math.abs(Math.sin(a)) * d, 12, 0, 7); g.fill(); } g.globalAlpha = 1; };
const scanLine = (t) => (p) => { const g = p.g; const y = 200 + t * 700; g.fillStyle = 'rgba(90,200,255,0.35)'; g.fillRect(0, y - 30, 600, 60); g.fillStyle = 'rgba(160,240,255,0.9)'; g.fillRect(0, y - 4, 600, 8); };
const apples = (t) => (p) => { const g = p.g; for (let k = 0; k < 5; k++) { const x = 200 + k * 60 + t * (k - 2) * 120, y = 940; g.fillStyle = k % 2 ? '#e8303a' : '#f0c030'; g.strokeStyle = ink; g.lineWidth = 6; g.beginPath(); g.arc(x, y - 20, 22, 0, 7); g.fill(); g.stroke(); } };
const bang = (t) => (p) => TT.fxBurst(p, t, '#fff3b0', 12, 40, 230);
const stars = (t) => (p) => TT.fxStars(p, t);
const puff = (t) => (p) => TT.fxPuff(p, t);

// ------------------------------------------------------------------ the shot table
// c: [pos0, look0, fov0, pos1?, look1?, fov1?, roll0?, roll1?]  (set-local).  tr: 'move' (same set default) | 'dip' | 'flash' | 'green' | 'cut'
// W(s,u,f) world state · A(s,u,f) actors · X(s,u,f) fx · d: [x,y,z,cinf] focus point (local) · shake: [[sec, amp]]
const SH = [];
const sh = (t, set, L, c, o = {}) => SH.push({ t, set, L, c, ...o });
const sp = (s, a, b) => smooth(ramp(s, a, b));
const shopNight = { night: true, clock: '2:51', cars: false, bus: false };

// ================= INTRO =================
sh(0.0, 'space', 'space', [[0, 5.2, -5], [0, 3.7, -20], 30, [0, 4.9, -8], [0, 3.8, -20], 26], { tr: 'cut', d: [0, 4, -20, 2],
  W: (s) => ({ tiny: () => 1, green: 0 }), A: (s, u, f) => [J({ expr: 'neutral', blink: bl(f, 3) }, 'space', 0, -20, { y: 4.0, s: 0.36, blob: false })] });
sh(3.99, 'space', 'space', [[0, 4.9, -8], [0, 3.9, -20], 26, [0, 4.7, -11], [0, 4.0, -20], 22], { tr: 'move', d: [0, 4.2, -20, 3],
  W: (s) => ({ tiny: (i) => (i === 12 ? 0 : 1 - sp(s, 4.0 + ((i * 7) % 25) / 25 * 1.4, 4.12 + ((i * 7) % 25) / 25 * 1.4)) }),
  A: (s, u, f) => [J({ expr: s > 5.0 ? 'shock' : 'neutral', look: Math.sin(s * 4) * 0.8, blink: bl(f, 3) }, 'space', 0, -20, { y: 4.0, s: 0.36, blob: false })],
  X: (s, u, f) => { const o = []; for (let i = 0; i < 25; i++) { if (i === 12) continue; const t0 = 4.0 + ((i * 7) % 25) / 25 * 1.4, tt = (s - t0) / 0.5; if (tt > 0 && tt < 1) { const a = (i - 12) * 0.075; o.push(fx('pf' + i + q(tt, 1), puff(q(tt, 1)), 'space', Math.sin(a) * 10, -6 + Math.cos(a) * 10 + 0.1, -19.9, 0.4)); } } return o; } });
sh(5.69, 'space', 'space', [[0, 4.6, -16.8], [0, 4.55, -20], 34, [0, 4.55, -17.6], [0, 4.55, -20], 30], { tr: 'move', d: [0, 4.5, -20, 10],
  W: () => ({ tiny: (i) => 0 }), A: (s, u, f) => [J({ expr: s < 6.3 ? 'shock' : 'goofy', L: s > 6.2 ? { x: 270, y: 470 } : 'hang', R: 'hang', blink: bl(f, 3) }, 'space', 0, -20, { y: 4.0, s: 0.36, blob: false })] });
sh(7.43, 'shop', 'night', [[9, 1.4, 17], [0, 3.0, 4], 46, [7, 1.6, 14.5], [0, 2.8, 4], 44], { tr: 'flash', d: [0, 2, 4, 2],
  W: () => ({ ...shopNight }), A: (s, u, f) => [J({ expr: 'neutral', blink: bl(f, 2), L: 'hang', R: 'hang' }, 'shop', 1.1, -1.5)] });
sh(9.59, 'shop', 'shop', [[1.6, 1.7, 2.4], [0.5, 1.45, -1.8], 42, [1.3, 1.65, 1.8], [0.5, 1.45, -1.8], 40], { d: [0.85, 1.6, -1.75, 11],
  W: () => ({ ...shopNight }),
  A: (s, u, f) => [J({ expr: s < 11.5 ? 'happy' : 'smug', turn: -0.2, L: { x: 120, y: 520 + Math.sin(s * 9) * 30 }, holdL: 'knife', R: 'hip', blink: bl(f, 3) }, 'shop', 0.85, -1.75),
    ch(C.ALI, { expr: s > 12.3 ? 'sly' : 'smug', turn: -0.4, L: 'belly', R: s > 12.3 ? 'thumb' : 'belly', blink: bl(f, 5) }, 'shop', 2.6, -1.95)] });
sh(15.24, 'shop', 'shop', [[-1.6, 1.9, 3.6], [-1.0, 1.3, -1.8], 52, [-1.5, 1.85, 3.3], [-0.9, 1.3, -1.8], 50], { d: [0.8, 1.5, -1.7, 6],
  W: (s) => ({ ...shopNight, clock: '2:53' }),
  A: (s, u, f) => [J({ expr: s > 16.4 ? 'tired' : 'neutral', L: s > 16.2 ? 'chin' : 'hang', R: 'hang', blink: bl(f, 3) }, 'shop', 0.9, -1.7),
    ch(C.ALI, { expr: 'neutral', turn: 0.3, L: { x: 200, y: 600 }, R: { x: 400, y: 600 }, holdR: 'newspaper', legs: 'sit' }, 'shop', -3.6, 2.6, { y: 0.0 })] });
sh(18.11, 'shop', 'shop', [[1.2, 1.55, 1.2], [0.9, 1.5, -1.7], 34, [1.1, 1.55, 0.9], [0.9, 1.5, -1.7], 32], { d: [0.9, 1.55, -1.7, 13],
  W: () => ({ ...shopNight, clock: '2:58' }),
  A: (s, u, f) => [J({ expr: s > 19.4 ? 'worried' : 'tired', look: 0.6, turn: 0.2, L: 'chin', R: 'hang', headTilt: 6, blink: bl(f, 3) }, 'shop', 0.9, -1.7)] });
sh(21.29, 'shop', 'shop', [[4.4, 1.55, 1.4], [1.3, 1.45, -0.6], 42, [4.0, 1.5, 1.1], [1.3, 1.45, -0.6], 40], { d: [1.6, 1.5, 0.45, 9],
  W: () => ({ ...shopNight, clock: '2:59' }),
  A: (s, u, f) => [ch(C.MURAT, { expr: s > 23.6 ? 'sly' : 'goofy', turn: -0.4, look: -0.7, R: { x: 470, y: 330 }, holdR: 'chips', L: s > 24 ? 'up' : 'hang', blink: bl(f, 7) }, 'shop', 1.6, 0.45),
    J({ expr: 'angry', turn: 0.4, look: 0.8, L: 'hip', R: 'reach', blink: bl(f, 3) }, 'shop', 1.0, -1.5)],
  X: (s, u, f) => s > 24.0 ? [fx('money' + q(easeOut((s - 24) / 0.6), 1), money, 'shop', 1.25 + 0.0, 1.8 + easeOut((s - 24) / 0.6) * 0.3, 0.0, 0.4)] : [] });
sh(25.7, 'shop', 'shop', [[-0.4, 2.3, 3.7], [-1.2, 1.1, -1.0], 56, [-0.3, 2.2, 3.4], [-1.1, 1.1, -1.0], 54], { d: [0, 1.3, -1, 3],
  W: () => ({ ...shopNight, clock: '3:01' }),
  A: (s, u, f) => [J({ expr: s > 26.6 ? 'tired' : 'neutral', L: s > 26.5 && s < 27.6 ? 'up' : 'hang', R: s > 26.5 && s < 27.6 ? 'up' : 'hang', blink: bl(f, 3) }, 'shop', 0.9, -1.7),
    ch(C.ALI, { expr: 'sleep', turn: 0.3, L: { x: 220, y: 560 }, R: { x: 380, y: 560 }, legs: 'sit', headTilt: 14 }, 'shop', -3.6, 2.6)],
  X: (s, u, f) => [fx('z' + q((s * 0.5) % 1, 1), zzz(q((s * 0.5) % 1, 1)), 'shop', -3.3, 1.5, 2.6, 0.5)] });
sh(28.23, 'shop', 'shop', [[0.6, 1.6, 0.9], [-2.6, 1.3, -4.0], 50, [0.3, 1.6, 0.6], [-2.8, 1.3, -4.4], 48], { d: [-2.2, 1.5, -3.2, 7],
  W: (s) => ({ ...shopNight, clock: '3:04', door: -1.55 * sp(s, 29.6, 30.4) }),
  A: (s, u, f) => { const t = sp(s, 28.4, 31.6); const x = lerp(0.2, -2.8, t), z = lerp(-2.4, -4.6, sp(s, 30.3, 31.9)); return [J({ expr: s < 29.6 ? 'tired' : 'happy', turn: -0.6, look: -1, L: s < 29.5 ? { x: 120, y: 260 + Math.sin(s * 14) * 40 } : 'reach', R: 'hang', sweat: s < 30, ...(t > 0 && t < 1 || s > 30.3 ? wk(s) : {}), blink: bl(f, 3) }, 'shop', x, z)]; } });
sh(32.58, 'shop', 'cold', [[-2.8, 1.25, -4.7], [-2.9, 0.9, -7.5], 52, [-2.82, 1.2, -5.0], [-2.9, 0.9, -7.5], 49], { tr: 'dip', d: [-2.9, 1.1, -7.2, 10],
  W: () => ({ ...shopNight, door: -0.15 }), A: (s, u, f) => [J({ expr: s < 33.6 ? 'happy' : 'tired', legs: 'sit', L: 'belly', R: 'belly', headTilt: 6, blink: bl(f, 3) }, 'shop', -2.9, -7.2, { y: -0.05 })] });
sh(34.62, 'shop', 'cold', [[-2.6, 1.55, -5.8], [-2.9, 1.45, -7.2], 34, [-2.66, 1.52, -6.05], [-2.9, 1.45, -7.2], 32], { d: [-2.9, 1.5, -7.2, 13],
  W: () => ({ ...shopNight, door: -0.15 }), A: (s, u, f) => [J({ expr: s > 36.4 ? 'laugh' : 'sly', turn: 0.3, look: 0.6, legs: 'sit', L: s > 36.3 ? 'chin' : 'belly', R: 'belly', headTilt: 6, blink: bl(f, 3) }, 'shop', -2.9, -7.2, { y: -0.05 })] });
sh(38.17, 'shop', 'cold', [[-2.1, 1.2, -5.2], [-2.9, 1.15, -7.3], 44, [-2.2, 1.2, -5.5], [-2.9, 1.15, -7.3], 42], { d: [-2.9, 1.4, -7.2, 9],
  W: () => ({ ...shopNight, door: -0.0 }), A: (s, u, f) => [J({ expr: 'sleep', legs: 'sit', L: 'belly', R: 'belly', headTilt: 14 + Math.sin(s * 2) * 2 }, 'shop', -2.9, -7.2, { y: -0.05 })],
  X: (s) => [fx('pz' + q((s * 0.7) % 1, 1), puff(q((s * 0.7) % 1, 1)), 'shop', -2.55, 1.35, -7.1, 0.35)] });
sh(40.18, 'shop', 'shop', [[-0.7, 2.25, -2.3], [-0.7, 2.6, -3.9], 34, [-0.7, 2.3, -2.6], [-0.7, 2.6, -3.9], 30], { tr: 'dip', d: [-0.7, 2.6, -3.9, 6],
  W: (s) => ({ ...shopNight, clock: s < 41.35 ? '3:13' : '3:14' }), shake: [[41.35, 0.012]] });
sh(42.4, 'space', 'space', [[0, 9, 10], [0, -6, -20], 40, [0, 8, 8], [0, -6, -20], 38], { tr: 'green', d: [0, 0, -20, 0],
  W: (s) => ({ tiny: () => 0, green: 0.85 * Math.sin(Math.PI * ramp(s, 42.4, 44.8)) }), cam: (s) => ({ tint: 0.5 * Math.sin(Math.PI * ramp(s, 42.4, 44.8)) }) });
sh(44.9, 'shop', 'night', [[-3.4, 1.6, 7.0], [-3.5, 1.2, 2.6], 38, [-3.4, 1.6, 6.6], [-3.5, 1.2, 2.6], 36], { tr: 'green', d: [-3.6, 1.3, 2.6, 6],
  W: () => ({ ...shopNight, clock: '3:14' }), cam: (s) => ({ tint: 0.85 * (1 - sp(s, 45.0, 46.9)) }),
  A: (s, u, f) => { const a = 1 - sp(s, 45.4, 46.2); return a > 0.02 ? [ch(C.ALI, { expr: 'sleep', turn: 0.3, L: { x: 220, y: 560 }, R: { x: 380, y: 560 }, legs: 'sit', headTilt: 14 }, 'shop', -3.6, 2.6, { alpha: a })] : []; },
  X: (s) => s > 45.3 && s < 46.6 ? [fx('sg' + q((s - 45.3) / 1.3, 1), sparkle(q((s - 45.3) / 1.3, 1)), 'shop', -3.6, 0.4, 2.7, 0.9)] : [] });
sh(46.98, 'shop', 'night', [[20, 7, 2], [2, 1, 11], 50, [18, 6.6, 3], [2, 1, 11], 48], { d: [2, 1, 11, 1], W: () => ({ ...shopNight }), cam: (s) => ({ tint: 0.35 * (1 - sp(s, 47, 48.8)) }) });
sh(48.88, 'shop', 'cold', [[-2.3, 1.3, -5.4], [-2.9, 1.2, -7.2], 40, [-2.4, 1.3, -5.7], [-2.9, 1.2, -7.2], 38], { tr: 'dip', d: [-2.9, 1.4, -7.2, 11],
  W: () => ({ ...shopNight }), A: (s, u, f) => [J({ expr: 'sleep', legs: 'sit', L: 'belly', R: 'belly', headTilt: 16 + Math.sin(s * 2) * 3, bob: q(Math.abs(Math.sin(s * 1.6)) * 0.006, 3) }, 'shop', -2.9, -7.2, { y: -0.05 })],
  X: (s) => [fx('z2' + q((s * 0.5) % 1, 1), zzz(q((s * 0.5) % 1, 1)), 'shop', -2.6, 1.0, -7.1, 0.5)] });
sh(52.27, 'shop', 'shop', [[-0.9, 1.4, -1.6], [-2.8, 1.25, -3.9], 46, [-1.5, 1.35, -2.0], [-2.8, 1.25, -3.9], 44], { tr: 'dip', d: [-2.8, 1.3, -3.9, 4], W: () => ({ ...shopNight, clock: '3:14' }) });
sh(54.6, 'shop', 'shop', [[-2.2, 1.5, -1.9], [-2.8, 1.5, -3.9], 50, [-2.5, 1.5, -2.9], [-2.8, 1.5, -3.9], 46], { d: [-2.8, 1.5, -3.9, 4], W: () => ({ ...shopNight, clock: '3:15' }) });
sh(56.71, 'shop', 'cold', [[-2.65, 1.55, -6.0], [-2.9, 1.45, -7.2], 30, [-2.7, 1.52, -6.25], [-2.9, 1.45, -7.2], 28], { tr: 'dip', d: [-2.9, 1.5, -7.2, 14],
  W: () => ({ ...shopNight }), A: (s, u, f) => [J({ expr: 'laugh', blink: 1, legs: 'sit', L: 'belly', R: 'belly', headTilt: 12 }, 'shop', -2.9, -7.2, { y: -0.05 })] });

// ================= TAG 1 =================
const tag1 = { night: false, clock: '7:42', cars: true };
sh(58.5, 'shop', 'morning', [[-12, 9, 22], [6, 1, 8], 50, [-10, 5, 20], [5, 1, 7], 46], { tr: 'dip', d: [5, 1, 8, 1], W: () => ({ ...tag1, clouds: true }) });
sh(60.38, 'shop', 'shopDay', [[-2.0, 1.6, -0.4], [-2.8, 1.3, -3.9], 46, [-2.0, 1.6, -0.7], [-2.8, 1.3, -3.9], 44], { tr: 'dip', d: [-2.8, 1.5, -3.5, 7],
  W: (s) => ({ ...tag1, aliStuff: true, door: -1.55 * sp(s, 60.5, 61.2) }),
  A: (s, u, f) => s < 60.9 ? [] : [J({ expr: s < 61.7 ? 'tired' : 'happy', L: 'up', R: 'up', blink: s < 61.8 ? 1 : bl(f, 3), ...wk(s, 1) }, 'shop', -2.8, lerp(-4.5, -3.3, sp(s, 60.9, 62.0)))] });
sh(62.28, 'shop', 'shopDay', [[4.0, 2.4, 3.6], [-1.0, 1.0, -2.6], 50, [3.7, 2.3, 3.3], [-1.0, 1.0, -2.6], 48], { d: [-1, 1.3, -2.6, 3],
  W: () => ({ ...tag1, aliStuff: true, door: -1.55 }), A: (s, u, f) => [J({ expr: 'neutral', turn: 0.4, look: 0.8, blink: bl(f, 3) }, 'shop', -2.6, -3.0)] });
sh(63.9, 'shop', 'shopDay', [[1.9, 1.75, -0.7], [1.4, 0.0, -1.8], 46, [1.75, 1.55, -0.95], [1.4, 0.0, -1.8], 42], { d: [1.4, 0, -1.8, 8], W: () => ({ ...tag1, aliStuff: true, door: -1.55 }) });
sh(65.97, 'shop', 'shopDay', [[2.3, 0.55, -1.1], [2.0, 0.03, -1.6], 30, [2.2, 0.45, -1.2], [2.0, 0.03, -1.6], 27], { d: [2.0, 0.03, -1.6, 12], W: () => ({ ...tag1, aliStuff: true, door: -1.55 }) });
sh(67.45, 'shop', 'shopDay', [[1.4, 1.75, -1.3], [0, 1.45, -2.75], 38, [1.25, 1.7, -1.45], [0, 1.45, -2.75], 35], { d: [0, 1.45, -2.75, 10], W: () => ({ ...tag1, aliStuff: true, door: -1.55 }) });
sh(69.52, 'shop', 'shopDay', [[1.3, 1.55, 0.8], [0.9, 1.5, -1.6], 36, [1.25, 1.55, 0.6], [0.9, 1.5, -1.6], 34], { d: [0.9, 1.55, -1.6, 12],
  W: () => ({ ...tag1, aliStuff: true, door: -1.55 }), A: (s, u, f) => [J({ expr: 'shock', look: Math.sin(s * 5), turn: Math.sin(s * 3) * 0.5, blink: 0 }, 'shop', 0.9, -1.6)] });
sh(70.97, 'shop', 'shopDay', [[0.4, 1.0, 0.9], [0.9, 1.6, -1.6], 38, [0.45, 1.05, 0.7], [0.9, 1.6, -1.6], 36], { d: [0.9, 1.55, -1.6, 12],
  W: () => ({ ...tag1, aliStuff: true, door: -1.55 }),
  A: (s, u, f) => [J({ expr: s < 73.2 ? tk(s, [[71.85, 72.85]], 'yell') : 'worried', L: s < 73.2 ? { x: 230, y: 300 } : 'hip', R: s < 73.2 ? { x: 370, y: 300 } : 'hip', turn: s < 73.2 ? 0 : -0.3, blink: bl(f, 3) }, 'shop', 0.9, -1.6)],
  X: (s) => s > 71.9 && s < 73 ? [fx('r' + q((s * 1.5) % 1, 1), rings(q((s * 1.5) % 1, 1)), 'shop', 0.9, 0.5, -1.4, 1.0)] : [] });
sh(74.1, 'shop', 'morning', [[2.6, 1.5, 9.4], [2.6, 1.4, 4.0], 44, [2.6, 1.5, 8.9], [2.6, 1.4, 4.0], 42], { tr: 'dip', d: [2.6, 1.5, 5.6, 7],
  W: (s) => ({ ...tag1, shopDoor: 1.4 * sp(s, 74.3, 74.9) }),
  A: (s, u, f) => { const z = lerp(3.0, 5.6, sp(s, 74.4, 75.8)); return [J({ expr: s < 75.9 ? 'neutral' : 'shock', turn: s > 75.9 ? 0.5 : 0, look: s > 75.9 ? 1 : 0, holdR: 'knife', R: 'hang', ...(s < 75.8 ? wk(s) : {}), blink: bl(f, 3) }, 'shop', 2.6, z)]; } });
sh(77.42, 'shop', 'morning', [[0.8, 2.2, 5.0], [17, 1.0, 11], 48, [1.4, 2.1, 5.4], [17, 1.0, 11], 44], { d: [17, 1, 11, 1], W: () => ({ ...tag1, clouds: true }),
  A: (s, u, f) => [J({ expr: 'shock', turn: 0.6, look: 1, holdR: 'knife', R: 'hang' }, 'shop', 2.6, 5.6)] });
sh(81.48, 'shop', 'morning', [[13.8, 1.3, 13.4], [15.8, 0.9, 10.2], 40, [14.1, 1.3, 13.1], [15.8, 0.9, 10.2], 38], { tr: 'dip', d: [15.6, 1, 10.3, 6], W: () => ({ ...tag1 }) });
sh(83.23, 'shop', 'morning', [[16.2, 1.5, 12.0], [15.6, 0.9, 9.6], 40, [16.0, 1.4, 11.7], [15.5, 0.9, 9.6], 38], { d: [15.6, 1, 9.6, 8], W: () => ({ ...tag1 }) });
sh(84.05, 'shop', 'morning', [[4.5, 1.6, 9.6], [-3.0, 1.6, 16.4], 44, [4.0, 1.6, 10.0], [-3.0, 1.6, 16.4], 42], { d: [-3, 1.6, 16.4, 3], W: () => ({ ...tag1, clouds: true }) });
const RUN = [[0, -8, 9.0, 1], [1, 12, 10.5, -1], [2, -4, 13.5, 1], [3, 10, 14.0, -1], [4, -12, 12.0, 1], [6, 14, 8.6, -1]];
sh(86.58, 'shop', 'morning', [[3, 1.5, 6.4], [3, 1.3, 13], 48, [3.3, 1.5, 6.8], [3, 1.3, 13], 46], { d: [3, 1.3, 11, 4], W: () => ({ ...tag1 }),
  A: (s, u, f) => RUN.map(([i, x0, z, dir], k) => ch(C.woman(i), { expr: ['cry', 'yell', 'worried', 'sob', 'yell', 'cry'][k], turn: dir * 0.6, look: dir, R: k % 2 ? { x: 470, y: 330 } : 'up', holdR: k % 2 ? 'phone' : null, L: k % 3 ? 'up' : 'chin', ...wk(s + k * 0.3, 2.4) }, 'shop', x0 + dir * (s - 86.58) * 2.2, z)) });
sh(90.51, 'shop', 'morning', [[-1.0, 1.55, 10.5], [-2.6, 1.45, 13.4], 36, [-1.2, 1.55, 10.9], [-2.6, 1.45, 13.4], 34], { d: [-2.6, 1.5, 13.4, 12], W: () => ({ ...tag1 }),
  A: (s, u, f) => [ch(C.woman(2), { expr: tk(s, [[90.51, 91.1]], 'yell'), L: { x: 230, y: 300 }, R: { x: 370, y: 300 }, turn: 0.3 }, 'shop', -2.6, 13.4)] });
sh(91.53, 'shop', 'morning', [[0.4, 1.1, 11.6], [1.2, 1.1, 13.6], 38, [0.5, 1.1, 11.9], [1.2, 1.1, 13.6], 36], { d: [1.2, 1.2, 13.6, 12], W: () => ({ ...tag1 }),
  A: (s, u, f) => [ch(KID, { expr: s < 92.1 ? 'sob' : 'cry', L: 'up', R: 'up' }, 'shop', 1.2, 13.6, { s: 0.7 }), ch(C.woman(8), { expr: 'cry', turn: -0.4, L: { x: 120, y: 520 }, R: 'hang' }, 'shop', 2.1, 13.9)] });
sh(92.47, 'shop', 'morning', [[5.0, 1.55, 11.0], [6.6, 1.45, 13.4], 36, [5.2, 1.55, 11.3], [6.6, 1.45, 13.4], 34], { d: [6.6, 1.5, 13.4, 12], W: () => ({ ...tag1 }),
  A: (s, u, f) => [ch(C.woman(3), { expr: tk(s, [[92.47, 93.42]], 'worried'), turn: -0.3, R: { x: 470, y: 260 }, holdR: 'phone', L: 'chin', blink: bl(f, 9) }, 'shop', 6.6, 13.4)] });
sh(94.3, 'shop', 'morning', [[3.4, 1.5, 7.8], [2.6, 1.45, 5.6], 38, [3.3, 1.5, 7.5], [2.6, 1.45, 5.6], 36], { d: [2.6, 1.5, 5.6, 11], W: () => ({ ...tag1 }),
  A: (s, u, f) => [J({ expr: 'worried', look: -0.4, turn: -0.2, holdR: 'knife', R: 'hang', L: s > 94.8 ? { x: 220, y: 380 } : 'hang', holdL: s > 94.8 ? 'phone' : null, blink: bl(f, 3) }, 'shop', 2.6, 5.6)] });
sh(95.95, 'shop', 'morning', [[2.45, 1.45, 6.35], [2.45, 1.4, 5.9], 34, [2.45, 1.42, 6.25], [2.45, 1.4, 5.9], 33], { tr: 'dip', d: [2.45, 1.4, 5.9, 14],
  W: (s) => ({ ...tag1, phone: { pos: [2.45, 1.4, 5.9], rot: [-0.05, 0, 0], k: 'news' + Math.min(3, Math.floor((s - 95.95) / 0.75)) } }) });
sh(99.08, 'shop', 'shopDay', [[2.9, 2.3, -1.43], [4.0, 2.45, -2.6], 38, [3.05, 2.33, -1.6], [4.0, 2.45, -2.6], 36], { tr: 'dip', d: [4.0, 2.45, -2.6, 8], W: () => ({ ...tag1, tv: 'news', aliStuff: true, door: -1.55 }) });
sh(101.67, 'shop', 'morning', [[2.75, 1.6, 6.9], [2.6, 1.55, 5.6], 30, [2.72, 1.6, 6.7], [2.6, 1.55, 5.6], 28], { tr: 'dip', d: [2.6, 1.55, 5.6, 14], W: () => ({ ...tag1 }),
  A: (s, u, f) => [J({ expr: 'shock', sweat: true, holdR: 'knife', R: 'hang', L: { x: 220, y: 380 }, holdL: 'phone', blink: 0 }, 'shop', 2.6, 5.6)] });
const BRO = { ...C.man(5), hair: '#18141c', hairStyle: 'curly' };
sh(103.39, 'shop', 'morning', [[3.6, 1.6, 8.6], [3.1, 1.6, 5.6], 40, [3.5, 1.6, 8.3], [3.1, 1.6, 5.6], 38], { d: [2.6, 1.5, 5.6, 9], W: () => ({ ...tag1 }),
  A: (s, u, f) => [J({ expr: s < 105.9 ? 'sad' : 'angry', holdR: 'knife', R: 'hang', L: { x: 220, y: 380 }, holdL: 'phone', look: 0.7, blink: bl(f, 3) }, 'shop', 2.6, 5.6)],
  X: (s) => { const b = s < 104.21 ? [C.PAPA, { expr: 'smile' }] : s < 105.01 ? [BRO, { expr: 'happy' }] : [C.MURAT, { expr: s < 105.98 ? 'goofy' : 'sly', holdR: 'chips', R: { x: 470, y: 330 } }];
    const o = [fx('bub' + JSON.stringify(b), bubble(...b), 'shop', 3.9, 1.3, 5.6, 0.75)]; if (s > 105.98) { const t = easeOut((s - 105.98) / 1.3); o.push(fx('mny' + q(t, 1), money, 'shop', 4.0 + t * 1.5, 2.0 + t * 0.8, 5.5, 0.35)); } return o; } });
sh(107.75, 'shop', 'morning', [[4.0, 2.0, 6.4], [4.0, 1.2, 10.5], 46, [4.0, 7.5, 3.2], [4.0, 0.8, 11.5], 50], { tr: 'dip', d: [4, 1, 10.5, 2], W: () => ({ ...tag1, clouds: true }),
  A: (s, u, f) => [J({ expr: 'worried', holdR: 'knife', R: 'hang', look: Math.sin(s) * 0.6, blink: bl(f, 3) }, 'shop', 4.0, 10.5), ...[[0, 8, 13.5], [2, -2, 13], [3, 9, 8.6], [8, -1, 8.4], [4, 12, 11]].map(([i, x, z]) => ch(C.woman(i), { expr: 'cry', turn: 0.5 }, 'shop', x, z))] });
const STARE = [[3, 7.0, 12.8], [8, 1.0, 13.6], [2, 8.6, 9.0], [4, -1.2, 12.0], [0, 9.6, 13.4], [6, 1.6, 15.0]];
const stareAt = (s, k) => [112.9, 116.0, 117.1, 118.2, 118.4, 118.6][k] <= s;
const women = (s, f, opts = {}) => STARE.map(([i, x, z], k) => ch(C.woman(i), { expr: stareAt(s, k) ? (opts.expr || 'shock') : 'cry', turn: stareAt(s, k) ? (x > 4 ? -0.6 : 0.6) : (x > 4 ? 0.7 : -0.7), look: stareAt(s, k) ? (x > 4 ? -1 : 1) : (x > 4 ? 1 : -1), blink: stareAt(s, k) ? 0 : bl(f, i), L: 'hang', R: k === 0 ? 'chin' : 'hang' }, 'shop', x, z));
sh(112.3, 'shop', 'morning', [[2.4, 1.7, 8.2], [6.6, 1.45, 12.8], 44, [2.5, 1.7, 8.4], [6.8, 1.45, 12.8], 42], { d: [7.0, 1.5, 12.8, 10], W: () => ({ ...tag1 }), A: (s, u, f) => [J({ expr: 'worried', holdR: 'knife', R: 'hang', turn: 0.6, look: 1 }, 'shop', 4.0, 10.5), ...women(s, f)] });
sh(114.61, 'shop', 'morning', [[5.9, 1.55, 11.3], [7.0, 1.55, 12.8], 30, [6.0, 1.55, 11.5], [7.0, 1.55, 12.8], 28], { d: [7.0, 1.55, 12.8, 14], W: () => ({ ...tag1 }), A: (s, u, f) => women(s, f) });
sh(115.83, 'shop', 'morning', [[4.6, 1.6, 9.0], [1.0, 1.45, 13.6], 40, [4.6, 1.6, 9.0], [8.6, 1.45, 9.6], 40], { d: [4, 1.5, 11, 6], W: () => ({ ...tag1 }), A: (s, u, f) => [J({ expr: 'scared', holdR: 'knife', R: 'hang', look: Math.sin(s * 3), blink: 0 }, 'shop', 4.0, 10.5), ...women(s, f)] });
sh(118.13, 'shop', 'morning', [[4.0, 0.5, 6.4], [4.0, 1.6, 12], 52, [4.0, 0.55, 7.2], [4.0, 1.6, 12], 48], { d: [4, 1.5, 10.5, 4], W: () => ({ ...tag1 }), A: (s, u, f) => [J({ expr: 'scared', holdR: 'knife', R: 'hang', blink: 0 }, 'shop', 4.0, 10.5), ...women(s, f)] });
sh(120.05, 'shop', 'morning', [[0.8, 1.4, 10.6], [-1.4, 1.3, 12.4], 38, [0.6, 1.35, 10.8], [-1.4, 1.2, 12.4], 36], { d: [-1.4, 1.4, 12.4, 12], W: () => ({ ...tag1 }),
  A: (s, u, f) => [ch(GRANNY, { expr: s < 121.6 ? 'shock' : 'awe', turn: 0.4, look: 0.8, R: s < 121.6 ? { x: 470, y: 520 } : 'hang', holdR: s < 121.6 ? 'bag2' : null, L: s > 122.6 ? 'chin' : 'hang', blink: 0 }, 'shop', -1.4, 12.4)],
  X: (s) => s > 121.6 ? [fx('ap' + q(Math.min(1, (s - 121.6) / 1.2), 1), apples(q(Math.min(1, (s - 121.6) / 1.2), 1)), 'shop', -1.0, 0, 12.5, 0.5, { order: 1 })] : [] });
sh(125.46, 'shop', 'morning', [[-0.6, 1.5, 11.4], [-1.4, 1.5, 12.4], 30, [-0.65, 1.5, 11.6], [-1.4, 1.5, 12.4], 28], { d: [-1.4, 1.5, 12.4, 14], W: () => ({ ...tag1 }),
  A: (s, u, f) => [ch(GRANNY, { expr: tk(s, [[125.5, 126.3]], 'awe'), turn: 0.4, look: 0.8, L: 'chin', R: 'point', tilt: q(Math.sin(s * 40) * 0.8, 1) }, 'shop', -1.4, 12.4)] });
sh(127.69, 'shop', 'morning', [[6.5, 0.6, 12.5], [4.0, 1.7, 10.5], 50, [1.2, 0.6, 12.8], [4.0, 1.7, 10.5], 50], { d: [4, 1.6, 10.5, 6], W: () => ({ ...tag1, crowd: 'phones' }),
  A: (s, u, f) => [J({ expr: 'scared', holdR: 'knife', R: 'hang', blink: bl(f, 3) }, 'shop', 4.0, 10.5)],
  X: (s, u, f) => { const o = []; for (let k = 0; k < 6; k++) { const t = ((s * 1.3 + k * 0.37) % 1); if (t < 0.35) { const a = k * 1.05; o.push(fx('fl' + k + q(t / 0.35, 1), flashPop(q(t / 0.35, 1)), 'shop', 1 + Math.cos(a) * 6, 1.4, 11.5 + Math.sin(a) * 3, 0.5)); } } return o; } });
sh(130.91, 'shop', 'shopDay', [[2.9, 2.3, -1.43], [4.0, 2.45, -2.6], 40, [3.1, 2.35, -1.65], [4.0, 2.45, -2.6], 36], { tr: 'dip', d: [4, 2.45, -2.6, 6], W: () => ({ ...tag1, tv: 'jonas', aliStuff: true, door: -1.55 }) });
sh(133.0, 'shop', 'morning', [[2, 1.6, 7], [6, 6.5, 18.9], 46, [2.5, 1.5, 7.6], [6, 6.3, 18.9], 44], { tr: 'dip', d: [6, 6, 18.9, 2], W: () => ({ ...tag1, bigScreen: true, crowd: 'phones', clouds: true }) });
sh(135.63, 'shop', 'morning', [[-8, 1.0, 9.4], [3, 3.5, 11.5], 52, [-7.6, 1.0, 9.0], [3, 1.6, 11.5], 50], { tr: 'dip', d: [3, 2, 11.5, 2],
  W: (s) => ({ ...tag1, crowd: 'phones', clouds: true, crowdBob: 0.05, heli: { pos: [3, lerp(22, 0, easeOut(ramp(s, 135.7, 139.6))), 11.5], ry: 0.3, rz: Math.sin(s * 1.5) * 0.03 * (1 - ramp(s, 138, 139.6)) } }), shake: [[139.6, 0.01]],
  X: (s) => s > 138.6 ? [0, 1, 2].map((k) => { const t = q(((s - 138.6) * 0.8 + k / 3) % 1, 1); return fx('du' + k + t, puff(t), 'shop', 3 + (k - 1) * 2.5, 0, 11.5 + (k - 1), 1.6); }) : [] });

// ================= WOCHE 1 =================
const W1 = { night: false };
sh(140.72, 'shop', 'day', [[2, 0.8, 7], [0, 14, 2], 54, [2, 0.8, 7], [-8, 16, -4], 54], { tr: 'dip', d: [0, 14, 0, 0], W: (s) => ({ ...W1, clouds: true, heli: { pos: [lerp(8, -14, ramp(s, 140.7, 143)), 14 + (s - 140.7) * 1.5, lerp(9, -6, ramp(s, 140.7, 143))], ry: 2.2, rz: 0.12 } }) });
sh(143.01, 'shop', 'day', [[6, 2, 16], [-10, 12, -10], 46, [6, 2, 16], [-40, 14, -30], 40], { d: [-30, 14, -20, 0], W: (s) => ({ ...W1, clouds: true, heli: { pos: [lerp(-14, -60, ramp(s, 143, 145.3)), 18 + (s - 143) * 2, lerp(-6, -40, ramp(s, 143, 145.3))], ry: 2.2, rz: 0.15 } }) });
sh(145.34, 'lab', 'lab', [[-8.2, 3.6, -5.6], [-8.2, 3.3, -7.86], 40, [-6, 1.8, 2.5], [-3, 1.2, -4], 56], { tr: 'dip', d: [-6, 1.5, -3, 2] });
sh(148.0, 'lab', 'lab', [[9, 2.6, 6], [-4, 1.2, -4], 56, [8.4, 2.5, 5.4], [-4, 1.2, -4], 54], { d: [-2, 1.4, -2, 2], cam: (s) => ({ flash: s > 149.0 && s < 149.4 ? 0.3 : 0 }),
  A: (s, u, f) => [JL({ expr: 'shock', look: Math.sin(s * 2), L: 'hang', R: 'hang', blink: bl(f, 3) }, 'lab', -1.0, 0.5)] });
const HZ = [[0, -3.5, -1.0], [1, 2.4, -3.8], [2, -6.4, -4.2], [3, 3.8, 1.8], [4, -2.0, 3.0]];
const hazmats = (s, f, ex = {}) => HZ.map(([i, x, z], k) => ch({ ...C.HAZMAT, seed: 23 + i }, { expr: ['neutral', 'stern', 'awe', 'neutral', 'talk'][k], turn: x > -1 ? -0.5 : 0.5, look: x > -1 ? -1 : 1, ...(k % 2 ? wk(s + k, 1.4) : {}), L: k === 1 ? 'reach' : 'hang', holdL: k === 1 ? 'clip' : null, R: k === 3 ? { x: 470, y: 450 } : 'hang', holdR: k === 3 ? 'mug' : null, blink: bl(f, i + 3) }, 'lab', x + (k % 2 ? Math.sin(s * 0.5 + k) * 0.6 : 0), z));
sh(150.21, 'lab', 'lab', [[-1, 1.5, 6.5], [-1, 1.3, -2], 50, [-1.3, 1.5, 6.0], [-1, 1.3, -2], 48], { d: [-1, 1.5, 0.5, 6], A: (s, u, f) => [JL({ expr: 'worried', look: Math.sin(s * 1.4), blink: bl(f, 3) }, 'lab', -1.0, 0.5), ...hazmats(s, f)] });
const WEB = (o, x, z, ex) => ch(o.messy ? C.WEBER_MESSY : C.WEBER, { expr: 'stern', ...o }, 'lab', x, z, ex);
sh(153.48, 'lab', 'lab', [[1.4, 0.8, 0.6], [2.6, 1.7, -1.4], 44, [1.5, 0.85, 0.3], [2.6, 1.7, -1.4], 42], { d: [2.6, 1.6, -1.4, 10],
  A: (s, u, f) => [WEB({ expr: s < 155.3 ? 'stern' : 'smug', turn: -0.2, look: -0.5, L: 'reach', holdL: 'clip', R: 'hang', blink: bl(f, 17), ...(s < 154.6 ? wk(s, 1.2) : {}) }, lerp(4.0, 2.6, sp(s, 153.5, 154.6)), -1.4)] });
sh(156.21, 'lab', 'lab', [[2.6, 1.58, -0.2], [2.6, 1.55, -1.4], 26, [2.6, 1.56, -0.7], [2.6, 1.7, -1.4], 22], { d: [2.6, 1.6, -1.4, 14],
  K: [[156.21, [2.6, 1.58, -0.2], [2.6, 1.56, -1.4], 26], [156.95, [2.45, 1.62, -0.6], [2.6, 1.62, -1.4], 18], [157.9, [2.2, 1.2, -0.4], [2.25, 1.1, -1.4], 26], [158.55, [2.2, 1.2, -0.5], [2.25, 1.1, -1.4], 25]],
  A: (s, u, f) => [WEB({ expr: 'stern', look: 0, L: s > 157.6 ? { x: 160, y: 470 } : 'reach', holdL: 'clip', R: 'hang', blink: 0 }, 2.6, -1.4)],
  X: (s) => s > 156.9 && s < 157.6 ? [fx('gl' + q((s - 156.9) / 0.7, 1), flashPop(q((s - 156.9) / 0.7, 1)), 'lab', 2.75, 1.4, -1.3, 0.25)] : [] });
sh(158.55, 'lab', 'lab', [[0.6, 1.5, 2.4], [0.6, 1.35, -1.4], 44, [0.6, 1.5, 2.1], [0.6, 1.35, -1.4], 42], { d: [0.2, 1.5, -1.3, 8],
  A: (s, u, f) => { const a = (s - 158.55) * 0.9; return [JL({ expr: 'goofy', look: Math.sin(a) * 0.8, L: 'hang', R: s > 159.8 ? 'wave' : 'hang', blink: bl(f, 3) }, 'lab', -0.4, -1.3), WEB({ expr: 'stern', turn: -0.6, look: -1, L: 'chin', R: 'hang' }, 0.2 + Math.sin(a) * 0.9, -1.3 - Math.cos(a) * 0.6)]; } });
sh(161.48, 'lab', 'lab', [[-1.4, 1.55, 0.1], [0.8, 1.55, -1.6], 34, [-1.3, 1.55, -0.1], [0.8, 1.55, -1.6], 32], { d: [0.8, 1.6, -1.6, 12],
  A: (s, u, f) => [JL({ expr: 'neutral', turn: 0.6, look: 1, blink: bl(f, 3) }, 'lab', -0.7, -0.7, { order: 3 }), WEB({ expr: tk(s, [[161.5, 163.7]], 'stern'), turn: -0.4, look: -1, L: 'reach', holdL: 'clip', R: 'point', blink: bl(f, 17) }, 0.8, -1.6)] });
sh(164.22, 'lab', 'lab', [[1.3, 1.55, 0.2], [-0.7, 1.55, -1.0], 34, [1.2, 1.55, 0.0], [-0.7, 1.55, -1.0], 32], { d: [-0.7, 1.6, -1.0, 12],
  A: (s, u, f) => [JL({ expr: tk(s, [[164.22, 166.28]], s < 165.2 ? 'worried' : 'goofy'), turn: -0.4, look: -1, sweat: true, L: 'chin', R: 'hang', blink: bl(f, 3) }, 'lab', -0.7, -1.0), WEB({ expr: 'stern', turn: -0.4, L: 'reach', holdL: 'clip' }, 0.8, -1.6, { order: 3 })] });
sh(166.94, 'lab', 'lab', [[1.1, 1.3, -0.5], [0.8, 1.25, -1.6], 30, [1.05, 1.32, -0.75], [0.8, 1.35, -1.6], 28], { d: [0.8, 1.4, -1.6, 14],
  A: (s, u, f) => [WEB({ expr: 'stern', look: -0.3, L: { x: 200, y: 520 }, holdL: 'clip', R: { x: 250 + Math.sin(s * 20) * 16, y: 470 + Math.cos(s * 17) * 10 }, headTilt: -6, blink: s > 168.9 ? 0 : 1 }, 0.8, -1.6)] });
sh(170.06, 'lab', 'lab', [[-0.2, 1.5, 1.6], [0.1, 1.45, -1.3], 40, [-0.2, 1.5, 1.4], [0.1, 1.45, -1.3], 38], { d: [0.1, 1.5, -1.3, 9],
  A: (s, u, f) => [JL({ expr: s < 171.5 ? 'goofy' : 'smug', turn: 0.3, look: 1, blink: bl(f, 3) }, 'lab', -0.7, -1.0), WEB({ expr: tk(s, [[170.06, 170.64], [171.08, 172.43]], 'neutral'), turn: -0.3, look: -1, L: { x: 200, y: 520 }, holdL: 'clip', R: 'hang', blink: bl(f, 17) }, 0.8, -1.6)] });
sh(173.04, 'lab', 'lab', [[-0.3, 1.3, 2.6], [0.5, 1.2, -2.8], 46, [-0.1, 1.3, 2.0], [0.5, 1.2, -2.8], 44], { d: [0.5, 1.3, -2.8, 6], shake: [[173.1, 0.008]],
  A: (s, u, f) => [JL({ expr: 'scared', legs: 'sit', L: 'hang', R: 'reach', blink: 0 }, 'lab', 0.5, -2.75, { y: 0.0 }), ...[[0, -0.8, -1.6], [1, 1.8, -1.8], [4, 0.3, -1.0]].map(([i, x, z], k) => ch({ ...C.HAZMAT, seed: 23 + i }, { expr: 'stern', turn: x > 0.5 ? -0.5 : 0.5, ...wk(s + k, 1.4), R: 'reach', holdR: ['syringe', 'scissors', 'swab'][k] }, 'lab', lerp(x * 2.2, x, sp(s, 173, 174.2)), z))] });
const testShot = (t0, t1, tool, expr, extraX) => sh(t0, 'lab', 'lab', [[0.5, 1.45, -0.4], [0.9, 1.3, -2.9], 40, [0.5, 1.45, -0.6], [0.9, 1.3, -2.9], 38], { d: [0.5, 1.35, -2.75, 12],
  A: (s, u, f) => [JL({ expr: typeof expr === 'function' ? expr(s) : expr, legs: 'sit', L: 'hang', R: tool === 'syringe' ? 'reach' : 'hang', blink: 0, sweat: true, tilt: tool === 'dizzy' ? q(Math.sin(s * 3) * 4, 1) : 0 }, 'lab', 0.5, -2.75),
    ...(tool && tool !== 'dizzy' ? [ch({ ...C.HAZMAT, seed: 26 }, { expr: 'stern', turn: -0.5, look: -1, L: tool === 'syringe' ? { x: 60, y: 430 } : tool === 'scissors' ? { x: 90, y: 200 } : { x: 70, y: 300 }, holdL: tool, R: 'hang' }, 'lab', 1.55, -3.0, { order: 1 })] : [])],
  X: extraX });
testShot(174.37, 175.31, 'syringe', 'pain');
testShot(175.31, 176.44, 'scissors', 'shock', (s) => [fx('tf' + q((s - 175.31) % 1, 1), tufts(q((s - 175.31) % 1, 1)), 'lab', 0.5, 1.0, -2.6, 0.6)]);
testShot(176.44, 177.77, 'swab', (s) => (Math.floor(s * 6) % 2 ? 'yell' : 'laugh'));
sh(177.77, 'lab', 'lab', [[-5, 2.4, -0.4], [-5, 0.9, -3], 44, [-5.2, 2.2, -0.8], [-5, 0.9, -3], 42], { d: [-5, 1.0, -3, 8],
  A: (s, u, f) => [JL({ expr: 'worried', look: 0.5, L: 'hang', R: 'hang', blink: bl(f, 3) }, 'lab', -3.9, -3.0, { roll: Math.PI / 2, y: 1.22, blob: false })],
  X: (s) => [fx('sc' + q(((s - 177.77) * 0.8) % 1, 1), scanLine(q(((s - 177.77) * 0.8) % 1, 1)), 'lab', -5, 0.6, -2.8, 0.9)] });
testShot(179.69, 181.25, 'syringe', 'pain');
testShot(181.25, 183.5, 'syringe', (s) => (s < 182.3 ? 'pain' : 'sob'));
sh(183.5, 'lab', 'lab', [[1.0, 1.4, 0.6], [0.6, 1.2, -2.8], 40, [0.9, 1.35, 0.1], [0.6, 1.2, -2.8], 38], { d: [0.5, 1.2, -2.75, 10],
  A: (s, u, f) => [JL({ expr: s < 185.5 ? 'tired' : 'goofy', legs: 'sit', L: 'hang', R: 'hang', headTilt: q(Math.sin(s * 2) * 12, 0), tilt: q(Math.sin(s * 1.5) * 5, 1), blink: bl(f, 3) }, 'lab', 0.5, -2.75)],
  X: (s) => [fx('st' + q((s * 0.7) % 1, 1), stars(q((s * 0.7) % 1, 1)), 'lab', 0.5, 1.15, -2.6, 0.75)] });
sh(187.83, 'shop', 'day', [[-2, 1.5, 9], [6, 5, 18.9], 46, [-1.6, 1.5, 9.4], [6, 5.4, 18.9], 44], { tr: 'flash', d: [6, 6, 18.9, 1], W: () => ({ ...W1, clouds: true, bigScreen: true, crowd: 'phones', posters: true }) });
sh(189.18, 'shop', 'day', [[3, 0.6, 9.5], [6, 6.2, 18.9], 50, [3.4, 0.6, 9.9], [6, 6.4, 18.9], 46], { d: [6, 6, 18.9, 1], W: () => ({ ...W1, bigScreen: true, crowd: 'phones', crowdBob: 0.06 }),
  X: (s) => [fx('cf' + q((s * 0.6) % 1, 2), confetti(q((s * 0.6) % 1, 2)), 'shop', 3.5, 0.5, 11.5, 2.5)] });
sh(191.24, 'shop', 'shopDay', [[2.9, 2.3, -1.43], [4.0, 2.45, -2.6], 40, [3.1, 2.35, -1.65], [4.0, 2.45, -2.6], 36], { tr: 'dip', d: [4, 2.45, -2.6, 6], W: () => ({ ...W1, tv: 'jonas', door: 0 }) });
sh(193.28, 'shop', 'day', [[-9.6, 1.8, 7.4], [-10.0, 1.9, 4.4], 42, [-9.8, 1.85, 6.9], [-10.0, 1.9, 4.4], 40], { tr: 'dip', d: [-10, 1.9, 4.4, 6], W: () => ({ ...W1, posters: true, merch: true, toy: 1 }) });
sh(194.63, 'shop', 'day', [[-12, 1.65, 10.8], [-12, 1.6, 7.0], 46, [-11.8, 1.65, 10.4], [-12, 1.6, 7.0], 44], { d: [-12, 1.7, 7, 5], W: () => ({ ...W1, posters: true, merch: true, toy: 1 }),
  A: (s, u, f) => [ch(DERTEE(3), { expr: 'happy', turn: 0.4, look: 0.8, L: 'wave', blink: bl(f, 5) }, 'shop', -10.6, 8.7), ch(DERTEE(6), { expr: 'goofy', turn: -0.3, R: 'thumb', blink: bl(f, 8) }, 'shop', -13.4, 8.9)] });
sh(198.21, 'shop', 'day', [[-15.6, 1.6, 9.2], [-16.6, 1.5, 6.8], 42, [-15.8, 1.6, 8.8], [-16.6, 1.55, 6.8], 40], { d: [-16.6, 1.5, 6.8, 6], W: () => ({ ...W1, toy: 1, merch: true, posters: true }) });
sh(202.21, 'shop', 'day', [[-16.35, 1.6, 7.6], [-16.6, 1.55, 6.8], 32, [-16.45, 1.6, 7.45], [-16.6, 1.6, 6.8], 26], { d: [-16.6, 1.55, 6.8, 12], W: () => ({ ...W1, toy: 1, merch: true, posters: true }) });
const GUARDS = [[-1.6, -0.6], [1.6, -0.6], [-2.2, 0.6], [2.2, 0.6], [-1.0, 1.4], [1.0, 1.4]];
const guards = (s, f, cx, cz, ex = {}) => GUARDS.map(([x, z], k) => ch({ ...C.GUARD, seed: 21 + k }, { expr: ex.sleep ? 'sleep' : 'stern', turn: x > 0 ? -0.3 : 0.3, L: ex.sleep ? 'belly' : (k % 2 ? 'cross' : 'hang'), R: ex.sleep ? 'belly' : 'hang', legs: ex.sleep ? 'sit' : (ex.walk ? 'walk' : 'stand'), step: ex.walk ? q((s * 1.5 + k * 0.2) % 1, 2) : 0, headTilt: ex.sleep ? 14 : 0 }, 'lab', cx + x, cz + z));
sh(204.0, 'lab', 'lab', [[-4, 1.6, 7.0], [-4, 1.4, 1.5], 50, [-4, 1.6, 6.4], [-4, 1.4, 1.5], 48], { tr: 'dip', d: [-4, 1.5, 1.5, 5],
  A: (s, u, f) => [JL({ expr: 'worried', look: Math.sin(s * 2), blink: bl(f, 3) }, 'lab', -4, 1.5), ...guards(s, f, -4, 1.5)] });
sh(205.53, 'lab', 'lab', [[-4, 1.55, 3.6], [-4, 1.6, 1.5], 36, [-4, 1.55, 3.3], [-4, 1.6, 1.5], 34], { d: [-4, 1.6, 1.5, 12], shake: [[205.6, 0.01]],
  A: (s, u, f) => [JL({ expr: 'yell', L: 'up', R: 'up' }, 'lab', -4, 1.5), ...guards(s, f, -4, 1.5)] });
sh(206.44, 'lab', 'lab', [[-6.5, 1.6, 2.4], [-10, 1.4, 7.9], 46, [-6.8, 1.6, 2.8], [-10, 1.4, 7.9], 44], { d: [-9.5, 1.5, 6.4, 6],
  A: (s, u, f) => { const t = sp(s, 206.4, 207.8); return [JL({ expr: s > 207.6 ? 'tired' : 'worried', turn: 0.4, ...(t < 1 ? wk(s) : {}), blink: bl(f, 3) }, 'lab', lerp(-7.5, -10, t), lerp(4.6, 6.8, t)), ...guards(s, f, lerp(-6.8, -9.4, t), lerp(3.6, 5.6, t), { walk: t < 1 })]; } });
sh(208.69, 'lab', 'lab', [[-3.4, 1.55, 3.6], [-4, 1.55, 1.5], 34, [-3.45, 1.55, 3.4], [-4, 1.55, 1.5], 32], { d: [-4, 1.6, 1.5, 12], shake: [[209.3, 0.016]],
  A: (s, u, f) => [JL({ expr: s < 209.3 ? 'pain' : 'yell', headTilt: s < 209.3 ? -10 : 8, L: 'hang', R: 'hang' }, 'lab', -4, 1.5)], X: (s) => s > 209.3 ? [fx('spr' + q(Math.min(1, (s - 209.3) * 2.5), 1), spray(q(Math.min(1, (s - 209.3) * 2.5), 1)), 'lab', -4.3, 0.8, 1.7, 0.8)] : [] });
sh(209.74, 'lab', 'lab', [[-4, 1.5, 6.8], [-4, 1.3, 1.5], 50, [-4, 1.5, 6.4], [-4, 1.3, 1.5], 48], { d: [-4, 1.4, 1.5, 4], shake: [[209.9, 0.012], [210.6, 0.01]],
  A: (s, u, f) => [JL({ expr: 'shock', L: 'hang', R: 'hang' }, 'lab', -4, 1.5), ...[0, 1, 2, 3].map((k) => ch({ ...C.HAZMAT, seed: 30 + k }, { expr: 'yell', turn: 0.5, ...wk(s + k * 0.2, 3), L: 'forward', R: 'forward' }, 'lab', lerp(-11 - k * 0.9, -5.3 - k * 0.2, sp(s, 209.8, 211.2)), 1.5 + (k - 1.5) * 0.7))] });
const phoneCall = (t, name, ex = {}) => sh(t, 'lab', 'lab', [[9.2, 1.42, -6.4], [9.2, 1.4, -6.9], 40, [9.2, 1.41, -6.5], [9.2, 1.4, -6.9], 38], { tr: 'dip', d: [9.2, 1.4, -6.9, 14],
  W: (s) => ({ phone: { set: 'lab', pos: [9.2, 1.4, -6.9], rot: [0, 0, 0.04 * Math.sin(s * 30)], k: 'call:' + name } }), shake: ex.shake });
phoneCall(211.77, 'Bundeskanzlerin', { shake: [[211.9, 0.004]] });
phoneCall(213.47, 'Vereinte Nationen|UNO', { shake: [[213.6, 0.004]] });
phoneCall(215.25, 'Frau Schmidt|(Grundschule)', { shake: [[215.4, 0.004]] });
sh(216.6, 'lab', 'lab', [[8.6, 1.5, -3.2], [9.6, 1.5, -5.4], 38, [8.7, 1.5, -3.5], [9.6, 1.5, -5.4], 36], { tr: 'dip', d: [9.6, 1.5, -5.4, 10],
  A: (s, u, f) => [JL({ expr: s < 218.6 ? 'goofy' : 'happy', turn: -0.3, R: { x: 430, y: 270 }, holdR: 'phone', L: 'hang', blink: bl(f, 3) }, 'lab', 9.6, -5.4)],
  X: (s) => s > 218.6 ? [fx('tb' + Math.floor(s * 30 / 4) % 2, bubble(TEACHER, { expr: tk(s, [[218.7, 221.1]], 'smile') }), 'lab', 10.6, 1.4, -5.4, 0.7)] : [] });
sh(221.79, 'lab', 'lab', [[9.7, 1.6, -4.0], [9.6, 1.55, -5.4], 30, [9.68, 1.58, -4.2], [9.6, 1.55, -5.4], 28], { d: [9.6, 1.55, -5.4, 14],
  A: (s, u, f) => [JL({ expr: s < 223.0 ? 'neutral' : 'smug', look: s > 222.8 ? 0 : -0.6, L: 'hang', R: 'hang', blink: bl(f, 3) }, 'lab', 9.6, -5.4)] });
sh(224.28, 'lab', 'labNight', [[8.0, 1.7, 1.0], [11.8, 1.9, 1.0], 44, [7.2, 1.7, 1.0], [11.8, 1.9, 1.0], 46], { d: [10.9, 1.6, 1.0, 6], W: (s) => ({ city: 'night', labDoor: 0 }),
  A: (s, u, f) => [JL({ expr: 'sad', turn: 0.9, look: 1, L: 'hang', R: 'hang', blink: bl(f, 3) }, 'lab', 10.9, 1.0)] });

// ================= MONAT 1–3 =================
sh(227.06, 'lab', 'lab', [[7.0, 2.4, 3.6], [11, 1.2, 3], 50, [7.2, 2.3, 3.2], [11, 1.2, 3], 48], { tr: 'dip', d: [10.5, 1, 6.6, 3],
  W: (s) => ({ city: Math.floor((s - 227.06) * 3) % 2 ? 'night' : 'day' }), cam: (s) => ({ dip: Math.floor((s - 227.06) * 3) % 2 ? 0.35 : 0 }),
  A: (s, u, f) => [JL({ expr: 'tired', L: 'belly', R: 'belly', blink: bl(f, 3) }, 'lab', 9.7, 6.6, { roll: -Math.PI / 2, y: 0.98, blob: false })] });
sh(230.27, 'lab', 'lab', [[-1, 1.6, 4.4], [-1, 1.5, 0.4], 42, [-1.2, 1.6, 4.0], [-1, 1.5, 0.4], 40], { tr: 'dip', d: [-1, 1.5, 0.4, 7],
  A: (s, u, f) => [JL({ expr: 'laugh', L: 'up', R: 'thumb', blink: bl(f, 3) }, 'lab', -1, 0.4), ch({ ...C.HAZMAT, seed: 40 }, { expr: 'laugh', R: { x: 480, y: 250 }, holdR: 'phone', turn: -0.3 }, 'lab', 0.1, 0.5), ch({ ...C.HAZMAT, seed: 41 }, { expr: 'goofy', L: 'wave' }, 'lab', -2.1, 0.6)],
  X: (s) => { const t = (s * 1.2) % 1; return t < 0.3 ? [fx('sf' + q(t / 0.3, 1), flashPop(q(t / 0.3, 1)), 'lab', 0.3, 1.5, 0.7, 0.5)] : []; } });
sh(233.51, 'lab', 'lab', [[7.5, 1.6, 3.4], [10.5, 0.9, 6.4], 44, [7.8, 1.6, 3.8], [10.5, 0.9, 6.4], 42], { tr: 'dip', d: [10.5, 1.0, 6.5, 8], W: () => ({ city: 'day' }),
  A: (s, u, f) => [JL({ expr: 'tired', legs: 'sit', L: 'belly', R: 'chin', headTilt: 8, blink: bl(f, 3) }, 'lab', 10.5, 6.6, { y: 0.1 }), ...[[8.6, 7.4], [12, 4.6]].map(([x, z], k) => ch({ ...C.GUARD, seed: 21 + k }, { expr: 'stern', L: 'cross' }, 'lab', x, z))] });
sh(235.44, 'lab', 'lab', [[10.4, 1.4, 5.2], [10.5, 1.35, 6.6], 30, [10.45, 1.4, 5.5], [10.5, 1.35, 6.6], 28], { d: [10.5, 1.35, 6.6, 14],
  A: (s, u, f) => [JL({ expr: s < 236.5 ? 'tired' : 'sob', legs: 'sit', L: 'chin', R: 'chin', headTilt: q(Math.sin(s * 1.3) * 6, 0) }, 'lab', 10.5, 6.6, { y: 0.1 })] });
const M2 = { night: false };
sh(237.69, 'shop', 'day', [[5.2, 1.55, 9.6], [2.6, 1.4, 5.4], 40, [4.9, 1.55, 9.3], [2.6, 1.4, 5.4], 38], { tr: 'dip', d: [2.6, 1.5, 5.4, 8], W: (s) => ({ ...M2, shopDoor: 1.2 }),
  A: (s, u, f) => [JL({ expr: 'worried', turn: 0.5, look: Math.sin(s * 4), L: s > 238.6 ? 'up' : 'hang', ...(s < 238.6 ? wk(s) : {}), blink: bl(f, 3) }, 'shop', 2.6, lerp(3.4, 5.4, sp(s, 237.7, 238.6)))] });
sh(240.15, 'shop', 'day', [[2.6, 6, 15], [2.6, 0.8, 7], 50, [2.6, 7, 16], [2.6, 0.8, 7], 52], { d: [2.6, 1, 7, 1], W: (s) => ({ ...M2, crowd: s > 241.3 ? 'phones' : null, crowdBob: 0.04 }),
  A: (s, u, f) => [JL({ expr: s > 241.3 ? 'scared' : 'worried', L: 'hang', R: 'hang', blink: bl(f, 3) }, 'shop', 2.6, 6.8)] });
sh(243.73, 'shop', 'day', [[3.5, 1.6, 9.0], [2.9, 1.5, 6.8], 38, [3.4, 1.6, 8.8], [2.9, 1.5, 6.8], 36], { d: [2.9, 1.5, 6.8, 12], W: () => ({ ...M2, crowd: 'phones' }),
  A: (s, u, f) => [JL({ expr: s > 244.6 ? 'goofy' : 'worried', turn: 0.3, L: 'hang', R: s > 244.6 ? 'thumb' : 'hang', blink: s > 244.6 && s < 244.9 ? 1 : bl(f, 3) }, 'shop', 2.6, 6.8), ch(C.woman(4), { expr: 'laugh', R: { x: 520, y: 200 }, holdR: 'phone', L: { x: 120, y: 400 }, turn: -0.3 }, 'shop', 3.4, 7.0)],
  X: (s) => s > 244.6 && s < 245.1 ? [fx('sel' + q((s - 244.6) * 2, 1), flashPop(q((s - 244.6) * 2, 1)), 'shop', 3.8, 1.6, 7.1, 0.5)] : [] });
sh(245.68, 'shop', 'day', [[1.2, 1.4, 9.2], [2.6, 1.5, 6.8], 40, [1.35, 1.4, 9.0], [2.6, 1.5, 6.8], 38], { d: [2.6, 1.5, 6.8, 10], W: () => ({ ...M2, crowd: 'phones' }), shake: [[246.2, 0.008], [247.4, 0.008]],
  A: (s, u, f) => [JL({ expr: 'scared', sweat: true, L: 'up', R: 'up', blink: 0 }, 'shop', 2.6, 6.8), ...[[11, 1.4, 7.6], [12, 3.9, 7.8], [13, 1.0, 6.3]].map(([i, x, z], k) => ch(C.woman(i), { expr: tk(s + k * 0.2, [[245.7, 249.1]], 'angry'), turn: x > 2.6 ? -0.5 : 0.5, look: x > 2.6 ? -1 : 1, R: 'point', L: k % 2 ? 'up' : 'hip' }, 'shop', x, z))] });
sh(249.25, 'shop', 'shopDay', [[0.2, 1.42, 1.2], [0.2, 1.4, 0.7], 34, [0.2, 1.41, 1.05], [0.2, 1.4, 0.7], 30], { tr: 'dip', d: [0.2, 1.4, 0.7, 14],
  W: (s) => ({ ...M2, phone: { pos: [0.2, 1.4, 0.7], rot: [0, 0, 0.02], k: 'theory' } }) });
sh(255.3, 'shop', 'shopDay', [[1.25, 1.55, 0.2], [0.9, 1.55, -1.6], 30, [1.2, 1.55, 0.0], [0.9, 1.55, -1.6], 28], { tr: 'dip', d: [0.9, 1.55, -1.6, 14], W: () => ({ ...M2, door: 0 }),
  A: (s, u, f) => [JL({ expr: 'smug', look: 0.0, blink: s < 255.7 ? 1 : 0, L: 'hip', R: 'hip' }, 'shop', 0.9, -1.6)] });
sh(255.98, 'shop', 'day', [[-8, 3.5, 4.8], [8, 1.0, 12], 50, [-7, 3.3, 5.2], [8, 1.0, 12], 48], { tr: 'dip', d: [8, 1, 12, 1], W: (s) => ({ ...M2, clouds: true, cars: false, bus: true, busPos: [lerp(-30, 2, ramp(s, 256, 259.3)), 0, 12.6], busRy: 0 }),
  A: (s, u, f) => [0, 1, 2, 3].map((k) => ch(C.woman(k + 2), { expr: 'happy', turn: k % 2 ? -0.5 : 0.5, ...wk(s + k * 0.3, 1.3), R: k === 1 ? { x: 470, y: 520 } : 'hang', holdR: k === 1 ? 'bag2' : null }, 'shop', -4 + k * 3 + (k % 2 ? -1 : 1) * (s - 256) * 1.1, k % 2 ? 6.0 : 17.0)) });
sh(259.34, 'shop', 'day', [[6, 1.4, 8.2], [0, 1.6, 12.6], 46, [6, 1.4, 8.2], [8, 1.6, 12.6], 46], { d: [4, 1.6, 12.6, 3], W: (s) => ({ ...M2, cars: false, bus: true, busPos: [lerp(-10, 14, ramp(s, 259.34, 260.9)), 0, 12.6], busRy: 0 }),
  A: (s, u, f) => [ch({ ...C.woman(9), hat: { type: 'police', color: '#2a3a6a', band: '#1c1a24' } }, { expr: 'happy', R: 'wheel', L: 'wave' }, 'shop', lerp(-10, 14, ramp(s, 259.34, 260.9)) + 3.9, 12.0, { y: 0.5, s: 0.9, blob: false })] });
sh(260.87, 'shop', 'day', [[-20, 1.6, 12.0], [-23, 1.3, 7.0], 44, [-19.6, 1.6, 11.6], [-23, 1.3, 7.0], 42], { tr: 'dip', d: [-23, 1.4, 7.2, 5], W: () => ({ ...M2, cars: false, tanks: false }),
  A: (s, u, f) => [ch(BUILDER(2), { expr: 'determined', R: 'up', holdR: 'hammer', L: 'reach', tilt: q(Math.sin(s * 8) * 2, 1) }, 'shop', -24, 6.6), ch(BUILDER(5), { expr: 'happy', turn: 0.4, ...wk(s, 1.2), L: { x: 100, y: 380 }, R: { x: 500, y: 380 } }, 'shop', -21.8 + Math.sin(s * 0.6) * 0.5, 7.8), ch(BUILDER(7), { expr: 'smile', L: 'thumb', holdR: 'hammer', R: 'hang' }, 'shop', -25.6, 7.6)] });
sh(262.9, 'shop', 'day', [[13.2, 1.5, 4.8], [13.4, 1.2, 11.5], 44, [13.0, 1.5, 5.2], [13.4, 1.2, 11.5], 42], { d: [13.4, 1.3, 11.0, 5], W: () => ({ ...M2, cars: false }),
  A: (s, u, f) => { const z = lerp(16.8, 6.4, ramp(s, 263, 267.8)); return [ch(GRANNY, { expr: 'smile', turn: -0.3, ...wk(s, 1.0) }, 'shop', 13.0, z), ch(C.woman(7), { expr: 'happy', turn: 0.4, L: 'reach', ...wk(s + 0.3, 1.0) }, 'shop', 13.9, z + 0.2), ch(C.woman(10), { expr: 'determined', L: { x: 120, y: 360 }, R: { x: 480, y: 360 }, ...wk(s, 1.2) }, 'shop', 10.4, 8.6 + Math.sin(s * 0.5)), ch(C.woman(11), { expr: 'happy', L: { x: 120, y: 360 }, R: { x: 480, y: 360 }, ...wk(s + 0.5, 1.2) }, 'shop', 11.6, 8.6 + Math.sin(s * 0.5))]; } });
sh(267.89, 'lab', 'lab', [[7.4, 1.8, 1.0], [11.8, 1.8, 1.0], 46, [8.0, 1.75, 1.0], [11.8, 1.8, 1.0], 44], { tr: 'dip', d: [11.8, 2, 1.0, 4], W: () => ({ city: 'day' }),
  A: (s, u, f) => [JL({ expr: 'sad', turn: 0.9, look: 1, L: 'hang', R: { x: 520, y: 350 }, blink: bl(f, 3) }, 'lab', 10.9, 1.4)] });
sh(270.79, 'lab', 'labNight', [[7.0, 2.6, 2.6], [10.5, 0.9, 6.4], 50, [6.4, 2.8, 2.0], [10.5, 0.9, 6.4], 52], { tr: 'dip', d: [10.5, 1, 6.6, 3], W: () => ({ city: 'night' }),
  A: (s, u, f) => [JL({ expr: 'sad', legs: 'sit', L: 'belly', R: 'belly', headTilt: 8, blink: bl(f, 3) }, 'lab', 10.5, 6.6, { y: 0.1 })] });
sh(272.72, 'shop', 'memory', [[1.6, 1.5, 3.4], [1.2, 1.3, 0.3], 46, [1.5, 1.5, 3.1], [1.2, 1.3, 0.3], 44], { tr: 'dip', d: [1.2, 1.4, 0.3, 8], W: () => ({ ...shopNight, tv: 'fussball' }),
  A: (s, u, f) => [J({ expr: 'laugh', turn: -0.5, L: 'up', R: 'up', legs: 'sit', bob: q(Math.abs(Math.sin(s * 6)) * 0.01, 3) }, 'shop', 0.4, 0.3), ch(C.MURAT, { expr: 'laugh', turn: -0.5, L: 'up', R: { x: 470, y: 330 }, holdR: 'chips', legs: 'sit', bob: q(Math.abs(Math.sin(s * 6 + 1)) * 0.01, 3) }, 'shop', 1.6, 0.3)] });
sh(275.27, 'lab', 'labNight', [[8.6, 1.4, 3.6], [10.5, 1.1, 6.6], 38, [8.8, 1.4, 3.9], [10.5, 1.1, 6.6], 36], { tr: 'dip', d: [10.5, 1.2, 6.6, 10], W: () => ({ city: 'night' }),
  A: (s, u, f) => [JL({ expr: 'sad', legs: 'sit', L: 'belly', R: { x: 470, y: 520 }, holdR: 'chips', blink: bl(f, 3) }, 'lab', 10.5, 6.6, { y: 0.1 })] });
sh(277.9, 'lab', 'labNight', [[9.4, 1.4, 4.9], [10.5, 1.3, 6.6], 36, [9.5, 1.4, 5.1], [10.5, 1.3, 6.6], 34], { d: [10.5, 1.3, 6.6, 12], W: () => ({ city: 'night' }),
  A: (s, u, f) => [JL({ expr: 'sad', legs: 'sit', L: { x: 240, y: 420 }, holdL: 'phone', R: 'belly', headTilt: 6, blink: bl(f, 3) }, 'lab', 10.5, 6.6, { y: 0.1 })],
  X: (s) => s > 280.5 ? [fx('mb' + Math.floor(s * 30 / 4) % 2, bubble(C.MURAT, { expr: tk(s, [[280.6, 281.8]], 'goofy'), holdR: 'chips', R: { x: 470, y: 330 } }), 'lab', 9.6, 1.5, 6.4, 0.7)] : [] });
sh(282.36, 'lab', 'labNight', [[10.5, 1.42, 6.35], [10.5, 1.4, 6.85], 36, [10.5, 1.41, 6.45], [10.5, 1.4, 6.85], 33], { tr: 'dip', d: [10.5, 1.4, 6.85, 14],
  W: (s) => ({ city: 'night', phone: { set: 'lab', pos: [10.5, 1.4, 6.85], rot: [0, Math.PI, 0], k: 'chat' + Math.min(6, 1 + Math.floor((s - 282.36) / 0.7)) } }) });
sh(286.48, 'lab', 'labNight', [[10.38, 1.38, 6.62], [10.4, 1.36, 6.85], 30, [10.39, 1.37, 6.68], [10.4, 1.36, 6.85], 26], { d: [10.4, 1.36, 6.85, 14],
  W: () => ({ city: 'night', phone: { set: 'lab', pos: [10.5, 1.4, 6.85], rot: [0, Math.PI, 0], k: 'chat6' } }) });
sh(288.72, 'lab', 'labNight', [[-1, 1.0, 6.2], [-4, 1.0, 1.5], 46, [-1.3, 1.0, 5.8], [-4, 1.0, 1.5], 44], { tr: 'dip', d: [-4, 1.2, 1.5, 4],
  A: (s, u, f) => [JL({ expr: 'determined', look: Math.sin(s * 3) * 0.6, legs: 'crouch', step: 0, L: 'forward', R: 'forward', bob: q(Math.abs(Math.sin(s * 5)) * 0.01, 3) }, 'lab', lerp(-8, 0, ramp(s, 288.8, 291.7)), 3.2), ...guards(s, f, -4, 1.5, { sleep: true })],
  X: (s) => [fx('gz' + q((s * 0.5) % 1, 1), zzz(q((s * 0.5) % 1, 1)), 'lab', -5, 1.3, 1, 0.5)] });
sh(291.79, 'shop', 'night', [[-6, 1.2, 8.0], [4, 1.0, 11], 46, [-5.6, 1.2, 8.2], [4, 1.0, 11], 44], { tr: 'dip', d: [4, 1, 11, 3], W: (s) => ({ ...shopNight, cars: false, bus: false }),
  A: (s, u, f) => { const x = lerp(-30, 30, ramp(s, 291.8, 294)); return [JL({ expr: 'determined', R: 'wheel', L: 'wheel' }, 'shop', x + 0.2, 10.8, { y: 0.15, s: 0.75, blob: false })]; },
  X: (s, u, f) => { const x = lerp(-30, 30, ramp(s, 291.8, 294)); return [fx('car', (p) => { const g = p.g; g.fillStyle = '#3aa060'; g.strokeStyle = ink; g.lineWidth = 12; g.beginPath(); g.roundRect(20, 700, 560, 190, 50); g.fill(); g.stroke(); g.fillStyle = '#1e1e22'; for (const x_ of [140, 460]) { g.beginPath(); g.arc(x_, 900, 60, 0, 7); g.fill(); } g.fillStyle = '#fff6c8'; g.fillRect(540, 760, 40, 40); }, 'shop', x, 0, 11.0, 1.4, { order: 7 })]; } });
sh(293.98, 'home', 'home', [[1.2, 1.6, 3.0], [4.2, 1.35, 0], 46, [1.5, 1.6, 2.7], [3.8, 1.35, 0], 44], { tr: 'dip', d: [3.6, 1.5, 0, 8], W: (s) => ({ }),
  A: (s, u, f) => { const hug = s > 294.9; const o = [JL({ expr: hug ? 'sad' : 'worried', turn: -0.6, look: -1, L: hug ? 'reach' : 'hang', R: hug ? 'reach' : 'hang', blink: bl(f, 3) }, 'home', lerp(5.4, 3.6, sp(s, 294.3, 294.9)), hug ? -0.7 : 0.0)];
    o.push(ch(C.MAMA, { expr: hug ? 'cry' : 'shock', turn: 0.6, look: 1, L: hug ? 'reach' : 'hang', R: hug ? 'reach' : 'chin', blink: bl(f, 14) }, 'home', hug ? 3.5 : 3.1, hug ? 0.6 : 0.15, { order: 3 })); return o; },
  X: (s) => [], _door: true });
SH[SH.length - 1].W = (s) => ({ homeDoor: 1.3 * sp(s, 294.0, 294.5) });
sh(297.07, 'home', 'home', [[2.2, 1.55, 1.6], [3.55, 1.55, -0.1], 36, [2.3, 1.55, 1.4], [3.55, 1.55, -0.1], 34], { d: [3.55, 1.55, -0.1, 12], W: () => ({ homeDoor: 1.3 }), shake: [[297.1, 0.008], [297.5, 0.008]],
  A: (s, u, f) => [JL({ expr: 'shock', sweat: true, turn: -0.3, L: 'reach', R: 'reach', blink: 0, tilt: q(Math.sin(s * 30) * 1.5, 1) }, 'home', 3.6, -0.7), ch(C.MAMA, { expr: 'sob', turn: 0.6, L: 'reach', R: 'reach' }, 'home', 3.5, 0.6, { order: 3 })] });
sh(298.12, 'home', 'home', [[0.6, 1.5, 1.6], [0, 0.8, -2.4], 46, [0.5, 1.45, 1.3], [0, 0.8, -2.4], 44], { tr: 'dip', d: [0, 0.9, -2.4, 6] });
sh(299.91, 'home', 'home', [[0.05, 1.2, -0.4], [0, 0.9, -2.4], 40, [0.05, 1.15, -0.8], [0, 0.85, -2.4], 38], { d: [0, 0.9, -2.4, 9] });
sh(300.77, 'home', 'home', [[1.35, 1.05, -1.65], [1.05, 0.66, -2.35], 36, [1.3, 1.0, -1.8], [1.05, 0.66, -2.35], 34], { d: [1.05, 0.66, -2.3, 12] });
sh(303.62, 'home', 'memory', [[0.4, 1.4, 0.6], [0, 1.2, -2.3], 40, [0.35, 1.4, 0.4], [0, 1.2, -2.3], 38], { tr: 'dip', d: [0, 1.3, -2.25, 10],
  A: (s, u, f) => [ch(C.PAPA, { expr: s < 304.6 ? 'smug' : 'stern', legs: 'sit', R: s < 304.6 ? { x: 470, y: 500 } : 'point', holdR: s < 304.6 ? 'remote' : null, L: { x: 200, y: 560 }, holdL: s < 304.6 ? null : 'remote', blink: bl(f, 11) }, 'home', 0, -2.25, { y: 0.15 })] });
sh(306.08, 'home', 'home', [[1.6, 1.45, 0.6], [0.3, 1.2, -2.0], 40, [1.5, 1.45, 0.4], [0.3, 1.2, -2.0], 38], { tr: 'dip', d: [0.7, 1.4, -1.5, 10],
  A: (s, u, f) => [JL({ expr: 'sad', turn: -0.5, look: -1, L: s < 307.2 ? { x: 30, y: 420 } : 'hang', R: 'hang', blink: bl(f, 3) }, 'home', 0.8, -1.4)] });
sh(307.7, 'home', 'home', [[2.6, 1.6, 2.6], [0.2, 1.0, -2.2], 42, [2.4, 1.6, 2.3], [0.2, 1.0, -2.2], 40], { d: [0.8, 1.3, -1.4, 6],
  A: (s, u, f) => [JL({ expr: 'sad', turn: -0.7, look: -1, L: 'hang', R: 'hang', blink: bl(f, 3) }, 'home', 0.8, -1.4)] });
sh(310.16, 'home', 'home', [[1.05, 1.58, -0.2], [0.8, 1.55, -1.4], 32, [0.95, 1.57, -0.65], [0.8, 1.55, -1.4], 28], { d: [0.8, 1.55, -1.4, 15],
  A: (s, u, f) => [JL({ expr: s < 311.2 ? 'cry' : 'sob', turn: -0.2, look: -0.3, L: s > 312 ? 'chin' : 'hang', R: s > 312 ? 'chin' : 'hang', bob: q(Math.abs(Math.sin(s * 9)) * 0.005, 3) }, 'home', 0.8, -1.4)] });
sh(313.22, 'home', 'home', [[2.4, 1.55, 1.2], [1.0, 1.45, -1.4], 40, [2.25, 1.55, 0.95], [1.0, 1.45, -1.4], 38], { d: [1.0, 1.5, -1.3, 10],
  A: (s, u, f) => [JL({ expr: 'cry', turn: -0.4, L: 'chin', R: 'hang' }, 'home', 0.8, -1.4), ch(C.MAMA, { expr: 'sad', turn: -0.4, look: -1, L: { x: 30, y: 300 }, R: 'hang', ...(s < 314.2 ? wk(s, 1) : {}), blink: bl(f, 14) }, 'home', lerp(2.6, 1.55, sp(s, 313.3, 314.3)), -1.15, { order: 3 })] });
sh(315.16, 'home', 'home', [[0.9, 1.55, 0.2], [1.6, 1.55, -1.15], 32, [0.95, 1.55, 0.0], [1.6, 1.55, -1.15], 30], { d: [1.6, 1.55, -1.15, 14],
  A: (s, u, f) => [ch(C.MAMA, { expr: tk(s, [[315.16, 316.76], [317.14, 318.57], [319.15, 320.36]], 'smile'), turn: -0.4, look: -1, L: { x: 30, y: 300 }, R: 'hang', blink: bl(f, 14) }, 'home', 1.6, -1.15)] });
sh(320.6, 'home', 'home', [[1.15, 1.58, -0.3], [0.8, 1.55, -1.4], 32, [1.08, 1.57, -0.6], [0.8, 1.55, -1.4], 30], { d: [0.8, 1.55, -1.4, 14],
  A: (s, u, f) => [JL({ expr: s < 323 ? 'cry' : 'worried', turn: 0.4, look: 1, L: 'hang', R: 'hang', blink: bl(f, 3) }, 'home', 0.8, -1.4)] });
sh(324.0, 'home', 'home', [[1.3, 0.95, -1.75], [1.0, 0.66, -2.3], 32, [1.2, 0.85, -1.95], [1.0, 0.66, -2.3], 26], { d: [1.0, 0.66, -2.3, 12],
  X: (s) => s > 326.0 ? [fx('gg' + q(Math.min(1, (s - 326) * 1.4), 1), glowFx('77,255,122', 0.6 * Math.sin(Math.PI * Math.min(1, (s - 326) * 1.4))), 'home', 1.0, 0.2, -2.25, 0.35)] : [] });

// ================= TAG 99 =================
sh(326.76, 'lab', 'labNight', [[8.6, 1.6, 3.8], [10.5, 0.8, 6.6], 44, [8.8, 1.55, 4.1], [10.5, 0.8, 6.6], 42], { tr: 'dip', d: [10.5, 0.9, 6.6, 8], W: () => ({ city: 'night' }),
  A: (s, u, f) => [JL({ expr: 'sleep', L: 'belly', R: 'belly' }, 'lab', 9.7, 6.6, { roll: -Math.PI / 2, y: 0.98, blob: false })], X: (s) => [fx('z9' + q((s * 0.5) % 1, 1), zzz(q((s * 0.5) % 1, 1)), 'lab', 10.6, 0.9, 6.5, 0.5)] });
sh(329.85, 'lab', 'labNight', [[10.2, 1.5, 5.6], [6.2, 1.5, 2.2], 48, [10.0, 1.5, 5.4], [6.2, 1.5, 2.2], 46], { d: [6.6, 1.5, 2.2, 6], shake: [[330.3, 0.02]],
  W: (s) => ({ city: 'night', labDoor: -1.5 * easeOut(ramp(s, 330.2, 330.5)) }),
  A: (s, u, f) => [WEB({ messy: true, expr: s < 331 ? 'yell' : 'determined', L: 'up', R: 'reach', ...(s > 330.4 && s < 332 ? wk(s, 2) : {}), blink: 0 }, lerp(5.2, 7.4, sp(s, 330.4, 332)), 2.2), JL({ expr: s < 330.3 ? 'sleep' : 'shock', L: 'up', R: 'up' }, 'lab', s < 330.3 ? 9.7 : 10.4, 6.6, s < 330.3 ? { roll: -Math.PI / 2, y: 0.98, blob: false } : { y: 0.25 })] });
sh(334.25, 'lab', 'labNight', [[7.6, 1.75, 3.2], [7.6, 1.85, 2.2], 30, [7.6, 1.75, 3.0], [7.6, 1.9, 2.2], 28], { d: [7.6, 1.8, 2.2, 14], W: () => ({ city: 'night', labDoor: -1.5 }),
  A: (s, u, f) => [WEB({ messy: true, expr: 'scared', look: Math.sin(s * 7), blink: 0, L: 'hang', R: 'hang' }, 7.6, 2.2)] });
sh(336.84, 'lab', 'labNight', [[8.0, 1.6, 4.0], [7.6, 1.5, 2.2], 36, [7.95, 1.6, 3.8], [7.6, 1.5, 2.2], 34], { d: [7.6, 1.55, 2.2, 12], W: () => ({ city: 'night', labDoor: -1.5 }),
  A: (s, u, f) => [WEB({ messy: true, expr: 'tired', R: { x: 470, y: 500 }, holdR: 'mug', L: { x: 130, y: 520 }, holdL: 'mug', tilt: q(Math.sin(s * 2.5) * 4, 1), blink: bl(f, 17) }, 7.6, 2.2)] });
sh(338.99, 'lab', 'labNight', [[8.6, 1.6, 3.6], [7.8, 1.6, 2.4], 30, [8.55, 1.6, 3.45], [7.8, 1.6, 2.4], 28], { d: [7.8, 1.6, 2.4, 14], W: () => ({ city: 'night', labDoor: -1.5 }),
  A: (s, u, f) => [WEB({ messy: true, expr: tk(s, [[338.99, 339.66], [339.93, 340.92]], 'determined'), turn: 0.3, look: 1, L: 'reach', R: 'hang', blink: 0 }, 7.8, 2.4)] });
sh(341.29, 'lab', 'labNight', [[9.3, 1.45, 4.4], [10.3, 1.3, 6.3], 34, [9.35, 1.45, 4.55], [10.3, 1.3, 6.3], 32], { d: [10.3, 1.4, 6.3, 12], W: () => ({ city: 'night', labDoor: -1.5 }),
  A: (s, u, f) => [JL({ expr: tk(s, [[341.29, 341.68]], 'tired'), legs: 'sit', turn: -0.5, look: -1, L: 'chin', R: 'belly', headTilt: 6, blink: bl(f, 3) }, 'lab', 10.3, 6.3, { y: 0.1 })] });
sh(342.04, 'lab', 'labNight', [[8.6, 1.5, 3.4], [9.8, 1.35, 6.2], 40, [8.7, 1.5, 3.6], [9.8, 1.35, 6.2], 38], { d: [9.6, 1.4, 6.0, 9], W: () => ({ city: 'night', labDoor: -1.5 }), shake: [[342.1, 0.01]],
  A: (s, u, f) => [JL({ expr: 'shock', legs: 'sit', turn: -0.5, look: -1, L: 'hang', R: 'hang', blink: 0, tilt: q(Math.sin(s * 25) * 2, 1) }, 'lab', 10.3, 6.3, { y: 0.1 }), WEB({ messy: true, expr: tk(s, [[342.04, 344.35]], 'yell'), turn: 0.5, look: 1, L: 'reach', R: 'reach', blink: 0 }, 9.4, 6.0, { order: 3 })] });
sh(344.87, 'lab', 'labNight', [[9.0, 1.6, -3.4], [9.0, 2.0, -7.8], 44, [9.0, 1.6, -3.7], [9.0, 2.0, -7.8], 42], { tr: 'dip', d: [9, 2.4, -7.8, 4], W: () => ({ city: 'night', cctv: 0, cctvMode: 'cam' }),
  A: (s, u, f) => [JL({ expr: 'worried', turn: 0.9, look: 1, blink: bl(f, 3) }, 'lab', 8.3, -5.8, { order: 3 }), WEB({ messy: true, expr: 'determined', turn: 0.9, R: 'point', L: 'hang' }, 9.9, -6.0)] });
sh(347.85, 'lab', 'labNight', [[9.0, 2.5, -6.2], [9.0, 2.5, -7.8], 46, [9.0, 2.5, -6.35], [9.0, 2.5, -7.8], 44], { d: [9, 2.5, -7.8, 4], W: (s) => ({ city: 'night', cctvMode: 'cam', cctv: q(ramp(s, 347.85, 350.11) * 0.3, 3) }) });
sh(350.11, 'lab', 'labNight', [[9.0, 2.5, -6.4], [9.0, 2.5, -7.8], 44, [9.0, 2.5, -6.7], [9.0, 2.5, -7.8], 40], { d: [9, 2.5, -7.8, 4], W: (s) => ({ city: 'night', cctvMode: 'cam', cctv: s < 351.6 ? 0.3 : s < 352.4 ? q(lerp(0.4, 0.6, ramp(s, 351.6, 352.4)), 3) : s < 353.3 ? 0.9 : 0.5 }), cam: (s) => ({ flash: s > 353.3 && s < 353.45 ? 0.4 : 0 }) });
sh(354.31, 'lab', 'labNight', [[9.0, 2.5, -6.7], [9.0, 2.5, -7.8], 40, [9.0, 2.5, -7.0], [9.0, 2.5, -7.8], 36], { d: [9, 2.5, -7.8, 4], W: (s) => ({ city: 'night', cctvMode: 'cam', cctv: q(0.47 + 0.06 * ramp(s, 354.3, 357.8), 3) }) });
sh(357.82, 'lab', 'labNight', [[8.9, 1.6, -7.2], [9.0, 1.5, -5.9], 40, [8.9, 1.6, -7.1], [9.0, 1.5, -5.9], 38], { d: [9, 1.55, -5.9, 10], W: () => ({ city: 'night', cctvMode: 'cam', cctv: 0.5 }),
  A: (s, u, f) => [JL({ expr: 'awe', turn: 0, blink: 0 }, 'lab', 8.3, -5.8, { tint: '#d8f0e0' }), WEB({ messy: true, expr: 'awe', blink: 0 }, 9.7, -5.9, { tint: '#d8f0e0' })] });
sh(358.84, 'lab', 'labNight', [[8.0, 1.55, -3.8], [9.7, 1.5, -5.9], 36, [8.1, 1.55, -4.0], [9.7, 1.5, -5.9], 34], { d: [9.7, 1.55, -5.9, 12], W: () => ({ city: 'night', cctvMode: 'cam', cctv: 0 }),
  A: (s, u, f) => [WEB({ messy: true, expr: tk(s, [[358.84, 360.6], [361.73, 362.8]], 'determined'), turn: -0.5, look: -1, L: s > 361.7 ? 'wave' : 'reach', R: 'hang', blink: bl(f, 17) }, 9.7, -5.9), JL({ expr: 'worried', turn: 0.6, look: 1 }, 'lab', 8.3, -5.8, { order: 3 })] });
sh(363.1, 'void', 'void', [[0, 2.2, 10], [0, 1.5, -20], 46, [0, 2.0, 7], [0, 1.4, -20], 44], { tr: 'flash', d: [0, 1.5, -20, 3], W: () => ({ voidCrowd: true }), cam: (s) => ({ dip: 0, tint: 0 }) });
sh(368.45, 'lab', 'labNight', [[9.0, 1.9, -4.3], [9.0, 2.2, -7.8], 46, [9.0, 1.9, -4.6], [9.0, 2.2, -7.8], 44], { tr: 'flash', d: [9, 2.4, -7.8, 3], W: (s) => ({ city: 'night', cctvMode: 'cal', cctv: q(ramp(s, 369.5, 373.3) * 0.45, 2) }),
  A: (s, u, f) => [WEB({ messy: true, expr: tk(s, [[368.45, 369.63], [370, 371.16], [371.56, 373]], 'determined'), turn: 0.6, look: 1, R: 'point', L: 'hang' }, 10.3, -6.2)] });
sh(373.39, 'lab', 'labNight', [[9.6, 2.4, -6.6], [9.65, 2.4, -7.8], 40, [9.62, 2.4, -6.8], [9.65, 2.4, -7.8], 36], { d: [9.6, 2.4, -7.8, 3], W: (s) => ({ city: 'night', cctvMode: 'cal', cctv: q(0.45 + ramp(s, 373.4, 376) * 0.55, 2) }), shake: [[375.9, 0.008]] });
sh(377.64, 'lab', 'labNight', [[8.9, 1.55, -4.4], [8.3, 1.55, -5.8], 32, [8.88, 1.55, -4.6], [8.3, 1.55, -5.8], 30], { d: [8.3, 1.55, -5.8, 14], W: () => ({ city: 'night', cctvMode: 'cal', cctv: 1 }),
  A: (s, u, f) => [JL({ expr: tk(s, [[377.64, 379.0]], 'worried'), turn: 0.5, look: 1, L: 'chin', R: 'hang', blink: bl(f, 3) }, 'lab', 8.3, -5.8)] });
sh(380.15, 'lab', 'labNight', [[8.6, 1.55, -4.5], [9.7, 1.55, -5.9], 34, [8.65, 1.55, -4.7], [9.7, 1.55, -5.9], 32], { d: [9.7, 1.55, -5.9, 13], W: () => ({ city: 'night', cctvMode: 'cal', cctv: 1 }),
  A: (s, u, f) => [WEB({ messy: true, expr: tk(s, [[380.15, 381.13]], 'determined'), turn: -0.5, look: -1, L: 'reach', R: 'hang', blink: bl(f, 17) }, 9.7, -5.9)] });
sh(381.36, 'shop', 'shop', [[-1.2, 1.5, -1.6], [-2.8, 1.25, -3.9], 46, [-1.4, 1.5, -1.9], [-2.8, 1.25, -3.9], 44], { tr: 'dip', d: [-2.8, 1.3, -3.9, 4], W: () => ({ ...shopNight, clock: '3:14' }), cam: (s) => ({ tint: 0.7 * Math.sin(Math.PI * ramp(s, 381.4, 382.8)) }) });
sh(382.59, 'shop', 'cold', [[-2.65, 1.55, -6.0], [-2.9, 1.45, -7.2], 34, [-2.7, 1.52, -6.2], [-2.9, 1.45, -7.2], 32], { tr: 'dip', d: [-2.9, 1.5, -7.2, 13], W: () => ({ ...shopNight }),
  A: (s, u, f) => [J({ expr: 'sleep', legs: 'sit', L: 'belly', R: 'belly', headTilt: 14 }, 'shop', -2.9, -7.2, { y: -0.05 })], X: (s) => [fx('z3' + q((s * 0.5) % 1, 1), zzz(q((s * 0.5) % 1, 1)), 'shop', -2.6, 1.0, -7.1, 0.5)] });
sh(384.45, 'lab', 'labNight', [[8.2, 1.6, -4.0], [9.7, 1.5, -5.9], 38, [8.25, 1.6, -4.15], [9.7, 1.5, -5.9], 36], { tr: 'dip', d: [9.7, 1.5, -5.9, 11], W: () => ({ city: 'night' }),
  A: (s, u, f) => [WEB({ messy: true, expr: 'sad', turn: 0.2, look: 0.3, headTilt: -8, L: 'hang', R: 'hang', blink: bl(f, 17) }, 9.7, -5.9)] });
sh(386.11, 'lab', 'labNight', [[8.9, 1.62, -4.7], [9.7, 1.6, -5.9], 28, [8.92, 1.62, -4.85], [9.7, 1.6, -5.9], 26], { d: [9.7, 1.6, -5.9, 15], W: () => ({ city: 'night' }),
  A: (s, u, f) => [WEB({ messy: true, expr: tk(s, [[386.11, 388.17]], 'stern'), turn: -0.5, look: -1, blink: bl(f, 17) }, 9.7, -5.9)] });
sh(388.63, 'lab', 'labNight', [[8.9, 1.55, -4.4], [8.3, 1.55, -5.8], 30, [8.88, 1.55, -4.55], [8.3, 1.55, -5.8], 28], { d: [8.3, 1.55, -5.8, 14], W: () => ({ city: 'night' }),
  A: (s, u, f) => [JL({ expr: 'scared', sweat: true, turn: 0.5, look: 1, L: 'hang', R: 'hang', blink: 0 }, 'lab', 8.3, -5.8)] });
const planShot = (t, mode, extra = {}) => sh(t, 'lab', 'labNight', [[9.0, 1.9, -4.6], [9.0, 2.3, -7.8], 46, [9.0, 1.95, -4.9], [9.0, 2.35, -7.8], 44], { tr: extra.tr || 'move', d: [9, 2.4, -7.8, 3],
  W: (s) => ({ city: 'night', cctvMode: mode, cctv: q(ramp(s, t, t + 2.4), 2) }),
  A: (s, u, f) => [JL({ expr: extra.jexpr || 'goofy', turn: 0.8, look: 1, blink: bl(f, 3) }, 'lab', 7.6, -5.6), WEB({ messy: true, expr: tk(s, extra.talk || [], 'determined'), turn: 0.6, look: 1, R: 'point', L: 'reach', holdL: 'clip' }, 10.4, -6.0)] });
planShot(391.5, 'plan1', { tr: 'dip', talk: [[391.5, 394.1]], jexpr: 'goofy' });
planShot(394.61, 'plan1', { talk: [[394.61, 396.58]], jexpr: 'shock' });
planShot(397.05, 'plan2', { talk: [[397.05, 399.3]], jexpr: 'scared' });
sh(399.63, 'lab', 'labNight', [[8.3, 1.4, -3.4], [9.7, 1.3, -5.9], 40, [8.4, 1.4, -3.6], [9.7, 1.3, -5.9], 38], { d: [9.7, 1.4, -5.9, 11],
  W: () => ({ city: 'night', rope: { set: 'lab', pts: [[10.05, 1.25, -5.75], [10.3, 0.7, -5.6], [10.0, 0.08, -5.2], [9.2, 0.04, -5.4], [9.4, 0.04, -6.2], [10.2, 0.04, -6.0]], r: 0.03 } }),
  A: (s, u, f) => [WEB({ messy: true, expr: tk(s, [[399.63, 403.2]], 'determined'), turn: -0.3, R: { x: 470, y: 380 }, holdR: 'ropeH', L: 'hang' }, 9.7, -5.9)] });
sh(403.45, 'void', 'voidPlan', [[6, 4, 8], [-2, 1, -14], 46, [5, 3.8, 6], [-2, 1, -14], 44], { tr: 'flash', d: [0, 1, -10, 2],
  W: (s) => ({ vDoor: { pos: [0, 0, 0], ry: 0, open: 0.0 }, rope: { set: 'void', pts: [[0, 1.0, 0.3], [0.5, 0.3, -3], [-0.5, 0.25, -8], [0.4, 0.3, -14], [-1, 0.3, -22], [0, 0.3, -40]], r: 0.04 }, queue: Math.floor(lerp(0, 18, ramp(s, 405.7, 409.8))), queuePath: (i) => [OFF.void + Math.sin(i * 1.3) * 0.6, 0, -40 + i * 2.0] }),
  A: (s, u, f) => [JL({ expr: 'determined', R: 'up', holdR: 'ropeH', ...wk(s, 1.2) }, 'void', 0.3, lerp(-6, -3, ramp(s, 403.5, 410)), { tint: '#cfe0ff' })] });
sh(410.36, 'lab', 'labNight', [[8.9, 1.55, -4.4], [8.3, 1.55, -5.8], 30, [8.88, 1.55, -4.55], [8.3, 1.55, -5.8], 28], { tr: 'flash', d: [8.3, 1.55, -5.8, 14], W: () => ({ city: 'night' }),
  A: (s, u, f) => [JL({ expr: tk(s, [[410.36, 411.6]], 'worried'), turn: 0.5, look: 1, L: 'hang', R: 'hang', blink: bl(f, 3) }, 'lab', 8.3, -5.8)] });
sh(412.11, 'lab', 'labNight', [[8.3, 1.6, -4.0], [9.7, 1.55, -5.9], 34, [8.35, 1.6, -4.2], [9.7, 1.55, -5.9], 32], { d: [9.7, 1.55, -5.9, 13], W: () => ({ city: 'night' }),
  A: (s, u, f) => [WEB({ messy: true, expr: s < 412.6 ? 'stern' : 'sad', turn: lerp(-0.5, 0.8, sp(s, 412.2, 412.8)), look: lerp(-1, 1, sp(s, 412.2, 412.8)), headTilt: -8 * sp(s, 412.2, 412.8), blink: bl(f, 17) }, 9.7, -5.9)] });
sh(413.35, 'lab', 'labNight', [[8.6, 1.6, -4.4], [9.7, 1.55, -5.9], 30, [8.75, 1.6, -4.7], [9.7, 1.55, -5.9], 26], { d: [9.7, 1.55, -5.9, 15], W: () => ({ city: 'night' }),
  A: (s, u, f) => [WEB({ messy: true, expr: tk(s, [[413.35, 415.54]], 'sad'), turn: 0.8, look: 1, headTilt: -8, blink: bl(f, 17) }, 9.7, -5.9)] });
sh(416.02, 'home', 'memory', [[0.4, 1.3, 0.4], [0, 0.9, -2.4], 40, [0.3, 1.25, 0.1], [0, 0.9, -2.4], 38], { tr: 'dip', d: [0, 0.9, -2.4, 8] });
sh(418.19, 'shop', 'memory', [[1.9, 1.5, 2.6], [1.6, 1.4, 0.4], 38, [1.85, 1.5, 2.4], [1.6, 1.4, 0.4], 36], { tr: 'dip', d: [1.6, 1.5, 0.45, 10], W: () => ({ ...shopNight }),
  A: (s, u, f) => [ch(C.MURAT, { expr: 'laugh', R: { x: 470, y: 330 }, holdR: 'chips', L: 'up', bob: q(Math.abs(Math.sin(s * 7)) * 0.01, 3) }, 'shop', 1.6, 0.45)] });
sh(419.39, 'shop', 'memory', [[1.4, 1.6, -0.6], [0.4, 1.45, -2.4], 38, [1.3, 1.6, -0.8], [0.4, 1.45, -2.4], 36], { tr: 'dip', d: [0.8, 1.5, -2.2, 10], W: () => ({ ...shopNight }),
  A: (s, u, f) => [ch(C.ALI, { expr: 'sly', turn: -0.3, L: { x: 80, y: 400 + Math.sin(s * 9) * 30 }, holdL: 'knife', R: 'thumb', blink: bl(f, 5) }, 'shop', 0.85, -2.2)] });
sh(421.4, 'lab', 'labNight', [[8.95, 1.6, -4.5], [8.3, 1.55, -5.8], 32, [8.9, 1.6, -4.7], [8.3, 1.55, -5.8], 29], { tr: 'dip', d: [8.3, 1.55, -5.8, 14], W: () => ({ city: 'night' }),
  A: (s, u, f) => [JL({ expr: tk(s, [[422.85, 423.4], [423.64, 424.26]], 'determined'), turn: 0.4, look: 1, L: 'hang', R: s > 423.6 ? 'thumb' : 'hang', headTilt: s > 422.8 && s < 423.3 ? 6 : 0, blink: bl(f, 3) }, 'lab', 8.3, -5.8)] });

// ================= TAG 100 =================
const T100 = { night: true, tanks: true, crowd: 'candles', cars: false, bus: false, crowdBob: 0.005 };
const ROPE_SHOP = (jx, jz) => ({ set: 'shop', pts: [[-2.18, 1.1, -3.62], [-1.6, 0.06, -3.0], [jx - 0.6, 0.06, jz - 0.4], [jx - 0.15, 0.8, jz - 0.05], [jx, 1.02, jz + 0.02]], r: 0.035 });
sh(424.97, 'shop', 'candles', [[-14, 8, 24], [2, 1, 7], 50, [-12, 6.5, 22], [2, 1, 7], 48], { tr: 'dip', d: [2, 1, 8, 1], W: () => ({ ...T100, clock: '3:09', heli: { pos: [-4, 0, 13.5], ry: 0.4 } }) });
sh(428.33, 'shop', 'shop', [[1.6, 1.6, 1.8], [-2.0, 1.3, -3.4], 46, [1.3, 1.6, 1.5], [-2.0, 1.3, -3.4], 44], { tr: 'dip', d: [-1.2, 1.5, -2.6, 7], W: () => ({ ...T100, clock: '3:09', rope: ROPE_SHOP(-1.2, -2.6) }),
  A: (s, u, f) => [JR({ expr: 'worried', turn: -0.3, look: -0.7, blink: bl(f, 3) }, 'shop', -1.2, -2.6)] });
sh(430.24, 'shop', 'shop', [[-0.7, 2.25, -2.3], [-0.7, 2.6, -3.9], 32, [-0.7, 2.3, -2.6], [-0.7, 2.6, -3.9], 28], { d: [-0.7, 2.6, -3.9, 6], W: () => ({ ...T100, clock: '3:10' }) });
sh(431.95, 'shop', 'candles', [[-14, 0.5, 8.0], [-9, 1.6, 12], 46, [-13.6, 0.5, 8.4], [-9, 1.6, 12], 44], { tr: 'dip', d: [-9, 1.5, 12, 3], W: () => ({ ...T100 }) });
sh(433.51, 'shop', 'candles', [[-6, 3.2, 20], [-4, 1.0, 10], 48, [6, 3.0, 20], [4, 1.0, 10], 48], { d: [0, 1, 12, 2], W: () => ({ ...T100 }) });
sh(436.8, 'shop', 'candles', [[0.6, 1.5, 6.0], [0.5, 1.45, 8.0], 34, [0.6, 1.5, 6.2], [0.5, 1.45, 8.0], 32], { d: [0.5, 1.5, 8.0, 13], W: () => ({ ...T100 }),
  A: (s, u, f) => [ch(C.MAMA, { expr: 'worried', R: { x: 380, y: 540 }, holdR: 'candle', L: { x: 260, y: 560 }, blink: bl(f, 14) }, 'shop', 0.5, 8.0)] });
sh(438.77, 'shop', 'shop', [[-0.4, 1.2, -1.2], [-1.2, 1.05, -2.6], 34, [-0.5, 1.15, -1.45], [-1.2, 1.05, -2.6], 30], { tr: 'dip', d: [-1.2, 1.1, -2.6, 12], W: () => ({ ...T100, clock: '3:11', rope: ROPE_SHOP(-1.2, -2.6) }),
  A: (s, u, f) => [JR({ expr: 'worried', look: -0.3, L: 'hang', R: 'belly', blink: bl(f, 3) }, 'shop', -1.2, -2.6)] });
sh(442.15, 'shop', 'shop', [[-1.0, 1.2, -1.6], [-1.6, 0.6, -2.8], 40, [-1.6, 1.3, -2.4], [-2.2, 1.1, -3.62], 36], { d: [-2.0, 1, -3.4, 9], W: () => ({ ...T100, clock: '3:11', rope: ROPE_SHOP(-1.2, -2.6) }),
  A: (s, u, f) => [JR({ expr: 'worried', look: -0.3, L: 'hang', R: 'belly', blink: bl(f, 3) }, 'shop', -1.2, -2.6)] });
sh(444.46, 'shop', 'shop', [[0.4, 1.5, -0.6], [-1.1, 1.2, -2.6], 40, [0.3, 1.5, -0.8], [-1.1, 1.2, -2.6], 38], { d: [-1.0, 1.4, -2.5, 9], W: () => ({ ...T100, clock: '3:12', rope: ROPE_SHOP(-1.2, -2.6) }), shake: [[445.4, 0.006], [446.1, 0.006], [446.8, 0.006]],
  A: (s, u, f) => [JR({ expr: 'neutral', L: 'up', R: 'up', blink: bl(f, 3), tilt: [445.4, 446.1, 446.8].some((t) => s > t && s < t + 0.2) ? 3 : 0 }, 'shop', -1.2, -2.6), WEB({ expr: 'stern', turn: -0.4, look: -1, legs: 'crouch', L: { x: 60, y: 560 }, R: { x: 60, y: 600 } }, -0.25, -2.35, { order: 3 })] });
SH[SH.length - 1].A = ((s, u, f) => [JR({ expr: 'neutral', L: 'up', R: 'up', blink: bl(f, 3), tilt: [445.4, 446.1, 446.8].some((t) => s > t && s < t + 0.2) ? 3 : 0 }, 'shop', -1.2, -2.6), ch(C.WEBER, { expr: 'stern', turn: -0.4, look: -1, legs: 'crouch', L: { x: 60, y: 560 }, R: { x: 60, y: 600 } }, 'shop', -0.25, -2.35, { order: 3 })]);
sh(447.43, 'shop', 'shop', [[-0.9, 1.55, -1.4], [-0.2, 1.55, -2.3], 32, [-0.85, 1.55, -1.55], [-0.2, 1.55, -2.3], 30], { d: [-0.2, 1.55, -2.3, 14], W: () => ({ ...T100, clock: '3:12', rope: ROPE_SHOP(-1.2, -2.6) }),
  A: (s, u, f) => [ch(C.WEBER, { expr: tk(s, [[447.43, 449.65]], 'determined'), turn: -0.4, look: -1, L: 'point', R: 'hang', blink: bl(f, 17) }, 'shop', -0.2, -2.3)] });
sh(450.18, 'shop', 'shop', [[-0.7, 2.5, -3.1], [-0.7, 2.6, -3.9], 30, [-0.7, 2.55, -3.3], [-0.7, 2.6, -3.9], 26], { tr: 'dip', d: [-0.7, 2.6, -3.9, 9], W: () => ({ ...T100, clock: '3:13' }), shake: [[450.2, 0.006]] });
sh(451.83, 'shop', 'shop', [[-0.95, 1.58, -1.5], [-1.2, 1.55, -2.6], 32, [-1.05, 1.57, -1.9], [-1.2, 1.55, -2.6], 26], { d: [-1.2, 1.55, -2.6, 15], W: () => ({ ...T100, clock: '3:13', rope: ROPE_SHOP(-1.2, -2.6) }),
  cam: (s) => { const b = (s * 1.6) % 1; return { fovAdd: b < 0.15 ? -1.5 : 0 }; },
  A: (s, u, f) => [JR({ expr: 'scared', sweat: true, L: 'hang', R: 'belly', blink: 0 }, 'shop', -1.2, -2.6)],
  X: (s) => { const b = (s * 1.6) % 1; return [fx('ht' + (b < 0.15 ? 1 : 0), heart(b < 0.15 ? 1.15 : 0.9), 'shop', -0.75, 0.95, -2.5, 0.22)]; } });
sh(455.56, 'shop', 'shop', [[-0.7, 2.5, -3.1], [-0.7, 2.6, -3.9], 26, [-0.7, 2.55, -3.4], [-0.7, 2.6, -3.9], 22], { d: [-0.7, 2.6, -3.9, 9], W: (s) => ({ ...T100, clock: s < 455.9 ? '3:13' : '3:14' }), shake: [[455.9, 0.012]] });
sh(456.82, 'shop', 'shop', [[1.6, 1.7, 1.8], [-1.6, 1.3, -2.8], 48, [1.4, 1.7, 1.6], [-1.6, 1.3, -2.8], 46], { tr: 'green', d: [-1.2, 1.5, -2.6, 4], W: () => ({ ...T100, clock: '3:14', rope: ROPE_SHOP(-1.2, -2.6) }),
  cam: (s) => ({ tint: sp(s, 456.82, 457.4), flash: sp(s, 457.4, 458.0) * 0.95, flashCol: '#c8ffd8' }), A: (s, u, f) => [JR({ expr: 'shock', L: 'up', R: 'up', blink: 0 }, 'shop', -1.2, -2.6)] });
const VR = (jz, extra = []) => ({ set: 'void', pts: [[0.2, 1.02, jz + 0.05], [0.4, 0.06, jz + 1], [-0.3, 0.06, jz + 6], [0.5, 0.06, jz + 14], [0, 0.06, jz + 40], ...extra], r: 0.035 });
sh(458.01, 'void', 'void', [[0, 1.6, 9], [0, 1.2, 0], 50, [0, 1.6, 7], [0, 1.2, 0], 48], { tr: 'flash', d: [0, 1.3, 0, 3], cam: (s) => ({ flash: (1 - sp(s, 458.0, 458.6)) * 0.8 }), W: () => ({ rope: VR(0) }),
  A: (s, u, f) => [JR({ expr: s < 459.4 ? 'shock' : 'scared', look: Math.sin(s * 1.4), turn: Math.sin(s * 0.9) * 0.6, blink: bl(f, 3) }, 'void', 0, 0)] });
sh(462.08, 'void', 'void', [[0, 3, 12], [0, 1, 0], 44, [0, 16, 30], [0, 0, 0], 50], { d: [0, 1, 0, 1], W: () => ({ rope: VR(0) }),
  A: (s, u, f) => [JR({ expr: 'scared', look: Math.sin(s * 1.2), blink: bl(f, 3) }, 'void', 0, 0)] });
sh(466.98, 'void', 'void', [[0.6, 1.58, 1.3], [0, 1.55, 0], 32, [0.55, 1.58, 1.1], [0, 1.55, 0], 30], { tr: 'dip', d: [0, 1.55, 0, 14], W: () => ({ rope: VR(0) }),
  A: (s, u, f) => [JR({ expr: 'scared', look: Math.sin(s * 2), blink: bl(f, 3) }, 'void', 0, 0)] });
const jWalkZ = (s) => lerp(0, -16, ramp(s, 468.3, 480.0));
sh(468.33, 'void', 'void', [[2.5, 1.2, 3.5], [0, 1.2, -1], 44, [2.0, 1.2, 1.0], [0, 1.2, -3], 44], { d: [0, 1.3, -1, 6], W: (s) => ({ rope: VR(jWalkZ(s)) }),
  A: (s, u, f) => [JR({ expr: 'determined', ...wk(s, 1.3), turn: -0.5, blink: bl(f, 3) }, 'void', 0, jWalkZ(s))] });
sh(469.6, 'void', 'void', [[0.6, 0.35, 6], [0, 0.6, -6], 40, [0.6, 0.35, 1], [0, 0.8, -12], 40], { d: [0, 1, -6, 3], W: (s) => ({ rope: VR(jWalkZ(s)) }),
  A: (s, u, f) => [JR({ expr: 'determined', ...wk(s, 1.3), blink: bl(f, 3) }, 'void', 0, jWalkZ(s))], X: (s) => [fx('rg' + q((s * 0.8) % 1, 1), sparkle(q((s * 0.8) % 1, 1), '#e8f0ff'), 'void', 0.3, 0, jWalkZ(s) + 3, 0.5)] });
sh(473.98, 'void', 'void', [[1.2, 1.5, jWalkZ(474) - 2.6], [0, 1.55, jWalkZ(474)], 34, [1.1, 1.5, jWalkZ(476.7) - 2.2], [0, 1.55, jWalkZ(476.7)], 32], { tr: 'dip', d: [0, 1.55, jWalkZ(475), 13], W: (s) => ({ rope: VR(jWalkZ(s)) }),
  A: (s, u, f) => [JR({ expr: tk(s, [[474.66, 475.3], [475.89, 476.51]], 'yell'), L: { x: 230, y: 300 }, R: { x: 370, y: 300 }, blink: bl(f, 3) }, 'void', 0, jWalkZ(s))],
  X: (s) => s > 474.6 ? [fx('ec' + q((s * 0.9) % 1, 1), rings(q((s * 0.9) % 1, 1)), 'void', 0, 0.6, jWalkZ(s) - 0.2, 1.2)] : [] });
sh(476.76, 'void', 'void', [[0.8, 1.55, jWalkZ(476.8) + 1.4], [0, 1.55, jWalkZ(477)], 32, [0.7, 1.55, jWalkZ(480) + 1.2], [0, 1.55, jWalkZ(480)], 30], { d: [0, 1.55, jWalkZ(478), 13], W: (s) => ({ rope: VR(jWalkZ(s)) }),
  A: (s, u, f) => [JR({ expr: s < 478.1 ? 'worried' : s < 479.2 ? 'awe' : 'scared', look: s < 478.1 ? 0 : Math.sin(s * 3), turn: s > 479.2 ? 0.5 : 0, L: 'hang', R: 'hang', blink: bl(f, 3) }, 'void', 0, jWalkZ(s))],
  X: (s) => s > 478.1 && s < 479.2 ? [fx('e2' + q((s - 478.1) % 1, 1), rings(q((s - 478.1) % 1, 1)), 'void', -3, 1.0, jWalkZ(s) - 6, 1.6)] : [] });
const JZ = -16;
sh(480.04, 'void', 'void', [[0.9, 1.7, JZ + 3.2], [0, 1.4, JZ - 20], 48, [1.2, 2.6, JZ + 4.6], [0, 1.0, JZ - 30], 50], { d: [0, 1, JZ - 20, 2], W: (s) => ({ rope: VR(JZ), voidCrowd: true }), cam: (s) => ({ flash: (1 - sp(s, 480.0, 480.6)) * 0.5 }),
  A: (s, u, f) => [JR({ expr: 'awe', blink: 0 }, 'void', 0, JZ)] });
sh(483.64, 'void', 'void', [[0, 22, JZ + 30], [0, 0, JZ - 40], 50, [0, 28, JZ + 20], [0, 0, JZ - 60], 52], { d: [0, 0, JZ - 30, 0], W: () => ({ rope: VR(JZ), voidCrowd: true }), A: (s, u, f) => [JR({ expr: 'awe', blink: 0 }, 'void', 0, JZ)] });
const VC = JZ - 6;
sh(485.74, 'void', 'void', [[-1.6, 1.4, VC + 2.4], [-2.2, 1.5, VC], 34, [-1.65, 1.4, VC + 2.2], [-2.2, 1.5, VC], 32], { tr: 'dip', d: [-2.2, 1.5, VC, 13], W: () => ({ voidCrowd: true }),
  A: (s, u, f) => [ch(C.BUSDRIVER, { expr: 'shock', look: Math.sin(s * 2), turn: 0.3, L: 'wheel', R: 'wheel', blink: bl(f, 31) }, 'void', -2.2, VC)] });
sh(487.13, 'void', 'void', [[1.6, 1.3, VC + 2.0], [1.9, 1.3, VC], 34, [1.6, 0.4, VC + 1.6], [1.9, 0.2, VC], 34], { d: [1.9, 1.0, VC, 12], W: () => ({ voidCrowd: true }),
  A: (s, u, f) => [ch(C.OPA, { expr: 'worried', look: Math.sin(s * 1.6), turn: -0.3, L: 'chin', R: 'hang', blink: bl(f, 33) }, 'void', 1.9, VC)] });
sh(488.66, 'void', 'void', [[-0.3, 1.5, VC - 0.2], [-0.8, 1.5, VC - 2.4], 32, [-0.35, 1.5, VC - 0.4], [-0.8, 1.5, VC - 2.4], 30], { d: [-0.8, 1.5, VC - 2.4, 13], W: () => ({ voidCrowd: true }),
  A: (s, u, f) => [ch(C.ROBE, { expr: 'goofy', look: Math.sin(s * 3) * 0.6, turn: 0.2, R: { x: 380, y: 280 + Math.sin(s * 18) * 18 }, L: 'hip', bob: q(Math.abs(Math.sin(s * 9)) * 0.006, 3), blink: bl(f, 35) }, 'void', -0.8, VC - 2.4)] });
const LOST = (s, f) => [[0, -2.0, VC - 1.0], [1, 1.2, VC - 1.6], [2, -0.4, VC - 3.0], [3, 2.6, VC - 3.4], [4, -2.8, VC - 3.6], [6, 0.6, VC + 0.2]].map(([i, x, z], k) => ch(C.man(i + 2), { expr: ['worried', 'shock', 'scared', 'sad', 'worried', 'awe'][k], turn: Math.sin(s * 0.7 + k) * 0.7, look: Math.sin(s * 1.1 + k * 2), L: k % 2 ? 'chin' : 'hang', R: k % 3 ? 'hang' : 'up', blink: bl(f, i + 60) }, 'void', x, z));
sh(491.73, 'void', 'void', [[0, 1.8, VC + 4.2], [0, 1.2, VC - 2], 46, [0.4, 1.8, VC + 3.6], [0, 1.2, VC - 2], 44], { d: [0, 1.4, VC - 1.5, 7], W: () => ({ voidCrowd: true }), A: (s, u, f) => LOST(s, f) });
sh(494.55, 'void', 'void', [[-1.2, 1.6, VC + 1.8], [0.6, 1.4, VC - 1.6], 40, [-1.0, 1.6, VC + 1.4], [0.6, 1.4, VC - 1.6], 38], { d: [1.2, 1.5, VC - 1.6, 10], W: () => ({ voidCrowd: true }), A: (s, u, f) => LOST(s, f).map((a, k) => k === 1 ? ch(C.man(3), { expr: s > 496 ? 'goofy' : 'worried', L: s > 496 ? 'up' : { x: 180, y: 400 }, R: s > 496 ? 'up' : 'hang', turn: -0.2, blink: bl(f, 61) }, 'void', 1.2, VC - 1.6) : a) });
// Murat / Ali / Papa in the crowd (void-local, around VC2)
const VC2 = JZ - 3.0, MUR = [0.0, VC2], ALI_ = [1.5, VC2 - 0.5], PAP = [-1.2, VC2 - 3.2];
const trio = (s, f, ex = {}) => [ch(C.MURAT, { expr: ex.m || 'shock', R: { x: 470, y: 330 }, holdR: 'chips', L: 'hang', turn: 0.2, blink: bl(f, 8), ...(ex.mo || {}) }, 'void', MUR[0], MUR[1]), ch(C.ALI, { expr: ex.a || 'worried', R: { x: 520, y: 360 }, holdR: 'knife', L: 'belly', turn: -0.3, blink: bl(f, 5), ...(ex.ao || {}) }, 'void', ALI_[0], ALI_[1]), ch(C.PAPA, { expr: ex.p || 'neutral', turn: 0.2, L: 'hang', R: ex.pr || 'hang', blink: bl(f, 11), ...(ex.po || {}) }, 'void', PAP[0], PAP[1])];
sh(498.58, 'void', 'void', [[0.2, 1.7, VC2 + 6], [0, 1.4, VC2], 44, [0.1, 1.6, VC2 + 3.4], [0, 1.45, VC2], 38], { tr: 'dip', d: [MUR[0], 1.5, MUR[1], 9], W: () => ({ voidCrowd: true }), A: (s, u, f) => trio(s, f) });
sh(501.29, 'void', 'void', [[0.3, 1.55, VC2 + 1.5], [0, 1.55, VC2], 32, [0.25, 1.55, VC2 + 1.3], [0, 1.55, VC2], 30], { d: [0, 1.55, VC2, 14], W: () => ({ voidCrowd: true }),
  A: (s, u, f) => trio(s, f, { m: tk(s, [[501.29, 501.98], [502.41, 503.46], [503.77, 505.5]], s < 503.6 ? 'shock' : 'goofy'), mo: { L: s > 503.7 ? 'up' : 'hang' } }) });
sh(505.98, 'void', 'void', [[2.0, 1.55, VC2 + 1.0], [1.5, 1.55, VC2 - 0.5], 34, [1.95, 1.55, VC2 + 0.8], [1.5, 1.55, VC2 - 0.5], 32], { d: [1.5, 1.55, VC2 - 0.5, 13], W: () => ({ voidCrowd: true }), A: (s, u, f) => trio(s, f, { a: 'awe', ao: { R: 'up' } }) });
sh(508.96, 'void', 'void', [[0.9, 1.6, VC2 + 1.6], [0.2, 1.5, VC2 - 1.0], 34, [0.4, 1.6, VC2 + 0.9], [-1.2, 1.55, PAP[1]], 32], { d: [0, 0, 0, 0],
  dofF: (s) => lerp(0, 1, sp(s, 509.5, 511.0)), dofA: [0.0, 1.5, VC2], dofB: [PAP[0], 1.55, PAP[1]], W: () => ({ voidCrowd: true }),
  A: (s, u, f) => trio(s, f, { p: s > 512.9 ? 'smile' : 'neutral', pr: s > 510.6 && s < 512.2 ? { x: 380, y: 250 } : 'hang' }) });
sh(514.41, 'void', 'void', [[0.25, 1.58, JZ + 1.2], [0, 1.55, JZ], 30, [0.22, 1.57, JZ + 1.0], [0, 1.55, JZ], 28], { tr: 'dip', d: [0, 1.55, JZ, 15], W: () => ({ voidCrowd: true, rope: VR(JZ) }),
  A: (s, u, f) => [JR({ expr: 'cry', blink: 0, L: 'hang', R: 'hang' }, 'void', 0, JZ)] });
sh(515.83, 'void', 'void', [[-1.0, 0.9, JZ + 2.6], [0, 1.6, JZ], 44, [-1.1, 0.8, JZ + 2.3], [0, 1.7, JZ], 42], { d: [0, 1.6, JZ, 11],
  W: (s) => ({ voidCrowd: true, rope: { set: 'void', pts: s > 516.6 ? [[0.62, 2.05, JZ + 0.05], [0.7, 1.2, JZ + 0.3], [0.4, 0.06, JZ + 1.2], [-0.3, 0.06, JZ + 6], [0, 0.06, JZ + 40]] : VR(JZ).pts, r: 0.035 } }),
  A: (s, u, f) => [JR({ expr: s < 517 ? 'cry' : 'determined', R: s > 516.6 ? 'up' : 'hang', holdR: s > 516.6 ? 'ropeH' : null, L: 'hang' }, 'void', 0, JZ)] });
sh(518.52, 'void', 'void', [[0.5, 0.7, JZ + 1.8], [0, 1.8, JZ], 40, [0.45, 0.65, JZ + 1.6], [0, 1.85, JZ], 38], { d: [0, 1.6, JZ, 13],
  W: () => ({ voidCrowd: true, rope: { set: 'void', pts: [[0.62, 2.05, JZ + 0.05], [0.7, 1.2, JZ + 0.3], [0.4, 0.06, JZ + 1.2], [-0.3, 0.06, JZ + 6], [0, 0.06, JZ + 40]], r: 0.035 } }),
  A: (s, u, f) => [JR({ expr: tk(s, [[518.52, 519.24], [519.38, 520.84]], 'determined'), R: 'up', holdR: 'ropeH', L: s > 519.4 ? 'point' : 'hang', blink: bl(f, 3) }, 'void', 0, JZ)] });
// the march home: Jonas leads (walking +z) to the door, rope in the left hand along the ground
const marchZ = (s) => lerp(JZ, 6, ramp(s, 521.2, 551.0));
const MR = (z) => ({ set: 'void', pts: [[0.0, 1.0, z + 0.2], [0.2, 0.9, z - 1.5], [0.1, 0.9, z - 4], [0.0, 0.9, z - 8], [0, 0.6, z - 30], [0, 0.4, z - 80]], r: 0.035 });
const followers = (s, f, z, slow = 1) => [ch(C.MURAT, { expr: 'determined', ...wk(s, 1.2 * slow), L: 'forward', R: { x: 470, y: 330 }, holdR: 'chips', turn: 0.2 }, 'void', 0.2, z - 1.6), ch(C.ALI, { expr: 'determined', ...wk(s + 0.2, 1.2 * slow), L: 'forward', R: { x: 520, y: 360 }, holdR: 'knife' }, 'void', 0.0, z - 4.0), ch(C.PAPA, { expr: 'smile', ...wk(s + 0.4, 1.2 * slow), L: 'forward', R: 'forward', blink: bl(f, 11) }, 'void', 0.0, z - 1.6 - 1.1 + 0)];
const marchW = (s, n = 40) => ({ voidCrowd: true, rope: MR(marchZ(s)), queue: n, queuePath: (i) => [OFF.void + Math.sin(i * 0.9) * 0.4, 0, marchZ(s) - 6 - i * 3.0] });
sh(521.23, 'void', 'void', [[2.8, 1.6, JZ + 5], [0, 1.3, JZ - 2], 46, [2.6, 1.6, JZ + 6.6], [0, 1.3, JZ], 44], { tr: 'dip', d: [0, 1.4, marchZ(522), 6], W: (s) => marchW(s, Math.floor(lerp(0, 40, ramp(s, 521.3, 524.2)))),
  A: (s, u, f) => [JR({ expr: 'determined', ...wk(s, 1.2), L: { x: 140, y: 600 }, R: 'hang', blink: bl(f, 3) }, 'void', 0, marchZ(s)), ...followers(s, f, marchZ(s))] });
SH[SH.length - 1].A = (s, u, f) => [JR({ expr: 'determined', ...wk(s, 1.2), L: { x: 140, y: 600 }, R: 'hang', blink: bl(f, 3) }, 'void', 0, marchZ(s)), ch(C.MURAT, { expr: 'determined', ...wk(s, 1.2), L: 'forward', R: { x: 470, y: 330 }, holdR: 'chips', turn: 0.2 }, 'void', 0.35, marchZ(s) - 1.6), ch(C.PAPA, { expr: 'smile', ...wk(s + 0.4, 1.2), L: 'forward', R: 'forward', blink: bl(f, 11) }, 'void', -0.3, marchZ(s) - 3.0), ch(C.ALI, { expr: 'determined', ...wk(s + 0.2, 1.2), L: 'forward', R: { x: 520, y: 360 }, holdR: 'knife' }, 'void', 0.3, marchZ(s) - 4.4)];
const marchA = (s, u, f, je = 'determined', slow = 1, extra = {}) => [JR({ expr: je, ...wk(s, 1.2 * slow), L: { x: 140, y: 600 }, R: 'hang', blink: bl(f, 3), ...extra }, 'void', 0, marchZ(s)), ch(C.MURAT, { expr: 'determined', ...wk(s, 1.2 * slow), L: 'forward', R: { x: 470, y: 330 }, holdR: 'chips', turn: 0.2 }, 'void', 0.35, marchZ(s) - 1.6), ch(C.PAPA, { expr: 'smile', ...wk(s + 0.4, 1.2 * slow), L: 'forward', R: 'forward', blink: bl(f, 11) }, 'void', -0.3, marchZ(s) - 3.0), ch(C.ALI, { expr: 'determined', ...wk(s + 0.2, 1.2 * slow), L: 'forward', R: { x: 520, y: 360 }, holdR: 'knife' }, 'void', 0.3, marchZ(s) - 4.4)];
SH[SH.length - 1].A = (s, u, f) => marchA(s, u, f);
sh(524.3, 'void', 'void', [[14, 6, -6], [0, 0.5, -28], 48, [22, 26, -2], [0, 0, -60], 54], { d: [0, 0, -40, 0], W: (s) => marchW(s), A: (s, u, f) => marchA(s, u, f) });
sh(530.53, 'void', 'void', [[1.4, 1.2, marchZ(530.5) + 2.6], [0, 1.3, marchZ(530.5)], 40, [1.3, 1.2, marchZ(533.4) + 2.4], [0, 1.3, marchZ(533.4)], 38], { tr: 'dip', d: [0, 1.4, marchZ(532), 10], W: (s) => marchW(s),
  A: (s, u, f) => marchA(s, u, f, 'pain', 0.6, { tilt: 8 }) });
sh(533.38, 'void', 'void', [[0.35, 1.45, marchZ(533.4) + 1.1], [0, 1.4, marchZ(533.4)], 30, [0.3, 1.45, marchZ(535.4) + 1.0], [0, 1.4, marchZ(535.4)], 28], { d: [0, 1.45, marchZ(534.4), 14], W: (s) => marchW(s),
  A: (s, u, f) => marchA(s, u, f, 'pain', 0.5, { tilt: 8, sweat: true }), X: (s) => [fx('hf' + q((s * 1.3) % 1, 1), heatFx(q((s * 1.3) % 1, 1)), 'void', -0.35, 0.3, marchZ(s) + 0.1, 0.4)] });
sh(535.43, 'void', 'void', [[-0.9, 1.3, marchZ(535.4) + 1.6], [0, 1.3, marchZ(535.4)], 34, [-0.85, 1.3, marchZ(537.4) + 1.5], [0, 1.3, marchZ(537.4)], 32], { d: [0, 1.4, marchZ(536.4), 13], W: (s) => marchW(s), shake: [[536.2, 0.006]],
  A: (s, u, f) => marchA(s, u, f, 'sob', 0.3, { tilt: 4, L: { x: 140, y: 640 } }) });
sh(537.43, 'void', 'void', [[1.6, 1.6, marchZ(537.4) - 5.4], [0, 1.4, marchZ(537.4) - 1.6], 38, [1.5, 1.6, marchZ(541.6) - 5.2], [0, 1.4, marchZ(541.6) - 1.6], 36], { d: [-0.3, 1.5, marchZ(539) - 3.0, 10], W: (s) => marchW(s),
  A: (s, u, f) => marchA(s, u, f, 'sad', 0.3).map((a, k) => k === 2 ? ch(C.PAPA, { expr: s > 539 ? 'smile' : 'neutral', ...wk(s + 0.4, 0.4), L: 'forward', R: 'forward', turn: -0.2, blink: bl(f, 11) }, 'void', -0.3, marchZ(s) - 3.0) : a) });
sh(541.61, 'void', 'void', [[-0.9, 1.6, marchZ(541.6) - 1.6], [-0.3, 1.55, marchZ(541.6) - 3.0], 32, [-0.85, 1.6, marchZ(543.8) - 1.7], [-0.3, 1.55, marchZ(543.8) - 3.0], 30], { d: [-0.3, 1.55, marchZ(542.6) - 3.0, 14], W: (s) => marchW(s),
  A: (s, u, f) => [ch(C.PAPA, { expr: tk(s, [[541.61, 543.33]], 'smile'), ...wk(s, 0.5), L: 'forward', R: 'forward', turn: 0.3, look: 0.6, blink: bl(f, 11) }, 'void', -0.3, marchZ(s) - 3.0)] });
sh(543.77, 'void', 'void', [[1.0, 0.9, marchZ(543.8) + 3.0], [0, 1.4, marchZ(543.8) - 1], 44, [0.9, 0.9, marchZ(546) + 2.8], [0, 1.4, marchZ(546) - 1], 42], { d: [0, 1.5, marchZ(545), 9], W: (s) => marchW(s), shake: [[543.8, 0.012], [545.1, 0.012]],
  A: (s, u, f) => marchA(s, u, f, 'determined', 1.4, { tilt: 10 }) });
const DOORZ = 7.5;
sh(546.04, 'void', 'void', [[0.8, 1.6, marchZ(546) - 2.6], [0, 1.4, DOORZ], 44, [0.7, 1.6, marchZ(548.5) - 2.6], [0, 1.4, DOORZ], 40], { tr: 'dip', d: [0, 1.2, DOORZ, 4],
  W: (s) => ({ ...marchW(s), vDoor: { pos: [0, lerp(-2.4, 0, easeOut(ramp(s, 546.1, 547.6))), DOORZ], ry: Math.PI, open: 0 } }), A: (s, u, f) => marchA(s, u, f, 'awe', 1) });
sh(548.57, 'void', 'void', [[1.6, 1.6, DOORZ - 2.6], [0, 1.3, DOORZ], 40, [1.2, 1.5, DOORZ - 2.0], [0, 1.3, DOORZ], 36], { d: [0, 1.3, DOORZ, 9],
  W: (s) => ({ ...marchW(s), vDoor: { pos: [0, 0, DOORZ], ry: Math.PI, open: -1.6 * sp(s, 550.4, 551.3) } }), cam: (s) => ({ flash: sp(s, 550.9, 551.6) }),
  A: (s, u, f) => [JR({ expr: s < 550.3 ? 'awe' : 'determined', L: { x: 140, y: 600 }, R: s > 549.8 ? 'reach' : 'hang', blink: bl(f, 3) }, 'void', 0, DOORZ - 0.9)] });

// ================= DANACH =================
const DN = { night: true, clock: '3:15' };
sh(551.62, 'shop', 'shop', [[-0.4, 1.4, -0.8], [-2.8, 1.3, -3.9], 46, [-0.6, 1.4, -1.0], [-2.8, 1.3, -3.9], 44], { tr: 'flash', d: [-2.8, 1.3, -3.9, 5], W: (s) => ({ ...DN, door: -1.6 * easeOut(ramp(s, 551.7, 552.1)) }), shake: [[551.8, 0.02]],
  cam: (s) => ({ flash: (1 - sp(s, 551.62, 552.2)) * 0.9 }), X: (s) => s < 552.8 ? [fx('db' + q((s - 551.62) / 1.2, 1), bang(q((s - 551.62) / 1.2, 1)), 'shop', -2.8, 0.2, -3.6, 1.4)] : [] });
const stumble = (s) => sp(s, 553.6, 554.9);
sh(553.51, 'shop', 'shop', [[-2.4, 1.5, 0.9], [-2.2, 1.0, -3.0], 50, [-2.4, 1.5, 0.7], [-2.2, 1.0, -3.0], 48], { d: [-2.0, 1.2, -2.8, 7], W: () => ({ ...DN, door: -1.6 }),
  A: (s, u, f) => [JR({ expr: s < 555 ? 'shock' : 'laugh', legs: s > 554.9 ? 'crouch' : 'walk', step: q((s * 2) % 1, 2), L: 'forward', R: 'forward', tilt: lerp(18, 0, stumble(s)) }, 'shop', lerp(-2.8, -1.8, stumble(s)), lerp(-4.4, -2.6, stumble(s)))] });
const outA = (s, f) => { const o = [JR({ expr: 'laugh', legs: 'crouch', L: 'up', R: 'up', blink: bl(f, 3) }, 'shop', -1.8, -2.2, { order: 4 })];
  const em = (spec, t0, x, z, ex) => { if (s < t0) return; const t = sp(s, t0, t0 + 0.8); o.push(ch(spec, { ...ex, ...(t < 1 ? wk(s, 1.6) : {}) }, 'shop', lerp(-2.8, x, t), lerp(-4.6, z, t))); };
  em(C.MURAT, 557.4, -0.4, -2.2, { expr: 'goofy', R: { x: 470, y: 330 }, holdR: 'chips', L: 'wave' }); em(C.ALI, 559.0, 0.6, -2.6, { expr: 'happy', R: { x: 520, y: 360 }, holdR: 'knife', L: 'belly' }); em(C.PAPA, 559.6, -3.2, -2.4, { expr: 'smile', L: 'hang', R: 'wave', blink: bl(f, 11) });
  for (let k = 0; k < 3; k++) em(C.man(k * 3 + 10), 560 + k * 0.3, -3.6 + k * 0.7, -3.3, { expr: 'awe' }); return o; };
sh(556.91, 'shop', 'shop', [[-3.8, 1.7, 1.4], [-1.6, 1.1, -3.0], 50, [-3.6, 1.7, 1.2], [-1.6, 1.1, -3.0], 48], { d: [-1.6, 1.4, -2.6, 6], W: () => ({ ...DN, door: -1.6 }), A: (s, u, f) => outA(s, f),
  X: (s) => [fx('ld', glowFx('255,244,200', 0.8), 'shop', -2.8, 0, -4.2, 1.4, { order: 1 })] });
sh(560.49, 'space', 'space', [[0, 9, 10], [0, -6, -20], 40, [0, 8, 8], [0, -6, -20], 38], { tr: 'green', d: [0, 0, -20, 0], W: (s) => ({ tiny: (i) => sp(s, 561.4 + ((i * 11) % 25) / 25 * 1.6, 561.6 + ((i * 11) % 25) / 25 * 1.6), green: 0.25 + 0.35 * Math.abs(Math.sin(s * 5)) }),
  A: (s, u, f) => [J({ expr: 'laugh' }, 'space', 0, -20, { y: 4.0, s: 0.36, blob: false })],
  X: (s) => { const o = []; for (let k = 0; k < 8; k++) { const t = q(((s * 0.9) + k / 8) % 1, 1), a = k * 0.8; o.push(fx('gs' + k + t, sparkle(t), 'space', Math.cos(a) * 7, -6 + Math.sin(a) * 7, -12, 1.5)); } return o; } });
const RET = [[0, 6, 11.5], [1, -2, 13], [2, 9, 14.8], [3, 1.5, 9.4], [4, -6, 11], [5, 12, 9.6]];
sh(563.33, 'shop', 'morning', [[3.5, 1.6, 6.2], [3.5, 1.3, 13], 48, [3.6, 1.6, 6.6], [3.5, 1.3, 13], 46], { tr: 'green', d: [3.5, 1.4, 11.5, 3], W: () => ({ night: false, clouds: true, cam: true }),
  cam: (s) => ({ tint: 0.4 * Math.max(0, Math.sin(s * 9)) * (1 - sp(s, 565.5, 567)) }),
  A: (s, u, f) => RET.filter((_, k) => s > 563.5 + k * 0.45).map(([i, x, z], k) => ch(C.man(i + 20), { expr: s > 563.5 + k * 0.45 + 0.6 ? 'awe' : 'shock', look: Math.sin(s + k), L: 'hang', R: k % 2 ? 'chin' : 'hang', blink: bl(f, i) }, 'shop', x, z)),
  X: (s) => RET.map(([i, x, z], k) => { const t = (s - (563.5 + k * 0.45)) / 0.7; return t > 0 && t < 1 ? fx('rs' + k + q(t, 1), sparkle(q(t, 1)), 'shop', x, 0.3, z + 0.05, 1.0) : null; }).filter(Boolean) });
sh(567.31, 'shop', 'morning', [[5.0, 2.0, 13.4], [0.8, 1.7, 14.6], 40, [4.7, 2.0, 13.5], [0.8, 1.7, 14.6], 38], { tr: 'dip', d: [0.8, 1.7, 14.5, 10], W: () => ({ night: false }),
  A: (s, u, f) => s > 567.5 ? [ch(C.BUSDRIVER, { expr: s < 568.4 ? 'shock' : 'goofy', R: 'wheel', L: 'wheel', look: Math.sin(s * 2), blink: bl(f, 31) }, 'shop', 0.8, 14.5, { y: 0.45, s: 0.95, blob: false })] : [],
  X: (s) => s > 567.5 && s < 568.3 ? [fx('bs' + q((s - 567.5) / 0.8, 1), sparkle(q((s - 567.5) / 0.8, 1)), 'shop', 1.0, 0.9, 14.0, 1)] : [] });
sh(569.87, 'home', 'shopDay', [[-1.6, 1.55, 2.4], [-3.5, 1.3, 2.4], 44, [-1.8, 1.55, 2.4], [-3.5, 1.3, 2.4], 42], { tr: 'dip', d: [-3.3, 1.4, 2.4, 9],
  A: (s, u, f) => s > 570.1 ? [ch(C.OPA, { expr: s < 571 ? 'shock' : 'happy', turn: 0.5, look: 1, R: { x: 470, y: 450 }, holdR: 'mug', L: 'hang', blink: bl(f, 33) }, 'home', -3.3, 2.4)] : [],
  X: (s) => s > 570.1 && s < 570.9 ? [fx('os' + q((s - 570.1) / 0.8, 1), sparkle(q((s - 570.1) / 0.8, 1)), 'home', -3.3, 0.3, 2.45, 1)] : [] });
sh(572.6, 'shop', 'morning', [[-7.0, 1.55, 15.0], [-8.0, 1.5, 17.4], 34, [-7.1, 1.55, 15.2], [-8.0, 1.5, 17.4], 32], { tr: 'dip', d: [-8, 1.5, 17.4, 13], W: () => ({ night: false, bus: false }),
  A: (s, u, f) => s > 572.8 ? [ch(C.ROBE, { expr: s < 576 ? 'neutral' : 'goofy', R: { x: 380, y: 280 + Math.sin(s * 18) * 18 }, L: 'hip', look: s > 576 ? 1 : 0, turn: s > 576 ? 0.4 : 0, bob: q(Math.abs(Math.sin(s * 9)) * 0.006, 3), blink: bl(f, 35) }, 'shop', -8.0, 17.4)] : [],
  X: (s) => s > 572.8 && s < 573.6 ? [fx('ts' + q((s - 572.8) / 0.8, 1), sparkle(q((s - 572.8) / 0.8, 1)), 'shop', -8, 0.3, 17.45, 1)] : [] });
const CEL = { night: false, crowd: 'cheer', crowdBob: 0.08, cars: false, bus: false, clouds: true };
sh(577.4, 'shop', 'morning', [[-10, 7, 24], [2, 1, 9], 48, [-8, 5.5, 22], [2, 1, 9], 46], { tr: 'dip', d: [2, 1, 10, 1], W: () => ({ ...CEL }),
  X: (s) => [0, 1, 2].map((k) => fx('cc' + k + q((s * 0.5 + k / 3) % 1, 2), confetti(q((s * 0.5 + k / 3) % 1, 2), k), 'shop', -6 + k * 6, 0.5, 11, 4)) });
sh(580.44, 'shop', 'morning', [[2, 1.4, 6.4], [2, 1.3, 12], 48, [2, 1.4, 6.4], [6, 1.3, 12], 48], { d: [3, 1.4, 11, 4], W: () => ({ ...CEL, crowd: null }),
  A: (s, u, f) => [0, 1, 2, 3].map((k) => ch(C.woman(k + 12), { expr: 'laugh', L: 'up', R: 'up', ...wk(s + k * 0.2, 2.4) }, 'shop', -6 + k * 1.6 + (s - 580.44) * 5.5, 10.4 + k * 0.9)) });
sh(582.05, 'shop', 'morning', [[6, 1.4, 6.4], [6, 1.3, 12], 48, [6, 1.4, 6.4], [2, 1.3, 12], 48], { d: [4, 1.4, 11, 4], W: () => ({ ...CEL, crowd: null }),
  A: (s, u, f) => [0, 1, 2, 3].map((k) => ch(C.man(k + 30), { expr: 'laugh', L: 'up', R: 'up', ...wk(s + k * 0.2, 2.4) }, 'shop', 14 - k * 1.6 - (s - 582.05) * 5.5, 10.6 + k * 0.9)) });
sh(583.36, 'shop', 'morning', [[3, 1.5, 7.2], [3, 1.3, 11.5], 46, [3.3, 1.5, 7.6], [3, 1.3, 11.5], 44], { d: [3, 1.4, 11, 5], W: () => ({ ...CEL, crowdBob: 0.03 }),
  A: (s, u, f) => [[0, 1.0, 10.6], [1, 3.4, 11.2], [2, 5.8, 10.4]].flatMap(([k, x, z]) => [ch(C.woman(k + 12), { expr: 'cry', L: 'reach', R: 'reach', turn: 0.5 }, 'shop', x - 0.25, z + 0.1, { order: 3 }), ch(C.man(k + 30), { expr: 'laugh', L: 'reach', R: 'reach', turn: -0.5 }, 'shop', x + 0.25, z)]) });
sh(585.3, 'shop', 'morning', [[0.9, 1.55, 6.0], [0.6, 1.5, 8.2], 34, [0.85, 1.55, 6.2], [0.6, 1.5, 8.2], 32], { d: [0.6, 1.55, 8.2, 13], W: () => ({ ...CEL, crowd: null }), shake: [[586.0, 0.008]],
  A: (s, u, f) => [ch(s < 587.8 ? C.PAPA : { ...C.PAPA, glasses: false }, { expr: s < 587.8 ? 'shock' : 'goofy', L: 'reach', R: 'reach', turn: 0.4, tilt: q(Math.sin(s * 12) * 2, 1) }, 'shop', 0.9, 8.3), ch(C.MAMA, { expr: 'cry', L: 'reach', R: 'reach', turn: -0.4 }, 'shop', 0.35, 8.1, { order: 3 })],
  X: (s) => s > 587.8 ? [fx('gf' + q(Math.min(1, (s - 587.8) / 0.6), 1), glassesFx(Math.min(1, (s - 587.8) / 0.6) * 3), 'shop', 1.0, lerp(1.25, 0.0, Math.min(1, (s - 587.8) / 0.6) ** 2), 8.4, 0.2)] : [] });
sh(588.96, 'shop', 'morning', [[2.6, 1.5, 3.6], [2.6, 1.5, 12], 46, [2.6, 1.5, 3.9], [2.6, 1.5, 12], 42], { tr: 'dip', d: [2.6, 1.5, 9, 6], W: () => ({ ...CEL, crowdBob: 0, shopDoor: 1.4 }),
  A: (s, u, f) => [ch(C.MAMA, { expr: 'smile', turn: -0.2 }, 'shop', 1.6, 8.0), ch(C.PAPA, { expr: 'smile', glasses: true }, 'shop', 2.4, 8.2), ch(C.MURAT, { expr: 'happy', R: { x: 470, y: 330 }, holdR: 'chips' }, 'shop', 3.6, 7.6), ch(C.ALI, { expr: 'happy', R: { x: 520, y: 360 }, holdR: 'knife', L: 'belly' }, 'shop', 4.6, 8.0)] });
sh(591.47, 'shop', 'morning', [[3.2, 1.6, 7.0], [2.6, 1.55, 4.6], 34, [3.1, 1.6, 6.7], [2.6, 1.55, 4.6], 32], { d: [2.6, 1.55, 4.6, 12], W: () => ({ ...CEL, crowdBob: 0, shopDoor: 1.4 }),
  A: (s, u, f) => [JR({ expr: s < 592.6 ? 'worried' : 'awe', look: Math.sin(s), blink: bl(f, 3) }, 'shop', 2.6, 4.6)] });
sh(593.28, 'shop', 'morning', [[2.6, 1.0, 3.2], [2.6, 2.4, 14], 54, [2.6, 1.2, 3.8], [2.6, 2.2, 14], 50], { d: [2.6, 1.5, 4.6, 3], W: () => ({ ...CEL, shopDoor: 1.4 }),
  A: (s, u, f) => [JR({ expr: s < 594.6 ? 'laugh' : 'happy', L: s > 594 ? 'chin' : 'wave', R: 'hang', blink: bl(f, 3) }, 'shop', 2.6, 4.6)],
  X: (s) => [0, 1, 2].map((k) => fx('ca' + k + q((s * 0.5 + k / 3) % 1, 2), confetti(q((s * 0.5 + k / 3) % 1, 2), k + 3), 'shop', -2 + k * 4, 0.5, 9, 3.5)) });
sh(596.95, 'shop', 'day', [[3.6, 1.4, 4.6], [0, 1.6, 9.5], 46, [3.3, 1.4, 4.9], [0, 1.6, 9.5], 44], { tr: 'dip', d: [0, 1.8, 9.5, 8], W: () => ({ ...CEL, crowdBob: 0.04, stage: true }),
  A: (s, u, f) => [(s < 598.8 ? JR : JM)({ expr: s < 598.8 ? 'worried' : 'laugh', turn: 0.4, L: 'hang', R: 'hang', blink: bl(f, 3) }, 'shop', -0.5, 9.3, { y: 0.5 }), ch(PRES, { expr: 'smile', turn: -0.4, L: s < 598.8 ? { x: 80, y: 360 } : 'hang', holdL: s < 598.8 ? 'medalH' : null, R: s > 598.8 ? 'thumb' : 'hang' }, 'shop', 0.6, 9.4, { y: 0.5 })],
  X: (s) => s > 598.8 && s < 599.6 ? [fx('md' + q((s - 598.8) / 0.8, 1), flashPop(q((s - 598.8) / 0.8, 1)), 'shop', -0.5, 1.6, 9.4, 0.6)] : [] });
sh(600.74, 'shop', 'day', [[-15.6, 1.6, 9.2], [-16.6, 1.5, 6.8], 42, [-15.8, 1.6, 8.8], [-16.6, 1.55, 6.8], 40], { tr: 'dip', d: [-16.6, 1.5, 6.8, 6], W: () => ({ night: false, toy: 2, merch: true, posters: true }) });
sh(604.12, 'shop', 'day', [[-16.35, 1.6, 7.6], [-16.6, 1.55, 6.8], 32, [-16.45, 1.6, 7.45], [-16.6, 1.6, 6.8], 26], { d: [-16.6, 1.55, 6.8, 12], W: () => ({ night: false, toy: 2, merch: true, posters: true }) });
const FIN = { night: true, clock: '2:30', heroSign: true, coil: true };
sh(605.89, 'shop', 'shop', [[-1.6, 2.0, 3.6], [0.5, 1.2, -1.6], 50, [-1.4, 1.95, 3.2], [0.5, 1.2, -1.6], 48], { tr: 'dip', d: [0.9, 1.4, -1.6, 4], W: () => ({ ...FIN }),
  A: (s, u, f) => [JM({ expr: 'happy', legs: 'sit', L: 'belly', R: 'hang', blink: bl(f, 3) }, 'shop', 0.9, -1.6)] });
sh(609.51, 'shop', 'shop', [[-0.7, 2.25, -2.3], [-0.7, 2.6, -3.9], 34, [-0.7, 2.3, -2.6], [-0.7, 2.6, -3.9], 30], { d: [-0.7, 2.6, -3.9, 6], W: () => ({ ...FIN }) });
sh(610.58, 'shop', 'shop', [[-1.6, 1.6, -0.8], [-2.8, 2.4, -3.9], 44, [-2.0, 1.9, -1.6], [-2.8, 2.9, -3.9], 40], { d: [-2.8, 2.9, -3.9, 5], W: () => ({ ...FIN }),
  A: (s, u, f) => [ch(C.ALI, { expr: s > 612.7 ? 'happy' : 'smug', turn: -0.5, look: -1, L: 'point', R: 'belly', blink: bl(f, 5) }, 'shop', -1.2, -3.0)] });
sh(614.18, 'shop', 'shop', [[-1.4, 1.6, 0.8], [2.0, 1.3, 2.6], 46, [-1.0, 1.6, 0.6], [1.6, 1.2, 0.3], 44], { d: [1.8, 1.4, 1.6, 6], W: (s) => ({ ...FIN, shopDoor: 1.3 * (1 - sp(s, 615.6, 616.4)) * sp(s, 614.2, 614.6) }),
  A: (s, u, f) => { const t = sp(s, 614.3, 616.4); const sit = s > 616.6; return [ch(C.MURAT, { expr: 'happy', R: { x: 470, y: 330 }, holdR: 'chips', L: sit ? 'belly' : 'wave', ...(t < 1 ? wk(s, 1.3) : {}), legs: sit ? 'sit' : (t < 1 ? 'walk' : 'stand'), blink: bl(f, 8) }, 'shop', lerp(2.6, 1.6, t), lerp(4.6, 0.45, t))]; } });
sh(617.77, 'shop', 'shop', [[2.6, 1.5, 1.8], [1.6, 1.4, 0.45], 34, [2.5, 1.5, 1.65], [1.6, 1.4, 0.45], 32], { d: [1.6, 1.45, 0.45, 13], W: () => ({ ...FIN }),
  A: (s, u, f) => [ch(C.MURAT, { expr: tk(s, [[617.77, 618.11], [618.66, 619.87]], 'goofy'), legs: 'sit', turn: -0.4, look: -1, R: { x: 470, y: 330 }, holdR: 'chips', L: s > 618.6 ? 'up' : 'belly', blink: bl(f, 8) }, 'shop', 1.6, 0.45)] });
sh(620.38, 'shop', 'shop', [[1.25, 1.55, -0.2], [0.9, 1.5, -1.6], 30, [1.22, 1.55, -0.35], [0.9, 1.5, -1.6], 28], { d: [0.9, 1.5, -1.6, 14], W: () => ({ ...FIN }),
  A: (s, u, f) => [JM({ expr: 'sly', turn: 0.4, look: 1, legs: 'sit', L: 'belly', R: 'hang', blink: bl(f, 3) }, 'shop', 0.9, -1.6)] });
sh(621.56, 'shop', 'shop', [[0.0, 1.55, 0.9], [1.2, 1.4, -0.6], 40, [0.1, 1.55, 0.7], [1.2, 1.4, -0.6], 38], { d: [0.9, 1.5, -1.6, 9], W: () => ({ ...FIN }),
  A: (s, u, f) => [JM({ expr: tk(s, [[621.56, 622.82], [623.02, 626.22]], 'smug'), turn: 0.4, look: 1, legs: 'sit', L: 'belly', R: s > 624.5 ? 'point' : 'hang', blink: bl(f, 3) }, 'shop', 0.9, -1.6), ch(C.MURAT, { expr: s < 624.6 ? 'goofy' : 'worried', legs: 'sit', turn: -0.4, look: -1, R: { x: 470, y: 330 }, holdR: 'chips', L: 'belly', blink: bl(f, 8) }, 'shop', 1.6, 0.45, { order: 3 })],
  X: (s) => s > 624.6 ? [fx('m2' + q(Math.min(1, (s - 624.6) / 0.6), 1), money, 'shop', 1.25, 1.9 + Math.min(1, (s - 624.6) / 0.6) * 0.2, -0.4, 0.35)] : [] });
sh(626.91, 'shop', 'shop', [[2.4, 1.45, 1.6], [1.6, 1.4, 0.45], 36, [2.3, 1.45, 1.5], [1.6, 1.4, 0.45], 34], { d: [1.6, 1.45, 0.45, 13], W: () => ({ ...FIN }),
  A: (s, u, f) => [ch(C.MURAT, { expr: 'laugh', legs: 'sit', turn: -0.3, R: { x: 470, y: 330 }, holdR: 'chips', L: 'belly', bob: q(Math.abs(Math.sin(s * 9)) * 0.01, 3) }, 'shop', 1.6, 0.45)] });
sh(628.92, 'shop', 'shop', [[-0.6, 1.5, 2.2], [3.6, 2.2, -2.4], 46, [-0.3, 1.5, 1.8], [3.8, 2.3, -2.5], 42], { d: [3.6, 2.3, -2.4, 4], W: () => ({ ...FIN, tv: 'news' }),
  A: (s, u, f) => [JM({ expr: 'neutral', turn: 0.8, look: 1, legs: 'sit', L: 'belly', R: 'hang' }, 'shop', 0.9, -1.6), ch(C.MURAT, { expr: 'neutral', legs: 'sit', turn: 0.8, look: 1, R: { x: 470, y: 330 }, holdR: 'chips', L: 'belly' }, 'shop', 1.6, 0.45)] });
sh(631.44, 'shop', 'shop', [[2.9, 2.3, -1.43], [4.0, 2.45, -2.6], 40, [3.15, 2.36, -1.7], [4.0, 2.45, -2.6], 34], { tr: 'dip', d: [4, 2.45, -2.6, 6], W: () => ({ ...FIN, tv: 'kanguru' }) });
sh(638.54, 'shop', 'shop', [[1.3, 1.5, 1.8], [1.2, 1.45, -0.4], 40, [1.3, 1.5, 1.6], [1.2, 1.45, -0.4], 38], { tr: 'dip', d: [1.2, 1.5, -0.6, 10], W: () => ({ ...FIN, tv: 'kanguru' }),
  A: (s, u, f) => [JM({ expr: s < 640 ? 'neutral' : 'tired', turn: s < 639.95 ? 0.8 : 0.4, look: 1, legs: 'sit', L: 'belly', R: 'hang', blink: bl(f, 3) }, 'shop', 0.9, -1.6), ch(C.MURAT, { expr: 'shock', legs: 'sit', turn: -0.4, look: -1, R: { x: 470, y: 330 }, holdR: 'chips', L: 'belly', blink: 0 }, 'shop', 1.6, 0.45, { order: 3 })] });
sh(641.52, 'shop', 'shop', [[0.2, 1.6, 0.2], [-1.4, 1.5, -3.4], 44, [0.0, 1.6, 0.0], [-1.4, 1.5, -3.4], 42], { d: [-1.2, 1.5, -3.2, 8], W: (s) => ({ ...FIN, coil: s < 643.4 }),
  A: (s, u, f) => { const t = sp(s, 641.9, 643.2); return [JM({ expr: s < 642.3 ? 'tired' : 'determined', turn: -0.5, look: -1, ...(t > 0 && t < 1 ? wk(s) : {}), L: s > 643 ? 'reach' : 'hang', R: s > 643.4 ? { x: 470, y: 480 } : 'hang', holdR: s > 643.4 ? 'ropeH' : null, blink: s < 642.2 ? 1 : bl(f, 3) }, 'shop', lerp(0.9, -1.0, t), lerp(-1.6, -3.1, t))]; } });
sh(644.65, 'shop', 'shop', [[0.4, 1.55, -1.2], [-0.4, 1.5, -2.8], 38, [0.3, 1.55, -1.35], [-0.4, 1.5, -2.8], 36], { d: [-1.0, 1.55, -3.1, 11], W: () => ({ ...FIN, coil: false }),
  A: (s, u, f) => [JM({ expr: tk(s, [[644.65, 645.08], [645.45, 646.87]], 'determined'), turn: 0.4, look: 1, R: { x: 470, y: 480 }, holdR: 'ropeH', L: 'hang', blink: bl(f, 3) }, 'shop', -1.0, -3.1), ch(C.ALI, { expr: s < 646.2 ? 'neutral' : 'shock', turn: -0.5, look: -1, R: { x: 520, y: 360 }, holdR: 'knife', L: 'belly', blink: 0 }, 'shop', 0.6, -2.4)] });

// ------------------------------------------------------------------ resolve shot frames
SH.sort((a, b) => a.t - b.t);
export const SHOTS = SH.map((s, i) => ({ ...s, id: i, a: Math.round(s.t * 30), b: (i + 1 < SH.length ? Math.round(SH[i + 1].t * 30) : TOTAL) - 1, light: s.L }));
export const shotAt = (f) => { let lo = 0, hi = SHOTS.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (SHOTS[m].a <= f) lo = m; else hi = m - 1; } return SHOTS[lo]; };
export const lightFor = (S, f) => LIGHTS[S.light] || LIGHTS.day;
const loc = (set, p) => [p[0] + OFF[set], p[1], p[2]];
const rawCam = (S, f) => {
  const s = f / 30, u = clamp((f - S.a) / Math.max(1, S.b - S.a));
  if (S.K) { const K = S.K; let k = 0; while (k < K.length - 1 && s > K[k + 1][0]) k++; const A = K[k], B = K[Math.min(k + 1, K.length - 1)]; const t = B === A ? 0 : easeOut((s - A[0]) / Math.max(0.01, B[0] - A[0]));
    return { pos: loc(S.set, lerp3(A[1], B[1], t)), look: loc(S.set, lerp3(A[2], B[2], t)), fov: lerp(A[3], B[3], t), roll: 0 }; }
  const c = S.c, p0 = c[0], l0 = c[1], f0 = c[2], p1 = c[3] || p0, l1 = c[4] || l0, f1 = c[5] || f0; const t = lerp(u, smooth(u), 0.35);
  return { pos: loc(S.set, lerp3(p0, p1, t)), look: loc(S.set, lerp3(l0, l1, t)), fov: lerp(f0, f1, t), roll: lerp(c[6] || 0, c[7] || 0, t) };
};
export const camAt = (f) => {
  const S = shotAt(f), s = f / 30; let c = rawCam(S, f);
  const prev = SHOTS[S.id - 1]; const tr = S.tr || (prev && prev.set === S.set ? 'move' : 'dip');
  const d = f - S.a;
  if (tr === 'move' && prev && prev.set === S.set && d < 14) { const pc = rawCam(prev, prev.b); const t = easeOut(d / 14); c = { pos: lerp3(pc.pos, c.pos, t), look: lerp3(pc.look, c.look, t), fov: lerp(pc.fov, c.fov, t), roll: lerp(pc.roll, c.roll, t) }; }
  c.flash = 0; c.dip = 0; c.tint = 0; c.flashCol = '#ffffff';
  // transitions into this shot and out of it (next shot's type decides the tail)
  const next = SHOTS[S.id + 1]; const trN = next ? (next.tr || (next.set === S.set ? 'move' : 'dip')) : null; const tail = S.b - f;
  if (tr === 'dip' && d < 6) c.dip = 1 - d / 6; if (trN === 'dip' && tail < 5) c.dip = Math.max(c.dip, 1 - (tail + 1) / 6);
  if (tr === 'flash' && d < 6) c.flash = 1 - d / 6;
  if (tr === 'green' && d < 8) { c.flash = (1 - d / 8) * 0.9; c.flashCol = '#9dffb8'; }
  if (trN === 'flash' && tail < 3) c.flash = Math.max(c.flash, 1 - tail / 3);
  if (trN === 'green' && tail < 4) { c.flash = Math.max(c.flash, (1 - tail / 4) * 0.9); c.flashCol = '#9dffb8'; }
  if (S.cam) { const o = S.cam(s); if (o.tint !== undefined) c.tint = o.tint; if (o.flash) { c.flash = Math.max(c.flash, o.flash); if (o.flashCol) c.flashCol = o.flashCol; } if (o.dip) c.dip = Math.max(c.dip, o.dip); if (o.fovAdd) c.fov += o.fovAdd; }
  if (f >= TOTAL - 8) c.dip = Math.max(c.dip, (f - (TOTAL - 8)) / 8);
  c.pos = [...c.pos]; c.look = [...c.look];
  for (const [t, a] of S.shake || []) { const k = f - Math.round(t * 30); if (k >= 0 && k < 9) { const sg = (k % 2 ? -1 : 1) * a * (1 - k / 9) * 30; c.look[1] += sg * 0.15; c.look[0] += sg * 0.1; c.roll += sg * 3; } }
  if (S.A && !S.tight) { const dir = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]], d = Math.hypot(...dir) || 1, H = 1.2;
    let need = 2 * Math.atan(H / 2 / d) * 180 / Math.PI; if (need > 52) { const d2 = H / 2 / Math.tan(26 * Math.PI / 180); c.pos = c.look.map((v, i) => v - dir[i] / d * d2); need = 52; }
    if (c.fov < need) c.fov = need; }
  c.shadowAt = [...c.look];
  return c;
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C_ = camAt(f), s = f / 30;
  if (S.dofF) { const t = S.dofF(s); const p = lerp3(loc(S.set, S.dofA), loc(S.set, S.dofB), t); return { focus: dist(C_.pos, p), cinf: 12 }; }
  const d = S.d || [0, 1.5, 0, 6]; return { focus: Math.max(0.3, dist(C_.pos, loc(S.set, d))), cinf: d[3] * 0.75 };
};
export const worldAt = (f) => { const S = shotAt(f), s = f / 30, u = clamp((f - S.a) / Math.max(1, S.b - S.a)); const W = S.W ? S.W(s, u, f) : {}; return { set: S.set, ...W }; };
export const actorsAt = (f, T) => { TT = T; const S = shotAt(f), s = f / 30, u = clamp((f - S.a) / Math.max(1, S.b - S.a)); return S.A ? S.A(s, u, f) : []; };
export const fxAt = (f, T) => { TT = T; const S = shotAt(f), s = f / 30, u = clamp((f - S.a) / Math.max(1, S.b - S.a)); return S.X ? S.X(s, u, f) : []; };
