// "Der Giftkönig" — shot plan. Voice: voice.mp3 (45.45 s). TOTAL = voice + 0.5 s tail = 1379 frames @ 30 fps.
// Phrase times (silence-detect + syllable-rate check, hand-fixed; 11/12 boundaries moved, "Absichtlich." split off):
//  1  0.14- 2.55 f004-076 Dieser König hat sich jeden Tag selbst vergiftet.
//  2  2.68- 3.38 f080-101 Absichtlich.
//  3  3.48- 4.72 f104-141 Sein Vater wurde vergiftet.
//  4  4.94- 6.99 f148-209 Und er weiß: Er ist der Nächste auf der Liste.
//  5  7.25- 8.46 f217-253 Also dreht er den Spieß um.
//  6  8.65-10.66 f259-319 Jeden Tag nimmt er winzige Mengen Gift.
//  7 10.88-11.71 f326-351 Erst ein bisschen. | 12.00-12.90 f360-387 Dann immer | mehr. (word gap 12.26-12.35)
//  8 13.18-14.70 f395-441 Sein Körper soll sich dran gewöhnen.
//  9 14.82-16.38 f444-491 Dazu mixt er sich ein Gegengift.
// 10 16.54-17.67 f496-530 Aus Dutzenden Zutaten.
// 11 17.77-19.78 f533-593 Und es heißt: Er prahlt sogar damit.
// 12 19.98-22.84 f599-685 Seine Gäste sollen mit ihm Speisen essen, | in denen Gift steckt. (gap 20.76-20.95)
// 13 23.23-24.73 f697-742 Doch dann verliert er einen Krieg.
// 14 25.20-26.03 f756-781 Gefangenschaft? | 26.70-27.87 f801-836 Kommt für ihn nicht in Frage.
// 15 28.35-30.34 f850-910 Also greift er zu seinem eigenen Gift.
// 16 30.77-31.77 f923-953 Und jetzt der Haken: | 32.02-32.72 f960-982 Es wirkt nicht.
// 17 32.99-34.13 f990-1024 Er stirbt am Ende trotzdem. | 34.66-35.67 f1040-1070 Aber nicht durch Gift.
// 18 35.98-37.16 f1079-1115 War er wirklich immun? | 37.60-39.11 f1128-1173 Oder war die Dosis einfach zu klein?
// 19 39.70-41.19 f1191-1236 Das weiß bis heute niemand genau.
// 20 41.79-43.71 f1254-1311 Aber sein Trick hat einen Namen bekommen: | 44.02-45.11 f1321-1353 Mithridatismus.
import { OX } from './scene.js';
export const FPS = 30, TOTAL = 1379;
export const SHOTS = [
  { id: 's1', a: 0, b: 78, loc: 'hall', light: 'hallDay' },
  { id: 's2', a: 79, b: 102, loc: 'hall', light: 'hallDay' },
  { id: 's3', a: 103, b: 145, loc: 'feast', light: 'sepia' },
  { id: 's4', a: 146, b: 213, loc: 'corr', light: 'corr' },
  { id: 's5', a: 214, b: 256, loc: 'hall', light: 'hallWarm' },
  { id: 's6', a: 257, b: 322, loc: 'bal', light: 'dawn' },
  { id: 's7a', a: 323, b: 356, loc: 'bal', light: 'noon' },
  { id: 's7b', a: 357, b: 368, loc: 'bal', light: 'sunset' },
  { id: 's7c', a: 369, b: 392, loc: 'bal', light: 'balNight' },
  { id: 's8', a: 393, b: 443, loc: 'void', light: 'void' },
  { id: 's9', a: 444, b: 493, loc: 'lab', light: 'lab' },
  { id: 's10', a: 494, b: 531, loc: 'lab', light: 'lab' },
  { id: 's11', a: 532, b: 597, loc: 'hall', light: 'hallDay' },
  { id: 's12a', a: 598, b: 625, loc: 'ban', light: 'ban' },
  { id: 's12b', a: 626, b: 693, loc: 'ban', light: 'ban' },
  { id: 's13', a: 694, b: 751, loc: 'tent', light: 'tent' },
  { id: 's14a', a: 752, b: 794, loc: 'tent', light: 'tent' },
  { id: 's14b', a: 795, b: 846, loc: 'tent', light: 'tent' },
  { id: 's15', a: 847, b: 919, loc: 'tent', light: 'tent' },
  { id: 's16', a: 920, b: 987, loc: 'tent', light: 'tent' },
  { id: 's17a', a: 988, b: 1031, loc: 'hall', light: 'hallNight' },
  { id: 's17b', a: 1032, b: 1077, loc: 'hall', light: 'hallNight' },
  { id: 's18a', a: 1078, b: 1123, loc: 'mus', light: 'mus' },
  { id: 's18b', a: 1124, b: 1186, loc: 'mus', light: 'mus' },
  { id: 's19', a: 1187, b: 1250, loc: 'mus', light: 'mus' },
  { id: 's20a', a: 1251, b: 1316, loc: 'mus', light: 'musLib' },
  { id: 's20b', a: 1317, b: 1378, loc: 'mus', light: 'musLib' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b + 0.999) || (f < 0 ? SHOTS[0] : SHOTS[SHOTS.length - 1]);
const SID = Object.fromEntries(SHOTS.map((s) => [s.id, s]));

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const eo = (t) => 1 - (1 - clamp(t)) ** 3;
const ei = (t) => clamp(t) ** 2;
const lerp = (a, b, t) => a + (b - a) * t, L3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t)), ramp = (f, a, b) => clamp((f - a) / (b - a));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const blinkAt = (f, seed) => { const per = 70 + (seed * 17) % 40, ph = Math.floor(f + seed * 13) % per; return ph < 2 ? 1 : 0; };
// a camera "move" from key A to key B with easing and continuous creep afterwards (never frozen)
const mv = (A, B, t, e = smooth) => { const k = e(t); return { pos: L3(A.pos, B.pos, k), look: L3(A.look, B.look, k), fov: lerp(A.fov, B.fov, k), roll: lerp(A.roll || 0, B.roll || 0, k) }; };
const seq = (f, keys) => { // keys: [{f, pos, look, fov, roll, e}] absolute frames
  if (f <= keys[0].f) return { ...keys[0] };
  for (let i = 0; i < keys.length - 1; i++) if (f <= keys[i + 1].f) { const a = keys[i], b = keys[i + 1]; const t = (f - a.f) / (b.f - a.f); return mv(a, b, t, b.e === 'out' ? eo : b.e === 'lin' ? (x) => x : b.e === 'in' ? ei : smooth); }
  return { ...keys[keys.length - 1] };
};

// ---------- lights ----------
const base = { az: 20, el: 30, sky: '#fff0dc', ground: '#6a5a7a', hemi: 1.1, sun: '#fff0d8', sunI: 2.2, fog: '#e8d8c8', fogNear: 30, fogFar: 120, skyTop: '#5a90e0', skyHor: '#f8e0c0',
  sat: 1.18, waterDeep: '#1f5a8a', waterShal: '#4aa0c0', glint: '#f0fbff', vig: 0.3, shadowExt: 10, gain: '#fff4e8', lift: '#04030a', ink: 1.5 };
export const LIGHTS = {
  hallDay: { ...base },
  hallWarm: { ...base, az: 30, el: 22, sun: '#ffd8a0', sunI: 2.3, hemi: 0.95, gain: '#ffe8cc', vig: 0.36 },
  sepia: { ...base, sat: 0.12, gain: '#ffd7a0', lift: '#1e1206', vig: 0.5, fog: '#d8c0a0', fogNear: 10, fogFar: 40, ink: 1.6 },
  corr: { ...base, az: 160, el: 20, sky: '#5a6aa0', ground: '#2a1a20', hemi: 0.5, sun: '#ffa860', sunI: 1.3, fog: '#140f22', fogNear: 5, fogFar: 26, skyTop: '#05081a', skyHor: '#101830', vig: 0.48, gain: '#ffd8b0', lift: '#06040e', sat: 1.12 },
  dawn: { ...base, az: -90, el: 9, sun: '#ffb070', sunI: 2.3, sky: '#ffc8a0', ground: '#5a4a6a', hemi: 1.0, fog: '#f8a880', fogNear: 80, fogFar: 1100, skyTop: '#4a5ab0', skyHor: '#ffa060', sunDisc: '#ffe6b0', sunSize: 0.012,
    waterDeep: '#2a2a5a', waterShal: '#d87a5a', glint: '#ffe0b0', gain: '#ffeedd', vig: 0.3, shadowExt: 4 },
  noon: { ...base, az: -60, el: 50, sun: '#fff6e0', sunI: 2.5, sky: '#cfe0ff', ground: '#6a6a80', hemi: 1.15, fog: '#c8dcf4', fogNear: 120, fogFar: 1300, skyTop: '#2a6ad8', skyHor: '#bcd8f8', shadowExt: 4, waterDeep: '#1a5a9a', waterShal: '#3ab0d0' },
  sunset: { ...base, az: -100, el: 4, sun: '#ff8a50', sunI: 2.4, sky: '#ff9a7a', ground: '#4a3a6a', hemi: 0.95, fog: '#e87a6a', fogNear: 80, fogFar: 1000, skyTop: '#5a3a8a', skyHor: '#ff7a4a', sunDisc: '#ffd0a0', sunSize: 0.015,
    waterDeep: '#3a2a5a', waterShal: '#e8704a', glint: '#ffd0a0', shadowExt: 4, gain: '#ffe0d0' },
  balNight: { ...base, az: -70, el: 30, sun: '#a8b8ff', sunI: 1.0, sky: '#4a5aa0', ground: '#1a1a30', hemi: 0.65, fog: '#101838', fogNear: 80, fogFar: 1100, skyTop: '#04081e', skyHor: '#1e2a60',
    waterDeep: '#08102a', waterShal: '#2a3a7a', glint: '#c8d8ff', gain: '#d8e0ff', vig: 0.42, shadowExt: 4 },
  void: { ...base, el: 60, sun: '#8090ff', sunI: 0.6, sky: '#6070c0', ground: '#101020', hemi: 0.6, fog: '#0a0e20', fogNear: 60, fogFar: 200, skyTop: '#04060f', skyHor: '#0a0e20', vig: 0.5, ink: 1.2 },
  lab: { ...base, az: 120, el: 55, sun: '#ffb060', sunI: 1.7, sky: '#e0a870', ground: '#3a2a20', hemi: 0.85, fog: '#2a1a14', fogNear: 7, fogFar: 26, skyTop: '#1a1010', skyHor: '#2a1a14', gain: '#ffe4c0', vig: 0.42, ink: 1.7, shadowExt: 6 },
  ban: { ...base, az: 70, el: 45, sun: '#ffc080', sunI: 1.9, sky: '#ffc890', ground: '#5a3020', hemi: 0.95, fog: '#4a2a20', fogNear: 9, fogFar: 34, skyTop: '#2a1410', skyHor: '#4a2a20', vig: 0.38, gain: '#fff0d8', shadowExt: 7 },
  tent: { ...base, az: 40, el: 28, sun: '#ffa860', sunI: 1.25, sky: '#5060a0', ground: '#201820', hemi: 0.55, fog: '#0e1226', fogNear: 25, fogFar: 220, skyTop: '#03061a', skyHor: '#141a3a', vig: 0.48, gain: '#ffe0c0', lift: '#05040c', sat: 1.05, shadowExt: 5 },
  hallNight: { ...base, az: 0, el: 24, sun: '#9ab4ff', sunI: 1.5, sky: '#5a6ab0', ground: '#1a1830', hemi: 0.5, fog: '#0e1430', fogNear: 10, fogFar: 55, skyTop: '#04071a', skyHor: '#18264f', vig: 0.48, gain: '#d0d8ff', sat: 0.92,
    waterDeep: '#08102a', waterShal: '#1e2a60', glint: '#a8b8ff' },
  mus: { ...base, az: 60, el: 70, sun: '#fff4e0', sunI: 1.5, sky: '#e8f0ff', ground: '#4a3a30', hemi: 1.0, fog: '#182030', fogNear: 12, fogFar: 45, skyTop: '#101420', skyHor: '#182030', vig: 0.32, gain: '#f4f6ff', shadowExt: 6 },
  musLib: { ...base, az: 120, el: 50, sun: '#ffe0b0', sunI: 1.6, sky: '#ffe8d0', ground: '#4a3a30', hemi: 0.9, fog: '#1a1820', fogNear: 10, fogFar: 40, skyTop: '#101010', skyHor: '#1a1820', vig: 0.38, gain: '#fff0dc', ink: 1.8, shadowExt: 4 },
};
export const lightFor = (S, f) => ({ ...LIGHTS[S.light] });

// ---------- shot-local cameras (local coords of the shot's place; x gets OX added) ----------
// hook path: king walks out of the doors toward the camera
const kingZ = (f) => (f <= 0 ? -15.2 : f >= 79 ? -5.0 : -15.2 + 10.2 * (0.12 * smooth(f / 10) + 0.88 * clamp((f - 4) / 75)));
const CAMS = {
  s1: (f) => { const kz = kingZ(f); const d = lerp(3.7, 2.9, eo(f / 78)); return { pos: [0.15 + 0.25 * Math.sin(f * 0.05), lerp(0.5, 0.8, f / 78), kz + d], look: [0, lerp(2.2, 1.95, f / 78), kz], fov: lerp(52, 47, f / 78), roll: lerp(-3, 2, f / 78) }; },
  s2: (f) => { const t = (f - 79) / 23; const A = { pos: [0.2, 0.9, -1.6], look: [0, 2.0, -5], fov: 46, roll: 2 }, B = { pos: [0.05, 1.75, -3.25], look: [0, 1.9, -5], fov: 40, roll: -2 }; const c = mv(A, B, clamp(t * 4), eo); const k = clamp((t - 0.25) / 0.75); c.pos[2] -= 0.12 * k; c.fov -= 2 * k; return c; },
  s3: (f) => seq(f, [{ f: 103, pos: [1.6, 1.55, -2.6], look: [0.1, 1.45, -4.9], fov: 36 }, { f: 113, pos: [1.5, 1.5, -2.75], look: [0.3, 1.35, -4.6], fov: 36, e: 'lin' },
    { f: 124, pos: [1.9, 0.5, -3.3], look: [0.3, 0.15, -4.65], fov: 42, e: 'out' }, { f: 145, pos: [1.8, 0.42, -3.35], look: [0.4, 0.12, -4.65], fov: 38, roll: -3, e: 'lin' }]),
  s4: (f) => seq(f, [{ f: 146, pos: [0.6, 1.9, -3.4], look: [0.15, 1.7, -9.0], fov: 34, roll: 2 }, { f: 172, pos: [0.55, 1.85, -4.2], look: [0.15, 1.65, -9.0], fov: 32, roll: 3, e: 'lin' },
    { f: 182, pos: [0.9, 1.95, 3.4], look: [-0.9, 1.75, 0.0], fov: 38, roll: -2, e: 'out' }, { f: 213, pos: [0.75, 1.9, 2.7], look: [-0.95, 1.78, 0.0], fov: 35, roll: -4, e: 'lin' }]),
  s5: (f) => seq(f, [{ f: 214, pos: [-2.0, 1.75, 6.4], look: [-3.0, 1.6, 2.3], fov: 44, roll: 3 }, { f: 234, pos: [-2.6, 1.8, 5.2], look: [-3.0, 1.6, 2.3], fov: 40, roll: 1, e: 'out' },
    { f: 256, pos: [-2.7, 1.8, 4.9], look: [-3.0, 1.62, 2.3], fov: 39, roll: -2, e: 'lin' }]),
  s6: (f) => seq(f, [{ f: 257, pos: [0.9, 1.55, 1.5], look: [0.0, 1.55, -1.7], fov: 42 }, { f: 280, pos: [0.65, 1.45, 0.9], look: [0.0, 1.35, -1.4], fov: 40, e: 'lin' },
    { f: 292, pos: [0.16, 1.12, -0.52], look: [0.05, 1.0, -0.9], fov: 34, e: 'out' }, { f: 322, pos: [0.12, 1.09, -0.6], look: [0.05, 1.0, -0.9], fov: 32, e: 'lin' }]),
  s7a: (f) => { const t = (f - 323) / 34; return mv({ pos: [0.62, 1.25, -0.45], look: [0.25, 1.1, -1.1], fov: 36, roll: 4 }, { pos: [0.5, 1.2, -0.62], look: [0.25, 1.1, -1.1], fov: 32, roll: 2 }, t, eo); },
  s7b: (f) => { const t = (f - 357) / 12; return mv({ pos: [-0.5, 1.45, 0.1], look: [0.05, 1.3, -1.0], fov: 40, roll: -4 }, { pos: [-0.38, 1.4, -0.12], look: [0.05, 1.3, -1.0], fov: 36, roll: -2 }, t, eo); },
  s7c: (f) => { const t = (f - 369) / 24; return mv({ pos: [0.9, 1.5, 1.7], look: [0.0, 1.95, -1.7], fov: 44, roll: 3 }, { pos: [0.75, 1.55, 1.2], look: [0.0, 2.0, -1.7], fov: 41, roll: 1 }, t, eo); },
  s8: (f) => { const t = (f - 393) / 51; return mv({ pos: [0.0, 1.6, 4.6], look: [0, 1.5, 0], fov: 40, roll: -3 }, { pos: [0.0, 1.62, 3.6], look: [0, 1.55, 0], fov: 38, roll: 3 }, t); },
  s9: (f) => seq(f, [{ f: 444, pos: [-3.1, 2.05, -1.0], look: [-3.9, 1.95, -2.05], fov: 34, roll: 2 }, { f: 458, pos: [-3.0, 2.0, -0.85], look: [-3.9, 1.95, -2.0], fov: 32, roll: 2, e: 'lin' },
    { f: 472, pos: [0.4, 2.3, 1.9], look: [0.0, 1.7, -1.8], fov: 44, roll: -2, e: 'out' }, { f: 493, pos: [0.3, 2.2, 1.4], look: [0.0, 1.75, -1.8], fov: 41, roll: -3, e: 'lin' }]),
  s10: (f) => seq(f, [{ f: 494, pos: [0.15, 3.2, -0.55], look: [0.0, 1.4, -1.2], fov: 46, roll: 0 }, { f: 516, pos: [0.1, 2.9, -0.7], look: [0.0, 1.4, -1.2], fov: 42, roll: 8, e: 'lin' },
    { f: 523, pos: [2.45, 1.38, 0.5], look: [2.45, 1.2, -1.42], fov: 30, roll: 0, e: 'out' }, { f: 531, pos: [2.45, 1.36, 0.35], look: [2.45, 1.2, -1.42], fov: 29, e: 'lin' }]),
  s11: (f) => seq(f, [{ f: 532, pos: [0.9, 1.0, 8.4], look: [0.0, 2.4, 13.0], fov: 46, roll: -4 }, { f: 545, pos: [0.4, 1.3, 9.9], look: [0.0, 2.5, 13.0], fov: 42, roll: -2, e: 'out' },
    { f: 597, pos: [0.3, 1.45, 10.5], look: [0.0, 2.55, 13.0], fov: 40, roll: 2, e: 'lin' }]),
  s12a: (f) => { const t = (f - 598) / 28; return mv({ pos: [-1.5, 1.3, 1.6], look: [-2.75, 1.15, -1.3], fov: 42, roll: 3 }, { pos: [-1.6, 1.28, 1.2], look: [-2.75, 1.15, -1.3], fov: 40, roll: 4 }, t, eo); },
  s12b: (f) => seq(f, [{ f: 626, pos: [-0.9, 1.2, 1.8], look: [-0.3, 1.2, -2.4], fov: 42, roll: 4 }, { f: 640, pos: [0.2, 1.3, 1.1], look: [0.0, 1.25, -2.4], fov: 40, roll: 0, e: 'out' },
    { f: 693, pos: [0.15, 1.3, 0.5], look: [0.0, 1.3, -2.5], fov: 36, roll: -2, e: 'lin' }]),
  // respectful part: slow and calm
  s13: (f) => seq(f, [{ f: 694, pos: [0.3, 1.3, 1.25], look: [-0.05, 0.9, 0.6], fov: 38 }, { f: 718, pos: [0.25, 1.3, 1.3], look: [-0.05, 0.92, 0.5], fov: 37, e: 'lin' }, { f: 751, pos: [0.2, 1.4, 1.6], look: [0.0, 1.1, -12.0], fov: 40 }]),
  s14a: (f) => { const t = (f - 752) / 43; return mv({ pos: [1.5, 1.55, 1.2], look: [-0.25, 1.6, -2.6], fov: 40 }, { pos: [1.3, 1.57, 0.9], look: [-0.3, 1.62, -2.6], fov: 38 }, t, (x) => x); },
  s14b: (f) => { const t = (f - 795) / 52; return mv({ pos: [0.4, 1.75, -0.2], look: [-0.6, 1.85, -2.3], fov: 36 }, { pos: [0.25, 1.77, -0.5], look: [-0.6, 1.85, -2.3], fov: 34 }, t, (x) => x); },
  s15: (f) => { const t = (f - 847) / 73; return mv({ pos: [1.2, 1.4, 1.9], look: [0.0, 1.5, -0.6], fov: 40 }, { pos: [0.8, 1.55, 1.0], look: [0.0, 1.62, -0.6], fov: 36 }, t, smooth); },
  s16: (f) => { const t = (f - 920) / 68; return mv({ pos: [0.0, 1.3, 2.3], look: [1.2, 1.1, 1.2], fov: 44 }, { pos: [0.15, 1.28, 2.15], look: [1.2, 1.12, 1.25], fov: 41 }, t, (x) => x); },
  s17a: (f) => { const t = (f - 988) / 44; return mv({ pos: [0.5, 1.8, 7.6], look: [0, 1.85, 13.3], fov: 40 }, { pos: [0.4, 1.85, 8.3], look: [0, 1.85, 13.3], fov: 38 }, t, (x) => x); },
  s17b: (f) => { const t = (f - 1032) / 46; return mv({ pos: [-1.3, 1.62, 7.6], look: [-0.88, 1.5, 9.2], fov: 40 }, { pos: [-1.28, 1.64, 7.8], look: [-0.88, 1.52, 9.2], fov: 38 }, t, (x) => x); },
  s18a: (f) => { const t = (f - 1078) / 46; return mv({ pos: [-0.2, 1.3, -0.35], look: [-0.28, 1.24, -1.15], fov: 32, roll: 3 }, { pos: [-0.24, 1.29, -0.6], look: [-0.25, 1.24, -1.15], fov: 30, roll: 1 }, t, eo); },
  s18b: (f) => { const t = (f - 1124) / 63; return mv({ pos: [-0.35, 1.38, -2.5], look: [0.05, 1.6, 0.7], fov: 46, roll: -2 }, { pos: [-0.3, 1.38, -2.25], look: [0.05, 1.62, 0.7], fov: 43, roll: 1 }, t, eo); },
  s19: (f) => seq(f, [{ f: 1187, pos: [1.0, 1.55, 3.3], look: [0.6, 1.6, 0.7], fov: 40, roll: 2 }, { f: 1215, pos: [0.85, 1.5, 2.9], look: [0.5, 1.55, 0.7], fov: 38, roll: 1, e: 'out' },
    { f: 1250, pos: [0.4, 1.4, 0.2], look: [0.3, 1.3, -1.2], fov: 34, roll: -1, e: 'smooth' }]),
  s20a: (f) => seq(f, [{ f: 1251, pos: [3.2, 2.2, 3.8], look: [4.1, 0.9, 2.05], fov: 44, roll: -3 }, { f: 1270, pos: [3.6, 1.8, 3.1], look: [4.1, 0.9, 2.05], fov: 40, roll: -1, e: 'out' },
    { f: 1316, pos: [3.85, 1.65, 2.75], look: [4.15, 0.9, 2.05], fov: 37, e: 'lin' }]),
  s20b: (f) => { const t = (f - 1317) / 62; return mv({ pos: [4.35, 1.98, 2.5], look: [4.33, 0.95, 1.84], fov: 37 }, { pos: [4.34, 1.88, 2.42], look: [4.33, 0.95, 1.84], fov: 36, roll: 1.5 }, t, smooth); },
};
// transitions: flash (white), dip (dark, soft), green dip, whoosh blur
const TR = { 79: 'punch', 103: 'flash', 146: 'whip', 214: 'whip', 257: 'flash', 323: 'flash2', 357: 'flash2', 369: 'flash2', 393: 'green', 444: 'green', 494: 'whip', 532: 'flash', 598: 'whip', 626: 'none',
  694: 'dip', 752: 'dip', 795: 'dip', 847: 'dip', 920: 'dip', 988: 'dipLong', 1032: 'dip', 1078: 'dipLong', 1124: 'whip', 1187: 'whip', 1251: 'whip', 1317: 'dip' };
const KICKS = [{ f: 2, a: 0.03 }, { f: 79, a: 0.035 }, { f: 236, a: 0.04 }, { f: 323, a: 0.02 }, { f: 357, a: 0.025 }, { f: 369, a: 0.03 }, { f: 124, a: 0.015 }, { f: 516, a: 0.012 }];
export const camAt = (f) => {
  const S = shotAt(f); let c = CAMS[S.id](f); c = { ...c, pos: [...c.pos], look: [...c.look] };
  const ox = OX[S.loc]; c.pos[0] += ox; c.look[0] += ox;
  for (const k of KICKS) { const d = f - k.f; if (d >= 0 && d < 7) { const s = (Math.floor(d) % 2 ? -1 : 1) * k.a * (1 - d / 7); c.look[1] += s * 3; c.look[0] += s * 1.5; c.roll = (c.roll || 0) + s * 25; } }
  // walking shake in the hook
  if (f < 79) { c.pos[1] += 0.03 * Math.abs(Math.sin(f * 0.42)); c.roll += 0.6 * Math.sin(f * 0.21); }
  c.flash = 0; c.fade = 0;
  for (const [fs, kind] of Object.entries(TR)) { const d = f - +fs;
    if (kind === 'flash' && d >= 0 && d < 5) c.flash = (1 - d / 5) * 0.9;
    if (kind === 'flash2' && d >= 0 && d < 3) c.flash = (1 - d / 3) * 0.7;
    if (kind === 'punch' && d >= 0 && d < 3) c.flash = (1 - d / 3) * 0.35;
    if (kind === 'green' && d >= -3 && d < 5) { c.fade = d < 0 ? (d + 4) / 4 * 0.8 : (1 - d / 5) * 0.8; c.fadeCol = '#3aff6a'; }
    if (kind === 'dip' && d >= -4 && d < 6) { c.fade = d < 0 ? (d + 5) / 5 * 0.55 : (1 - d / 6) * 0.55; c.fadeCol = '#05040a'; }
    if (kind === 'dipLong' && d >= -8 && d < 10) { c.fade = d < 0 ? (d + 9) / 9 * 0.6 : (1 - d / 10) * 0.6; c.fadeCol = '#05040a'; }
    if (kind === 'whip' && d >= 0 && d < 4) { c.roll += (4 - d) * 2.2; c.look[0] += (4 - d) * 0.25; }
  }
  // opening: first frame already shows the king; a burst of daylight from the doors
  if (f < 5) c.flash = Math.max(c.flash, (1 - f / 5) * 0.12);
  c.shadowAt = c.look;
  return c;
};
globalThis.mbAt = (f) => { const S = shotAt(f), d = f - S.a; if (TR[S.a] === 'whip' && d < 4) return 5; if (f >= 80 && f < 83) return 3; if (f >= 516 && f < 524) return 5; return 1; };

// ---------- world state ----------
const pFeast = (f) => { // goblet slips from the old king's hand and falls; then the crown rolls into frame
  const t = f - 112; let gob, crown;
  if (t < 0) gob = { p: [0.4, 1.25, -4.78], r: -0.2 };
  else { const fall = clamp(t / 8); const y = lerp(1.25, 0.0, fall * fall); const bounce = t > 8 ? Math.abs(Math.sin((t - 8) * 0.5)) * 0.12 * Math.exp(-(t - 8) * 0.15) : 0;
    gob = { p: [0.4 + 0.15 * clamp(t / 8) + 0.025 * Math.max(0, t - 8), y + bounce + (t > 8 ? 0.06 : 0), -4.78 + 0.1 * clamp(t / 8)], r: -0.2 - 1.57 * eo(t / 8), rx: 0.3 * clamp(t / 8) }; }
  const ct = f - 117; if (ct < 0) crown = { p: [-2.0, 0.27, -4.62], roll: 0 };
  else { const k = eo(ct / 24); crown = { p: [lerp(-1.6, 0.85, k), 0.27 - 0.1 * clamp((ct - 18) / 8), -4.62], roll: -ct * 0.3 * (1 - k * 0.7), yaw: 0, tilt: clamp((ct - 16) / 10) * 1.1 + Math.sin(ct * 0.9) * 0.15 * clamp((ct - 16) / 10) * (1 - clamp((ct - 22) / 6)) }; }
  return { gob, crown };
};
export const worldAt = (f) => {
  const S = shotAt(f), C = camAt(f), W = { loc: S.loc, cam: C.pos };
  if (S.loc === 'hall') {
    W.doorOpen = S.id === 's1' ? lerp(0.32, 1, eo(f / 12)) : 1; W.doorLight = S.id === 's1' ? 0.12 + 0.13 * eo(f / 10) * (1 - 0.5 * ramp(f, 20, 78)) : 0.06;
    W.wind = S.id === 's1' ? lerp(1, 0.4, f / 78) : S.id === 's2' ? 0.3 : 0;
    W.night = S.id.startsWith('s17');
    if (S.id === 's5') { const d = f - 236; W.lampShake = d >= 0 ? Math.exp(-d * 0.08) : 0; W.tableJump = d >= 0 && d < 10 ? Math.sin(d / 10 * Math.PI) : 0; }
    if (S.id === 's17b') W.flame = f < 1050 ? 1 - 0.25 * ramp(f, 1032, 1050) : f < 1062 ? 0.75 * (1 - ramp(f, 1050, 1062)) : 0;
  }
  if (S.loc === 'feast') Object.assign(W, pFeast(f));
  if (S.loc === 'corr') W.pillar = [-1.25, 1.0];
  if (S.loc === 'bal') {
    W.vessel = { s6: 0, s7a: 1, s7b: 2, s7c: -1 }[S.id];
    if (S.id === 's6') W.dropper = [0.05, 1.16 + 0.01 * Math.sin(f * 0.3), 0.12];
    if (S.id === 's7a') W.dropper = [0.25, 1.32, -0.1];
    W.moon = S.id === 's7c'; W.sunPos = S.id === 's6' ? [40, 30 + (f - 257) * 0.25, -700] : S.id === 's7a' ? [-300, 520, -500] : [-60, 14, -700];
  }
  if (S.loc === 'lab') {
    W.stir = f * 0.16;
    if (S.id === 's10') { const t = f - 494; W.honey = { p: [0.35, 2.05, 0.05], tilt: 1.9, drip: clamp(t / 6) * 0.62 };
      W.ingr = Array.from({ length: 12 }, (_, i) => { const t0 = 2 + i * 1.6, tt = t - t0; if (tt < 0 || tt > 12) return null; const a = i * 2.1; const r0 = 0.9 + (i % 3) * 0.2;
        return { p: [Math.cos(a) * r0 * (1 - tt / 12) , 2.6 - 1.25 * ei(tt / 12), Math.sin(a) * r0 * 0.6 * (1 - tt / 12)], r: tt * 0.5 + i }; }); }
  }
  if (S.loc === 'tent') { W.flicker = S.id === 's16' ? 2.4 : 1; }
  if (S.loc === 'mus') W.pageTurn = S.id === 's20a' ? smooth(ramp(f, 1256, 1280)) : 1;
  return W;
};

// ---------- depth of field ----------
const FOCUS = {
  s1: (f) => [0, 1.9, kingZ(f)], s2: () => [0, 1.9, -5], s3: (f) => (f < 116 ? [0.1, 1.5, -4.9] : [0.5, 0.15, -4.65]), s4: (f) => (f < 176 ? [0.15, 1.7, -9.3] : [-0.95, 1.8, 0.0]), s5: () => [-3.0, 1.8, 2.0],
  s6: (f) => (f < 286 ? [0.0, 1.6, -1.75] : [0.05, 1.02, -0.88]), s7a: () => [0.25, 1.15, -1.1], s7b: () => [0.05, 1.3, -1.0], s7c: () => [0.0, 2.0, -1.6], s8: () => [0, 1.6, 0],
  s9: (f) => (f < 462 ? [-3.85, 1.95, -2.0] : [0.0, 1.85, -2.3]), s10: (f) => (f < 518 ? [0, 1.42, -1.2] : [2.45, 1.22, -1.42]), s11: () => [0, 2.55, 13.0],
  s12a: () => [-2.3, 1.3, -1.4], s12b: () => [0.0, 1.35, -2.6], s13: (f) => (f < 725 ? [0, 0.95, 0.65] : [0, 1.5, -4]), s14a: () => [-0.6, 1.8, -2.3], s14b: () => [-0.6, 1.9, -2.3], s15: () => [0, 1.6, -0.6],
  s16: () => [1.15, 1.2, 1.35], s17a: () => [0, 1.8, 13.3], s17b: () => [-0.9, 1.5, 9.2], s18a: () => [-0.28, 1.25, -1.15], s18b: () => [0, 1.6, 0.6], s19: (f) => (f < 1225 ? [0.6, 1.6, 0.7] : [0.3, 1.3, -1.2]),
  s20a: () => [4.1, 0.95, 2.05], s20b: () => [4.33, 0.95, 1.9],
};
const CINF = { s1: 6, s2: 12, s3: 11, s4: 12, s5: 9, s6: 12, s7a: 14, s7b: 13, s7c: 10, s8: 4, s9: 12, s10: 12, s11: 7, s12a: 13, s12b: 11, s13: 10, s14a: 9, s14b: 12, s15: 13, s16: 10, s17a: 6, s17b: 14, s18a: 15, s18b: 11, s19: 11, s20a: 10, s20b: 13 };
export const dofAt = (f) => { const S = shotAt(f), C = camAt(f), p = FOCUS[S.id](f); const fp = [p[0] + OX[S.loc], p[1], p[2]]; return { focus: dist(C.pos, fp), cinf: CINF[S.id] }; };

// ---------- actors ----------
let TT;
const ZK = () => TT.ZK;
const A = (spec, o, x, y, z, ex = {}) => ({ key: JSON.stringify([spec, o]), draw: (p) => TT.toonChar(p, spec, o), x, y, z, ...ex });
const FXB = (key, draw, pos, s, ex = {}) => FXC(key, draw, [pos[0] + 0.1125 * s, pos[1] - 0.5625 * s, pos[2]], s, ex);
const FXC = (key, draw, pos, s, ex = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.069 * s, z: pos[2], s, blob: false, shadow: false, order: 6, ...ex });
const ACT = {
  s1: (f) => { const k = ZK(), kz = kingZ(f), out = [];
    // king: pushes the doors (arms wide) then strides, grabs the goblet from servant A's tray and downs it while walking
    const push = f < 12, grab = f >= 26 && f < 34, drink = f >= 34 && f < 64, done = f >= 64;
    const step = q(((f * 0.055) % 1), 2);
    const o = { expr: push ? 'determined' : drink ? 'sly' : 'smug', legs: push ? 'stand' : 'walk', step: push ? 0 : step, blink: drink ? 0 : blinkAt(f, 1), seed: 5,
      L: push ? { x: 40, y: 330, b: 0.5 } : 'hip', R: push ? { x: 560, y: 330, b: 0.5 } : grab ? { x: 560, y: 470, b: 0.6 } : drink ? { x: 300, y: 390, b: 1.2 } : 'hang',
      holdR: grab ? 'goblet' : drink ? 'goblet' : null, gobletTilt: drink ? q(lerp(10, 75, smooth(ramp(f, 36, 52))), 0) : 0, headTilt: drink ? q(-8 * smooth(ramp(f, 36, 50)), 0) : 0,
      turn: grab ? 0.35 : 0, look: grab ? 0.8 : 0, bob: push ? 0 : q(Math.abs(Math.sin(step * Math.PI * 2)) * 0.015, 3) };
    if (drink && f >= 44) o.blink = 1;
    out.push(A(k.king, o, 0, 0, kz, { s: 1.15, order: 3 }));
    // servants with trays of green goblets: A (right) loses a goblet, both shriek and drop their trays
    const scareA = f >= 30, scareB = f >= 46;
    out.push(A(k.servantA, { expr: scareA ? 'shock' : 'neutral', R: scareA ? 'up' : { x: 470, y: 520, b: 0.6 }, L: scareA ? 'up' : { x: 390, y: 540, b: 0.6 }, holdR: scareA ? null : 'tray', turn: -0.4, look: -0.7, blink: scareA ? 0 : blinkAt(f, 4), seed: 2 }, 1.0, 0, -11.3, { s: 0.98, flip: true }));
    out.push(A(k.servantB, { expr: scareB ? 'scared' : 'neutral', L: scareB ? 'up' : { x: 130, y: 520, b: 0.6 }, R: scareB ? 'up' : { x: 210, y: 540, b: 0.6 }, holdL: scareB ? null : 'tray', turn: 0.4, look: 0.7, blink: 0, seed: 11 }, -1.0, 0, -9.0, { s: 0.98 }));
    return out; },
  s2: (f) => { const k = ZK(), t = f - 79; const thr = t < 7;
    return [A(k.king, { expr: t < 9 ? 'smug' : 'sly', wink: t >= 9, L: 'hip', R: thr ? { x: 470, y: 120, b: 1.2 } : 'hip', holdR: t < 3 ? 'goblet_empty' : null, headTilt: t >= 9 ? 6 : 0, turn: 0.1, seed: 5, blink: 0 }, 0, 0, -5.0, { s: 1.15, order: 3 })]; },
  s3: (f) => { if (f > 120) return []; const k = ZK(); const slip = f >= 112;
    return [A(k.old, { expr: slip ? 'worried' : 'happy', legs: 'sit', R: slip ? 'hang' : { x: 470, y: 470, b: 0.6 }, holdR: slip ? null : 'goblet', liquid: '#5a1a20', L: 'belly', turn: 0.25, look: 0.3, blink: slip ? 0 : blinkAt(f, 9), seed: 9 }, 0, 0, -4.85, { s: 1.0, blob: false })]; },
  s4: (f) => { const k = ZK(), out = [], tint = '#6a5a7a';
    for (const [spec, x, tn, lk] of [[k.courtA, -0.45, 0.4, 0.6], [k.courtB, 0.15, -0.2, -0.5], [k.courtC, 0.75, -0.5, -0.8]])
      out.push(A(spec, { expr: 'sly', turn: tn, look: lk, blink: blinkAt(f, x * 10 + 20), headTilt: q(4 * Math.sin(f * 0.1 + x * 3), 0) }, x, 0, -9.4, { s: 0.95, tint }));
    out.push(A(k.young, { expr: f < 196 ? 'worried' : 'determined', turn: -0.5, look: -0.9, L: { x: 100, y: 470, b: 0.6 }, R: 'hang', blink: blinkAt(f, 3), seed: 5 }, -1.05, 0, 0.0, { s: 1.08 }));
    return out; },
  s5: (f) => { const k = ZK(), d = f - 236;  const up = f >= 222 && f < 236;
    return [A(k.king, { expr: f < 222 ? 'sly' : 'determined', L: 'hip', R: up ? 'up' : { x: 440, y: 560, b: 0.8 }, headTilt: d >= 0 && d < 6 ? 4 : 0, blink: f < 222 ? blinkAt(f, 1) : 0, seed: 5 }, -3.0, 0, 2.1, { s: 1.1 })]; },
  s6: (f) => { const k = ZK(); return [A(k.king, { expr: 'smug', L: { x: 250, y: 560, b: 0.6 }, R: { x: 380, y: 560, b: 0.6 }, holdR: f < 286 ? 'dropper' : null, look: 0.2, headTilt: 6, blink: blinkAt(f, 2), seed: 5 }, 0.0, 0, -1.75, { s: 1.08 })]; },
  s7a: () => [], s7b: () => [],
  s7c: (f) => { const k = ZK(); return [A(k.king, { expr: 'sly', L: 'hip', R: 'up', holdR: 'bigcup', turn: 0.15, blink: 0, seed: 5 }, 0.0, 0, -1.7, { s: 1.12 })]; },
  s8: (f) => { const k = ZK(); return [A(k.king, { expr: 'sleep', L: 'hang', R: 'hang', seed: 5 }, 0, 0, 0, { s: 1.15, tint: '#2a3878', blob: false })]; },
  s9: (f) => { const k = ZK(), st = f * 0.16; return [A(k.king, { expr: f < 472 ? 'smug' : 'sly', L: 'hip', R: { x: q(330 + 50 * Math.cos(st), 0), y: q(330 + 20 * Math.sin(st), 0), b: 0.6 }, look: -0.2, headTilt: 5, blink: blinkAt(f, 5), seed: 5 }, 0.0, 0, -2.35, { s: 1.1, blob: false })]; },
  s10: () => [],
  s11: (f) => { const k = ZK(), t = f - 532; const laugh = f >= 560;
    return [A(k.king, { expr: laugh ? 'laugh' : 'sly', legs: 'sit', L: 'belly', R: 'up', holdR: 'goblet', bob: laugh ? q(Math.abs(Math.sin(t * 0.5)) * 0.012, 3) : 0, headTilt: laugh ? q(-5 + 4 * Math.sin(t * 0.5), 0) : 0, blink: laugh ? 0 : blinkAt(f, 3), seed: 5 }, 0, 0.98, 12.95, { s: 1.1, blob: false }),
      A(k.servantA, { expr: 'worried', turn: 0.6, look: 0.8, L: 'cross', R: 'cross', seed: 2, sweat: 1 }, -1.9, 0.9, 11.3, { s: 0.95 }),
      A(k.servantB, { expr: 'scared', turn: -0.6, look: -0.8, holdL: 'tray_empty', L: { x: 150, y: 520 }, R: 'chin', seed: 11 }, 1.9, 0.9, 11.4, { s: 0.95, flip: true })]; },
  s12a: (f) => { const k = ZK(), sw = q(((f * 0.05) % 1), 2);
    return [A(k.guestA, { expr: 'worried', legs: 'sit', R: { x: 420, y: 560 }, holdR: 'drumstick', L: 'belly', look: 0.6, turn: 0.3, sweat: 3, sweatT: sw, blink: blinkAt(f, 1), seed: 1 }, -2.75, 0.1, -1.3, { s: 1.0, blob: false }),
      A(k.guestB, { expr: f < 612 ? 'scared' : 'worried', legs: 'sit', L: 'chin', R: 'cross', look: -0.6, turn: -0.3, sweat: 2, sweatT: sw, blink: 0, seed: 6 }, -1.9, 0.1, -1.55, { s: 1.0, blob: false }),
      A(k.guestC, { expr: 'worried', legs: 'sit', L: 'belly', R: 'belly', look: 0.3, sweat: 2, sweatT: sw, seed: 8 }, -3.6, 0.1, -0.9, { s: 1.0, blob: false })]; },
  s12b: (f) => { const k = ZK(), sw = q(((f * 0.05) % 1), 2), chew = Math.floor(f / 5) % 2;
    return [A(k.king, { expr: chew ? 'laugh' : 'happy', legs: 'sit', R: { x: 430, y: 330, b: 0.8 }, holdR: 'drumstick', L: 'belly', headTilt: chew ? -4 : 2, seed: 5, blink: 0 }, 0.0, 0.12, -2.7, { s: 1.1, blob: false }),
      A(k.guestD, { expr: 'scared', legs: 'sit', L: 'cross', R: 'chin', look: 0.8, turn: 0.4, sweat: 3, sweatT: sw, seed: 12 }, -0.48, 0.1, -0.35, { s: 0.9, blob: false }),
      A(k.guestE, { expr: 'worried', legs: 'sit', L: 'belly', R: { x: 140, y: 560 }, holdL: null, look: -0.8, turn: -0.4, sweat: 2, sweatT: sw, seed: 14 }, 0.48, 0.1, -0.35, { s: 0.9, blob: false }),
      A(k.guestB, { expr: 'worried', legs: 'sit', L: 'chin', R: 'cross', look: 0.6, sweat: 2, sweatT: sw, seed: 6 }, -1.6, 0.1, -1.9, { s: 0.95, blob: false })]; },
  s13: () => [],
  s14a: (f) => { const k = ZK(); return [A(k.king, { expr: 'neutral', turn: 0.45, look: 0.85, L: 'hang', R: { x: 520, y: 300, b: 0.6 }, blink: blinkAt(f, 2), seed: 5 }, -0.75, 0, -2.3, { s: 1.08 })]; },
  s14b: (f) => { const k = ZK(), sh = Math.sin((f - 795) / 52 * Math.PI * 2 * 1.5) * smooth(ramp(f, 800, 812)); return [A(k.king, { expr: 'determined', turn: q(0.4 * sh, 2), look: q(0.5 * sh, 2), headTilt: q(-3 * sh, 0), L: 'hang', R: 'hang', blink: 0, seed: 5 }, -0.65, 0, -2.3, { s: 1.08 })]; },
  s15: (f) => { const k = ZK(), atHilt = f < 872; return [A(k.king, { expr: 'neutral', L: 'hang', R: atHilt ? { x: 240, y: q(lerp(560, 620, ramp(f, 847, 862)), 0), b: 1.3 } : { x: 360, y: q(lerp(560, 480, smooth(ramp(f, 872, 890))), 0), b: 1.0 }, holdR: atHilt ? null : 'vial', look: atHilt ? -0.5 : 0.25, headTilt: q(lerp(0, 9, smooth(ramp(f, 870, 895))), 0), blink: blinkAt(f, 7), seed: 5 }, 0.0, 0, -0.6, { s: 1.08 })]; },
  s16: (f) => { const k = ZK(), late = f >= 958; return [A(k.king, { expr: late ? 'worried' : 'neutral', legs: 'sit', L: 'belly', R: { x: 370, y: 520, b: 0.8 }, holdR: 'vial_empty', look: late ? 0.3 : -0.3, headTilt: late ? 10 : 3, turn: late ? 0.15 : -0.1, blink: blinkAt(f, 4), seed: 5 }, 1.2, -0.12, 1.25, { s: 1.05, blob: false })]; },
  s17a: () => [], s17b: () => [],
  s18a: () => [],
  s18b: (f) => { const k = ZK(); return [A(k.teen, { expr: f < 1150 ? 'goofy' : 'worried', L: { x: 170, y: 520 }, R: 'chin', look: 0.3, turn: 0.2, blink: blinkAt(f, 3), headTilt: 6, seed: 3 }, -0.3, 0, 0.6, { s: 1.0 }),
      A(k.guide, { expr: 'neutral', L: 'cross', R: 'chin', look: -0.4, turn: -0.3, blink: blinkAt(f, 8), seed: 10 }, 0.5, 0, 0.85, { s: 1.04, flip: true })]; },
  s19: (f) => { const k = ZK(), sh = smooth(ramp(f, 1192, 1200)) * (1 - smooth(ramp(f, 1232, 1242)));
    return [A(k.guide, { expr: 'happy', L: sh > 0.5 ? { x: 110, y: 400, b: 0.4 } : 'hang', R: sh > 0.5 ? { x: 490, y: 400, b: 0.4 } : 'hang', bob: q(sh * 0.01, 3), headTilt: q(sh * 6, 0), look: 0.2, blink: blinkAt(f, 8), seed: 10, legs: f > 1222 ? 'walk' : 'stand', step: q((f % 16) / 16, 2) }, 0.65 + 1.4 * smooth(ramp(f, 1222, 1246)), 0, 0.75 + 0.6 * smooth(ramp(f, 1222, 1246)), { s: 1.04 }),
      A(k.teen, { expr: 'goofy', L: 'hang', R: 'chin', look: 0.8, turn: 0.4, blink: blinkAt(f, 2), seed: 3 }, -0.45 - 0.5 * smooth(ramp(f, 1222, 1246)), 0, 0.55, { s: 1.0 })]; },
  s20a: () => [], s20b: () => [],
};
export const actorsAt = (f, T) => { TT = T; const S = shotAt(f), ox = OX[S.loc]; return ACT[S.id](f).map((a) => ({ ...a, x: a.x + ox })); };

// ---------- fx ----------
const motes = (f, n, c, spread, h0, h1, s = 0.12, key = 'm') => { const out = []; for (let i = 0; i < n; i++) { const t = ((f * 0.006 + i * 0.137) % 1); const x = c[0] + (((i * 2.31) % 1) - 0.5) * spread[0] + Math.sin(f * 0.02 + i) * 0.2, y = h0 + t * (h1 - h0), z = c[2] + (((i * 1.77) % 1) - 0.5) * spread[1];
  out.push(FXC(key + q(Math.sin(t * Math.PI), 1), (p) => TT.fxMote(p, t), [x, y, z], s)); } return out; };
const FX = {
  s1: (f) => { const kz = kingZ(f), out = [...motes(f, 16, [0, 0, kz + 2], [5, 6], 0.3, 4.0, 0.16, 'dm')];
    if (f >= 52 && f < 62) out.push(FXC('gp' + (f - 52), (p) => TT.fxGreenPuff(p, (f - 52) / 10), [0.05, 2.05, kz + 0.1], 0.22));
    // trays falling (servant A at f30, B at f46)
    for (const [f0, x, z, sd] of [[31, 1.0, -11.3, -1], [47, -1.0, -9.0, 1]]) { const t = f - f0; if (t >= 0 && t < 22) { const y = Math.max(0.05, 1.25 - 0.012 * t * t * 1.6); const r = q(Math.min(1.4, t * 0.12) * sd, 2);
      out.push(FXC('tray' + r + 'y' + (y <= 0.05 ? 0 : 1), (p) => { p.g.save(); p.g.translate(300, 500); p.g.rotate(r); p.g.translate(-300, -500); TT.toonChar && drawTray(p, y <= 0.05); p.g.restore(); }, [x + sd * 0.02 * t, y + 0.2, z + 0.2], 0.45)); }
      if (t >= 13 && t < 21) out.push(FXB('tb' + (t - 13), (p) => TT.fxBurst(p, (t - 13) / 8, '#c8ffd0', 9, 30, 160), [x, 0.35, z + 0.2], 0.5)); }
    if (f >= 30 && f < 40) out.push(FXC('sl' + (f % 4), (p) => TT.fxShockLines(p, f * 0.1), [1.0, 1.35, -11.3], 0.98));
    if (f >= 46 && f < 58) out.push(FXC('sl' + (f % 4), (p) => TT.fxShockLines(p, f * 0.1), [-1.0, 1.35, -9.0], 0.98));
    return out; },
  s2: (f) => { const t = f - 79, out = [];
    if (t >= 2 && t < 16) { const u = (t - 2) / 14; out.push(FXC('gob' + t, (p) => { p.g.save(); p.g.translate(300, 500); p.g.rotate(u * 9); p.g.translate(-300, -500); drawGob(p); p.g.restore(); }, [0.6 + 1.6 * u, 2.4 + 1.2 * Math.sin(u * Math.PI) - 1.5 * u * u, -5.2 - 7 * u], 0.5)); }
    if (t >= 6 && t < 20) out.push(FXC('pf' + t, (p) => TT.fxGreenPuff(p, (t - 6) / 14), [0.08, 1.72, -4.85], 0.3));
    if (t >= 10 && t < 20) out.push(FXC('ting' + t, (p) => TT.fxTing(p, (t - 10) / 10), [0.42, 1.95, -4.8], 0.22));
    return out; },
  s3: (f) => { const out = [...motes(f, 10, [0.6, 0, -3.8], [3, 3], 0.2, 2.6, 0.1, 'sm')]; const t = f - 120; if (t >= 0 && t < 9) out.push(FXB('cl' + t, (p) => TT.fxBurst(p, t / 9, '#fff2c0', 10, 30, 180), [0.6, 0.1, -4.65], 0.35)); return out; },
  s4: (f) => { const out = []; out.push(FXC('wh' + (Math.floor(f / 3) % 6), (p) => TT.fxWhisper(p, Math.floor(f / 3) * 0.3), [0.2, 2.35, -9.2], 0.55)); return out; },
  s5: (f) => { const d = f - 236, out = []; if (d >= 0 && d < 10) out.push(FXB('fb' + d, (p) => TT.fxBurst(p, d / 10, '#fff3b0', 12, 40, 220), [-2.75, 1.15, 2.6], 0.8)); return out; },
  s6: (f) => { const out = [...motes(f, 10, [0, 0, -1.2], [3, 2], 0.6, 2.4, 0.1, 'bm')]; const t = f - 300;
    if (t >= 0 && t < 12) out.push(FXC('dr', (p) => TT.fxDrop(p), [0.05, lerp(1.07, 1.03, ei(t / 12)) + 0, -0.88 + 0.0], 0.035));
    if (t >= 12 && t < 22) out.push(FXB('sp' + (t - 12), (p) => TT.fxBurst(p, (t - 12) / 10, '#9affb0', 8, 20, 120), [0.05, 1.035, -0.87], 0.06));
    return out; },
  s7a: (f) => { const t = f - 330, out = []; if (t >= -7 && t < 10) out.push(FXC('dr', (p) => TT.fxDrop(p), [0.25, lerp(1.27, 1.17, ei(clamp(t / 10))), -1.1], 0.07)); if (t >= 10 && t < 20) out.push(FXB('sp' + (t - 10), (p) => TT.fxBurst(p, (t - 10) / 10, '#9affb0', 8, 20, 140), [0.25, 1.17, -1.09], 0.12)); return out; },
  s7b: (f) => { const t = f - 357, out = []; out.push(FXC('dr', (p) => TT.fxDrop(p), [0.05, lerp(1.75, 1.47, ei(clamp(t / 8))), -1.0], 0.14)); if (t >= 8) out.push(FXB('sp' + (t - 8), (p) => TT.fxBurst(p, (t - 8) / 6, '#9affb0', 10, 20, 160), [0.05, 1.46, -0.98], 0.3)); return out; },
  s7c: (f) => { const t = f - 369; return [FXC('glw', (p) => TT.fxGlow(p, '110,255,130', 0.7), [0.35, 2.6, -1.6], 1.0), ...motes(f, 12, [0, 0, -1.6], [3, 2], 0.5, 3.5, 0.12, 'nm')]; },
  s8: (f) => { const t = (f - 393) / 51; return [FXC('in' + q(t, 2), (p) => TT.fxInner(p, t), [0, 1.3, 0.12], 1.15, { order: 7 })]; },
  s9: (f) => { const out = [...motes(f, 14, [0, 0, -1.2], [2.5, 2], 1.5, 3.2, 0.2, 'st')]; return out; },
  s10: (f) => { const out = [], t = f - 494; for (let i = 0; i < 12; i++) { const t0 = 2 + i * 1.6 + 12, d = t - t0; if (d >= 0 && d < 8) out.push(FXB('pl' + i % 3 + d, (p) => TT.fxBurst(p, d / 8, '#ffd070', 8, 20, 150), [Math.cos(i * 2.1) * 0.15, 1.45, -1.2 + Math.sin(i * 2.1) * 0.1], 0.35)); } return out; },
  s11: (f) => { const out = [...motes(f, 10, [0, 0, 11.5], [5, 3], 0.8, 4, 0.14, 'tm')]; if (f >= 560 && f < 600) out.push(FXC('st' + (f % 16), (p) => TT.fxStars(p, (f % 16) / 16), [0.1, 3.3 - 0.44, 12.9], 0.5)); return out; },
  s12a: () => [], s12b: () => [],
  s13: (f) => motes(f, 10, [0, 0, 0.4], [2, 2], 0.9, 2.6, 0.08, 'cm'),
  s14a: () => [], s14b: () => [],
  s15: (f) => (f >= 872 ? [FXC('vg', (p) => TT.fxGlow(p, '110,255,130', 0.35), [0.2, 1.55, -0.45], 0.35)] : []),
  s16: () => [],
  s17a: (f) => motes(f, 14, [0, 0, 11], [6, 6], 0.5, 4.5, 0.14, 'mm'),
  s17b: (f) => { const out = []; if (f >= 1060) out.push(FXC('wisp' + q(((f - 1060) * 0.05) % 1, 2), (p) => TT.fxWisp(p, (f - 1060) * 0.05, clamp((f - 1058) / 6) * (1 - 0.3 * ramp(f, 1066, 1078))), [-0.9, 1.62 + 0.45, 9.2], 0.5)); return out; },
  s18a: () => [], s18b: () => [], s19: () => [],
  s20a: (f) => motes(f, 8, [4.1, 0, 2.0], [1.5, 1.5], 0.9, 2.2, 0.08, 'lm'),
  s20b: (f) => motes(f, 8, [4.3, 0, 2.0], [0.8, 0.8], 0.9, 1.6, 0.05, 'lm'),
};
// little helpers drawn inside fx cards
const drawGob = (p) => { const g = p.g; g.save(); g.translate(300, 540); g.scale(2.2, 2.2); g.lineJoin = 'round';
  g.beginPath(); [[-34, -64], [34, -64], [26, -20], [8, -6], [6, 22], [22, 34], [-22, 34], [-6, 22], [-8, -6], [-26, -20]].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = '#e8b843'; g.fill(); g.lineWidth = 6; g.strokeStyle = '#1a1416'; g.stroke(); g.restore(); };
const drawTray = (p, landed) => { const g = p.g; g.save(); g.translate(300, 500); g.scale(1.8, 1.8); g.beginPath(); g.ellipse(0, 0, 100, 20, 0, 0, 7); g.fillStyle = '#d8d8e0'; g.fill(); g.lineWidth = 6; g.strokeStyle = '#1a1416'; g.stroke();
  if (!landed) for (const dx of [-50, 0, 50]) { g.save(); g.translate(dx, -40 - Math.abs(dx) * 0.4); g.rotate(dx * 0.02); g.scale(0.6, 0.6); g.beginPath(); [[-34, -64], [34, -64], [26, -20], [8, -6], [6, 22], [22, 34], [-22, 34], [-6, 22], [-8, -6], [-26, -20]].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = '#e8b843'; g.fill(); g.lineWidth = 8; g.stroke(); g.beginPath(); g.ellipse(0, -62, 30, 8, 0, 0, 7); g.fillStyle = '#4dff6a'; g.fill(); g.restore(); }
  g.restore(); };
export const fxAt = (f, T) => { TT = T; const S = shotAt(f), ox = OX[S.loc]; return FX[S.id](f).map((a) => ({ ...a, x: a.x + ox })); };
