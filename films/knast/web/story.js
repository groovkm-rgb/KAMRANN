// Shot plan for "Aus dem Knast ausbrechen?" — timed to voice.mp3 (52.48 s) + 0.5 s tail = 1590 frames @ 30 fps.
// Phrase times (s), hand-checked against the waveform (silence gaps at -38 dB):
//  1  0.00- 1.18 Aus dem Knast ausbrechen?            |  2  1.50- 3.00 In Deutschland ist das nicht mal strafbar.
//  3  3.31- 3.83 Kein Witz.                           |  4  4.13- 6.20 Stell dir vor: Nachts. Deine Zelle.
//  5  6.60- 8.31 Der Wärter hat vergessen abzuschließen. | 6 8.67-11.15 Du rennst los – über den Hof, über die Mauer.
//  7 11.52-11.88 Frei.                                |  8 12.32-14.18 Drei Tage später schnappt dich die Polizei.
//  9 14.49-16.02 Jetzt gibt's richtig Ärger, oder?    | 10 16.46-16.71 Nö.
// 11 17.13-19.87 Für die Flucht selbst kriegst du keinen einzigen Tag extra.
// 12 20.27-23.08 Denn das deutsche Recht sagt: Jeder Mensch will frei sein.
// 13 23.33-26.49 Das ist ein Urinstinkt – und dafür bestraft man niemanden.
// 14 26.91-28.47 Aber jetzt kommt der Haken.         | 15 28.94-29.96 Gitter durchgesägt? 30.27-31.16 Sachbeschädigung.
// 16 31.62-33.26 Die Uniform vom Wärter mitgehen lassen? 33.76-34.22 Diebstahl.
// 17 34.67-36.45 Dein Kumpel hat das Fluchtauto gefahren? 36.86-37.54 Der ist dran.
// 18 38.03-39.73 Ihr wart zu dritt und habt Gewalt benutzt? 40.23-41.29 Gefangenenmeuterei.
// 19 41.80-43.08 Und deine alte Strafe? 43.55-45.03 Die sitzt du natürlich trotzdem ab.
// 20 45.35-46.45 Ausbrechen ist also erlaubt. 46.96-47.86 Du musst es nur schaffen,
// 21 47.95-49.02 ohne was kaputt zu machen, 49.34-50.15 ohne was zu klauen…
// 22 50.73-51.91 und ganz allein.
// Cuts sit inside the pauses (never mid-word). 18 and 19 are split at their question/answer pause to stay under 3.5 s.
import { M, camFromKeys, blinkAt, q, clamp, lerp, lerp3, ramp } from './motion.js';
export const FPS = 30, TOTAL = 1590;
export const SHOTS = [
  { id: 'jump', a: 0, b: 41, light: 'night', set: 'ext' },
  { id: 'land', a: 42, b: 96, light: 'night', set: 'ext' },
  { id: 'wink', a: 97, b: 120, light: 'night', set: 'ext' },
  { id: 'cell', a: 121, b: 193, light: 'cell', set: 'cell' },
  { id: 'guard', a: 194, b: 255, light: 'cell', set: 'cell' },
  { id: 'run', a: 256, b: 341, light: 'night', set: 'ext' },
  { id: 'frei', a: 342, b: 365, light: 'night', set: 'ext' },
  { id: 'police', a: 366, b: 430, light: 'day', set: 'street' },
  { id: 'court', a: 431, b: 489, light: 'court', set: 'court' },
  { id: 'noe', a: 490, b: 509, light: 'court', set: 'court' },
  { id: 'zero', a: 510, b: 603, light: 'court', set: 'court' },
  { id: 'book', a: 604, b: 697, light: 'court', set: 'court' },
  { id: 'bird', a: 698, b: 797, light: 'court', set: 'court' },
  { id: 'haken', a: 798, b: 863, light: 'tension', set: 'court' },
  { id: 'saw', a: 864, b: 943, light: 'cell', set: 'cell' },
  { id: 'uniform', a: 944, b: 1035, light: 'cell', set: 'cell' },
  { id: 'kumpel', a: 1036, b: 1136, light: 'day', set: 'street' },
  { id: 'gate', a: 1137, b: 1199, light: 'cell', set: 'cell' },
  { id: 'meuterei', a: 1200, b: 1249, light: 'cell', set: 'cell' },
  { id: 'back', a: 1250, b: 1301, light: 'cellsad', set: 'cell' },
  { id: 'sigh', a: 1302, b: 1356, light: 'cellsad', set: 'cell' },
  { id: 'tiptoe', a: 1357, b: 1436, light: 'cell', set: 'cell' },
  { id: 'vase', a: 1437, b: 1517, light: 'cell', set: 'cell' },
  { id: 'alone', a: 1518, b: 1589, light: 'night', set: 'ext' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const sm = M.smooth, eo = M.easeOut;
// stamps: word onsets of Sachbeschädigung / Diebstahl / Der ist dran / Gefangenenmeuterei
export const STAMPS = [{ f: 905, text: 'SACHBESCHÄDIGUNG', rot: -0.12 }, { f: 1010, text: 'DIEBSTAHL', rot: 0.1 }, { f: 1101, text: 'STRAFBAR', rot: -0.1 }, { f: 1204, text: 'MEUTEREI', rot: 0.09 }];
const LAND = 5; // stamp hits the screen 5 frames after it starts

// ---------- lights ----------
export const LIGHTS = {
  night: { az: -60, el: 38, sky: '#4a5f9a', ground: '#1c2034', hemi: 0.85, sun: '#9fb8ff', sunI: 1.3, fog: '#16203c', fogNear: 30, fogFar: 260,
    skyTop: '#050a1e', skyHor: '#22346a', stars: 1, sat: 1.05, vig: 0.38, shadowExt: 16, gain: '#e8eeff' },
  cell: { az: -90, el: 34, sky: '#5068a8', ground: '#1e2236', hemi: 0.55, sun: '#a8c0ff', sunI: 2.2, fog: '#10141f', fogNear: 30, fogFar: 200,
    skyTop: '#050a1e', skyHor: '#22346a', stars: 1, sat: 1.05, vig: 0.42, shadowExt: 6, gain: '#eef2ff' },
  cellsad: { az: -90, el: 34, sky: '#4a5a88', ground: '#1e2236', hemi: 0.5, sun: '#a8c0ff', sunI: 1.8, fog: '#10141f', fogNear: 30, fogFar: 200,
    skyTop: '#050a1e', skyHor: '#22346a', stars: 1, sat: 0.75, vig: 0.48, shadowExt: 6, gain: '#e6ecff' },
  day: { az: 125, el: 50, sky: '#c4d6f2', ground: '#8a8270', hemi: 1.15, sun: '#fff1dc', sunI: 2.5, fog: '#cadcf0', fogNear: 60, fogFar: 600,
    skyTop: '#3f80d4', skyHor: '#c3daf2', sat: 1.12, vig: 0.2, shadowExt: 14 },
  court: { az: 170, el: 40, sky: '#ffe2b8', ground: '#7a5038', hemi: 1.15, sun: '#ffd9a0', sunI: 2.2, fog: '#4a3020', fogNear: 60, fogFar: 300,
    skyTop: '#7fb0e8', skyHor: '#e8f2ff', sat: 1.08, vig: 0.26, shadowExt: 9, gain: '#fff4e6' },
  tension: { az: 170, el: 40, sky: '#6a2a2a', ground: '#200a0a', hemi: 0.45, sun: '#ff8a6a', sunI: 0.9, fog: '#1a0808', fogNear: 30, fogFar: 200,
    skyTop: '#3a1010', skyHor: '#5a1a1a', sat: 0.9, vig: 0.55, shadowExt: 9, gain: '#ffd8cc' },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 'haken') { const t = sm(ramp(f, 798, 806)); for (const k of ['hemi', 'sunI']) L[k] = lerp(LIGHTS.court[k], LIGHTS.tension[k], t); }
  return L;
};

// ---------- geometry anchors (match main.js) ----------
const CX = 200, SX = 400, KX = 600, KB = -5.2;
const JX = 2.4; // jump spot on the wall (left of the gatehouse)

// ---------- cameras ----------
const CAMS = {
  jump: [
    { f: 0, pos: [3.4, 4.7, 4.6], look: [2.9, 7.0, 1.0], fov: 48, roll: -4 },
    { f: 18, pos: [3.9, 3.6, 6.6], look: [3.8, 5.2, 2.2], fov: 50, roll: -1 },
    { f: 41, pos: [4.9, 1.0, 9.0], look: [5.4, 2.3, 3.8], fov: 48, roll: 2 },
  ],
  land: [
    { f: 42, pos: [5.0, 1.25, 11.2], look: [6.6, 3.0, 2], fov: 48, roll: 0 },
    { f: 96, pos: [5.2, 1.3, 10.4], look: [6.6, 3.0, 2], fov: 46, roll: 1.5 },
  ],
  wink: [
    { f: 97, pos: [6.15, 1.65, 8.0], look: [6.3, 1.6, 4.8], fov: 34 },
    { f: 104, pos: [6.2, 1.63, 7.2], look: [6.3, 1.62, 4.8], fov: 30, ease: 'easeOut' },
    { f: 120, pos: [6.22, 1.63, 7.0], look: [6.3, 1.62, 4.8], fov: 29, roll: -2 },
  ],
  cell: [
    { f: 121, pos: [CX + 1.45, 1.35, -0.35], look: [CX + 0.6, 2.25, -3.6], fov: 46, roll: 2 },
    { f: 158, pos: [CX + 1.35, 1.32, -0.4], look: [CX - 0.5, 1.3, -2.6], fov: 48 },
    { f: 193, pos: [CX + 1.2, 1.3, -0.5], look: [CX - 0.95, 1.0, -2.2], fov: 44, roll: -1.5 },
  ],
  guard: [
    { f: 194, pos: [CX - 3.6, 1.45, 3.0], look: [CX + 0.6, 1.2, 0.5], fov: 50 },
    { f: 230, pos: [CX - 2.6, 1.4, 2.9], look: [CX + 0.8, 1.15, 0.3], fov: 46 },
    { f: 255, pos: [CX + 0.05, 1.2, 0.95], look: [CX + 0.47, 1.1, 0.05], fov: 34, roll: -3 },
  ],
  run: [
    { f: 256, pos: [-12.0, 1.3, -10.0], look: [-9.0, 1.1, -7.0], fov: 48, roll: -2 },
    { f: 300, pos: [-6.0, 1.4, -8.2], look: [-3.6, 1.3, -3.4], fov: 48 },
    { f: 341, pos: [-3.4, 1.3, -6.8], look: [-2.0, 5.0, -0.8], fov: 52, roll: 3 },
  ],
  frei: [
    { f: 342, pos: [-1.7, 5.0, 3.6], look: [-2, 7.6, 0], fov: 46, roll: -3 },
    { f: 365, pos: [-1.75, 5.3, 3.0], look: [-2, 7.7, 0], fov: 42, roll: 2 },
  ],
  police: [
    { f: 366, pos: [SX - 3.5, 1.7, 11.5], look: [SX + 1.0, 1.5, 4.8], fov: 46 },
    { f: 430, pos: [SX - 2.0, 1.6, 10.2], look: [SX + 1.4, 1.4, 4.9], fov: 42, roll: 1 },
  ],
  court: [
    { f: 431, pos: [KX + 0.8, 1.2, 3.0], look: [KX, 2.2, KB + 2], fov: 40, roll: 2 },
    { f: 448, pos: [KX + 0.6, 1.3, 2.4], look: [KX, 2.2, KB + 2], fov: 38, roll: 1 },
    { f: 457, pos: [KX + 0.3, 1.4, 3.6], look: [KX - 2.4, 1.55, 0.5], fov: 40, ease: 'easeOut' },
    { f: 489, pos: [KX - 1.0, 1.5, 2.9], look: [KX - 2.4, 1.6, 0.5], fov: 32 },
  ],
  noe: [
    { f: 490, pos: [KX + 0.3, 1.95, 0.9], look: [KX, 2.15, KB + 2], fov: 36 },
    { f: 494, pos: [KX + 0.25, 2.0, 0.6], look: [KX, 2.15, KB + 2], fov: 27, ease: 'easeOut' },
    { f: 509, pos: [KX + 0.2, 2.0, 0.5], look: [KX, 2.15, KB + 2], fov: 25.5, roll: -2 },
  ],
  zero: [
    { f: 510, pos: [KX - 0.9, 1.45, 4.6], look: [KX - 2.4, 1.75, 0.5], fov: 46 },
    { f: 603, pos: [KX - 1.1, 1.4, 4.2], look: [KX - 2.4, 1.85, 0.5], fov: 50, roll: -2 },
  ],
  book: [
    { f: 604, pos: [KX + 0.9, 2.75, KB + 3.35], look: [KX + 0.9, 1.6, KB + 2.5], fov: 42 },
    { f: 650, pos: [KX + 0.9, 2.65, KB + 3.3], look: [KX + 0.9, 1.65, KB + 2.5], fov: 40 },
    { f: 697, pos: [KX + 1.0, 2.35, KB + 3.9], look: [KX + 0.8, 2.45, KB + 2.3], fov: 48, roll: 3 },
  ],
  bird: [
    { f: 698, pos: [KX - 2.0, 1.6, 3.8], look: [KX - 6.3, 1.85, 0.7], fov: 44 },
    { f: 797, pos: [KX - 2.3, 1.7, 3.4], look: [KX - 6.6, 2.3, 0.6], fov: 42, roll: -2 },
  ],
  haken: [
    { f: 798, pos: [KX + 0.15, 1.7, 2.6], look: [KX, 2.15, KB + 2], fov: 38 },
    { f: 836, pos: [KX + 0.12, 1.85, 0.6], look: [KX, 2.15, KB + 2], fov: 55.7 },
    { f: 841, pos: [KX + 0.1, 1.95, 0.0], look: [KX, 2.2, KB + 2], fov: 42, ease: 'easeOut' },
    { f: 863, pos: [KX + 0.1, 1.95, -0.1], look: [KX, 2.2, KB + 2], fov: 40, roll: -4 },
  ],
  saw: [
    { f: 864, pos: [CX + 0.6, 1.3, 2.7], look: [CX - 0.15, 1.15, -0.3], fov: 44 },
    { f: 903, pos: [CX + 0.5, 1.3, 2.2], look: [CX - 0.15, 1.15, -0.3], fov: 42 },
    { f: 908, pos: [CX + 0.4, 1.35, 1.5], look: [CX - 0.1, 1.2, -0.3], fov: 38, ease: 'easeOut' },
    { f: 943, pos: [CX + 0.38, 1.35, 1.45], look: [CX - 0.1, 1.2, -0.3], fov: 36, roll: 3 },
  ],
  uniform: [
    { f: 944, pos: [CX + 6.0, 1.4, 1.4], look: [CX + 2.6, 1.3, 1.6], fov: 46 },
    { f: 1008, pos: [CX + 5.2, 1.45, 1.45], look: [CX + 2.6, 1.35, 1.6], fov: 42 },
    { f: 1013, pos: [CX + 4.5, 1.5, 1.5], look: [CX + 2.6, 1.45, 1.6], fov: 36, ease: 'easeOut' },
    { f: 1035, pos: [CX + 4.4, 1.5, 1.5], look: [CX + 2.6, 1.45, 1.6], fov: 34, roll: -3 },
  ],
  kumpel: [
    { f: 1036, pos: [SX + 4.5, 1.5, 9.5], look: [SX + 0.5, 1.3, 1.0], fov: 44 },
    { f: 1088, pos: [SX + 3.0, 1.45, 8.6], look: [SX + 0.6, 1.25, 1.0], fov: 40 },
    { f: 1097, pos: [SX + 7.0, 1.6, 9.5], look: [SX + 9.5, 1.5, 4.6], fov: 44, ease: 'easeOut' },
    { f: 1104, pos: [SX + 7.4, 1.6, 8.8], look: [SX + 9.5, 1.55, 4.6], fov: 38, ease: 'easeOut' },
    { f: 1136, pos: [SX + 7.5, 1.6, 8.6], look: [SX + 9.5, 1.55, 4.6], fov: 36, roll: 3 },
  ],
  gate: [
    { f: 1137, pos: [CX - 11.2, 1.55, 1.9], look: [CX - 7.4, 1.4, 1.6], fov: 50 },
    { f: 1199, pos: [CX - 10.6, 1.5, 1.8], look: [CX - 7.4, 1.35, 1.6], fov: 46, roll: 2 },
  ],
  meuterei: [
    { f: 1200, pos: [CX - 10.0, 1.6, 1.7], look: [CX - 7.2, 1.4, 1.6], fov: 52 },
    { f: 1205, pos: [CX - 9.6, 1.6, 1.7], look: [CX - 7.2, 1.4, 1.6], fov: 42, ease: 'easeOut' },
    { f: 1249, pos: [CX - 9.4, 1.6, 1.7], look: [CX - 7.2, 1.45, 1.6], fov: 39, roll: -3 },
  ],
  back: [
    { f: 1250, pos: [CX + 0.9, 1.5, 2.9], look: [CX - 0.1, 1.25, -2.0], fov: 52 },
    { f: 1301, pos: [CX + 0.7, 1.45, 2.4], look: [CX - 0.1, 1.2, -2.2], fov: 46, roll: -1 },
  ],
  sigh: [
    { f: 1302, pos: [CX + 0.55, 1.2, -0.25], look: [CX - 0.85, 1.0, -2.3], fov: 46 },
    { f: 1345, pos: [CX + 0.45, 1.2, -0.45], look: [CX - 0.85, 1.0, -2.3], fov: 42 },
    { f: 1356, pos: [CX + 0.44, 1.2, -0.5], look: [CX - 0.85, 1.0, -2.3], fov: 41 },
  ],
  tiptoe: [
    { f: 1357, pos: [CX + 3.6, 1.2, 2.8], look: [CX + 0.9, 1.1, 0.5], fov: 50 },
    { f: 1436, pos: [CX + 3.3, 1.25, 2.7], look: [CX + 1.6, 1.15, 1.2], fov: 46, roll: 2 },
  ],
  vase: [
    { f: 1437, pos: [CX + 10.6, 1.35, 1.75], look: [CX + 5.2, 1.2, 1.75], fov: 50 },
    { f: 1517, pos: [CX + 10.0, 1.35, 1.75], look: [CX + 6.0, 1.25, 1.75], fov: 50, roll: -2 },
  ],
  alone: [
    { f: 1518, pos: [-1.5, 4.5, 9.5], look: [-2, 7.3, 0], fov: 32 },
    { f: 1589, pos: [-0.5, 2.2, 26.0], look: [-2, 8.4, 0], fov: 40, roll: -1.5 },
  ],
};
const KICKS = [{ f: 44, a: 0.05 }, { f: 494, a: 0.02 }, ...STAMPS.map((s) => ({ f: s.f + LAND, a: 0.05 })), { f: 838, a: 0.03 }, { f: 1348, a: 0.05 }, { f: 572, a: 0.02 }, { f: 1078, a: 0.03 }];
export const camAt = (f) => {
  const S = shotAt(f), K = CAMS[S.id];
  const c = camFromKeys(K, f, { creep: 0.0016, kicks: KICKS });
  // handheld drift so no frame is ever frozen
  const k = 0.012; c.look = [c.look[0] + k * Math.sin(f * 0.07), c.look[1] + k * Math.sin(f * 0.09 + 1), c.look[2]];
  c.flash = 0;
  if (S.id === 'zero' && f >= 572 && f < 577) { c.flash = 0.5 * (1 - (f - 572) / 5); c.flashCol = '#fff2b0'; }
  if (S.id === 'haken' && f >= 798 && f < 802) { c.flash = 0.35 * (1 - (f - 798) / 4); c.flashCol = '#ff3030'; }
  for (const st of STAMPS) if (f >= st.f + LAND && f < st.f + LAND + 3) { c.flash = 0.22 * (1 - (f - st.f - LAND) / 3); c.flashCol = '#ff4040'; }
  if (S.set === 'cell') c.shadowAt = [CX, 1, -1.5];
  if (S.set === 'ext') c.shadowAt = [c.look[0], 2, Math.min(c.look[2], 2)];
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  const P = { jump: heroPos(f), land: [6, 1.4, 4.6], wink: [6.3, 1.6, 4.8], cell: [CX - 1.2, 1, -2], guard: [CX + 0.5, 1.2, 0.3], run: heroPos(f), frei: [-2, 7.6, 0],
    police: [SX + 1, 1.3, 5], court: f < 455 ? [KX, 2.2, KB + 2] : [KX - 2.4, 1.5, 0.5], noe: [KX, 2.2, KB + 2], zero: [KX - 2.4, 1.5, 0.5], book: [KX + 0.9, 1.65, KB + 2.45], bird: [KX - 5.4, 1.6, 1.9],
    haken: [KX, 2.2, KB + 2], saw: [CX - 0.05, 1.8, -0.2], uniform: [CX + 2.6, 1.3, 1.6], kumpel: f < 1095 ? [SX + 0.5, 1.4, 1.0] : [SX + 9.5, 1.4, 4.6], gate: [CX - 7.6, 1.3, 1.6],
    meuterei: [CX - 7.6, 1.3, 1.6], back: [CX - 0.2, 1.2, -1.5], sigh: [CX - 0.95, 1.0, -2.2], tiptoe: heroPos(f), vase: heroPos(f), alone: [-2, 7.5, 0] }[S.id];
  return { focus: dist(C.pos, P), cinf: S.id === 'alone' ? 0 : S.set === 'cell' ? 7 : 9, near: 0.6 };
};

// ---------- hero path helpers ----------
function heroPos(f) {
  const S = shotAt(f);
  if (S.id === 'jump') { const t = clamp(0.12 + (f - 2) / 46); return [JX + 3.0 * t, Math.max(0, 6.8 + 4.2 * t - 11 * t * t), 0.5 + 4.1 * t]; }
  if (S.id === 'run') {
    if (f < 312) { const t = (f - 256) / (312 - 256); return [lerp(-11, -2, t), 0, lerp(-7.5, -1.0, sm(t))]; }
    const t = clamp((f - 312) / 30); return [-2, 6.0 * sm(t) * 0.9, -0.75];
  }
  if (S.id === 'tiptoe') { const t = clamp((f - 1362) / 70); return [CX + lerp(0.9, 2.2, t), 0, lerp(-0.9, 1.5, sm(clamp(t * 1.4)))]; }
  if (S.id === 'vase') { const t = clamp((f - 1437) / 80); return [CX + lerp(2.6, 7.6, t), 0, 1.75]; }
  return [0, 0, 0];
}

// ---------- world state ----------
const searchSweep = (f, x0, x1, per, y, z) => { const t = 0.5 + 0.5 * Math.sin(f / per * Math.PI * 2); return [lerp(x0, x1, t), y, z]; };
export const worldAt = (f) => {
  const S = shotAt(f), W = { set: S.set, hud: [], shake: [0, 0] };
  if (S.set === 'ext') {
    W.moon = { dir: S.id === 'frei' ? [-0.09, 0.78, -1] : S.id === 'alone' ? [-0.05, 0.36, -1] : S.id === 'run' ? [0.35, 0.5, 1] : [-0.45, 0.5, -1], size: S.id === 'frei' ? 150 : S.id === 'alone' ? 110 : 90 };
    if (S.id === 'jump') W.search = { target: [lerp(-25, 30, sm(f / 41)), 40, -12], k: 0.6, i: 0 };
    else if (S.id === 'run') W.search = { target: f < 312 ? [heroPos(f)[0] - 2.6 + 0.6 * Math.sin(f * 0.2), 0, heroPos(f)[2] - 1.0] : [8, 0, -6], k: 0.4, i: 1600 };
    else W.search = { target: searchSweep(f, -30, 30, 140, 0, -18), k: 0.3, i: 900 };
    W.points = [{ pos: [8, 7.4, 2.6], col: '#dfe6ff', i: 5, d: 10 }];
  }
  if (S.set === 'cell') {
    W.moon = { dir: [0.18, 0.2, -1], size: 60 };
    W.points = [{ pos: [CX, 2.75, 1.6], col: '#b9d4ff', i: 7, d: 12 }, { pos: [CX + 8, 2.75, 1.6], col: '#b9d4ff', i: 6, d: 10 }, { pos: [CX - 8, 2.75, 1.6], col: '#b9d4ff', i: 6, d: 10 }];
    W.door = 0; W.tally = [24, 0, 1];
    if (S.id === 'guard') W.door = f < 214 ? 0 : 0.22 * sm(ramp(f, 214, 224)) - 0.03 * Math.sin(ramp(f, 224, 240) * Math.PI);
    if (S.id === 'saw') W.sawBar = f < 900 ? { dx: 0 } : { dx: 0.05 * ramp(f, 900, 914), dy: 0.85 * (ramp(f, 900, 912) ** 2), rz: -0.9 * ramp(f, 900, 914), dz: -0.1 * ramp(f, 900, 914) };
    else if (['uniform', 'gate', 'meuterei', 'back', 'sigh', 'tiptoe', 'vase'].includes(S.id)) W.sawBar = {};
    if (S.id === 'uniform') W.capProp = false;
    if (S.id === 'gate') { W.gateShake = 0.04 * Math.sin(f * 1.7) * (f > 1145 ? 1 : 0); }
    if (S.id === 'meuterei') { W.gate = -0.9 * eo(ramp(f, 1203, 1212)); }
    if (S.id === 'back') { W.door = 1.4 - 1.25 * sm(ramp(f, 1270, 1300)); W.tally = [24, 0, 1]; }
    if (S.id === 'sigh') { W.door = 0.15 - 0.15 * eo(ramp(f, 1344, 1348)); W.tally = [24, 1, sm(ramp(f, 1308, 1325))]; }
    if (S.id === 'tiptoe') W.door = 1.35;
    if (S.id === 'vase') W.door = 1.35;
  }
  if (S.set === 'street') {
    if (S.id === 'police') { const t = eo(ramp(f, 366, 392)); W.police = { x: lerp(-16, 2.2, t), z: 2.2, bounce: f > 392 && f < 398 ? 0.03 * Math.sin((f - 392) * 2) : 0 }; W.blue = true; W.brake = f > 385; }
    if (S.id === 'kumpel') { const drive = f < 1078; W.getaway = { x: (drive ? lerp(-3.5, 0.6, eo(ramp(f, 1036, 1078))) : 0.6), z: 1.0, bounce: drive ? 0.02 * Math.sin(f * 2.1) : 0 };
      W.police = { x: (f < 1095 ? lerp(-12, -5.5, eo(ramp(f, 1050, 1080))) : 12.5), z: f < 1095 ? 1.5 : 2.0, ry: 0 }; W.blue = true; W.brake = f > 1070; }
  }
  if (S.set === 'court') {
    if (S.id === 'book') { W.bookOpen = sm(ramp(f, 618, 650)); W.glow = sm(ramp(f, 630, 650)) * (1 - 0.6 * ramp(f, 670, 697)); }
    W.points = S.id === 'haken' ? [{ pos: [KX, 4.5, KB + 4.5], col: '#ff6a4a', i: 25 * sm(ramp(f, 798, 806)), d: 10 }] : [{ pos: [KX, 5.5, 0], col: '#ffd9a0', i: 10, d: 16 }];
  }
  // HUD
  if (S.id === 'zero' && f >= 572) W.hud.push({ type: 'big', text: '0 TAGE', t: (f - 572) / 32 });
  for (const st of STAMPS) if (f >= st.f && f < st.f + 30) {
    W.hud.push({ type: 'stamp', text: st.text, t: (f - st.f) / 30, rot: st.rot });
    const d = f - st.f - LAND; if (d >= 0 && d < 7) { const a = 18 * (1 - d / 7); W.shake = [Math.round((d % 2 ? -1 : 1) * a), Math.round((d % 3 - 1) * a * 0.6)]; }
  }
  return W;
};

// ---------- actors (2D cards) ----------
const A = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.castFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const bl = blinkAt;
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const hero = (o, pos, extra) => out.push(A(T, 'con', { seed: 3, blink: bl(f, 3), ...o }, pos, extra));
  switch (S.id) {
    case 'jump': {
      const p = heroPos(f), air = f > 2;
      hero({ expr: air ? 'joy' : 'sneaky', legs: air ? 'tuck' : 'squat', L: air ? 'flail' : 'hang', R: air ? 'flail' : 'hang', wv: q(f * 0.6, 1), blink: 0 }, p, { ground: 0 });
      break;
    }
    case 'land': {
      const sq = f < 52, shrug = f > 60;
      hero({ expr: sq ? 'joy' : shrug ? 'smug' : 'grin', legs: sq ? 'squat' : 'stand', L: shrug ? 'shrug' : 'hang', R: shrug ? 'shrug' : 'hang', look: 0, tilt: shrug ? q(3 * Math.sin((f - 60) * 0.25), 1) : 0, headTilt: shrug ? 6 : 0, bob: sq ? 0.03 : 0 }, [6.0, 0, 4.6], { ground: 0 });
      break;
    }
    case 'wink': hero({ expr: f >= 106 && f < 116 ? 'wink' : 'smug', headTilt: q(4 * Math.sin(f * 0.2), 1), blink: 0 }, [6.3, 0, 4.8]); break;
    case 'cell': hero({ expr: f < 165 ? 'smug' : 'sneaky', legs: 'sit', L: 'head', R: 'head', look: f > 165 ? 0.6 : 0, headTilt: q(3 * Math.sin(f * 0.08), 1) }, [CX - 0.95, 0.05, -2.2], { ground: 0 }); break;
    case 'guard': {
      const t = clamp((f - 194) / 46), x = CX + lerp(-2.4, 2.8, t), ph = ((f - 194) / 22) % 1;
      if (f < 246) out.push(A(T, 'guard', { seed: 8, expr: f < 222 ? 'yawn' : 'sleepy', L: f < 222 ? 'mouth' : 'hang', legs: 'walk', step: q(ph), swing: q(f * 0.5, 1), facing: 1, blink: 0 }, [x, 0, 1.75], { ground: 0 }));
      hero({ expr: 'sneaky', legs: 'sit', L: 'head', R: 'head', look: 0.5 }, [CX - 0.95, 0.05, -2.2]);
      break;
    }
    case 'run': {
      const p = heroPos(f), climbing = f >= 312;
      hero(climbing ? { expr: 'push', legs: 'climb', step: q(((f - 312) / 14) % 1), L: 'reach', R: f % 14 < 7 ? 'reach' : 'hang', blink: 0 } :
        { expr: 'focus', legs: 'run', step: q(((f - 256) / 12) % 1), L: 'run', R: 'run', facing: 1, blink: 0 }, climbing ? [p[0], p[1], -0.72] : p, { ground: 0 });
      break;
    }
    case 'frei': hero({ expr: 'joy', L: 'up', R: 'up', legs: 'wide', bob: q(0.01 * Math.abs(Math.sin(f * 0.4)), 3) }, [-2, 6.8, -0.1], { ground: 6.8 }); break;
    case 'police': {
      const caught = f >= 404;
      hero({ expr: f < 392 ? 'smug' : caught ? 'sigh' : 'shock', L: caught ? 'cuffs' : f < 392 ? 'hang' : 'up', R: caught ? 'cuffs' : f < 392 ? 'hang' : 'up', legs: f < 392 ? 'walk' : 'stand', step: f < 392 ? q(((f - 366) / 20) % 1) : 0, cuffs: f >= 412 },
        [SX + (f < 392 ? lerp(-0.4, 1.0, (f - 366) / 26) : 1.0), 0.15, 5.0], { ground: 0.15 });
      if (f >= 392) out.push(A(T, 'police', { seed: 12, expr: 'stern', R: caught ? 'cuffs' : 'point', L: 'hang', facing: 1, blink: bl(f, 12), legs: f < 404 ? 'walk' : 'stand', step: f < 404 ? q(((f - 392) / 16) % 1) : 0 },
        [SX + lerp(-0.6, 0.15, eo(ramp(f, 392, 406))), 0.15, 4.75], { ground: 0.15 }));
      break;
    }
    case 'court': case 'noe': case 'zero': case 'haken': {
      const jo = { seed: 21, expr: 'stern', blink: bl(f, 21), L: 'hang', R: 'hang' };
      if (S.id === 'noe') Object.assign(jo, { expr: 'deadpan', L: 'shrug', R: 'shrug', headTilt: q(5 * eo(ramp(f, 490, 497)), 1) });
      if (S.id === 'haken') Object.assign(jo, { expr: f < 830 ? 'stern' : 'angry', R: f >= 828 ? 'finger' : 'hang', blink: 0 });
      if (S.id === 'zero') Object.assign(jo, { expr: f < 560 ? 'deadpan' : 'smile' });
      out.push(A(T, 'judge', jo, [KX, 0.8, KB + 2.0], { ground: 0.8, blob: false }));
      if (S.id !== 'haken') {
        let ho = { expr: 'sweat', sweat: q(((f * 0.03) % 1), 2), L: 'hang', R: 'hang', blink: bl(f, 3) };
        let y = 0;
        if (S.id === 'noe') ho = { expr: 'shock', L: 'cheek', R: 'cheek', blink: 0 };
        if (S.id === 'zero') { const jumpT = f - 574; ho = f < 574 ? { expr: 'shock', L: 'hang', R: 'hang', look: -0.4, blink: 0 } : { expr: 'joy', L: 'up', R: 'up', legs: jumpT % 18 < 9 ? 'tuck' : 'stand', blink: 0 };
          if (f >= 574) y = 0.45 * Math.abs(Math.sin((f - 574) / 18 * Math.PI)); }
        hero(ho, [KX - 2.4, y, 0.5], { ground: 0 });
      }
      break;
    }
    case 'bird': hero({ expr: f < 740 ? 'awe' : 'smile_closed', look: -0.7, headTilt: q(-4 + 2 * Math.sin(f * 0.1), 1), L: 'hang', R: 'hang' }, [KX - 5.4, 0, 1.9], { ground: 0 }); break;
    case 'saw': {
      const sawing = f < 900, sx = sawing ? 14 * Math.sin(f * 0.9) : 0;
      hero({ expr: sawing ? 'focus' : f < 912 ? 'shock' : 'nervous', R: sawing ? 'saw' : 'cheek', L: sawing ? 'hang' : 'cheek', sawA: q(-8 + sx * 0.2, 1), sawX: q(sx, 1), blink: 0, facing: 1 }, [CX - 0.5, 0, -0.45], { ground: 0 });
      break;
    }
    case 'uniform': hero({ expr: f < 975 ? 'grin' : f < 1012 ? 'smug' : 'shock', L: f > 960 && f < 1010 ? 'salute' : 'hang', capLift: f > 980 && f < 1005 ? 0.15 : 0, blink: 0 }, [CX + 2.6, 0, 1.6], { ground: 0 });
      out[out.length - 1] = A(T, 'disguise', { seed: 3, expr: f < 975 ? 'grin' : f < 1012 ? 'smug' : 'shock', L: f > 960 && f < 1010 ? 'salute' : 'hang', R: 'hang', blink: 0, tilt: q(2 * Math.sin(f * 0.15), 1) }, [CX + 2.6, 0, 1.6], { ground: 0 });
      break;
    case 'kumpel': {
      if (f < 1095) { const g = 1036; out.push(A(T, 'kumpel', { seed: 31, expr: 'smug', L: 'wheel', R: 'wheel', headTilt: q(3 * Math.sin(f * 0.3), 1), blink: 0 }, [SX + (f < 1078 ? lerp(-3.5, 0.6, eo(ramp(f, 1036, 1078))) : 0.6) + 0.05, 0.12 + (f < 1078 ? 0.02 * Math.sin(f * 2.1) : 0), 1.0 - 0.35], { ground: 0, blob: false, order: 1 })); }
      else {
        out.push(A(T, 'kumpel', { seed: 31, expr: 'sigh', L: 'cuffs', R: 'cuffs', cuffs: true, blink: bl(f, 31) }, [SX + 9.3, 0.15, 4.75], { ground: 0.15 }));
        out.push(A(T, 'police', { seed: 12, expr: 'stern', L: 'hang', R: 'hip', blink: bl(f, 12), facing: -1 }, [SX + 10.4, 0.15, 4.5], { ground: 0.15 }));
      }
      break;
    }
    case 'gate': case 'meuterei': {
      const burst = S.id === 'meuterei' && f >= 1205, ex = burst ? 'joy' : 'push';
      const sh = (k) => (S.id === 'gate' ? 0.03 * Math.sin(f * 1.7 + k) : 0);
      const fx = burst ? lerp(0, 0.9, eo(ramp(f, 1205, 1220))) : 0;
      out.push(A(T, 'con2', { seed: 41, expr: ex, L: burst ? 'up' : 'push', R: burst ? 'up' : 'push', blink: 0 }, [CX - 8.45 + sh(0) + fx, 0, 1.0], { ground: 0 }));
      out.push(A(T, 'con', { seed: 3, expr: ex, L: burst ? 'up' : 'push', R: burst ? 'up' : 'push', blink: 0 }, [CX - 8.35 + sh(1) + fx, 0, 1.75], { ground: 0 }));
      out.push(A(T, 'con3', { seed: 43, expr: ex, L: burst ? 'up' : 'push', R: burst ? 'up' : 'push', blink: 0 }, [CX - 8.45 + sh(2) + fx, 0, 2.5], { ground: 0 }));
      break;
    }
    case 'back': {
      const t = clamp((f - 1250) / 22);
      hero({ expr: 'sigh', legs: t < 1 ? 'walk' : 'stand', step: t < 1 ? q(((f - 1250) / 20) % 1) : 0, blink: bl(f, 3) }, [CX + lerp(1.0, 0.0, t), 0, lerp(1.2, -1.6, sm(t))], { ground: 0 });
      break;
    }
    case 'sigh': hero({ expr: f > 1326 && f < 1342 ? 'sighO' : 'sigh', legs: 'sit', L: 'hang', R: 'hang', bob: f > 1326 && f < 1342 ? -0.015 : 0, blink: bl(f, 3) }, [CX - 0.95, 0.05, -2.2], { ground: 0 }); break;
    case 'tiptoe': { const p = heroPos(f); hero({ expr: f < 1395 ? 'sneaky' : 'hold', puff: f < 1395 ? 0 : 1, legs: 'tiptoe', step: q(((f - 1357) / 26) % 1), L: 'sneak', R: 'sneak', look: q(Math.sin(f * 0.08), 1), blink: 0 }, p, { ground: 0 }); break; }
    case 'vase': { const p = heroPos(f); hero({ expr: 'hold', puff: q(0.8 + 0.2 * Math.sin(f * 0.3), 2), legs: 'tiptoe', step: q(((f - 1437) / 26) % 1), L: 'sneak', R: 'sneak', look: q(0.8 * Math.sin(f * 0.07), 1), blink: 0 }, p, { ground: 0 }); break; }
    case 'alone': hero({ expr: 'smile_closed', L: 'hang', R: 'hang' }, [-2, 6.8, -0.1], { ground: 6.8 }); break;
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (S.id === 'land' && f < 60) { const t = q((f - 44) / 16); if (t >= 0) out.push(FX('dust' + t, (p) => T.fxDust(p, t, '#9aa0b4'), [6.0, -0.75, 4.4], 0.75, { order: 1 })); }
  if (S.id === 'wink' && f >= 105 && f < 118) { const t = q((f - 105) / 13); out.push(FX('spark' + t, (p) => T.fxSpark(p, t), [6.65, 1.25, 5.0], 0.22)); }
  if (S.id === 'zero' && f >= 574) { const t = q(clamp((f - 574) / 28)); out.push(FX('pop' + t, (p) => T.fxPop(p, t), [KX - 2.4, 0.4, 0.3], 2.2, { order: 1 })); }
  if (S.id === 'book' && f >= 652) { const t = (f - 652) / 45; out.push(FX('bird' + q((f * 0.18) % 1), (p) => T.fxBird(p, (f * 0.18) % 1), [KX + 0.9 - 0.15 * t, 1.62 - 0.6 + 0.8 * eo(t), KB + 2.45 - 0.2 * t], 0.55, { flip: true })); }
  if (S.id === 'bird') { const t = clamp((f - 706) / 70); const w = f < 706 ? 0 : (f * 0.2) % 1;
    out.push(FX('bird' + q(w), (p) => T.fxBird(p, w), [KX - 6.6 - 3.8 * Math.pow(t, 1.6), 1.38 - 0.82 + 2.2 * Math.sqrt(t), 0.5 - 0.4 * t], 0.8, { flip: true, order: 3 })); }
  if (S.id === 'saw' && f < 900) { const t = q(((f - 864) / 9) % 1); out.push(FX('sparks' + t, (p) => T.fxSparks(p, t, Math.floor(f / 9)), [CX + 0.06, 0.48, 0.1], 0.55)); }
  if (S.id === 'sigh' && f >= 1326 && f < 1350) { const t = q((f - 1326) / 24); out.push(FX('sigh' + t, (p) => T.fxSigh(p, t), [CX - 1.05, 1.15, -2.0], 0.45)); }
  if (S.id === 'meuterei' && f >= 1205 && f < 1225) { const t = q((f - 1205) / 20); out.push(FX('dustm' + t, (p) => T.fxDust(p, t, '#c9c4b8'), [CX - 7.6, -0.6, 1.6], 0.9, { order: 1 })); }
  if (S.id === 'kumpel' && f >= 1072 && f < 1094) { const t = q((f - 1072) / 22); out.push(FX('dustk' + t, (p) => T.fxDust(p, t, '#d8d4cc'), [SX - 1.2, 0, 1.6], 1.0)); }
  return out;
};
