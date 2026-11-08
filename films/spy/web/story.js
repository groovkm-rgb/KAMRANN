// Shot plan for "Der Mann, der nie existierte" — timed to voice.mp3 (45.09 s) + 0.5 s tail, 30 fps.
// Phrase times (s), checked by hand against the waveform (silence segments + spectral landmarks):
//  0.13- 1.88 Der erfolgreichste Spion dieses Krieges …   | 2.31- 4.42 war schon tot, bevor seine Mission begann.
//  4.97- 7.17 Eine Armee plant einen Angriff auf eine Insel. | 7.46- 9.37 Der Feind darf es auf keinen Fall merken.
//  9.61-11.63 Also brauchen sie … eine Leiche. (pause 10.54-10.92)
// 11.96-13.98 Sie finden einen Toten ohne Angehörige.        | 14.34-16.08 Ziehen ihm eine Offiziersuniform an.
// 16.41-18.10 Und erfinden ihm ein ganzes Leben:              | 18.44-19.97 Liebesbriefe seiner Verlobten,
// 20.26-21.09 Theaterkarten,  | 21.10-22.65 die Quittung für einen Verlobungsring. | 23.03-24.69 Sogar einen Mahnbrief seiner Bank.
// 25.00-27.09 Und an ihm festgekettet: eine Aktentasche.      | 27.54-29.56 Darin streng geheime Pläne. Alle falsch. ("Alle falsch" 28.95)
// 30.00-32.38 Nachts lässt ihn ein U-Boot … gleiten.          | 32.75-33.94 Am Morgen findet ihn ein Fischer.
// 34.37-35.57 Die Papiere landen beim Feind.                  | 35.79-36.82 Und der glaubt jedes Wort.
// 37.17-38.58 Er schickt Truppen an die falschen Orte.        | 38.88-39.83 Als der echte Angriff kommt, | 39.85-41.58 stehen viele … ganz woanders.
// 41.91-43.03 Der Mann, der nie existierte …                  | 43.19-44.79 hat vermutlich Tausende Leben gerettet.
import { M as E, camFromKeys, idle, blinkAt, q, ramp, clamp, lerp, lerp3 } from './motion.js';
export const FPS = 30, TOTAL = 1368;
export const SHOTS = [
  { id: 's01', a: 0, b: 62, light: 'night' },      // sub breaches the sea
  { id: 's02', a: 63, b: 140, light: 'night' },    // the sleeping agent's face
  { id: 's03', a: 141, b: 218, light: 'room' },    // pawn pushed onto the island
  { id: 's04', a: 219, b: 284, light: 'room' },    // shh
  { id: 's05', a: 285, b: 353, light: 'room' },    // "… eine Leiche" pipe drop
  { id: 's06', a: 354, b: 423, light: 'cold' },    // cold room, stretcher
  { id: 's07', a: 424, b: 486, light: 'cold' },    // dressing pof pof
  { id: 's08', a: 487, b: 547, light: 'desk' },    // lamp on, the desk
  { id: 's09', a: 548, b: 602, light: 'desk' },    // love letters
  { id: 's10', a: 603, b: 631, light: 'desk' },    // theatre tickets
  { id: 's11', a: 632, b: 684, light: 'desk' },    // ring box + receipt
  { id: 's12', a: 685, b: 744, light: 'desk' },    // bank letter, laugh
  { id: 's13', a: 745, b: 818, light: 'void' },    // chain + lock
  { id: 's14', a: 819, b: 892, light: 'void' },    // case opens, docs glow, red X
  { id: 's15', a: 893, b: 975, light: 'night' },   // released into the sea
  { id: 's16', a: 976, b: 1023, light: 'dawn' },   // the fisherman
  { id: 's17', a: 1024, b: 1069, light: 'hq' },    // papers hand to hand
  { id: 's18', a: 1070, b: 1109, light: 'hq' },    // monocle nods, general fist
  { id: 's19', a: 1110, b: 1134, light: 'hqTop' }, // map: green pawns slide away
  { id: 's19b', a: 1135, b: 1161, light: 'march' },// columns, trucks, train leave
  { id: 's20', a: 1162, b: 1194, light: 'landing' },// the fleet comes in
  { id: 's20b', a: 1195, b: 1251, light: 'landingB' },// empty beach, puzzled sentries
  { id: 's21', a: 1252, b: 1292, light: 'sunset' },// the white stone and a flower
  { id: 's21b', a: 1293, b: 1367, light: 'sunset' },// pull back, end
];
export const XFADE = [{ a: 1129, b: 1139, from: 's19', to: 's19b' }];
let FORCE = null;
export const setForce = (id) => { FORCE = id ? SHOTS.find((s) => s.id === id) : null; };
export const shotAt = (f) => FORCE || SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const smooth = E.smooth;

// ---------- lights ----------
export const LIGHTS = {
  night: { az: -50, el: 22, sky: '#5a72a0', ground: '#182234', hemi: 1.35, sun: '#c4d6f4', sunI: 1.7, fog: '#2a3a58', fogNear: 30, fogFar: 300,
    skyTop: '#0a1430', skyHor: '#3a5078', sunDisc: '#f6f2de', sunSize: 0.0006, sunGlow: 0.4, glowPow: 160, sat: 0.95, waterDeep: '#0e2040', waterShal: '#2a4a78', glint: '#d4e2f6',
    vig: 0.36, tone: 0.06, grain: 0.05, shadowExt: 16 },
  room: { az: 60, el: 78, sky: '#8a7660', ground: '#2a2018', hemi: 0.8, sun: '#ffd9a0', sunI: 1.25, fog: '#2a2018', fogNear: 8, fogFar: 30, skyTop: '#1a1410', skyHor: '#1a1410',
    lampI: 3.2, lampCol: '#ffcf8a', lampDist: 8, sat: 1.0, tone: 0.24, vig: 0.42, gain: '#fff4e6', shadowExt: 4.5 },
  cold: { az: 30, el: 80, sky: '#d4e6f6', ground: '#7a8a9a', hemi: 1.2, sun: '#e6f2ff', sunI: 1.1, fog: '#a8bccc', fogNear: 10, fogFar: 40, skyTop: '#9fb2bf', skyHor: '#9fb2bf',
    sat: 0.9, tone: 0.05, vig: 0.3, gain: '#eef6ff', shadowExt: 3.5 },
  desk: { az: 120, el: 62, sky: '#6a5848', ground: '#20180f', hemi: 0.6, sun: '#ffd49a', sunI: 0.9, fog: '#1c140c', fogNear: 5, fogFar: 25, skyTop: '#140e08', skyHor: '#140e08',
    lampI: 3.4, lampCol: '#ffc878', lampDist: 5, sat: 1.02, tone: 0.24, vig: 0.45, gain: '#fff0dc', shadowExt: 2.2 },
  void: { az: 100, el: 84, sky: '#4a4034', ground: '#000000', hemi: 0.35, sun: '#fff0d6', sunI: 1.7, fog: '#060508', fogNear: 6, fogFar: 30, skyTop: '#000000', skyHor: '#000000',
    sat: 1.0, tone: 0.14, vig: 0.55, shadowExt: 1.6 },
  dawn: { az: -75, el: 12, sky: '#ffe0bc', ground: '#a07850', hemi: 1.05, sun: '#ffc27a', sunI: 2.4, fog: '#f4c894', fogNear: 60, fogFar: 600,
    skyTop: '#86a2c8', skyHor: '#ffcf8e', sunDisc: '#fff2c8', sunSize: 0.004, sat: 1.05, waterDeep: '#3d5a86', waterShal: '#e0a878', glint: '#ffe8b8',
    tone: 0.12, vig: 0.25, gain: '#fff6e8', shadowExt: 10 },
  hq: { az: 150, el: 55, sky: '#8a9070', ground: '#2a2a1c', hemi: 0.8, sun: '#ffe2b0', sunI: 1.2, fog: '#2a2c20', fogNear: 8, fogFar: 30, skyTop: '#1a1a12', skyHor: '#1a1a12',
    lampI: 2.4, lampCol: '#ffd59a', lampDist: 9, sat: 0.95, tone: 0.2, vig: 0.4, gain: '#f6f6e6', shadowExt: 4.5 },
  hqTop: { az: 150, el: 70, sky: '#9aa080', ground: '#2a2a1c', hemi: 1.0, sun: '#ffe8c0', sunI: 1.3, fog: '#2a2c20', fogNear: 8, fogFar: 30, skyTop: '#1a1a12', skyHor: '#1a1a12',
    lampI: 2.4, lampCol: '#ffd59a', lampDist: 9, sat: 0.95, tone: 0.2, vig: 0.38, gain: '#f6f6e6', shadowExt: 2.5 },
  march: { az: 40, el: 30, sky: '#d8d0b8', ground: '#6a6448', hemi: 1.05, sun: '#ffe8c0', sunI: 1.9, fog: '#d6caa8', fogNear: 40, fogFar: 420, skyTop: '#a8b2b8', skyHor: '#e6dcc0',
    tone: 0.35, sat: 0.85, vig: 0.3, shadowExt: 30 },
  landing: { az: 55, el: 9, sky: '#f0cfae', ground: '#806048', hemi: 1.2, sun: '#ffc890', sunI: 2.0, fog: '#e8bc98', fogNear: 50, fogFar: 520,
    skyTop: '#5f7aa8', skyHor: '#f4c088', sunDisc: '#fff0c8', sunSize: 0.0016, waterDeep: '#2c4a72', waterShal: '#b88a70', glint: '#ffe0a8', tone: 0.14, vig: 0.3, shadowExt: 40 },
  landingB: { az: -100, el: 10, sky: '#f0d8b8', ground: '#806048', hemi: 1.0, sun: '#ffd09a', sunI: 2.2, fog: '#f0d0aa', fogNear: 50, fogFar: 520,
    skyTop: '#7f98c0', skyHor: '#f6d0a0', waterDeep: '#2c4a72', waterShal: '#b88a70', glint: '#ffe0a8', tone: 0.14, vig: 0.28, shadowExt: 14 },
  sunset: { az: 40, el: 10, sky: '#f4b080', ground: '#6a4a48', hemi: 1.0, sun: '#ffb070', sunI: 2.5, fog: '#f0a880', fogNear: 80, fogFar: 800,
    skyTop: '#6a5a98', skyHor: '#ffb070', sunDisc: '#fff0c8', sunSize: 0.004, waterDeep: '#3d4a7a', waterShal: '#e09070', glint: '#ffd8a0', tone: 0.16, vig: 0.3, shadowExt: 8 },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 's08' && f < 494) { L.hemi = 0.18; L.sunI = 0.12; L.lampI = 0; }
  if (S.id === 's08' && f >= 494 && f < 500) L.lampI *= 1.4; // switch-on bloom
  if (S.id === 's04') L.lampI *= 1 + 0.12 * Math.sin(f * 0.6);
  if (S.id === 's14' && f >= 846 && f < 868) L.gain = '#fff6d8';
  return L;
};

// ---------- geometry anchors ----------
const DECK = 1.74;                         // submarine deck top (sub at y -0.5)
const subY = (f) => -0.5 + 0.05 * Math.sin(f * 0.12), deckAt = (f) => subY(f) + 2.245 + 0.06;
const HEADOFF = 0.41, BELTOFF = 0.29;      // flat-card offsets (m) from card centre to head / belt along the card's up axis
const beachY = (z, y0, y1, z0, d) => y0 + (y1 - y0) * Math.pow(clamp((z - (z0 - d / 2)) / d), 0.8);
const shoreY = (z) => beachY(z, -0.6, 3.0, 30, 80), landY = (z) => beachY(z, -0.9, 3.0, 50, 120);
const AG = { sea2: [-5, DECK + 0.01, -0.34], cold: [-0.37, 0.872, 0], caseC: [0, 0.008, 0], sea15: [-5.4, DECK + 0.01, 0.0], shore: [0.6, 0.11, -0.6] };
const CASE = [0.62, 0, 0.42];
const P1 = [0.45, 0, -1.55], P2 = [-0.4, 0, -1.5];   // planners in the map room
const HQ = { A: [-1.1, 0, -1.6], I: [0.0, 0, -1.7], G: [1.15, 0, -1.55] };
const SENT = [[-0.6, 0, 13.4], [0.25, 0, 12.6], [1.05, 0, 14.2]].map(([x, y, z]) => [x, landY(z), z]);

// ---------- cameras ----------
const K = (f, pos, look, fov, roll = 0, ease) => ({ f, pos, look, fov, roll, ease });
const CAMS = {
  s01: [K(0, [-11.5, 0.9, 9.5], [0, 2.6, 0], 48, 5), K(62, [-7.8, 2.3, 6.6], [0.5, 3.5, 0], 42, -1, 'easeOut')],
  s02: [K(63, [-5, 5.0, 0.55], [-5, DECK, -0.3], 42, 6), K(140, [-5, 3.05, -0.52], [-5, DECK, -0.76], 34, -3)],
  s03: [K(141, [0.1, 2.95, 3.3], [0.05, 1.45, -0.95], 46, -3), K(218, [0.05, 2.8, 2.5], [0.05, 1.5, -0.85], 43, 2)],
  s04: [K(219, [0.65, 1.62, 0.05], [0.43, 1.44, -1.55], 34, 2), K(284, [0.52, 1.56, -0.28], [0.44, 1.46, -1.55], 32, -2)],
  s05: [K(285, [0.03, 1.7, 2.4], [0.03, 1.3, -1.5], 44, -2), K(316, [0.03, 1.66, 2.2], [0.03, 1.3, -1.5], 43, 0), K(353, [0.03, 1.62, 1.95], [0.03, 1.32, -1.5], 42, 2.5)],
  s06: [K(354, [1.6, 2.1, 0.05], [-0.8, 1.28, 0], 39, 0), K(423, [1.25, 1.95, 0.0], [-0.85, 1.28, 0], 36, 2)],
  s07: [K(424, [0.62, 3.0, 0.02], [-0.12, 0.86, 0], 46, -6), K(486, [0.36, 2.35, 0.02], [-0.2, 0.86, 0], 42, 4)],
  s08: [K(487, [0, 1.85, 2.5], [0, 1.25, -0.4], 44, -2), K(547, [0.04, 1.7, 2.0], [0, 1.27, -0.35], 41, 1)],
  s09: [K(548, [-0.19, 1.22, 0.45], [-0.25, 0.78, 0.05], 34, -6), K(602, [-0.22, 1.04, 0.28], [-0.26, 0.78, 0.05], 31, 3)],
  s10: [K(603, [0.35, 1.12, 0.25], [0.25, 0.78, -0.1], 34, 4), K(631, [0.2, 1.07, 0.22], [0.2, 0.78, -0.11], 32, -2)],
  s11: [K(632, [0.12, 0.99, 0.64], [0.04, 0.8, 0.27], 33, -3), K(684, [0.07, 0.93, 0.5], [0.04, 0.8, 0.27], 29, 2)],
  s12: [K(685, [0.0, 1.62, 2.2], [0, 1.42, -0.9], 43, 2), K(744, [0, 1.58, 1.75], [0, 1.46, -0.9], 39, -2)],
  s13: [K(745, [0.25, 1.95, 1.0], [0.2, 0, 0.1], 44, 0), K(790, [0.38, 1.3, 0.85], [0.32, 0, 0.32], 41, -3), K(818, [0.55, 0.98, 0.82], [0.55, 0, 0.42], 38, 2)],
  s14: [K(819, [0.66, 1.12, 0.8], [0.62, 0.02, 0.42], 37, -2), K(892, [0.64, 0.8, 0.62], [0.62, 0.02, 0.42], 34, 3)],
  s15: [K(893, [-10, 7, 8.5], [-4, 3.3, 0.2], 38, 0), K(975, [-9.4, 6.2, 7.8], [-4.4, 3.1, 0.6], 35, -2)],
  s16: [K(976, [-0.2, 2.0, 4.4], [0.1, 1.25, 0], 44, -2), K(1023, [0.2, 2.1, 4.0], [0.0, 1.2, -0.1], 42, 2)],
  s17: [K(1024, [-1.1, 1.66, 0.9], [-0.8, 1.38, -1.6], 42, -2), K(1069, [0.9, 1.66, 0.9], [0.85, 1.38, -1.6], 42, 2)],
  s18: [K(1070, [0.06, 1.62, -0.35], [0.0, 1.57, -1.7], 32, 0), K(1091, [0.04, 1.6, -0.45], [0.0, 1.56, -1.7], 30, -2), K(1097, [1.25, 1.55, 0.8], [1.15, 1.5, -1.55], 40, 3, 'easeOut'), K(1109, [1.25, 1.53, 0.65], [1.15, 1.5, -1.55], 39, 0)],
  s19: [K(1110, [0.35, 4.1, 0.0], [0, 0.83, 0], 56, 0), K(1139, [0.3, 3.5, 0.0], [0, 0.83, 0], 53, -8)],
  s19b: [K(1129, [2.4, 3.6, 7], [0, 1.0, -14], 42, -3), K(1161, [2.0, 3.2, 4], [0, 1.0, -20], 40, 1)],
  s20: [K(1162, [1, 6.5, -150], [1, 1.0, -20], 42, -2), K(1194, [1, 6.0, -138], [1, 1.0, -15], 40, 1)],
  s20b: [K(1195, [0.25, 1.6, 6.0], [0.25, 1.2, 16], 44, 2), K(1251, [0.3, 1.55, 6.6], [0.28, 1.2, 16], 42, -2)],
  s21: [K(1252, [0.9, 0.95, 2.9], [0, 0.55, 0], 38, -2), K(1292, [0.7, 0.9, 2.5], [0, 0.55, 0], 36, 1)],
  s21b: [K(1293, [0.75, 1.0, 2.6], [0, 0.6, 0], 38, 0), K(1367, [5.0, 4.0, 11.5], [0, 1.0, -6], 46, -2)],
};
const KICKS = [{ f: 330, a: 0.03 }, { f: 776, a: 0.025 }, { f: 868, a: 0.03 }, { f: 874, a: 0.025 }, { f: 1100, a: 0.05 }, { f: 1003, a: 0.015 }];
export const camAt = (f) => {
  const S = shotAt(f), c = camFromKeys(CAMS[S.id], f, { creep: 0.0014, kicks: KICKS });
  if (S.id === 's01') { c.pos = [c.pos[0], c.pos[1] + 0.18 * Math.sin(f * 0.21), c.pos[2]]; } // bobbing over the waves
  if (S.id === 's15') c.pos = [c.pos[0], c.pos[1] + 0.12 * Math.sin(f * 0.09), c.pos[2]];
  c.flash = (S.id === 's07' && [437, 452, 467].some((k) => f >= k && f < k + 3)) ? 0.25 * (1 - ((f - 437) % 15) / 3) : 0;
  if (S.id === 's08' && f >= 494 && f < 497) c.flash = 0.12;
  if (S.id === 's13' || S.id === 's14') c.shadowAt = [0.4, 0, 0.3];
  if (S.id === 's07') c.shadowAt = [-0.1, 0.8, 0];
  if (S.id === 's19b') c.shadowAt = [0, 0, -14];
  if (S.id === 's20') c.shadowAt = [0, 0, -50];
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f), d = (p) => dist(C.pos, p);
  switch (S.id) {
    case 's01': return { focus: d([0, 3, 0]), cinf: 3 };
    case 's02': return { focus: d([-5, DECK, -0.6]), cinf: 7 };
    case 's03': return { focus: d([0.1, 0.85, 0]), cinf: 7 };
    case 's04': return { focus: d([0.75, 1.5, -1.6]), cinf: 10 };
    case 's05': return { focus: d([0, 1.4, -1.55]), cinf: 7 };
    case 's06': return { focus: d([-0.75, 0.95, 0]), cinf: 8 };
    case 's07': return { focus: d([-0.15, 0.86, 0]), cinf: 5 };
    case 's08': return { focus: d([0, 0.85, -0.2]), cinf: 6 };
    case 's09': return { focus: d([-0.36, 0.78, 0.1]), cinf: 9 };
    case 's10': return { focus: d([0.3, 0.78, -0.05]), cinf: 9 };
    case 's11': return { focus: d([0.07, 0.82, 0.29]), cinf: 11 };
    case 's12': return { focus: d([0.1, 1.4, -0.9]), cinf: 9 };
    case 's13': return { focus: d([0.35, 0, 0.3]), cinf: 6 };
    case 's14': return { focus: d([0.62, 0.02, 0.42]), cinf: 7 };
    case 's15': return { focus: d([-5, 2, 0.8]), cinf: 4 };
    case 's16': return { focus: d([0, 0.8, 0.4]), cinf: 6 };
    case 's17': return { focus: d([C.look[0], 1.4, -1.6]), cinf: 7 };
    case 's18': return { focus: d([C.look[0], 1.5, -1.6]), cinf: 10 };
    case 's19': return { focus: d([0, 0.83, 0]), cinf: 5 };
    case 's19b': return { focus: d([0, 1, -14]), cinf: 3 };
    case 's20': return { focus: 60, cinf: 2 };
    case 's20b': return { focus: d([0.5, 1.2, 13.5]), cinf: 6 };
    case 's21': return { focus: d([0, 0.5, 0]), cinf: 9 };
    case 's21b': return { focus: d([0, 0.5, 0]), cinf: lerp(8, 2, smooth(ramp(f, 1293, 1350))) };
  }
  return { focus: 10, cinf: 0 };
};

// ---------- world state ----------
const stage7 = (f) => (f < 437 ? 0 : f < 452 ? 1 : f < 467 ? 2 : 3);
// green pawns on the enemy map: start near the big island, end on far coasts
const GP0 = [[-0.25, -0.1], [0.12, -0.18], [0.2, 0.15], [-0.15, 0.18], [0.0, 0.0], [-0.35, 0.08], [0.32, -0.02]].map(([x, z]) => [x * 1.7, z * 1.6]);
const GP1 = [[-1.45, -0.85], [1.35, -0.9], [1.4, 0.75], [-1.3, 0.8], [-1.5, 0.1], [-1.55, -0.45], [1.55, 0.1]];
export const pawnT = (f) => E.smooth(ramp(f, 1113, 1150));
export const worldAt = (f) => {
  const S = shotAt(f), id = S.id, W = { set: 'sea', dyn: {} };
  switch (id) {
    case 's01': case 's02': case 's15': {
      W.set = 'sea'; W.sea = { y: 0, amp: id === 's01' ? 0.38 : 0.3 };
      if (id === 's01') { const t = E.easeOut((f + 14) / 52); W.dyn.sub = { p: [0, lerp(-3.4, -0.5, t), 0], r: [0.02 * Math.sin(f * 0.2), 0, 0.09 * (1 - t)] }; }
      else W.dyn.sub = { p: [0, subY(f), 0], r: [0.008 * Math.sin(f * 0.1), 0, 0.006 * Math.sin(f * 0.08)] };
      break;
    }
    case 's03': case 's04': case 's05': {
      W.set = 'room'; W.lampAt = 'bulbR';
      const sw = id === 's04' ? 0.2 * Math.sin((f - 219) * 0.16) * (0.4 + 0.6 * ramp(f, 219, 240)) : 0.05 * Math.sin(f * 0.07);
      W.dyn.lampR = { r: [0.0, 0, sw] };
      const t = id === 's03' ? E.smooth(ramp(f, 152, 196)) : 1;
      const px = lerp(0.95, 0.05, t), pz = lerp(0.62, 0.02, t);
      W.dyn.pawnA = { p: [px, 0.826, pz] };
      if (id === 's03' && f < 206) W.stick = { a: [px + 0.06, 0.88, pz - 0.05], b: [P1[0] + 0.32, 1.12, P1[2] + 0.35] };
      break;
    }
    case 's06': case 's07': {
      W.set = 'cold';
      W.dyn.sheet = { v: id === 's06' || stage7(f) === 0 };
      break;
    }
    case 's08': case 's09': case 's10': case 's11': case 's12': {
      W.set = 'desk'; W.lampAt = 'bulbD'; W.bulbOn = !(id === 's08' && f < 494);
      const open = id === 's11' ? E.back(ramp(f, 640, 656), 1.2) : id === 's12' ? 1 : 0;
      W.dyn.ringLid = { r: [-1.85 * open, 0, 0] }; W.dyn.ring = { v: open > 0.25 };
      break;
    }
    case 's13': case 's14': {
      W.set = 'case';
      const belt = [AG.caseC[0] + 0.06, 0.03, AG.caseC[2] + BELTOFF];
      const handle = [CASE[0] - 0.24, 0.06, CASE[2]];
      W.dyn.case = { p: CASE, r: [0, -Math.PI / 2, 0] };
      W.dyn.lock = { p: [belt[0] + 0.01, 0.012, belt[2]], r: [0, 0.3, 0] };
      const lk = id === 's13' ? E.back(ramp(f, 770, 776), 2) : 1;
      W.dyn.shackle = { p: [0, lerp(0.085, 0.05, lk), 0] };
      W.chain = { a: [belt[0] + 0.04, 0.03, belt[2]], b: handle, sag: 0.07, n: id === 's13' ? Math.round(lerp(2, 18, E.smooth(ramp(f, 748, 770)))) : 18 };
      W.dyn.caseLid = { r: [id === 's14' ? -1.8 * E.back(ramp(f, 825, 846), 1.1) : 0, 0, 0] };
      break;
    }
    case 's16': {
      W.set = 'shore'; W.sea = { y: 0, amp: 0.07 };
      W.dyn.foam = { dp: [0, 0, 0.35 * Math.sin(f * 0.1)] };
      break;
    }
    case 's17': case 's18': case 's19': {
      W.set = 'hq'; W.lampAt = undefined; if (id === 's19') W.dyn.hqCeil = { v: false };
      const t = id === 's19' ? pawnT(f) : 0;
      const jump = id === 's18' && f >= 1100 && f < 1110 ? 0.05 * Math.sin((f - 1100) / 10 * Math.PI) : 0;
      GP0.forEach((p0, i) => { const p1 = GP1[i], ti = clamp(t * 1.15 - i * 0.025); W.dyn['gp' + i] = { p: [lerp(p0[0], p1[0], E.smooth(ti)), 0.826 + jump * (1 + (i % 3) * 0.4), lerp(p0[1], p1[1], E.smooth(ti))] }; });
      [[0.3, 0.3, 1.2, 0.55], [-0.3, -0.25, -1.25, -0.75], [0.25, -0.3, 1.2, -0.7]].forEach(([x0, z0, x1, z1], i) => W.dyn['toy' + i] = { p: [lerp(x0, x1, t), 0.83 + jump, lerp(z0, z1, t)], r: [0, -Math.atan2(z1 - z0, x1 - x0), 0] });
      break;
    }
    case 's19b': {
      W.set = 'march';
      for (let i = 0; i < 4; i++) W.dyn['truck' + i] = { p: [1.0, 0, -10 - i * 12 - (f - 1129) * 0.22] };
      W.dyn.train = { p: [-38, 0, -60 - (f - 1129) * 0.35] };
      break;
    }
    case 's20': case 's20b': {
      W.set = 'beach'; W.sea = { y: 0, amp: 0.22 };
      W.dyn.fleet = { p: [0, 0, (f - 1162) * 0.12] };
      W.dyn.foamB = { dp: [0, 0, 0.3 * Math.sin(f * 0.09)] };
      for (let i = 0; i < 3; i++) { const z = 60 + i * 9 + (f - 1162) * 0.12; W.dyn['btruck' + i] = { p: [-10 + i * 0.4, landY(z), z] }; }
      break;
    }
    case 's21': case 's21b': {
      W.set = 'hill'; W.sea = { y: -24, amp: 0.15 };
      break;
    }
  }
  return W;
};

// ---------- actors ----------
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.spyFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ground: pos[1], ...extra });
const FLAT = (T, who, o, pos, spin, extra = {}) => ({ key: 'F' + who + JSON.stringify(o), draw: (p) => T.spyFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], flat: true, spin, blob: false, ...extra });
const HEADONLY = (T, who, o, pos, spin, tilt, extra = {}) => ({ key: 'H' + who + JSON.stringify(o), draw: (p) => { p.g.save(); p.g.beginPath(); p.g.rect(0, 0, 600, 452); p.g.clip(); T.spyFront(p, who, o); p.g.restore(); },
  x: pos[0], y: pos[1], z: pos[2], flat: true, spin, tiltX: tilt, blob: false, shadow: false, ...extra });
const SLEEP = { expr: 'sleep', seed: 5 };
const GLOW = (T, pos, s, col = '220,232,255', a = 0.55, flat = true, extra = {}) => ({ key: 'glow' + col + a, draw: (p) => T.fxGlow(p, col, a), x: pos[0], y: pos[1], z: pos[2], s, flat, spin: 0, add: true, blob: false, shadow: false, order: 1, ...extra });
const walkTo = (f, f0, f1, a, b) => { const t = clamp((f - f0) / (f1 - f0)); return { pos: lerp3(a, b, E.smooth(t)), moving: t > 0 && t < 1, ph: q(((f - f0) / 16) % 1, 2) }; };

export const actorsAt = (f, T) => {
  const S = shotAt(f), id = S.id, out = [];
  const B = (seed) => blinkAt(f, seed), I = (seed) => { const v = idle(f, seed); return { bob: q(v.bob, 3), tilt: q(v.tilt, 1), headTilt: q(v.headTilt, 1) }; };
  switch (id) {
    case 's01': {
      const t = E.easeOut((f + 14) / 52), subY = lerp(-3.4, -0.5, t), rise = E.back(ramp(f, 34, 48), 1.6);
      if (f >= 34) for (const [x, z, sd] of [[1.0, -0.3, 61], [2.2, 0.35, 62]]) out.push(R(T, 'crew', { seed: sd, expr: 'stern', blink: B(sd), L: sd === 61 ? 'point' : 'hang' }, [x, subY + 2.2 + 2.95 + 0.06 - (1 - rise) * 1.0, z], { tint: '#6a7a9c', blob: false }));
      break;
    }
    case 's02': {
      out.push(GLOW(T, [-5, deckAt(f) - 0.008, -0.5], 1.5));
      out.push(FLAT(T, 'agent', { ...SLEEP, case: true }, [AG.sea2[0], deckAt(f), AG.sea2[2]], 0, { tint: '#e8eeff' }));
      break;
    }
    case 's15': {
      const slide = E.smooth(ramp(f, 900, 936)), fall = clamp((f - 936) / 14);
      const z = lerp(AG.sea15[2], 1.25, slide) + fall * 1.0, y = deckAt(f) - fall * fall * 1.9;
      if (f < 952) out.push(FLAT(T, 'agent', { ...SLEEP }, [AG.sea15[0], y, z], Math.PI / 2, { tint: '#d8e2fa', tiltX: -fall * 0.35, alpha: f > 946 ? 1 - (f - 946) / 6 : 1 }));
      if (f < 940) out.push(GLOW(T, [AG.sea15[0] - 0.2, deckAt(f) - 0.008, z], 1.4));
      const push = f < 938;
      out.push(R(T, 'crew', { seed: 61, expr: 'stern', L: push ? 'push' : 'hang', R: push ? 'push' : 'hang', blink: B(61), ...I(61) }, [-4.3, DECK, -0.95], { tint: '#56648a', blob: false }));
      out.push(R(T, 'crew', { seed: 62, expr: 'stern', L: push ? 'push' : 'hang', blink: B(62), ...I(62) }, [-6.3, DECK, -0.9], { tint: '#56648a', blob: false }));
      const off = f >= 944;
      out.push(R(T, 'captain', { seed: 63, expr: off ? 'stern' : 'neutral', R: off ? 'hatoff' : 'hang', prop: off ? 'hat' : undefined, hatOff: off, look: 0.3, blink: B(63), ...I(63) }, [-2.5, DECK, -0.7], { tint: '#9cb0d4', blob: false }));
      break;
    }
    case 's03': {
      out.push(R(T, 'plan1', { seed: 11, expr: 'sly', R: f < 206 ? 'push' : 'hip', pipe: true, blink: B(11), look: -0.3, ...I(11) }, P1));
      out.push(R(T, 'plan2', { seed: 12, expr: f < 190 ? 'curious' : 'grin', L: 'rub', R: 'rub', pipe: true, blink: B(12), look: 0.4, ...I(12) }, P2));
      break;
    }
    case 's04': {
      out.push(R(T, 'plan1', { seed: 11, expr: 'shh', L: f > 226 ? 'shh' : 'hang', blink: B(11), look: 0, ...I(11), headTilt: q(-4 + 2 * Math.sin(f * 0.1), 1) }, P1));
      break;
    }
    case 's05': {
      const drop = f >= 328;
      out.push(R(T, 'plan1', { seed: 11, expr: f < 330 ? 'sly' : 'grin', R: f < 330 ? 'chin' : 'hip', L: 'hang', blink: B(11), look: -0.4, ...I(11) }, P1));
      out.push(R(T, 'plan2', { seed: 12, expr: drop ? 'shock' : 'curious', L: drop ? 'cheek' : 'rub', R: drop ? 'cheek' : 'rub', pipe: !drop, blink: drop ? 0 : B(12), look: 0.4, ...I(12), bob: drop ? q(0.012 * Math.sin((f - 328) * 0.9) * Math.max(0, 1 - (f - 328) / 20), 3) : I(12).bob }, P2));
      break;
    }
    case 's06': {
      out.push(GLOW(T, [-0.78, 0.97, 0], 0.7, '230,240,255', 0.5, false, { order: 1 }));
      out.push(HEADONLY(T, 'agentShirt', SLEEP, [-0.42, 0.80, 0], Math.PI / 2, 0.5, { tint: '#f4f8ff' }));
      const a = walkTo(f, 354, 398, [-2.6, 0, -2.4], [-1.5, 0, -0.32]), b = walkTo(f, 358, 404, [-3.2, 0, -1.6], [-1.45, 0, 0.42]);
      out.push(R(T, 'plan1', { seed: 11, expr: 'determined', step: a.moving ? a.ph : 0, L: a.moving ? 'swing' : 'hang', R: a.moving ? 'swing' : 'hold', swing: a.moving ? q(Math.sin(a.ph * 6.283), 2) : 0, blink: B(11), look: -0.5 }, a.pos));
      out.push(R(T, 'plan2', { seed: 12, expr: 'determined', step: b.moving ? b.ph : 0, L: b.moving ? 'swing' : 'rub', R: b.moving ? 'swing' : 'rub', swing: b.moving ? q(Math.sin(b.ph * 6.283), 2) : 0, blink: B(12), look: -0.3 }, b.pos));
      break;
    }
    case 's07': {
      const st = stage7(f), who = ['agentShirt', 'agentJacket', 'agentCoat', 'agent'][st];
      out.push(GLOW(T, [-0.25, 0.905, 0], 1.0, '235,242,255', st === 3 ? 0.4 + 0.25 * Math.sin((f - 467) * 0.4) : 0.3));
      out.push(FLAT(T, who, SLEEP, [-0.25, 0.912, 0], Math.PI / 2, { tint: '#f6f9ff' }));
      break;
    }
    case 's08': case 's09': case 's10': case 's11': case 's12': {
      const on = !(id === 's08' && f < 494), tint = on ? '#fff3e2' : '#5a4c40';
      const hop = (f0, from, to) => { const t = clamp((f - f0) / 12); return { p: [lerp(from[0], to[0], t), from[1] + Math.sin(t * Math.PI) * 0.16 + (to[1] - from[1]) * t, lerp(from[2], to[2], t)], s: 1 - 0.6 * t, a: t < 1 ? 1 : 0 }; };
      const POCKET = [-0.62, 0.79, 0.28];
      const item = (key, draw, pos, s, spin, f0) => { let p = pos, sc = s, alpha = 1; if (f0 !== undefined && f >= f0) { const h = hop(f0, pos, POCKET); p = h.p; sc = s * h.s; alpha = h.a; } if (alpha > 0) out.push({ key, draw, x: p[0], y: p[1], z: p[2], s: sc, flat: true, spin, blob: false, tint, order: 3 }); };
      // hop times: each item goes into the pocket right after its line
      item('jacket', (p) => T.propJacket(p), [-0.55, 0.779, 0.3], 0.3, 0.1);
      item('letters', (p) => T.propLetters(p), [-0.25, 0.781, 0.05], 0.22, 0.25, 596);
      item('tickets', (p) => T.propTickets(p), [0.25, 0.781, -0.1], 0.2, -0.3, 624);
      item('receipt', (p) => T.propReceipt(p), [0.19, 0.782, 0.38], 0.11, -0.4, 676);
      if (id !== 's12') item('bank', (p) => T.propBank(p), [0.45, 0.781, 0.2], 0.17, 0.2);
      const laugh = id === 's12' && f > 700;
      out.push(R(T, 'plan1', { seed: 11, expr: id === 's12' ? (f > 722 ? 'pleased' : 'sly') : 'sly', R: id === 's12' && f < 726 ? 'hold' : 'rub', L: id === 's12' ? 'hang' : 'rub', prop: id === 's12' && f < 726 ? 'bank' : undefined, blink: B(11), look: 0.3, ...I(11) }, [0.32, 0, -0.85], { tint }));
      out.push(R(T, 'plan2', { seed: 12, expr: laugh ? 'laugh' : 'pleased', L: laugh ? 'belly' : 'rub', R: laugh ? 'belly' : 'rub', blink: laugh ? 0 : B(12), look: -0.3, ...I(12), bob: laugh ? q(Math.abs(Math.sin(f * 0.55)) * 0.02, 3) : I(12).bob, tilt: laugh ? q(4 * Math.sin(f * 0.5), 1) : I(12).tilt }, [-0.34, 0, -0.95], { tint }));
      if (id === 's12' && f >= 726) { const h = hop(726, [0.55, 1.15, -0.7], POCKET); if (h.a) out.push({ key: 'bankfly', draw: (p) => T.propBank(p), x: h.p[0], y: h.p[1], z: h.p[2], s: 0.17 * h.s, flat: true, spin: 0.3, tiltX: 0.8 * (1 - (f - 726) / 12), blob: false, tint, order: 4 }); }
      break;
    }
    case 's13': case 's14': {
            out.push(FLAT(T, 'agent', SLEEP, AG.caseC, 0, { tint: '#fff6ea' }));
      if (id === 's14') {
        const glow = q(clamp((f - 846) / 6) * (1 - clamp((f - 864) / 6)), 2);
        [[CASE[0] - 0.05, 0.022, CASE[2] - 0.03, -0.08, 1], [CASE[0] + 0.06, 0.03, CASE[2] + 0.04, 0.12, 2]].forEach(([x, y, z, sp, sd]) => {
          out.push({ key: 'doc' + sd + glow, draw: (p) => T.propDoc(p, sd, glow), x, y, z, s: 0.15, flat: true, spin: sp, blob: false, order: 3 });
        });
        if (f >= 868) out.push({ key: 'x1' + q(clamp((f - 868) / 4), 2), draw: (p) => T.fxRedX(p, clamp((f - 868) / 4)), x: CASE[0] - 0.05, y: 0.04, z: CASE[2] - 0.03, s: 0.15, flat: true, spin: -0.08, blob: false, order: 4, shadow: false });
        if (f >= 873) out.push({ key: 'x2' + q(clamp((f - 873) / 4), 2), draw: (p) => T.fxRedX(p, clamp((f - 873) / 4)), x: CASE[0] + 0.06, y: 0.045, z: CASE[2] + 0.04, s: 0.15, flat: true, spin: 0.12, blob: false, order: 4, shadow: false });
      }
      break;
    }
    case 's16': {
      out.push(GLOW(T, [AG.shore[0], AG.shore[1] + 0.01, AG.shore[2]], 1.4, '255,230,180', 0.35));
      out.push(FLAT(T, 'agent', SLEEP, AG.shore, -Math.PI / 2 + 0.35, { tint: '#fff4e4', tiltX: 0.06 }));
      const seen = f >= 995, off = f >= 1003;
      const fp = [-0.5, shoreY(0.8), 0.8];
      out.push(R(T, 'fisher', { seed: 71, expr: seen ? 'shock' : 'neutral', L: seen ? 'hang' : 'net', R: off ? 'hatoff' : seen ? 'hang' : 'net', prop: off ? 'hat' : seen ? undefined : 'net', hatOff: off, look: seen ? 0.6 : 0, facing: 0, blink: seen ? 0 : B(71),
        bob: q(seen ? 0 : 0.01 * Math.sin(f * 0.3), 3), tilt: seen ? 0 : q(3 * Math.sin(f * 0.15), 1), headTilt: off ? 4 : 0 }, fp, { tint: '#fff2e0' }));
      break;
    }
    case 's17': {
      const a = f < 1036, iHas = f >= 1046 && f < 1054, gHas = f >= 1062;
      out.push(R(T, 'enemy', { seed: 81, expr: 'stern', R: a ? 'give' : 'hang', prop: a ? 'doc' : undefined, blink: B(81), look: 0.5, ...I(81) }, HQ.A));
      out.push(R(T, 'inspector', { seed: 82, expr: iHas ? 'curious' : 'neutral', R: iHas ? 'give' : 'hang', L: 'hang', prop: iHas ? 'doc' : undefined, blink: B(82), look: f < 1046 ? -0.5 : 0.5, ...I(82) }, HQ.I));
      out.push(R(T, 'general', { seed: 83, expr: gHas ? 'stern' : 'neutral', L: gHas ? 'hold' : 'hang', prop: gHas ? 'doc' : undefined, blink: B(83), look: -0.5, ...I(83) }, HQ.G));
      break;
    }
    case 's18': {
      const nod = f >= 1080 && f < 1092 ? 6 * Math.sin((f - 1080) / 12 * Math.PI * 2) : 0;
      out.push(R(T, 'inspector', { seed: 82, expr: f < 1080 ? 'curious' : 'pleased', R: 'lens', prop: 'magnifier', L: 'hold', blink: 0, look: 0, ...I(82), headTilt: q(nod, 1), bob: q(nod * 0.001, 3) }, HQ.I));
      const slam = f >= 1100, up = f >= 1093 && f < 1100;
      out.push(R(T, 'general', { seed: 83, expr: slam || up ? 'angry' : 'stern', R: slam ? 'slam' : up ? 'fist' : 'hang', L: 'hold', prop: 'doc', blink: B(83), look: 0, ...I(83), bob: slam && f < 1104 ? -0.01 : 0 }, HQ.G));
      out.push(R(T, 'enemy', { seed: 81, expr: f >= 1100 ? 'shock' : 'neutral', blink: B(81), ...I(81) }, HQ.A));
      break;
    }
    case 's19': {
      const t = pawnT(f);
      [[-0.43, -0.16, -1.45, -0.85], [0.2, -0.29, 1.35, -0.9], [0.34, 0.24, 1.4, 0.75], [-0.26, 0.29, -1.3, 0.8]].forEach(([x0, z0, x1, z1], i) => {
        const k = q(clamp(t * 1.2 - 0.05), 2); if (k <= 0) return;
        const ang = Math.atan2(x1 - x0, -(z1 - z0)), L = Math.hypot(x1 - x0, z1 - z0);
        out.push({ key: 'arr' + i + k, draw: (p) => T.fxArrow(p, '#4e6a32', k), x: (x0 + x1) / 2, y: 0.832, z: (z0 + z1) / 2, s: L / 2.25 * 1.15, flat: true, spin: -ang, blob: false, shadow: false, order: 3 });
      });
      break;
    }
    case 's19b': {
      for (let i = 0; i < 16; i++) {
        const row = Math.floor(i / 2), side = i % 2 ? 0.55 : -0.55, z = -2 - row * 1.6 - (f - 1129) * 0.05, ph = q(((f + row * 5) / 15) % 1, 2);
        out.push(R(T, 'sentry', { seed: 90 + i, back: true, step: ph, L: 'swing', R: 'swing', swing: q(Math.sin(ph * 6.283), 2) }, [side, 0, z], { s: 0.78 }));
      }
      break;
    }
    case 's20': break;
    case 's20b': {
      const lookA = q(Math.sin(f * 0.13) * 0.8, 1);
      out.push(R(T, 'sentry', { seed: 91, expr: 'shock', L: 'cheek', R: 'cheek', blink: 0, look: lookA, ...I(91) }, SENT[0]));
      out.push(R(T, 'sentry', { seed: 92, expr: f < 1215 ? 'shock' : 'blow', R: f < 1215 ? 'point' : 'mouth', prop: f < 1215 ? undefined : 'whistle', blink: 0, look: 0.3, ...I(92) }, SENT[1]));
      out.push(R(T, 'sentry', { seed: 93, expr: 'nervous', R: 'scratch', blink: B(93), look: -lookA, ...I(93) }, SENT[2]));
      break;
    }
    case 's21': case 's21b': {
      out.push({ key: 'flower', draw: (p) => T.fxFlower(p), x: 0.08, y: 0.14, z: 0.24, s: 0.2, blob: false, fixedYaw: 0.3, roll: -0.25 });
      out.push(GLOW(T, [0, 0.5, 0.05], 0.9, '255,220,170', 0.25, false));
      break;
    }
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
export const fxAt = (f, T) => {
  const S = shotAt(f), id = S.id, out = [];
  if (id === 's01') { // breach spray
    for (let i = 0; i < 7; i++) { const t = q(clamp((f + 18 - i * 3) / 42), 2); if (t < 1) out.push(FX('spl' + t, (p) => T.fxDust(p, t, '#e8f0ff'), [-12 + i * 4, 0.1 + t * 0.9, (i % 2 ? 2.7 : -2.7)], 1.3 + (i % 3) * 0.3, { tint: '#c8d6ee', alpha: 0.85 })); }
  }
  if (id === 's15' && f >= 948) { const t = q(clamp((f - 948) / 24), 2); out.push(FX('splash' + t, (p) => T.fxSplash(p, t), [AG.sea15[0], -0.2, 2.35], 2.6, { tint: '#d0dcf2' })); }
  if (id === 's03' || id === 's05') { // pipe smoke
    for (let i = 0; i < 3; i++) { const k = q(((f * 0.012) + i / 3) % 1, 2); out.push(FX('smk' + k + i, (p) => T.fxSmoke(p, k, i), [P1[0] + 0.15, 1.75 + k * 0.8, P1[2] + 0.1], 0.5, { alpha: 0.8 })); }
  }
  if (id === 's05' && f >= 328 && f < 346) { // the pipe falls out of his mouth
    const t = (f - 328) / 18, y = 1.55 - t * t * 0.75; out.push(FX('pipe', (p) => T.fxPipe(p), [P2[0] + 0.12, Math.max(0.84, y), P2[2] + 0.45], 0.18, { roll: q(t * 5, 1) }));
  }
  if (id === 's05' && f >= 346) out.push(FX('pipeDown', (p) => T.fxPipe(p), [P2[0] + 0.12, 0.84, P2[2] + 0.45], 0.18, { roll: 1.4 }));
  if (id === 's07') for (const k of [437, 452, 467]) if (f >= k - 2 && f < k + 12) { const t = q((f - k + 2) / 14, 2); out.push(FX('poof' + t, (p) => T.fxDust(p, t, '#ffffff'), [[-0.75, 0.2, -0.6][(k - 437) / 15], 1.0, 0], 0.42, { flat: true, spin: Math.PI / 2, order: 6, alpha: 0.9 })); }
  if (id === 's08' && f >= 494 && f < 506) { const t = q((f - 494) / 12, 2); out.push(FX('lampSp' + t, (p) => T.fxSpark(p, t), [-0.4, 1.2, -0.35], 0.5, { add: true })); }
  if (id === 's09') for (let i = 0; i < 3; i++) { const t = q(((f - 548) / 30 + i / 3) % 1, 2); out.push(FX('heart' + i + t, (p) => T.fxHeart(p, 1 - t), [-0.3 + i * 0.07, 0.8 + t * 0.2, 0.07 + i * 0.03], 0.06, { order: 6 })); }
  if (id === 's11' && f >= 655 && f < 684) { const t = q(((f - 655) / 14) % 1, 2); out.push(FX('ringSp' + t, (p) => T.fxSpark(p, t), [0.04, 0.87, 0.26], 0.14, { add: true })); }
  if (id === 's13' && f >= 776 && f < 788) { const t = q((f - 776) / 12, 2); out.push(FX('lockSp' + t, (p) => T.fxSpark(p, t), [0.12, 0.08, 0.3], 0.22, { add: true })); }
  if (id === 's14' && f >= 846 && f < 868) { const t = q((f - 846) / 22, 2); out.push(FX('docSp' + t, (p) => T.fxSpark(p, (t * 2) % 1), [CASE[0], 0.12, CASE[2]], 0.3, { add: true })); }
  if (id === 's16') for (let i = 0; i < 4; i++) { const ph = q((f * 0.25 + i * 1.7) % 6.283, 1); out.push(FX('gull' + ph, (p) => T.fxGull(p, ph), [-3 + i * 2.2 + (f - 976) * 0.03 * (i % 2 ? 1 : -1), 4.0 + i * 0.5 + 0.2 * Math.sin(f * 0.05 + i), -4 - i * 2], 0.7)); }
  if (id === 's17') { // the papers fly hand to hand
    const arc = (f0, a, b) => { const t = clamp((f - f0) / 10); return [lerp(a[0], b[0], t), lerp(a[1], b[1], t) + Math.sin(t * Math.PI) * 0.35, lerp(a[2], b[2], t)]; };
    if (f >= 1036 && f < 1046) out.push(FX('docfly1', (p) => T.propDoc(p, 1), arc(1036, [-0.7, 1.25, -1.45], [-0.25, 1.25, -1.5]), 0.2, { roll: q(Math.sin(f) * 0.3, 1), order: 6 }));
    if (f >= 1054 && f < 1062) out.push(FX('docfly2', (p) => T.propDoc(p, 1), arc(1054, [0.35, 1.25, -1.55], [0.8, 1.2, -1.45]), 0.2, { roll: q(Math.cos(f) * 0.3, 1), order: 6 }));
  }
  if (id === 's18' && f >= 1100 && f < 1112) { const t = q((f - 1100) / 12, 2); out.push(FX('bang' + t, (p) => T.fxBurst(p, t, '#fff3b0'), [1.45, 0.35, -1.3], 0.6)); }
  if (id === 's19b') { // dust behind the trucks + steam
    for (let i = 0; i < 4; i++) { const k = q(((f * 0.05) + i * 0.27) % 1, 2); out.push(FX('dust' + i + k, (p) => T.fxDust(p, k, '#d8c8a0'), [1.0, 0.4, -10 - i * 12 - (f - 1129) * 0.22 + 4.5], 2.0, { alpha: 0.6 })); }
    for (let i = 0; i < 3; i++) { const k = q(((f * 0.04) + i / 3) % 1, 2); out.push(FX('steam' + i + k, (p) => T.fxDust(p, k, '#efeae0'), [-38, 4.5 + k * 3, -63 - (f - 1129) * 0.35 + k * 6], 4, { alpha: 0.85 })); }
  }
  if (id === 's20b') {
    for (let i = 0; i < 3; i++) { const k = q(((f * 0.02) + i / 3) % 1, 2); out.push(FX('ddust' + i + k, (p) => T.fxDust(p, k, '#e6d2aa'), [-10 + i * 1.5, landY(66 + i * 8) + 0.6, 66 + i * 8 + (f - 1162) * 0.12], 5, { alpha: 0.7 })); }
    if (f >= 1218) { const t = q(((f - 1218) / 10) % 1, 2); out.push(FX('whistle' + t, (p) => T.fxSpark(p, t), [SENT[1][0] + 0.35, SENT[1][1] + 1.6, SENT[1][2] - 0.2], 0.35, { add: true })); }
  }
  if (id === 's21' || id === 's21b') {
    for (let i = 0; i < 3; i++) { const ph = q((f * 0.18 + i * 2.1) % 6.283, 1); out.push(FX('gullH' + ph, (p) => T.fxGull(p, ph), [-3 + i * 2.6 + (f - 1252) * 0.02, 2.4 + i * 0.6, -6 - i * 3], 0.8)); }
    for (let i = 0; i < 4; i++) { const t = ((f - 1252) * 0.008 + i / 4) % 1; out.push(FX('leaf' + (i % 2), (p) => T.fxLeaf(p, i % 2 ? '#d9a03a' : '#7aa04a'), [2.2 - t * 3.5, 3.2 - t * 3.0 + Math.sin(t * 9 + i) * 0.2, -1.6 + i * 0.6], 0.15, { roll: q(t * 8 + i, 1) })); }
  }
  return out;
};
