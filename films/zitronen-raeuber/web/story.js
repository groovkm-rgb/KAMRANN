// "Der Zitronensaft-Räuber" — 1323 frames @30 fps (voice 43.60 s + 0.5 s tail). No captions; scene text German only.
// Phrase times (hand-checked against the 10 ms energy envelope of voice.mp3; Whisper models unreachable here):
//  0.10- 1.86 Ein Mann reibt sich das Gesicht mit Zitronensaft ein.   | 1.99- 3.60 Dann überfällt er zwei Banken.
//  3.90- 4.50 Ohne Maske. | 4.85- 5.22 Warum? | 5.58- 6.96 Weil er glaubt: Jetzt bin ich unsichtbar.
//  7.31- 9.83 Seine Logik: Mit Zitronensaft kann man unsichtbare Schrift machen. | 9.97-12.34 Also muss das doch auch mit Gesichtern klappen, oder?
// 12.63-13.85 Er testet das sogar vorher. | 14.10-14.86 Saft ins Gesicht, | 14.97-16.00 Sofortbildkamera, | 16.10-16.43 klick.
// 16.75-17.46 Auf dem Foto: | 17.68-18.29 kein Gesicht. | 18.55-19.47 Beweis erbracht! | 19.79-22.08 Wahrscheinlich hat er die Kamera einfach falsch gehalten.
// 22.58-23.22 Am selben Abend | 23.24-25.76 laufen die Bilder der Überwachungskameras in den Nachrichten. | 26.08-26.49 Sein Gesicht, | 26.90-27.69 klar und deutlich.
// 28.04-29.44 Kurz darauf klopft die Polizei. | 29.77-31.19 Und als sie ihm die Bilder zeigen, | 31.27-32.01 sagt er fassungslos: | 32.47-34.08 „Aber ich hatte doch den Saft drauf!"
// 34.59-35.58 Der Fall ist so absurd, | 35.67-37.41 dass zwei Psychologen anfangen zu forschen. | 37.70-38.39 Ihre Erkenntnis: | 38.62-40.90 Wer wenig Ahnung hat, überschätzt sich oft am meisten.
// 41.26-42.24 Heute kennt man das als | 42.31-43.31 Dunning-Kruger-Effekt.
import { K, BX, B2, BI, LR, PO, IR, OF, MS, CE, CAMPOS } from './scene.js';
export const FPS = 30, TOTAL = 1323;
export const SHOTS = [
  { id: 'hook', a: 0, b: 57, light: 'kitchen' },
  { id: 'bankExt', a: 58, b: 113, light: 'bankExt' },
  { id: 'wave', a: 114, b: 163, light: 'bankInt' },
  { id: 'ghost', a: 164, b: 215, light: 'bankInt' },
  { id: 'secret', a: 216, b: 296, light: 'kitchen' },
  { id: 'mirror', a: 297, b: 375, light: 'kitchen' },
  { id: 'tripod', a: 376, b: 420, light: 'kitchen' },
  { id: 'juice', a: 421, b: 447, light: 'kitchen' },
  { id: 'pose', a: 448, b: 481, light: 'kitchen' },
  { id: 'klick', a: 482, b: 499, light: 'kitchen' },
  { id: 'photo', a: 500, b: 553, light: 'kitchen' },
  { id: 'dance', a: 554, b: 590, light: 'kitchen' },
  { id: 'rewind', a: 591, b: 673, light: 'kitchen' },
  { id: 'living', a: 674, b: 721, light: 'living' },
  { id: 'tv', a: 722, b: 778, light: 'living' },
  { id: 'face', a: 779, b: 837, light: 'living' },
  { id: 'porch', a: 838, b: 889, light: 'porch' },
  { id: 'slide', a: 890, b: 936, light: 'interro' },
  { id: 'shock', a: 937, b: 969, light: 'interro' },
  { id: 'protest', a: 970, b: 1032, light: 'interro' },
  { id: 'news', a: 1033, b: 1068, light: 'office' },
  { id: 'psych', a: 1069, b: 1127, light: 'office' },
  { id: 'chalk', a: 1128, b: 1155, light: 'office' },
  { id: 'hero', a: 1156, b: 1233, light: 'stage' },
  { id: 'cell', a: 1234, b: 1267, light: 'cell' },
  { id: 'bars', a: 1268, b: 1322, light: 'cell' },
];
const REW = [591, 618]; // rewind window: picture runs backwards through shots 9b..8a
const remap = (f) => (f >= REW[0] && f <= REW[1]) ? Math.round(590 - (f - REW[0]) * 5.6) : f;
const shotAt0 = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
export const shotAt = (f) => shotAt0(remap(f));

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const easeOut = (t) => 1 - (1 - clamp(t)) ** 3.2;
const lerp = (a, b, t) => a + (b - a) * t, lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t)), ramp = (f, a, b) => clamp((f - a) / (b - a));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const at = (S, x, y, z) => [S[0] + x, S[1] + y, S[2] + z];
const add3 = (a, b) => a.map((v, i) => v + b[i]), sub3 = (a, b) => a.map((v, i) => v - b[i]), mul3 = (a, k) => a.map((v) => v * k);
const norm = (a) => { const l = Math.hypot(...a) || 1; return a.map((v) => v / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// ---------------- lights ----------------
const base = { az: 120, el: 55, fogNear: 60, fogFar: 600, waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#effaff', shadowExt: 9, sunSize: 0 };
export const LIGHTS = {
  kitchen: { ...base, az: 60, el: 62, sky: '#ffe6c4', ground: '#a8785a', hemi: 1.3, sun: '#fff0d4', sunI: 2.0, fog: '#f2d8b0', skyTop: '#f2d8b0', skyHor: '#f2d8b0', sat: 1.18, vig: 0.24, gain: '#fff4e8', lights: ['kitchen'] },
  bankExt: { ...base, az: 130, el: 48, sky: '#c8d6ea', ground: '#7a8290', hemi: 1.35, sun: '#eef2fa', sunI: 1.7, fog: '#c4d0e0', fogNear: 40, fogFar: 420, skyTop: '#6a90c4', skyHor: '#c8d6e6', sat: 1.08, vig: 0.22, gain: '#eef4ff', shadowExt: 16 },
  bankInt: { ...base, az: 100, el: 70, sky: '#dce6f4', ground: '#8a92a0', hemi: 1.45, sun: '#f2f6ff', sunI: 1.25, fog: '#b8c4d4', fogNear: 30, fogFar: 200, skyTop: '#b8c4d4', skyHor: '#b8c4d4', sat: 1.06, vig: 0.24, gain: '#eaf2ff', lights: ['bank'] },
  dream: { ...base, az: 100, el: 70, sky: '#f0e4ff', ground: '#9a92c0', hemi: 1.6, sun: '#ffffff', sunI: 1.3, fog: '#d8d0f0', fogNear: 30, fogFar: 200, skyTop: '#d8d0f0', skyHor: '#d8d0f0', sat: 1.35, vig: 0.3, gain: '#f4ecff', lift: '#14102a', lights: ['bank'] },
  living: { ...base, az: 200, el: 40, sky: '#ffc890', ground: '#6a4a3a', hemi: 0.95, sun: '#ffb878', sunI: 1.0, fog: '#3a2a2a', fogNear: 30, fogFar: 200, skyTop: '#2a2040', skyHor: '#3a2a40', sat: 1.16, vig: 0.36, gain: '#fff0e0', lights: ['living', 'tv'] },
  porch: { ...base, az: 160, el: 35, sky: '#5a6ab0', ground: '#2a2a44', hemi: 0.75, sun: '#9ab0ff', sunI: 0.8, fog: '#141a38', fogNear: 25, fogFar: 160, skyTop: '#070b24', skyHor: '#1e2654', sat: 1.12, vig: 0.42, gain: '#f0f0ff', lights: ['porch', 'inside'], shadowExt: 8 },
  interro: { ...base, az: 90, el: 82, sky: '#d0a070', ground: '#3a3028', hemi: 0.72, sun: '#ffd8a0', sunI: 1.25, fog: '#2a2420', fogNear: 20, fogFar: 120, skyTop: '#2a2420', skyHor: '#2a2420', sat: 1.08, vig: 0.5, gain: '#ffe8cc', lights: ['interro'], shadowExt: 6 },
  office: { ...base, az: 40, el: 50, sky: '#ffe0c0', ground: '#8a6a4a', hemi: 1.25, sun: '#ffe6c4', sunI: 1.8, fog: '#e8d0b0', fogNear: 30, fogFar: 200, skyTop: '#e8d0b0', skyHor: '#e8d0b0', sat: 1.14, vig: 0.26, gain: '#fff4e4', lights: ['office'] },
  stage: { ...base, az: 90, el: 72, sky: '#8a6ac8', ground: '#3a2a5a', hemi: 0.85, sun: '#ffe2b0', sunI: 1.9, fog: '#2a1a40', fogNear: 20, fogFar: 120, skyTop: '#2a1a40', skyHor: '#2a1a40', sat: 1.2, vig: 0.45, gain: '#fff2e8', lights: ['stage'] },
  cell: { ...base, az: 250, el: 58, sky: '#a0b4dc', ground: '#3a4050', hemi: 0.85, sun: '#c8d8ff', sunI: 1.2, fog: '#1a2030', fogNear: 20, fogFar: 120, skyTop: '#1a2030', skyHor: '#1a2030', sat: 1.08, vig: 0.42, gain: '#eef2ff', lights: ['cell'] },
};
export const lightFor = (S, f) => { const g = remap(f); let L = LIGHTS[shotAt0(g).light];
  if (shotAt0(g).id === 'ghost' && g < 192) L = LIGHTS.dream;
  if (shotAt0(g).id === 'rewind' && g >= 626 && g < 632) L = { ...L, hemi: L.hemi * 1.6 };
  return L; };

// ---------------- camera ----------------
const path = (f, Kk) => {
  if (f <= Kk[0].f) return { ...Kk[0] }; if (f >= Kk[Kk.length - 1].f) return { ...Kk[Kk.length - 1] };
  for (let i = 0; i < Kk.length - 1; i++) if (f >= Kk[i].f && f < Kk[i + 1].f) {
    const a = Kk[i], b = Kk[i + 1]; if (b.cut) return { ...a };
    const r = (f - a.f) / (b.f - a.f), t = b.e === 'out' ? easeOut(r) : b.e === 'lin' ? r : smooth(r);
    return { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) };
  }
};
const KICKS = [{ f: 129, a: 0.03 }, { f: 137, a: 0.05 }, { f: 192, a: 0.03 }, { f: 484, a: 0.03 }, { f: 555, a: 0.025 }, { f: 628, a: 0.02 }, { f: 806, a: 0.04 }, { f: 858, a: 0.015 }, { f: 862, a: 0.015 }, { f: 866, a: 0.015 }, { f: 940, a: 0.03 }, { f: 1290, a: 0.03 }];
// man's key positions
const M_HOOK = at(K, 0, 0, -0.9), M_MIR = at(K, 0.05, 0, -1.45), M_POSE = at(K, -1.8, 0, -0.9), TRI = at(K, -1.35, 0, 1.35);
const M_UNDER = at(BI, 0, 0, 4.0), M_COUNTER = at(BI, 0.12, 0, -3.45), TELLER_P = at(BI, 0.92, 0, -5.2);
const CCTV_POS = [CAMPOS[0], CAMPOS[1] - 0.05, CAMPOS[2] + 0.12];
/** head position of a card pitched toward camera `cp` (mirrors main.js face:true) */
const pitchedHead = (b, cp, s = 0.95, pivotH = 1.0) => { const hd = Math.hypot(cp[0] - b[0], cp[2] - b[2]), pitch = -Math.atan2(cp[1] - (b[1] + pivotH * s), hd), h = 1.52 * s;
  const ax = (b[0] - cp[0]) / hd, az = (b[2] - cp[2]) / hd; return [b[0] + ax * h * Math.sin(-pitch), b[1] + h * Math.cos(pitch), b[2] + az * h * Math.sin(-pitch)]; };
const H_CCTV = pitchedHead(M_UNDER, CCTV_POS);
const TVS = at(LR, 1.5533, 1.06, -0.0325), TVN = [-0.9004, 0, 0.435];
const M_COUCH = at(LR, 0.35, 0.06, -2.05);
const M_DOOR = at(PO, 0, 0.3, -0.42);
const M_SIT = at(IR, 0, -0.09, -0.95);
const PROF_P = at(OF, -0.7, 0, -0.55), STUD_P = at(OF, 0.72, 0, -0.5);
const M_MS = at(MS, 0.72, 0, 0.15);
const M_BUNK = at(CE, -0.95, 0.07, -0.78), M_BARS = at(CE, 0.28, 0, 1.43);
const HEAD = (p, s = 0.95) => [p[0], p[1] + 1.52 * s, p[2]];

const CAMS = {
  hook: [
    { f: 0, pos: at(K, 0.06, 1.4, 0.55), look: at(K, 0.05, 1.38, 0.0), fov: 40, roll: -2 },
    { f: 18, pos: at(K, 0.05, 1.4, 0.5), look: at(K, 0.05, 1.38, 0.0), fov: 37, roll: -1, e: 'lin' },
    { f: 28, pos: at(K, 0.12, 1.5, 1.05), look: HEAD(M_HOOK), fov: 40, roll: 2, e: 'out' },
    { f: 57, pos: at(K, 0.1, 1.48, 0.86), look: HEAD(M_HOOK), fov: 38, roll: 3, e: 'lin' }],
  bankExt: [
    { f: 58, pos: at(BX, 3.4, 1.7, 10.2), look: at(BX, 1.3, 3.15, 0.5), fov: 50, roll: 3 },
    { f: 66, pos: at(BX, 3.0, 1.7, 9.8), look: at(BX, 1.0, 3.12, 0.5), fov: 48, roll: 2, e: 'out' },
    { f: 86, pos: at(BX, 2.6, 1.7, 9.3), look: at(BX, 0.7, 3.1, 0.5), fov: 47, roll: 1.5, e: 'lin' },
    { f: 87, pos: at(B2, -3.0, 1.7, 9.6), look: at(B2, -1.2, 3.35, 0.5), fov: 50, roll: -3, cut: true },
    { f: 95, pos: at(B2, -2.3, 1.7, 9.2), look: at(B2, -0.5, 3.35, 0.5), fov: 48, roll: -2, e: 'out' },
    { f: 113, pos: at(B2, -1.9, 1.7, 8.7), look: at(B2, -0.3, 3.3, 0.5), fov: 47, roll: -1.5, e: 'lin' }],
  wave: [
    { f: 114, pos: at(BI, 0.9, 0.55, 7.1), look: at(BI, 0.05, 2.55, 3.2), fov: 50, roll: 4 },
    { f: 122, pos: at(BI, 0.75, 0.6, 6.8), look: at(BI, 0.0, 2.6, 3.2), fov: 48, roll: 3, e: 'out' },
    { f: 128, pos: at(BI, 0.7, 0.62, 6.7), look: at(BI, 0.0, 2.6, 3.2), fov: 47, roll: 3, e: 'lin' },
    { f: 129, pos: CCTV_POS, look: add3(H_CCTV, [0, -0.35, 0]), fov: 50, roll: 0, cut: true },
    { f: 136, pos: CCTV_POS, look: add3(H_CCTV, [0, -0.35, 0]), fov: 48, roll: 0, e: 'lin' },
    { f: 137, pos: CCTV_POS, look: add3(H_CCTV, [0, -0.04, 0]), fov: 21, roll: 0, cut: true },
    { f: 163, pos: CCTV_POS, look: add3(H_CCTV, [0, -0.04, 0]), fov: 19, roll: 0, e: 'lin' }],
  ghost: [
    { f: 164, pos: at(BI, 0.25, 1.7, 1.6), look: at(BI, 0.38, 1.38, -4.0), fov: 50, roll: 3 },
    { f: 172, pos: at(BI, 0.22, 1.67, 1.3), look: at(BI, 0.36, 1.38, -4.0), fov: 48, roll: 2, e: 'out' },
    { f: 215, pos: at(BI, 0.2, 1.65, 1.0), look: at(BI, 0.35, 1.39, -4.0), fov: 46, roll: 1, e: 'lin' }],
  secret: [
    { f: 216, pos: at(K, -0.4, 1.55, 1.35), look: at(K, -0.03, 0.83, 0.38), fov: 38, roll: 4 },
    { f: 224, pos: at(K, -0.28, 1.5, 1.25), look: at(K, -0.03, 0.83, 0.38), fov: 36, roll: 2, e: 'out' },
    { f: 258, pos: at(K, -0.22, 1.46, 1.18), look: at(K, -0.02, 0.83, 0.38), fov: 35, roll: 1, e: 'lin' },
    { f: 270, pos: at(K, 0.5, 1.36, 1.85), look: at(K, 0.5, 1.22, 0.24), fov: 38, roll: -2, e: 'out' },
    { f: 296, pos: at(K, 0.5, 1.35, 1.7), look: at(K, 0.5, 1.23, 0.24), fov: 37, roll: -3, e: 'lin' }],
  mirror: [
    { f: 297, pos: at(K, -0.2, 1.4, 1.35), look: at(K, 0.5, 1.45, -1.9), fov: 44, roll: 3 },
    { f: 305, pos: at(K, -0.1, 1.42, 1.1), look: at(K, 0.52, 1.46, -1.9), fov: 42, roll: 2, e: 'out' },
    { f: 375, pos: at(K, 0.0, 1.43, 0.8), look: at(K, 0.55, 1.47, -1.9), fov: 40, roll: 0, e: 'lin' }],
  tripod: [
    { f: 376, pos: at(K, -0.6, 1.4, 4.1), look: at(K, -1.55, 1.25, 1.2), fov: 44, roll: -3 },
    { f: 384, pos: at(K, -0.75, 1.38, 3.85), look: at(K, -1.55, 1.25, 1.2), fov: 42, roll: -2, e: 'out' },
    { f: 420, pos: at(K, -0.85, 1.36, 3.6), look: at(K, -1.55, 1.25, 1.18), fov: 40, roll: -1, e: 'lin' }],
  juice: [
    { f: 421, pos: at(K, -1.55, 1.48, 0.45), look: HEAD(M_POSE), fov: 38, roll: 5 },
    { f: 426, pos: at(K, -1.62, 1.47, 0.25), look: HEAD(M_POSE), fov: 36, roll: 4, e: 'out' },
    { f: 447, pos: at(K, -1.65, 1.47, 0.15), look: HEAD(M_POSE), fov: 35, roll: 3, e: 'lin' }],
  pose: [
    { f: 448, pos: at(K, -0.95, 1.8, 2.05), look: at(K, -1.74, 1.4, -0.9), fov: 34, roll: -4 },
    { f: 454, pos: at(K, -0.98, 1.78, 1.9), look: at(K, -1.75, 1.4, -0.9), fov: 32, roll: -3, e: 'out' },
    { f: 481, pos: at(K, -1.0, 1.77, 1.8), look: at(K, -1.76, 1.41, -0.9), fov: 30, roll: -2, e: 'lin' }],
  klick: [
    { f: 482, pos: at(K, -1.55, 1.5, 0.45), look: at(K, -1.35, 1.44, 1.35), fov: 36, roll: 6 },
    { f: 487, pos: at(K, -1.52, 1.49, 0.55), look: at(K, -1.35, 1.44, 1.35), fov: 34, roll: 5, e: 'out' },
    { f: 499, pos: at(K, -1.5, 1.49, 0.6), look: at(K, -1.35, 1.44, 1.35), fov: 33, roll: 5, e: 'lin' }],
  photo: [
    { f: 500, pos: at(K, -1.65, 1.42, 0.55), look: at(K, -1.78, 1.36, -0.9), fov: 40, roll: -3 },
    { f: 506, pos: at(K, -1.68, 1.42, 0.45), look: at(K, -1.78, 1.36, -0.9), fov: 38, roll: -2, e: 'out' },
    { f: 553, pos: at(K, -1.7, 1.42, 0.32), look: at(K, -1.78, 1.36, -0.9), fov: 36, roll: -1, e: 'lin' }],
  dance: [
    { f: 554, pos: at(K, -1.0, 0.85, 2.1), look: at(K, -1.78, 1.35, -0.9), fov: 46, roll: 5 },
    { f: 561, pos: at(K, -1.12, 0.9, 1.85), look: at(K, -1.78, 1.35, -0.9), fov: 44, roll: 4, e: 'out' },
    { f: 590, pos: at(K, -1.2, 0.92, 1.65), look: at(K, -1.79, 1.38, -0.9), fov: 42, roll: 3, e: 'lin' }],
  rewind: [
    { f: 619, pos: at(K, 2.75, 1.55, 0.25), look: at(K, -1.55, 1.6, 0.25), fov: 68, roll: 0 },
    { f: 627, pos: at(K, 2.65, 1.55, 0.25), look: at(K, -1.55, 1.62, 0.25), fov: 66, roll: -1, e: 'out' },
    { f: 640, pos: at(K, 2.55, 1.55, 0.25), look: at(K, -1.55, 1.64, 0.25), fov: 64, roll: -1, e: 'lin' },
    { f: 650, pos: at(K, -2.6, 1.45, 1.2), look: at(K, -1.4, 1.56, 1.42), fov: 44, roll: -5, e: 'out' },
    { f: 673, pos: at(K, -2.5, 1.46, 1.22), look: at(K, -1.4, 1.57, 1.42), fov: 40, roll: -6, e: 'lin' }],
  living: [
    { f: 674, pos: at(LR, -0.75, 1.38, 3.2), look: at(LR, 1.05, 1.0, -1.2), fov: 58, roll: -3 },
    { f: 682, pos: at(LR, -0.62, 1.36, 3.0), look: at(LR, 1.1, 1.0, -1.2), fov: 56, roll: -2, e: 'out' },
    { f: 721, pos: at(LR, -0.5, 1.34, 2.75), look: at(LR, 1.15, 1.0, -1.2), fov: 54, roll: -1, e: 'lin' }],
  tv: [
    { f: 722, pos: add3(TVS, add3(mul3(TVN, 3.2), [0.6, 0.2, 0.3])), look: add3(TVS, [0, 0.12, 0]), fov: 44, roll: 3 },
    { f: 732, pos: add3(TVS, add3(mul3(TVN, 2.5), [0, 0.02, 0])), look: add3(TVS, [0, 0.09, 0]), fov: 40, roll: 1, e: 'out' },
    { f: 778, pos: add3(TVS, add3(mul3(TVN, 2.25), [0, 0.02, 0])), look: add3(TVS, [0, 0.09, 0]), fov: 40, roll: 0, e: 'lin' }],
  face: [
    { f: 779, pos: add3(TVS, add3(mul3(TVN, 1.7), [0, 0.06, 0])), look: add3(TVS, [0, -0.02, 0]), fov: 40, roll: 0 },
    { f: 783, pos: add3(TVS, add3(mul3(TVN, 1.25), [0, 0.06, 0])), look: add3(TVS, [0, -0.02, 0]), fov: 40, roll: 0, e: 'out' },
    { f: 801, pos: add3(TVS, add3(mul3(TVN, 1.12), [0, 0.06, 0])), look: add3(TVS, [0, -0.02, 0]), fov: 40, roll: 0, e: 'lin' },
    { f: 802, pos: at(LR, 0.9, 1.15, 0.0), look: at(LR, 0.25, 1.15, -2.05), fov: 46, roll: -5, cut: true },
    { f: 810, pos: at(LR, 0.75, 1.13, -0.3), look: at(LR, 0.3, 1.18, -2.05), fov: 44, roll: -4, e: 'out' },
    { f: 837, pos: at(LR, 0.7, 1.12, -0.42), look: at(LR, 0.3, 1.2, -2.05), fov: 42, roll: -3, e: 'lin' }],
  porch: [
    { f: 838, pos: at(PO, 0.6, 1.05, 6.3), look: at(PO, 0.05, 1.7, 0.0), fov: 50, roll: 3 },
    { f: 846, pos: at(PO, 0.45, 1.08, 5.9), look: at(PO, 0.05, 1.7, 0.0), fov: 48, roll: 2, e: 'out' },
    { f: 868, pos: at(PO, 0.35, 1.1, 5.6), look: at(PO, 0.05, 1.7, 0.0), fov: 47, roll: 1, e: 'lin' },
    { f: 876, pos: at(PO, 0.2, 1.3, 3.7), look: add3(HEAD(M_DOOR), [0, -0.1, 0]), fov: 40, roll: 0, e: 'out' },
    { f: 889, pos: at(PO, 0.18, 1.32, 3.5), look: add3(HEAD(M_DOOR), [0, -0.1, 0]), fov: 38, roll: -1, e: 'lin' }],
  slide: [
    { f: 890, pos: at(IR, 0.4, 1.7, 0.85), look: at(IR, 0.0, 0.85, -0.12), fov: 44, roll: -4 },
    { f: 898, pos: at(IR, 0.3, 1.62, 0.72), look: at(IR, 0.0, 0.85, -0.15), fov: 42, roll: -3, e: 'out' },
    { f: 936, pos: at(IR, 0.25, 1.58, 0.62), look: at(IR, 0.0, 0.86, -0.18), fov: 40, roll: -2, e: 'lin' }],
  shock: [
    { f: 937, pos: at(IR, 0.25, 1.48, 1.0), look: HEAD(M_SIT), fov: 40, roll: 4 },
    { f: 942, pos: at(IR, 0.12, 1.46, 0.62), look: HEAD(M_SIT), fov: 38, roll: 5, e: 'out' },
    { f: 969, pos: at(IR, 0.1, 1.46, 0.5), look: HEAD(M_SIT), fov: 37, roll: 6, e: 'lin' }],
  protest: [
    { f: 970, pos: at(IR, -0.5, 1.45, 3.4), look: at(IR, 0.0, 1.35, -0.9), fov: 54, roll: -3 },
    { f: 978, pos: at(IR, -0.3, 1.46, 3.2), look: at(IR, 0.0, 1.35, -0.9), fov: 52, roll: -2, e: 'out' },
    { f: 1032, pos: at(IR, -0.18, 1.47, 3.0), look: at(IR, 0.0, 1.37, -0.9), fov: 51, roll: -1, e: 'lin' }],
  news: [
    { f: 1033, pos: at(OF, -0.25, 1.62, 2.85), look: at(OF, -0.42, 1.6, 0.05), fov: 40, roll: 4 },
    { f: 1040, pos: at(OF, -0.35, 1.62, 2.55), look: at(OF, -0.45, 1.6, 0.05), fov: 38, roll: 3, e: 'out' },
    { f: 1068, pos: at(OF, -0.4, 1.62, 2.4), look: at(OF, -0.45, 1.6, 0.05), fov: 37, roll: 2, e: 'lin' }],
  psych: [
    { f: 1069, pos: at(OF, -0.4, 1.47, 2.6), look: at(OF, -0.1, 1.38, -0.5), fov: 46, roll: 2 },
    { f: 1078, pos: at(OF, -0.1, 1.45, 2.85), look: at(OF, 0.0, 1.4, -0.5), fov: 46, roll: 0, e: 'out' },
    { f: 1127, pos: at(OF, 0.0, 1.45, 2.55), look: at(OF, 0.0, 1.42, -0.5), fov: 44, roll: -1, e: 'lin' }],
  chalk: [
    { f: 1128, pos: at(OF, 0.3, 1.5, 0.9), look: at(OF, -0.45, 1.55, -2.3), fov: 50, roll: -4 },
    { f: 1135, pos: at(OF, 0.2, 1.52, 0.7), look: at(OF, -0.45, 1.55, -2.3), fov: 48, roll: -3, e: 'out' },
    { f: 1155, pos: at(OF, 0.15, 1.53, 0.55), look: at(OF, -0.45, 1.56, -2.3), fov: 46, roll: -2, e: 'lin' }],
  hero: [
    { f: 1156, pos: at(MS, 0.3, 1.05, 4.6), look: at(MS, -0.05, 1.5, -0.3), fov: 46, roll: 4 },
    { f: 1165, pos: at(MS, 0.15, 1.15, 4.2), look: at(MS, -0.05, 1.5, -0.3), fov: 44, roll: 2, e: 'out' },
    { f: 1233, pos: at(MS, 0.05, 1.2, 3.75), look: at(MS, -0.05, 1.5, -0.3), fov: 42, roll: 0, e: 'lin' }],
  cell: [
    { f: 1234, pos: at(CE, 0.4, 1.2, 3.3), look: at(CE, -0.8, 1.25, -0.6), fov: 44, roll: -3 },
    { f: 1241, pos: at(CE, 0.25, 1.22, 3.05), look: at(CE, -0.85, 1.25, -0.6), fov: 42, roll: -2, e: 'out' },
    { f: 1267, pos: at(CE, 0.15, 1.24, 2.9), look: at(CE, -0.88, 1.27, -0.65), fov: 41, roll: -1, e: 'lin' }],
  bars: [
    { f: 1268, pos: at(CE, 0.9, 1.3, 3.6), look: add3(HEAD(M_BARS), [0, -0.1, 0]), fov: 44, roll: 3 },
    { f: 1276, pos: at(CE, 0.55, 1.36, 3.2), look: add3(HEAD(M_BARS), [0, -0.1, 0]), fov: 42, roll: 2, e: 'out' },
    { f: 1300, pos: at(CE, 0.42, 1.4, 2.95), look: add3(HEAD(M_BARS), [0, -0.08, 0]), fov: 40, roll: 1, e: 'lin' },
    { f: 1322, pos: at(CE, 0.36, 1.42, 2.75), look: add3(HEAD(M_BARS), [0, -0.06, 0]), fov: 38, roll: 0, e: 'lin' }],
};
// whips (motion blur + lateral swing) at these frame windows: [from, to, dirX, dirY]
const WHIPS = [[56, 61, 0, 0.09], [84, 90, 0.12, 0], [111, 116, 0, -0.08], [213, 218, 0.1, 0], [295, 299, -0.09, 0], [374, 378, 0.1, 0], [419, 423, -0.08, 0.02],
  [445, 450, 0.1, 0], [498, 502, 0, 0.08], [552, 556, 0.06, 0.06], [672, 676, 0.1, 0], [720, 724, 0.08, 0], [800, 804, -0.13, 0], [836, 840, 0.1, 0],
  [888, 892, 0, 0.1], [935, 939, 0.09, 0], [968, 972, -0.08, 0], [1031, 1035, 0.1, 0], [1067, 1071, 0, -0.08], [1126, 1130, -0.09, 0], [1154, 1158, 0.1, 0], [1232, 1236, -0.1, 0], [1266, 1270, 0.09, 0]];
const FLASHES = [[484, 0.95, 5], [192, 0.7, 3], [129, 0.5, 2], [137, 0.6, 2], [628, 0.65, 4], [1268, 0.0, 0]];

const camAt0 = (f) => {
  const S = shotAt0(f); let c;
  if (S.id === 'rewind' && f < 619) c = path(618, CAMS.rewind); else c = path(f, CAMS[S.id]);
  c = { ...c, pos: [...c.pos], look: [...c.look] };
  for (const k of KICKS) { const d = f - k.f; if (d >= 0 && d < 7) { const s = (d % 2 ? -1 : 1) * k.a * (1 - d / 7); c.look[1] += s * 3; c.look[0] += s * 2; c.roll = (c.roll || 0) + s * 20; } }
  // hero kick when he waves
  let flash = 0; for (const [ff, a, n] of FLASHES) if (n && f >= ff && f < ff + n) flash = Math.max(flash, a * (1 - (f - ff) / n));
  c.flash = flash;
  const post = {};
  for (const [a, b, dx, dy] of WHIPS) if (f >= a && f <= b) { const m = Math.abs(f - (a + b) / 2) < 1.6 ? 1 : 0.55; post.mblur = [dx * m, dy * m]; }
  if (S.id === 'wave' && f >= 129) { post.cctv = 1; post.rec = (f % 24) < 14 ? 1 : 0; }
  if (S.id === 'hook') { // juice drops on the lens
    const D = [[0.2, 0.7, 0.08, 6], [0.8, 0.4, 0.065, 9], [0.7, 0.84, 0.05, 11], [0.24, 0.26, 0.06, 13], [0.84, 0.66, 0.045, 10]];
    post.drops = D.map(([x, y, r, f0]) => { const a = clamp((f - f0) / 3) * (1 - smooth(ramp(f, 34, 48))); return [x, y - Math.max(0, f - f0) * 0.0016, r, q(a, 3)]; }).filter((d) => d[3] > 0.01);
  }
  c.post = post; c.shadowAt = c.look;
  return c;
};
export const camAt = (f) => { const g = remap(f); const c = camAt0(g); if (g !== f) { c.post = { ...c.post, rew: 1, mblur: [0, 0] }; c.flash = 0; } return c; };

export const dofAt = (f) => {
  const g = remap(f), S = shotAt0(g), C = camAt0(g), F = (p, cinf = 12) => ({ focus: dist(C.pos, p), cinf });
  switch (S.id) {
    case 'hook': return g < 22 ? F(at(K, 0.05, 1.38, 0.0), 14) : F(HEAD(M_HOOK), 12);
    case 'bankExt': return { focus: 7, cinf: 4 };
    case 'wave': return g < 129 ? F(HEAD(M_UNDER), 7) : { focus: 3, cinf: 0 };
    case 'ghost': return F(HEAD(M_COUNTER), 10);
    case 'secret': return g < 262 ? F(at(K, -0.05, 0.82, 0.42), 12) : F(at(K, 0.5, 1.3, 0.22), 12);
    case 'mirror': return F(HEAD(M_MIR), 10);
    case 'tripod': return F(at(K, -1.5, 1.35, 1.3), 9);
    case 'juice': return F(HEAD(M_POSE), 13);
    case 'pose': return F(HEAD(M_POSE), 12);
    case 'klick': return F(at(K, -1.35, 1.44, 1.35), 13);
    case 'photo': return F(add3(C.pos, mul3(norm(sub3(C.look, C.pos)), 0.5)), 14);
    case 'dance': return F(HEAD(M_POSE), 8);
    case 'rewind': return g < 650 ? F(at(K, -1.5, 1.5, 0.3), 4) : F(at(K, -1.35, 1.6, 1.35), 10);
    case 'living': return F(HEAD(M_COUCH), 8);
    case 'tv': case 'face': return g < 802 ? { focus: dist(C.pos, TVS), cinf: 8 } : F(HEAD(M_COUCH), 12);
    case 'porch': return g < 870 ? F(at(PO, 0, 1.6, 1.6), 8) : F(HEAD(M_DOOR), 10);
    case 'slide': return F(at(IR, 0, 0.82, -0.15), 12);
    case 'shock': return F(HEAD(M_SIT), 14);
    case 'protest': return F(at(IR, 0, 1.35, -0.6), 8);
    case 'news': return F(at(OF, -0.45, 1.35, 0.05), 12);
    case 'psych': return F(at(OF, 0, 1.5, -0.5), 9);
    case 'chalk': return F(at(OF, -0.4, 1.6, -2.1), 10);
    case 'hero': return F(at(MS, 0, 1.5, -0.2), 7);
    case 'cell': return F(HEAD(M_BUNK), 11);
    case 'bars': return F(HEAD(M_BARS), 12);
  }
  return { focus: 5, cinf: 0 };
};

export const worldAt = (f) => {
  const g = remap(f), S = shotAt0(g), L = LIGHTS[S.light], W = { lights: L.lights || [] };
  W.camYaw = 3.34; W.camTilt = 0;
  if (['rewind'].includes(S.id) && g >= 619) W.camTilt = 1.15;
  W.camFlash = (g >= 484 && g < 488) || (g >= 628 && g < 632);
  if (S.id === 'bankExt') W.bankDoor = g < 87 ? smooth(ramp(g, 70, 86)) * 0.9 : 0;
  W.secTilt = 0.62;
  // secret writing
  if (S.id === 'secret' || S.id === 'mirror') {
    const write = S.id === 'secret' ? smooth(ramp(g, 222, 252)) : 1, wet = S.id === 'secret' ? 1 - smooth(ramp(g, 252, 262)) : 0;
    const lift = S.id === 'secret' ? smooth(ramp(g, 262, 274)) : 1, reveal = S.id === 'secret' ? smooth(ramp(g, 271, 294)) : 1;
    W.paperS = { write: q(write), wet: q(wet), reveal: q(reveal) };
    W.paperLift = S.id === 'secret' ? q(lift, 3) : 0;
    if (S.id === 'secret' && g < 258) { const t = write; W.brush = { p: at(K, -0.2 + t * 0.32, 0.86 + Math.abs(Math.sin(g * 0.7)) * 0.012, 0.44 + Math.sin(g * 0.9) * 0.025), rz: -0.6, rx: -0.3 }; }
  }
  if (S.id === 'mirror') { W.paperLift = 0; W.mirrorK = { expr: g < 326 ? 'neutral' : g < 345 ? 'goofy' : 'sly', turn: g < 326 ? 0.3 : 0.6, look: g < 326 ? 0 : 0.6 }; }
  if (S.id === 'hook') W.mirrorK = { expr: 'sour', wet: 0.8 };
  // TV
  if (S.id === 'living') W.tv = { mode: 'news' };
  if (S.id === 'tv') W.tv = { mode: 'news', zoom: q(1 + smooth(ramp(g, 740, 778)) * 0.25) };
  if (S.id === 'face') W.tv = { mode: 'face', zoom: q(1 + ramp(g, 779, 837) * 0.15) };
  if (S.id === 'porch') W.porchDoor = smooth(ramp(g, 868, 878)) * 0.9;
  // interrogation photos slide in
  if (S.light === 'interro') { const t = S.id === 'slide' ? easeOut(ramp(g, 896, 916)) : 1, t2 = S.id === 'slide' ? easeOut(ramp(g, 904, 924)) : 1, t3 = S.id === 'slide' ? easeOut(ramp(g, 912, 932)) : 1;
    W.photos = [[lerp(0.1, -0.02, t), lerp(0.85, -0.18, t), lerp(0.4, -0.05, t)], [lerp(0.4, 0.28, t2), lerp(0.85, -0.1, t2), lerp(0.6, 0.18, t2)], [lerp(-0.3, -0.3, t3), lerp(0.9, -0.08, t3), lerp(-0.5, -0.2, t3)]]; }
  else W.noPhotos = true;
  // newspaper
  if (S.id === 'news') W.news = { p: [-0.45, 1.36, 0.02], rx: -0.04, rz: q(Math.sin(g * 0.08) * 0.015, 3) };
  if (S.id === 'psych') { const t = smooth(ramp(g, 1072, 1086)); W.news = { p: [lerp(-0.45, -0.3, t), lerp(1.36, 0.83, t), lerp(0.02, 0.45, t)], rx: lerp(-0.04, -Math.PI / 2 + 0.02, t), rz: lerp(0, 0.3, t) }; }
  if (S.id === 'chalk') W.news = { p: [-0.3, 0.83, 0.45], rx: -Math.PI / 2 + 0.02, rz: 0.3 };
  if (S.id === 'hero') W.hero = { t: q((g - 1156) / 30, 2) };
  return W;
};

// ---------------- actors ----------------
const blinkAt = (f, seed) => { const per = 46 + (seed * 17) % 30, ph = (f + seed * 13) % per; return ph < 2 ? 1 : 0; };
let TT = null;
const C_ = (T, spec, o, pos, extra = {}) => ({ key: JSON.stringify([spec === 'back' ? extra.bspec : spec, o, extra.flipX || 0]), draw: extra.back ? (p) => T.toonBack(p, extra.bspec, o) : (p) => { if (extra.flipX) { p.g.translate(600, 0); p.g.scale(-1, 1); } T.toonChar(p, spec, o); }, x: pos[0], y: pos[1], z: pos[2], ...extra });
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 6, ...extra });
/** place a 2D fx/prop card so that its design point (300,500) sits `d` metres in front of the camera, offset ox/oy metres in view space */
const screenPos = (C, d, ox = 0, oy = 0, s = 1) => { const fw = norm(sub3(C.look, C.pos)), rt = norm(cross(fw, [0, 1, 0])), up = cross(rt, fw);
  const p = add3(add3(add3(C.pos, mul3(fw, d)), mul3(rt, ox)), mul3(up, oy)); return [p[0], p[1] - 1.069 * s, p[2]]; };
const LM = (T) => T.LEMONMAN;
const wetAt = (f) => f < 24 ? 0 : clamp((f - 24) / 14) * 0.9;

const actorsAt0 = (f, T) => {
  const S = shotAt0(f), out = [], LMN = T.LEMONMAN, s = 0.95;
  const man = (o, pos, extra = {}) => out.push(C_(T, LMN, { seed: 5, ...o }, pos, { s, order: 3, ...extra }));
  switch (S.id) {
    case 'hook': {
      const rub = f >= 22 && f < 44, r = Math.sin(f * 1.4) * 14;
      const o = f < 22 ? { expr: 'sly', L: 'hang', R: 'hang' } : rub ? { expr: 'sour', L: { x: 185, y: 290 + r, b: 0.6 }, R: { x: 415, y: 300 - r, b: 0.6 }, wet: q(wetAt(f)), headTilt: q(Math.sin(f * 0.9) * 3, 1), bob: q(Math.abs(Math.sin(f * 0.7)) * 0.008, 3) }
        : { expr: 'sly', L: 'thumb', R: { x: 470, y: 470, b: 0.6 }, holdR: 'lemon', wet: 0.9, headTilt: -3, blink: f > 50 && f < 53 ? 1 : 0 };
      man(o, M_HOOK); break; }
    case 'bankExt': {
      if (f < 87) { const t = ramp(f, 58, 86), p = [lerp(BX[0] + 2.8, BX[0] + 0.9, t), 0, lerp(3.6, 1.5, t)];
        man({ expr: 'smug', turn: -0.35, legs: 'walk', step: q((f % 16) / 16), L: { x: 140, y: 500, b: 0.5 }, R: 'hang', holdL: 'sack', wet: 0.5, bob: q(Math.abs(Math.sin(f / 16 * Math.PI * 2)) * 0.015, 3) }, p); }
      else { const t = ramp(f, 87, 113), p = [lerp(B2[0] - 1.6, B2[0] - 0.4, t), 0, lerp(2.6, 1.3, t)];
        man({ expr: 'sly', turn: 0.4, look: 0.6, legs: 'walk', step: q((f % 16) / 16), L: 'hang', R: 'thumb', holdL: 'sack', wet: 0.5, bob: q(Math.abs(Math.sin(f / 16 * Math.PI * 2)) * 0.015, 3) }, p); }
      break; }
    case 'wave': {
      const w = q(Math.sin(f * 0.9) * 26, 0);
      man({ expr: f < 129 ? 'goofy' : 'sly', lookY: f < 129 ? -1 : 0, L: { x: 160, y: 520, b: 0.6 }, holdL: 'lemon', R: { x: 520 + w, y: 120 - Math.abs(w) * 0.3, b: 1 }, wet: 0.6, headTilt: f < 129 ? -6 : 0, blink: blinkAt(f, 2) }, M_UNDER, { face: true, pivotH: 1.0 });
      // queue in the background (looking at him)
      out.push(C_(T, T.SUIT, { expr: 'stunned', turn: 0.3, look: 0.6 }, at(BI, -1.4, 0, -0.9), { s: 1.05 }));
      out.push(C_(T, T.GRANNY, { expr: 'shock', turn: 0.3, look: 0.6, R: 'hang', holdR: 'shopbag' }, at(BI, -2.6, 0, -0.95), { s: 0.98 }));
      break; }
    case 'ghost': {
      const ghost = f < 192, pop = f >= 192;
      out.push(C_(T, T.TELLER, { expr: f < 192 ? 'stunned' : 'shock', turn: -0.4, look: -0.8, blink: blinkAt(f, 4), L: 'hang', R: f < 192 ? 'hang' : 'chin' }, TELLER_P, { s: 1.0, order: 2 }));
      out.push(C_(T, T.SUIT, { expr: 'stunned', turn: -0.4, look: -0.7, blink: blinkAt(f, 9) }, at(BI, 0.95, 0, -0.85), { s: 1.05 }));
      out.push(C_(T, T.GRANNY, { expr: 'shock', turn: 0.4, look: 0.7, R: 'hang', holdR: 'shopbag' }, at(BI, -0.42, 0, -0.35), { s: 0.98 }));
      out.push(C_(T, T.SKATER, { expr: 'shock', turn: 0.3, look: 0.6, L: 'hang', holdL: 'skate', R: 'chin' }, at(BI, -0.6, 0, -2.3), { s: 1.0 }));
      man({ expr: ghost ? 'bliss' : 'smug', turn: 0.15, look: 0.2, R: { x: 410, y: 420, b: 0.4 }, holdR: { k: 'note', s: 1.1, rot: -0.05 }, L: { x: 150, y: 430, b: 0.4 }, holdL: 'sack', wet: 0.6, blink: pop ? blinkAt(f, 3) : 0 },
        M_COUNTER, ghost ? { alpha: 0.5, tint: '#d8ecff', order: 4 } : {});
      break; }
    case 'secret': break;
    case 'mirror': {
      const lookM = f >= 326;
      man({ expr: f < 326 ? 'neutral' : f < 345 ? 'goofy' : 'sly', turn: lookM ? 0.6 : 0.1, look: lookM ? 0.9 : -0.3, lookY: lookM ? 0 : 0.6, L: { x: 220, y: 470, b: 0.5 }, R: f < 345 ? { x: 380, y: 470, b: 0.5 } : 'chin', blink: blinkAt(f, 6) }, M_MIR);
      break; }
    case 'tripod': {
      const st = f < 404;
      man({ expr: st ? 'determined' : 'smug', turn: st ? 0.5 : 0.2, look: st ? 0.8 : 0, L: st ? { x: 480, y: 330, b: 0.4 } : 'hip', R: st ? { x: 540, y: 300 + Math.sin(f * 0.6) * 10, b: 0.4 } : 'thumb', blink: blinkAt(f, 2) }, at(K, -1.95, 0, 1.25), { s });
      break; }
    case 'juice': {
      const r = Math.sin(f * 1.6) * 16;
      man({ expr: 'sour', L: { x: 190, y: 300 + r, b: 0.6 }, R: { x: 410, y: 300 - r, b: 0.6 }, wet: 1, headTilt: q(Math.sin(f * 1.1) * 4, 1) }, M_POSE);
      break; }
    case 'pose': man({ expr: 'sly', L: 'hip', R: 'thumb', wet: 1, blink: 0, headTilt: -4 }, M_POSE); break;
    case 'klick': break;
    case 'photo': {
      const happy = f >= 530;
      man({ expr: happy ? 'goofy' : 'neutral', look: 0, lookY: 0.4, L: 'hang', R: 'hang', wet: 0.8, blink: blinkAt(f, 3) }, M_POSE); break; }
    case 'dance': {
      const hop = Math.abs(Math.sin((f - 554) * 0.42));
      man({ expr: 'laugh', L: { x: 120 + Math.sin(f * 0.8) * 30, y: 560, b: 0.6 }, holdL: { k: 'photo', s: 0.9, dev: 1, rot: 0.2 }, R: 'up', wet: 0.6, tilt: q(Math.sin(f * 0.42) * 7, 1), bob: q(hop * 0.05, 3) }, M_POSE); break; }
    case 'rewind': {
      man({ expr: 'sly', L: 'hip', R: 'thumb', wet: 1, headTilt: -4, blink: f > 640 && f < 643 ? 1 : 0 }, M_POSE); break; }
    case 'living': case 'tv': case 'face': {
      const spit = f >= 806, munch = f < 806;
      man({ expr: spit ? (f < 820 ? 'shock' : 'scared') : 'neutral', look: spit ? 0 : 0.8, legs: 'sit', L: munch ? { x: 200, y: 330 + Math.abs(Math.sin(f * 0.25)) * 80, b: 0.5 } : 'hang', R: { x: 450, y: spit ? 420 : 520, b: 0.5 }, holdR: 'drink', blink: blinkAt(f, 4), headTilt: spit && f < 816 ? -8 : 0 }, M_COUCH);
      break; }
    case 'porch': {
      const k = (f >= 852 && f < 868) ? Math.sin((f - 852) * 1.6) : 0, open = f >= 872;
      out.push(C_(T, 'back', { L: 'hang', R: { x: 470, y: 250 + k * 30, b: 0.4 } }, at(PO, -0.5, 0.3, 1.55), { s: 1.12, back: true, bspec: T.COP_TALL, order: 4 }));
      out.push(C_(T, 'back', { L: 'hip', R: 'hip' }, at(PO, 0.55, 0.3, 1.7), { s: 0.92, back: true, bspec: T.COP_SHORT, order: 5 }));
      if (open) man({ expr: 'shock', L: 'hang', R: { x: 470, y: 470, b: 0.6 }, holdR: 'lemon', wet: 0.4, sweat: true }, M_DOOR, { order: 2 });
      break; }
    case 'slide': {
      man({ expr: 'neutral', legs: 'sit', look: 0, lookY: 1, L: 'hang', R: { x: 470, y: 470, b: 0.6 }, holdR: 'lemon', blink: blinkAt(f, 3) }, M_SIT, { order: 1 });
      break; }
    case 'shock': man({ expr: 'shock', legs: 'sit', L: 'hang', R: 'hang', sweat: true, blink: 0 }, M_SIT); break;
    case 'protest': {
      const look = f >= 1005;
      man({ expr: 'yell', legs: 'sit', L: { x: 205, y: 300, b: 0.8 }, R: { x: 500, y: 180 + Math.sin(f * 0.5) * 20, b: 0.8 }, holdR: { k: 'lemon', r: 34, rot: 0.3 }, wet: 0.4, bob: q(Math.abs(Math.sin(f * 0.5)) * 0.01, 3) }, M_SIT, { order: 2 });
      out.push(C_(T, T.COP_TALL, { expr: look ? 'neutral' : 'stern', turn: look ? 0.6 : 0.2, look: look ? 0.9 : 0.4, L: 'cross', R: 'cross', blink: blinkAt(f, 7) }, at(IR, -0.6, 0, -1.45), { s: 1.12 }));
      out.push(C_(T, T.COP_SHORT, { expr: look ? 'neutral' : 'stern', turn: look ? -0.6 : -0.2, look: look ? -0.9 : -0.4, L: 'hip', R: 'hip', blink: blinkAt(f, 9) }, at(IR, 0.62, 0, -1.4), { s: 0.92 }));
      break; }
    case 'news': {
      out.push(C_(T, T.PROF, { expr: 'neutral', L: { x: 130, y: 330, b: 0.4 }, R: { x: 470, y: 330, b: 0.4 } }, PROF_P, { s: 1.05 }));
      out.push(C_(T, T.STUDENT, { expr: 'shock', turn: -0.5, look: -0.8, L: 'hang', R: 'chin' }, STUD_P, { s: 1.0 }));
      break; }
    case 'psych': {
      const lookAt = f >= 1088;
      out.push(C_(T, T.PROF, { expr: lookAt ? 'goofy' : 'neutral', turn: lookAt ? 0.55 : 0, look: lookAt ? 0.9 : 0, L: 'hang', R: f >= 1105 ? 'up' : 'hang', blink: blinkAt(f, 3) }, PROF_P, { s: 1.05 }));
      out.push(C_(T, T.STUDENT, { expr: lookAt ? 'goofy' : 'shock', turn: lookAt ? -0.55 : -0.2, look: lookAt ? -0.9 : 0, L: 'hang', R: f >= 1105 ? 'up' : 'chin', blink: blinkAt(f, 8) }, STUD_P, { s: 1.0 }));
      break; }
    case 'chalk': {
      out.push(C_(T, T.PROF, { expr: 'determined', turn: 0.4, look: 0.8, L: 'hang', R: { x: 580 + Math.sin(f * 0.9) * 8, y: 130, b: 0.4 }, holdR: 'chalk' }, at(OF, -1.0, 0, -1.75), { s: 1.05 }));
      break; }
    case 'hero': {
      man({ expr: f < 1190 ? 'goofy' : 'proud', turn: -0.6, look: -0.9, L: 'hang', R: { x: 470, y: 470, b: 0.6 }, holdR: 'lemon', blink: blinkAt(f, 5), bob: q(Math.abs(Math.sin(f * 0.15)) * 0.01, 3) }, M_MS, { s: 0.92 });
      break; }
    case 'cell': {
      const sq = Math.sin(f * 0.8) > 0;
      man({ expr: 'bliss', legs: 'sit', L: 'hang', R: { x: 330 + (sq ? 0 : 10), y: 150, b: 0.9 }, holdR: { k: 'lemon', r: 28, rot: 1.2 }, wet: q(clamp((f - 1234) / 20)), headTilt: -6 }, M_BUNK);
      break; }
    case 'bars': {
      const stuck = f >= 1288, push = Math.sin(f * 0.7);
      const shy = f >= 1300;
      man({ expr: shy ? 'shy' : stuck ? 'scared' : 'determined', blush: shy ? 1 : 0, L: { x: 60, y: 420, b: 0.5 }, R: { x: 540, y: 420, b: 0.5 }, holdR: shy ? 'lemon' : null, wet: 0.7, look: shy ? 0 : 0, headTilt: shy ? 4 : 0 },
        [M_BARS[0], 0, M_BARS[2] + (stuck ? 0 : -0.25 + ramp(f, 1268, 1288) * 0.25 + push * 0.01)], { s, sx: stuck ? 0.9 : 1 });
      break; }
  }
  return out;
};
export const actorsAt = (f, T) => actorsAt0(remap(f), T);

// ---------------- fx ----------------
const fxAt0 = (f, T) => {
  const S = shotAt0(f), out = [], C = camAt0(f);
  switch (S.id) {
    case 'hook': {
      if (f < 22) { const t = q(ramp(f, 0, 18), 3); const p = screenPos(C, 0.62, 0.0, -0.02, 0.17);
        out.push(FX('lemsq' + t, (p_) => T.fxLemonSqueeze(p_, t), p, 0.17, { order: 7 }));
        if (f >= 3) { const tj = q(ramp(f, 3, 21), 3); out.push(FX('juice' + tj, (p_) => T.fxJuice(p_, tj, 2, 22), screenPos(C, 0.5, 0.0, 0.0, 0.16), 0.16, { order: 8 })); } }
      if (f >= 22 && f < 46) { const tj = q(((f - 22) % 12) / 12, 2); out.push(FX('drip' + tj, (p_) => T.fxJuice(p_, tj, 5, 8), add3(HEAD(M_HOOK), [0, -0.95, -0.05]), 0.24, { order: 7 })); }
      if (f >= 45 && f < 57) { const t = q(ramp(f, 45, 56)); out.push(FX('spk' + t, (p_) => T.fxSpark(p_, t), add3(HEAD(M_HOOK), [0.38, -0.65, 0.2]), 0.22)); }
      break; }
    case 'wave': {
      if (f >= 117 && f < 127) { const t = q(ramp(f, 117, 127)); out.push(FX('ding' + t, (p_) => T.fxSpark(p_, t), add3(HEAD(M_UNDER), [0.55, -0.4, 0.1]), 0.3)); }
      break; }
    case 'ghost': {
      if (f < 192) for (let i = 0; i < 9; i++) { const t = ((f - 164) * 0.035 + i * 0.111) % 1; out.push(FX('gs' + i + '_' + q(t), (p_) => T.fxSpark(p_, t, '#ffffff'), add3(M_COUNTER, [Math.sin(i * 2.1) * 0.55, 0.3 + ((i * 0.37) % 1) * 1.6, 0.2]), 0.16)); }
      if (f >= 192 && f < 204) { const t = q(ramp(f, 192, 204)); out.push(FX('pop' + t, (p_) => T.fxBurst(p_, t, '#ffffff', 12, 40, 240), add3(M_COUNTER, [0, 0.5, 0.2]), 0.75)); }
      break; }
    case 'secret': {
      out.push(FX('flame' + (f % 8), (p_) => T.fxFlame(p_, f * 0.37), at(K, 0.5, 1.045 - 0.13 * 1.069 + 0.04, 0.32), 0.13, { order: 5 }));
      if (f >= 272 && f < 296) for (let i = 0; i < 4; i++) { const t = ((f - 272) / 24 + i * 0.25) % 1; out.push(FX('sp' + i + q(t), (p_) => T.fxSpark(p_, t, '#fff2b0'), at(K, 0.3 + i * 0.12, 1.22 + Math.sin(i) * 0.05 - 0.1, 0.38), 0.07)); }
      break; }
    case 'mirror': {
      if (f >= 338) { const t = q(ramp(f, 338, 360)); out.push(FX('bulb' + t, (p_) => T.fxBulb(p_, t), add3(HEAD(M_MIR), [0.05, 0.52 - 1.069 * 0.32, 0]), 0.32)); }
      break; }
    case 'juice': {
      const tj = q(((f - 421) % 13) / 13, 2); out.push(FX('jj' + tj, (p_) => T.fxJuice(p_, tj, 7, 16), add3(HEAD(M_POSE), [0, -0.9, 0.18]), 0.32));
      break; }
    case 'pose': break;
    case 'klick': {
      if (f >= 484 && f < 494) { const t = q(ramp(f, 484, 494)); out.push(FX('fl' + t, (p_) => T.fxBurst(p_, t, '#ffffff', 14, 30, 260), at(K, -1.27, 1.51 - 0.6, 1.46), 0.55)); }
      break; }
    case 'photo': {
      const dev = q(smooth(ramp(f, 502, 530)), 2), p = screenPos(C, 0.5, 0.0, -0.03, 0.2);
      out.push(FX('ph' + dev, (p_) => { const g = p_.g; T.drawPhoto(g, 300, 470, 2.4, dev, -0.04, 'ceiling'); T.mitten(g, 150, 690, 0.55, 0.4, '#1fa8b8'); T.mitten(g, 450, 690, 0.55, -0.4, '#1fa8b8'); }, p, 0.2, { order: 8 }));
      break; }
    case 'dance': {
      for (let i = 0; i < 6; i++) { const t = ((f - 554) / 18 + i / 6) % 1; out.push(FX('ds' + i + q(t), (p_) => T.fxSpark(p_, t, ['#ffd23a', '#ff4fa0', '#1fa8b8'][i % 3]), add3(M_POSE, [Math.cos(i * 1.7) * 0.7, 1.2 + Math.sin(i * 2.3) * 0.5 - 0.3, 0.2]), 0.18)); }
      break; }
    case 'rewind': {
      if (f >= 628 && f < 640) { const t = q(ramp(f, 628, 640)); out.push(FX('rf' + t, (p_) => T.fxBurst(p_, t, '#ffffff', 14, 30, 260), at(K, -1.3, 1.85 - 0.5, 1.35), 0.5)); }
      break; }
    case 'face': {
      if (f >= 806 && f < 826) { const t = q(ramp(f, 806, 826)); out.push(FX('spray' + t, (p_) => T.fxSpray(p_, t), add3(HEAD(M_COUCH), [0.25, -1.2, 0.25]), 0.5, { flip: true })); }
      break; }
    case 'porch': {
      out.push(FX('pglow', (p_) => T.fxGlow(p_, '255,206,130', 0.8), at(PO, 0.95, 2.1 - 1.07 * 0.6, 0.3), 0.6, { order: 1 }));
      if (f >= 852 && f < 868) { const t = q(((f - 852) % 5) / 5); out.push(FX('knock' + t, (p_) => T.fxBurst(p_, t, '#fff3b0', 8, 20, 120), at(PO, 0.0, 1.55 - 0.3, 0.2), 0.3)); }
      break; }
    case 'slide': {
      const t = ramp(f, 893, 925); if (t < 1) { const p = at(IR, lerp(0.15, 0.0, easeOut(t)), 0.86, lerp(0.9, 0.05, easeOut(t))); out.push(FX('hand' + q(t), (p_) => T.mitten(p_.g, 300, 500, 1, Math.PI, '#24305a'), [p[0], p[1] - 1.069 * 0.14, p[2]], 0.14, { face: true, pivotH: 1.069 })); }
      break; }
    case 'protest': break;
    case 'psych': {
      if (f >= 1103) { const t = q(ramp(f, 1103, 1122)); out.push(FX('b1' + t, (p_) => T.fxBulb(p_, t), add3(PROF_P, [0, 1.95 - 0.34, 0]), 0.32)); out.push(FX('b2' + t, (p_) => T.fxBulb(p_, t), add3(STUD_P, [0, 1.9 - 0.34, 0]), 0.32)); }
      break; }
    case 'hero': for (let i = 0; i < 6; i++) { const t = ((f - 1156) / 26 + i / 6) % 1; out.push(FX('hs' + i + q(t), (p_) => T.fxSpark(p_, t, '#fff6c8'), at(MS, -0.85 + Math.cos(i * 1.9) * 0.9, 0.6 + ((i * 0.41) % 1) * 2.0, -0.2), 0.16)); } break;
    case 'cell': {
      const tj = q(((f - 1234) % 12) / 12, 2); out.push(FX('cj' + tj, (p_) => T.fxJuice(p_, tj, 3, 10), add3(HEAD(M_BUNK), [0.15, -0.9, 0.15]), 0.25));
      break; }
    case 'bars': {
      if (f >= 1288 && f < 1300) { const t = q(ramp(f, 1288, 1300)); out.push(FX('boing' + t, (p_) => T.fxStars(p_, t), add3(HEAD(M_BARS), [0, -0.5, 0.25]), 0.45)); }
      break; }
  }
  return out;
};
export const fxAt = (f, T) => fxAt0(remap(f), T);
