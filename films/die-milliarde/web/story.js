// story.js: exports the kit contract (FPS, TOTAL, SHOTS, shotAt, LIGHTS, lightFor, camAt, dofAt, worldAt, actorsAt, fxAt)
// on top of the time-based shot list in shots.js.
import { FPS, TOTAL, SH, ev, finalize, camKeys } from './engine.js';
import './shots.js';
finalize();
export { FPS, TOTAL };
export const SHOTS = SH;
export const shotAt = (f) => ev(f).s;

const base = { az: 120, el: 40, sky: '#c4d6f2', ground: '#7a7088', hemi: 1.2, sun: '#fff1dc', sunI: 2.4, fog: '#c6daf2', fogNear: 60, fogFar: 700,
  skyTop: '#3d7fd6', skyHor: '#c8ddf4', sat: 1.18, waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#effaff', vig: 0.24, shadowExt: 14, ink: 1.5 };
export const LIGHTS = {
  day: { ...base, gain: '#fffaf2', lift: '#020308' },
  golden: { ...base, az: 200, el: 18, sun: '#ffc88a', sunI: 2.6, sky: '#ffd8b0', hemi: 1.0, skyTop: '#5a8ad8', skyHor: '#ffd0a0', fog: '#f0c8a0', gain: '#fff2e0', lift: '#060208', tint: '#fff4e4' },
  room: { ...base, az: 150, el: 50, sky: '#fff0d8', ground: '#8a7060', hemi: 1.15, sun: '#ffe8c8', sunI: 1.4, fog: '#e8d8c0', fogNear: 15, fogFar: 80, skyTop: '#8ab8e8', skyHor: '#e8e0d0', vig: 0.32, shadowExt: 6, gain: '#fff6ea', tint: '#fffaf2' },
  dawn: { ...base, az: 150, el: 30, sky: '#8a8ab8', ground: '#3a3048', hemi: 0.75, sun: '#ffb890', sunI: 0.9, fog: '#4a4a6a', fogNear: 10, fogFar: 60, skyTop: '#2a3a6a', skyHor: '#c88a8a', vig: 0.42, shadowExt: 6, gain: '#e8e8ff', lift: '#06061a', tint: '#c8c8e8' },
  night: { ...base, az: 160, el: 45, sky: '#3a4a8a', ground: '#14142a', hemi: 0.6, sun: '#8aa0ff', sunI: 0.5, fog: '#101830', fogNear: 20, fogFar: 300, skyTop: '#060a1e', skyHor: '#1a2a5a', vig: 0.45, shadowExt: 10, gain: '#d8e0ff', lift: '#04061a', tint: '#a8b0e0', sat: 1.12 },
  phone: { ...base, az: 90, el: 60, sky: '#1a1a2a', ground: '#050508', hemi: 0.35, sun: '#8ab0ff', sunI: 0.35, fog: '#06060c', fogNear: 3, fogFar: 25, skyTop: '#030306', skyHor: '#08080e', vig: 0.55, shadowExt: 3, gain: '#e8f0ff', lift: '#000000', tint: '#9ab4e8' },
  depot: { ...base, az: 0, el: 25, sky: '#e8eef4', ground: '#6a6a70', hemi: 1.1, sun: '#fff0d0', sunI: 2.0, fog: '#d8dce4', fogNear: 20, fogFar: 90, skyTop: '#7aa0d0', skyHor: '#dce4ec', vig: 0.3, shadowExt: 16, gain: '#fff8ee' },
  party: { ...base, az: 200, el: 40, sky: '#a85ad0', ground: '#2a1040', hemi: 1.05, sun: '#ff9ae0', sunI: 1.0, fog: '#2a1040', fogNear: 30, fogFar: 400, skyTop: '#0a0420', skyHor: '#4a1a6a', vig: 0.4, shadowExt: 14, gain: '#ffe8ff', lift: '#08021a', tint: '#e8c8f0', sat: 1.3 },
  grey: { ...base, az: 140, el: 55, sky: '#b8c0cc', ground: '#5a5a64', hemi: 1.05, sun: '#e8ecf4', sunI: 1.1, fog: '#b8c0cc', fogNear: 30, fogFar: 300, skyTop: '#7a8494', skyHor: '#c8ccd4', sat: 0.82, vig: 0.38, gain: '#eef2ff', lift: '#04060c', tint: '#e8ecf4' },
  sad: { ...base, az: 160, el: 45, sky: '#3a4a8a', ground: '#14142a', hemi: 0.75, sun: '#6a80c8', sunI: 0.4, fog: '#0a1028', fogNear: 20, fogFar: 300, skyTop: '#03061a', skyHor: '#142048', vig: 0.55, shadowExt: 10, gain: '#c8d4ff', lift: '#020414', tint: '#8a98c8', sat: 0.9 },
  warm: { ...base, az: 130, el: 35, sky: '#ffe8c8', ground: '#8a6a50', hemi: 1.2, sun: '#ffd8a0', sunI: 2.0, fog: '#f0d8b8', fogNear: 12, fogFar: 60, skyTop: '#8ab8e8', skyHor: '#ffe8c8', vig: 0.34, shadowExt: 6, gain: '#fff0dc', lift: '#080402', tint: '#fff2e0', sat: 1.22 },
  office: { ...base, az: 100, el: 50, sky: '#eef4ff', ground: '#c8d0dc', hemi: 1.35, sun: '#f4f8ff', sunI: 1.4, fog: '#dce8f8', fogNear: 40, fogFar: 600, skyTop: '#6a9ad8', skyHor: '#dce8f8', sat: 0.92, vig: 0.26, shadowExt: 10, gain: '#eef4ff', lift: '#02040a', tint: '#f4f8ff' },
  hosp: { ...base, az: 200, el: 35, sky: '#fff8e8', ground: '#a0b0b8', hemi: 1.3, sun: '#fff0d0', sunI: 1.6, fog: '#f0f4f0', fogNear: 15, fogFar: 80, vig: 0.26, shadowExt: 9, gain: '#fffaf0', tint: '#fffcf4' },
  museum: { ...base, az: 120, el: 70, sky: '#c8a080', ground: '#3a2018', hemi: 0.7, sun: '#ffe0a8', sunI: 1.5, fog: '#3a2420', fogNear: 10, fogFar: 60, skyTop: '#1a1010', skyHor: '#3a2420', vig: 0.45, shadowExt: 6, gain: '#fff0dc', tint: '#f4e4d0' },
};
export const lightFor = (S, f) => { const c = ev(f); return { ...LIGHTS[c.s.light || 'day'], ...(c.s.lightMod || {}) }; };

export const camAt = (f) => {
  const c = ev(f), s = c.s;
  const k = typeof s.cam === 'function' ? s.cam(c) : camKeys(s.cam || [{ u: 0, p: [0, 1.6, 6], l: [0, 1.2, 0] }], c);
  const out = { pos: [...k.p], look: [...k.l], fov: k.fov, roll: k.roll || 0 };
  for (const sh of s.shake || []) { const at = typeof sh === 'number' ? sh : sh.at, a = typeof sh === 'number' ? 0.03 : sh.a; const d = (c.lt - at) * FPS; if (d >= 0 && d < 8) { const v = (Math.floor(d) % 2 ? -1 : 1) * a * (1 - d / 8); out.look[1] += v * 3; out.look[0] += v * 2; out.roll += v * 25; } }
  out.flash = 0;
  if (s.flash) { const d = c.lt * FPS, n = s.flash.n ?? 4; if (d < n) { out.flash = (1 - d / n) * (s.flash.a ?? 0.95); out.flashCol = s.flash.col || '#ffffff'; } }
  if (s.flashEnd) { const d = (s.d - c.lt) * FPS, n = s.flashEnd.n ?? 4; if (d < n) { out.flash = Math.max(out.flash, (1 - d / n) * (s.flashEnd.a ?? 0.95)); out.flashCol = s.flashEnd.col || '#ffffff'; } }
  if (s.black) { const v = s.black(c); if (v > out.flash) { out.flash = v; out.flashCol = '#000000'; } }
  out.shadowAt = s.shadowAt || out.look;
  return out;
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const c = ev(f), s = c.s, C = camAt(f);
  const d = typeof s.dof === 'function' ? s.dof(c) : s.dof;
  if (!d) { const fd = dist(C.pos, C.look); return { focus: fd, cinf: C.fov < 30 ? 12 : fd < 3 ? 11 : fd < 6 ? 7 : 2.5 }; }
  if (d.p) return { focus: dist(C.pos, d.p), cinf: d.c ?? 10, near: d.near };
  return { focus: d.focus ?? dist(C.pos, C.look), cinf: d.c ?? 10, near: d.near };
};
export const worldAt = (f) => { const c = ev(f), s = c.s; return { set: s.set, t: c.t, clouds: s.clouds ?? ['kiez', 'city'].includes(s.set), ...(s.w ? s.w(c) : {}) }; };
export const actorsAt = (f, T) => { const c = ev(f), s = c.s; const L = lightFor(s, f); const list = s.act ? s.act(c) : []; return list.filter(Boolean).map((a) => ({ ...a, tint: a.tint || s.tint || L.tint })); };
export const fxAt = (f, T) => { const c = ev(f), s = c.s; return (s.fx ? s.fx(c) : []).filter(Boolean); };
// crossfade: s.xf seconds at the start of a shot blend from the previous shot (render.mjs renders both)
globalThis.xfAt = (f) => { const c = ev(f), s = c.s; if (!s.xf || c.lt >= s.xf || s.i === 0) return null; return { prev: s.i - 1, cur: s.i, k: c.lt / s.xf }; };
globalThis.mbAt = (f) => { const c = ev(f); return c.s.mb ? c.s.mb(c) : 1; };
