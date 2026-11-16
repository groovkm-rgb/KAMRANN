// "Der Kaiser von Amerika" — 1080x1920, 30 fps. Voice: voice.mp3 (50.10 s). TOTAL = 50.6 s.
// Phrase times (silence-aligned, checked against the waveform gaps; f = frame @30fps):
//  0.08- 2.55 f   2- 76  Ein Mann läuft durch die Straßen von San Francisco.
//  2.91- 3.70 f  87-111  Blaue Uniform,           4.04- 5.12 f121-153 goldene Schulterklappen,   5.35- 6.51 f160-195 ein Säbel an der Seite.
//  6.86- 8.50 f 205-255  Und die Leute verbeugen sich vor ihm.
//  8.91- 9.49 f 267-285  Denn er ist …   9.80-12.00 f294-360  der Kaiser von Amerika.
// 12.48-12.88 f 374-386  Na ja.          13.28-14.13 f398-423  Sagt er zumindest.
// 14.49-16.64 f 434-499  Eigentlich war er mal ein reicher Geschäftsmann.
// 16.98-18.04 f 509-541  Dann verliert er alles.
// 18.47-20.65 f 554-619  Und eines Tages schickt er einen Brief an die Zeitung:   21.02-22.27 f630-668 Ab heute bin ich Kaiser.
// 22.73-23.57 f 682-707  Die Zeitung druckt das.   23.89-24.48 f716-734 Einfach so.
// 24.96-25.99 f 748-779  Sein erster Befehl?       26.15-27.14 f784-814 Er löst den Kongress auf.
// 27.42-29.03 f 822-870  Der Kongress macht natürlich einfach weiter.
// 29.29-30.39 f 878-911  Er druckt sein eigenes Geld.   30.70-32.47 f921-974 Und viele Läden nehmen es tatsächlich an.
// 32.74-34.26 f 982-1027 Einmal wird er sogar verhaftet.   34.45-35.68 f1033-1070 Die ganze Stadt regt sich auf.
// 35.91-36.83 f1077-1104 Er kommt sofort frei.   37.11-37.59 f1113-1127 Und es heißt,   37.91-39.94 f1137-1198 ab da salutieren die Polizisten vor ihm.
// 40.26-41.11 f1207-1233 Dann befiehlt er:   41.54-42.86 f1246-1286 Baut eine Brücke über die Bucht!   42.93-43.45 f1288-1303 Alle lachen.
// 43.83-44.68 f1315-1340 Heute steht sie da.   44.87-45.65 f1346-1369 Und als er stirbt,   45.72-47.49 f1372-1424 kommen Tausende zu seiner Beerdigung.
// 47.87-48.68 f1436-1460 Für einen Kaiser …   48.97-49.76 f1469-1492 ohne Reich.
import { SET, H, PIER, BRIDGE } from './scene.js';
export const FPS = 30, TOTAL = 1518;
export const SHOTS = [
  { id: 'hook', a: 0, b: 81 }, { id: 'buttons', a: 82, b: 115 }, { id: 'epaul', a: 116, b: 156 }, { id: 'sabre', a: 157, b: 200 },
  { id: 'bow', a: 201, b: 261 }, { id: 'kaiser', a: 262, b: 366 }, { id: 'naja', a: 367, b: 429 },
  { id: 'rich', a: 430, b: 503 }, { id: 'lose', a: 504, b: 547 }, { id: 'write', a: 548, b: 624 }, { id: 'seal', a: 625, b: 674 },
  { id: 'press', a: 675, b: 741 }, { id: 'decree', a: 742, b: 817 }, { id: 'congress', a: 818, b: 874 }, { id: 'money', a: 875, b: 915 },
  { id: 'shop', a: 916, b: 977 }, { id: 'arrest', a: 978, b: 1030 }, { id: 'angry', a: 1031, b: 1073 }, { id: 'free', a: 1074, b: 1108 },
  { id: 'heisst', a: 1109, b: 1151 }, { id: 'salute', a: 1152, b: 1202 }, { id: 'befiehlt', a: 1203, b: 1239 }, { id: 'baut', a: 1240, b: 1308 },
  { id: 'bridge', a: 1309, b: 1369 }, { id: 'funeral', a: 1370, b: 1429 }, { id: 'final', a: 1430, b: 1517 },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f < s.b + 1) || SHOTS[SHOTS.length - 1];
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const easeOut = (t) => 1 - (1 - clamp(t)) ** 3.2;
const lerp = (a, b, t) => a + (b - a) * t, lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t)), ramp = (f, a, b) => clamp((f - a) / (b - a));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const O = (k, p) => [p[0] + SET[k][0], p[1] + SET[k][1], p[2] + SET[k][2]];

// ---------------- light ----------------
const base = { ink: 1.5, waterDeep: '#2c5c7c', waterShal: '#5a9eb4', glint: '#fff4d8', shadowExt: 14 };
export const LIGHTS = {
  gold: { ...base, az: 300, el: 24, sky: '#ffe2b8', ground: '#8a6a5a', hemi: 1.25, sun: '#ffd49a', sunI: 2.7, fog: '#f0d2a0', fogNear: 45, fogFar: 520,
    skyTop: '#4f8fd8', skyHor: '#f8deae', sunDisc: '#fff0c0', sunSize: 0.012, sat: 1.22, gain: '#fff2e0', lift: '#08040c', vig: 0.28, shadowExt: 16 },
  station: { ...base, az: 150, el: 30, sky: '#ffe2b8', ground: '#8a6a5a', hemi: 1.25, sun: '#ffd49a', sunI: 2.6, fog: '#f0d2a0', fogNear: 45, fogFar: 520,
    skyTop: '#4f8fd8', skyHor: '#f8deae', sat: 1.22, gain: '#fff2e0', lift: '#08040c', vig: 0.28, shadowExt: 14 },
  sepia: { ...base, az: 270, el: 24, sky: '#ffe8c8', ground: '#5a4030', hemi: 1.0, sun: '#ffd8a0', sunI: 2.6, fog: '#c8a880', fogNear: 14, fogFar: 90,
    skyTop: '#e8c890', skyHor: '#fff2d8', sat: 0.55, gain: '#ffe6bc', lift: '#160c04', vig: 0.42, shadowExt: 8 },
  sepiaEmpty: { ...base, az: 270, el: 20, sky: '#d8d0c0', ground: '#3a3028', hemi: 0.85, sun: '#f2dcb8', sunI: 2.0, fog: '#a89880', fogNear: 10, fogFar: 70,
    skyTop: '#c8b898', skyHor: '#ece0c8', sat: 0.4, gain: '#f0e0c8', lift: '#100a06', vig: 0.48, shadowExt: 8 },
  candle: { ...base, az: 270, el: 22, sky: '#6a6aa8', ground: '#2a1a20', hemi: 0.62, sun: '#8a9ae0', sunI: 1.0, fog: '#1a1830', fogNear: 8, fogFar: 40,
    skyTop: '#0e1430', skyHor: '#2a3a6a', sat: 0.8, gain: '#ffd8a8', lift: '#06040a', vig: 0.5, shadowExt: 8, ink: 1.6 },
  press: { ...base, az: 270, el: 34, sky: '#ffe2c0', ground: '#4a3a30', hemi: 0.95, sun: '#ffd8a0', sunI: 2.8, fog: '#8a7058', fogNear: 9, fogFar: 46,
    skyTop: '#d8c0a0', skyHor: '#fff0d8', sat: 1.15, gain: '#fff0dc', lift: '#0c0806', vig: 0.36, shadowExt: 10 },
  congress: { ...base, az: 270, el: 30, sky: '#f2e6d2', ground: '#5a4a3a', hemi: 1.05, sun: '#fff0d0', sunI: 2.5, fog: '#c8b898', fogNear: 12, fogFar: 70,
    skyTop: '#b8c8e0', skyHor: '#f8f0e0', sat: 1.08, gain: '#fff4e4', lift: '#0a0808', vig: 0.34, shadowExt: 12 },
  shop: { ...base, az: 90, el: 30, sky: '#ffe8c8', ground: '#6a4a30', hemi: 1.15, sun: '#ffd8a0', sunI: 2.6, fog: '#e8c8a0', fogNear: 20, fogFar: 140,
    skyTop: '#5a9ae0', skyHor: '#f8e2b8', sat: 1.2, gain: '#fff2e0', lift: '#0a0604', vig: 0.3, shadowExt: 8 },
  bayFog: { ...base, az: 250, el: 16, sky: '#c8d8e8', ground: '#5a6a7a', hemi: 1.25, sun: '#e8eef8', sunI: 1.3, fog: '#b4c4d6', fogNear: 10, fogFar: 170,
    skyTop: '#8aa4c4', skyHor: '#d4dee8', sat: 0.95, gain: '#eaf2ff', lift: '#0a1018', vig: 0.3, waterDeep: '#4a6a80', waterShal: '#7a98a8', glint: '#e0eef8', shadowExt: 14 },
  sunset: { ...base, az: 262, el: 7, sky: '#ffb488', ground: '#5a3a6a', hemi: 1.05, sun: '#ffa060', sunI: 2.3, fog: '#e88a70', fogNear: 60, fogFar: 950,
    skyTop: '#4a3a8a', skyHor: '#ffa064', sunDisc: '#ffe4a0', sunSize: 0.03, sat: 1.25, gain: '#fff0e0', lift: '#140818', vig: 0.34,
    waterDeep: '#3a3a6a', waterShal: '#c87a6a', glint: '#ffe0a0', shadowExt: 26, ink: 1.3 },
};
const hx = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const mixC = (a, b, t) => '#' + hx(a).map((v, i) => Math.round(lerp(v, hx(b)[i], t)).toString(16).padStart(2, '0')).join('');
const mixL = (A, B, t) => { const o = {}; for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) { const a = A[k] ?? B[k], b = B[k] ?? a; o[k] = typeof a === 'number' ? lerp(a, b, t) : typeof a === 'string' && a[0] === '#' && typeof b === 'string' ? mixC(a, b, t) : t < 0.5 ? a : b; } return o; };
const LIGHT_OF = { hook: 'gold', buttons: 'gold', epaul: 'gold', sabre: 'gold', bow: 'gold', kaiser: 'gold', naja: 'gold', rich: 'sepia', lose: 'sepia', write: 'candle', seal: 'candle',
  press: 'press', decree: 'gold', congress: 'congress', money: 'press', shop: 'shop', arrest: 'station', angry: 'station', free: 'station', heisst: 'gold', salute: 'gold',
  befiehlt: 'bayFog', baut: 'bayFog', bridge: 'bayFog', funeral: 'sunset', final: 'sunset' };
export const lightFor = (S, f) => {
  const lf = f - S.a; let L = LIGHTS[LIGHT_OF[S.id]];
  if (S.id === 'lose') L = mixL(LIGHTS.sepia, LIGHTS.sepiaEmpty, ramp(lf, 12, 16));
  if (S.id === 'bridge') L = mixL(LIGHTS.bayFog, LIGHTS.sunset, smooth(ramp(lf, 4, 18)));
  if (S.id === 'heisst' || S.id === 'salute') L = { ...L, az: 60, el: 26 };
  if (S.id === 'decree') L = { ...L, az: 300, el: 22 };
  return L;
};

// ---------------- camera ----------------
const W0 = (lf) => -7 + lf * 0.042; // the Kaiser's z while he struts toward the lens (hook)
const KZ = { buttons: -3.55, epaul: -3.4, sabre: -3.2 };
const CAM = {
  hook: (lf) => { const z = W0(lf), push = easeOut(ramp(lf, 50, 66)), pp = ramp(lf, 66, 81);
    return { pos: [0.32 - push * 0.12, 0.42 + push * 0.08, z + 3.7 - push * 1.0 - pp * 0.15], look: [0.02, 1.52 + push * 0.12, z], fov: 52 - push * 6 - pp, roll: -2 + push * 1.5 }; },
  buttons: [{ f: 0, pos: [0.16, 1.02, -3.55 + 1.0], look: [0.0, 1.0, -3.55], fov: 40 }, { f: 33, pos: [0.1, 1.12, -3.55 + 0.82], look: [0.0, 1.08, -3.55], fov: 38, e: 'lin' }],
  epaul: [{ f: 0, pos: [-0.75, 1.42, -3.4 + 1.1], look: [-0.24, 1.3, -3.4], fov: 36, roll: 5 }, { f: 9, pos: [-0.55, 1.38, -3.4 + 0.8], look: [-0.24, 1.3, -3.4], fov: 34, roll: 3, e: 'out' }, { f: 40, pos: [-0.5, 1.37, -3.4 + 0.72], look: [-0.24, 1.29, -3.4], fov: 33, roll: 2, e: 'lin' }],
  sabre: [{ f: 0, pos: [-0.5, 1.05, -3.2 + 1.2], look: [-0.2, 0.98, -3.2], fov: 40, roll: -3 }, { f: 43, pos: [-0.56, 0.62, -3.2 + 1.15], look: [-0.27, 0.46, -3.2], fov: 40, roll: -1, e: 'lin' }],
  bow: [{ f: 0, pos: [1.7, 3.0, 6.0], look: [0.0, 1.0, -5.0], fov: 48, roll: 0 }, { f: 60, pos: [0.9, 2.2, 4.4], look: [0.0, 1.25, -4.0], fov: 46, e: 'lin' }],
  kaiser: [{ f: 0, pos: [0.7, 1.65, 2.5], look: [0.0, 1.55, -1.0], fov: 42 }, { f: 28, pos: [0.55, 1.6, 2.1], look: [0.0, 1.55, -1.0], fov: 41, e: 'lin' },
    { f: 36, pos: [0.25, 0.32, 1.7], look: [0.0, 1.75, -1.0], fov: 50, roll: -3.5, e: 'out' }, { f: 104, pos: [0.18, 0.36, 1.15], look: [0.0, 1.78, -1.0], fov: 48, roll: -4.5, e: 'lin' }],
  naja: [{ f: 0, pos: [0.25, 1.75, 0.6], look: [0.0, 1.85, -1.0], fov: 40 }, { f: 9, pos: [0.25, 1.72, 0.5], look: [0.0, 1.85, -1.0], fov: 40, e: 'lin' },
    { f: 24, pos: [1.0, 1.25, 3.7], look: [0.0, 1.05, -1.0], fov: 44, roll: 1.5, e: 'out' }, { f: 62, pos: [1.0, 1.2, 4.0], look: [0.0, 1.05, -1.0], fov: 44, roll: 2, e: 'lin' }],
  rich: [{ f: 0, pos: O('office', [1.3, 1.6, 3.75]), look: O('office', [0.3, 1.35, -0.6]), fov: 44 }, { f: 73, pos: O('office', [0.8, 1.5, 3.1]), look: O('office', [0.35, 1.32, -0.6]), fov: 42, e: 'lin' }],
  lose: [{ f: 0, pos: O('office', [0.8, 1.5, 3.0]), look: O('office', [0.3, 1.25, -0.6]), fov: 42 }, { f: 13, pos: O('office', [0.75, 1.5, 3.1]), look: O('office', [0.3, 1.2, -0.6]), fov: 42, e: 'lin' },
    { f: 14, pos: O('office', [0.3, 1.9, 3.3]), look: O('office', [0.0, 0.95, 0.3]), fov: 48, roll: -3, cut: true }, { f: 43, pos: O('office', [0.5, 2.3, 3.7]), look: O('office', [0.0, 0.9, 0.3]), fov: 52, roll: -4, e: 'lin' }],
  write: [{ f: 0, pos: O('office', [0.9, 1.3, 3.6]), look: O('office', [0.0, 1.05, 0.9]), fov: 42 }, { f: 76, pos: O('office', [0.45, 1.25, 2.7]), look: O('office', [0.05, 1.02, 0.9]), fov: 40, e: 'lin' }],
  seal: [{ f: 0, pos: O('office', [0.2, 1.52, 1.95]), look: O('office', [-0.04, 0.87, 1.15]), fov: 40, roll: 3 }, { f: 49, pos: O('office', [0.12, 1.4, 1.78]), look: O('office', [-0.04, 0.87, 1.17]), fov: 38, roll: 1, e: 'lin' }],
  press: [{ f: 0, pos: O('press', [0.5, 1.7, 4.6]), look: O('press', [-1.5, 1.5, 1.6]), fov: 50 }, { f: 32, pos: O('press', [0.0, 1.65, 4.1]), look: O('press', [-1.6, 1.5, 1.6]), fov: 48, e: 'lin' },
    { f: 46, pos: O('press', [0.0, 3.0, 2.8]), look: O('press', [0.0, 1.0, 1.2]), fov: 50, e: 'out' }, { f: 66, pos: O('press', [0.0, 2.9, 2.7]), look: O('press', [0.0, 1.0, 1.2]), fov: 49, e: 'lin' }],
  decree: [{ f: 0, pos: [-1.0, 1.75, 12.0], look: [-2.0, 2.05, 6.0], fov: 46, roll: 2 }, { f: 75, pos: [-1.2, 1.7, 11.0], look: [-2.0, 2.1, 6.0], fov: 45, roll: 3, e: 'lin' }],
  congress: [{ f: 0, pos: O('congress', [-0.5, 1.6, 7.6]), look: O('congress', [-1.1, 1.35, 3.4]), fov: 40 }, { f: 26, pos: O('congress', [-0.6, 1.62, 7.2]), look: O('congress', [-1.1, 1.38, 3.4]), fov: 40, e: 'lin' },
    { f: 56, pos: O('congress', [0.6, 2.2, 7.4]), look: O('congress', [2.6, 2.6, -2.0]), fov: 46, roll: -2, e: 'out' }],
  money: [{ f: 0, pos: O('press', [0.25, 2.5, 2.6]), look: O('press', [0.0, 1.0, 0.75]), fov: 46, roll: -2 }, { f: 15, pos: O('press', [0.2, 2.4, 2.45]), look: O('press', [0.0, 1.0, 0.85]), fov: 45, e: 'lin' },
    { f: 22, pos: O('press', [2.0, 1.75, -0.4]), look: O('press', [3.4, 1.75, -3.4]), fov: 44, roll: 2, e: 'out' }, { f: 40, pos: O('press', [2.65, 1.75, -1.5]), look: O('press', [3.62, 1.7, -3.4]), fov: 42, roll: 2, e: 'lin' }],
  shop: [{ f: 0, pos: O('shop', [-1.6, 1.42, 9.3]), look: O('shop', [-1.6, 1.5, 0.0]), fov: 44 }, { f: 14, pos: O('shop', [-1.55, 1.5, 8.4]), look: O('shop', [-1.5, 1.6, 0.0]), fov: 44, e: 'lin' }, { f: 23, pos: O('shop', [-0.9, 2.45, 3.7]), look: O('shop', [-0.3, 1.7, -0.8]), fov: 46 },
    { f: 30, pos: O('shop', [-0.3, 1.75, 1.9]), look: O('shop', [0.05, 1.4, -0.8]), fov: 46, e: 'out' }, { f: 61, pos: O('shop', [-0.25, 1.7, 1.6]), look: O('shop', [0.08, 1.4, -0.8]), fov: 44, e: 'lin' }],
  arrest: [{ f: 0, pos: [3.2, 1.55, 15.0], look: [4.9, 1.45, 9.3], fov: 44 }, { f: 52, pos: [4.6, 1.5, 15.2], look: [6.6, 1.5, 11.0], fov: 43, e: 'lin' }],
  angry: [{ f: 0, pos: [-1.6, 2.1, 12.6], look: [8.4, 3.0, 12.0], fov: 50, roll: 1 }, { f: 42, pos: [-0.8, 2.0, 12.6], look: [8.4, 3.0, 12.0], fov: 48, roll: 2.5, e: 'lin' }],
  free: [{ f: 0, pos: [3.4, 1.3, 14.4], look: [7.8, 2.1, 12.0], fov: 44 }, { f: 34, pos: [4.2, 1.35, 13.9], look: [7.7, 2.05, 12.0], fov: 42, e: 'lin' }],
  heisst: [{ f: 0, pos: [0.0, 1.35, 2.4], look: [0.5, 1.45, -6.0], fov: 44 }, { f: 42, pos: [0.2, 1.38, 1.7], look: [0.55, 1.48, -6.0], fov: 43, e: 'lin' }],
  salute: [{ f: 0, pos: [0.9, 1.45, 0.6], look: [0.75, 1.45, -4.3], fov: 46 }, { f: 4, pos: [0.88, 1.45, 0.45], look: [0.75, 1.45, -4.3], fov: 45, e: 'out' }, { f: 50, pos: [0.8, 1.45, -0.4], look: [0.7, 1.5, -4.3], fov: 44, e: 'lin' }],
  befiehlt: [{ f: 0, pos: [11.4, -11.2, -113.0], look: [7.2, -10.3, -126.0], fov: 48, roll: -2 }, { f: 36, pos: [11.3, -11.25, -113.7], look: [7.2, -10.2, -126.0], fov: 46, roll: -3, e: 'lin' }],
  baut: [{ f: 0, pos: [11.3, -11.05, -114.0], look: [9.7, -10.6, -118.0], fov: 46, roll: -2 }, { f: 42, pos: [11.0, -11.2, -115.0], look: [9.75, -10.45, -118.0], fov: 44, roll: -4, e: 'lin' },
    { f: 49, pos: [11.0, -10.9, -112.8], look: [10.0, -10.9, -105.5], fov: 46, roll: 3, e: 'out' }, { f: 68, pos: [11.0, -10.9, -112.0], look: [10.0, -10.9, -105.5], fov: 45, roll: 4, e: 'lin' }],
  bridge: [{ f: 0, pos: [11.4, -11.2, -113.0], look: [7.2, -10.3, -126.0], fov: 48 }, { f: 18, pos: [11.3, -10.6, -116.0], look: [-20.0, 14.0, -300.0], fov: 46, e: 'out' },
    { f: 48, pos: [11.2, -9.8, -118.0], look: [-28.0, 18.0, -300.0], fov: 45, e: 'lin' }, { f: 60, pos: [11.2, -9.6, -118.4], look: [-30.0, 60.0, -300.0], fov: 45, e: 'lin' }],
  funeral: [{ f: 0, pos: [0.6, 2.0, 4.0], look: [0.0, 14.0, -14.0], fov: 46 }, { f: 16, pos: [0.6, 1.9, 3.6], look: [0.0, 1.5, -14.0], fov: 46, e: 'out' }, { f: 59, pos: [0.5, 1.85, 2.6], look: [0.0, 1.5, -14.0], fov: 45, e: 'lin' }],
  final: [{ f: 0, pos: [0.42, 0.42, -16.4], look: [0.12, 0.18, -18.3], fov: 42 }, { f: 12, pos: [0.4, 0.42, -16.5], look: [0.12, 0.2, -18.3], fov: 42, e: 'lin' },
    { f: 87, pos: [0.3, 1.1, -17.6], look: [-30, 34, -300], fov: 46, e: 'lin' }],
};
const keysAt = (keys, lf) => {
  if (lf <= keys[0].f) return { ...keys[0] }; const L = keys[keys.length - 1]; if (lf >= L.f) return { ...L };
  for (let i = 0; i < keys.length - 1; i++) if (lf >= keys[i].f && lf < keys[i + 1].f) { const a = keys[i], b = keys[i + 1]; if (b.cut) return { ...a };
    const r = (lf - a.f) / (b.f - a.f), t = b.e === 'out' ? easeOut(r) : b.e === 'lin' ? r : smooth(r);
    return { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) }; }
  return { ...L };
};
const KICKS = [{ f: 292, a: 0.02 }, { f: 649, a: 0.012 }, { f: 1031, a: 0.012 }, { f: 1155, a: 0.01 }, { f: 1315, a: 0.008 }, { f: 516, a: 0.015 }];
const FLASH = [430, 518, 742, 1309];
export const camAt = (f) => {
  const S = shotAt(f), lf = f - S.a, k = CAM[S.id]; let c = typeof k === 'function' ? k(lf) : keysAt(k, lf);
  c = { ...c, pos: [...c.pos], look: [...c.look], roll: c.roll || 0 };
  // living camera: a soft handheld drift on every shot (never frozen)
  c.look[0] += Math.sin(f * 0.07) * 0.012; c.look[1] += Math.sin(f * 0.053 + 1) * 0.01; c.roll += Math.sin(f * 0.041) * 0.25;
  for (const kk of KICKS) { const d = f - kk.f; if (d >= 0 && d < 7) { const s = (Math.floor(d) % 2 ? -1 : 1) * kk.a * (1 - d / 7); c.look[1] += s * 3; c.look[0] += s * 2; c.roll += s * 20; } }
  c.flash = 0; for (const fl of FLASH) if (f >= fl && f < fl + 4) c.flash = (1 - (f - fl) / 4) * 0.85;
  c.shadowAt = c.look.map((v, i) => lerp(c.pos[i], v, i === 1 ? 0.2 : 0.35)); c.shadowAt[1] = Math.min(c.shadowAt[1], c.pos[1]);
  return c;
};
globalThis.mbAt = (f) => { const S = shotAt(f), lf = f - S.a; if (S.id === 'money' && lf >= 15 && lf < 23) return 5; if (S.id === 'baut' && lf >= 42 && lf < 50) return 5; if (S.id === 'kaiser' && lf >= 28 && lf < 34) return 4; return 1; };

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOCUS = {
  hook: (lf) => [[0, 1.75, W0(lf)], 11], buttons: () => [[0, 1.05, -3.55], 14], epaul: () => [[-0.2, 1.35, -3.4], 14], sabre: () => [[-0.22, 0.75, -3.2], 14],
  bow: () => [[0, 1.6, -2.4], 6], kaiser: (lf) => [[0, 1.9, -1.0], lf < 34 ? 12 : 9], naja: (lf) => [[0, 1.8, -1.0], lf < 14 ? 12 : 7],
  rich: () => [O('office', [0.55, 1.8, 0.6]), 12], lose: (lf) => [O('office', lf < 14 ? [0.55, 1.8, 0.6] : [0, 1.2, 0.55]), lf < 14 ? 12 : 8],
  write: () => [O('office', [0, 1.35, 0.6]), 13], seal: () => [O('office', [-0.04, 0.88, 1.2]), 16],
  press: (lf) => [O('press', lf < 40 ? [-1.6, 1.8, 1.6] : [0, 1.0, 1.0]), 12], decree: () => [[-2.0, 2.2, 6.0], 9],
  congress: (lf) => [O('congress', lf < 30 ? [-1.1, 1.6, 3.4] : [1.5, 2.2, 0.0]), 11], money: (lf) => [O('press', lf < 18 ? [0, 0.95, 0.4] : [3.4, 1.9, -3.4]), 14],
  shop: (lf) => [O('shop', lf < 24 ? [-1.6, 1.42, 2.83] : [-0.4, 1.7, -0.6]), lf < 24 ? 8 : 12], arrest: () => [[5.4, 1.7, 10.0], 10], angry: () => [[5.0, 1.8, 12.0], 7], free: () => [[7.6, 2.3, 12.0], 11],
  heisst: () => [[1.4, 1.7, -2.6], 10], salute: () => [[0.8, 1.8, -4.3], 10], befiehlt: () => [[9.8, -10.7, -117.8], 8], baut: (lf) => [lf < 46 ? [9.8, -10.6, -117.8] : [10.2, -10.8, -106.6], 10],
  bridge: () => [[-40, 20, -300], 2], funeral: () => [[0, 2, -12], 5], final: (lf) => [lf < 20 ? [0.12, 0.2, -18.3] : [-10, 20, -200], lf < 20 ? 14 : 3],
};
export const dofAt = (f) => { const S = shotAt(f), C = camAt(f), [p, cinf] = FOCUS[S.id](f - S.a); return { focus: dist(C.pos, p), cinf }; };

// ---------------- world state ----------------
export const worldAt = (f) => {
  const S = shotAt(f), lf = f - S.a, C = camAt(f), id = S.id;
  const W = { cam: C.pos, set: 'street', traffic: true, gulls: true, walkers: true };
  const golden = (at, box = [8, 4, 8], col = '#fff0c8') => ({ at, box, col, size: 0.05, k: 0.85 });
  if (['hook', 'buttons', 'epaul', 'sabre', 'bow', 'kaiser', 'naja'].includes(id)) {
    W.motes = golden([0, 0, -4], [6, 4, 10]);
    if (id === 'hook') { W.fgLamp = [-1.05, 0, -0.6]; W.fgBundle = [0.95, 0, -1.6]; }
    if (id === 'kaiser' && lf >= 32) W.conf = { at: [0, 2.6, -2.2], age: (lf - 32) / 30, spread: 0.5 };
    if (id === 'naja' && lf < 8) W.conf = { at: [0, 2.6, -2.2], age: (lf + 72) / 30, spread: 0.5 };
  }
  if (['rich', 'lose', 'write', 'seal'].includes(id)) {
    W.set = 'office'; W.office = id === 'rich' ? 'rich' : id === 'lose' ? (lf < 14 ? 'rich' : 'empty') : 'night';
    W.goldK = id === 'lose' ? 1 - smooth(ramp(lf, 6, 10)) : 1; W.shaftK = id === 'write' || id === 'seal' ? 0.25 : id === 'lose' && lf >= 14 ? 0.7 : 1;
    W.motes = { at: O('office', [0, 0, -1]), box: [6, 4, 5], col: id === 'write' || id === 'seal' ? '#c8d0ff' : '#fff0c8', size: 0.035, k: 0.8 };
    if (id === 'lose' && lf >= 14) W.pages = { at: O('office', [0.5, 0.6, 0.6]), t: lf / 30, wind: 3, s: 0.8 };
    if (id === 'seal') { W.stamp = sealY(lf); W.seal = lf >= 24 ? 1 : 0; }
  }
  if (id === 'press' || id === 'money') { W.set = 'press'; W.pressSpin = 1.2; W.money = id === 'money'; W.sheet = id === 'press' ? smooth(ramp(lf, 34, 54)) : smooth(ramp(lf, 0, 16)) * 0.85;
    W.motes = { at: O('press', [0, 0, -1.5]), box: [10, 5, 6], col: '#fff0c8', size: 0.04, k: 0.85 }; }
  if (id === 'decree') { W.crate = [-2.0, 0, 6.0]; W.conf = lf > 14 ? { at: [-2.0, 3.2, 6.0], age: (lf - 14) / 30, spread: 0.6 } : null; W.motes = golden([-2, 0, 7], [6, 4, 6]); }
  if (id === 'congress') { W.set = 'congress'; W.plane = lf >= 30 ? clamp((lf - 30) / 27) : null; W.motes = { at: O('congress', [0, 0, -2]), box: [14, 7, 8], col: '#fff4d8', size: 0.05, k: 0.7 }; }
  if (id === 'shop') { W.set = 'shop'; W.drawer = smooth(ramp(lf, 34, 40)); W.jarTaken = lf >= 40; W.motes = { at: O('shop', [-0.6, 0, 0.5]), box: [5, 3, 4], col: '#fff0c8', size: 0.03, k: 0.9 }; }
  if (['arrest', 'angry', 'free'].includes(id)) { W.door = id === 'free' ? smooth(ramp(lf, 0, 10)) : 0; W.motes = golden([5, 0, 12], [8, 4, 8]);
    if (id === 'angry') W.pages = { at: [4.0, 2.0, 12.0], t: lf / 30, wind: 7, s: 1.2 };
    if (id === 'free' && lf >= 12) W.conf = { at: [6.6, 3.0, 12.0], age: (lf - 12) / 30, spread: 0.4 }; }
  if (id === 'heisst' || id === 'salute') W.motes = golden([0.6, 0, -4], [6, 4, 6]);
  if (['befiehlt', 'baut', 'bridge'].includes(id)) { W.fog = 1; W.mist = 1; W.mistAt = [10, PIER.y, -112]; W.walkers = false; W.traffic = false;
    if (id === 'bridge') { const p = smooth(ramp(lf, 4, 18)); W.fogPart = p; W.fog = 1 - p * 0.98; W.mist = 1 - p; W.bridge = lf >= 3 ? 1 : 0; W.motes = { at: [12, -12, -122], box: [10, 6, 10], col: '#ffe0b0', size: 0.06, k: p }; } }
  if (id === 'funeral') { W.funeral = true; W.hearseZ = lerp(-17, -12.5, lf / 59); W.walkers = false; W.traffic = false; W.motes = { at: [0, 0, -8], box: [8, 5, 16], col: '#ffd8a0', size: 0.06, k: 0.9 }; }
  if (id === 'final') { W.flowers = true; W.bridge = 1; W.walkers = false; W.traffic = false; W.motes = { at: [0, 0, -20], box: [6, 3, 6], col: '#ffd8a0', size: 0.04, k: 0.9 }; }
  return W;
};
const sealY = (l) => (l < 16 ? 0.4 - l * 0.004 : l < 24 ? lerp(0.34, 0, easeOut(ramp(l, 16, 24))) : l < 32 ? 0 : lerp(0, 0.35, smooth(ramp(l, 32, 44))));

// ---------------- cast ----------------
const blinkAt = (f, seed) => { const per = 44 + (seed * 17) % 30, ph = (Math.floor(f) + seed * 13) % per; return ph < 2 ? 1 : 0; };
const KAISER_HAT = { type: 'bicorne', color: '#1e2a5a', tilt: -12 };
const A = (T, spec, o, pos, extra = {}) => { const oo = Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => [k, typeof v === 'number' ? q(v, 3) : v]));
  return { key: JSON.stringify([spec, oo]), draw: (p) => T.toonChar(p, spec, oo), x: pos[0], y: pos[1], z: pos[2], ...extra }; };
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
const RIM = { gold: ['#ffd890', 1], station: ['#ffe2a8', -1], sepia: ['#fff0c8', 1], candle: ['#ffc070', 1], press: ['#ffe8b8', 1], congress: ['#fff2d8', 1], shop: ['#ffe2a8', -1], bayFog: ['#e8f2ff', -1], sunset: ['#ffb070', 1] };
const kaiserO = (S, f, o = {}) => { const [rim, rimSide] = RIM[LIGHT_OF[S.id]] || ['#ffd890', 1];
  return { expr: 'smug', blink: blinkAt(f, 1), L: 'hip', R: 'cane', holdR: 'cane', hat: { ...KAISER_HAT, wind: q(Math.sin(f * 0.35) * 0.8, 2) }, rim, rimSide, sway: q(Math.sin(f * 0.3), 2), ...o }; };
const rimO = (S, flip) => { const [rim, rimSide] = RIM[LIGHT_OF[S.id]] || ['#ffd890', 1]; return { rim, rimSide: flip ? -rimSide : rimSide }; };
const walkO = (lf, per = 18) => ({ legs: 'walk', step: q((lf % per) / per, 2), bob: q(Math.abs(Math.sin(lf / per * Math.PI * 2)) * 0.012, 3) });
/** bow: the hat comes off into a hand, the body leans toward the Kaiser */
const bowO = (k, dir, extra = {}) => ({ tilt: 15 * k * dir, headTilt: 10 * k * dir, ...(k > 0.35 ? { hatOff: true, hatInHand: dir > 0 ? 1 : -1, [dir > 0 ? 'R' : 'L']: { x: dir > 0 ? 470 : 130, y: 560, b: 0.8 } } : {}), expr: k > 0.5 ? 'happy' : 'neutral', ...extra });

export const actorsAt = (f, T) => {
  const S = shotAt(f), lf = f - S.a, out = [], id = S.id, K = 'kaiser';
  const R = (flip) => rimO(S, flip);
  if (id === 'hook') {
    const z = W0(lf), tap = (lf % 18) < 4;
    out.push(A(T, K, kaiserO(S, f, { expr: lf < 40 ? 'proud' : 'smug', ...walkO(lf), R: { x: 492, y: tap ? 590 : 548, b: 0.6 }, L: { x: 108 + Math.sin(lf / 18 * Math.PI * 2) * 20, y: 560, b: 1 }, headTilt: -4, turn: 0.05 }), [0, 0, z], { hi: true, s: 1.0, order: 3 }));
    const crowd = [['lady', -1.15, -9.0, 4], ['miner', -1.35, -12.5, -6], ['worker', -1.55, -16.0, -14], ['driver', 1.2, -10.2, 0], ['gent', 1.45, -13.5, -10], ['sailor', 1.6, -17.0, -18], ['grocer', 1.1, -9.0, 14], ['girl', -1.0, -8.2, 22]];
    crowd.forEach(([sp, x, zz, at], i) => { const dir = x < 0 ? 1 : -1, k = smooth(ramp(lf, at, at + 9)); out.push(A(T, sp, { blink: blinkAt(f, i + 3), ...bowO(k, dir), ...R(false), turn: dir * 0.35 }, [x, 0, zz], { s: 0.9 })); });
    const sal = lf > 18; out.push(A(T, 'boy', { expr: sal ? 'goofy' : 'happy', R: sal ? 'salute' : 'hang', turn: 0.4, ...R(false) }, [-0.75, 0, -5.4], { s: 0.66 }));
  }
  if (id === 'buttons' || id === 'epaul' || id === 'sabre') {
    const z = KZ[id], walk = id === 'buttons';
    out.push(A(T, K, kaiserO(S, f, { expr: id === 'epaul' ? 'proud' : 'smug', ...(walk ? walkO(lf, 22) : {}), chain: q(Math.sin(f * 0.9), 2), sway: q(Math.sin(f * 0.5) * 1.4, 2) }), [0, 0, z], { hi: true, s: 1.0 }));
    out.push(A(T, 'lady', { ...bowO(1, 1), ...R(false) }, [-1.2, 0, z - 4.5], { s: 0.9 }));
    out.push(A(T, 'gent', { ...bowO(1, -1), ...R(false) }, [1.3, 0, z - 6.0], { s: 0.9 }));
  }
  if (id === 'bow') {
    const z = -3.2 + lf * 0.03;
    out.push(A(T, K, kaiserO(S, f, { expr: 'proud', ...walkO(lf, 20), headTilt: -5 }), [0, 0, z], { hi: true, s: 1.0, order: 3 }));
    const names = ['worker', 'lady', 'sailor', 'gent', 'miner', 'driver', 'girl', 'grocer', 'editor', 'worker', 'lady', 'miner'];
    for (let i = 0; i < 12; i++) { const side = i % 2 ? 1 : -1, zz = -1.0 - Math.floor(i / 2) * 2.0 - (side > 0 ? 0.8 : 0), x = side * (1.9 + (i % 3) * 0.25), at = 4 + (11 - i) * 4.2;
      const dir = x < 0 ? 1 : -1, k = smooth(ramp(lf, at, at + 9)); out.push(A(T, names[i], { blink: blinkAt(f, i), ...bowO(k, dir), ...R(false), turn: dir * 0.4 }, [x, 0, zz], { s: 0.92 })); }
    const sal = lf > 26; out.push(A(T, 'boy', { expr: sal ? 'goofy' : 'happy', R: sal ? 'salute' : 'hang', turn: 0.5, ...R(false) }, [-1.3, 0, -0.2], { s: 0.66 }));
  }
  if (id === 'kaiser' || id === 'naja') {
    const k = id === 'kaiser', fix = k ? ramp(lf, 6, 24) : 1, puff = k && lf >= 30 ? smooth(ramp(lf, 30, 38)) : 1;
    const o = k ? { expr: lf < 30 ? 'smug' : 'proud', turn: q(lerp(0.5, 0, smooth(ramp(lf, 0, 14))), 2), L: lf >= 6 && lf < 26 ? 'hat' : 'hip', headTilt: lf >= 30 ? -6 : 0, bob: q(puff * 0.02 + (lf >= 30 ? Math.sin(lf * 0.25) * 0.004 : 0), 3),
      hat: { ...KAISER_HAT, tilt: q(lerp(-22, -12, smooth(fix)), 1), wind: q(Math.sin(f * 0.35) * 0.8, 2) } }
      : { expr: lf < 14 ? 'proud' : 'smug', headTilt: lf < 30 ? -6 : -3, look: lf > 40 ? -0.4 : 0 };
    out.push(A(T, K, kaiserO(S, f, o), [0, 0, -1.0], { hi: true, s: 1.0, order: 3 }));
    const cheer = [['worker', -1.4, -4.5], ['lady', 1.3, -5.0], ['sailor', -2.0, -7.0], ['miner', 1.9, -7.5], ['gent', -0.9, -9.0], ['girl', 0.9, -8.5], ['driver', 2.3, -10.5], ['boy', -2.3, -10.0]];
    cheer.forEach(([sp, x, zz], i) => { const hop = Math.abs(Math.sin(f * 0.3 + i)) * 0.03, up = k && lf >= 30;
      out.push(A(T, sp, { expr: up ? 'laugh' : 'happy', blink: blinkAt(f, i), R: up ? 'up' : 'hang', L: up && i % 2 ? 'up' : 'hang', hatOff: up && i % 3 === 0, hatInHand: up && i % 3 === 0 ? 1 : undefined, bob: up ? q(hop, 3) : 0, turn: x < 0 ? 0.3 : -0.3, ...R(false) }, [x, 0, zz], { s: 0.9 })); });
    if (!k) { // a seagull lands on the plume and pecks it
      const land = smooth(ramp(lf, 4, 22)), peck = lf > 24 ? Math.max(0, Math.sin(lf * 0.9)) : 0;
      out.push(FX('gull' + q(land, 2) + q(peck, 1) + (land < 1 ? Math.floor(lf / 2) : 0), (p) => { p.g.save(); p.g.translate(300, 500); p.g.rotate(peck * 0.35); p.g.translate(-300, -500); T.fxGull(p, land < 1 ? (lf * 0.12) % 1 : 0.25); p.g.restore(); },
        [lerp(1.6, -0.18, land), lerp(3.3, 1.72, land), -0.95], 0.42, { order: 6 }));
    }
  }
  if (id === 'rich' || (id === 'lose' && lf < 14)) {
    const sh = id === 'lose';
    out.push(A(T, 'rich', { expr: sh ? (lf < 6 ? 'happy' : 'shock') : 'happy', blink: blinkAt(f, 2), L: sh ? 'up' : 'wave', R: 'reach', holdR: 'bag', headTilt: sh ? 0 : q(Math.sin(f * 0.1) * 3, 1), ...R(false) }, O('office', [0.5, 0, 0.7]), { s: 0.95, tint: '#f6e6cc' }));
  }
  if (id === 'lose' && lf >= 14) out.push(A(T, 'rich', { expr: 'sad', legs: 'sit', hatOff: lf >= 20, L: 'belly', R: 'belly', headTilt: -6, ...R(false) }, O('office', [0, -0.12, 0.62]), { s: 0.95, tint: '#e8e0d2' }));
  if (id === 'write') {
    const scr = Math.sin(lf * 0.9) * 14;
    out.push(A(T, 'rich', { expr: 'tongue', blink: blinkAt(f, 4), legs: 'sit', hatOff: true, R: { x: 420 + scr, y: 650 + Math.cos(lf * 0.9) * 6, b: 0.6 }, holdR: 'quill', L: { x: 190, y: 660, b: 0.6 }, headTilt: q(8 + Math.sin(lf * 0.2) * 3, 1), look: 0.5, rim: '#ffc070', rimSide: 1 }, O('office', [0, -0.12, 0.62]), { s: 0.95, tint: '#ffe2c0' }));
  }
  if (id === 'seal') { const y = sealY(lf);
    out.push(FX('hand', (p) => { const g = p.g; g.lineCap = 'round'; g.strokeStyle = '#1a1416'; g.lineWidth = 26; g.beginPath(); g.moveTo(640, 80); g.lineTo(470, 300); g.lineTo(310, 470); g.stroke(); g.fillStyle = '#1a1416'; g.beginPath(); g.arc(305, 478, 34, 0, 7); g.fill();
      g.fillStyle = '#16141c'; g.beginPath(); g.moveTo(700, 0); g.lineTo(560, 0); g.lineTo(470, 200); g.lineTo(560, 260); g.closePath(); g.fill(); },
      O('office', [0.03, 0.875 + y + 0.24 - 0.267 * 0.26 / 0.26 * 0.26, 1.32]), 0.26, { order: 6, tint: '#ffe8c8' }));
  }
  if (id === 'press') {
    const shrug = smooth(ramp(lf, 14, 22)) * (1 - smooth(ramp(lf, 30, 36)));
    out.push(A(T, 'editor', { expr: lf < 10 ? 'neutral' : 'sly', blink: blinkAt(f, 6), L: shrug > 0.1 ? { x: 130, y: q(470 - shrug * 90), b: 0.5 } : 'hip', R: shrug > 0.1 ? { x: 470, y: q(470 - shrug * 90), b: 0.5 } : 'reach', holdR: 'paper', headTilt: q(shrug * 10, 1), turn: 0.3, ...R(false) }, O('press', [-1.65, 0, 1.6]), { s: 0.95 }));
    out.push(A(T, 'worker', { expr: 'happy', L: 'reach', R: 'reach', turn: -0.4, ...R(false), hatOff: true }, O('press', [2.9, 0, -0.4]), { s: 0.88 }));
  }
  if (id === 'money' && lf >= 15) out.push(A(T, K, kaiserO(S, f, { expr: 'proud', R: { x: 480, y: 330, b: 0.6 }, holdR: null, L: 'hip', look: 0.6, headTilt: -8, turn: 0.35, rim: '#fff0c8', rimSide: 1 }), O('press', [3.4, 0, -3.3]), { hi: true, s: 1.0 }));
  if (id === 'decree') {
    const up = smooth(ramp(lf, 4, 14));
    out.push(A(T, K, kaiserO(S, f, { expr: lf < 10 ? 'smug' : 'determined', L: { x: q(lerp(130, 70, up)), y: q(lerp(560, 330, up)), b: 0.6 }, R: 'cane', holdR: 'cane', headTilt: -4 }), [-2.0, 0.6, 6.0], { hi: true, s: 1.0, order: 3, ground: 0.62 }));
    [['worker', -0.7, 6.9], ['lady', -3.3, 6.7], ['sailor', -0.2, 5.4], ['miner', -3.8, 5.6], ['gent', -0.3, 9.6], ['girl', -3.4, 8.6], ['boy', -1.2, 8.3]].forEach(([sp, x, zz], i) => { const clap = (Math.floor(f / 4) + i) % 2;
      out.push(A(T, sp, { expr: i % 2 ? 'laugh' : 'happy', blink: blinkAt(f, i), L: clap ? 'belly' : 'reach', R: clap ? 'belly' : 'reach', turn: x < -2 ? 0.4 : -0.4, bob: q(Math.abs(Math.sin(f * 0.4 + i)) * 0.02, 3), ...R(false) }, [x, 0, zz], { s: 0.9 })); });
  }
  if (id === 'congress') {
    const shrug = smooth(ramp(lf, 8, 14)) * (1 - smooth(ramp(lf, 20, 24)));
    out.push(A(T, 'pol1', { expr: lf < 8 ? 'neutral' : lf < 26 ? 'smug' : 'sly', blink: blinkAt(f, 3), legs: 'sit', L: shrug > 0.1 ? { x: 120, y: q(480 - shrug * 80), b: 0.5 } : { x: 220, y: 560, b: 0.6 }, R: lf < 26 ? { x: 400, y: 560, b: 0.6 } : lf < 32 ? { x: 470, y: 330, b: 0.6 } : { x: 520, y: 430, b: 0.6 }, headTilt: q(shrug * 10, 1), ...R(false) }, O('congress', [-1.1, 0.02, 3.4]), { s: 0.95 }));
    [['pol2', 1.1, 0.0, 3.4, 'happy'], ['pol3', 0.0, 0.35, 1.5, 'smug'], ['gent', -2.2, 0.35, 1.5, 'neutral'], ['pol1', 2.2, 0.35, 1.5, 'happy'], ['pol2', -1.1, 0.7, -0.4, 'laugh'], ['pol3', 1.1, 0.7, -0.4, 'neutral']].forEach(([sp, x, y, z, e], i) => {
      const gest = Math.sin(f * 0.25 + i * 2) > 0.3; out.push(A(T, sp, { expr: e, blink: blinkAt(f, i + 5), legs: 'sit', hatOff: true, L: gest ? 'reach' : 'belly', R: 'belly', turn: x < 0 ? 0.4 : -0.4, ...R(false) }, O('congress', [x, y + 0.02, z]), { s: 0.95 })); });
    if (lf < 26) out.push(FX('decC', (p) => T.toonDecree(p, 'Kongress\naufgelöst', { rot: -4, fs: 58 }), O('congress', [-0.98, 0.95, 3.75]), 0.42, { order: 6 }));
  }
  if (id === 'shop') {
    const put = smooth(ramp(lf, 22, 30));
    out.push(A(T, K, kaiserO(S, f, { expr: lf < 30 ? 'proud' : 'happy', turn: 0.6, look: 0.6, R: { x: q(lerp(420, 520, put)), y: q(lerp(560, 640, put)), b: 0.5 }, holdR: lf < 30 ? 'bill' : lf >= 40 ? 'jar' : null, L: 'hip' }), O('shop', [-0.4, 0, 0.0]), { hi: true, s: 1.0 }));
    const wink = lf >= 32 && lf < 40;
    out.push(A(T, 'grocer', { expr: lf < 30 ? 'happy' : 'sly', wink, turn: -0.5, look: -0.6, L: lf >= 34 && lf < 41 ? { x: 60, y: 600, b: 0.5 } : 'hang', holdL: lf >= 34 && lf < 40 ? 'jar' : null, R: 'belly', ...R(true) }, O('shop', [0.55, 0, -1.4]), { s: 0.95 }));
  }
  if (id === 'arrest') {
    const u = lf / 52, x = lerp(4.5, 6.1, u), z = lerp(8.9, 10.5, u);
    out.push(A(T, K, kaiserO(S, f, { expr: 'proud', ...walkO(lf, 22), headTilt: -8, R: { x: 560, y: 520, b: 0.7 }, holdR: null, L: 'hang', holdL: 'cane' }), [x, 0, z], { hi: true, s: 1.0, order: 3 }));
    out.push(A(T, 'copGruff', { expr: 'angry', ...walkO(lf + 9, 22), L: { x: 40, y: 540, b: 0.6 }, R: 'hang', holdR: 'whistle', turn: 0.3, ...R(false) }, [x + 0.62, 0, z + 0.62], { s: 1.0 }));
    [['lady', 2.2, 12.2, 'shock'], ['worker', 1.8, 10.0, 'worried'], ['boy', 2.6, 11.0, 'shock']].forEach(([sp, xx, zz, e], i) => out.push(A(T, sp, { expr: e, blink: blinkAt(f, i), turn: 0.5, L: i === 0 ? 'chin' : 'hang', ...R(false) }, [xx, 0, zz], { s: 0.9 })));
  }
  if (id === 'angry') {
    [['miner', 4.0, 10.4, 'newspaper'], ['lady', 3.4, 12.6, 'umbrella'], ['worker', 5.2, 11.6, 'fist'], ['sailor', 4.6, 13.6, 'hat'], ['gent', 2.8, 14.2, 'newspaper'], ['grocer', 5.6, 13.9, 'fist'], ['driver', 2.4, 10.9, 'hat'], ['girl', 3.1, 11.6, 'fist']].forEach(([sp, x, z, act], i) => {
      const w = Math.sin(f * 0.6 + i * 1.3), o = { expr: 'angry', blink: blinkAt(f, i), turn: 0.4 - (i % 3) * 0.3, R: { x: q(450 + w * 30), y: q(210 + Math.abs(w) * 30), b: 0.5 }, bob: q(Math.abs(w) * 0.02, 3), ...R(false) };
      if (act === 'newspaper') o.holdR = 'newspaper'; if (act === 'umbrella') o.holdR = 'umbrella'; if (act === 'hat') { o.hatOff = true; o.hatInHand = 1; }
      out.push(A(T, sp, o, [x, 0, z], { s: 0.92 })); });
    out.push(A(T, 'worker', { expr: 'angry', R: { x: 470, y: q(240 + Math.sin(f * 0.7) * 20), b: 0.5 }, turn: 0.6, ...R(false) }, [0.6, 0, 11.0], { s: 0.95 }));
    out.push(A(T, 'lady', { expr: 'angry', R: 'up', holdR: 'newspaper', turn: 0.6, ...R(false) }, [0.9, 0, 13.4], { s: 0.95 }));
    out.push(FX('dog' + (Math.floor(f / 3) % 2), (p) => T.toonDog(p, { bark: Math.floor(f / 3) % 2, wag: f * 0.8 }), [2.6, 0, 11.3], 0.42, { order: 4 }));
    out.push(A(T, 'copYoung', { expr: 'worried', L: 'chin', ...R(false) }, [7.8, 0.54, 13.3], { s: 0.92 }));
  }
  if (id === 'free') {
    const step = smooth(ramp(lf, 6, 18)), fix = ramp(lf, 16, 30);
    out.push(A(T, K, kaiserO(S, f, { expr: lf < 18 ? 'smug' : 'proud', L: lf >= 16 && lf < 30 ? 'hat' : 'hip', headTilt: -6, hat: { ...KAISER_HAT, tilt: q(lerp(-24, -12, fix), 1), wind: 0 }, ...(lf > 6 && lf < 18 ? walkO(lf, 20) : {}) }), [lerp(8.2, 7.55, step), 0.54, 12.0], { hi: true, s: 1.0, ground: 0.54 }));
    [['worker', 5.6, 13.2], ['lady', 5.4, 11.0], ['sailor', 5.0, 12.4], ['miner', 4.8, 10.6]].forEach(([sp, x, z], i) => { const up = lf >= 12;
      out.push(A(T, sp, { expr: up ? 'laugh' : 'worried', blink: blinkAt(f, i), R: up ? 'up' : 'hang', L: up ? 'up' : 'hang', hatOff: up && i % 2 === 0, hatInHand: up && i % 2 === 0 ? 1 : undefined, bob: up ? q(Math.abs(Math.sin(f * 0.5 + i)) * 0.03, 3) : 0, turn: 0.5, ...R(false) }, [x, 0, z], { s: 0.92 })); });
  }
  if (id === 'heisst') {
    const z = -10.5 + lf * 0.07, snap = smooth(ramp(lf, 26, 32));
    out.push(A(T, K, kaiserO(S, f, { expr: 'proud', ...walkO(lf, 22), headTilt: -5 }), [-0.2, 0, z], { hi: true, s: 1.0 }));
    out.push(A(T, 'copGruff', { expr: snap > 0.5 ? 'determined' : 'worried', tilt: q(lerp(6, 0, snap), 1), L: 'hang', R: 'hang', turn: -0.5, look: -0.6, ...R(false) }, [1.2, 0, -2.4], { s: 1.0 }));
    out.push(A(T, 'copYoung', { expr: snap > 0.5 ? 'goofy' : 'neutral', tilt: q(lerp(-4, 0, snap), 1), L: lf < 22 ? { x: 70, y: 500, b: 0.6 } : 'hang', turn: -0.5, look: -0.6, ...R(false) }, [2.0, 0, -3.1], { s: 0.95 }));
  }
  if (id === 'salute') {
    const sal = smooth(ramp(lf, 0, 4)), ret = smooth(ramp(lf, 10, 16));
    out.push(A(T, K, kaiserO(S, f, { expr: lf < 12 ? 'smug' : 'proud', R: ret > 0.5 ? { x: 470, y: 230, b: 0.6 } : 'cane', holdR: ret > 0.5 ? 'caneUp' : 'cane', headTilt: -4, turn: 0.3 }), [-0.15, 0, -4.4], { hi: true, s: 1.0 }));
    out.push(A(T, 'copGruff', { expr: 'determined', R: sal > 0.5 ? 'salute' : 'hang', L: 'hang', turn: -0.4, ...R(false) }, [1.05, 0, -4.05], { s: 1.0 }));
    out.push(A(T, 'copYoung', { expr: lf < 22 ? 'determined' : 'happy', R: sal > 0.5 ? 'salute' : 'hang', L: 'hang', turn: -0.4, ...R(false) }, [1.85, 0, -4.35], { s: 0.95 }));
    if (lf >= 3 && lf < 15) out.push(FX('spk' + lf, (p) => T.fxSpark(p, (lf - 3) / 12), [0.86, 1.35, -3.9], 0.2));
  }
  if (id === 'befiehlt' || (id === 'baut' && lf < 46)) {
    const pt = id === 'befiehlt' ? smooth(ramp(lf, 4, 12)) : 1, up = id === 'baut' ? smooth(ramp(lf, 4, 12)) : 0;
    const o = id === 'befiehlt' ? { expr: 'determined', turn: -0.55, look: -0.8, L: pt > 0.4 ? 'point' : 'hip', holdL: pt > 0.4 ? 'caneUp' : null, R: 'hip', holdR: null, headTilt: -4 }
      : { expr: 'determined', turn: -0.2, R: { x: 470, y: q(lerp(560, 190, up)), b: 0.6 }, holdR: null, L: 'hip', headTilt: -5 };
    out.push(A(T, K, kaiserO(S, f, o), [9.8, PIER.y + 0.15, -117.8], { hi: true, s: 1.0, ground: PIER.y + 0.15 }));
    if (id === 'baut' && up > 0.3) out.push(FX('decB', (p) => T.toonDecree(p, 'Baut eine\nBrücke!', { rot: 4, fs: 60 }), [9.8 + 0.42, PIER.y + 0.15 + 1.32, -117.75], 0.62, { order: 6 }));
  }
  if (id === 'baut' && lf >= 42) {
    [['worker', 9.1, -106.4], ['lady', 10.4, -106.0], ['sailor', 11.3, -107.0], ['miner', 8.8, -104.6], ['gent', 10.0, -104.2], ['girl', 11.0, -104.9], ['boy', 9.6, -103.0]].forEach(([sp, x, z], i) => { const sh = Math.sin(f * 1.1 + i * 2), drop = sp === 'gent';
      out.push(A(T, sp, { expr: 'laugh', L: 'belly', R: i % 2 ? 'belly' : { x: 470, y: 420, b: 0.6 }, tilt: q(sh * 6, 1), bob: q(Math.abs(sh) * 0.02, 3), hatOff: drop && lf > 52, turn: (i % 3 - 1) * 0.3, ...R(false) }, [x, PIER.y + 0.15, z], { s: 0.92, ground: PIER.y + 0.15 })); });
    if (lf > 52) { const u = clamp((lf - 52) / 10); out.push(FX('hatdrop' + q(u, 1), (p) => T.toonHat(p, 'gent', { rot: u * 140 }), [10.0, PIER.y + 0.15 + lerp(1.95, 0.0, u * u), -104.1], 0.42)); }
    for (let i = 0; i < 2; i++) { const u = ((f * 0.02 + i * 0.5) % 1); out.push(FX('lgull' + i + ((f >> 2) % 4), (p) => T.fxGull(p, ((f >> 2) % 4) / 4), [8 + u * 6, PIER.y + 3.2 + i * 0.8, -103 - i], 0.55)); }
  }
  if (id === 'funeral') {
    const z = lerp(-17, -12.5, lf / 59);
    out.push(FX('relics', (p) => T.toonHat(p, K, { rot: -6 }), [0.05, H(z) + 2.25, z + 0.2], 0.6, { order: 4 }));
    out.push(A(T, 'copGruff', { expr: 'sad', R: 'salute', ...R(false) }, [1.55, 0, -6.0], { s: 0.98 }));
    out.push(A(T, 'copYoung', { expr: 'sad', R: 'salute', ...R(false) }, [-1.55, 0, -6.6], { s: 0.95 }));
    out.push(A(T, 'girl', { expr: 'sad', L: 'belly', R: 'reach', holdR: 'flowers', ...R(false) }, [-1.0, 0, -1.2], { s: 0.7 }));
  }
  if (id === 'final') {
    out.push(FX('hatground', (p) => T.toonHat(p, K, { rot: 8, hat: { wind: 0 } }), [0.12, -0.12, -18.3], 0.5, { order: 4 }));
    const u = smooth(ramp(lf, 10, 87));
    if (lf >= 8) { const cam = camAt(f).pos, tw = [38 + BRIDGE.x, 40, BRIDGE.z], d = tw.map((v, i) => v - cam[i]), on = cam.map((v, i) => v + d[i] * lerp(0.006, 0.07, u));
      const st = [0.0, 0.32, -18.25], pos = st.map((v, i) => lerp(v, on[i], smooth(ramp(lf, 8, 40)))); pos[0] += Math.sin(lf * 0.12) * 0.25 * u; pos[1] += Math.sin(lf * 0.09) * 0.2 * u;
      out.push(FX('feather' + q(Math.sin(lf * 0.15) * 0.4, 2), (p) => T.fxFeather(p, '#e8343a', Math.sin(lf * 0.15) * 0.4), pos, lerp(0.12, 1.2, u), { order: 6 })); }
  }
  return out;
};

export const fxAt = (f, T) => {
  const S = shotAt(f), lf = f - S.a, out = [], id = S.id;
  if (id === 'buttons') { for (const [a, x, y] of [[4, 0.07, 1.12], [14, -0.07, 0.99], [24, 0.07, 0.86]]) if (lf >= a && lf < a + 9) out.push(FX('bspk' + (lf - a), (p) => T.fxSpark(p, (lf - a) / 9), [x, y - 0.5 * 0.12, -3.5], 0.12)); }
  if (id === 'epaul' && lf >= 6 && lf < 18) out.push(FX('espk' + (lf - 6), (p) => T.fxSpark(p, (lf - 6) / 12), [-0.24, 1.38 - 0.5 * 0.2, -3.33], 0.2));
  if (id === 'sabre' && lf >= 14 && lf < 24) out.push(FX('sspk' + (lf - 14), (p) => T.fxSpark(p, (lf - 14) / 10), [-0.14, 0.86 - 0.5 * 0.15, -3.15], 0.15));
  if (id === 'kaiser' && lf >= 30 && lf < 42) out.push(FX('kspk' + (lf - 30), (p) => T.fxSpark(p, (lf - 30) / 12, '#fff2b0'), [-0.25, 1.35 - 0.5 * 0.3, -0.95], 0.3));
  if (id === 'lose' && lf >= 6 && lf < 22) for (const [x, z] of [[-2.4, -2.6], [2.5, -2.5], [0, -0.7]]) out.push(FX('poof' + (lf - 6) + x, (p) => T.fxPoof(p, (lf - 6) / 16, '255,236,180'), O('office', [x, 0.2, z]), 1.1));
  if (id === 'lose' && lf >= 18) { const u = clamp((lf - 18) / 14); out.push(FX('tophat' + q(u, 1), (p) => T.toonHat(p, 'rich', { rot: u * 100 }), O('office', [0.35 + u * 0.4, lerp(1.6, -0.25, u * u), 0.75]), 0.5, { tint: '#e8e0d2' })); }
  if (id === 'write' || id === 'seal') out.push(FX('cglow' + (f % 3), (p) => T.fxGlow(p, '255,190,110', 0.75 + (f % 3) * 0.07), O('office', [0.5, 1.16 - 0.5 * 0.55 * 1.125, 1.06]), 0.55, { order: 7 }));
  if (id === 'seal' && lf >= 24 && lf < 34) out.push(FX('sealpop' + (lf - 24), (p) => T.fxSpark(p, (lf - 24) / 10, '#ffd0a0'), O('office', [0.05, 0.88 - 0.5 * 0.1 * 1.125, 1.33]), 0.1));
  if (id === 'press' || id === 'money') for (let i = 0; i < 3; i++) { const u = ((lf / 40 + i / 3) % 1); out.push(FX('ink' + i + q(u, 1), (p) => T.fxPoof(p, u, '90,84,100'), O('press', [-0.8 + i * 0.8, 2.6 + u * 1.4, -1.2]), 0.9, { order: 4 })); }
  if (id === 'money' && lf >= 15) out.push(FX('bill' + (lf > 24 ? 1 : 0), (p) => T.toonBill(p, { rot: -6, glow: lf > 24 }), O('press', [3.4 + 0.3, 0.5, -3.05]), 0.85, { order: 6 }));
  if (id === 'money' && lf >= 24 && lf < 38) out.push(FX('mspk' + (lf - 24), (p) => T.fxSpark(p, (lf - 24) / 14), O('press', [3.7, 1.15, -3.2]), 0.3));
  if (id === 'decree') { const up = smooth(ramp(lf, 4, 14)); if (up > 0.2) out.push(FX('decK', (p) => T.toonDecree(p, 'Kongress\naufgelöst', { rot: -5, fs: 58 }), [-2.0 - 0.7, 0.75 + 0.35 * up, 6.08], 0.95, { order: 6 })); }
  if (id === 'shop' && lf >= 30) out.push(FX('cbill', (p) => T.toonBill(p, { rot: -80 }), O('shop', [-0.1, 1.08 - 0.5 * 0.18, -0.35]), 0.18));
  if (id === 'shop' && lf >= 34 && lf < 44) out.push(FX('reg' + (lf - 34), (p) => T.fxSpark(p, (lf - 34) / 10), O('shop', [1.4, 1.5, -0.6]), 0.25));
  if (id === 'funeral' || id === 'final') for (let z = 8; z > -40; z -= 10) for (const x of [-6.2, 6.2]) out.push(FX('lg', (p) => T.fxGlow(p, '255,200,120', 0.7), [x, H(z) + 4.05 - 0.5 * 1.125 * 1.2, z], 1.2, { order: 7 }));
  return out;
};
