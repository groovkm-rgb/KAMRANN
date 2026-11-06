// Shot plan for "The Lighthouse Keeper" — 21.5 s, 645 frames @ 30 fps. No voice in the file; VO is laid in later on these slots:
// 0.0-4.2 "For forty years, an old man lit a lighthouse on a coast where no ship ever passed." | 4.6-6.4 "The village called him a fool." |
// 7.0-10.2 "When he died, they climbed the tower and opened his logbook." | 10.6-12.2 "Every night had the same line:" |
// 12.6-14.4 "Kept them away again." | 15.0-19.4 "Below the cliff, the reef had swallowed two hundred ships before he came." | 19.4-21.5 silent close
// Cuts sit in the VO gaps: 4.40 s (f132), 6.70 s (f201), 10.40 s (f312), 15.00 s (f450, on the music hit).
import { M, camFromKeys, blinkAt, q, clamp, lerp, lerp3, ramp, idle } from './motion.js';
import * as G from './geo.js';
const { GAL, LAMP, CLIFF, VIL, QUAY, INT, STAIR_H, BOOK, CANDLE, stepPos } = G;

export const FPS = 30, TOTAL = 645;
export const SHOTS = [
  { id: 'hook', a: 0, b: 131, light: 'night', set: 'ext' },
  { id: 'fool', a: 132, b: 200, light: 'sunset', set: 'ext' },
  { id: 'climb', a: 201, b: 311, light: 'overcast', set: 'int' },
  { id: 'logbook', a: 312, b: 449, light: 'candle', set: 'int' },
  { id: 'reveal', a: 450, b: 644, light: 'night', set: 'ext' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const smooth = M.smooth;
const add3 = (a, b) => a.map((v, i) => v + b[i]);

// ---------- lights ----------
export const LIGHTS = {
  night: { az: -30, el: 30, sky: '#7d92d0', ground: '#222b4c', hemi: 1.25, sun: '#b4c6f4', sunI: 1.5, fog: '#1f2d58', fogNear: 120, fogFar: 1600,
    skyTop: '#08122e', skyHor: '#2e4580', sunDisc: '#f2f5ff', sunSize: 0.0018, stars: 1, sat: 1.06, waterDeep: '#0c1b3c', waterShal: '#27477a', glint: '#c4d4ff',
    vig: 0.3, cloud: '#43548a', cloudA: 0.75, shadowExt: 30, foam: '#a8badf', uw: '#1d6a8a' },
  sunset: { az: -28, el: 4, sky: '#b9a0d6', ground: '#5e3e3c', hemi: 1.05, sun: '#ff9d58', sunI: 2.6, fog: '#f2a777', fogNear: 120, fogFar: 1700,
    skyTop: '#5d5aa8', skyHor: '#ffb57a', sunDisc: '#fff1c8', sunSize: 0.004, sat: 1.12, gain: '#fff0e2', waterDeep: '#3d4a84', waterShal: '#d48d6c',
    glint: '#ffdca4', vig: 0.26, cloud: '#ffc2a8', shadowExt: 22, foam: '#ffe2cc' },
  overcast: { az: 70, el: 55, sky: '#d2d6dc', ground: '#6e665e', hemi: 1.75, sun: '#e2e5ea', sunI: 0.45, fog: '#8d939c', fogNear: 30, fogFar: 260,
    skyTop: '#8a929c', skyHor: '#b0b6bc', sat: 0.88, gain: '#f2f4f6', vig: 0.32, window: '#eef1f4', shadowExt: 8, waterDeep: '#2c3f52', waterShal: '#5a6f80', glint: '#cfd8e0' },
  candle: { az: 70, el: 55, sky: '#5a4660', ground: '#24160e', hemi: 0.5, sun: '#ffb060', sunI: 0.12, fog: '#140c10', fogNear: 4, fogFar: 40,
    skyTop: '#140c10', skyHor: '#140c10', sat: 0.98, gain: '#fff0dc', vig: 0.5, window: '#26325a', shadowExt: 4, waterDeep: '#000', waterShal: '#000', glint: '#000' },
  under: { az: -30, el: 60, sky: '#86e6ea', ground: '#0b3244', hemi: 1.4, sun: '#a6eeff', sunI: 0.9, fog: '#0e4660', fogNear: 3, fogFar: 90,
    skyTop: '#0e4660', skyHor: '#0e4660', sat: 1.05, vig: 0.42, inkFar: 140, shadowExt: 30, waterDeep: '#0c1b3c', waterShal: '#27477a', glint: '#c4d4ff', uw: '#2a8aa6' },
};
export const lightFor = (S, f, C) => {
  let L = { ...LIGHTS[S.light] };
  if (S.id === 'reveal' && C && C.pos[1] < 0) {
    L = { ...LIGHTS.under };
    const up = smooth(ramp(f, 596, 640)); L.fogFar = lerp(90, 160, up); L.fogNear = lerp(3, 12, up);
  }
  if (S.id === 'hook') L.shadowExt = lerp(8, 40, smooth(ramp(f, 40, 120)));
  return L;
};

// ---------- cameras ----------
const KEEP = [0.5, GAL + 0.85, 0.88];             // keeper stands on the lantern-room floor
const KEEP_FACE = add3(KEEP, [0, 1.42, 0]);
const VD = [0.797, 0, -0.605], VP = [0.605, 0, 0.797]; // village: toward the tower / sideways
const vil = (fwd, side, up = 0) => [VIL[0] + VD[0] * fwd + VP[0] * side, VIL[1] + up, VIL[2] + VD[2] * fwd + VP[2] * side];
const BK = BOOK;
// the line on the right-hand page, in world space (book is turned 0.08 rad about y)
const LINE = (() => { const lx = 0.104, ly = 0.065 * 0.3 + 0.008, lz = 0.0, c = Math.cos(0.08), s = Math.sin(0.08); return [BK[0] + lx * c + lz * s, BK[1] + ly, BK[2] - lx * s + lz * c]; })();

const CAMS = {
  hook: [
    { f: 0, pos: [2.2, KEEP_FACE[1] + 0.02, 1.55], look: [0.45, KEEP_FACE[1] - 0.1, 0.86], fov: 36 },
    { f: 36, pos: [2.4, KEEP_FACE[1] + 0.08, 1.62], look: [0.38, KEEP_FACE[1] - 0.12, 0.8], fov: 40 },
    { f: 46, pos: [2.6, KEEP_FACE[1] + 0.12, 1.75], look: [0.38, KEEP_FACE[1] - 0.18, 0.8], fov: 42 },
    { f: 64, pos: [5.2, GAL + 2.2, 4.6], look: [0.3, GAL + 1.6, 0.4], fov: 44 },
    { f: 112, pos: [44, 25, 62], look: [6, 21, 0], fov: 46, ease: 'smooth', path: [[16, 31, 22]] },
    { f: 131, pos: [45.5, 25.2, 64], look: [6, 21, 0], fov: 45.5 },
  ],
  fool: [
    { f: 132, pos: vil(-4.6, 0.0, 1.25), look: vil(30, 0.0, 4.4), fov: 56 },
    { f: 200, pos: vil(-4.1, 0.0, 1.25), look: vil(30, 0.0, 4.6), fov: 54 },
  ],
  climb: [
    { f: 290, pos: [INT[0] + 1.25, INT[1] + STAIR_H + 1.45, INT[2] - 0.95], look: add3(BK, [0, 0.04, 0]), fov: 46 },
    { f: 311, pos: [INT[0] + 0.95, INT[1] + STAIR_H + 1.35, INT[2] - 0.6], look: add3(BK, [0, 0.03, 0]), fov: 44 },
  ],
  logbook: [
    { f: 312, pos: add3(BK, [0.12, 0.2, 0.52]), look: add3(BK, [0.0, 0.1, -0.2]), fov: 44 },
    { f: 340, pos: add3(BK, [0.06, 0.4, 0.4]), look: add3(BK, [0.0, 0.02, -0.03]), fov: 42 },
    { f: 378, pos: add3(BK, [0.04, 0.42, 0.33]), look: add3(BK, [0.02, 0.0, -0.01]), fov: 40 },
    { f: 449, pos: add3(LINE, [-0.005, 0.15, 0.085]), look: LINE, fov: 34, roll: -2 },
  ],
  reveal: [
    { f: 450, pos: [6.5, GAL + 2.2, 7.5], look: [0, GAL + 1.2, 0], fov: 46 },
    { f: 482, pos: [24, CLIFF + 4, 15], look: [5, CLIFF - 4, 1], fov: 52, path: [[13, GAL - 3, 12]] },
    { f: 512, pos: [27, 5, 13.5], look: [12, -0.5, 3], fov: 52 },
    { f: 522, pos: [27.5, 0.5, 12.5], look: [32, -6, 10], fov: 54, ease: 'easeIn' },
    { f: 536, pos: [29, -3.4, 12], look: [40, -12, 8], fov: 58, ease: 'easeOut' },
    { f: 598, pos: [34, -5.5, 11.5], look: [50, -15, 4], fov: 58 },
    { f: 643, pos: [36, -7.5, 12], look: [1, 34, 0], fov: 60 },
  ],
};
const KICKS = [{ f: 450, a: 0.045 }];
// climb, part 1: camera rides up the empty stair axis and turns to keep the climbers in frame
const climbCam = (f) => {
  const g = villagerPos(f, 0), m = villagerPos(f, 1.5), y = g[1] + 2.6, ang = Math.atan2(m[2] - INT[2], m[0] - INT[0]);
  const pos = [INT[0] - Math.cos(ang) * 0.75, y, INT[2] - Math.sin(ang) * 0.75];
  return { pos, look: [m[0], m[1] + 0.7, m[2]], fov: 58, roll: 0 };
};
export const camAt = (f) => {
  const S = shotAt(f);
  let c;
  if (S.id === 'climb' && f < 290) {
    const a = climbCam(Math.min(f, 262));
    if (f <= 262) c = a;
    else { const b = CAMS.climb[0], t = smooth((f - 262) / 28), mid = [INT[0] + 1.3, INT[1] + STAIR_H - 0.6, INT[2] - 0.9];
      const u1 = Math.min(1, t * 2), u2 = Math.max(0, t * 2 - 1);
      c = { pos: t < 0.5 ? lerp3(a.pos, mid, u1) : lerp3(mid, b.pos, u2), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: 0 }; }
  } else c = camFromKeys(CAMS[S.id], f, { creep: 0.0006, kicks: KICKS });
  c.flash = f >= 521 && f < 525 ? 0.3 * (1 - (f - 521) / 4) : 0;
  if (S.id === 'reveal') c.shadowAt = c.pos[1] < 0 ? [30, -14, 2] : [6, CLIFF, 2];
  if (S.id === 'hook' && f < 40) c.shadowAt = KEEP;
  if (S.id === 'logbook') c.near = 0.01;
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  switch (S.id) {
    case 'hook': return { focus: dist(C.pos, KEEP_FACE), cinf: lerp(12, 0, smooth(ramp(f, 40, 80))) };
    case 'fool': return { focus: dist(C.pos, vil(-0.6, 0, 1.5)), cinf: 4 };
    case 'climb': return f < 260 ? { focus: dist(C.pos, villagerPos(f, 0)), cinf: 7 } : { focus: dist(C.pos, BK), cinf: lerp(7, 10, smooth(ramp(f, 260, 300))) };
    case 'logbook': return { focus: f < 378 ? dist(C.pos, BK) : dist(C.pos, LINE), cinf: 14 };
    case 'reveal': return { focus: C.pos[1] < 0 ? 16 : 18, cinf: C.pos[1] < 0 ? 2.5 : 2 };
  }
  return { focus: 10, cinf: 0 };
};

// ---------- world state ----------
// logbook: cover opens 312-326, pages fly 328-377 (one every 4 frames), stop on 378 (12.6 s)
const FLIP0 = 328, FLIP_DT = 4, FLIPS = 12;
const bookAt = (f) => {
  if (f < 312) return { cover: 0, k: 0 };
  const cover = M.easeOut(ramp(f, 313, 326));
  const n = clamp(Math.floor((f - FLIP0) / FLIP_DT), -1, FLIPS);
  const B = { cover, k: 0.06 + 0.05 * Math.max(0, n + 1), pl: 0, pr: 1 };
  if (n >= 0 && n < FLIPS) { B.flip = ((f - FLIP0) % FLIP_DT) / FLIP_DT; B.pf = n + 2; B.pl = n + 1; B.pr = n + 3; B.k = 0.06 + 0.05 * n; }
  if (f >= FLIP0 + FLIPS * FLIP_DT) { B.pl = FLIPS + 1; B.pr = FLIPS + 2; B.k = 0.06 + 0.05 * FLIPS; }
  return B;
};
const lampAt = (f) => clamp((f - 30) / 10);
export const worldAt = (f, C) => {
  const S = shotAt(f), W = { set: S.set };
  if (S.id === 'hook') {
    W.lamp = lampAt(f); W.beam = W.lamp; W.beamAng = 2.2 - Math.max(0, f - 30) * 0.034; W.glowS = 6;
    const match = f >= 8 && f < 34 ? 1 : 0;
    W.point = { i: W.lamp * 6 + match * 1.2, pos: W.lamp > 0 ? LAMP : add3(KEEP, [0.3, 1.5, 0.3]), col: '#ffbd6a', d: 9 };
  }
  if (S.id === 'fool') { W.lamp = 0; W.beam = 0; }
  if (S.id === 'climb') { W.book = { cover: 0, k: 0 }; }
  if (S.id === 'logbook') {
    W.book = bookAt(f); W.candle = 1;
    const fl = 0.9 + 0.1 * Math.sin(f * 0.9) * Math.sin(f * 0.37 + 1);
    W.point = { i: 1.5 * fl, pos: add3(CANDLE, [0, 0.25, 0]), col: '#ffb466', d: 4 };
  }
  if (S.id === 'reveal') {
    const under = C ? C.pos[1] < 0 : false;
    W.lamp = 1; W.beam = under ? 0.8 : 1; W.beamAng = 1.2 + (f - 450) * 0.034; W.under = under;
    W.glowS = under ? lerp(10, 26, smooth(ramp(f, 600, 644))) : 7; W.glowA = under ? 1 : 0.85; W.glowOnTop = under;
    W.point = { i: 4, pos: LAMP, col: '#ffbd6a', d: 9 };
  }
  return W;
};

// ---------- actors (2D cards) ----------
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
// climbing villagers: lead + three followers, ~1 step every 8 frames
const villagerPos = (f, i) => { const st = 29.5 + (f - 201) / 8 - i * 1.7; const s0 = Math.floor(st), fr = st - s0; const a = stepPos(s0, 1.55 - (i % 2) * 0.25), b = stepPos(s0 + 1, 1.55 - (i % 2) * 0.25); return lerp3(a, b, fr); };

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  switch (S.id) {
    case 'hook': {
      const lit = lampAt(f), match = f >= 8 && f < 34;
      const tint = lit > 0 ? '#ffe2b8' : match ? '#f0c8a8' : '#8e9cc8';
      const look = f < 26 ? -0.55 : f < 52 ? -0.35 : 0.0;
      const o = { seed: 6, expr: f < 44 ? 'neutral' : 'smile_closed', blink: blinkAt(f, 6), look, facing: -0.4, L: 'hang', R: match ? 'match' : 'hang', headTilt: q(idle(f, 6).headTilt, 1), bob: q(idle(f, 6).bob, 3) };
      const fl = match ? q((f - 8) % 6 / 6, 1) : -1;
      out.push({ key: 'keeper' + JSON.stringify(o) + fl, draw: (p) => { const r = T.romanFront(p, 'keeper', o); if (match) { const [hx, hy] = r.hands[1]; T.fxFlame(p, hx + 4, hy - 18, f < 11 ? 1.5 : 0.9, fl); } },
        x: KEEP[0], y: KEEP[1], z: KEEP[2], s: 0.95, tint, ground: KEEP[1] });
      break;
    }
    case 'fool': {
      const tint = '#ffdcc0', lb = (s) => q(Math.abs(Math.sin((f + s) * 0.55)) * 0.022, 3), tl = (s, a = 4) => q(a * Math.sin(f * 0.5 + s), 1);
      out.push(R(T, 'fishA', { seed: 31, L: 'belly', R: 'belly', expr: 'laugh', facing: 0.6, bob: lb(0), tilt: tl(0, 3) }, vil(-0.2, -0.95, 0), { tint, s: 0.95 }));
      out.push(R(T, 'fishB', { seed: 32, L: 'belly', R: 'point', expr: 'laugh', facing: 0.3, bob: lb(4), tilt: tl(2) }, vil(-1.6, -0.25, 0), { tint, s: 0.88 }));
      out.push(R(T, 'fishC', { seed: 33, L: 'belly', R: 'belly', expr: 'laugh', facing: -0.2, bob: lb(7), tilt: tl(3, 5) }, vil(-1.2, 0.5, 0), { tint, s: 0.98 }));
      out.push(R(T, 'fishE', { seed: 34, L: 'point', R: 'hip', expr: 'grin', facing: -0.6, bob: lb(2), blink: blinkAt(f, 34) }, vil(0.2, 1.05, 0), { tint, s: 0.97 }));
      out.push(R(T, 'fishD', { seed: 35, L: 'hang', R: 'temple', expr: 'grin', facing: 0.5, swirl: q((f * 0.35) % 6.283, 1), blink: blinkAt(f, 35) }, vil(0.7, -1.3, 0), { tint, s: 0.92 }));
      break;
    }
    case 'climb': {
      const who = ['fishA', 'fishC', 'fishB', 'fishE'];
      for (let i = 0; i < 4; i++) {
        const pos = villagerPos(f, i), ph = ((f - 201) / 16 + i * 0.37) % 1;
        out.push(R(T, who[i], { seed: 41 + i, step: q(ph, 2), expr: i === 0 ? 'nervous' : 'neutral', look: -0.3, facing: 0.3 * (i % 2 ? 1 : -1), blink: blinkAt(f, 41 + i), bob: q(Math.abs(Math.sin(ph * Math.PI * 2)) * 0.015, 3) }, pos, { s: 0.9, tint: '#e8ecf0', ground: pos[1] }));
      }
      break;
    }
    case 'logbook': {
      const tint = '#ffcf9a', late = f >= 380;
      out.push(R(T, 'fishB', { seed: 51, expr: late ? 'dazed' : 'nervous', look: 0.2, blink: blinkAt(f, 51), L: 'cheek', R: 'hang' }, add3(BK, [-0.45, -0.78, -0.85]), { tint, s: 0.9, ground: BK[1] - 0.78 }));
      out.push(R(T, 'fishA', { seed: 52, expr: late ? 'dazed' : 'neutral', look: -0.2, blink: blinkAt(f, 52) }, add3(BK, [0.42, -0.78, -0.95]), { tint, s: 0.95, ground: BK[1] - 0.78 }));
      break;
    }
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (S.id === 'hook' && f >= 30 && f < 44) { const t = q((f - 30) / 14); out.push(FX('burst' + t, (p) => T.fxBurst(p, t, '#fff0b8', 12, 60, 260), [LAMP[0], LAMP[1] - 1.0, LAMP[2]], 1.2, { fog: false, add: true })); }
  if (S.id === 'logbook') {
    const t = q((f % 20) / 20, 2);
    out.push(FX('candle' + t, (p) => T.fxFlame(p, 300, 700, 2.2, t * 6.28, false), add3(CANDLE, [0, 0.0, 0]), 0.12, { fog: false, order: 6 }));
  }
  if (S.id === 'reveal') {
    if (f >= 514 && f < 534) { const t = q((f - 514) / 20, 2); out.push(FX('splash' + t, (p) => { p.g.translate(0, 130); p.g.scale(0.75, 0.75); T.fxSplash(p, t); }, [33, -0.1, 9], 1.6)); }
    if (f >= 522) {
      const k = (f - 522) / 30;
      for (let i = 0; i < 4; i++) { const kk = q((k * (0.6 + i * 0.12) + i * 0.25) % 1, 2), cp = camAt(f).pos; out.push(FX('bub' + i + kk, (p) => T.fxBubbles(p, kk, i + 1), [cp[0] + 3 + i * 1.6, cp[1] - 2.2, cp[2] + (i - 1.5) * 2.2], 1.4, { order: 6 })); }
      for (let i = 0; i < 5; i++) { const cp = camAt(f).pos; out.push(FX('speck' + i, (p) => T.fxSpecks(p, i + 1), [cp[0] + 5 + i * 3.5, cp[1] - 1.5 + (i % 2) * 1.5, cp[2] + (i % 3 - 1) * 3], 2.2, { order: 6, alpha: 0.8 })); }
    }
  }
  return out;
};
export { villagerPos };
