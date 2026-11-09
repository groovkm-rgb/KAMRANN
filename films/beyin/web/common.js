// Shared helpers for the shot files.
export const FPS = 30;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
export const ramp = (t, a, b) => clamp((t - a) / (b - a));
export const sm = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
export const eo = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const ei = (t) => Math.pow(clamp(t), 3);
export const back = (t, s = 1.7) => { t = clamp(t) - 1; return t * t * ((s + 1) * t + s) + 1; };
export const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
export const blink = (f, seed) => { const per = 70 + (seed * 37) % 60, ph = (f + seed * 13) % per; return ph < 2 ? 0.5 : ph < 4 ? 1 : ph < 5 ? 0.5 : 0; };
export const idle = (f, seed = 1, k = 1) => ({ bob: q(0.006 * k * Math.sin((f + seed * 11) * 0.11), 3), tilt: q(1.2 * k * Math.sin((f + seed * 7) * 0.05), 1), headTilt: q(1.6 * k * Math.sin((f + seed * 5) * 0.037 + 1), 1) });
const ease = { sm, eo, ei, lin: (t) => clamp(t), back };
/** camera keys: [t, pos, look, fov, roll?, ease?]; every hold creeps (slow push-in + drift) */
export const cam = (keys, t, { creep = 0.012, drift = 0.04, kicks = [], seed = 1 } = {}) => {
  let c;
  const K = keys.map(([kt, pos, look, fov, roll = 0, e = 'sm']) => ({ kt, pos, look, fov, roll, e }));
  if (t <= K[0].kt) c = { ...K[0] };
  else if (t >= K[K.length - 1].kt) c = { ...K[K.length - 1] };
  else { const i = K.findIndex((k, j) => t >= k.kt && t <= K[j + 1].kt), a = K[i], b = K[i + 1]; const u = ease[b.e]((t - a.kt) / (b.kt - a.kt));
    c = { pos: lerp3(a.pos, b.pos, u), look: lerp3(a.look, b.look, u), fov: lerp(a.fov, b.fov, u), roll: lerp(a.roll, b.roll, u) }; }
  c = { pos: [...c.pos], look: [...c.look], fov: c.fov * (1 - creep * t), roll: c.roll };
  // hand-held drift so no frame is ever frozen
  c.pos[0] += drift * Math.sin(t * 0.7 + seed); c.pos[1] += drift * 0.5 * Math.sin(t * 0.9 + seed * 2); c.roll += 0.25 * Math.sin(t * 0.5 + seed);
  for (const k of kicks) { const d = t - k.t; if (d >= 0 && d < 0.3) { const s = Math.sin(d / 0.3 * Math.PI * 3) * k.a * (1 - d / 0.3); c.look = [c.look[0] + s * 0.5, c.look[1] + s * 0.8, c.look[2]]; c.roll += s * 12; }
    if (k.punch && d >= 0 && d < (k.len || 0.5)) c.fov *= 1 - k.punch * Math.sin(Math.PI * Math.min(1, d / (k.len || 0.5))) ; }
  return c;
};
export const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
/** point in front of the camera: d metres along the view, dx/dy in screen-ish metres */
export const inFront = (C, d, dx = 0, dy = 0) => {
  const f = [C.look[0] - C.pos[0], C.look[1] - C.pos[1], C.look[2] - C.pos[2]], l = Math.hypot(...f); const n = f.map((v) => v / l);
  const r = [-n[2], 0, n[0]], rl = Math.hypot(...r) || 1; const rn = r.map((v) => v / rl); const up = [rn[1] * n[2] - rn[2] * n[1], rn[2] * n[0] - rn[0] * n[2], rn[0] * n[1] - rn[1] * n[0]];
  return [C.pos[0] + n[0] * d + rn[0] * dx + up[0] * dy, C.pos[1] + n[1] * d + rn[1] * dx + up[1] * dy, C.pos[2] + n[2] * d + rn[2] * dx + up[2] * dy];
};

// ---------- cast ----------
export const OUT = {
  prisoner: { top: '#f39a3c', pants: '#f39a3c', build: 'big', sleeves: 'short', tattoo: true, skin: '#e8b48a', hair: '#3b2a20', shoes: '#4a3a2a' },
  guard: { top: '#3b5b8a', pants: '#2c3a5e', hat: 'guard', uniform: true, moustache: '#4a3020', skin: '#f5c9a0', shoes: '#1b1b1b' },
  thin: { top: '#3b5b8a', pants: '#2c3a5e', hat: 'guard', uniform: true, build: 'thin', skin: '#ecd0b6', shoes: '#1b1b1b' },
  sci1: { top: '#9ad0e0', pants: '#4a5466', coat: '#f7f9fb', glasses: true, hair: '#2b211c', skin: '#c99067' },
  sci2: { top: '#f2b8c6', pants: '#4a5466', coat: '#f7f9fb', hair: '#c2733a', bun: true, skin: '#ffe2c2', skirt: '#5a6a8a' },
  sci3: { top: '#c8e6a0', pants: '#3b3f52', coat: '#f7f9fb', bald: '#8a8a8a', moustache: '#8a8a8a', skin: '#f3d6bb' },
  res: { top: '#f1ead8', pants: '#5a4a3a', cardigan: '#d9a441', glasses: true, hair: '#8a5a34', bun: true, skin: '#f5c9a0', skirt: '#5a6a8a' },
  patA: { top: '#a9d4ef', gown: '#a9d4ef', hair: '#5a3b2a', skin: '#f5c9a0' },
  patB: { top: '#a9d4ef', gown: '#a9d4ef', hair: '#5a3b2a', skin: '#f5c9a0' },
  patC: { top: '#b9e0c8', gown: '#b9e0c8', hair: '#d9d9de', skin: '#c99067' },
  patD: { top: '#f5d7a8', gown: '#f5d7a8', hair: '#2b211c', skin: '#a86a48', long: true },
  nurse: { top: '#7fd0c0', pants: '#7fd0c0', hat: 'nurse', hair: '#2b211c', bun: true, skin: '#c99067' },
  tasterA: { top: '#ffffff', pants: '#2b2b33', apron: '#7a1830', bowtie: '#1b1b1b', hair: '#3b2a20', skin: '#f5c9a0' },
  tasterB: { top: '#ffffff', pants: '#2b2b33', apron: '#7a1830', bowtie: '#c8102e', hair: '#d9a441', long: true, skin: '#ffe2c2' },
  tasterC: { top: '#ffffff', pants: '#2b2b33', apron: '#7a1830', bowtie: '#1b1b1b', bald: '#e8e8ee', moustache: '#e8e8ee', skin: '#f3d6bb', build: 'round' },
  tasterD: { top: '#ffffff', pants: '#2b2b33', apron: '#7a1830', bowtie: '#3b5b8a', hair: '#1e1714', skin: '#a86a48', glasses: true },
  tasterE: { top: '#ffffff', pants: '#2b2b33', apron: '#7a1830', bowtie: '#1b1b1b', hair: '#c2733a', bun: true, skin: '#ecd0b6' },
  assist: { top: '#5a3b2a', pants: '#2b2b33', apron: '#2b2b33', hair: '#2b211c', skin: '#c99067' },
  vol: { top: '#6fbf73', pants: '#3b3f52', sneakers: true, hair: '#c2733a', electrode: true, skin: '#ffe2c2' },
  volA: { top: '#f2c14e', pants: '#3b3f52', hair: '#3b2a20', skin: '#f5c9a0', electrode: true },
  volA2: { top: '#e57373', pants: '#3b3f52', hair: '#1e1714', long: true, skin: '#a86a48' },
  volB: { top: '#9aa3ad', pants: '#3b3f52', hair: '#5a3b2a', skin: '#ecd0b6', electrode: true },
  volB2: { top: '#7986cb', pants: '#3b3f52', hair: '#d9a441', bun: true, skin: '#ffe2c2' },
  rush: { top: '#dfe9f5', pants: '#3a4a6a', tie: '#d23c3c', hair: '#2b211c', skin: '#f5c9a0', shoes: '#2a1a12' },
  wheel: { top: '#c25a7a', pants: '#3b3f52', wheelchair: true, hair: '#1e1714', long: true, skin: '#a86a48' },
  old: { top: '#8a7ab8', skirt: '#6b5a9a', hair: '#e8e8ee', bun: true, glasses: true, skin: '#f3d6bb' },
  fire: { top: '#2b2b33', pants: '#2b2b33', hat: 'fire', fireCoat: true, skin: '#ecd0b6', moustache: '#4a3020' },
  jock1: { top: '#3f6fb5', pants: '#2b2b33', jersey: '#ffffff', build: 'big', sleeves: 'short', hair: '#2b211c', skin: '#a86a48' },
  jock2: { top: '#3f6fb5', pants: '#2b2b33', jersey: '#ffffff', build: 'big', sleeves: 'short', hair: '#c2733a', skin: '#f5c9a0' },
  jock3: { top: '#3f6fb5', pants: '#2b2b33', jersey: '#ffffff', build: 'big', sleeves: 'short', hair: '#1e1714', skin: '#ecd0b6' },
  ped1: { top: '#8c3b4a', pants: '#3b3f52', hair: '#2b211c', skin: '#f5c9a0' },
  ped2: { top: '#2f5f6a', skirt: '#d9a441', hair: '#5a3b2a', long: true, skin: '#c99067' },
  ped3: { top: '#5d7a3a', pants: '#3b3f52', cap: '#e2453c', skin: '#ffe2c2' },
};
let SEEDS = {}; Object.keys(OUT).forEach((k, i) => SEEDS[k] = 3 + i * 2);
/** person card. o: person opts (expr, L, R, ...). pos [x,y,z]. ex: card extras (s, flip, alpha, ...) */
export const PER = (T, who, o, pos, ex = {}) => { const oo = { seed: SEEDS[who], ...o }; return { key: who + JSON.stringify(oo), draw: (p) => T.person(p, OUT[who], oo), x: pos[0], y: pos[1], z: pos[2], ground: ex.noBlob ? undefined : pos[1], ...ex }; };
export const BR = (T, o, pos, ex = {}) => ({ key: 'brain' + JSON.stringify(o), draw: (p) => T.brain(p, o), x: pos[0], y: pos[1], z: pos[2], ground: ex.noBlob ? undefined : pos[1], ...ex });
export const PR = (T, name, args, pos, s, ex = {}) => ({ key: name + JSON.stringify(args), draw: T.prop(name, ...args), x: pos[0], y: pos[1], z: pos[2], s, center: true, shape: 'sq', blob: false, shadow: false, ...ex });
export const SIGN = (T, n, pos, s, ex = {}) => ({ key: 'sign' + n, draw: T.signCard(n), x: pos[0], y: pos[1], z: pos[2], s, center: true, shape: 'tall', blob: false, shadow: false, ...ex });

// ---------- light presets ----------
const base = { az: 120, el: 50, sky: '#ffffff', ground: '#9a9080', hemi: 1.2, sun: '#ffffff', sunI: 1.6, fog: '#ffffff', fogNear: 60, fogFar: 400, skyTop: '#4f93dd', skyHor: '#cfe6fa', sat: 1.08, vig: 0.18, shadowExt: 10 };
export const LIGHTS = {
  studio: { ...base, az: 70, el: 55, sky: '#f4f2ff', ground: '#c9b8e8', hemi: 1.45, sunI: 1.3, sky_: false, shadowExt: 8 },
  cellGrey: { ...base, bg: '#55575f', az: 100, el: 60, sky: '#c9d0dc', ground: '#6a6c74', hemi: 1.15, sun: '#e8eef8', sunI: 1.2, sat: 0.75, gain: '#e6ecf4', sky_: false, shadowExt: 8 },
  cellPink: { ...base, bg: '#a8607a', az: 100, el: 60, sky: '#ffe6f0', ground: '#a0707e', hemi: 1.3, sun: '#fff1f4', sunI: 1.3, sat: 1.1, gain: '#fff4f8', sky_: false, shadowExt: 8 },
  bucket: { ...base, bg: '#e8c8d4', az: 60, el: 65, sky: '#fff8f0', ground: '#b0a090', hemi: 1.3, sunI: 1.4, sky_: false, shadowExt: 4 },
  lab: { ...base, az: 95, el: 40, sky: '#f4fbff', ground: '#b7c4cf', hemi: 1.4, sun: '#fffaf0', sunI: 1.4, shadowExt: 10 },
  hosp: { ...base, az: 95, el: 35, sky: '#fff6e6', ground: '#a89a80', hemi: 1.25, sun: '#fff1d6', sunI: 1.6, shadowExt: 16 },
  hospCold: { ...base, az: 95, el: 35, sky: '#d4dae2', ground: '#7a7c80', hemi: 1.05, sun: '#dfe6ee', sunI: 0.9, sat: 0.72, gain: '#e8eef6', shadowExt: 10 },
  hospWarm: { ...base, az: 95, el: 35, sky: '#fff2d8', ground: '#b09a70', hemi: 1.35, sun: '#ffe6b0', sunI: 1.9, sat: 1.15, gain: '#fff6e8', shadowExt: 10 },
  archive: { ...base, az: 110, el: 50, sky: '#d8d0b8', ground: '#5a4a3a', hemi: 0.9, sun: '#ffe9c0', sunI: 1.0, sat: 1.0, gain: '#fff0dc', vig: 0.3, sky_: false, shadowExt: 8, fill: { col: '#ffd890', i: 6, d: 6, pos: [0.8, 1.5, -0.4] } },
  garden: { ...base, az: 120, el: 45, hemi: 1.25, sun: '#fff4dc', sunI: 1.8, fogNear: 30, fogFar: 160, fog: '#cfe6fa', shadowExt: 18 },
  modern: { ...base, az: 130, el: 50, hemi: 1.3, sun: '#fff6e0', sunI: 1.8, fogNear: 60, fogFar: 300, fog: '#cfe6fa', shadowExt: 22 },
  wine: { ...base, az: 80, el: 55, sky: '#ffe2b8', ground: '#5a3a24', hemi: 0.95, sun: '#ffd9a0', sunI: 1.25, sat: 1.12, gain: '#fff0dc', vig: 0.3, sky_: false, shadowExt: 9, fill: { col: '#ffb860', i: 3, d: 9, pos: [0, 2.8, 1.2] } },
  lobby: { ...base, bg: '#cfc6b8', az: 100, el: 60, sky: '#fff6ea', ground: '#a89a88', hemi: 1.3, sun: '#fff4e6', sunI: 1.3, sky_: false, shadowExt: 8 },
  blueprint: { ...base, hemi: 1.4, sunI: 0.6, sky_: false, sat: 1.0, vig: 0.25 },
  nyc: { ...base, az: 140, el: 42, hemi: 1.2, sun: '#fff2dc', sunI: 1.7, fogNear: 60, fogFar: 520, fog: '#d8e6f2', skyTop: '#5a9ae0', skyHor: '#e2eef8', shadowExt: 26 },
};
