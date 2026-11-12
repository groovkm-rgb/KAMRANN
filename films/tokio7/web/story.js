// "Das 7-Minuten-Theater" — vertical short, 30 fps. Voice: voice.mp3 (43.08 s) + 0.5 s tail.
// Phrase times (silence-align + syllable-nucleus check, hand-fixed):
//  1  0.00- 1.70 Ein Schnellzug rollt in Tokio ein.            f0
//  2  1.72- 3.42 Gleich steigen Hunderte Leute aus.            f52
//  3  3.57- 5.30 Und Hunderte neue wollen rein.                f105
//  4  5.36- 6.91 Dazwischen: sieben Minuten.                   f160   ("sieben" 6.12 = f184)
//  5  7.18- 9.24 Auf dem Bahnsteig wartet ein Team in Reih und Glied.   f211
//  6  9.29-10.94 Der Zug hält – und sie verbeugen sich.        f278   ("verbeugen" ~10.3 = f309)
//  7 11.22-11.81 Vor dem Zug. (0.6 s -> merged with 8)         f330
//  8 12.09-12.82 Dann geht's los.                              f360
//  9 12.97-14.46 Jede Person bekommt einen Wagen.              f387
//    14.78-16.34 Rund hundert Sitze. Allein.                   f439
// 10 16.63-19.38 Anderthalb Minuten: Müll einsammeln, Gepäckablagen checken.   f495 (Müll f531, Gepäck f555)
// 11 19.44-22.94 Dreißig Sekunden: alle Sitze umdrehen, | damit sie in Fahrtrichtung zeigen.  f582 | f647
// 12 23.19-26.23 Vier Minuten: putzen, | wischen, Kopfstützenbezüge wechseln.  f692 | f743
// 13 26.67-27.76 Eine Minute: Kontrolle.                       f794
// 14 27.98-30.23 Raus. Aufstellen. Verbeugen. Fertig.          f836  (Raus f840, Aufst. f855, Verb. f873, Fertig f892)
// 15 30.54-33.33 In Japan nennen sie das das | „Sieben-Minuten-Theater".   f911 | f953
// 16 33.68-35.05 Sogar in Harvard wird das studiert.           f1005
// 17 35.48-36.38 Und das Krasseste? | Früher hatte genau dieser Job | ein ziemlich mieses Image.  f1058 | f1096 | f1157
// 18 39.89-41.27 Geändert hat sich vor allem eins: | wie man die Leute behandelt hat.  f1192 | f1241
import { TRAIN_Z, KIOSK, INT0, CUT0, HALL0 } from './scene.js';
export const FPS = 30, TOTAL = 1307;
export const SHOTS = [
  { id: 'hook', a: 0, b: 51, light: 'day' }, { id: 'doors', a: 52, b: 104, light: 'day' }, { id: 'queue', a: 105, b: 159, light: 'day' },
  { id: 'count', a: 160, b: 210, light: 'day' }, { id: 'line', a: 211, b: 277, light: 'day' }, { id: 'bow', a: 278, b: 329, light: 'day' },
  { id: 'rev', a: 330, b: 386, light: 'day' }, { id: 'cut', a: 387, b: 438, light: 'cut' }, { id: 'sea', a: 439, b: 494, light: 'int' },
  { id: 'mont', a: 495, b: 581, light: 'int' }, { id: 'wave', a: 582, b: 646, light: 'int' }, { id: 'wave2', a: 647, b: 691, light: 'int' },
  { id: 'tray', a: 692, b: 742, light: 'int' }, { id: 'cover', a: 743, b: 793, light: 'int' }, { id: 'ctrl', a: 794, b: 835, light: 'int' },
  { id: 'done', a: 836, b: 910, light: 'day' }, { id: 'th1', a: 911, b: 952, light: 'theatre' }, { id: 'th2', a: 953, b: 1004, light: 'theatre' },
  { id: 'hall', a: 1005, b: 1057, light: 'hall' }, { id: 'hall2', a: 1058, b: 1095, light: 'hall' }, { id: 'past', a: 1096, b: 1156, light: 'grey' },
  { id: 'past2', a: 1157, b: 1191, light: 'grey' }, { id: 'turn', a: 1192, b: 1240, light: 'warm' }, { id: 'end', a: 1241, b: 1306, light: 'warm' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const easeOut = (t) => 1 - (1 - clamp(t)) ** 3.2;
const lerp = (a, b, t) => a + (b - a) * t, lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t)), ramp = (f, a, b) => clamp((f - a) / (b - a));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const I = (x, y, z) => [x + INT0[0], y, z], CU = (x, y, z) => [x + CUT0[0], y, z], HA = (x, y, z) => [x + HALL0[0], y, z];

// ---------------- countdown: 7:00 at "sieben" (f184), ticks from f190, 1:00 at "Eine Minute", 0:00 on "Fertig" ----------------
const CK = [[190, 420], [794, 60], [820, 30], [892, 0]];
export const secAt = (f) => { if (f < CK[0][0]) return 420; for (let i = 0; i < CK.length - 1; i++) if (f < CK[i + 1][0]) return lerp(CK[i][1], CK[i + 1][1], (f - CK[i][0]) / (CK[i + 1][0] - CK[i][0])); return 0; };

// ---------------- lights ----------------
const BASE = { az: 210, el: 55, sky: '#dfe8f4', ground: '#8a8a94', hemi: 1.25, sun: '#fffaf0', sunI: 2.2, fog: '#d6e2ee', fogNear: 60, fogFar: 700,
  skyTop: '#3f86dc', skyHor: '#cfe2f6', sat: 1.15, waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#effaff', vig: 0.18, shadowExt: 14, gain: '#ffffff', lift: '#000000' };
export const LIGHTS = {
  day: { ...BASE },
  int: { ...BASE, hemi: 1.55, sunI: 1.4, az: 120, el: 30, vig: 0.16, shadowExt: 10 },
  cut: { ...BASE, hemi: 1.5, sunI: 1.6, az: 60, el: 50, skyTop: '#e8eef4', skyHor: '#f4f6f8', fog: '#e8eef4', vig: 0.12, shadowExt: 24 },
  theatre: { ...BASE, hemi: 0.55, sky: '#c8a8a0', ground: '#3a2a30', sun: '#ffe2b0', sunI: 1.5, az: 160, el: 70, sat: 1.25, vig: 0.5, gain: '#f4e6d8' },
  hall: { ...BASE, hemi: 1.2, sun: '#ffe2bc', sunI: 1.4, az: 30, el: 40, sky: '#fff0dc', sat: 1.15, vig: 0.24, gain: '#fff6ea' },
  grey: { ...BASE, hemi: 1.0, sky: '#b8c0c8', ground: '#606670', sun: '#c8d0dc', sunI: 0.55, fog: '#8e969e', fogNear: 18, fogFar: 140, skyTop: '#6e767e', skyHor: '#9aa2aa',
    sat: 0.1, vig: 0.42, gain: '#c4cad4', lift: '#0a0c10' },
  warm: { ...BASE, sun: '#ffe4bc', sunI: 2.4, az: 225, el: 42, sky: '#fff4e6', ground: '#9a98a0', skyTop: '#4a8ee0', skyHor: '#ffe6cc', fog: '#f2e8de', sat: 1.25, vig: 0.18, gain: '#fffaf2' },
};
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const lc = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(lerp(v, hex(b)[i], t)).toString(16).padStart(2, '0')).join('');
const lerpL = (A, B, t) => { const o = {}; for (const k in A) o[k] = typeof A[k] === 'number' ? lerp(A[k], B[k], t) : (typeof A[k] === 'string' && A[k][0] === '#' ? lc(A[k], B[k], t) : A[k]); return o; };
export const lightFor = (S, f) => {
  if (S.id === 'turn') return lerpL(LIGHTS.grey, LIGHTS.warm, smooth(ramp(f, 1196, 1228)));
  return { ...LIGHTS[S.light] };
};

// ---------------- camera ----------------
const path = (f, K) => {
  if (f <= K[0].f) return { ...K[0] }; if (f >= K[K.length - 1].f) return { ...K[K.length - 1] };
  for (let i = 0; i < K.length - 1; i++) if (f >= K[i].f && f < K[i + 1].f) {
    const a = K[i], b = K[i + 1], r = (f - a.f) / (b.f - a.f), t = b.e === 'out' ? easeOut(r) : b.e === 'lin' ? r : smooth(r);
    return { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) };
  }
};
const KF = [KIOSK.x + 0.26, 2.2, KIOSK.z]; // kiosk front display centre (faces +x)
const CAMS = {
  hook: [
    { f: 0, pos: [2.8, 0.3, TRAIN_Z + 0.05], look: [-12, 0.4, TRAIN_Z], fov: 17, roll: -3 },
    { f: 30, pos: [2.85, 0.35, TRAIN_Z + 0.05], look: [-12, 0.5, TRAIN_Z], fov: 50, roll: 2, e: 'lin' },
    { f: 37, pos: [2.9, 0.4, TRAIN_Z + 0.1], look: [-12, 0.6, TRAIN_Z], fov: 52, roll: 1.5, e: 'lin' },
    { f: 45, pos: [-4.5, 2.0, 4.6], look: KF, fov: 48, roll: -4, e: 'out' },
    { f: 51, pos: [-5.0, 2.15, 5.58], look: KF, fov: 42, roll: -3, e: 'out' },
  ],
  doors: [
    { f: 52, pos: [-7.6, 1.2, 6.2], look: [-12.6, 1.05, -0.3], fov: 52, roll: 2 },
    { f: 60, pos: [-8.0, 1.25, 5.9], look: [-12.5, 1.1, -0.2], fov: 48, e: 'out' },
    { f: 104, pos: [-8.6, 1.3, 5.6], look: [-12.4, 1.15, -0.2], fov: 46, e: 'lin' },
  ],
  queue: [
    { f: 105, pos: [-19.6, 1.7, 0.3], look: [-26.0, 1.35, 5.2], fov: 62, roll: -3 },
    { f: 113, pos: [-19.9, 1.6, 0.3], look: [-26.0, 1.35, 5.2], fov: 58, roll: -1, e: 'out' },
    { f: 159, pos: [-20.4, 1.55, 0.35], look: [-26.0, 1.35, 5.2], fov: 55, roll: 0, e: 'lin' },
  ],
  count: [
    { f: 160, pos: [-4.5, 1.6, 4.6], look: KF, fov: 66, roll: 4 },
    { f: 167, pos: [-5.0, 2.12, 5.55], look: KF, fov: 44, roll: 0, e: 'out' },
    { f: 210, pos: [-5.3, 2.15, 5.6], look: KF, fov: 41, roll: -1.5, e: 'lin' },
  ],
  line: [
    { f: 211, pos: [-1.2, 1.5, -0.02], look: [-14, 1.25, 3.4], fov: 56, roll: 0 },
    { f: 221, pos: [-2.0, 1.4, -0.02], look: [-14, 1.25, 3.2], fov: 52, e: 'out' },
    { f: 277, pos: [-4.0, 1.35, -0.02], look: [-15.5, 1.25, 3.1], fov: 50, e: 'lin' },
  ],
  bow: [
    { f: 278, pos: [-3.4, 1.2, -0.02], look: [-10.5, 1.45, 2.4], fov: 46, roll: -3 },
    { f: 287, pos: [-4.0, 1.2, -0.02], look: [-10.5, 1.45, 2.3], fov: 42, roll: -4.5, e: 'out' },
    { f: 329, pos: [-4.4, 1.2, -0.02], look: [-10.5, 1.45, 2.3], fov: 40, roll: -4.5, e: 'lin' },
  ],
  rev: [
    { f: 330, pos: [5.6, 1.4, 3.3], look: [-6.5, 0.8, 0.2], fov: 48, roll: 3 },
    { f: 339, pos: [5.1, 1.35, 3.1], look: [-6.5, 0.8, 0.2], fov: 44, roll: 2, e: 'out' },
    { f: 358, pos: [4.6, 1.3, 2.9], look: [-6.5, 0.85, 0.2], fov: 42, roll: 2, e: 'lin' },
    { f: 368, pos: [-5.6, 1.4, 3.7], look: [-13, 1.1, 0.0], fov: 52, roll: -2, e: 'out' },
    { f: 386, pos: [-6.4, 1.35, 3.4], look: [-13, 1.1, 0.0], fov: 48, roll: -2, e: 'lin' },
  ],
  cut: [
    { f: 387, pos: CU(-17, 1.35, 9.0), look: CU(-13, 1.0, 0), fov: 54, roll: 0 },
    { f: 397, pos: CU(-13, 1.4, 9.2), look: CU(-9, 1.0, 0), fov: 51, e: 'out' },
    { f: 438, pos: CU(8.5, 1.5, 9.4), look: CU(12.5, 1.0, 0), fov: 51, e: 'lin' },
  ],
  sea: [
    { f: 439, pos: I(-10.5, 2.5, 0.1), look: I(4, 0.95, 0.1), fov: 54, roll: 2 },
    { f: 448, pos: I(-10.4, 2.4, 0.1), look: I(4, 0.95, 0.1), fov: 50, e: 'out' },
    { f: 494, pos: I(-10.2, 2.3, 0.1), look: I(4, 0.95, 0.1), fov: 46, e: 'lin' },
  ],
  mont: [
    { f: 495, pos: I(1.6, 1.45, 0.25), look: I(-8, 1.5, 0.0), fov: 50, roll: -3 },
    { f: 503, pos: I(1.2, 1.4, 0.2), look: I(-8, 1.5, 0.0), fov: 46, roll: -2, e: 'out' },
    { f: 529, pos: I(0.9, 1.38, 0.2), look: I(-8, 1.5, 0.0), fov: 44, roll: -2, e: 'lin' },
    { f: 537, pos: I(-1.1, 1.45, 0.1), look: I(-4.3, 1.6, -0.25), fov: 50, roll: 3, e: 'out' },
    { f: 554, pos: I(-1.3, 1.42, 0.1), look: I(-4.3, 1.6, -0.25), fov: 47, roll: 3, e: 'lin' },
    { f: 562, pos: I(2.0, 1.15, 0.3), look: I(4.7, 1.45, -0.15), fov: 56, roll: -3, e: 'out' },
    { f: 581, pos: I(2.15, 1.15, 0.3), look: I(4.7, 1.45, -0.15), fov: 52, roll: -3, e: 'lin' },
  ],
  wave: [
    { f: 582, pos: I(-10.4, 2.2, 0.45), look: I(5, 0.6, -0.2), fov: 56, roll: -3 },
    { f: 591, pos: I(-10.4, 2.15, 0.4), look: I(5, 0.65, -0.2), fov: 52, roll: -2, e: 'out' },
    { f: 646, pos: I(-10.2, 2.1, 0.35), look: I(5, 0.7, -0.2), fov: 48, roll: -2, e: 'lin' },
  ],
  wave2: [
    { f: 647, pos: I(-5.6, 1.15, 0.12), look: I(-9.2, 2.0, -0.8), fov: 60, roll: 3 },
    { f: 656, pos: I(-5.8, 1.1, 0.1), look: I(-9.2, 2.0, -0.8), fov: 56, roll: 2, e: 'out' },
    { f: 691, pos: I(-6.1, 1.05, 0.1), look: I(-9.2, 2.0, -0.8), fov: 53, roll: 2, e: 'lin' },
  ],
  tray: [
    { f: 692, pos: I(-4.9, 1.3, 0.2), look: I(-2.4, 1.05, -0.1), fov: 58, roll: -3 },
    { f: 700, pos: I(-4.8, 1.28, 0.2), look: I(-2.4, 1.05, -0.1), fov: 53, roll: -2, e: 'out' },
    { f: 742, pos: I(-4.65, 1.25, 0.2), look: I(-2.4, 1.05, -0.1), fov: 50, roll: -2, e: 'lin' },
  ],
  cover: [
    { f: 743, pos: I(5.4, 0.7, 0.1), look: I(1.0, 0.25, 0.1), fov: 50, roll: 3 },
    { f: 751, pos: I(5.1, 0.75, 0.1), look: I(1.0, 0.3, 0.1), fov: 46, roll: 2, e: 'out' },
    { f: 766, pos: I(4.9, 0.8, 0.1), look: I(1.0, 0.35, 0.1), fov: 44, roll: 2, e: 'lin' },
    { f: 774, pos: I(1.0, 1.55, 0.25), look: I(5.3, 1.6, -0.35), fov: 50, roll: -3, e: 'out' },
    { f: 793, pos: I(1.3, 1.5, 0.25), look: I(5.3, 1.6, -0.35), fov: 46, roll: -3, e: 'lin' },
  ],
  ctrl: [
    { f: 794, pos: I(2.1, 1.2, -1.62), look: I(1.6, 1.5, 3.0), fov: 70, roll: 3 },
    { f: 802, pos: I(2.05, 1.2, -1.6), look: I(1.5, 1.5, 3.0), fov: 66, roll: 2, e: 'out' },
    { f: 835, pos: I(1.95, 1.2, -1.58), look: I(1.4, 1.5, 3.0), fov: 63, roll: 2, e: 'lin' },
  ],
  done: [
    { f: 836, pos: [-4.4, 1.5, -0.02], look: [-16, 1.25, 2.8], fov: 70, roll: 3 },
    { f: 845, pos: [-4.8, 1.45, -0.02], look: [-16, 1.25, 2.8], fov: 67, roll: 1, e: 'out' },
    { f: 886, pos: [-5.3, 1.42, -0.02], look: [-16, 1.25, 2.8], fov: 65, roll: 0, e: 'lin' },
    { f: 894, pos: [-5.6, 2.12, 5.55], look: KF, fov: 44, roll: -2, e: 'out' },
    { f: 910, pos: [-5.8, 2.14, 5.6], look: KF, fov: 42, roll: -2, e: 'lin' },
  ],
  th1: [
    { f: 911, pos: [-4.4, 1.45, 4.6], look: [-10.5, 1.15, 1.5], fov: 50, roll: 0 },
    { f: 952, pos: [-5.0, 1.42, 4.3], look: [-10.5, 1.15, 1.5], fov: 45, roll: 0, e: 'lin' },
  ],
  th2: [
    { f: 953, pos: [-15.2, 1.3, 3.2], look: [-9.2, 1.4, 6.3], fov: 58, roll: 3 },
    { f: 961, pos: [-14.9, 1.3, 3.4], look: [-9.2, 1.4, 6.3], fov: 53, roll: 2, e: 'out' },
    { f: 1004, pos: [-14.4, 1.32, 3.7], look: [-9.2, 1.4, 6.3], fov: 49, roll: 2, e: 'lin' },
  ],
  hall: [
    { f: 1005, pos: HA(0.1, 2.85, 7.6), look: HA(0, 2.0, -6), fov: 54, roll: 0 },
    { f: 1014, pos: HA(0.05, 2.75, 7.1), look: HA(0, 2.0, -6), fov: 51, e: 'out' },
    { f: 1057, pos: HA(0, 2.7, 6.5), look: HA(0, 2.0, -6), fov: 49, e: 'lin' },
  ],
  hall2: [
    { f: 1058, pos: HA(-0.9, 1.3, -1.6), look: HA(-2.1, 1.3, -5.2), fov: 48, roll: -3 },
    { f: 1066, pos: HA(-1.2, 1.3, -2.4), look: HA(-2.1, 1.3, -5.2), fov: 42, roll: -4, e: 'out' },
    { f: 1095, pos: HA(-1.35, 1.3, -2.7), look: HA(-2.1, 1.3, -5.2), fov: 40, roll: -4.5, e: 'lin' },
  ],
  past: [
    { f: 1096, pos: [-5.4, 1.15, 3.8], look: [-12.5, 1.0, 1.6], fov: 52, roll: 0 },
    { f: 1156, pos: [-5.9, 1.1, 3.6], look: [-12.5, 1.0, 1.6], fov: 48, roll: 0, e: 'lin' },
  ],
  past2: [
    { f: 1157, pos: [-10.0, 0.95, 4.3], look: [-12.6, 0.75, 1.6], fov: 46, roll: 0 },
    { f: 1191, pos: [-10.6, 0.9, 3.8], look: [-12.6, 0.75, 1.6], fov: 40, roll: 0, e: 'lin' },
  ],
  turn: [
    { f: 1192, pos: [-9.4, 1.0, 4.6], look: [-11.7, 1.45, 1.6], fov: 50, roll: 0 },
    { f: 1240, pos: [-9.9, 1.15, 4.0], look: [-11.7, 1.55, 1.6], fov: 45, roll: 0, e: 'lin' },
  ],
  end: [
    { f: 1241, pos: [-9.8, 1.3, 7.8], look: [-11.4, 1.3, 1.6], fov: 64, roll: -2 },
    { f: 1250, pos: [-9.9, 1.3, 7.6], look: [-11.4, 1.32, 1.6], fov: 61, roll: -1, e: 'out' },
    { f: 1306, pos: [-10.1, 1.35, 7.0], look: [-11.4, 1.35, 1.6], fov: 58, roll: 0, e: 'lin' },
  ],
};
// impact shakes: sign flips every frame, decays over n frames
const KICKS = [{ f: 2, a: 0.012, n: 30 }, { f: 16, a: 0.03, n: 16 }, { f: 30, a: 0.05, n: 8 }, { f: 46, a: 0.02, n: 6 }, { f: 161, a: 0.03, n: 7 }, { f: 184, a: 0.015, n: 5 },
  { f: 304, a: 0.01, n: 6 }, { f: 362, a: 0.02, n: 7 }, { f: 892, a: 0.025, n: 8 }, { f: 1302, a: 0.025, n: 5 }];
const FLASH = [387, 439, 911, 1005, 1096];
export const camAt = (f) => {
  const S = shotAt(f); let c = path(f, CAMS[S.id]);
  c = { ...c, pos: [...c.pos], look: [...c.look] };
  for (const k of KICKS) { const d = f - k.f; if (d >= 0 && d < k.n) { const s = (d % 2 ? -1 : 1) * k.a * (1 - d / k.n); c.look[1] += s * 3; c.look[2] += s * 2; c.roll = (c.roll || 0) + s * 25; } }
  c.flash = 0; for (const a of FLASH) if (f >= a && f < a + 4) c.flash = (1 - (f - a) / 4) * 0.85;
  c.shadowAt = S.id === 'cut' ? CU(0, 0, 0) : S.id.startsWith('hall') ? HA(0, 0, 0) : INTS.includes(S.id) ? I(0, 0, 0) : [c.look[0] * 0.5 + c.pos[0] * 0.5, 0, c.look[2] * 0.5 + c.pos[2] * 0.5];
  return c;
};
const INTS = ['sea', 'mont', 'wave', 'wave2', 'tray', 'cover', 'ctrl'];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOCUS = {
  hook: (f, C) => f < 37 ? { focus: Math.max(0.6, dist(C.pos, [txAt(f) - 0.4, 0.3, TRAIN_Z])), cinf: 3 } : { focus: dist(C.pos, KF), cinf: 4 },
  doors: (f, C) => ({ focus: dist(C.pos, [-11.5, 1.4, 2.5]), cinf: 8 }), queue: (f, C) => ({ focus: dist(C.pos, [-24.2, 1.5, 2.6]), cinf: 10 }),
  count: (f, C) => ({ focus: dist(C.pos, KF), cinf: 6 }), line: (f, C) => ({ focus: dist(C.pos, [-6, 1.6, 1.5]), cinf: 7 }),
  bow: (f, C) => ({ focus: dist(C.pos, [-6, 1.4, 1.5]), cinf: 12 }), rev: (f, C) => f < 362 ? { focus: dist(C.pos, [-6, 1.2, 1.5]), cinf: 6 } : { focus: dist(C.pos, [-11, 1.3, 1]), cinf: 8 },
  cut: (f, C) => ({ focus: dist(C.pos, [C.look[0], 1.0, 0]), cinf: 3 }), sea: (f, C) => ({ focus: dist(C.pos, I(-8.8, 1.6, 0.1)), cinf: 5 }),
  mont: (f, C) => f < 533 ? { focus: dist(C.pos, I(-1.6, 1.5, 0.1)), cinf: 12 } : f < 558 ? { focus: dist(C.pos, I(-4.6, 0.8, -0.6)), cinf: 14 } : { focus: dist(C.pos, I(4.7, 1.5, -0.4)), cinf: 12 },
  wave: (f, C) => ({ focus: dist(C.pos, I(-4, 0.8, 0)), cinf: 4 }), wave2: (f, C) => ({ focus: dist(C.pos, I(-8.85, 0.9, -1.0)), cinf: 12 }),
  tray: (f, C) => ({ focus: dist(C.pos, I(-2.9, 1.2, -0.5)), cinf: 12 }), cover: (f, C) => f < 770 ? { focus: dist(C.pos, I(2.6, 0.5, 0.1)), cinf: 12 } : { focus: dist(C.pos, I(4.0, 1.2, -0.9)), cinf: 12 },
  ctrl: (f, C) => ({ focus: dist(C.pos, I(1.6, 1.6, 0.1)), cinf: 9 }), done: (f, C) => f < 888 ? { focus: dist(C.pos, [-12, 1.4, 1.5]), cinf: 6 } : { focus: dist(C.pos, KF), cinf: 6 },
  th1: (f, C) => ({ focus: dist(C.pos, [-8, 1.4, 1.5]), cinf: 4 }), th2: (f, C) => ({ focus: dist(C.pos, [-9.8, 1.5, 6.6]), cinf: 10 }),
  hall: (f, C) => ({ focus: dist(C.pos, HA(-1, 1.9, -5.6)), cinf: 6 }), hall2: (f, C) => ({ focus: dist(C.pos, HA(-2.1, 1.7, -5.0)), cinf: 14 }),
  past: (f, C) => ({ focus: dist(C.pos, [-11, 1.3, 1.6]), cinf: 9 }), past2: (f, C) => ({ focus: dist(C.pos, [-12.4, 0.9, 1.6]), cinf: 14 }),
  turn: (f, C) => ({ focus: dist(C.pos, [-11.6, 1.6, 1.6]), cinf: 13 }), end: (f, C) => ({ focus: dist(C.pos, [-11.2, 1.6, 2.0]), cinf: 10 }),
};
export const dofAt = (f) => FOCUS[shotAt(f).id](f, camAt(f));

// ---------------- world ----------------
export const txAt = (f) => { if (f < 14) return lerp(-36, -8, f / 14); if (f < 30) return -8 + 8 * (1 - (1 - (f - 14) / 16) ** 3); return 0; };
const hlAt = (f) => f >= 340 && f < 352 ? ((f - 340) % 6 < 3 ? 6 : 0.15) : 2.4; // headlights blink once ("thank you")
export const worldAt = (f) => {
  const S = shotAt(f), id = S.id;
  const W = { sec: secAt(f), tx: txAt(f), doors: f < 56 ? 0 : smooth(ramp(f, 56, 66)), hl: hlAt(f), set: 'plat' };
  if (id === 'cut') { W.set = 'cut'; W.cutSeat = () => 0; }
  if (INTS.includes(id)) {
    W.set = 'int';
    W.seat = (k) => smooth(ramp(f, 590 + (19 - k) * 3.6, 590 + (19 - k) * 3.6 + 12));
    W.cover = (k, zc) => { if (f < 772 || k < 6 || k > 12) return 1; const t0 = 775 + (12 - k) * 3 + (zc > 0 ? 1 : 0), t = (f - t0) / 7;
      return t < 0 ? 1 : t < 0.4 ? 1 - t * 2 : t < 1 ? 0.2 + (t - 0.4) / 0.6 * 0.8 + Math.sin((t - 0.4) / 0.6 * Math.PI) * 0.25 : 1; };
  }
  if (id.startsWith('hall')) W.set = 'hall';
  if (id === 'th1' || id === 'th2') W.theatre = { pos: [-4.4, 1.45, 4.6], look: [-10.5, 1.15, 1.5], d: 1.25, vy: 0.98, open: id === 'th1' ? smooth(ramp(f, 914, 944)) : 1, noCurtain: id === 'th2',
    spots: CREWX.slice(0, 4).map((x) => [x, 0, 1.5]), spotK: id === 'th1' ? smooth(ramp(f, 920, 940)) : 1 };
  if (id === 'past' || id === 'past2') W.kiosk = false;
  if (id === 'end') { W.doors = 0; W.tx = 30 * ramp(f, 1252, 1306) ** 2.2; }
  return W;
};

// ---------------- cast ----------------
const blinkAt = (f, seed) => { const per = 40 + (seed * 17) % 30, ph = (f + seed * 13) % per; return ph < 2 ? 0.5 : ph < 4 ? 1 : 0; };
const CH = (T, spec, o, pos, extra = {}) => ({ key: JSON.stringify([spec.seed, spec.body, o]), draw: (p) => T.toonChar(p, spec, o), x: pos[0], y: pos[1], z: pos[2], s: 0.84, ...extra });
const CREWX = [-6, -8, -10, -12, -16, -18, -20, -22];
const CREWX2 = [-9, -10.5, -12, -13.5, -15, -16.5, -18, -19.5];
const CREWK = ['leader', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];
const walkO = (f, rate = 14) => ({ legs: 'walk', step: q((f % rate) / rate), bob: q(Math.abs(Math.sin(f / rate * Math.PI * 2)) * 0.014, 3) });
const crewLine = (f, T, o) => CREWK.map((k, i) => {
  const bow = o.bow ? o.bow(f, i) : 0;
  return CH(T, T.CREW[k], { expr: i % 2 ? 'calm' : 'determined', blink: blinkAt(f, i + 2), turn: o.turn ?? 0.35, bow: q(bow), back: o.back, L: bow > 0.3 ? undefined : 'hang', R: bow > 0.3 ? undefined : 'hang' }, [CREWX[i], 0, 1.5], { s: 0.86 });
});
const bowCurve = (f, a, b) => smooth(ramp(f, a, a + 6)) * (1 - smooth(ramp(f, b, b + 8)));

const PAXK = ['suit1', 'tour1', 'mom', 'kid', 'suit2', 'tour2', 'opa', 'suit3', 'dad', 'tour3', 'kid2', 'oma'];
const outflow = (f, T) => PAXK.map((k, i) => {
  const t0 = 60 + i * 3.4, t = (f - t0) / 32; if (t < 0) return null;
  const spread = ((i * 37) % 11) / 10 - 0.5, tt = clamp(t, 0, 1.4);
  const x = -12.3 + (i % 2 ? 0.2 : -0.2) + spread * 5.5 * tt, z = -0.9 + tt * 6.0;
  return CH(T, T.PAX[k], { expr: ['neutral', 'happy', 'goofy', 'calm'][i % 4], ...walkO(f + i * 5, 9), turn: q(spread * 0.8), L: 'hang', R: 'hang', holdR: k === 'suit1' || k === 'suit3' ? 'briefcase' : k === 'oma' ? 'suitcase' : undefined }, [x, 0, z], { s: k.startsWith('kid') ? 0.62 : 0.82 });
}).filter(Boolean);
const queue = (f, T) => {
  const Q = [['suit3', -24.0, 1.55], ['tour2', -24.0, 2.45], ['opa', -24.0, 3.35], ['oma', -24.1, 4.25], ['suit2', -25.4, 1.55], ['dad', -25.4, 2.45], ['kid', -25.6, 3.1], ['tour1', -25.4, 3.9], ['suit1', -25.5, 4.8]];
  return Q.map(([k, x, z], i) => {
    let o = { expr: 'neutral', blink: blinkAt(f, i + 5), turn: -0.3, bob: q(Math.abs(Math.sin(f * 0.35 + i)) * 0.006, 3) };
    if (k === 'suit3') o = { ...o, expr: 'worried', look: 0.6, turn: 0.2, L: 'hang', R: { x: 420, y: 470, b: 0.5 }, headTilt: 8, bob: q(Math.abs(Math.sin(f * 0.9)) * 0.01, 3) };
    if (k === 'tour2') o = { ...o, expr: 'happy', R: 'up', holdR: 'phone' };
    if (k === 'kid') o = { ...o, expr: 'goofy', bob: q(Math.abs(Math.sin(f * 0.6)) * 0.04, 3) };
    if (k === 'oma') o = { ...o, expr: 'calm', R: { x: 470, y: 600 }, holdR: 'suitcase' };
    if (k === 'suit1') o = { ...o, expr: 'angry', L: 'cross', R: 'cross' };
    return CH(T, T.PAX[k], o, [x, 0, z], { s: k.startsWith('kid') ? 0.62 : 0.82 });
  });
};

export const actorsAt = (f, T) => {
  const id = shotAt(f).id, out = [];
  if (id === 'doors') out.push(...outflow(f, T));
  if (id === 'queue') out.push(...queue(f, T));
  if (id === 'line') out.push(...crewLine(f, T, { turn: 0.45 }));
  if (id === 'bow') out.push(...crewLine(f, T, { turn: 0.5, bow: (f) => bowCurve(f, 303, 322) }));
  if (id === 'rev') {
    if (f < 360) out.push(...crewLine(f, T, { back: true, bow: (f) => bowCurve(f, 326, 352) }));
    else CREWK.forEach((k, i) => {
      const tgt = i < 3 ? -12.3 : i < 6 ? -24.7 : -27.8, t = clamp((f - 360 - i * 1.2) / 14), x = lerp(CREWX[i], tgt + (i % 2 ? 0.25 : -0.25), easeOut(t)), z = lerp(1.5, -1.2, smooth(ramp(f, 364 + i * 1.2, 380 + i * 1.2)));
      out.push(CH(T, T.CREW[k], { expr: 'determined', ...walkO(f + i * 3, 6), turn: -0.6, L: 'forward', R: 'hip' }, [x, 0, z], { s: 0.86 }));
    });
  }
  if (id === 'cut') {
    const acts = [{ R: { x: 470, y: 560 }, holdR: 'rag' }, { R: 'reach', holdR: { t: 'trashbag', fill: 0.6 } }, { R: 'up', L: 'hip' }, { R: { x: 480, y: 470 }, holdR: 'cover' }, { R: 'forward', holdR: 'rag', legs: 'crouch' }, { R: 'reach', holdR: { t: 'trashbag', fill: 0.3 } }];
    for (let i = 0; i < 6; i++) { const cx = -15 + i * 5.75, wob = q(Math.sin(f * 0.6 + i * 1.3)), a = acts[i];
      const R = typeof a.R === 'object' ? { x: a.R.x + wob * 30, y: a.R.y + wob * 10 } : a.R;
      out.push(CH(T, T.CREW[CREWK[i]], { expr: 'determined', blink: blinkAt(f, i), turn: q(0.2 * wob), ...a, R }, CU(cx + 0.6 + wob * 0.15, 0.0, 0.75), { s: 0.62 })); }
  }
  if (id === 'sea') out.push(CH(T, T.CREW.leader, { back: true, L: 'hang', R: 'hang', holdR: { t: 'trashbag', fill: 0.1 } }, I(-6.6, 0, 0.1), { s: 0.84 }));
  if (id === 'mont') {
    if (f < 533) { const t = ramp(f, 495, 531); out.push(CH(T, T.CREW.c2, { expr: 'determined', ...walkO(f, 8), turn: 0.1, L: 'forward', R: 'hang', holdR: { t: 'trashbag', fill: q(0.15 + t * 0.85) } }, I(lerp(-5.5, -1.6, t), 0, 0.1), { s: 0.84 })); }
    else if (f < 558) out.push(CH(T, T.CREW.c5, { expr: 'focus', legs: 'crouch', turn: -0.4, L: { x: q(120 + 40 * Math.sin(f * 0.9), 0), y: 560 }, R: 'hang', holdR: { t: 'trashbag', fill: q(0.4 + 0.5 * ramp(f, 533, 556)) } }, I(-4.15, 0, 0.12), { s: 0.8 }));
    else { const found = f >= 569; out.push(CH(T, T.CREW.c6, { expr: found ? 'happy' : 'focus', turn: -0.5, look: -0.6, L: found ? 'up' : { x: 120, y: 170 }, holdL: found ? 'umbrella' : 'flashlight', R: 'hip' }, I(4.6, 0, 0.1), { s: 0.84 })); }
  }
  if (id === 'tray') { const w = q(Math.sin(f * 0.9)); out.push(CH(T, T.CREW.c3, { expr: 'focus', turn: -0.5, look: -0.7, L: { x: 110 + w * 50, y: 560 + w * 14 }, holdL: 'rag', R: 'hip' }, I(-2.3, 0, 0.2), { s: 0.84 })); }
  if (id === 'cover') {
    if (f < 772) { const w = q(Math.sin(f * 0.7)); out.push(CH(T, T.CREW.c4, { expr: 'determined', turn: 0.3, legs: 'walk', step: q((f % 16) / 16), L: { x: 200 + w * 70, y: 760 }, R: { x: 300 + w * 70, y: 720 }, holdR: 'mop' }, I(lerp(1.2, 2.8, ramp(f, 743, 772)), 0, 0.1), { s: 0.84 })); }
    else out.push(CH(T, T.CREW.c7, { expr: f % 6 < 3 ? 'happy' : 'determined', turn: -0.5, L: { x: 120, y: 330 + (f % 6) * 12 }, holdL: 'cover', R: 'hip' }, I(lerp(5.6, 2.6, ramp(f, 774, 793)), 0, 0.15), { s: 0.84 }));
  }
  if (id === 'ctrl') { const n = Math.min(4, Math.floor(ramp(f, 800, 832) * 5)); out.push(CH(T, T.CHIEF, { expr: 'focus', ...walkO(f, 16), turn: -0.3, look: -0.4, L: { x: 120, y: 470 }, holdL: 'flashlight', R: { x: 430, y: 520 }, holdR: { t: 'clipboard', n } }, I(lerp(1.1, 2.3, ramp(f, 794, 835)), 0, 0.3), { s: 0.86 })); }
  if (id === 'done') {
    CREWK.forEach((k, i) => {
      const door = -12.3 + (i % 2 ? 0.3 : -0.3), t = clamp((f - 838 - i * 1.5) / 12), tl = smooth(ramp(f, 852 + i, 868 + i));
      const x = lerp(door, CREWX2[i], tl), z = lerp(-1.0, 1.5, Math.max(easeOut(t) * 0.5, tl)), bw = bowCurve(f, 872, 900);
      out.push(CH(T, T.CREW[k], { expr: f > 892 ? 'proud' : 'determined', blink: blinkAt(f, i), ...(tl < 1 ? walkO(f + i * 2, 7) : {}), turn: -0.45, bow: q(bw), L: 'hang', R: 'hang' }, [x, 0, z], { s: 0.86 }));
    });
  }
  if (id === 'th1' || id === 'th2') {
    out.push(...crewLine(f, T, { turn: id === 'th1' ? 0.45 : -0.4, bow: (f) => id === 'th1' ? bowCurve(f, 930, 946) : bowCurve(f, 975, 992) }));
    const TO = id === 'th1' ? [['tour1', -5.39, 3.62], ['tour2', -5.97, 4.68], ['kid', -4.85, 4.09]]
      : [['tour1', -10.4, 6.0], ['tour2', -9.2, 6.6], ['tour3', -7.9, 6.1], ['kid', -8.8, 5.4], ['mom', -11.6, 6.9]];
    if (id === 'th2') TO.forEach(([k, x, z], i) => {
      const clap = (f + i * 3) % 8 < 4, film = i === 0 || i === 2, o = film ? { expr: 'goofy', R: 'up', holdR: 'phone', L: clap ? 'forward' : 'hip' }
        : { expr: i % 2 ? 'laugh' : 'happy', L: clap ? { x: 260, y: 470 } : { x: 160, y: 470 }, R: clap ? { x: 340, y: 470 } : { x: 440, y: 470 } };
      out.push(CH(T, T.PAX[k], { ...o, back: id === 'th1', turn: 0.4, bob: q(Math.abs(Math.sin(f * 0.5 + i)) * 0.01, 3) }, [x, 0, z], { s: k === 'kid' ? 0.62 : 0.82 }));
    });
  }
  if (id === 'hall' || id === 'hall2') {
    const point = id === 'hall2' ? f > 1062 : Math.sin(f * 0.15) > -0.2;
    out.push(CH(T, T.PROF, { expr: id === 'hall2' ? (f < 1072 ? 'shock' : 'sly') : 'happy', blink: blinkAt(f, 3), turn: id === 'hall2' ? 0.15 : 0.45, look: id === 'hall2' ? 0 : -0.6, L: point ? 'up' : 'hip', holdL: { t: 'pointer', a: id === 'hall2' ? -70 : -50, L: 240 }, R: id === 'hall2' && f > 1070 ? { x: 480, y: 260 } : 'hip' }, HA(-2.2, 0, -5.0), { s: 0.86 }));
    const ROWS = [[0, [-4.2, -2.6, -1.0, 0.6, 2.2, 3.8]], [1, [-3.4, -1.8, 1.4, 3.0]], [2, [-4.0, -0.2, 2.4]], [3, [-2.6, 1.0, 3.6]]];
    let n = 0; for (const [k, xs] of ROWS) for (const x of xs) { const z = -1.6 + k * 1.5, y = k * 0.38, w = q(Math.sin(f * 0.8 + n * 1.7));
      out.push(CH(T, T.STUD[n % 8], { back: true, legs: 'sit', L: { x: 230 + w * 14, y: 560 }, R: { x: 380 + w * 20, y: 540 }, headTilt: q(4 * Math.sin(n * 2.3 + f * 0.05), 1) }, HA(x, y, z + 0.15), { s: 0.78 })); n++; }
  }
  if (id === 'past' || id === 'past2') {
    out.push(CH(T, T.CREW.c1, { expr: 'sad', legs: 'crouch', headTilt: -8, turn: 0.3, look: 0.5, L: { x: 140, y: 820 }, R: 'hang', holdL: 'rag' }, [-12.4, 0, 1.6], { s: 0.86 }));
    out.push(CH(T, T.CREW.c2, { expr: 'sad', headTilt: 10, turn: -0.4, look: -0.6, L: 'hang', R: 'hang', holdR: { t: 'trashbag', fill: 0.7 } }, [-15.0, 0, 2.2], { s: 0.86 }));
    if (id === 'past') out.push(CH(T, T.CREW.leader, { expr: 'sad', headTilt: -6, turn: 0.2, L: 'hang', R: 'hang' }, [-9.6, 0, 1.4], { s: 0.86 }));
    [['suit1', 0], ['suit3', 14], ['suit2', 30], ['tour3', 44]].forEach(([k, d], i) => { const t = (f - 1096 - d) / 50, x = lerp(-17, -5, t), z = 3.0 + i * 0.6;
      if (t > -0.1 && t < 1.1) out.push(CH(T, T.PAX[k], { expr: k === 'suit1' ? 'smug' : 'neutral', ...walkO(f + i * 4, 12), turn: 0.7, look: 1, headTilt: k === 'suit1' ? -6 : 0, holdR: k.startsWith('suit') ? 'briefcase' : undefined }, [x, 0, z], { s: 0.84 })); });
    if (id === 'past2') { const t = (f - 1160) / 22, x = lerp(-15, -10, t); if (t > -0.1 && t < 1.2) out.push(CH(T, T.PAX.suit3, { expr: 'neutral', ...walkO(f, 12), turn: 0.8, look: 1, holdR: 'briefcase' }, [x, 0, 2.7], { s: 0.84 })); }
  }
  if (id === 'turn') {
    const t = smooth(ramp(f, 1200, 1226));
    out.push(CH(T, T.CREW.leader, { expr: t < 0.5 ? 'sad' : 'proud', headTilt: q(lerp(-8, 0, t), 1), turn: 0.1, L: t > 0.6 ? 'hip' : 'hang', R: t > 0.6 ? 'hip' : 'hang', bob: q(t * 0.012, 3) }, [-11.7, 0, 1.6], { s: 0.88 }));
  }
  if (id === 'end') {
    out.push(CH(T, T.CREW.leader, { expr: f > 1270 ? 'happy' : 'proud', blink: blinkAt(f, 2), turn: 0.15, L: 'hip', R: f > 1262 ? 'wave' : 'hip' }, [-11.2, 0, 1.9], { s: 0.88 }));
    const wv = q(Math.sin(f * 0.7) * 40, 0);
    out.push(CH(T, T.PAX.kid, { expr: 'laugh', turn: -0.4, L: 'hang', R: { x: 520 + wv, y: 120 }, bob: q(Math.abs(Math.sin(f * 0.4)) * 0.02, 3) }, [-12.0, 0, 3.2], { s: 0.62 }));
    out.push(CH(T, T.PAX.mom, { expr: 'happy', turn: -0.4, L: 'hang', R: 'hang' }, [-12.6, 0, 2.4], { s: 0.82 }));
    const bw = smooth(ramp(f, 1256, 1266)) * (1 - smooth(ramp(f, 1290, 1300)));
    out.push(CH(T, T.PAX.opa, { expr: bw > 0.4 ? 'proud' : 'happy', turn: 0.6, tilt: q(-22 * bw, 1), L: 'hang', R: 'hang' }, [-10.2, 0, 2.6], { s: 0.82 }));
  }
  return out;
};

// ---------------- fx (flat sprites) ----------------
const FXO = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
const overlay = (f, key, draw, d = 1.6, order = 6) => {
  const C = camAt(f), dir = C.look.map((v, i) => v - C.pos[i]), L = Math.hypot(...dir), n = dir.map((v) => v / L);
  const Hv = 2 * d * Math.tan(C.fov * Math.PI / 360), s = Hv / 2.25 * 1.08, c = C.pos.map((v, i) => v + n[i] * d);
  return FXO(key, draw, [c[0], c[1] - 1.06875 * s, c[2]], s, { order });
};
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const speedLines = (k) => (p) => { const g = p.g; for (let i = 0; i < 46; i++) { const a = rnd(i + k * 3) * Math.PI * 2, r0 = 170 + rnd(i * 7 + k) * 160, len = 140 + rnd(i * 3) * 320;
  g.strokeStyle = `rgba(255,255,255,${0.35 + 0.4 * rnd(i * 5 + k)})`; g.lineWidth = 3 + rnd(i) * 7; g.beginPath(); g.moveTo(300 + Math.cos(a) * r0, 500 + Math.sin(a) * r0 * 1.5); g.lineTo(300 + Math.cos(a) * (r0 + len), 500 + Math.sin(a) * (r0 + len) * 1.5); g.stroke(); } };
const sparks = (k) => (p) => { const g = p.g; for (let i = 0; i < 36; i++) { const a = -Math.PI * (0.15 + 0.7 * rnd(i + k)), r = 40 + rnd(i * 3 + k * 7) * 260, x = 300 + Math.cos(a) * r * (rnd(i) > 0.5 ? 1 : -1), y = 900 + Math.sin(a) * r * 0.9;
  g.strokeStyle = i % 3 ? '#ffd24a' : '#ff8a2a'; g.lineWidth = 4 + rnd(i * 9) * 4; g.beginPath(); g.moveTo(300 + (x - 300) * 0.7, 900 + (y - 900) * 0.7); g.lineTo(x, y); g.stroke(); }
  const r = g.createRadialGradient(300, 920, 0, 300, 920, 140); r.addColorStop(0, 'rgba(255,230,150,.9)'); r.addColorStop(1, 'rgba(255,160,60,0)'); g.fillStyle = r; g.fillRect(140, 780, 320, 220); };
const rain = (f, k = 1) => (p) => { const g = p.g; g.lineCap = 'round'; for (let i = 0; i < 90; i++) { const x = (rnd(i) * 700 + f * 9 * (0.5 + rnd(i * 2))) % 700 - 50, y = (rnd(i * 3) * 1100 + f * 60 * (0.7 + rnd(i * 5))) % 1100 - 50;
  g.strokeStyle = `rgba(220,228,240,${(0.25 + 0.35 * rnd(i * 7)) * k})`; g.lineWidth = 2 + rnd(i * 11) * 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 10, y + 60); g.stroke(); } };
const debris = (f) => (p) => { const g = p.g; for (let i = 0; i < 16; i++) { const t = (f * 0.05 + rnd(i)) % 1, a = rnd(i * 3) * Math.PI * 2, r = 60 + t * 520;
  g.save(); g.translate(300 + Math.cos(a) * r, 520 + Math.sin(a) * r * 1.4); g.rotate(f * 0.4 + i); g.fillStyle = i % 3 ? '#f4f2ea' : '#cfd6de'; g.strokeStyle = '#1a1416'; g.lineWidth = 3;
  g.fillRect(-14 - t * 10, -9 - t * 6, 28 + t * 20, 18 + t * 12); g.strokeRect(-14 - t * 10, -9 - t * 6, 28 + t * 20, 18 + t * 12); g.restore(); } };
const twinkle = (t, col = '#ffffff') => (p) => { const g = p.g, a = Math.sin(clamp(t) * Math.PI), r = 120 * a; if (r < 2) return;
  g.fillStyle = col; g.strokeStyle = '#1a1416'; g.lineWidth = 6; g.beginPath(); for (let k = 0; k < 8; k++) { const b = k * Math.PI / 4, rr = k % 2 ? r * 0.22 : r; g.lineTo(300 + Math.cos(b) * rr, 500 + Math.sin(b) * rr); } g.closePath(); g.fill(); g.stroke(); };
const trash = (kind) => (p) => { const g = p.g; g.strokeStyle = '#1a1416'; g.lineWidth = 8;
  if (kind === 0) { g.fillStyle = '#f2efe6'; g.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, r = 70 + (k % 2) * 22; g.lineTo(300 + Math.cos(a) * r, 860 + Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke(); }
  if (kind === 1) { g.fillStyle = '#d84a3a'; g.fillRect(250, 760, 100, 190); g.strokeRect(250, 760, 100, 190); g.fillStyle = '#e8e8ec'; g.fillRect(250, 830, 100, 40); }
  if (kind === 2) { g.fillStyle = 'rgba(160,210,240,.85)'; g.beginPath(); g.moveTo(270, 950); g.lineTo(270, 800); g.lineTo(290, 760); g.lineTo(290, 720); g.lineTo(310, 720); g.lineTo(310, 760); g.lineTo(330, 800); g.lineTo(330, 950); g.closePath(); g.fill(); g.stroke(); } };
const beam = (k) => (p) => { const g = p.g, r = g.createLinearGradient(0, 500, 600, 500); r.addColorStop(0, `rgba(255,240,170,${0.55 * k})`); r.addColorStop(1, 'rgba(255,240,170,0)'); g.fillStyle = r; g.beginPath(); g.moveTo(0, 480); g.lineTo(600, 330); g.lineTo(600, 690); g.lineTo(0, 520); g.closePath(); g.fill(); };
const flashPop = (t) => (p) => { const g = p.g, r = g.createRadialGradient(300, 500, 0, 300, 500, 200 * (1 - t * 0.5)); r.addColorStop(0, `rgba(255,255,255,${1 - t})`); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 200, 600, 600); };

export const fxAt = (f, T) => {
  const id = shotAt(f).id, out = [], tx = txAt(f);
  if (id === 'hook') {
    if (f < 30) out.push(overlay(f, 'speed' + (f % 4), speedLines(f % 4), 1.4));
    if (f < 34) out.push(overlay(f, 'deb' + f, debris(f), 1.8));
    if (f >= 12 && f < 34) for (const s of [-1, 1]) out.push(FXO('spk' + s + (f % 3), sparks(f % 3 + (s > 0 ? 5 : 0)), [tx - 3.2, -1.3, TRAIN_Z + s * 0.8], 0.9, { order: 6 }));
    if (f < 40) for (const s of [-1, 1]) out.push(FXO('hlg', (p) => T.fxGlow(p, '255,246,210', 1), [tx - 1.1, -0.75, TRAIN_Z + s * 0.36], 0.55, { order: 6 }));
    if (f >= 29 && f < 44) { const t = q((f - 29) / 15); for (const s of [-1, 1]) out.push(FXO('puff' + t, (p) => T.fxPuff(p, t), [tx - 2.5, -0.9, TRAIN_Z + s * 1.9], 1.3)); }
    if (f >= 41 && f < 49) out.push(overlay(f, 'whip' + (f % 3), speedLines(f % 3 + 9), 1.4));
  }
  if (id === 'count' && f >= 184 && f < 192) { const t = q((f - 184) / 8); out.push(FXO('tick' + t, (p) => T.fxBurst(p, t, '#fff6c8', 12, 30, 200), [KF[0] + 0.5, 1.6, KF[2]], 2.2, { order: 6 })); }
  if (id === 'rev' && f >= 338 && f < 354) for (const s of [-1, 1]) { const k = hlAt(f) > 3 ? 1 : 0.15; out.push(FXO('hl' + k, (p) => T.fxGlow(p, '255,246,200', k), [-1.1, -1.25, TRAIN_Z + s * 0.36], 1.1, { order: 6 })); }
  if (id === 'bow' && f >= 303 && f < 316) { const t = q((f - 303) / 13); out.push(FXO('bowst' + t, twinkle(t, '#ffe9a0'), [-6.2, 1.9, 1.6], 0.5)); }
  if (id === 'mont') {
    if (f >= 533 && f < 556) for (let i = 0; i < 3; i++) { const t = (f - 533 - i * 6) / 10; if (t > 0 && t < 1) out.push(FXO('tr' + i + q(t), trash(i), I(lerp(-5.0, -4.15, t), 0.6 + Math.sin(t * Math.PI) * 0.5 - t * 0.2, lerp(-0.9, -0.45, t)), 0.16)); }
    if (f >= 560 && f < 569) out.push(FXO('fb', beam(1), I(5.0, 0.55, -0.6), 0.9, { order: 4 }));
    if (f >= 569 && f < 581) { const t = q((f - 569) / 12); out.push(FXO('ting' + t, twinkle(t), I(4.55, 1.6, -0.35), 0.5)); }
  }
  if (id === 'wave2' && f >= 678 && f < 690) { const t = q((f - 678) / 12); out.push(FXO('ws' + t, twinkle(t), I(-8.8, 1.3, -0.9), 0.4)); }
  if (id === 'tray') for (const a of [706, 722, 736]) if (f >= a && f < a + 9) { const t = q((f - a) / 9); out.push(FXO('ts' + a + t, twinkle(t), I(-2.6, 1.0, -0.6), 0.35)); }
  if (id === 'cover') {
    if (f < 772) for (const a of [750, 760]) if (f >= a && f < a + 10) { const t = q((f - a) / 10); out.push(FXO('ms' + a + t, twinkle(t), I(2.4, 0.15, 0.1), 0.3)); }
    for (let k = 6; k <= 12; k++) { const a = 775 + (12 - k) * 3 + 3; if (f >= a && f < a + 7) { const t = q((f - a) / 7); out.push(FXO('cs' + k + t, twinkle(t), I(-9.88 + k * 1.04 + 0.25, 1.35, -1.0), 0.28)); } }
  }
  if (id === 'ctrl') out.push(FXO('beam', beam(0.9), I(lerp(1.1, 2.3, ramp(f, 794, 835)) - 0.45, 0.4, 0.35), 0.85, { order: 4, flip: true }));
  if (id === 'done' && f >= 892 && f < 904) { const t = q((f - 892) / 12); out.push(FXO('ding' + t, (p) => T.fxBurst(p, t, '#ffe28a', 14, 30, 230), [KF[0] + 0.6, 1.3, KF[2]], 2.3, { order: 6 })); }
  if (id === 'th1' || id === 'th2') {
    for (const x of CREWX.slice(0, 4)) out.push(FXO('pool', (p) => T.fxGlow(p, '255,236,180', 0.55), [x, -0.3, 1.5], 1.5, { order: 1 }));
    for (const [a, x, z] of [[925, -5.39, 3.62], [941, -5.97, 4.68], [962, -10.4, 6.0], [979, -7.9, 6.1], [995, -10.4, 6.0]]) if (f >= a && f < a + 6) { const t = q((f - a) / 6); out.push(FXO('cam' + a + t, flashPop(t), [x + 0.25, 0.7, z], 1.0)); }
  }
  if (id === 'past' || id === 'past2') out.push(overlay(f, 'rain' + (f % 6), rain(f, 1), 2.2));
  if (id === 'turn') { const k = 1 - smooth(ramp(f, 1196, 1222)); if (k > 0.02) out.push(overlay(f, 'rain' + (f % 6) + q(k, 1), rain(f, k), 2.2)); }
  if (id === 'turn' || id === 'end') for (let i = 0; i < 10; i++) { const t = ((f * 0.006 + i * 0.137) % 1), x = -13 + ((i * 2.31) % 5), y = 0.5 + t * 2.5, z = 1 + ((i * 1.7) % 3);
    out.push(FXO('mote' + q(Math.sin(t * Math.PI), 1), (p) => T.fxMote(p, t), [x, y, z], 0.16)); }
  if (id === 'end' && f >= 1262 && f < 1276) { const t = q((f - 1262) / 14); out.push(FXO('es' + t, twinkle(t, '#ffe9a0'), [-11.0, 2.0, 2.0], 0.5)); }
  return out;
};
