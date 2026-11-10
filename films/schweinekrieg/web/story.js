// "Der Schweinekrieg" — shot plan timed to voice.mp3 (47.73 s) + 0.5 s tail = 1447 frames at 30 fps.
// Phrase times (s), checked against silencedetect at -30 dB and -38 dB; cuts sit in the pauses:
//  0.14- 1.74 Dieser Krieg hatte genau ein Opfer. | 1.96- 2.56 Ein Schwein. (0.6 s -> merged with next) | 2.68- 3.59 Eine kleine Insel.
//  3.95- 5.23 Zwei Großmächte behaupten: | 5.63- 6.47 Die gehört uns. | 6.76- 8.86 Und auf der Insel leben Siedler von beiden Seiten.
//  9.17-11.80 Eines Tages steht ein Schwein im Kartoffelacker eines Farmers. | 12.08-13.00 Nicht zum ersten Mal.
// 13.41-14.62 Der Farmer verliert die Geduld – | 14.83-15.67 und erschießt es. | 16.06-17.96 Das Problem: Das Schwein gehört …
// 18.21-19.02 der anderen Seite. | 19.38-20.26 Der Farmer will zahlen. | 20.64-21.58 Der Besitzer lehnt ab. | 21.88-23.11 Man droht, ihn zu verhaften.
// 23.43-24.60 Die Siedler rufen die Armee. | 24.95-25.81 Es kommen Soldaten. | 26.09-26.69 Dann Kanonen. (0.6 s -> merged with next)
// 27.00-28.54 Die andere Seite schickt Kriegsschiffe. | 28.81-29.96 Mit über zweitausend Mann. | 30.51-32.34 Doch der Admiral weigert sich anzugreifen.
// 32.71-34.72 Er will keinen Krieg zwischen zwei großen Nationen … | 34.99-35.94 wegen eines Schweins. | 36.43-38.06 Also teilen sich beide Armeen die Insel.
// 38.30-39.17 Zwölf Jahre lang. | 39.43-40.85 Ohne einen einzigen Schuss. | 41.25-43.52 Und wer entscheidet am Ende, wem die Insel gehört?
// 43.96-44.86 Ein deutscher Kaiser. | 45.09-46.03 Bilanz des Krieges: | 46.28-47.37 ein totes Schwein.
import { G, P, hAt } from './places.js';
import { M as E, clamp, lerp, lerp3, ramp, camFromKeys, blinkAt, idle, q } from './motion.js';
export const FPS = 30, TOTAL = 1447;
export const SHOTS = [
  { id: 'hook', a: 0, b: 55, light: 'day' },
  { id: 'pigsky', a: 56, b: 112, light: 'mist' },
  { id: 'flags', a: 113, b: 162, light: 'day' },
  { id: 'glare', a: 163, b: 198, light: 'day' },
  { id: 'farms', a: 199, b: 269, light: 'day' },
  { id: 'dig', a: 270, b: 357, light: 'day' },
  { id: 'days', a: 358, b: 395, light: 'day' },
  { id: 'rifle', a: 396, b: 441, light: 'day' },
  { id: 'pat', a: 442, b: 475, light: 'day' },
  { id: 'empty', a: 476, b: 541, light: 'day' },
  { id: 'hat', a: 542, b: 575, light: 'day' },
  { id: 'pay', a: 576, b: 613, light: 'day' },
  { id: 'refuse', a: 614, b: 651, light: 'day' },
  { id: 'arrest', a: 652, b: 697, light: 'day' },
  { id: 'call', a: 698, b: 742, light: 'day' },
  { id: 'march', a: 743, b: 778, light: 'day' },
  { id: 'guns', a: 779, b: 859, light: 'day' },
  { id: 'crowd', a: 860, b: 906, light: 'day' },
  { id: 'admiral', a: 907, b: 975, light: 'day' },
  { id: 'think', a: 976, b: 1045, light: 'day' },
  { id: 'palm', a: 1046, b: 1084, light: 'day' },
  { id: 'share', a: 1085, b: 1144, light: 'day' },
  { id: 'years', a: 1145, b: 1178, light: 'day' },
  { id: 'noshot', a: 1179, b: 1231, light: 'day' },
  { id: 'doors', a: 1232, b: 1311, light: 'palace' },
  { id: 'kaiser', a: 1312, b: 1348, light: 'palace' },
  { id: 'sunset', a: 1349, b: 1384, light: 'golden' },
  { id: 'heaven', a: 1385, b: 1446, light: 'golden' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const gp = (x, z, dy = 0) => [x, hAt(x, z) + dy, z];
const BLUE = '#3a5fb0', GREEN = '#2f8a4a';

// ---------- lights ----------
export const LIGHTS = {
  day: { az: 130, el: 42, sky: '#c6d8ea', ground: '#7d7a5c', hemi: 1.12, sun: '#fff0d8', sunI: 2.35, fog: '#c9d9de', fogNear: 120, fogFar: 1500,
    skyTop: '#4f86c0', skyHor: '#d2e2e6', sat: 1.08, waterDeep: '#1f5a72', waterShal: '#4c9aa2', glint: '#e8f6ff', vig: 0.2, shadowExt: 30, cloud: '#ffffff' },
  mist: { az: 120, el: 30, sky: '#c9d3dc', ground: '#76786a', hemi: 1.2, sun: '#f4ead8', sunI: 1.7, fog: '#c3cfd4', fogNear: 60, fogFar: 650,
    skyTop: '#7d9cb8', skyHor: '#cdd8dc', sat: 1.02, waterDeep: '#2a5f70', waterShal: '#5a9a9a', glint: '#e0eef2', vig: 0.24, shadowExt: 140, cloud: '#f2f4f6' },
  night: { az: 220, el: 35, sky: '#4a5a8a', ground: '#2a2a3a', hemi: 0.9, sun: '#9fb4ff', sunI: 0.9, fog: '#2a3456', fogNear: 120, fogFar: 900,
    skyTop: '#0f1838', skyHor: '#33467a', sat: 0.9, waterDeep: '#0f2440', waterShal: '#24486a', glint: '#9fb4ff', vig: 0.3, shadowExt: 30, cloud: '#6a76a0' },
  golden: { az: 200, el: 7, sky: '#a99ac4', ground: '#6a4c40', hemi: 1.0, sun: '#ffb46c', sunI: 2.8, fog: '#f0b88c', fogNear: 120, fogFar: 1300,
    skyTop: '#6a6aae', skyHor: '#ffbf78', sunDisc: '#fff0c8', sunSize: 0.004, sat: 1.12, gain: '#fff0dc', waterDeep: '#3d4f80', waterShal: '#d9946a',
    glint: '#ffe2a8', vig: 0.26, shadowExt: 60, cloud: '#ffd9b8' },
  palace: { az: 60, el: 38, sky: '#ffe8c0', ground: '#7a4a30', hemi: 1.25, sun: '#ffe2b0', sunI: 1.5, fog: '#3a2a20', fogNear: 200, fogFar: 900,
    skyTop: '#3a2a20', skyHor: '#3a2a20', sat: 1.08, gain: '#fff4e4', waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.24, shadowExt: 28 },
};
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixHex = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const blendL = (A, B, t) => { const o = {}; for (const k in A) { const a = A[k], b = B[k] ?? a; o[k] = typeof a === 'number' ? lerp(a, b, t) : (typeof a === 'string' && a[0] === '#' && a.length === 7 && b.length === 7) ? mixHex(a, b, t) : (t < 0.5 ? a : b); } return o; };
// "Nicht zum ersten Mal": three quick days
const DAY0 = 358, DAYL = 13;
const dayPhase = (f) => { const k = (f - DAY0) / DAYL; return { n: Math.floor(k), t: k - Math.floor(k) }; };
export const lightFor = (S, f) => {
  let L = { ...LIGHTS[S.light] };
  if (S.id === 'days') { const { t } = dayPhase(f); const night = t > 0.72 ? Math.sin((t - 0.72) / 0.28 * Math.PI) : 0; L = blendL(L, LIGHTS.night, night); L.az = 60 + t * 140; L.el = 12 + 50 * Math.sin(t * Math.PI); }
  if (S.id === 'years') { const s = seasonAt(f); L = blendL(L, { ...L, sky: '#dfe8f4', fog: '#e6eef4', skyHor: '#e8eef4', skyTop: '#8aa4c4', sunI: 1.6 }, s.snow); }
  if (['hook', 'guns', 'share'].includes(S.id)) L.shadowExt = 70;
  if (S.id === 'sunset') L.shadowExt = 160;
  return L;
};

// ---------- cameras ----------
const H0 = hAt(2, 40); // knoll
const KN = [2, H0, 40];
const PEN = [P.pen[0], hAt(P.pen[0], P.pen[1]), P.pen[1]];
const DECKY = 4.05, DG = hAt(-7.6, 2.8), CAB = hAt(P.cabinA[0], P.cabinA[1]) + 0.18;
const SHIP0 = [-56, 0, 74];                 // lead ship once anchored in the cove
const ADM = [SHIP0[0] + 0.6, DECKY, SHIP0[2] + 15]; // admiral on the quarterdeck (stern)
const TH = [0, 1.05, -22 + 3.6];            // throne (palace local)
const CAMS = {
  hook: [ // low angle from the water: warship hull towering on the left, soldiers presenting arms, guns on the ridge
    { f: 0, pos: [-51.6, 1.3, 80.5], look: [-56.2, 4.2, 64], fov: 61, roll: -4 },
    { f: 55, pos: [-52.4, 1.45, 77.2], look: [-55.6, 4.6, 62], fov: 56, roll: 1.5, ease: 'easeOut' },
  ],
  pigsky: [
    { f: 56, pos: [40, 150, 205], look: [36, 150.6, 190], fov: 42 },
    { f: 80, pos: [39.6, 149.8, 203.5], look: [35.8, 150.3, 189], fov: 40 },
    { f: 112, pos: [30, 128, 180], look: [-4, 4, -8], fov: 44, ease: 'smooth' },
  ],
  flags: [
    { f: 113, pos: [2.2, H0 + 1.6, 47.0], look: [2, H0 + 1.15, 40], fov: 44, roll: -1.5 },
    { f: 162, pos: [2.0, H0 + 1.5, 45.6], look: [2, H0 + 1.2, 40], fov: 42, roll: 1 },
  ],
  glare: [
    { f: 163, pos: [2.0, H0 + 1.9, 44.6], look: [2, H0 + 1.65, 40], fov: 40, roll: 2 },
    { f: 198, pos: [2.0, H0 + 1.85, 43.6], look: [2, H0 + 1.7, 40], fov: 38, roll: -1 },
  ],
  farms: [
    { f: 199, pos: [6, G + 3.6, 13], look: [0.5, G + 1.5, 0], fov: 46 },
    { f: 269, pos: [-3.2, G + 3.0, 11.5], look: [-0.5, G + 1.4, 0], fov: 44 },
  ],
  dig: [
    { f: 270, pos: [-4.6, DG + 1.25, 6.9], look: [-7.6, DG + 0.55, 2.7], fov: 42, roll: 2 },
    { f: 357, pos: [-5.5, DG + 1.15, 5.6], look: [-7.7, DG + 0.5, 2.7], fov: 40, roll: -2 },
  ],
  days: [
    { f: 358, pos: [-3.0, DG + 1.9, 4.6], look: [-7.2, DG + 0.2, -4.5], fov: 50 },
    { f: 395, pos: [-3.4, DG + 1.85, 3.7], look: [-7.3, DG + 0.3, -4.6], fov: 46 },
  ],
  rifle: [
    { f: 396, pos: [-9.6, CAB + 1.75, -4.0], look: [-10.3, CAB + 1.35, -8.2], fov: 46, roll: -3 },
    { f: 441, pos: [-9.9, CAB + 1.6, -5.4], look: [-10.3, CAB + 1.4, -8.2], fov: 44, roll: 2 },
  ],
  pat: [
    { f: 442, pos: [-4, G + 4.2, 17], look: [-22, G + 3.4, 1.5], fov: 46 },
    { f: 475, pos: [-5.5, G + 4.0, 15], look: [-22.5, G + 5.6, 1.5], fov: 44 },
  ],
  empty: [
    { f: 476, pos: [PEN[0] + 0.5, PEN[1] + 1.5, PEN[2] - 0.6], look: [PEN[0], PEN[1] + 1.15, PEN[2] + 3.7], fov: 46 },
    { f: 541, pos: [PEN[0] - 0.2, PEN[1] + 1.55, PEN[2] + 0.4], look: [PEN[0], PEN[1] + 1.25, PEN[2] + 3.7], fov: 44 },
  ],
  hat: [
    { f: 542, pos: [PEN[0], PEN[1] + 1.8, PEN[2] + 0.4], look: [PEN[0], PEN[1] + 1.7, PEN[2] + 3.6], fov: 40 },
    { f: 575, pos: [PEN[0], PEN[1] + 2.3, PEN[2] + 1.4], look: [PEN[0], PEN[1] + 3.0, PEN[2] + 3.6], fov: 44, ease: 'easeOut' },
  ],
  pay: [
    { f: 576, pos: [0.2, G + 1.65, 8.4], look: [-0.3, G + 1.2, 2], fov: 44 },
    { f: 613, pos: [-0.1, G + 1.6, 7.4], look: [-0.3, G + 1.25, 2], fov: 42 },
  ],
  refuse: [
    { f: 614, pos: [1.9, G + 1.95, 5.6], look: [1.0, G + 1.7, 2], fov: 38, roll: -2 },
    { f: 651, pos: [1.6, G + 1.9, 4.6], look: [1.0, G + 1.75, 2], fov: 36, roll: 2 },
  ],
  arrest: [
    { f: 652, pos: [-0.6, G + 1.6, 9.6], look: [-0.9, G + 1.2, 2.4], fov: 46, roll: 2 },
    { f: 697, pos: [-1.0, G + 1.6, 8.2], look: [-1.1, G + 1.3, 2.4], fov: 43, roll: -1.5 },
  ],
  call: [
    { f: 698, pos: [-53.6, 1.6, 67.2], look: [-55.2, 3.3, 60.2], fov: 46 },
    { f: 742, pos: [-54.8, 1.7, 66.0], look: [-55.2, 3.3, 60.2], fov: 44 },
  ],
  march: [
    { f: 743, pos: [-55.0, hAt(-55, 51) + 1.9, 51], look: [-55.0, 3.6, 58], fov: 50 },
    { f: 778, pos: [-55.0, hAt(-55, 49.5) + 2.0, 49.5], look: [-55.0, 4.2, 56.5], fov: 50 },
  ],
  guns: [ // wider: the guns rolling up the hill, then crane out to the cove and the fleet
    { f: 779, pos: [-46, 4.4, 74], look: [-46, 7.4, 53], fov: 52 },
    { f: 806, pos: [-45.5, 8.5, 76.5], look: [-46, 10.5, 47], fov: 54 },
    { f: 859, pos: [5, 52, 190], look: [-52, 4, 82], fov: 50, ease: 'smooth' },
  ],
  crowd: [
    { f: 860, pos: [SHIP0[0] + 4.5, DECKY + 5.6, SHIP0[2] - 21], look: [SHIP0[0] - 0.4, DECKY + 1.0, SHIP0[2] - 3], fov: 48 },
    { f: 906, pos: [SHIP0[0] + 3.5, DECKY + 5.0, SHIP0[2] - 18.5], look: [SHIP0[0] - 0.4, DECKY + 1.1, SHIP0[2] - 2], fov: 46 },
  ],
  admiral: [
    { f: 907, pos: [ADM[0] + 1.0, DECKY + 2.0, ADM[2] - 4.8], look: [ADM[0], DECKY + 1.65, ADM[2]], fov: 42 },
    { f: 975, pos: [ADM[0] + 0.4, DECKY + 1.9, ADM[2] - 3.4], look: [ADM[0], DECKY + 1.7, ADM[2]], fov: 40 },
  ],
  think: [
    { f: 976, pos: [ADM[0] - 0.3, DECKY + 1.95, ADM[2] - 3.8], look: [ADM[0] + 0.25, DECKY + 2.0, ADM[2]], fov: 46 },
    { f: 1045, pos: [ADM[0] - 0.2, DECKY + 2.1, ADM[2] - 4.3], look: [ADM[0] + 0.3, DECKY + 2.2, ADM[2]], fov: 48 },
  ],
  palm: [
    { f: 1046, pos: [ADM[0] + 0.2, DECKY + 2.0, ADM[2] - 3.6], look: [ADM[0] + 0.25, DECKY + 2.05, ADM[2]], fov: 46, roll: -2 },
    { f: 1084, pos: [ADM[0] + 0.1, DECKY + 1.95, ADM[2] - 3.1], look: [ADM[0] + 0.25, DECKY + 2.0, ADM[2]], fov: 44, roll: 2 },
  ],
  share: [
    { f: 1085, pos: [-190, 70, 70], look: [10, -8, -6], fov: 44 },
    { f: 1144, pos: [-176, 64, 58], look: [14, -6, -6], fov: 42 },
  ],
  years: [
    { f: 1145, pos: [2.0, G + 1.8, 26.6], look: [2.0, G + 1.4, 20], fov: 44 },
    { f: 1178, pos: [2.0, G + 1.75, 24.8], look: [2.0, G + 1.45, 20], fov: 41 },
  ],
  noshot: [
    { f: 1179, pos: [-84.8, 4.4, 41.0], look: [-88.6, 4.8, 35.2], fov: 44, roll: -2 },
    { f: 1231, pos: [-85.8, 4.6, 39.6], look: [-88.8, 5.0, 35.0], fov: 41, roll: 1.5 },
  ],
  doors: [
    { f: 1232, pos: [0.6, 1.4, 4], look: [0, 4.0, 22], fov: 46, roll: 1.5 },
    { f: 1311, pos: [-0.4, 1.6, 7.5], look: [0, 3.2, 22], fov: 44, roll: -1 },
  ],
  kaiser: [
    { f: 1312, pos: [0.0, 3.5, -9.4], look: [0, 3.05, -17.2], fov: 46 },
    { f: 1348, pos: [0.0, 3.35, -10.8], look: [0, 3.15, -17.2], fov: 44 },
  ],
  sunset: [
    { f: 1349, pos: [150, 26, 190], look: [10, 2, 0], fov: 40 },
    { f: 1384, pos: [140, 32, 178], look: [6, 12, 0], fov: 40 },
  ],
  heaven: [
    { f: 1385, pos: [21.0, 74.9, 68.8], look: [20, 74.15, 64], fov: 44 },
    { f: 1446, pos: [20.7, 74.75, 67.8], look: [20, 74.3, 64], fov: 40 },
  ],
};
const KICKS = [{ f: 136, a: 0.03 }, { f: 446, a: 0.05 }, { f: 548, a: 0.03 }, { f: 1326, a: 0.05 }, { f: 186, a: 0.02 }];
export const camAt = (f) => {
  const S = shotAt(f), K = CAMS[S.id];
  const c = camFromKeys(K, f, { creep: 0.0009, kicks: KICKS.filter((k) => k.f >= S.a && k.f <= S.b) });
  // gentle handheld drift so no frame is ever static
  const t = f / 30; c.look = [c.look[0] + 0.02 * Math.sin(t * 1.3), c.look[1] + 0.015 * Math.sin(t * 1.7 + 1), c.look[2]];
  if (S.id === 'days') { const { t: dt } = dayPhase(f); c.flash = dt < 0.12 && f > DAY0 + 2 ? (1 - dt / 0.12) * 0.35 : 0; }
  if (S.id === 'pat' && f >= 445 && f < 450) { c.flash = (1 - (f - 445) / 5) * 0.28; c.flashCol = '#fff6d8'; }
  if (S.id === 'kaiser' && f >= 1325 && f < 1329) { c.flash = (1 - (f - 1325) / 4) * 0.18; c.flashCol = '#ffe2a0'; }
  if (S.id === 'heaven') c.shadowAt = [20, 74, 64];
  if (S.id === 'pigsky') c.shadowAt = [0, 4, 0];
  if (S.id === 'guns' && f > 806) c.shadowAt = [-50, 4, 75];
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f), F = (p, k) => ({ focus: dist(C.pos, p), cinf: k });
  switch (S.id) {
    case 'pigsky': return f < 84 ? F([38.1, 149.6, 197.7], 9) : { focus: 200, cinf: 0 };
    case 'flags': return F([2, H0 + 1.4, 40], 7);
    case 'glare': return F([2, H0 + 1.8, 40], 9);
    case 'farms': return F([0, G + 1.4, 2], 3);
    case 'dig': return F([-7.6, DG + 0.5, 2.8], 11);
    case 'days': return F([-6.2, G + 1.0, -1.5], 5);
    case 'rifle': return F([-10.3, CAB + 1.4, -8.3], 9);
    case 'empty': return F([PEN[0], PEN[1] + 1.4, PEN[2] + 3.7], 6);
    case 'hat': return F([PEN[0], PEN[1] + 1.7, PEN[2] + 3.7], 9);
    case 'pay': return F([0, G + 1.4, 2], 5);
    case 'refuse': return F([1.2, G + 1.8, 2], 10);
    case 'arrest': return F([-1.0, G + 1.4, 2.6], 5);
    case 'call': return F([-55.4, 3.0, 60.0], 5);
    case 'march': return F([-55, 3.4, 57 - (f - 743) * 0.07], 5);
    case 'crowd': return F([SHIP0[0], DECKY + 1.4, SHIP0[2] - 4], 3);
    case 'admiral': case 'think': case 'palm': return F([ADM[0], DECKY + 1.8, ADM[2]], 9);
    case 'years': return F([2, G + 1.4, 20], 7);
    case 'noshot': return F([-89.4, 4.6, 34.6], 7);
    case 'doors': return F([0, 2, 14 - (f - 1232) * 0.06], 4);
    case 'kaiser': return F([0, 3.0, -17.25], 5);
    case 'heaven': return F([20, 74.2, 64], 8);
  }
  return { focus: 50, cinf: 0 };
};

// ---------- world state ----------
const seasonAt = (f) => { // "Zwölf Jahre lang": winter -> spring -> summer/autumn -> winter, fast
  const k = clamp((f - 1145) / 33);
  const snow = k < 0.22 ? 1 - k / 0.22 * 0.2 : k < 0.3 ? 1 - (k - 0.22) / 0.08 : k < 0.84 ? 0 : (k - 0.84) / 0.16;
  const bloom = k < 0.28 ? 0 : k < 0.36 ? (k - 0.28) / 0.08 : k < 0.5 ? 1 : k < 0.58 ? 1 - (k - 0.5) / 0.08 : 0;
  const autumn = k < 0.58 ? 0 : k < 0.66 ? (k - 0.58) / 0.08 : k < 0.84 ? 1 : 1 - (k - 0.84) / 0.16;
  return { snow: clamp(snow), bloom: clamp(bloom), autumn: clamp(autumn), k };
};
const FLEET_IN = (k) => { // ships sailing into the cove, k 0..1
  const L = (a, b) => [lerp(a[0], b[0], k), 0, lerp(a[1], b[1], k), Math.PI / 2 + lerp(a[2] || 0, b[2] || 0, k)];
  return [L([-54, 150, 0.05], [-56, 74]), L([-32, 190, -0.1], [-36, 118, -0.12]), L([-80, 205, 0.12], [-76, 128, 0.1]), L([-52, 240], [-54, 152])];
};
const FLEET_AT = FLEET_IN(1);
export const worldAt = (f) => {
  const S = shotAt(f), W = { fleet: FLEET_AT, guns: 1, landing: true, rifleTaken: f >= 418 && f < 1085 };
  switch (S.id) {
    case 'hook': W.landing = false; W.fleet = [[-60.2, 0, 87, Math.PI / 2], [-36, 0, 124, Math.PI / 2 - 0.12], [-76, 0, 134, Math.PI / 2 + 0.1], [-54, 0, 160, Math.PI / 2]]; break;
    case 'pigsky': case 'flags': case 'glare': case 'farms': case 'dig': case 'days': case 'rifle': case 'pat': case 'empty': case 'hat': case 'pay': case 'refuse': case 'arrest': case 'call':
      W.fleet = []; W.guns = -2; W.landing = false; break;
    case 'march': W.fleet = []; W.guns = 0; break;
    case 'guns': W.guns = clamp((f - 779) / 34); W.fleet = FLEET_IN(clamp((f - 790) / 69)); break;
    case 'crowd': W.fleet = FLEET_IN(0.9 + 0.1 * clamp((f - 860) / 46)); break;
    case 'years': W.season = seasonAt(f); break;
    case 'doors': W.palace = true; W.doorOpen = E.easeOut(clamp((f - 1236) / 22)); break;
    case 'kaiser': W.palace = true; W.doorOpen = 1; W.seal = f >= 1325 ? E.back(clamp((f - 1325) / 6)) : 0; break;
    case 'sunset': W.gold = 1; break;
    case 'heaven': W.gold = 1; W.cloud = [20, 71.9, 64]; break;
  }
  return W;
};

// ---------- actors (2D cards) ----------
const key = (who) => (typeof who === 'string' ? who : JSON.stringify(who));
const R = (T, who, o, pos, extra = {}) => ({ key: key(who) + JSON.stringify(o), draw: (p) => T.fig(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const PIG = (T, o, pos, extra = {}) => ({ key: 'pigS' + JSON.stringify(o), draw: (p) => T.pigSide(p, o), x: pos[0], y: pos[1], z: pos[2], s: 0.78, blobW: 1.4, ...extra });
const PIGF = (T, o, pos, extra = {}) => ({ key: 'pigF' + JSON.stringify(o), draw: (p) => T.pigFront(p, o), x: pos[0], y: pos[1], z: pos[2], s: 0.9, ...extra });
const ID = (f, seed, k = 1) => { const i = idle(f, seed); return { bob: q(i.bob * k, 3), tilt: q(i.tilt * k, 1), headTilt: q(i.headTilt * k, 1) }; };
const B = (f, s) => blinkAt(f, s);
const crowdCard = (T, seed, n = 4, rows = 2, flip = 0) => ({ key: 'crowd' + seed + n + rows,
  draw: (p) => { const g = p.g; for (let r = rows - 1; r >= 0; r--) for (let i = 0; i < n; i++) { g.save(); g.translate(30 + i * 540 / n + (r % 2) * 40, 660 - r * 70); g.scale(0.33, 0.33);
    const v = seed * 7 + i * 3 + r * 5, tele = (v % 3) === 0;
    T.fig(p, T.PW.sailor(v), { seed: v % 9 + 1, expr: tele ? 'squint' : ['neutral', 'stern', 'smile', 'shock'][v % 4], R: tele ? 'eye' : (v % 4 === 1 ? 'point' : 'hang'), prop: tele ? 'tele' : null, facing: 1, look: 0.6 }); g.restore(); } } });

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], gold = S.light === 'golden' ? '#ffe0c2' : null, tint = gold || '#ffffff';
  const A = (a) => { if (gold && !a.tint) a.tint = gold; out.push(a); return a; };
  switch (S.id) {
    case 'hook': { // soldiers in a line on the crest, guns behind them, the fleet in the cove: present arms on the beat
      const pres = E.back(clamp((f - 8) / 10));
      for (let i = 0; i < 7; i++) { const x = -55.6 + i * 1.15, z = 60.6 + (i % 2) * 0.5;
        A(R(T, T.PW.bsol(i), { seed: i + 2, expr: 'stern', R: pres > 0.5 ? 'up' : 'rifle', prop: pres > 0.5 ? 'rifleUp' : 'rifle', ...ID(f, i), blink: B(f, i + 2) }, gp(x, z), { s: 1.05 })); }
      A(R(T, 'bcap', { seed: 4, expr: 'stern', R: 'point', facing: 1, ...ID(f, 9), blink: B(f, 9) }, gp(-52.2, 62.0), { s: 1.05 }));
      for (let i = 0; i < 4; i++) A({ ...crowdCard(T, i + 1, 4, 1), x: -59.8 + 0.3, y: DECKY + 0.4, z: 70 + i * 5, s: 2.2, blob: false, order: 2 });
      break;
    }
    case 'pigsky': {
      const fl = (f * 0.35) % (Math.PI * 2), rise = E.easeIn(clamp((f - 84) / 22));
      const wink = f >= 70 && f < 80;
      A(PIGF(T, { angel: true, flap: q(fl, 1), wink, look: 0, tilt: q(5 * Math.sin(f * 0.12), 1), blink: B(f, 7) }, [38.1 - (1 - E.easeOut(clamp((f - 56) / 14))) * 2, 148.9 + 0.1 * Math.sin(f * 0.15) + rise * 8, 197.7], { s: 1.0, blob: false, shadow: false }));
      break;
    }
    case 'flags': case 'glare': {
      const plant = S.id === 'glare' ? 1 : E.easeIn(clamp((f - 128) / 8)), up = S.id === 'flags' && f < 128;
      const glr = S.id === 'glare' || f > 142;
      const oA = { seed: 4, expr: glr ? 'angry' : 'stern', L: up ? 'plant' : 'flag', propL: 'flag', flagCol: BLUE, flagDepth: q(lerp(0.55, -0.04, plant), 2), wv: q(f * 0.25, 1), facing: glr ? 1 : 0, look: glr ? 0.8 : 0, blink: glr ? 0 : B(f, 4), headTilt: glr ? q(-4 + 2 * Math.sin(f * 0.3), 1) : 0 };
      const oB = { seed: 6, expr: glr ? 'angry' : 'stern', R: up ? 'plant' : 'flag', prop: 'flag', flagCol: GREEN, flagDepth: q(lerp(0.55, -0.04, plant), 2), wv: q(f * 0.25 + 1, 1), facing: glr ? -1 : 0, look: glr ? -0.8 : 0, blink: glr ? 0 : B(f, 6), headTilt: glr ? q(4 - 2 * Math.sin(f * 0.3), 1) : 0 };
      const lean = S.id === 'glare' ? q(E.smooth(clamp((f - 163) / 20)) * 0.16, 2) : 0;
      A(R(T, 'bcap', { ...oA, tilt: lean ? q(lean * 22, 1) : 0, bob: up ? 0.04 : 0 }, gp(1.35 + lean, 40)));
      A(R(T, 'gofc', { ...oB, tilt: lean ? q(-lean * 22, 1) : 0, bob: up ? 0.04 : 0 }, gp(2.65 - lean, 40)));
      break;
    }
    case 'farms': {
      const wv = q(f * 0.45, 1);
      A(R(T, 'farmer', { seed: 3, expr: 'squint', R: 'wave', wv, look: 0.7, facing: 1, ...ID(f, 3), blink: B(f, 3) }, gp(-0.9, 2.4)));
      A(R(T, 'owner', { seed: 5, expr: 'smug', L: 'wave', wv: wv + 1, look: -0.7, facing: -1, ...ID(f, 5), blink: B(f, 5) }, gp(1.0, 2.0)));
      A(R(T, 'setB', { seed: 8, expr: 'neutral', look: 0.5, blink: B(f, 8), ...ID(f, 8) }, gp(-7.8, -6.6), { s: 0.95 }));
      A(PIG(T, { step: q((f * 0.04) % 1, 2), happy: true, blink: B(f, 11) }, gp(PEN[0] - 0.6 + 0.02 * (f - 199), PEN[2]), { flip: false }));
      break;
    }
    case 'dig': {
      const d = 0.5 + 0.5 * Math.sin(f * 0.55);
      A(PIG(T, { dig: q(d, 2), happy: true, mud: 1, blink: d > 0.7 ? 1 : 0, look: 0.2 }, gp(-7.6, 2.8)));
      A(R(T, 'farmer', { seed: 3, expr: 'stern', L: 'hip', R: 'hip', look: 0.5, blink: B(f, 3) }, [-10.2, CAB, -8.3]));
      break;
    }
    case 'days': {
      const { n } = dayPhase(f), bl = [0.3, 0.65, 1][Math.min(2, n)];
      const d = 0.5 + 0.5 * Math.sin(f * 0.7);
      A(PIG(T, { dig: q(d, 2), happy: true, mud: 1, blink: 0 }, gp(-6.1 + n * 0.1, -0.6)));
      A(R(T, 'farmer', { seed: 3, expr: n < 1 ? 'stern' : 'angry', L: 'hip', R: 'hip', blush: bl, steam: n >= 1 ? q((f * 0.06) % 1, 2) : 0, look: -0.6, facing: -1, ...ID(f, 3, 0.5) }, gp(-6.3, -3.4)));
      break;
    }
    case 'rifle': {
      const taken = f >= 418;
      A(R(T, 'farmer', { seed: 3, expr: 'angry', blush: 1, steam: q((f * 0.06) % 1, 2), R: taken ? 'port' : 'grab', L: taken ? 'port' : 'hip', prop: taken ? 'port' : null, look: taken ? 0 : -0.5, facing: taken ? 0 : -1, bob: taken ? q(0.01 * Math.sin(f * 0.6), 3) : 0 }, [-10.2, CAB, -8.3]));
      break;
    }
    case 'pat': {
      const k = clamp((f - 452) / 23);
      if (f >= 452) A(PIGF(T, { angel: true, flap: q((f * 0.4) % 6.28, 1), wink: false, blink: 0, look: 0, tilt: q(6 * Math.sin(f * 0.2), 1) }, [-25 + k * 1.5, G + 4.5 + E.easeOut(k) * 6, 1.5], { s: 1.4, blob: false, shadow: false }));
      break;
    }
    case 'empty': {
      const lk = q(Math.sin((f - 476) * 0.12) * 0.9, 2);
      A(R(T, 'owner', { seed: 5, expr: f < 500 ? 'neutral' : 'puzzled', L: 'hold', propL: 'watch', R: f > 510 ? 'cheek' : 'hang', look: lk, ...ID(f, 5), blink: B(f, 5) }, gp(PEN[0], PEN[2] + 3.7)));
      break;
    }
    case 'hat': {
      const off = f >= 549;
      A(R(T, 'owner', { seed: 5, expr: f < 547 ? 'puzzled' : 'shock', L: f < 547 ? 'hang' : 'up', R: f < 547 ? 'hang' : 'up', hatOff: off, bob: off ? q(0.03 * Math.max(0, Math.sin((f - 549) * 0.8)), 3) : 0, blink: 0 }, gp(PEN[0], PEN[2] + 3.7)));
      if (off) { const t = (f - 549) / 30; A({ key: 'tophat' + q(t * 7.5, 1), draw: (p) => T.hatCard(p, 'owner', t * 7.5), x: PEN[0] + 0.15 * t, y: PEN[1] + 0.95 + 5.2 * t - 3.0 * t * t, z: PEN[2] + 3.7, blob: false, s: 1, order: 4 }); }
      break;
    }
    case 'pay': {
      A(R(T, 'farmer', { seed: 3, expr: 'sheepish', R: 'palm', prop: 'coins', look: 0.7, facing: 1, headTilt: -6, ...ID(f, 3, 0.6), blink: B(f, 3) }, gp(-0.6, 2.1)));
      A(R(T, 'owner', { seed: 5, expr: f > 595 ? 'stubborn' : 'neutral', L: 'hang', look: -0.6, facing: -1, ...ID(f, 5), blink: B(f, 5) }, gp(0.8, 2.0)));
      break;
    }
    case 'refuse': {
      const turn = f > 632;
      A(R(T, 'owner', { seed: 5, expr: 'smug', L: 'cross', R: 'cross', facing: turn ? 1 : 0, look: turn ? 1 : 0, headTilt: q(turn ? 10 : 6 + 4 * E.easeOut(clamp((f - 618) / 8)), 1), tilt: turn ? 4 : 0, blink: 1 }, gp(0.8, 2.0)));
      A(R(T, 'farmer', { seed: 3, expr: 'shock', R: 'palm', prop: 'coins', look: 0.8, facing: 1, blink: 0 }, gp(-0.7, 2.4)));
      break;
    }
    case 'arrest': {
      const sh = q(Math.sin(f * 0.9) * 0.6, 1);
      A(R(T, 'farmer', { seed: 3, expr: 'gulp', L: 'up', R: 'up', look: 0.6, facing: 1, headTilt: sh, bob: q(0.01 * Math.sin(f * 1.3), 3), blink: B(f, 3) }, gp(-2.3, 1.4)));
      A(R(T, 'gofc', { seed: 6, expr: 'stern', L: 'point', R: 'hold', prop: 'cuffs', wv: q(f * 0.3, 1), look: -0.8, facing: -1, ...ID(f, 6), blink: B(f, 6) }, gp(-0.5, 3.2)));
      A(R(T, T.PW.gsol(1), { seed: 7, expr: 'stern', L: 'point', R: 'rifle', prop: 'rifle', look: -0.8, facing: -1, ...ID(f, 7), blink: B(f, 7) }, gp(0.5, 2.6), { s: 0.98 }));
      A(R(T, T.PW.gsol(2), { seed: 8, expr: 'stern', L: 'hold', propL: 'cuffs', wv: q(f * 0.35 + 2, 1), look: -0.8, facing: -1, ...ID(f, 8), blink: B(f, 8) }, gp(0.2, 4.6), { s: 0.98 }));
      break;
    }
    case 'call': {
      const wv = q(f * 0.6, 1);
      A(R(T, 'farmer', { seed: 3, expr: 'shock', R: 'wave', prop: 'hanky', wv, L: 'wave', propL: 'hanky', ...ID(f, 3) }, gp(-55.9, 61.0)));
      A(R(T, 'setA', { seed: 12, expr: 'grin', R: 'wave', prop: 'hanky', wv: wv + 1, ...ID(f, 12) }, gp(-57.4, 59.8)));
      A(R(T, 'setB', { seed: 13, expr: 'shock', L: 'wave', propL: 'hanky', wv: wv + 2, ...ID(f, 13) }, gp(-54.2, 60.2)));
      A(R(T, 'setC', { seed: 14, expr: 'whistle', R: 'mouth', prop: 'bugle', ...ID(f, 14) }, gp(-55.6, 58.4)));
      break;
    }
    case 'march': { // column of blue soldiers marching up from the boats
      const ph = ((f - 743) / 16) % 1, adv = (f - 743) * 0.07;
      A(R(T, 'bcap', { seed: 4, expr: 'stern', R: 'point', step: q(ph, 2), ...ID(f, 9, 0.4), blink: B(f, 9) }, gp(-55, 56.6 - adv)));
      for (let r = 0; r < 3; r++) for (const c of [-1, 1]) { const v = r * 2 + (c > 0 ? 1 : 0);
        A(R(T, T.PW.bsol(v), { seed: v + 2, expr: v === 3 ? 'nervous' : 'stern', R: 'rifle', prop: 'rifle', step: q((ph + (c > 0 ? 0.5 : 0)) % 1, 2), blink: B(f, v + 2) }, gp(-55 + c * 1.05, 58.4 + r * 1.6 - adv))); }
      break;
    }
    case 'guns': { // soldiers pushing the guns up the hill
      const k = clamp((f - 779) / 34);
      [0, 1, 2].forEach((i) => { const kk = clamp(k * 1.3 - i * 0.15), x = P.hill[0] - 3.2 + i * 3.2, z = lerp(P.hill[1] + 22, P.hill[1] + 6, kk) + 2.6;
        for (const c of [-0.7, 0.7]) A(R(T, T.PW.bsol(i * 2 + (c > 0 ? 1 : 0)), { seed: i * 2 + 3 + (c > 0 ? 1 : 0), expr: kk < 1 ? 'pained' : 'grin', L: 'push', R: 'push', tilt: kk < 1 ? -8 : 0, step: kk < 1 ? q(((f * 0.06) + (c > 0 ? 0.5 : 0)) % 1, 2) : 0 }, gp(x + c, z))); });
      if (f > 800) for (let i = 0; i < 4; i++) A({ ...crowdCard(T, i + 5, 4, 1), x: FLEET_IN(clamp((f - 790) / 69))[0][0] + 0.3, y: DECKY + 0.4, z: FLEET_IN(clamp((f - 790) / 69))[0][2] + 12 - i * 6, s: 2.2, blob: false });
      break;
    }
    case 'crowd': {
      const sp = FLEET_IN(0.9 + 0.1 * clamp((f - 860) / 46))[0];
      for (let i = 0; i < 5; i++) A({ ...crowdCard(T, i + 11, 4, 2), x: sp[0] - 1.6 + (i % 2) * 2.4, y: DECKY + 0.3, z: sp[2] - 14 + i * 4.6, s: 2.25, blob: false });
      FLEET_IN(1).slice(1).forEach((sp2, j) => { for (let i = 0; i < 3; i++) A({ ...crowdCard(T, 20 + j * 3 + i, 4, 2), x: sp2[0] + (i - 1) * 0.6, y: DECKY + 0.3, z: sp2[2] - 8 + i * 8, s: 2.25, blob: false }); });
      break;
    }
    case 'admiral': {
      const down = f >= 928, sh = f > 940 ? q(Math.sin((f - 940) * 0.28) * 9 * clamp((975 - f) / 20 + 0.3), 1) : 0;
      A(R(T, 'gadm', { seed: 5, expr: down ? 'weary' : 'squint', L: down ? 'hang' : 'eye', propL: down ? 'teleDown' : 'tele', facing: down ? 0 : -1, look: down ? 0 : -0.8, headTilt: sh, blink: down ? B(f, 5) : 0 }, [ADM[0], DECKY, ADM[2]]));
      A({ ...crowdCard(T, 31, 3, 1), x: ADM[0] - 2.8, y: DECKY + 0.2, z: ADM[2] + 2.5, s: 2.1, blob: false });
      break;
    }
    case 'think': case 'palm': {
      const p2 = S.id === 'palm';
      A(R(T, 'gadm', { seed: 5, expr: p2 ? 'weary' : 'neutral', L: p2 ? 'face' : 'hang', R: p2 ? 'hang' : 'twirl', look: p2 ? 0 : 0.6, headTilt: p2 ? q(-6 + 2 * Math.sin(f * 0.2), 1) : 4, blink: p2 ? 1 : B(f, 5), ...ID(f, 5, 0.5) }, [ADM[0], DECKY, ADM[2]]));
      const k = p2 ? 1 : E.back(clamp((f - 984) / 14));
      if (k > 0.02) A({ key: 'think' + (p2 ? 'pig' : 'war') + q(k, 2) + (p2 ? q((f * 0.2) % 6.28, 1) : q((f * 0.25) % 6.28, 1)), draw: (p) => T.fxThought(p, p2 ? 'pig' : 'nations', k, f * 0.25), x: ADM[0] + 0.62, y: DECKY + 1.75, z: ADM[2] - 0.2, s: 0.95, blob: false, shadow: false, order: 5 });
      break;
    }
    case 'years': {
      const s = seasonAt(f), bd = q(clamp((f - 1145) / 33), 2);
      A(R(T, T.PW.bsol(1), { seed: 3, expr: s.snow > 0.5 ? 'pained' : 'neutral', R: 'rifle', prop: 'rifle', beard: bd, beardCol: '#7a5a3a', blink: B(f, 3), ...ID(f, 3) }, gp(1.35, 20)));
      A(R(T, T.PW.gsol(2), { seed: 6, expr: s.snow > 0.5 ? 'pained' : 'neutral', R: 'rifle', prop: 'rifle', beard: bd, beardCol: '#4a3a2a', blink: B(f, 6), ...ID(f, 6) }, gp(2.65, 20)));
      break;
    }
    case 'noshot': {
      A(R(T, T.PW.bsol(4), { seed: 5, expr: f > 1196 && f < 1222 ? 'yawn' : 'weary', R: f > 1196 && f < 1222 ? 'mouth' : 'rifle', prop: f > 1196 && f < 1222 ? null : 'rifle', L: f > 1196 && f < 1222 ? 'up' : 'hang', beard: 1, beardCol: '#7a5a3a', blink: f > 1196 ? 1 : B(f, 5), ...ID(f, 5) }, gp(-90.2, 34.0)));
      break;
    }
    case 'doors': {
      const w = clamp((f - 1250) / 61), ph = ((f - 1250) / 18) % 1;
      const z = lerp(21.5, 13.5, w);
      A(R(T, 'dipB', { seed: 4, expr: 'nervous', step: f > 1250 ? q(ph, 2) : 0, look: 0.2, blink: B(f, 4), L: 'hang', R: 'hang' }, [-1.0, 0, z], { tint: '#fff2de' }));
      A(R(T, 'dipG', { seed: 7, expr: 'nervous', step: f > 1250 ? q((ph + 0.5) % 1, 2) : 0, look: -0.2, blink: B(f, 7) }, [1.0, 0, z + 0.3], { tint: '#fff2de' }));
      break;
    }
    case 'kaiser': {
      const st = f < 1325 ? -0.12 + 0.05 * E.easeOut(clamp((f - 1312) / 10)) * 0 : f < 1331 ? 0.12 : 0.04;
      const tw = f > 1334;
      A(R(T, 'kaiser', { seed: 4, expr: tw ? 'smug' : 'stern', sit: true, R: tw ? 'twirl' : 'stamp', prop: tw ? null : 'seal', stampY: q(f < 1322 ? -0.25 : f < 1325 ? lerp(-0.25, 0.14, (f - 1322) / 3) : 0.14, 2), L: 'hang', blink: B(f, 4) }, [TH[0], 0.95, -17.25], { s: 1.7, blob: false }));
      A(R(T, 'dipB', { seed: 4, expr: 'nervous', tilt: 14, L: 'hang', R: 'hang', blink: B(f, 4) }, [-3.3, 0, -12.2]));
      A(R(T, 'dipG', { seed: 7, expr: 'nervous', tilt: -14, blink: B(f, 7) }, [3.3, 0, -12.2]));
      break;
    }
    case 'sunset': break;
    case 'heaven': {
      const wink = f >= 1414 && f < 1428, chew = f > 1395 && f < 1412 ? q(Math.abs(Math.sin(f * 0.9)), 1) : 0;
      A(PIGF(T, { angel: true, flap: q((f * 0.18) % 6.28, 1), potato: true, chew, wink, bitten: f > 1397, bite: f > 1392 && f < 1398 ? 1 : 0, legs: 'sit', blink: wink ? 0 : B(f, 7), tilt: q(4 * Math.sin(f * 0.08), 1) }, [20, 73.25, 64], { s: 1.15, blob: false, shadow: false }));
      break;
    }
  }
  return out;
};

// ---------- 2D effects (no letters, no numbers) ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, res: 0.5, ...extra });
const gulls = (T, f, list) => list.map(([x, y, z, s, ph], i) => FX('gull' + q(((f * 0.07 + ph) % 1), 1), (p) => T.fxGull(p, (f * 0.07 + ph) % 1), [x + Math.sin(f * 0.02 + i) * 3 + f * 0.04 * (i % 2 ? 1 : -1), y + Math.sin(f * 0.05 + i) * 0.8, z], s, { face: true, fog: true }));
const smoke = (T, f, ship, n = 4, tint) => { const out = []; if (!ship) return out; const [x, , z, ry] = ship, c = Math.cos(ry), s = Math.sin(ry);
  const fx = x + (-3.5) * c, fz = z - (-3.5) * s;
  for (let i = 0; i < n; i++) { const t = ((f * 0.012 + i / n) % 1); out.push(FX('smk' + q(t, 1), (p) => T.fxSmoke(p, t, '#d8dadc'), [fx - t * 6, 12 + t * 9, fz + t * 2], 3 + t * 5, { face: true, tint, res: 0.5 })); }
  return out; };
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [], Wd = worldAt(f);
  switch (S.id) {
    case 'hook': out.push(...gulls(T, f, [[-44, 22, 72, 1.0, 0], [-52, 26, 66, 0.8, 0.4], [-40, 19, 80, 0.7, 0.7]])); out.push(...smoke(T, f, Wd.fleet[0]), ...smoke(T, f, Wd.fleet[1], 3)); break;
    case 'pigsky': out.push(...gulls(T, f, [[24, 140, 182, 1.6, 0.2], [44, 138, 176, 1.4, 0.6]])); break;
    case 'flags': if (f >= 136 && f < 152) { const t = q((f - 136) / 16, 2); for (const x of [0.75, 3.25]) out.push(FX('dust' + t, (p) => T.fxDust(p, t, '#d8c8a0'), gp(x, 40, 0.05), 0.35)); } break;
    case 'farms': out.push(...gulls(T, f, [[-6, 14, -10, 0.9, 0.3]])); break;
    case 'dig': {
      const items = [[0, 0.0], [1, 0.33], [2, 0.66], [3, 0.15], [4, 0.5]];
      for (const [i, ph] of items) { const t = ((f - 270) / 26 + ph) % 1, vx = (i % 2 ? -1 : 1) * (0.6 + i * 0.25), x = -7.0 + vx * t * 1.6, y = G + 0.6 + 3.0 * t - 3.4 * t * t, z = 2.9 - 0.2 * i;
        if (i < 3) out.push(FX('pot' + q((t * 8) % 6.28, 1), (p) => T.fxPotato(p, t * 8), [x, y, z], 0.32, { roll: q(t * 6, 1) }));
        else out.push(FX('clod' + i, (p) => T.fxClod(p, i), [x, y - 0.1, z], 0.26)); }
      break;
    }
    case 'days': { const { t } = dayPhase(f); const a = rx(15 + 150 * t); const night = t > 0.72;
      out.push(FX(night ? 'moon' : 'sun', (p) => (night ? T.fxMoon(p) : T.fxSun(p)), [-60 - Math.cos(a) * 70, G + 4 + Math.sin(a) * 26, -90], 18, { face: true, fog: false, res: 0.5 })); break; }
    case 'rifle': break;
    case 'pat': {
      if (f >= 446) { const t = q(clamp((f - 446) / 26), 2); out.push(FX('smoke' + t, (p) => T.fxSmoke(p, t, '#f2f2f0'), [-26.5, G + 1.4, 1.0], 6.0, { face: true })); }
      if (f >= 446 && f < 452) { const t = q((f - 446) / 6, 2); out.push(FX('burst' + t, (p) => T.fxBurst(p, t, '#fff2b0', 10, 40, 200), [-26.5, G + 3.8, 1.0], 3.2, { face: true })); }
      for (let i = 0; i < 7; i++) { const t = clamp((f - 448 - i) / 26); if (t <= 0) continue; const ph = (f * 0.11 + i * 0.3) % 1;
        out.push(FX('bird' + q(ph, 1), (p) => T.fxBird(p, ph), [-30 + i * 2.2 + t * (i - 3) * 3, G + 7 + t * 14 + (i % 3), -6 - i], 1.3, { face: true })); }
      break;
    }
    case 'arrest': break;
    case 'call': out.push(...gulls(T, f, [[-57, 9, 52, 1.1, 0.1], [-50, 11, 50, 0.9, 0.5]])); break;
    case 'march': out.push(...gulls(T, f, [[-58, 8, 66, 1.0, 0.2]])); break;
    case 'guns': if (f > 800) { out.push(...smoke(T, f, Wd.fleet[0], 4), ...smoke(T, f, Wd.fleet[1], 3), ...smoke(T, f, Wd.fleet[2], 3), ...smoke(T, f, Wd.fleet[3], 3)); } out.push(...gulls(T, f, [[-40, 22, 58, 1.2, 0.1]])); break;
    case 'crowd': out.push(...smoke(T, f, Wd.fleet[0], 5), ...smoke(T, f, Wd.fleet[1], 3)); break;
    case 'admiral': out.push(...gulls(T, f, [[-50, 14, 72, 0.9, 0.6]])); break;
    case 'share': out.push(...gulls(T, f, [[-140, 46, 52, 4, 0.2], [-130, 50, 40, 3.4, 0.7]])); break;
    case 'years': { const s = seasonAt(f);
      for (let i = 0; i < 16; i++) { const t = ((f * 0.03 + i * 0.37) % 1), x = -2 + (i % 8) * 1.0 + Math.sin(f * 0.1 + i) * 0.3, y = G + 3.2 - t * 3.2, z = 21.5 + (i % 3) * 0.6;
        if (s.snow > 0.3) out.push(FX('snow', (p) => T.fxSnow(p), [x, y, z], 0.09, { face: true, alpha: Math.min(1, s.snow) }));
        else if (s.bloom > 0.3) out.push(FX('petal', (p) => T.fxPetal(p), [x, y, z], 0.12, { face: true, roll: q(t * 9 + i, 1) }));
        else if (s.autumn > 0.3) out.push(FX('leaf' + (i % 3), (p) => T.fxLeaf(p, ['#d9822b', '#c4452c', '#e6b13a'][i % 3]), [x, y, z], 0.13, { face: true, roll: q(t * 8 + i, 1) })); }
      break; }
    case 'noshot': { const k = q(E.easeOut(clamp((f - 1181) / 28)), 2); // flowers sprouting from the idle gun's muzzle
      out.push(FX('flw' + k, (p) => T.fxFlowers(p, k), [-89, hAt(-89, 33) + 0.76, 34.95], 1.0, { order: 6, res: 1 }));
      for (let i = 0; i < 2; i++) { const ph = (f * 0.09 + i * 0.5) % 1; out.push(FX('bird' + q(ph, 1), (p) => T.fxBird(p, ph, '#4a4450'), [-92 + i * 4 + (f - 1179) * 0.05, 9 + i, 26 - i * 3], 0.9, { face: true })); }
      break; }
    case 'kaiser': if (f >= 1325 && f < 1334) { const t = q((f - 1325) / 9, 2); out.push(FX('kb' + t, (p) => T.fxBurst(p, t, '#ffe08a', 10, 30, 160), [0.3, 2.0, -14.6], 0.7, { face: true })); } break;
    case 'sunset': out.push(...gulls(T, f, [[60, 30, 110, 2.6, 0.3], [70, 34, 100, 2.2, 0.8]])); break;
    case 'heaven': out.push(...gulls(T, f, [[12, 72, 54, 0.9, 0.5]])); break;
  }
  return out;
};
const rx = (a) => a * Math.PI / 180;
