// "Ein Jahr drinnen" — shot plan, synced to voice.mp3 (305.95 s, 9178 frames @ 30 fps).
// Section starts (s): Tag 1 0.0 | Tag 2–7 35.2 | Woche 2–4 81.06 | Monat 2–5 133.55 | Monat 6–11 181.41 | Tag 365 234.98
// Every shot boundary sits on a phrase boundary from work/phrases.json.
import { dayAt, heroSpec, SCHMIDT, GUENTHER, GUENTHER_POSE, ZOMBIES, ZOMBIE_POSE, POSTMAN, KID, VANMAN } from './chars.js';
import * as FX from './fx.js';
export const FPS = 30, TOTAL = 9178;
// 16:9 landscape (1920x1080). Every camera key is zoomed by ZOOM so the portrait-era framing sizes become landscape framing.
export const ASPECT = 16 / 9; const ZOOM = 0.78;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const easeOut = (t) => 1 - (1 - clamp(t)) ** 3.2;
const lerp = (a, b, t) => a + (b - a) * t, lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t)), ramp = (f, a, b) => clamp((f - a) / (b - a));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const pop = (f, f0, d = 8) => q(easeOut(ramp(f, f0, f0 + d)) * (1 + 0.15 * Math.sin(ramp(f, f0, f0 + d) * Math.PI)), 2);

// ---------- lights ----------
const BASE = { az: 120, el: 50, sky: '#c4d6f2', ground: '#7a7088', hemi: 1.2, sun: '#fff1dc', sunI: 2.5, fog: '#c6daf2', fogNear: 60, fogFar: 700,
  skyTop: '#3d7fd6', skyHor: '#c8ddf4', sat: 1.2, waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#effaff', vig: 0.2, shadowExt: 14 };
export const LIGHTS = {
  day: BASE,
  morning: { ...BASE, az: 70, el: 28, sun: '#ffe0b0', sunI: 2.3, hemi: 1.15, skyTop: '#5a8ad8', skyHor: '#f6dcb4', fog: '#f0dcc0', sat: 1.22 },
  inside: { ...BASE, hemi: 1.35, sunI: 1.7, sat: 1.18 },
  dusk: { ...BASE, az: 250, el: 10, sun: '#ff9a5a', sunI: 1.6, hemi: 0.85, sky: '#c8a0c0', ground: '#4a3a58', skyTop: '#3a3a8a', skyHor: '#f0a070', fog: '#b08aa0', fogNear: 30, fogFar: 300, vig: 0.32 },
  dark: { ...BASE, az: 250, el: 15, hemi: 0.8, sky: '#a890b8', ground: '#3a3048', sun: '#ffa060', sunI: 0.7, skyTop: '#2a2a5a', skyHor: '#c87a5a', fog: '#5a4a6a', fogNear: 30, fogFar: 260, sat: 1.1, vig: 0.42 },
  red: { ...BASE, az: 200, el: 30, hemi: 0.55, sky: '#ff6a5a', ground: '#3a1020', sun: '#ff4a2a', sunI: 1.6, skyTop: '#3a0a1a', skyHor: '#c03a2a', fog: '#5a1a2a', fogNear: 20, fogFar: 200, sat: 1.25, vig: 0.6, gain: '#ffd0c8' },
  night: { ...BASE, az: 60, el: 40, hemi: 0.62, sky: '#6a7ac0', ground: '#1a1a3a', sun: '#b0c0ff', sunI: 1.0, skyTop: '#0a1030', skyHor: '#2a3a6a', fog: '#1a2240', fogNear: 25, fogFar: 160, sat: 1.15, vig: 0.45 },
  cellar: { ...BASE, az: 30, el: 60, hemi: 0.75, sky: '#ffcf90', ground: '#4a3020', sun: '#ffd8a0', sunI: 1.0, skyTop: '#201010', skyHor: '#402820', fog: '#3a2a20', fogNear: 20, fogFar: 100, vig: 0.5 },
  summer: { ...BASE, az: 140, el: 55, sun: '#fff0d0', sunI: 2.7, sat: 1.3, skyTop: '#2f78e0' },
  rain: { ...BASE, hemi: 0.95, sky: '#9aa8b8', sun: '#c8d0d8', sunI: 0.8, skyTop: '#6a7888', skyHor: '#a8b4c0', fog: '#a0aab8', fogNear: 15, fogFar: 160, sat: 0.95, vig: 0.3 },
  winter: { ...BASE, az: 160, el: 18, hemi: 1.2, sky: '#dfe8ff', ground: '#a0a8c0', sun: '#f0f4ff', sunI: 1.6, skyTop: '#8aa8d8', skyHor: '#e8eef8', fog: '#e0e8f4', fogNear: 20, fogFar: 220, sat: 1.0, vig: 0.28 },
  fire: { ...BASE, az: 20, el: 30, hemi: 0.6, sky: '#ffb070', ground: '#3a2030', sun: '#ff9040', sunI: 1.1, skyTop: '#100a20', skyHor: '#3a2a4a', fog: '#2a1a2a', fogNear: 20, fogFar: 120, vig: 0.5 },
  sad: { ...BASE, az: 60, el: 35, hemi: 0.62, sky: '#7a8ac0', ground: '#202040', sun: '#9aa8e0', sunI: 0.55, skyTop: '#141a3a', skyHor: '#3a4a7a', fog: '#2a3050', fogNear: 20, fogFar: 140, sat: 0.62, vig: 0.6 },
  spring: { ...BASE, az: 120, el: 45, sun: '#fff6e0', sunI: 2.6, sat: 1.32, skyTop: '#3a88e0', skyHor: '#d0e8f8' },
  final: { ...BASE, az: 100, el: 40, hemi: 1.45, sunI: 2.8, sat: 1.3, sunDisc: '#fff6d0', sunSize: 0.015, skyTop: '#2f80e8', skyHor: '#d8ecff' },
};

// ---------- actor helpers ----------
const blinkAt = (f, seed) => { const per = 40 + (seed * 17) % 30, ph = (f + seed * 13) % per; return ph < 2 ? 0.5 : ph < 4 ? 1 : 0; };
const ACT = (T, spec, o, pos, ex = {}) => ({ key: JSON.stringify([spec, o]), draw: (p) => T.toonChar(p, spec, o), x: pos[0], y: pos[1], z: pos[2], ...ex });
/** the hero for frame f (spec from the character sheet + per-shot extras) */
const HERO = (T, f, o, pos, ex = {}, specX = {}) => ACT(T, { ...heroSpec(dayAt(f)), ...specX }, { blink: blinkAt(f, 5), ...o }, pos, ex);
const CARD = (key, draw, pos, s, ex = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, ...ex });
const GIS = (pos, s = 0.42, sway = 0, ex = {}) => CARD('gis' + q(sway, 1), (p) => T_.drawGisela(p.g, 300, 975, 1.25, sway), pos, s, { blob: true, shadow: true, ...ex });
let T_ = null;
const walk = (f, f0, f1, p0, p1, per = 22) => { const t = ramp(f, f0, f1); return { pos: lerp3(p0, p1, t), moving: f > f0 && f < f1, step: q(((f - f0) % per) / per) }; };
// a card glued in front of the camera (inserts, weather). d = distance in metres
const screenCard = (C, key, draw, d = 0.6, ex = {}) => {
  const dir = C.look.map((v, i) => v - C.pos[i]), L = Math.hypot(...dir), n = dir.map((v) => v / L);
  const viewH = 2 * d * Math.tan(C.fov * Math.PI / 360), s = viewH / 2.25 * 1.02, ctr = C.pos.map((v, i) => v + n[i] * d);
  return CARD(key, draw, [ctr[0], ctr[1] - 1.06875 * s, ctr[2]], s, { order: 9, ...ex });
};
const screenRow = (C, key, draw, d = 1.2) => { const dir = C.look.map((v, i) => v - C.pos[i]), L = Math.hypot(...dir), n = dir.map((v) => v / L), r = [-n[2], 0, n[0]], rl = Math.hypot(r[0], r[2]) || 1;
  const viewH = 2 * d * Math.tan(C.fov * Math.PI / 360), cw = viewH / 2.25 * 1.35;
  return [-1, 0, 1].map((k) => { const c = screenCard(C, key + 'r' + k, draw, d); c.x -= r[0] / rl * k * cw * 0.98; c.z -= r[2] / rl * k * cw * 0.98; return c; }); };
const FXC = (key, draw, pos, s = 0.35, ex = {}) => CARD(key, draw, pos, s, { order: 6, ...ex });
const notes = (f, base, n = 3, s = 0.22) => Array.from({ length: n }, (_, i) => { const t = ((f * 0.02 + i / n) % 1); return FXC('note' + i, (p) => T_.fxNote(p, i % 2, ['#e83a5a', '#3a78c8', '#f2a030'][i % 3]), [base[0] + Math.sin(t * 6 + i) * 0.25, base[1] + t * 0.8, base[2]], s * (0.7 + 0.3 * Math.sin(t * Math.PI))); });
const burst = (f, f0, pos, s = 0.7, col = '#fff3b0', d = 12) => (f >= f0 && f < f0 + d ? [FXC('burst' + q((f - f0) / d), (p) => T_.fxBurst(p, (f - f0) / d, col, 10, 30, 170), pos, s)] : []);
const puff = (f, f0, pos, s = 0.5, d = 12) => (f >= f0 && f < f0 + d ? [FXC('puff' + q((f - f0) / d), (p) => T_.fxPuff(p, (f - f0) / d), pos, s)] : []);
const moanFx = (f, pos, s = 0.35) => [FXC('moan' + q((f % 30) / 30, 1), (p) => FX.moan(p, (f % 30) / 30), pos, s)];

// ---------- the shot list ----------
// cam keys: [frame, pos, look, fov, ease('out'|'lin'|'s'), roll]
const V = (...a) => a;
const SALON_SIDE = { pos: [-0.75, 1.55, 6.3], look: [-4.2, 1.05, 6.0] };
const SHOTS_ = [];
// framing helper: b = card base point of the subject, az = direction from subject to camera (deg, 0 = +z, 90 = +x)
// sizes are measured for the 9:16 frame with the big heads: [visible height in m, look height above b]
const FR = { CU: [1.3, 1.55], MCU: [1.75, 1.42], MS: [2.35, 1.22], FS: [3.0, 1.05], WS: [4.3, 1.15] };
const F = (b, az, kind, o = {}) => { const [H0, cy] = FR[kind], H = H0 * (o.k || 1), fov = o.fov || 40, d = H / (2 * Math.tan(fov * Math.PI / 360)), a = az * Math.PI / 180;
  const look = [b[0] + (o.lx || 0), b[1] + cy + (o.dy || 0), b[2] + (o.lz || 0)]; return [[q(look[0] + Math.sin(a) * d, 3), q(look[1] + (o.h || 0), 3), q(look[2] + Math.cos(a) * d, 3)], look, fov]; };
const HW = [-4.35, 0.02, 4.2], HK = [3.3, 0, 7.55], HR = [-3.6, 0, 5.2];
const shot = (id, a, b, light, cam, act, o = {}) => SHOTS_.push({ id, a, b, light, cam, act, ...o });

// ===== 1 · TAG 1 =====
shot('wake', 0, 115, 'morning', [[0, ...F(HW, 90, 'CU')], [48, ...F(HW, 90, 'CU', { k: 0.94 }), 'lin'], [62, ...F(HW, 90, 'MS'), 'out'], [115, ...F(HW, 90, 'MS', { k: 0.95 }), 'lin']],
  (f, T) => [HERO(T, f, { expr: f < 30 ? 'sleep' : f < 49 ? 'tired' : 'goofy', phones: true, legs: 'sit', L: f > 49 ? 'up' : 'belly', R: f > 49 ? 'wave' : 'hang', bob: f > 49 ? q(Math.abs(Math.sin(f * 0.35)) * 0.02, 3) : 0, headTilt: f > 49 ? q(8 * Math.sin(f * 0.35), 1) : -6 }, [-4.35, 0.02, 4.2], { blob: false }),
    ...(f > 49 ? notes(f, [-4.0, 1.9, 4.3], 3, 0.2) : []), ...(f < 30 ? [FXC('zzz' + q((f % 40) / 40, 1), (p) => FX.zzz(p, (f % 40) / 40), [-4.0, 1.8, 4.3], 0.3)] : [])],
  { dof: [[-4.35, 1.55, 4.2], 13], w: { tv: 1 } });
shot('kitchen', 115, 219, 'morning', [[115, ...F([0.8, 0, 6.6], 110, 'MS')], [165, ...F([3.4, 0, 8.2], 140, 'MS'), 's'], [219, ...F([3.4, 0, 8.2], 140, 'MS', { k: 0.9 }), 'lin']],
  (f, T) => { const w = walk(f, 115, 165, [0.5, 0, 6.5], [3.5, 0, 8.2]); return [HERO(T, f, { expr: 'tired', phones: true, legs: w.moving ? 'walk' : 'stand', step: w.step, turn: f > 165 ? -0.55 : -0.3, look: -0.8, R: f > 160 ? { x: 470, y: 480, b: 0.5 } : 'hang', holdR: f > 160 ? 'mug' : null, L: 'hang', bob: w.moving ? q(Math.abs(Math.sin(f * 0.3)) * 0.01, 3) : 0 }, w.pos), ...notes(f, [w.pos[0], 1.95, w.pos[2]], 2, 0.15)]; },
  { dof: [[3.3, 1.5, 7.8], 11] });
shot('postman', 219, 276, 'morning', [[219, [3.0, 1.55, 7.4], [2.7, 1.4, 20.8], 34], [232, [3.0, 1.55, 10.4], [2.7, 1.3, 20.8], 26, 'out'], [276, [3.0, 1.55, 11.2], [2.7, 1.3, 20.8], 24, 'lin']],
  (f, T) => [ACT(T, POSTMAN, { expr: f > 236 ? 'shock' : 'happy', L: f > 236 ? 'up' : 'hang', R: { x: 520, y: 440, b: 0.4 }, holdL: 'paper', turn: 0.4, look: 0.8 }, [2.3, 0, 20.7]),
    ACT(T, ZOMBIES[0], { ...ZOMBIE_POSE(f, 0), legs: 'stand', tilt: 0, hunch: 0.45, expr: 'zombie' }, [3.15, 0, 20.9], { flip: true }),
    ...burst(f, 236, [2.75, 1.4, 20.6], 0.9)],
  { dof: [[2.7, 1.4, 20.8], 6] });
shot('okay', 276, 389, 'morning', [[276, ...F([3.2, 0, 8.45], 0, 'MCU', { fov: 30, h: 0.5 })], [290, ...F([3.2, 0, 8.45], 0, 'MCU', { fov: 30, h: 0.5, k: 0.9 }), 'out'], [389, ...F([3.2, 0, 8.45], 0, 'MCU', { fov: 30, h: 0.5, k: 0.8 }), 'lin']],
  (f, T) => { const sip = (f > 300 && f < 330) || (f > 360); return [HERO(T, f, { expr: f < 316 ? 'neutral' : f < 360 ? 'smug' : 'sleep', phones: true, R: sip ? { x: 395, y: 330, b: 0.8 } : { x: 470, y: 480, b: 0.5 }, holdR: 'mug', L: 'hang', turn: 0, look: f < 300 ? 0.6 : 0 }, [3.2, 0, 8.45])]; },
  { dof: [[3.2, 1.5, 8.45], 9], flash: true });
shot('phoneA', 389, 503, 'morning', [[389, [3.65, 1.55, 6.6], [3.7, 1.45, 8.3], 38], [503, [3.65, 1.55, 6.75], [3.7, 1.45, 8.3], 36, 'lin']],
  (f, T, C) => [HERO(T, f, { expr: f < 440 ? 'tired' : 'shock', phones: true, R: { x: 470, y: 470, b: 0.5 }, L: 'hang', look: 0 }, [3.7, 0, 8.35]),
    screenCard(C, 'phA' + q(ramp(f, 395, 440), 1), (p) => FX.phone(p, 'calls', ramp(f, 395, 440)), 0.55)],
  { dof: (f, C) => ({ focus: 0.55, cinf: 12 }), flash: true });
shot('phoneB', 503, 628, 'morning', [[503, [3.65, 1.55, 6.75], [3.7, 1.45, 8.3], 36], [628, [3.65, 1.55, 6.95], [3.7, 1.45, 8.3], 33, 'lin']],
  (f, T, C) => [HERO(T, f, { expr: 'scared', phones: true, R: { x: 470, y: 470, b: 0.5 }, L: 'chin' }, [3.7, 0, 8.35]),
    screenCard(C, 'phB' + q(ramp(f, 503, 540), 2) + (f % 4 < 2 && f < 540 ? 'a' : 'b'), (p) => FX.phone(p, 'alert', ramp(f, 503, 540), { shake: f < 540 ? (f % 4 < 2 ? 6 : -6) : 0 }), 0.55)],
  { dof: (f, C) => ({ focus: 0.55, cinf: 12 }) });
shot('zombies', 628, 776, 'morning', [[628, ...F([1.4, 0, 14.6], 10, 'FS', { k: 1.25, h: -0.4 })], [656, ...F([1.4, 0, 14.6], 10, 'FS', { k: 1.05, h: -0.4 }), 'out'], [700, ...F([1.4, 0, 14.6], 10, 'FS', { k: 1.0, h: -0.4 }), 'lin'], [714, ...F([1.4, 0, 14.6], 0, 'WS', { h: 1.0, k: 1.15, fov: 50 }), 'out'], [776, ...F([1.4, 0, 14.6], 0, 'WS', { h: 1.0, k: 1.1, fov: 50 }), 'lin']],
  (f, T) => [...ZOMBIES.map((z, i) => { const p0 = [[0.3, 0, 15.2], [1.5, 0, 13.9], [2.7, 0, 15.6]][i]; return ACT(T, z, ZOMBIE_POSE(f, i), [p0[0] + (f - 628) * 0.008 * (i % 2 ? 1 : -0.6), 0, p0[2]], { flip: i === 0 }); }),
    HERO(T, f, { expr: 'shock', phones: true, R: { x: 470, y: 470, b: 0.5 }, holdR: 'phone', L: 'chin' }, [3.7, 0, 8.4])],
  { dof: [[1.6, 1.4, 13.6], 7], flash: true });
shot('call', 776, 1000, 'morning', [[776, [3.65, 1.55, 6.7], [3.7, 1.45, 8.3], 36], [1000, [3.65, 1.55, 6.95], [3.7, 1.45, 8.3], 33, 'lin']],
  (f, T, C) => { const mode = f < 838 ? 'call' : 'chat', n = f < 873 ? 0 : f < 961 ? 1 : 2, t = mode === 'call' ? ramp(f, 776, 838) : ramp(f, 838, 1000);
    return [HERO(T, f, { expr: f < 838 ? 'worried' : 'neutral', phones: true, R: { x: 470, y: 470, b: 0.5 }, L: 'hang' }, [3.7, 0, 8.35]),
      screenCard(C, 'ph' + mode + n + (f > 930 && f < 961 ? 't' + (f % 12 < 4 ? 0 : f % 12 < 8 ? 1 : 2) : '') + (mode === 'call' ? ((t * 9) | 0) % 2 : ''), (p) => FX.phone(p, mode, t, { n, typing: f > 930 && f < 961 }), 0.55)]; },
  { dof: (f) => ({ focus: 0.55, cinf: 12 }), flash: true });
shot('problem', 1000, 1056, 'morning', [[1000, ...F([3.7, 0, 8.35], 180, 'MCU', { fov: 36 }), 's', 0], [1056, ...F([3.7, 0, 8.35], 180, 'CU', { fov: 36 }), 'lin', -5]],
  (f, T) => [HERO(T, f, { expr: 'worried', phones: false, turn: -0.5, look: -0.9, R: 'hang', holdR: 'phone', L: 'chin' }, [3.7, 0, 8.35])],
  { dof: [[3.7, 1.55, 8.35], 14] });

// ===== 2 · TAG 2–7 =====
const INV = [[1128, 'nudeln', [2.65, 0.84, 6.5], 0.3], [1180, 'brot', [3.1, 0.84, 6.4], 0.26], [1290, 'ketchup', [3.5, 0.84, 6.5], 0.26], [1329, 'mais', [3.85, 0.84, 6.4], 0.24], [1414, 'gummy', [4.15, 0.84, 6.55], 0.24]];
shot('inventur', 1056, 1462, 'inside', [[1056, ...F(HK, 180, 'MS', { fov: 48 })], [1128, ...F(HK, 180, 'MS', { fov: 48, k: 0.97 }), 'lin'], [1140, ...F(HK, 180, 'MS', { fov: 48, k: 0.72, lx: -0.6, dy: -0.25 }), 'out'], [1180, ...F(HK, 180, 'MS', { fov: 48, k: 0.7, lx: -0.6, dy: -0.25 }), 'lin'], [1192, ...F(HK, 180, 'MS', { fov: 48, k: 0.72, lx: -0.2, dy: -0.2 }), 'out'], [1290, ...F(HK, 180, 'MS', { fov: 48, k: 0.7, lx: -0.2, dy: -0.2 }), 'lin'], [1302, ...F(HK, 180, 'MS', { fov: 48, k: 0.72, lx: 0.35, dy: -0.25 }), 'out'], [1405, ...F(HK, 180, 'MS', { fov: 48, k: 0.7, lx: 0.4, dy: -0.25 }), 'lin'], [1420, ...F(HK, 180, 'MS', { fov: 48 }), 'out'], [1462, ...F(HK, 180, 'MS', { fov: 48, k: 0.96 }), 'lin']],
  (f, T) => { const out = []; const cur = INV.filter(([f0]) => f >= f0).length;
    INV.forEach(([f0, kind, pos, s]) => { if (f >= f0) { const k = pop(f, f0); out.push(CARD('inv' + kind + k, (p) => FX.item(p, kind), [pos[0], pos[1] + 0.0, pos[2]], s * k, { blob: true, shadow: true })); out.push(...puff(f, f0, [pos[0], pos[1] + 0.05, pos[2] + 0.1], 0.35)); } });
    const expr = f < 1128 ? 'determined' : f < 1180 ? 'neutral' : f < 1219 ? 'neutral' : f < 1290 ? 'sick' : f < 1329 ? 'neutral' : f < 1414 ? 'worried' : 'goofy';
    const pointX = [230, 280, 330, 380, 430][Math.max(0, cur - 1)];
    out.push(HERO(T, f, { expr, R: cur ? { x: pointX + 120, y: 640, b: 0.4 } : 'hip', L: f > 1219 && f < 1290 ? 'chin' : 'hip', turn: 0, look: cur ? -0.2 : 0 }, [3.3, 0, 7.55]));
    return out; },
  { dof: (f) => ({ focus: f < 1420 && f > 1140 ? 2.0 : 2.6, cinf: 10 }), flash: true });
shot('gummi', 1462, 1535, 'inside', [[1462, ...F(HK, 180, 'CU')], [1535, ...F(HK, 180, 'CU', { k: 0.9 }), 'lin']],
  (f, T) => [HERO(T, f, { expr: f < 1500 ? 'chew' : 'tired', R: f < 1500 ? { x: 360, y: 380, b: 0.6 } : 'up', holdR: 'gummy', L: f < 1500 ? 'belly' : 'up', bob: f < 1500 ? q(Math.abs(Math.sin(f * 0.8)) * 0.012, 3) : 0 }, [3.3, 0, 7.55])],
  { dof: [[3.3, 1.55, 7.55], 13] });
shot('sofa', 1535, 1620, 'inside', [[1535, ...F([-4.3, 0, 3.9], 180, 'FS', { fov: 50, h: 0.35 })], [1580, ...F([-4.3, 0, 3.9], 180, 'FS', { fov: 50, h: 0.35, k: 0.97 }), 'lin'], [1620, ...F([-3.2, 0, 7.4], 180, 'FS', { fov: 50, h: 0.35 }), 's']],
  (f, T) => { const k = smooth(ramp(f, 1580, 1620)); const sp = [-4.4 + 1.45 * k, 0, 4.2 + 4.15 * k];
    return [HERO(T, f, { back: true, L: { x: 200, y: 520, b: 0.3 }, R: { x: 400, y: 520, b: 0.3 }, legs: f > 1580 && f < 1620 ? 'walk' : 'stand', step: q(((f % 14) / 14)) }, [sp[0] + 0.05 * (1 - smooth(ramp(f, 1580, 1620))), 0, sp[2] - 1.05]),
      ...(f > 1582 && f < 1620 ? [FXC('sp' + (f % 4), (p) => FX.speed(p, 1), [sp[0] - 0.9, 0.6, sp[2] - 0.6], 0.5)] : [])]; },
  { dof: [[-4.0, 1.2, 6.0], 4], flash: true, w: (f) => ({ sofa: smooth(ramp(f, 1580, 1620)) }) });
shot('schrank', 1620, 1668, 'inside', [[1620, ...F([-1.6, 0, 0.8], 0, 'FS', { fov: 50, lx: 0.4 }), 'out'], [1640, ...F([-2.1, 0, 0.8], 0, 'FS', { fov: 50, lx: 0.4 }), 's'], [1668, ...F([-2.5, 0, 0.8], 0, 'FS', { fov: 50, k: 0.96, lx: 0.4 }), 'lin']],
  (f, T) => { const k = smooth(ramp(f, 1626, 1662)); return [HERO(T, f, { expr: 'angry', L: 'reach', R: 'reach', legs: k > 0 && k < 1 ? 'walk' : 'stand', step: q((f % 14) / 14), turn: -0.6, look: -1, tilt: -8 }, [-1.0 - 2.0 * k + 0.95, 0, 0.95])]; },
  { dof: [[-2.4, 1.1, 0.6], 4], w: (f) => ({ wardrobe: smooth(ramp(f, 1626, 1662)) }) });
shot('zeitung', 1668, 1709, 'inside', [[1668, ...F([-4.8, 0, 8.25], 200, 'FS', { fov: 46, k: 1.1 }), 'out'], [1680, ...F([-4.8, 0, 8.25], 200, 'FS', { fov: 46 }), 'out'], [1709, ...F([-4.8, 0, 8.25], 200, 'FS', { fov: 46, k: 0.96 }), 'lin']],
  (f, T) => [HERO(T, f, { expr: 'determined', L: 'up', R: 'up', turn: 0.5, look: 1, holdR: f < 1684 ? 'paper' : null }, [-4.25, 0, 8.25]), ...puff(f, 1684, [-5.4, 1.5, 8.7], 0.6)],
  { dof: [[-4.6, 1.4, 8.25], 6], w: (f) => ({ paper: f >= 1684 }) });
shot('rambo', 1709, 1840, 'inside', [[1709, ...F(HR, 90, 'FS', { fov: 50, h: -0.3 }), 'out', 0], [1790, ...F(HR, 90, 'FS', { fov: 50, h: -0.3, k: 0.95 }), 'lin', 0], [1798, ...F(HR, 90, 'MS', { fov: 50, h: -0.75, dy: 0.15 }), 'out', -6], [1840, ...F(HR, 90, 'MS', { fov: 50, h: -0.75, dy: 0.15, k: 0.95 }), 'lin', -7]],
  (f, T) => { const ra = f >= 1796; return [HERO(T, f, { expr: ra ? 'determined' : f > 1737 ? 'sly' : 'neutral', bandana: ra, R: f > 1737 ? 'up' : 'hang', holdR: f > 1737 ? 'panUp' : null, L: f > 1760 ? 'reach' : 'hang', holdL: f > 1760 ? 'broom' : null }, [-3.6, 0, 5.2]),
    ...burst(f, 1796, [-3.6, 1.5, 5.0], 1.4, '#ffd040', 14), ...burst(f, 1737, [-3.2, 2.2, 5.3], 0.5, '#ffffff', 8)]; },
  { dof: [[-3.6, 1.5, 5.2], 9], w: { paper: 1 } });
shot('slippers', 1840, 1905, 'inside', [[1840, [-2.6, 0.5, 5.55], [-3.6, 1.6, 5.2], 44, 's', -7], [1858, [-2.7, 0.35, 5.55], [-3.6, 0.2, 5.2], 42, 'out', 0], [1905, [-2.75, 0.33, 5.5], [-3.6, 0.2, 5.2], 40, 'lin', 0]],
  (f, T) => [HERO(T, f, { expr: 'determined', bandana: true, R: 'up', holdR: 'panUp', L: 'reach', holdL: 'broom', step: q((f % 20) / 20), bob: 0 }, [-3.6, 0, 5.2]),
    ...(f > 1870 ? [FXC('cr' + q((f % 10) / 10, 1), (p) => T_.fxCreak(p, (f % 10) / 10), [-3.3, 0.35, 5.3], 0.3)] : [])],
  { dof: [[-3.6, 0.3, 5.2], 10], w: { paper: 1 } });
shot('strom', 1905, 1964, (f) => (f < 1915 ? 'inside' : 'dark'), [[1905, ...F([-3.0, 0, 4.0], 60, 'MS', { fov: 44 })], [1964, ...F([-3.0, 0, 4.0], 60, 'MS', { fov: 44, k: 0.92 }), 'lin']],
  (f, T) => [HERO(T, f, { expr: f < 1915 ? 'happy' : 'shock', turn: f < 1915 ? 0.6 : 0, look: f < 1915 ? 1 : 0, L: 'hang', R: 'hang' }, [-3.0, 0, 4.0]), ...burst(f, 1916, [-3.4, 2.3, 4.4], 0.5, '#ffffff', 8)],
  { dof: [[-3.0, 1.5, 4.0], 9], w: (f) => ({ paper: 1, power: f < 1915 ? 1 : 0, tv: f < 1915 }) });
shot('netz', 1964, 2055, 'dark', [[1964, [-2.0, 1.5, 4.3], [-3.0, 1.45, 4.0], 38], [2055, [-2.05, 1.5, 4.25], [-3.0, 1.45, 4.0], 36, 'lin']],
  (f, T, C) => [HERO(T, f, { expr: 'sad', R: { x: 470, y: 470, b: 0.5 }, L: 'hang' }, [-3.0, 0, 4.0]), screenCard(C, 'nonet', (p) => FX.phone(p, 'nonet', 0, { time: '19:40' }), 0.55)],
  { dof: () => ({ focus: 0.55, cinf: 12 }), flash: true, w: { paper: 1, power: 0 } });
shot('apokalypse', 2055, 2155, 'red', [[2055, ...F([-3.0, 0, 4.0], 180, 'MCU', { fov: 34 }), 's', 0], [2085, ...F([-3.0, 0, 4.0], 180, 'CU', { fov: 22 }), 'out', 5], [2155, ...F([-3.0, 0, 4.0], 180, 'CU', { fov: 18, k: 0.95 }), 'lin', 5]],
  (f, T) => [HERO(T, f, { expr: 'scared', L: 'chin', R: 'chin', tilt: q(1.5 * Math.sin(f * 2), 1) }, [-3.0, 0, 4.0]), ...burst(f, 2100, [-3.0, 1.55, 3.8], 1.6, '#ff8a6a', 16)],
  { dof: [[-3.0, 1.55, 4.0], 6], w: { paper: 1, power: 0 } });
shot('wanne', 2155, 2241, 'dark', [[2155, ...F([5.0, -0.35, 1.2], 20, 'MS', { fov: 46, dy: -0.1 })], [2241, ...F([5.0, -0.35, 1.2], 20, 'MS', { fov: 46, dy: -0.1, k: 0.9 }), 'lin']],
  (f, T) => [HERO(T, f, { expr: 'worried', legs: 'crouch', R: { x: 520, y: 520, b: 0.5 }, L: 'hang', turn: 0.4, look: 0.8 }, [4.55, -0.35, 1.4]),
    FXC('drop' + (f % 15), (p) => FX.drop(p), [6.3, 0.62 - (f % 15) * 0.02, 0.36], 0.08)],
  { dof: [[5.2, 0.7, 1.0], 8], flash: true, w: (f) => ({ paper: 1, power: 0, tub: 0.35 + 0.15 * ramp(f, 2155, 2241) }) });
shot('striche', 2241, 2430, 'dark', [[2241, ...F([-6.3, 0, 6.1], 60, 'FS', { fov: 44, dy: 0.25 })], [2380, ...F([-6.3, 0, 6.1], 60, 'FS', { fov: 44, dy: 0.25, k: 0.93 }), 'lin'], [2402, ...F([-6.9, 0, 4.3], 90, 'WS', { fov: 50, k: 1.1, dy: 0.3 }), 'out'], [2430, ...F([-6.9, 0, 4.3], 90, 'WS', { fov: 50, k: 1.08, dy: 0.3 }), 'lin']],
  (f, T) => { const draw = f > 2280 && f < 2365; return [HERO(T, f, { expr: f < 2392 ? 'determined' : 'tired', L: draw ? { x: 40 + Math.sin(f * 0.9) * 20, y: 140, b: 0.6 } : 'hang', holdL: 'marker', R: 'hip', turn: -0.6, look: -1 }, [-6.15, 0, 5.75], { flip: false })]; },
  { dof: (f) => (f < 2390 ? { focus: 2.6, cinf: 8 } : { focus: 5.4, cinf: 2 }), flash: true, w: (f) => ({ paper: 1, power: 0, tally: clamp((f - 2280) / 85) * 7 }) });

// ===== 3 · WOCHE 2–4 =====
shot('hunger', 2430, 2688, 'dark', [[2430, ...F(HK, 180, 'MS', { fov: 48 })], [2580, ...F(HK, 180, 'MS', { fov: 48, k: 0.95 }), 'lin'], [2592, ...F(HK, 180, 'MCU'), 'out'], [2688, ...F(HK, 180, 'MCU', { k: 0.9 }), 'lin']],
  (f, T) => [CARD('emptyN', (p) => FX.item(p, 'nudeln', { empty: true }), [2.7, 0.84, 6.5], 0.3, { blob: true, shadow: true }),
    CARD('emptyM', (p) => { p.g.save(); p.g.translate(300, 975); p.g.rotate(1.4); p.g.translate(-300, -975); FX.item(p, 'mais'); p.g.restore(); }, [3.85 + Math.min(0.25, Math.max(0, (f - 2560) * 0.004)), 0.84, 6.45], 0.22, { blob: true }),
    HERO(T, f, { expr: f < 2586 ? 'sad' : f < 2655 ? 'chew' : 'sick', R: f >= 2586 ? { x: 360, y: 400, b: 0.6 } : 'hang', holdR: f >= 2586 && f < 2655 ? 'bread' : null, L: f >= 2655 ? 'belly' : 'hang' }, [3.3, 0, 7.55], {}, f >= 2655 ? { headCol: '#d4ecb8' } : {})],
  { dof: (f) => ({ focus: f < 2590 ? 2.5 : 1.4, cinf: 11 }), flash: true, w: { paper: 1, power: 0, paperK: 1 } });
shot('raus', 2688, 2726, 'dark', [[2688, ...F(HK, 180, 'CU', { fov: 34 }), 's', 0], [2700, ...F(HK, 180, 'CU', { fov: 34, k: 0.85 }), 'out', 5], [2726, ...F(HK, 180, 'CU', { fov: 34, k: 0.8 }), 'lin', 6]],
  (f, T) => [HERO(T, f, { expr: 'determined', L: 'hang', R: 'hang' }, [3.3, 0, 7.55]), ...burst(f, 2692, [3.3, 1.55, 7.3], 1.2, '#ffe080', 10)],
  { dof: [[3.3, 1.55, 7.55], 15], w: { paper: 1, power: 0 } });
shot('schmidtTag', 2726, 2863, 'day', [[2726, ...F([-4.6, 0, 20.5], 180, 'FS', { fov: 40, k: 1.15 })], [2863, ...F([-1.0, 0, 21.0], 180, 'FS', { fov: 40, k: 1.15 }), 'lin']],
  (f, T) => { const w = walk(f, 2730, 2860, [-5.0, 0, 20.4], [-0.6, 0, 21.0], 30);
    return [ACT(T, SCHMIDT, { expr: 'happy', legs: w.moving ? 'walk' : 'stand', step: w.step, L: 'hang', R: 'hang', holdL: 'shopbag', holdR: 'shopbag', turn: 0.4, look: 1, bob: w.moving ? q(Math.abs(Math.sin(f * 0.21)) * 0.012, 3) : 0 }, w.pos)]; },
  { dof: [[-2.5, 1.5, 20.6], 4], flash: true });
shot('schmidtDunkel', 2863, 2941, 'dusk', [[2863, [-0.2, 1.7, 15.0], [0.0, 2.6, 22.0], 44], [2941, [-0.2, 1.65, 15.6], [0.0, 2.7, 22.0], 40, 'lin']],
  (f, T) => [], { dof: [[0, 2.5, 22], 2] });
shot('nachts', 2941, 3083, 'dark', [[2941, ...F([-3.0, 0, 8.2], 180, 'MCU')], [3044, ...F([-3.0, 0, 8.2], 180, 'MCU', { k: 0.85 }), 'lin'], [3083, ...F([-3.0, 0, 8.2], 180, 'MCU', { k: 0.8 }), 'lin']],
  (f, T) => { const beat = f >= 3044 ? 1 + 0.25 * Math.max(0, Math.sin(f * 0.9)) ** 8 : 0;
    return [HERO(T, f, { expr: 'scared', R: { x: 480, y: 380, b: 0.5 }, holdR: 'pan', L: 'belly' }, [-3.0, 0, 8.2]), ...(beat ? [FXC('heart' + q(beat, 1), (p) => FX.heart(p, beat), [-2.85, 1.0, 8.0], 0.18)] : [])]; },
  { dof: [[-3.0, 1.5, 8.2], 10], flash: true, w: { paper: 1, power: 0, sofa: 1 } });
shot('zaun', 3083, 3196, 'night', [[3083, ...F([-5.0, 0, 11.0], 0, 'FS', { fov: 44 })], [3133, ...F([-5.0, 0, 11.0], 0, 'FS', { fov: 44, k: 0.95 }), 'lin'], [3143, ...F([-5.0, 0, 11.0], 0, 'MS', { fov: 44, dy: -0.2 }), 'out'], [3196, ...F([-5.0, 0, 11.0], 0, 'MS', { fov: 44, dy: -0.2, k: 0.95 }), 'lin']],
  (f, T) => { const up = smooth(ramp(f, 3086, 3120)), hang = f >= 3133;
    return [HERO(T, f, hang ? { expr: f < 3167 ? 'scared' : 'tired', R: 'up', holdR: 'pan', L: 'reach', legs: 'stand', headTilt: 20 } : { expr: 'determined', legs: 'crouch', R: 'up', holdR: 'pan', L: 'reach' },
      hang ? [-5.25, 0.45, 11.12] : [-5.0, -0.3 + up * 0.75, 10.6 + up * 0.5], { roll: hang ? -0.55 : 0 }), ...(hang && f < 3150 ? [FXC('rip' + q((f - 3133) / 17, 1), (p) => T_.fxStars(p, (f - 3133) / 17), [-4.6, 0.9, 11.3], 0.3)] : [])]; },
  { dof: [[-5.0, 0.9, 11.0], 8], flash: true, w: { paper: 1, power: 0, sofa: 1 } });
shot('strasse', 3196, 3288, 'night', [[3196, [5.2, 0.95, 11.4], [-0.5, 1.3, 15.6], 36], [3288, [5.0, 0.95, 11.5], [-0.5, 1.3, 15.6], 32, 'lin']],
  (f, T) => [ACT(T, ZOMBIES[1], { ...ZOMBIE_POSE(f, 1), legs: 'stand', tilt: q(8 * Math.sin(f * 0.12), 1), expr: 'zombie' }, [-0.5, 0, 15.6]), ...(f > 3260 ? moanFx(f, [-0.2, 2.1, 15.6], 0.3) : [])],
  { dof: [[-0.5, 1.4, 15.6], 6], w: { paper: 1, power: 0, sofa: 1 } });
shot('hecke', 3288, 3436, 'night', [[3288, ...F([2.8, -0.15, 10.4], 0, 'FS', { fov: 40 })], [3360, ...F([2.8, -0.15, 10.4], 0, 'FS', { fov: 40, k: 0.92 }), 'lin'], [3372, ...F([3.2, -0.15, 10.35], 0, 'MCU', { fov: 36 }), 'out'], [3436, ...F([3.2, -0.15, 10.35], 0, 'MCU', { fov: 36, k: 0.93 }), 'lin']],
  (f, T) => { const zx = f < 3398 ? 1.2 : 1.2 - (f - 3398) * 0.03;
    return [HERO(T, f, { expr: f < 3330 ? 'scared' : 'chew', L: 'hang', R: 'hang' }, [3.2, 0.25, 10.3], { blob: false }, f > 3362 ? { headCol: '#cfe0ff' } : {}),
      ACT(T, ZOMBIES[1], { ...ZOMBIE_POSE(f, 1), legs: f > 3398 ? 'walk' : 'stand', tilt: q(6 * Math.sin(f * 0.12), 1) }, [zx, 0, 12.6], { flip: true }), ...(f < 3398 ? moanFx(f, [zx + 0.3, 2.1, 12.6], 0.28) : [])]; },
  { dof: [[3.2, 1.2, 10.35], 9], w: { paper: 1, power: 0, sofa: 1 } });
shot('hintertuer', 3436, 3495, 'night', [[3436, [9.0, 1.5, 23.6], [6.0, 1.2, 25.8], 44], [3495, [8.7, 1.5, 24.0], [6.0, 1.2, 25.8], 40, 'lin']],
  (f, T) => [HERO(T, f, { expr: 'sly', legs: 'walk', step: q((f % 26) / 26), R: 'up', holdR: 'pan', L: 'hang', turn: -0.5, look: -1 }, [7.2 - (f - 3436) * 0.012, 0, 25.4])],
  { dof: [[6.8, 1.3, 25.6], 7], flash: true, w: { sBack: 1, paper: 1, power: 0, sofa: 1 } });
shot('keller', 3495, 3718, 'cellar', [[3495, ...F([79.6, 0, 0.2], 10, 'FS', { fov: 50 })], [3530, ...F([79.6, 0, 0.2], 10, 'FS', { fov: 50, k: 0.95 }), 'lin'], [3545, [80.6, 1.5, 2.9], [79.6, 1.3, -2.6], 56, 'out'], [3670, [80.4, 1.5, 2.8], [80.6, 1.2, -2.6], 56, 's'], [3690, [80.6, 1.0, 0.4], [80.9, 0.55, -1.6], 44, 'out'], [3718, [80.6, 1.0, 0.3], [80.9, 0.55, -1.6], 42, 'lin']],
  (f, T) => [HERO(T, f, { expr: f < 3527 ? 'neutral' : f < 3684 ? 'shock' : 'goofy', R: f < 3684 ? 'up' : { x: 470, y: 460, b: 0.4 }, holdR: f < 3684 ? 'pan' : null, L: f < 3527 ? 'hang' : 'up' }, [79.3, 0, 0.4]),
    ...burst(f, 3527, [79.3, 1.6, 0.2], 1.0, '#fff3b0', 12), ...burst(f, 3721, [80.9, 0.8, -1.4], 0.6, '#ffffff', 10)],
  { dof: (f) => (f < 3690 ? { focus: 3.0, cinf: 5 } : { focus: 1.9, cinf: 10 }), flash: true });
shot('schleppen', 3718, 3814, 'night', [[3718, [-2.0, 6.5, 6.5], [0.5, 0.5, 16.5], 50], [3814, [-1.8, 6.3, 7.0], [0.5, 0.5, 16.5], 48, 'lin']],
  (f, T) => { const ph = ((f - 3718) % 32) / 32, dir = ph < 0.5 ? 1 : -1, z = ph < 0.5 ? lerp(21, 11.6, ph * 2) : lerp(11.6, 21, (ph - 0.5) * 2);
    return [HERO(T, f, { expr: 'goofy', legs: 'walk', step: q((f % 8) / 8), R: { x: 470, y: 520, b: 0.4 }, holdR: dir > 0 ? 'cans' : null, L: 'up', tilt: 10 * dir }, [0.5, 0, z], { s: 1.0 }), FXC('spd' + (f % 3), (p) => FX.speed(p, 1), [0.5, 0.8, z + dir * 0.8], 0.6), ...puff(f, f - ((f - 3718) % 8), [0.5, 0.1, z], 0.5, 8)]; },
  { dof: [[0.5, 1.0, 16.0], 2], flash: true, w: { paper: 1, power: 0, sofa: 1 } });
shot('lachen', 3814, 4005, 'dark', [[3814, [-2.0, 1.25, 6.5], [-3.6, 0.9, 5.0], 44], [3930, [-2.1, 1.2, 6.4], [-3.6, 0.9, 5.0], 42, 'lin'], [3942, [-2.7, 1.15, 5.8], [-3.6, 1.0, 5.0], 34, 'out'], [4005, [-2.75, 1.15, 5.75], [-3.6, 1.0, 5.0], 33, 'lin']],
  (f, T) => [CARD('pile', (p) => FX.item(p, 'cans'), [-4.4, 0, 4.6], 0.75, { blob: true, shadow: true }), CARD('tps', (p) => FX.item(p, 'tp'), [-2.6, 0, 4.4], 0.55, { blob: true }),
    HERO(T, f, f < 3934 ? { expr: 'laugh', legs: 'sit', L: 'belly', R: 'belly', bob: q(Math.abs(Math.sin(f * 0.6)) * 0.03, 3), tilt: q(6 * Math.sin(f * 0.3), 1) } : { expr: 'proud', legs: 'sit', R: 'up', L: 'hang', holdL: null }, [-3.6, -0.6, 5.0], { blob: false })],
  { dof: [[-3.6, 1.0, 5.0], 9], flash: true, w: { paper: 1, power: 0, sofa: 1 } });

// ===== 4 · MONAT 2–5 =====
shot('zeit', 4005, 4109, 'inside', [[4005, ...F([3.3, 0, 5.75], 0, 'MS', { fov: 46, dy: 0.25 })], [4109, ...F([3.3, 0, 5.75], 0, 'MS', { fov: 46, dy: 0.25, k: 0.93 }), 'lin']],
  (f, T) => [HERO(T, f, { expr: 'tired', legs: 'sit', L: { x: 260, y: 360, b: 1.2 }, R: { x: 340, y: 360, b: 1.2 }, headTilt: -6 }, [3.3, 0.0, 5.75], { blob: false })],
  { dof: [[3.3, 1.5, 5.6], 4], flash: true, w: (f) => ({ paper: 1, power: 0, sofa: 1, paperK: 0.35, clock: 7 + (f - 4005) * 0.25 }) });
shot('gisela', 4109, 4333, 'inside', [[4109, ...F([3.1, 0, 6.1], -20, 'MS', { fov: 44, dy: -0.1 })], [4200, ...F([3.1, 0, 6.1], -20, 'MS', { fov: 44, dy: -0.1, k: 0.95 }), 'lin'], [4212, ...F([3.1, 0, 6.1], -20, 'MS', { fov: 44, dy: -0.1, k: 0.82 }), 'out'], [4333, ...F([3.1, 0, 6.1], -20, 'MS', { fov: 44, dy: -0.1, k: 0.78 }), 'lin']],
  (f, T) => [GIS([2.75, 0.84, 6.55], 0.45, Math.sin(f * 0.1) * (f > 4245 && f < 4285 ? 2 : 0.4)),
    HERO(T, f, { expr: f < 4200 ? (f % 40 < 20 ? 'happy' : 'laugh') : f < 4245 ? 'proud' : f < 4288 ? 'happy' : 'smug', legs: 'sit', turn: -0.6, look: -1, L: f < 4245 ? { x: 120, y: 520, b: 0.4 } : 'hang', R: f % 50 < 25 ? 'wave' : 'hip' }, [3.5, 0.0, 5.75], { blob: false })],
  { dof: [[3.1, 1.2, 6.2], 11], w: { paper: 1, power: 0, sofa: 1, paperK: 0.35 } });
shot('uhr', 4333, 4383, 'morning', [[4333, [3.3, 1.95, 5.6], [3.3, 2.05, 4.62], 34], [4383, [3.3, 1.95, 5.5], [3.3, 2.05, 4.62], 32, 'lin']],
  (f, T) => [], { dof: [[3.3, 2.05, 4.62], 6], flash: true, w: { paper: 1, power: 0, sofa: 1, paperK: 0.35, clock: 7 } });
const GWALK = (f, f0, f1, x0, x1, z = 11.9) => { const w = walk(f, f0, f1, [x0, 0, z], [x1, 0, z], 40); return w; };
shot('guenther', 4383, 4617, 'morning', [[4383, ...F([6.5, 0, 11.9], 0, 'FS', { fov: 40, h: -0.2, k: 1.1 })], [4617, ...F([2.5, 0, 11.9], 0, 'FS', { fov: 40, h: -0.2, k: 1.1 }), 'lin']],
  (f, T) => { const w = GWALK(f, 4383, 4617, 8.5, 0.5);
    return [ACT(T, GUENTHER, { ...GUENTHER_POSE, legs: 'walk', step: w.step }, w.pos, { flip: true }), ...moanFx(f, [w.pos[0] - 0.4, 2.0, w.pos[2]], 0.28),
      HERO(T, f, { expr: 'worried', L: 'hang', R: 'hang', turn: 0.5, look: 1 }, [3.2, 0, 8.45])]; },
  { dof: [[4.5, 1.4, 11.9], 6], w: { paper: 1, power: 0, sofa: 1, paperK: 0.35 } });
shot('winken', 4617, 4766, 'morning', [[4617, ...F([3.2, 0, 8.45], 0, 'MS', { fov: 26, h: 0.6 })], [4766, ...F([3.2, 0, 8.45], 0, 'MS', { fov: 26, h: 0.6, k: 0.9 }), 'lin']],
  (f, T) => { const w = GWALK(f, 4617, 4766, 4.6, 1.0);
    return [HERO(T, f, { expr: f < 4660 ? 'happy' : f < 4698 ? 'goofy' : f < 4736 ? 'neutral' : 'smug', R: f >= 4660 && f < 4730 ? (f % 12 < 6 ? 'wave' : 'up') : 'hang', L: 'hang', turn: 0.3, look: 0.5 }, [3.2, 0, 8.45]),
      ACT(T, GUENTHER, { ...GUENTHER_POSE, legs: 'walk', step: w.step }, [w.pos[0], 0, 11.6], { flip: true }), ...moanFx(f, [w.pos[0] - 0.4, 2.0, 11.6], 0.25)]; },
  { dof: [[3.7, 1.5, 8.4], 8], w: { paper: 1, power: 0, sofa: 1, paperK: 0.35 } });
shot('garten', 4766, 5037, 'summer', [[4766, ...F([0.5, -0.35, -7.2], 0, 'FS', { fov: 46 })], [4900, ...F([0.5, -0.35, -7.2], 0, 'FS', { fov: 46, k: 0.93 }), 'lin'], [4912, ...F([0.5, -0.35, -7.2], 0, 'MS', { fov: 44 }), 'out'], [5037, ...F([0.5, -0.35, -7.2], 0, 'MS', { fov: 44, k: 0.93 }), 'lin']],
  (f, T) => [HERO(T, f, { expr: f < 4905 ? 'happy' : f < 4980 ? 'proud' : 'goofy', legs: 'crouch', R: f >= 4905 && f < 4980 ? { x: 470, y: 400, b: 0.5 } : 'reach', holdR: f >= 4905 && f < 4980 ? 'seeds' : null, L: f >= 4980 ? 'up' : 'hang', holdL: null }, [0.5, -0.35, -7.2])],
  { dof: (f) => ({ focus: f < 4905 ? 5 : 2.4, cinf: f < 4905 ? 5 : 9 }), flash: true, w: (f) => ({ paper: 1, power: 0, sofa: 1, wardrobe: 2, door: 0, garden: 0.25 + 0.2 * ramp(f, 4766, 5037), paperK: 0.35 }) });
shot('tomaten', 5037, 5158, 'summer', [[5037, ...F([-0.1, -0.35, -6.0], 10, 'MCU', { fov: 40 })], [5158, ...F([-0.1, -0.35, -6.0], 10, 'MCU', { fov: 40, k: 0.9 }), 'lin']],
  (f, T) => [HERO(T, f, { expr: f < 5100 ? 'happy' : 'cry', tear: f > 5100 ? q(((f - 5100) % 30) / 30, 1) : 0, legs: 'crouch', L: 'chin', R: 'reach', turn: -0.4, look: -0.5 }, [0.25, -0.35, -6.0])],
  { dof: [[-0.5, 0.75, -6.0], 13], w: { paper: 1, power: 0, sofa: 1, wardrobe: 2, garden: 0.85, tomBig: 0.45, paperK: 0.35 } });
shot('regen', 5158, 5214, 'rain', [[5158, ...F([5.2, 0, -1.6], 200, 'FS', { fov: 46 })], [5214, ...F([5.2, 0, -1.6], 200, 'FS', { fov: 46, k: 0.93 }), 'lin']],
  (f, T, C) => [HERO(T, f, { expr: 'happy', L: 'up', R: 'up', turn: 0.3, look: 0.6 }, [4.4, 0, -1.0]), ...screenRow(C, 'rain' + (f % 20), (p) => FX.weather(p, 'rain', f), 1.2)],
  { dof: [[5.4, 0.6, -1.6], 3], flash: true, w: (f) => ({ paper: 1, power: 0, sofa: 1, wardrobe: 2, garden: 0.9, rainLvl: 0.4 + 0.5 * ramp(f, 5158, 5214), paperK: 0.35 }) });
shot('grill', 5214, 5287, 'summer', [[5214, ...F([-4.3, 0, -1.1], 200, 'MS', { fov: 44 })], [5287, ...F([-4.3, 0, -1.1], 200, 'MS', { fov: 44, k: 0.92 }), 'lin']],
  (f, T) => [HERO(T, f, { expr: 'proud', R: { x: 140, y: 560, b: 0.4 }, holdR: 'spoon', L: 'hip', turn: -0.4, look: -0.8 }, [-4.0, 0, -0.9]), FXC('smk' + q((f % 24) / 24, 1), (p) => T_.fxPuff(p, (f % 24) / 24), [-4.6, 1.0 + (f % 24) * 0.02, -1.4], 0.5)],
  { dof: [[-4.3, 1.1, -1.2], 8], w: { paper: 1, power: 0, sofa: 1, wardrobe: 2, garden: 0.9, grill: 1, paperK: 0.35 } });
shot('bauer', 5287, 5441, 'summer', [[5287, ...F([0, 0, -6.0], 0, 'FS', { fov: 44 })], [5370, ...F([0, 0, -6.0], 0, 'FS', { fov: 44, k: 0.93 }), 'lin'], [5400, [3.5, 5.5, 3.0], [0.0, 0.5, -6.5], 52, 'out'], [5441, [3.6, 5.8, 3.4], [0.0, 0.5, -6.5], 52, 'lin']],
  (f, T) => [HERO(T, f, { expr: f < 5340 ? 'proud' : 'smug', R: 'reach', holdR: 'hoe', L: 'hip', turn: 0.2 }, [0.0, 0, -6.0])],
  { dof: (f) => ({ focus: 2.6, cinf: f < 5390 ? 9 : 1 }), w: { paper: 1, power: 0, sofa: 1, wardrobe: 2, garden: 1, tomBig: 1, grill: 1, paperK: 0.35 } });

// ===== 5 · MONAT 6–11 =====
const WINTER = { paper: 1, power: 0, sofa: 1, snow: 1, paperK: 0.35, garden: 0 };
shot('winter', 5441, 5533, 'winter', [[5441, [-1.0, 1.4, 19.5], [-1.0, 2.5, 8.0], 46], [5533, [-1.0, 1.4, 18.5], [-1.0, 2.4, 8.0], 42, 'lin']],
  (f, T, C) => screenRow(C, 'snow' + (f % 60), (p) => FX.weather(p, 'snow', f), 1.5), { dof: [[-1, 2, 9], 2], flash: true, w: WINTER });
shot('heizen', 5533, 5804, 'fire', [[5533, ...F([-5.6, 0, 1.6], 50, 'FS', { fov: 46 })], [5620, ...F([-5.6, 0, 1.6], 50, 'FS', { fov: 46, k: 0.95 }), 'lin'], [5632, ...F([-5.6, 0, 1.7], 50, 'MS', { fov: 46, dy: -0.15 }), 'out'], [5770, ...F([-5.6, 0, 1.7], 50, 'MS', { fov: 46, dy: -0.15, k: 0.94 }), 'lin'], [5780, ...F([-5.3, 0, 1.9], 50, 'MS', { fov: 46 }), 'out'], [5804, ...F([-5.3, 0, 1.9], 50, 'MS', { fov: 46, k: 0.96 }), 'lin']],
  (f, T) => { const plank = f >= 5625 && f < 5722, leg = f >= 5722 && f < 5774, salute = f >= 5774;
    return [HERO(T, f, { expr: salute ? 'proud' : 'determined', blanket: true, legs: salute ? 'stand' : 'crouch', R: salute ? { x: 420, y: 120, b: 1 } : { x: 120, y: 560, b: 0.4 }, holdR: plank ? 'plank' : leg ? 'broom' : null, L: 'hang', turn: salute ? 0 : -0.5, look: salute ? 0 : -1 }, [-5.3, salute ? 0 : -0.35, 1.9]),
      FXC('flame' + (f % 10), (p) => FX.flame(p, f / 30), [-6.2, 0.22, 1.29], 0.17), ...puff(f, 5640, [-6.0, 0.6, 1.4], 0.4), ...puff(f, 5730, [-6.0, 0.6, 1.4], 0.4)]; },
  { dof: [[-5.6, 1.0, 1.6], 10], flash: true, w: (f) => ({ ...WINTER, fire: 1, billy: f < 5715, table: f < 5722 }) });
shot('bart', 5804, 5914, 'fire', [[5804, ...F([-5.3, 0, 1.9], 50, 'CU')], [5914, ...F([-5.3, 0, 1.9], 50, 'CU', { k: 0.9 }), 'lin']],
  (f, T) => [HERO(T, f, { expr: f < 5860 ? 'tired' : 'goofy', blanket: true, L: 'hang', R: 'hang', look: f > 5860 ? -0.4 : 0 }, [-5.3, 0, 1.9]),
    ...(f >= 5850 ? [FXC('bird' + q(((f - 5850) % 20) / 20, 1), (p) => FX.roundBird(p, (f - 5850) / 30), [-5.25 + 0.0, lerp(1.9, 1.05, smooth(ramp(f, 5850, 5866))), 2.15], 0.12), ...(f > 5870 ? notes(f, [-5.1, 1.45, 2.2], 2, 0.1) : [])] : [])],
  { dof: [[-5.3, 1.3, 1.9], 13], w: { ...WINTER, fire: 1, billy: false, table: false } });
shot('talkshow', 5914, 6025, 'fire', [[5914, ...F([-4.4, 0, 2.8], 30, 'MS', { fov: 44 })], [6025, ...F([-4.4, 0, 2.8], 30, 'MS', { fov: 44, k: 0.92 }), 'lin']],
  (f, T) => [CARD('desk', (p) => FX.item(p, 'deskbox'), [-4.3, 0, 2.95], 0.6, { blob: true, shadow: true, order: 3 }), GIS([-3.8, 0.66, 3.0], 0.35, Math.sin(f * 0.2)),
    HERO(T, f, { expr: f % 46 < 23 ? 'laugh' : 'sly', blanket: true, R: { x: 420, y: 380, b: 0.6 }, holdR: 'spoon', L: f % 30 < 15 ? 'wave' : 'hip', turn: 0.3, look: 0.6 }, [-4.6, 0, 2.6])],
  { dof: [[-4.3, 1.3, 2.8], 9], w: { ...WINTER, fire: 1, billy: false, table: false } });
shot('geburtstag', 6025, 6284, 'fire', [[6025, ...F([-3.5, -0.6, 5.0], 60, 'MS', { fov: 44 })], [6200, ...F([-3.5, -0.6, 5.0], 60, 'MS', { fov: 44, k: 0.88 }), 'lin'], [6284, ...F([-3.5, -0.6, 5.0], 60, 'MS', { fov: 44, k: 0.8 }), 'lin']],
  (f, T) => [CARD('cake' + (f % 12), (p) => FX.item(p, 'cakecan', { t: f / 30 }), [-3.3, 0, 5.35], 0.3, { blob: true, order: 3 }), FXC('cglow', (p) => T_.fxGlow(p, '255,200,120', 0.8), [-3.3, 0.0, 5.45], 0.3, { order: 2 }),
    HERO(T, f, { expr: f < 6211 ? 'sing' : 'sad', blanket: true, legs: 'sit', L: f >= 6211 ? { x: 300, y: 330, b: 1 } : 'hang', R: 'hang' }, [-3.7, -0.6, 4.8], { blob: false }),
    ...(f < 6211 ? notes(f, [-3.5, 1.4, 4.9], 2, 0.1) : [])],
  { dof: [[-3.4, 0.8, 5.2], 11], flash: true, w: { ...WINTER, billy: false, table: false } });
shot('mama', 6284, 6332, 'sad', [[6284, ...F([3.7, -0.6, 8.4], 180, 'MS')], [6332, ...F([3.7, -0.6, 8.4], 180, 'MS', { k: 0.95 }), 'lin']],
  (f, T) => [HERO(T, f, { expr: 'sad', blanket: true, legs: 'sit', R: { x: 380, y: 500, b: 0.5 }, holdR: 'phone', L: 'hang' }, [3.7, -0.6, 8.4], { blob: false })],
  { dof: [[3.7, 0.9, 8.4], 10], flash: true, w: { ...WINTER, billy: false, table: false } });
shot('nachricht', 6332, 6422, 'sad', [[6332, ...F([3.7, -0.6, 8.4], 180, 'MS', { k: 0.9 })], [6422, ...F([3.7, -0.6, 8.4], 180, 'MS', { k: 0.87 }), 'lin']],
  (f, T, C) => [HERO(T, f, { expr: 'sad', blanket: true, legs: 'sit', R: 'hang', L: 'hang' }, [3.7, -0.6, 8.4], { blob: false }), screenCard(C, 'oldchat', (p) => FX.phone(p, 'oldchat', 0, { time: '03:12' }), 0.55)],
  { dof: () => ({ focus: 0.55, cinf: 12 }), w: { ...WINTER, billy: false, table: false } });
shot('weh', 6422, 6571, 'sad', [[6422, ...F([3.7, -0.6, 8.4], 180, 'MCU')], [6571, ...F([3.7, -0.6, 8.4], 180, 'CU', { k: 0.95 }), 'lin']],
  (f, T) => [HERO(T, f, { expr: 'sad', blanket: true, legs: 'sit', R: { x: 380, y: 500, b: 0.5 }, holdR: 'phone', L: 'hang', headTilt: -5, tear: f > 6468 ? q(clamp((f - 6468) / 80), 1) : 0 }, [3.7, -0.6, 8.4], { blob: false })],
  { dof: [[3.7, 1.0, 8.4], 13], w: { ...WINTER, billy: false, table: false } });
shot('liegestuetze', 6571, 6648, 'winter', [[6571, ...F([-4.4, -0.6, 4.0], 90, 'FS', { fov: 50 })], [6648, ...F([-4.4, -0.6, 4.0], 90, 'FS', { fov: 50, k: 0.93 }), 'lin']],
  (f, T) => { const up = Math.abs(Math.sin((f - 6571) * 0.18)); return [HERO(T, f, { expr: 'determined', L: { x: 470, y: 420 + up * 40, b: 0.2 }, R: { x: 520, y: 440 + up * 40, b: 0.2 } }, [-4.4, 0.08, 5.2], { blob: false, roll: q(-1.2 - up * 0.1, 3) })]; },
  { dof: [[-3.6, 0.5, 5.2], 7], flash: true, w: { ...WINTER, billy: false, table: false } });
shot('striche2', 6648, 6684, 'winter', [[6648, [-4.3, 1.6, 4.3], [-6.9, 1.6, 4.3], 52], [6684, [-4.0, 1.6, 4.3], [-6.9, 1.6, 4.3], 50, 'lin']],
  (f, T) => [HERO(T, f, { expr: 'determined', R: { x: 140, y: 250, b: 0.6 }, holdR: 'marker', L: 'hip', turn: -0.6, look: -1 }, [-6.1, 0, 3.0])],
  { dof: [[-6.6, 1.5, 3.6], 4], w: (f) => ({ ...WINTER, billy: false, table: false, tally: lerp(270, 330, ramp(f, 6648, 6684)) }) });
shot('fruehling', 6684, 6795, 'spring', [[6684, [0.3, 1.4, -2.6], [0.0, 1.2, -6.0], 44], [6740, [0.3, 1.35, -3.0], [0.0, 1.3, -6.0], 40, 'lin'], [6750, [0.2, 0.7, -4.3], [0.0, 1.6, -6.0], 40, 'out', -4], [6795, [0.2, 0.68, -4.4], [0.0, 1.62, -6.0], 39, 'lin', -5]],
  (f, T) => [HERO(T, f, { expr: f < 6741 ? 'happy' : 'determined', L: f >= 6741 ? 'up' : 'hip', R: f >= 6741 ? 'up' : 'reach', holdR: f < 6741 ? 'hoe' : null }, [0.0, 0, -6.0]), ...burst(f, 6741, [0, 1.6, -6.2], 1.0, '#fff3b0', 12)],
  { dof: [[0, 1.4, -6.0], 8], flash: true, w: { paper: 1, power: 0, sofa: 1, wardrobe: 2, garden: 0.5, bloom: 1, billy: false, table: false, paperK: 0.35 } });
shot('uhr2', 6795, 6899, 'morning', [[6795, [3.3, 1.95, 5.6], [3.3, 2.05, 4.62], 34], [6899, [3.3, 1.95, 5.5], [3.3, 2.05, 4.62], 32, 'lin']],
  (f, T) => [], { dof: [[3.3, 2.05, 4.62], 6], flash: true, w: (f) => ({ paper: 1, power: 0, sofa: 1, billy: false, table: false, paperK: 0.35, clock: 7 + 5 / 60 * ramp(f, 6880, 6899) }) });
shot('sorgen', 6899, 7048, 'morning', [[6899, ...F([3.2, 0, 8.45], 0, 'MS', { fov: 26, h: 0.6 })], [6990, ...F([3.2, 0, 8.45], 0, 'MS', { fov: 26, h: 0.6, k: 0.9 }), 'lin'], [7000, [5.6, 1.4, 14.0], [3.2, 1.4, 10.0], 36, 'out'], [7048, [5.5, 1.4, 13.8], [3.2, 1.4, 10.0], 35, 'lin']],
  (f, T) => { const out = [HERO(T, f, { expr: f < 6995 ? 'worried' : 'happy', L: f < 6995 ? 'chin' : 'hang', R: f < 6995 ? 'chin' : 'wave', turn: f < 6995 ? q(0.5 * Math.sin(f * 0.08), 2) : 0.4, look: 0.8 }, [3.2, 0, 8.45])];
    if (f >= 6995) { const w = GWALK(f, 6995, 7048, 7.0, 5.4); out.push(ACT(T, GUENTHER, { ...GUENTHER_POSE, legs: 'walk', step: w.step }, w.pos, { flip: true }), ...moanFx(f, [w.pos[0] - 0.4, 2.0, w.pos[2]], 0.25)); }
    if (f < 6995) out.push(...(f % 40 < 20 ? [FXC('swt', (p) => FX.sweat(p), [3.9, 1.7, 8.6], 0.2)] : []));
    return out; },
  { dof: (f) => (f < 6995 ? { focus: 3.9, cinf: 8 } : { focus: 4.0, cinf: 6 }), w: { paper: 1, power: 0, sofa: 1, billy: false, table: false, paperK: 0.35 } });

// ===== 6 · TAG 365 =====
const D365 = { paper: 1, power: 0, billy: false, table: false, paperK: 0.35 };
shot('letzter', 7048, 7197, 'inside', [[7048, ...F([-6.2, 0, 2.4], 60, 'FS', { fov: 44, dy: 0.1 })], [7105, ...F([-6.2, 0, 2.4], 60, 'FS', { fov: 44, dy: 0.1, k: 0.93 }), 'lin'], [7120, ...F([-6.9, 0, 4.25], 90, 'WS', { fov: 52, k: 1.1, dy: 0.3 }), 'out'], [7197, ...F([-6.9, 0, 4.25], 90, 'WS', { fov: 52, k: 1.06, dy: 0.3 }), 'lin']],
  (f, T) => [HERO(T, f, { expr: f < 7110 ? 'determined' : 'tired', R: f < 7110 ? { x: 120 + Math.sin(f) * 10, y: 380, b: 0.6 } : 'hang', holdR: 'marker', L: 'hip', turn: -0.6, look: -1 }, [-6.0, 0, 2.6]), ...burst(f, 7100, [-6.85, 1.0, 1.85], 0.4, '#ffffff', 8)],
  { dof: (f) => (f < 7110 ? { focus: 2.6, cinf: 8 } : { focus: 5.6, cinf: 1 }), flash: true, w: (f) => ({ ...D365, sofa: 1, tally: lerp(364, 365, ramp(f, 7060, 7100)) }) });
shot('reicht', 7197, 7230, 'inside', [[7197, ...F([-6.0, 0, 2.6], 60, 'MCU'), 's', 0], [7210, ...F([-6.0, 0, 2.6], 60, 'CU'), 'out', 4], [7230, ...F([-6.0, 0, 2.6], 60, 'CU', { k: 0.93 }), 'lin', 5]],
  (f, T) => [HERO(T, f, { expr: 'determined', R: 'hang', L: 'hang' }, [-6.0, 0, 2.6])], { dof: [[-6.0, 1.55, 2.6], 14], w: { ...D365, sofa: 1, tally: 365 } });
shot('rucksack', 7230, 7349, 'inside', [[7230, ...F([-3.4, 0, 5.6], 90, 'FS', { fov: 50 })], [7349, ...F([-3.4, 0, 5.6], 90, 'FS', { fov: 50, k: 0.92 }), 'lin']],
  (f, T) => [HERO(T, f, { expr: f < 7267 ? 'determined' : 'smug', backpack: true, R: f >= 7267 ? 'up' : 'hip', holdR: f >= 7267 ? 'panUp' : null, L: f >= 7313 ? 'reach' : 'hip', holdL: f >= 7313 ? 'gisela' : null }, [-3.4, 0, 5.6]),
    ...puff(f, 7232, [-3.4, 1.2, 5.4], 0.5), ...burst(f, 7267, [-3.0, 2.0, 5.7], 0.5, '#ffffff', 8), ...burst(f, 7313, [-3.8, 1.3, 5.7], 0.5, '#bff0a0', 8)],
  { dof: [[-3.4, 1.4, 5.6], 9], flash: true, w: { ...D365, sofa: 1, tally: 365 } });
shot('sofaweg', 7349, 7399, 'inside', [[7349, ...F([-3.3, 0, 7.0], 180, 'WS', { fov: 50, h: 0.2 })], [7399, ...F([-3.5, 0, 6.6], 180, 'WS', { fov: 50, h: 0.2, k: 0.94 }), 'lin']],
  (f, T) => { const k = smooth(ramp(f, 7352, 7395)), sp = [-2.95 - 0.9 * k, 0, 8.35 - 2.2 * k];
    return [HERO(T, f, { expr: 'determined', backpack: true, L: 'reach', R: 'reach', legs: k > 0 && k < 1 ? 'walk' : 'stand', step: q((f % 14) / 14), tilt: -6 }, [sp[0], 0, sp[2] - 0.95])]; },
  { dof: [[-3.6, 1.2, 7.0], 4], w: (f) => ({ ...D365, sofa: 1 - 0.5 * smooth(ramp(f, 7352, 7395)), tally: 365 }) });
shot('tuer', 7399, 7466, 'final', [[7399, [-3.0, 1.45, 12.6], [-3.0, 1.35, 9.0], 40], [7466, [-3.0, 1.45, 12.2], [-3.0, 1.35, 9.0], 37, 'lin']],
  (f, T) => [HERO(T, f, { expr: f < 7440 ? 'neutral' : 'tired', backpack: true, R: 'reach', holdR: 'pan', L: 'reach', holdL: 'gisela' }, [-3.0, 0, f < 7440 ? 8.6 : 8.6 + (f - 7440) * 0.02])],
  { dof: [[-3.0, 1.4, 9.0], 6], flash: true, w: (f) => ({ ...D365, sofa: 0.5, door: smooth(ramp(f, 7410, 7440)) }) });
shot('sonne', 7466, 7510, 'final', [[7466, [-0.5, 1.6, 20.5], [-2.5, 2.4, 9.0], 50], [7510, [-0.6, 1.6, 20.0], [-2.5, 2.4, 9.0], 48, 'lin']],
  (f, T) => [HERO(T, f, { expr: 'tired', backpack: true, R: 'reach', holdR: 'pan', L: 'reach', holdL: 'gisela' }, [-3.0, 0, 9.6]),
    ...[0, 1, 2].map((i) => FXC('bd' + i + (f % 8), (p) => FX.bird(p, f * 0.5 + i), [-4 + i * 2 + (f - 7466) * 0.03, 6 + i * 0.6, 12], 0.4))],
  { dof: [[-3, 1.5, 9.6], 2], w: { ...D365, sofa: 0.5, door: 1 } });
shot('leben', 7510, 7703, 'final', [[7510, ...F([-2.4, 0, 11.4], 0, 'FS', { fov: 46, k: 1.2 })], [7585, ...F([-2.4, 0, 11.4], 0, 'FS', { fov: 46, k: 1.15 }), 'lin'], [7600, [-2.4, 1.3, 11.7], [9.0, 2.3, 16.8], 46, 'out'], [7640, [-2.4, 1.3, 11.7], [4.0, 2.3, 16.8], 44, 'lin'], [7655, ...F([-1.6, 0, 11.6], 10, 'FS', { fov: 46, k: 1.2 }), 'out'], [7703, ...F([-1.9, 0, 11.6], 10, 'FS', { fov: 46, k: 1.15 }), 'lin']],
  (f, T) => { const out = [HERO(T, f, { expr: f < 7600 ? 'shock' : 'worried', backpack: true, R: 'reach', holdR: 'pan', L: 'reach', holdL: 'gisela', turn: 0.4, look: 0.8 }, [-3.0, 0, 10.6], {}, {})];
    if (f > 7520 && f < 7610) { const x = lerp(-9, 10, ramp(f, 7525, 7600)); out.push(CARD('sc', (p) => FX.scooter(p), [x, 0, 12.6], 0.5, { flip: true, blob: true }), ACT(T, KID, { expr: 'laugh', legs: 'stand', L: { x: 420, y: 560, b: 0.3 }, R: { x: 470, y: 560, b: 0.3 } }, [x, 0.12, 12.55], { s: 0.7 })); }
    if (f > 7560) { const x = lerp(26, -12, ramp(f, 7570, 7690)); out.push(...notes(f, [x - 0.5, 3.8, 15.2], 3, 0.35)); }
    if (f > 7620) { const w = walk(f, 7620, 7700, [3.5, 0, 12.0], [-1.6, 0, 11.9], 30); out.push(ACT(T, SCHMIDT, { expr: 'happy', legs: w.moving ? 'walk' : 'stand', step: w.step, L: 'hang', R: 'hang', holdL: 'shopbag', holdR: 'shopbag', turn: -0.4, look: -1 }, w.pos)); }
    return out; },
  { dof: [[-1, 1.4, 12], 4], w: (f) => ({ ...D365, sofa: 0.5, door: 1, gateOpen: 1, vanX: lerp(26, -12, ramp(f, 7570, 7690)) }) });
// dialogue: hero in the gate (-3, 11.0), Schmidt on the pavement (-1.6, 11.9)
const HP = [-3.0, 0, 10.95], SP = [-1.6, 0, 11.9];
const heroFinal = (T, f, o = {}) => HERO(T, f, { backpack: true, R: 'reach', holdR: 'pan', L: 'reach', holdL: 'gisela', turn: 0.45, look: 0.9, ...o }, HP);
const schmidtFinal = (T, f, o = {}) => ACT(T, SCHMIDT, { expr: 'happy', L: 'hang', R: 'hang', holdL: 'shopbag', holdR: 'shopbag', turn: -0.45, look: -0.9, blink: blinkAt(f, 8), ...o }, SP);
const DLG = { ...D365, sofa: 0.5, door: 1, gateOpen: 1, vanX: 60 };
const camOn = (who, a, b, wide = false) => who === 'S' ? [[a, [0.3, 1.55, 15.0], [-1.6, 1.5, 11.9], 30], [b, [0.25, 1.55, 14.7], [-1.6, 1.5, 11.9], 28, 'lin']] : [[a, [-4.6, 1.55, 14.6], [-3.0, 1.5, 10.95], 30], [b, [-4.55, 1.55, 14.3], [-3.0, 1.5, 10.95], 28, 'lin']];
shot('s1', 7703, 7812, 'final', camOn('S', 7703, 7812), (f, T) => [schmidtFinal(T, f, { expr: f < 7737 ? 'neutral' : f < 7780 ? 'laugh' : 'happy', L: f > 7740 ? 'wave' : 'hang', holdL: f > 7740 ? null : 'shopbag' }), heroFinal(T, f, { expr: 'neutral' })], { dof: [[-1.6, 1.5, 11.9], 11], w: DLG });
shot('h1', 7812, 7900, 'final', camOn('H', 7812, 7900), (f, T) => [heroFinal(T, f, { expr: f < 7860 ? 'worried' : 'scared', headTilt: f > 7865 ? 6 : 0 }), schmidtFinal(T, f)], { dof: [[-3.0, 1.5, 10.95], 11], w: DLG });
shot('s2', 7900, 8074, 'final', camOn('S', 7900, 8074), (f, T) => [schmidtFinal(T, f, { expr: f < 7935 ? 'laugh' : f % 50 < 25 ? 'happy' : 'smug', R: f > 7935 && f < 8020 ? 'wave' : 'hang', holdR: f > 7935 && f < 8020 ? null : 'shopbag' }), heroFinal(T, f, { expr: 'shock' })], { dof: [[-1.6, 1.5, 11.9], 11], w: DLG });
shot('h2', 8074, 8125, 'final', camOn('H', 8074, 8125), (f, T) => [heroFinal(T, f, { expr: 'worried', headTilt: -6 }), schmidtFinal(T, f)], { dof: [[-3.0, 1.5, 10.95], 11], w: DLG });
shot('s3', 8125, 8355, 'final', [[8125, [0.3, 1.55, 15.0], [-1.6, 1.5, 11.9], 30], [8260, [0.25, 1.55, 14.7], [-1.6, 1.5, 11.9], 28, 'lin'], [8272, [-0.5, 1.55, 14.2], [-1.6, 1.5, 11.9], 24, 'out'], [8355, [-0.55, 1.55, 14.0], [-1.6, 1.5, 11.9], 22, 'lin']],
  (f, T) => [schmidtFinal(T, f, { expr: f < 8205 ? 'neutral' : f < 8270 ? 'smug' : 'angry', L: f >= 8270 ? 'chin' : 'hang', holdL: f >= 8270 ? null : 'shopbag' }), heroFinal(T, f, { expr: f < 8270 ? 'worried' : 'scared' }), ...(f > 8300 ? [FXC('sw2', (p) => FX.sweat(p), [-2.8, 1.9, 11.0], 0.22)] : [])],
  { dof: [[-1.6, 1.5, 11.9], 11], w: DLG });
shot('stehst', 8355, 8500, 'final', [[8355, [-3.0, 1.75, 13.6], [-3.0, 1.5, 10.95], 34], [8420, [-3.0, 1.45, 13.4], [-3.0, 1.3, 10.95], 34, 's'], [8500, [-3.0, 1.0, 13.2], [-3.0, 1.05, 10.95], 36, 's']],
  (f, T) => [heroFinal(T, f, { expr: 'tired', turn: 0, look: 0 }), schmidtFinal(T, f, { expr: 'angry' })], { dof: [[-3.0, 1.3, 10.95], 8], w: DLG });
shot('ecke', 8500, 8670, 'final', [[8500, [-3.3, 1.7, 9.6], [6.0, 1.2, 18.0], 32], [8620, [-3.2, 1.65, 9.8], [4.5, 1.2, 16.0], 30, 'lin'], [8632, [-2.7, 1.0, 10.2], [4.0, 1.6, 15.0], 34, 'out', -5], [8670, [-2.7, 1.0, 10.25], [4.0, 1.6, 15.0], 33, 'lin', -5]],
  (f, T) => { const w = walk(f, 8500, 8670, [10.2, 0, 20.4], [4.6, 0, 15.0], 44);
    return [ACT(T, GUENTHER, { ...GUENTHER_POSE, legs: 'walk', step: w.step }, w.pos, { flip: true }), ...moanFx(f, [w.pos[0] - 0.4, 2.0, w.pos[2]], 0.3),
      HERO(T, f, { expr: f < 8631 ? 'shock' : 'determined', backpack: true, R: f >= 8631 ? 'up' : 'reach', holdR: f >= 8631 ? 'panUp' : 'pan', L: 'reach', holdL: 'gisela', turn: 0.5, look: 1 }, [-2.6, 0, 11.4]),
      ...burst(f, 8631, [-2.4, 2.2, 11.4], 0.6, '#fff3b0', 10)]; },
  { dof: (f) => ({ focus: f < 8630 ? 11 : 6, cinf: 6 }), flash: true, w: (f) => ({ ...DLG, d12: 1 }) });
shot('bandscheibe', 8670, 8870, 'final', [[8670, ...F([-1.5, 0, 11.8], 10, 'FS', { fov: 50, k: 1.3, lx: 0.3 })], [8870, ...F([-1.5, 0, 11.8], 10, 'FS', { fov: 50, k: 1.22, lx: 0.3 }), 'lin']],
  (f, T) => { const stop = f >= 8676; const gp = stop ? [-0.3, 0, 12.5] : [-0.1, 0, 12.7];
    return [ACT(T, GUENTHER, { ...GUENTHER_POSE, expr: f < 8738 ? 'tired' : f < 8780 ? 'neutral' : 'sad', legs: 'stand', L: f >= 8686 ? 'hip' : GUENTHER_POSE.L, R: { x: 380, y: 610, b: 0.4 }, holdR: 'breadbag' }, gp, { flip: true }),
      heroFinal(T, f, { expr: f < 8738 ? 'determined' : 'shock', R: 'up', holdR: 'panUp' }), schmidtFinal(T, f, { expr: f < 8873 ? 'neutral' : 'happy', headTilt: f > 8873 ? 8 : 0 }),
      ...(f > 8686 && f < 8740 ? [FXC('ow' + q((f % 10) / 10, 1), (p) => T_.fxCreak(p, (f % 10) / 10), [0.2, 1.0, 12.5], 0.3)] : [])]; },
  { dof: [[-1.4, 1.4, 12.0], 4], w: DLG });
shot('nr12', 8870, 8970, 'final', [[8870, [-1.0, 1.55, 15.0], [-1.6, 1.5, 11.9], 32], [8905, [-0.9, 1.55, 15.0], [-1.6, 1.5, 11.9], 32, 'lin'], [8925, [0.5, 1.7, 14.6], [12.8, 1.9, 21.9], 26, 'out'], [8970, [0.6, 1.7, 14.6], [13.0, 1.95, 21.9], 22, 'lin']],
  (f, T) => [schmidtFinal(T, f, { expr: 'happy', R: f > 8905 ? 'point' : 'hang', holdR: f > 8905 ? null : 'shopbag', turn: 0.3, look: 1 }), ACT(T, GUENTHER, { ...GUENTHER_POSE, expr: 'neutral', legs: 'stand', holdR: 'breadbag' }, [-0.3, 0, 12.5], { flip: true })],
  { dof: (f) => (f < 8915 ? { focus: 3.4, cinf: 9 } : { focus: 16, cinf: 3 }), w: { ...DLG, d12: 1 } });
shot('wirklich', 8970, 9012, 'final', [[8970, [-3.2, 1.6, 12.8], [-3.0, 1.55, 10.95], 32], [9012, [-3.2, 1.6, 12.5], [-3.0, 1.55, 10.95], 29, 'lin']],
  (f, T) => [heroFinal(T, f, { expr: 'tired', turn: 0, look: 0 })], { dof: [[-3.0, 1.55, 10.95], 13], flash: true, w: DLG });
shot('rein', 9012, 9080, 'final', [[9012, [-3.0, 1.6, 14.0], [-3.0, 1.3, 9.5], 40], [9080, [-3.0, 1.6, 13.6], [-3.0, 1.3, 9.5], 38, 'lin']],
  (f, T) => { const w = walk(f, 9012, 9045, [-3.0, 0, 10.95], [-3.0, 0, 8.6], 22); return f < 9046 ? [HERO(T, f, { back: true, backpack: true, legs: w.moving ? 'walk' : 'stand', step: w.step, R: 'reach', holdR: 'pan', L: 'reach', holdL: 'gisela' }, w.pos), schmidtFinal(T, f, { expr: 'shock' })] : [schmidtFinal(T, f, { expr: 'shock' })]; },
  { dof: [[-3.0, 1.3, 9.5], 4], w: (f) => ({ ...DLG, door: 1 - smooth(ramp(f, 9046, 9070)) }) });
shot('sofazu', 9080, 9178, 'inside', [[9080, ...F([-3.3, 0, 7.0], 180, 'WS', { fov: 50, h: 0.2 })], [9124, ...F([-3.1, 0, 7.4], 180, 'WS', { fov: 50, h: 0.2, k: 0.94 }), 'lin'], [9134, ...F([-3.2, 0, 7.25], 180, 'MS'), 'out'], [9178, ...F([-3.2, 0, 7.25], 180, 'MS', { k: 0.9 }), 'lin']],
  (f, T) => { const k = smooth(ramp(f, 9084, 9122)), sp = [-3.85 + 0.9 * k, 0, 6.15 + 2.2 * k];
    return [f < 9128 ? HERO(T, f, { back: true, backpack: true, L: { x: 200, y: 520, b: 0.3 }, R: { x: 400, y: 520, b: 0.3 }, legs: k > 0 && k < 1 ? 'walk' : 'stand', step: q((f % 14) / 14) }, [sp[0], 0, sp[2] - 1.0])
      : HERO(T, f, { expr: 'smug', backpack: true, L: 'hang', holdL: 'gisela', R: 'thumb', turn: 0.2 }, [-3.2, 0, 7.25], { order: 3 })]; },
  { dof: [[-3.2, 1.3, 7.3], 8], flash: true, w: (f) => ({ ...D365, sofa: 0.5 + 0.5 * smooth(ramp(f, 9084, 9122)), tally: 365 }) });

export const SHOTS = SHOTS_;
let lastShot = SHOTS[0];
export const shotAt = (f) => { if (f >= lastShot.a && f < lastShot.b) return lastShot; return (lastShot = SHOTS.find((s) => f >= s.a && f < s.b) || SHOTS[SHOTS.length - 1]); };
export const lightFor = (S, f) => ({ ...LIGHTS[typeof S.light === 'function' ? S.light(f) : S.light] });

export const camAt = (f) => {
  const S = shotAt(f), K = S.cam; let c;
  const k0 = (k) => ({ f: k[0], pos: k[1], look: k[2], fov: k[3], e: k[4] || 's', roll: k[5] || 0 });
  if (f <= K[0][0]) c = k0(K[0]); else if (f >= K[K.length - 1][0]) c = k0(K[K.length - 1]);
  else for (let i = 0; i < K.length - 1; i++) if (f >= K[i][0] && f < K[i + 1][0]) {
    const a = k0(K[i]), b = k0(K[i + 1]), r = (f - a.f) / (b.f - a.f), t = b.e === 'out' ? easeOut(r / 0.45) : b.e === 'lin' ? r : smooth(r);
    c = { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll, b.roll, t) }; break;
  }
  c = { ...c, pos: [...c.pos], look: [...c.look] };
  c.fov = 2 * Math.atan(Math.tan(c.fov * Math.PI / 360) * ZOOM) * 180 / Math.PI;
  c.flash = S.flash && f - S.a < 4 ? (1 - (f - S.a) / 4) * 0.85 : 0;
  c.shadowAt = c.look;
  return c;
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  if (typeof S.dof === 'function') return S.dof(f, C);
  return { focus: dist(C.pos, S.dof[0]), cinf: S.dof[1] };
};
// global world timeline + per-shot overrides
export const worldAt = (f) => {
  const base = { sofa: f >= 1620 && f < 7349 ? 1 : f >= 7349 ? 0.5 : 0, wardrobe: f >= 1662 ? 1 : 0, paper: f >= 1684, power: f < 1915 ? 1 : 0, tv: f < 1915 ? 1 : 0, door: 0, billy: f < 5715, table: f < 5722, tally: f < 2280 ? 0 : Math.min(365, Math.floor(dayAt(f))), clock: 7, garden: f > 4766 && f < 5442 ? 0.6 : 0, tub: f > 2155 ? 0.5 : 0 };
  const S = shotAt(f), w = typeof S.w === 'function' ? S.w(f) : (S.w || {});
  return { ...base, ...w };
};
export const actorsAt = (f, T) => { T_ = T; const S = shotAt(f); return S.act(f, T, camAt(f)); };
export const fxAt = (f, T) => [];
