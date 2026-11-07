// Shot plan: "Der Mann, der den Eiffelturm verkaufte" — timed to voice.mp3 (51.17 s) + 0.5 s tail, 30 fps.
// Phrase times (s, whisper-small de + silence check, hand-fixed):
//  1 0.06-1.38 Ein Mann hat den Eiffelturm verkauft. | 2 1.58-2.10 Als Schrott. | 3 2.28-5.66 Er liest in der Zeitung: Der Turm ist marode, die Reparatur kostet ein Vermögen.
//  4 5.86-6.84 Und er hat eine Idee. | 5 6.96-8.44 Er fälscht Papiere vom Ministerium, | 6 8.74-9.98 mietet sich in ein Luxushotel ein
//  7 10.02-11.98 und lädt die größten Schrotthändler der Stadt ein. | 8 12.24-15.16 Dann flüstert er: Der Staat will den Turm loswerden. | 9 15.30-16.22 Streng geheim.
// 10 16.42-17.32 Einer beißt an. | 11 17.61-19.22 Aber der Händler wird misstrauisch. | 12 19.52-22.69 Und jetzt kommt der Geniestreich: Der Betrüger verlangt Schmiergeld.
// 13 22.97-26.84 Der Händler denkt: Ein Beamter, der Schmiergeld will? Der muss echt sein. | 14 27.14-30.72 Er zahlt. Den Kaufpreis – und das Schmiergeld obendrauf.
// 15 31.07-33.29 Da sitzt der Betrüger schon im Zug, weit weg. | 16 33.68-37.32 Und der Händler? Der schämt sich so, dass er nicht mal zur Polizei geht.
// 17 37.44-38.83 Also kommt der Betrüger zurück … | 18 39.53-40.98 und zieht dieselbe Nummer nochmal ab. | 19 41.32-43.01 Diesmal geht das Opfer zur Polizei.
// 20 43.28-44.34 Er haut trotzdem ab. | 21 44.57-47.92 Am Ende landet er doch hinter Gittern – im härtesten Gefängnis Amerikas.
// 22 48.27-49.50 Aber nicht wegen des Eiffelturms … | 23 49.74-50.76 sondern wegen Falschgeld.
// Cuts sit in the silences between phrases (or between the two halves of a long sentence), never inside a word.
import { M, clamp, lerp, lerp3, ramp, camFromKeys, blinkAt, idle, walk, q } from './motion.js';
export const FPS = 30, TOTAL = 1550;
const GR = 6, TER = GR + 20.2, TZ = -262;
export const SHOTS = [
  { id: 'hook', a: 0, b: 44, light: 'sunset', set: 'paris' },
  { id: 'scrap', a: 45, b: 66, light: 'sunset', set: 'paris' },
  { id: 'cafe', a: 67, b: 94, light: 'morning', set: 'cafe' },
  { id: 'paper', a: 95, b: 172, light: 'morning', set: 'cafe' },
  { id: 'idea', a: 173, b: 205, light: 'morning', set: 'cafe' },
  { id: 'forge', a: 206, b: 257, light: 'desk', set: 'forge' },
  { id: 'lobby', a: 258, b: 299, light: 'lobby', set: 'lobby' },
  { id: 'table', a: 300, b: 362, light: 'salon', set: 'salon' },
  { id: 'whisper', a: 363, b: 457, light: 'tense', set: 'salon' },
  { id: 'secret', a: 458, b: 488, light: 'tense', set: 'salon' },
  { id: 'bite', a: 489, b: 523, light: 'tense', set: 'salon' },
  { id: 'peek', a: 524, b: 581, light: 'corridor', set: 'corridor' },
  { id: 'genius', a: 582, b: 684, light: 'study', set: 'study' },
  { id: 'thinks', a: 685, b: 774, light: 'study', set: 'study' },
  { id: 'bulb', a: 775, b: 809, light: 'study', set: 'study' },
  { id: 'pay', a: 810, b: 837, light: 'study', set: 'study' },
  { id: 'pocket', a: 838, b: 926, light: 'study', set: 'study' },
  { id: 'train', a: 927, b: 1004, light: 'station', set: 'station' },
  { id: 'yard', a: 1005, b: 1037, light: 'yard', set: 'scrap' },
  { id: 'shame', a: 1038, b: 1121, light: 'office', set: 'scrap' },
  { id: 'back', a: 1122, b: 1175, light: 'station', set: 'station' },
  { id: 'again', a: 1176, b: 1235, light: 'tense', set: 'salon' },
  { id: 'police', a: 1236, b: 1293, light: 'police', set: 'police' },
  { id: 'escape', a: 1294, b: 1333, light: 'night', set: 'paris' },
  { id: 'island', a: 1334, b: 1385, light: 'sea', set: 'island' },
  { id: 'cellblock', a: 1386, b: 1442, light: 'cells', set: 'cells' },
  { id: 'souvenir', a: 1443, b: 1490, light: 'cell', set: 'cells' },
  { id: 'press', a: 1491, b: 1526, light: 'press', set: 'press' },
  { id: 'wink', a: 1527, b: 1549, light: 'cell', set: 'cells' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const S_ = Object.fromEntries(SHOTS.map((s) => [s.id, s]));

// ---------- lights ----------
const base = { hemi: 1.1, sunI: 2.4, sat: 1.06, vig: 0.3, shadowExt: 6, sepia: 0.14, grain: 0.035, fogNear: 60, fogFar: 600 };
export const LIGHTS = {
  sunset: { ...base, az: -95, el: 7, sky: '#e2a8b0', ground: '#6a4a40', sun: '#ffb070', sunI: 2.5, fog: '#eaa98a', fogNear: 160, fogFar: 1700, skyTop: '#5a5a9a', skyHor: '#ffb27a',
    sunDisc: '#fff0c8', sunSize: 0.004, gain: '#fff0e0', shadowExt: 14, clouds: 1, waterDeep: '#6a5a8a', waterShal: '#e8a080', glint: '#ffe0b0', sepia: 0.1 },
  morning: { ...base, az: 135, el: 28, sky: '#f2e2c4', ground: '#8a7058', hemi: 1.15, sun: '#ffe6bc', sunI: 2.5, fog: '#e8d8c0', fogNear: 30, fogFar: 300, skyTop: '#8fb0d8', skyHor: '#f4e2c8', gain: '#fff4e4', shadowExt: 5 },
  desk: { ...base, az: 60, el: 50, sky: '#3a4470', ground: '#1a1420', hemi: 0.42, sun: '#7f8fd0', sunI: 0.5, fog: '#14121c', fogNear: 20, fogFar: 60, skyTop: '#0a0c18', skyHor: '#1a2040', gain: '#ffe8cc', vig: 0.5, shadowExt: 2.5, sepia: 0.12, pointK: 1.3 },
  lobby: { ...base, az: 100, el: 55, sky: '#fff0d8', ground: '#a88a6a', hemi: 1.2, sun: '#ffe6c0', sunI: 1.6, fog: '#e8d8c0', fogNear: 30, fogFar: 120, skyTop: '#fff0d8', skyHor: '#fff0d8', gain: '#fff2e2', shadowExt: 9 },
  salon: { ...base, az: -80, el: 35, sky: '#ffe2c0', ground: '#7a5040', hemi: 1.05, sun: '#ffd8a8', sunI: 1.8, fog: '#d8c0a0', fogNear: 20, fogFar: 90, skyTop: '#ffe8c8', skyHor: '#ffe8c8', gain: '#fff0dc', shadowExt: 6 },
  tense: { ...base, az: -80, el: 60, sky: '#7a5a50', ground: '#2a1a18', hemi: 0.45, sun: '#ffd8a8', sunI: 0.55, fog: '#2a1c18', fogNear: 15, fogFar: 60, skyTop: '#2a1c18', skyHor: '#2a1c18', gain: '#ffe8cc', vig: 0.55, shadowExt: 5, pointK: 2.2 },
  corridor: { ...base, az: 40, el: 60, sky: '#a89070', ground: '#3a2a20', hemi: 0.6, sun: '#ffd8a0', sunI: 0.6, fog: '#3a2a20', fogNear: 8, fogFar: 40, skyTop: '#3a2a20', skyHor: '#3a2a20', gain: '#ffeccc', vig: 0.48, shadowExt: 5, pointK: 1.4 },
  study: { ...base, az: 60, el: 40, sky: '#ffe8c8', ground: '#7a5a40', hemi: 1.0, sun: '#ffdcae', sunI: 1.7, fog: '#d8c0a0', fogNear: 20, fogFar: 80, skyTop: '#ffe8c8', skyHor: '#ffe8c8', gain: '#fff0dc', shadowExt: 4 },
  station: { ...base, az: 130, el: 50, sky: '#e8e0d0', ground: '#7a6a58', hemi: 1.15, sun: '#fff0d8', sunI: 2.0, fog: '#d8d0c4', fogNear: 60, fogFar: 700, skyTop: '#9ab4cc', skyHor: '#ece2cc', gain: '#fff4e6', shadowExt: 12, clouds: 1 },
  yard: { ...base, az: 150, el: 22, sky: '#f0d0a0', ground: '#7a5a40', hemi: 1.05, sun: '#ffc88a', sunI: 2.4, fog: '#e0c0a0', fogNear: 40, fogFar: 300, skyTop: '#90a0c0', skyHor: '#f6d0a0', gain: '#fff0dc', shadowExt: 9, clouds: 1 },
  office: { ...base, az: 180, el: 25, sky: '#d8c0a0', ground: '#5a4030', hemi: 0.85, sun: '#ffc88a', sunI: 2.2, fog: '#c0a080', fogNear: 30, fogFar: 200, skyTop: '#90a0c0', skyHor: '#f6d0a0', gain: '#fff0dc', vig: 0.4, shadowExt: 5 },
  police: { ...base, az: 120, el: 40, sky: '#e8e2d4', ground: '#6a5a48', hemi: 1.05, sun: '#fff2dc', sunI: 1.5, fog: '#d0c8b8', fogNear: 20, fogFar: 80, skyTop: '#e8e2d4', skyHor: '#e8e2d4', gain: '#fff4e4', shadowExt: 6 },
  night: { ...base, az: -110, el: 16, sky: '#7080c0', ground: '#2a2a48', hemi: 1.15, sun: '#a8baff', sunI: 1.4, fog: '#141a38', fogNear: 200, fogFar: 2600, skyTop: '#0c1430', skyHor: '#34488a', sunDisc: '#f4ecc8', sunSize: 0.0016,
    gain: '#eef0ff', vig: 0.4, shadowExt: 12, sepia: 0.05, pointK: 1.5, waterDeep: '#0e1630', waterShal: '#2a3a6a', glint: '#b8c8ff' },
  sea: { ...base, az: -60, el: 25, sky: '#6a7aaa', ground: '#1a2038', hemi: 1.1, sun: '#a8b8ff', sunI: 1.5, fog: '#1e2a48', fogNear: 90, fogFar: 900, skyTop: '#060a1a', skyHor: '#2a3660', sunDisc: '#f4ecc8', sunSize: 0.0016,
    gain: '#e4eaff', vig: 0.5, shadowExt: 40, sepia: 0.04, waterDeep: '#0a1226', waterShal: '#24365c', glint: '#a8b8e8', pointK: 1 },
  cells: { ...base, az: 30, el: 60, sky: '#a8b8ac', ground: '#3a403c', hemi: 0.85, sun: '#d8e0d0', sunI: 0.6, fog: '#1e2422', fogNear: 6, fogFar: 40, skyTop: '#1e2422', skyHor: '#1e2422', gain: '#eef4ea', vig: 0.5, shadowExt: 5, sepia: 0.06, pointK: 1.4 },
  cell: { ...base, az: -150, el: 40, sky: '#98a6cc', ground: '#2e3038', hemi: 0.8, sun: '#a8b8ff', sunI: 0.9, fog: '#141820', fogNear: 6, fogFar: 30, skyTop: '#141820', skyHor: '#141820', gain: '#eef0ff', vig: 0.55, shadowExt: 3, sepia: 0.05, pointK: 1.2 },
  press: { ...base, az: 90, el: 70, sky: '#5a4030', ground: '#1a120c', hemi: 0.35, sun: '#ffd890', sunI: 0.3, fog: '#1a120c', fogNear: 6, fogFar: 30, skyTop: '#1a120c', skyHor: '#1a120c', gain: '#fff0d0', vig: 0.65, shadowExt: 4, sepia: 0.45, grain: 0.07, pointK: 1.4 },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 'whisper') { // the curtains close and the room dims
    const k = M.smooth(ramp(f, 366, 392)), A_ = LIGHTS.salon, B_ = LIGHTS.tense;
    L.hemi = lerp(A_.hemi, B_.hemi, k); L.sunI = lerp(A_.sunI, B_.sunI, k); L.vig = lerp(A_.vig, B_.vig, k); L.pointK = lerp(1, B_.pointK, k);
  }
  return L;
};

// ---------- cameras ----------
const kick = (f0, a) => ({ f: f0, a });
// aim: look point that puts `head` at screen row y (1920 tall) for this fov — keeps faces below the top text band
const aim = (pos, head, fov, y = 1000) => { const dx = head[0] - pos[0], dy = head[1] - pos[1], dz = head[2] - pos[2], h = Math.hypot(dx, dz), e = Math.atan2(dy, h);
  const c = e + Math.atan(((y - 960) / 960) * Math.tan(fov * Math.PI / 360)); return [pos[0] + dx / h, pos[1] + Math.tan(c), pos[2] + dz / h]; };
const KA = (f, pos, head, fov, y, o = {}) => ({ f, pos, look: aim(pos, head, fov, y), fov, ...o });
const HC = [0, TER + 1.55, 0.6];            // con man's head on the terrace
const CON_S = [-3.0, 1.62, 0.1];            // con man at the head of the table
const DEAL_H = (x) => [x, 1.25, -0.95];
const CON2 = [-0.5, 1.62, 0.35], DLR2 = [0.65, 1.25, 0.35];
const CELL = [-4.35, 1.29, 0.55];
const CAMS = {
  hook: [{ f: 0, pos: [0.2, TER + 1.15, 3.0], look: [-0.1, TER - 0.2, 0.3], fov: 50, roll: -3 }, { f: 16, pos: [0.25, TER + 0.6, 3.05], look: [0, TER + 150, TZ], fov: 62, ease: 'easeOut' },
    KA(30, [0.25, TER + 0.95, 2.45], HC, 68, 1250), KA(44, [0.22, TER + 0.95, 2.35], HC, 66, 1240, { roll: 1 })],
  scrap: [{ f: 45, pos: [18.4, 57.0, -213.2], look: [16.6, 58.2, -218], fov: 44 }, { f: 52, pos: [17.4, 57.4, -215.1], look: [16.6, 57.9, -218], fov: 32, ease: 'easeOut' }, { f: 66, pos: [17.2, 57.3, -215.5], look: [16.6, 57.1, -218], fov: 28, roll: -4 }],
  cafe: [KA(67, [1.5, 1.25, 3.3], [0, 1.29, 0], 36, 950, { roll: 2 }), KA(94, [1.2, 1.25, 2.85], [0, 1.29, 0], 34, 950)],
  paper: [{ f: 95, pos: [0.06, 1.14, 1.55], look: [0.0, 1.1, 0.5], fov: 34 }, { f: 120, pos: [-0.03, 1.1, 1.22], look: [-0.06, 1.08, 0.5], fov: 32 }, { f: 172, pos: [-0.09, 1.07, 1.02], look: [-0.1, 1.05, 0.5], fov: 30, roll: -3 }],
  idea: [KA(173, [0.35, 1.3, 2.4], [0.02, 1.3, 0], 38, 950), KA(178, [0.3, 1.3, 2.2], [0.02, 1.3, 0], 33, 930, { ease: 'easeOut' }), KA(205, [0.25, 1.31, 2.1], [0.02, 1.3, 0], 31, 930, { roll: 2 })],
  forge: [{ f: 206, pos: [0.45, 1.5, 1.05], look: [0.15, 0.95, 0.0], fov: 40, roll: 3 }, { f: 226, pos: [0.32, 1.48, 1.0], look: [0.1, 0.95, 0.0], fov: 38 }, { f: 257, pos: [0.08, 1.46, 1.0], look: [0.05, 0.95, 0.0], fov: 35, roll: -2 }],
  lobby: [KA(258, [0.9, 1.35, -4.6], [0, 1.62, -11.8], 38, 1000, { roll: -2 }), KA(299, [0.6, 1.42, -6.0], [-0.3, 1.5, -9.4], 40, 1000, { roll: 1 })],
  table: [KA(300, [-2.6, 1.5, 2.3], CON_S, 40, 980), KA(362, [1.5, 1.45, 2.0], DEAL_H(1.6), 38, 1000)],
  whisper: [{ f: 363, pos: [-0.4, 1.75, 3.6], look: [-0.4, 2.05, -3], fov: 50 }, KA(395, [-1.6, 1.5, 2.4], [-2.6, 1.45, -0.3], 40, 1000), KA(457, [-1.9, 1.5, 1.95], [-2.7, 1.5, -0.1], 36, 980)],
  secret: [KA(458, [-2.3, 1.6, 2.4], CON_S, 36, 980), KA(463, [-2.45, 1.6, 2.05], CON_S, 31, 960, { ease: 'easeOut' }), KA(488, [-2.5, 1.6, 2.0], CON_S, 30, 960, { roll: -2 })],
  bite: [KA(489, [0.2, 1.35, 1.55], [0, 1.27, -0.6], 34, 950), KA(500, [0.15, 1.33, 1.35], [0, 1.29, -0.6], 30, 940, { ease: 'easeOut' }), KA(523, [0.12, 1.33, 1.3], [0, 1.29, -0.6], 29, 940, { roll: 2 })],
  peek: [{ f: 524, pos: [-0.75, 1.35, 0.2], look: [1.3, 1.3, -2.7], fov: 34 }, { f: 581, pos: [-0.35, 1.32, -0.6], look: [1.35, 1.32, -2.75], fov: 24, roll: -3 }],
  genius: [KA(582, [-0.1, 1.5, 3.1], [-0.2, 1.5, 0.35], 42, 1000), KA(684, [-0.35, 1.5, 2.25], CON2, 34, 960)],
  thinks: [KA(685, [1.0, 1.3, 2.2], DLR2, 36, 980), KA(774, [0.92, 1.3, 1.95], DLR2, 33, 960, { roll: -2 })],
  bulb: [KA(775, [0.92, 1.3, 1.95], DLR2, 33, 960), KA(781, [0.9, 1.45, 2.2], DLR2, 38, 1150, { ease: 'back' }), KA(809, [0.9, 1.45, 2.15], DLR2, 37, 1150)],
  pay: [{ f: 810, pos: [0.15, 1.55, 0.95], look: [-0.1, 0.86, 0.1], fov: 36 }, { f: 837, pos: [0.05, 1.45, 0.85], look: [-0.1, 0.86, 0.1], fov: 32, roll: 2 }],
  pocket: [KA(838, [0.05, 1.5, 3.3], [0.05, 1.45, 0.35], 46, 1000), KA(878, [-0.2, 1.5, 2.5], CON2, 36, 980), KA(926, [-0.25, 1.5, 2.35], CON2, 34, 970, { roll: 2 })],
  yard: [{ f: 1005, pos: [0.4, 1.75, 9.0], look: [-0.95, 1.65, 2.0], fov: 38, roll: -2 }, { f: 1037, pos: [-0.3, 1.68, 5.6], look: [-0.95, 1.62, 2.0], fov: 32 }],
  shame: [KA(1038, [1.5, 1.55, -0.2], [-1.7, 1.44, -0.55], 46, 1000), KA(1095, [1.3, 1.52, -0.25], [-1.7, 1.44, -0.55], 42, 1000), KA(1121, [1.2, 1.5, -0.3], [-1.7, 1.44, -0.55], 40, 1000, { roll: 2 })],
  back: [KA(1122, [1.4, 2.25, 9.6], [0, 2.62, 3.6], 40, 1000), KA(1175, [1.0, 2.2, 8.8], [0, 2.62, 4.4], 36, 1000)],
  again: [KA(1176, [-1.6, 1.5, 2.4], [-2.6, 1.45, -0.3], 40, 1000), KA(1235, [-1.9, 1.5, 1.95], [-2.7, 1.5, -0.1], 36, 980)],
  police: [KA(1236, [-0.6, 1.55, 3.1], [0.2, 1.45, -0.9], 44, 1000), KA(1262, [-0.5, 1.5, 2.8], [0.4, 1.45, -1.0], 42, 1000), KA(1293, [0.4, 1.55, 2.9], [2.6, 1.45, -0.6], 44, 1000)],
  escape: [{ f: 1294, pos: [55.4, GR + 18.1, -6.0], look: [54, GR + 18.0, -10.6], fov: 50, roll: 3 }, { f: 1305, pos: [55.0, GR + 18.1, -7.2], look: [54, GR + 18.2, -11], fov: 48 },
    { f: 1333, pos: [53.0, GR + 18.9, -15.5], look: [49.5, GR + 22.2, -44], fov: 42, ease: 'easeIn', roll: -2 }],
  island: [{ f: 1334, pos: [-120, 10, 300], look: [0, 30, 0], fov: 30 }, { f: 1385, pos: [-100, 11, 255], look: [2, 30, 0], fov: 28, roll: 1 }],
  cellblock: [KA(1386, [0.6, 1.7, 3.6], [0.2, 1.47, -4.4], 40, 980), KA(1420, [0.35, 1.62, 2.7], [0.2, 1.47, -2.6], 38, 980), KA(1442, [-1.0, 1.45, 1.9], CELL, 34, 1000)],
  souvenir: [KA(1443, [-2.5, 1.35, 1.7], CELL, 36, 990), KA(1490, [-2.7, 1.33, 1.55], CELL, 33, 970, { roll: -2 })],
  press: [KA(1491, [-0.3, 1.55, 2.8], [-0.4, 1.62, 0.0], 44, 1000, { roll: 3 }), KA(1526, [-0.45, 1.5, 2.3], [-0.5, 1.62, 0.0], 40, 980)],
  wink: [KA(1527, [-2.55, 1.32, 1.6], CELL, 34, 960), KA(1533, [-2.75, 1.32, 1.45], CELL, 29, 940, { ease: 'easeOut' }), KA(1549, [-2.78, 1.32, 1.43], CELL, 28, 940)],
};
const KICKS = [kick(53, 0.03), kick(212, 0.03), kick(458, 0.025), kick(812, 0.02), kick(817, 0.02), kick(822, 0.02), kick(1100, 0.05), kick(1243, 0.06), kick(1296, 0.05)];
// train: departure (exponential pull-away) and arrival (decelerating, flipped)
const X0 = -25.75;
const trainX = (f) => { if (f >= S_.train.a && f <= S_.train.b) { const t = Math.max(0, (f - 936) / 30); return X0 - (Math.exp(2.2 * t) - 1) * 1.1; }
  if (f >= S_.back.a && f <= S_.back.b) { const t = clamp((f - 1122) / 22); return 30 - 34 * Math.pow(1 - t, 2.2) + 0; } return X0; };
export const camAt = (f) => {
  const S = shotAt(f);
  let c;
  if (S.id === 'train') { // starts at the compartment window riding along, then stays behind and watches the train go
    const x = trainX(f), ride = clamp(1 - (f - 944) / 14), win = x + 18.5 + 7.0;
    const camX = f < 944 ? win + 0.1 : lerp(X0 + 18.5 + 7.0 + 0.1, win + 0.1, Math.max(0, ride));
    const k = M.smooth(ramp(f, 950, 990));
    c = { pos: [lerp(camX, 3.0, k), lerp(2.75, 3.2, k), lerp(3.4, 6.6, k)], look: [lerp(win, x + 10, k), lerp(2.65, 2.6, k), lerp(0.2, -1.5, k)], fov: lerp(30, 44, k), roll: 0 };
    c.fov *= 1 - 0.0012 * (f - S.a) * 0.15;
  } else c = camFromKeys(CAMS[S.id], f, { kicks: KICKS });
  c.flash = 0;
  if (S.id === 'press') c.flash = f < 1494 ? 0.5 * (1 - (f - 1491) / 3) : 0; // flashback pop
  if (S.id === 'bulb' && f >= 780 && f < 784) c.flash = 0.12 * (1 - (f - 780) / 4);
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f), fo = (p, c = 8, near = 1) => ({ focus: dist(C.pos, p), cinf: c, near });
  switch (S.id) {
    case 'hook': return fo([0, TER + 1.5, 0.6], f < 18 ? 6 : 1.5);
    case 'scrap': return fo([16.6, 58.0, -218], 10);
    case 'cafe': return fo([0.1, 1.25, 0], 6);
    case 'paper': return fo([-0.08, 1.06, 0.5], 9);
    case 'idea': return fo([0.02, 1.28, 0], 10);
    case 'forge': return fo([0.1, 0.84, 0.15], 10);
    case 'lobby': return fo([0, 1.6, lerp(-12.5, -8.6, ramp(f, 262, 296))], 5);
    case 'table': return fo([lerp(-2.9, 1.4, M.smooth(ramp(f, 300, 362))), 1.2, -0.8], 6);
    case 'whisper': case 'again': return fo([-2.6, 1.4, -0.2], 7);
    case 'secret': return fo([-3.0, 1.56, 0.1], 12);
    case 'bite': return fo([0, 1.24, -0.6], 11);
    case 'peek': return fo([1.5, 1.3, -2.7], 10);
    case 'genius': return fo([-0.5, 1.5, 0.35], 6);
    case 'thinks': case 'bulb': return fo([0.65, 1.3, 0.35], 10);
    case 'pay': return fo([-0.1, 0.86, 0.1], 9);
    case 'pocket': return fo([-0.5, 1.5, 0.35], 5);
    case 'train': return { focus: dist(C.pos, C.look), cinf: 4 };
    case 'yard': return fo([-0.95, 1.6, 2.0], 5);
    case 'shame': return fo([-1.15, 1.44, -1.15], 6);
    case 'back': return fo([0, 2.6, 4.2], 6);
    case 'police': return fo([0.4, 1.4, -1.0], 5);
    case 'escape': return { focus: dist(C.pos, C.look), cinf: 2 };
    case 'island': return { focus: 150, cinf: 0 };
    case 'cellblock': return fo([-3.8, 1.2, 0.5], 4);
    case 'souvenir': case 'wink': return fo([-4.4, 1.25, 0.55], 11);
    case 'press': return fo([-0.75, 1.6, 0.15], 6);
  }
  return { focus: 10, cinf: 0 };
};

// ---------- world state ----------
export const worldAt = (f) => {
  const S = shotAt(f), W = { set: S.set };
  switch (S.id) {
    case 'scrap': W.boltFall = (f - 53) / 30; break;
    case 'paper': W.paper3d = true; break;
    case 'forge': W.seal = M.back(ramp(f, 213, 219)); W.sign = M.smooth(ramp(f, 230, 252)); break;
    case 'lobby': W.revolve = (f - 258) * 0.09; W.cartX = 0; break;
    case 'whisper': W.curtain = M.smooth(ramp(f, 364, 392)); break;
    case 'secret': case 'bite': case 'again': W.curtain = 1; W.dusk = S.id === 'again'; break;
    case 'peek': W.doorAng = -lerp(0.32, 0.5, M.smooth(ramp(f, 528, 548))); break;
    case 'pay': { W.money = 6; W.moneyDrop = [0, 1, 2, 3, 4, 5].map((i) => 1 - M.easeIn(ramp(f, 810 + i * 4, 814 + i * 4)) - (f < 810 + i * 4 ? 9 : 0)); W.money = [0, 1, 2, 3, 4, 5].filter((i) => f >= 810 + i * 4).length; W.env = 0; break; }
    case 'pocket': W.money = 6; W.env = M.smooth(ramp(f, 846, 860)); break;
    case 'genius': case 'thinks': case 'bulb': W.money = 0; W.env = 0; break;
    case 'train': W.trainX = trainX(f); break;
    case 'back': W.trainX = trainX(f); W.trainFlip = true; break;
    case 'shame': W.shutter = M.easeIn(ramp(f, 1099, 1103)); break;
    case 'escape': W.night = true; W.door = -M.back(ramp(f, 1295, 1302)) * 1.7; W.wind = 1; break;
  }
  if (S.id === 'hook' || S.id === 'scrap') W.night = false;
  return W;
};

// ---------- actors ----------
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.gentFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const HAND = (T, o, pos, s, extra = {}) => ({ key: 'hand' + JSON.stringify(o), draw: (p) => T.handCard(p, o), x: pos[0], y: pos[1], z: pos[2], s, blob: false, ...extra });
const id = (f, s) => { const i = idle(f, s); return { bob: q(i.bob, 3), tilt: q(i.tilt, 1), headTilt: q(i.headTilt, 1) }; };
const DEAL = ['d2', 'd3', 'dealer', 'd4', 'd5'], DEAL2 = ['e1', 'e2', 'victim2', 'e3', 'd5'];
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], push = (a) => out.push(a);
  const bl = (s) => blinkAt(f, s);
  switch (S.id) {
    case 'hook': {
      const turn = f >= 27, k = ramp(f, 27, 31);
      push(R(T, 'con', { ...id(f, 1), back: !turn, expr: f < 33 ? 'smirk' : 'sly', blink: turn ? bl(1) : 0, R: turn && f > 33 ? 'lapel' : 'hang', squash: q(turn ? 0.06 * Math.sin(k * Math.PI) : 0, 2), facing: turn ? q(-0.4 + 0.4 * k, 2) : 0 }, [0, TER, 0.6]));
      break;
    }
    case 'cafe': case 'idea': {
      const low = S.id === 'idea' ? M.back(ramp(f, 173, 181)) : 0;
      const expr = S.id === 'cafe' ? 'neutral' : f < 177 ? 'neutral' : f < 190 ? 'idea' : 'sly';
      push(R(T, 'con', { sit: true, cross: true, hatOff: true, L: 'hold', R: 'hold', hold: 'paper', holdY: q(0.32 + low * 0.5, 2), expr, blink: S.id === 'idea' && f > 177 ? 0 : bl(2), look: S.id === 'cafe' ? 0.3 : 0, headTilt: q(S.id === 'idea' ? 4 * Math.sin(ramp(f, 186, 196) * Math.PI) : idle(f, 2).headTilt, 1), seed: 3 }, [0, 0, 0], { blobW: 0.8 }));
      if (S.id === 'cafe') { const w = walk(f, 67, 0.9); push(R(T, 'waiter', { step: q(w.phase, 2), expr: 'smile', R: 'show', hold: 'glass', blink: bl(9), seed: 9 }, [-3.4 + w.dist, 0, -1.6])); }
      break;
    }
    case 'paper': {
      push(R(T, 'con', { sit: true, cross: true, hatOff: true, L: 'hang', R: 'hang', expr: 'neutral', seed: 3 }, [0, 0, 0]));
      push(HAND(T, { item: 'grip', skin: '#f3d3b3' }, [-0.33, 0.62, 0.52], 0.3)); push(HAND(T, { item: 'grip', skin: '#f3d3b3' }, [0.33, 0.62, 0.52], 0.3, { flip: true }));
      break;
    }
    case 'forge': {
      const press = f < 213 ? 0.12 * (1 - M.easeIn(ramp(f, 206, 213))) : f < 222 ? 0 : 0.14 * M.easeOut(ramp(f, 222, 230));
      if (f < 232) push(HAND(T, { item: 'stamp' }, [0.15, 0.818 + press, 0.18], 0.32));
      if (f >= 226) { const k = M.smooth(ramp(f, 230, 252)), wig = Math.sin(f * 1.4) * 0.006; push(HAND(T, { item: 'pen' }, [lerp(-0.0, 0.12, k), 0.818 + 0.004 + Math.abs(wig), 0.2 + wig], 0.3)); }
      // giant shadow of the forger on the wall
      push(R(T, 'con', { L: 'rub', R: f < 228 ? 'hold' : 'pocket', expr: 'sly', ...id(f, 4) }, [0.15, -0.4, -0.85], { s: 1.7, tint: '#000000', alpha: 0.42, blob: false, shadow: false, yaw: 0, order: 1 }));
      break;
    }
    case 'lobby': {
      const w = walk(f, 258, 2.1, 0.75), z = Math.min(-9.4, -12.4 + w.dist);
      const tip = f > 284;
      push(R(T, 'con', { step: z > -8.65 ? 0 : q(w.phase, 2), expr: tip ? 'sly' : 'smirk', L: tip ? 'tip' : 'hang', R: 'hang', blink: bl(1), ...id(f, 1) }, [0.05, 0, z]));
      const bow = M.smooth(ramp(f, 270, 280)) * (1 - M.smooth(ramp(f, 292, 299)));
      push(R(T, 'bell', { tilt: q(-18 * bow, 1), expr: 'smile', L: 'suitcase', R: 'hang', blink: bl(5), seed: 7 }, [-0.95, 0, -8.3]));
      push(R(T, 'd3', { expr: 'neutral', blink: bl(12), seed: 12, ...id(f, 12) }, [5.6, 0, -9.0], { tint: '#f4e8d8' }));
      break;
    }
    case 'table': case 'whisper': case 'secret': case 'bite': case 'again': {
      const list = S.id === 'again' ? DEAL2 : DEAL;
      const whisperOn = (S.id === 'whisper' && f > 396) || S.id === 'again';
      list.forEach((who, i) => {
        const x = -1.9 + i * 0.95; let o = { sit: true, L: 'table', R: 'table', expr: 'neutral', blink: bl(20 + i), seed: 20 + i, ...id(f, 20 + i) };
        let pos = [x, 0, -0.95], extra = {};
        if (S.id === 'table') { const t0 = 300 + i * 9, k = ramp(f, t0, t0 + 7); if (f < t0) return; o.squash = q(0.12 * Math.sin(k * Math.PI), 2); pos = [x, 0.25 * (1 - M.back(k)), -0.95]; o.expr = i === 2 ? 'eager' : ['neutral', 'smile', 'eager', 'frown', 'think'][i]; }
        if (whisperOn || S.id === 'secret') { o.headTilt = q(-10 - i * 2, 1); o.tilt = q(-6, 1); o.expr = i === 2 && S.id !== 'again' ? 'eager' : S.id === 'again' && i === 2 ? 'suspicious' : 'think'; o.look = -0.8; }
        if (S.id === 'bite' && i === 2) { const k = M.back(ramp(f, 494, 502)); pos = [x, 0, -0.95 + 0.38 * k]; o = { ...o, expr: f < 494 ? 'eager' : 'happy', blink: 0, L: 'table', R: 'table', tilt: q(4 * k, 1), bob: q(0.04 * k, 3), headTilt: 0 }; extra.order = 4; }
        push(R(T, who, o, pos, { blob: false, ...extra }));
      });
      // the con man at the head of the table
      let o = { expr: 'smirk', L: 'hang', R: 'show', blink: bl(1), ...id(f, 1) };
      if (S.id === 'table') { o.R = f < 330 ? 'show' : 'hip'; o.L = 'hang'; o.expr = 'smirk'; }
      if (S.id === 'whisper') { o = { ...o, expr: f > 396 ? 'whisper' : 'sly', R: f > 396 ? 'cup' : 'hip', tilt: q(f > 396 ? 10 : 0, 1), look: 0.6 }; }
      if (S.id === 'again') { o = { ...o, expr: 'whisper', R: 'cup', tilt: 10, look: 0.6 }; }
      if (S.id === 'secret') o = { ...o, expr: 'shh', R: 'shh', L: 'hang', tilt: 6, blink: 0 };
      if (S.id === 'bite') o = { ...o, expr: 'sly', R: 'lapel', L: 'hang' };
      push(R(T, 'con', o, [-3.0, 0, 0.1]));
      break;
    }
    case 'peek': {
      push(R(T, 'dealer', { expr: 'suspicious', blink: 0, look: -0.5, L: 'hang', R: 'hang', headTilt: q(-6 + 2 * Math.sin(f * 0.1), 1), seed: 22 }, [1.62, 0, -2.88], { blob: false }));
      break;
    }
    case 'genius': {
      const ask = f > 636;
      push(R(T, 'con', { expr: f < 600 ? 'sheepish' : ask ? (f > 662 ? 'smirk' : 'sheepish') : 'sheepish', L: ask ? 'hang' : 'rub', R: ask ? 'palm' : 'rub', look: -0.9, blink: bl(1), ...id(f, 1), headTilt: q(ask ? -6 : 3 * Math.sin(f * 0.3), 1) }, [-0.5, 0, 0.35]));
      push(R(T, 'dealer', { expr: f < 650 ? 'frown' : 'suspicious', L: 'cross', R: 'cross', blink: bl(22), look: -0.6, seed: 22, ...id(f, 22) }, [0.65, 0, 0.35]));
      break;
    }
    case 'thinks': case 'bulb': {
      const e = S.id === 'bulb' ? 'happy' : f < 716 ? 'frown' : f < 745 ? 'suspicious' : 'think';
      push(R(T, 'dealer', { expr: e, L: 'hang', R: S.id === 'bulb' ? 'up' : f > 716 ? 'chin' : 'hang', look: S.id === 'thinks' && f > 745 ? 0.8 : 0, blink: S.id === 'bulb' ? 0 : bl(22), seed: 22, ...id(f, 22) }, [0.65, 0, 0.35]));
      push(R(T, 'con', { expr: 'sheepish', L: 'rub', R: 'rub', look: -0.9, blink: bl(1), ...id(f, 1) }, [-0.5, 0, 0.35]));
      break;
    }
    case 'pay': {
      push(R(T, 'dealer', { expr: 'eager', L: 'table', R: 'table', blink: bl(22), seed: 22 }, [0.65, 0, 0.55]));
      break;
    }
    case 'pocket': {
      const slide = f > 856 && f < 874, wink = f > 878 && f < 905;
      push(R(T, 'con', { expr: wink ? 'wink' : f < 856 ? 'sheepish' : 'smirk', L: 'hang', R: slide ? 'pocket' : f >= 874 ? 'lapel' : 'palm', hold: slide ? 'envelope' : null, blink: wink ? 0 : bl(1), ...id(f, 1) }, [-0.5, 0, 0.35]));
      push(R(T, 'dealer', { expr: 'happy', L: 'hang', R: 'show', hold: 'doc', blink: bl(22), seed: 22, ...id(f, 22) }, [0.65, 0, 0.35]));
      break;
    }
    case 'train': {
      const x = trainX(f) + 18.5;
      push(R(T, 'con', { sit: true, L: 'hold', R: 'hang', holdL: 'suitcase', holdY: 0.55, expr: 'sleepy', hatDown: 0.7, blink: 1, seed: 3, bob: q(0.006 * Math.sin(f * 0.4), 3) }, [x + 7.0, 1.3, 0.3], { blob: false }));
      // a few travellers on the platform waving / walking
      push(R(T, 'd4', { expr: 'smile', R: 'wave', wv: q(f * 0.6, 1), blink: bl(31), seed: 31 }, [4.6, 1.0, 5.6], { tint: '#f6efe2' }));
      push(R(T, 'e2', { expr: 'neutral', blink: bl(32), seed: 32, step: q(walk(f, 927, 1).phase, 2) }, [-3 + walk(f, 927, 1).dist, 1.0, 6.8], { tint: '#f6efe2' }));
      break;
    }
    case 'yard': {
      push(R(T, 'dealer', { sit: true, expr: 'sad', L: 'table', R: 'table', blink: bl(22), seed: 22 }, [-0.9, 0.2, -1.15], { blob: false }));
      break;
    }
    case 'shame': {
      const peek = f > 1080 && f < 1096, jump = f >= 1096;
      const o = { sit: !jump, expr: jump ? 'shock' : peek ? 'nervous' : 'ashamed', L: jump ? 'up' : 'face', R: jump ? 'hang' : peek ? 'hang' : 'face', blink: 0, seed: 22, ...id(f, 22) };
      if (jump) o.bob = q(0.08 * Math.sin(ramp(f, 1096, 1104) * Math.PI), 3);
      push(R(T, 'dealer', o, [-1.15, 0.2, -1.15], { blob: false }));
      if (f > 1084 && f < 1104) { const k = ramp(f, 1084, 1104); push(R(T, 'gend', { expr: 'stern', step: q((f * 0.07) % 1, 2), look: 0.8, seed: 41, blink: bl(41) }, [-3.4, 0.0, lerp(-1.6, 1.4, k)], { tint: '#f0e4d0' })); }
      break;
    }
    case 'back': {
      const k = ramp(f, 1144, 1175), w = walk(f, 1144, 1.2, 0.7);
      if (f >= 1140) push(R(T, 'con', { expr: f > 1158 ? 'sly' : 'smirk', L: f > 1155 ? 'tip' : 'hang', R: 'suitcase', step: q(w.phase, 2), blink: bl(1), ...id(f, 1), squash: 0 }, [0.0, 1.0, 3.2 + w.dist * 0.9], { alpha: q(Math.min(1, (f - 1140) / 6), 2) }));
      break;
    }
    case 'police': {
      const bang = f >= 1240 && f < 1250;
      push(R(T, 'victim2', { expr: 'angry', L: 'hang', R: f < 1240 ? 'fistUp' : bang ? 'bang' : f < 1262 ? 'bang' : 'point', blink: 0, seed: 51, headTilt: q(bang ? 4 : 0, 1), bob: q(bang ? -0.02 : 0, 3) }, [-0.2, 0, -0.55]));
      const run = f >= 1268;
      [[0.95, -1.15, 'gend'], [1.6, -1.8, 'gend2']].forEach(([x, z, who], i) => {
        const rr = run ? Math.pow(Math.max(0, f - 1268 - i * 3) / 30, 1.4) * 5.5 : 0;
        push(R(T, who, { expr: f < 1246 ? 'neutral' : f < 1258 ? 'shock' : 'whistle', R: f >= 1256 ? 'whistle' : 'hang', L: run ? 'run' : 'hang', run, step: run ? q(((f - 1268) * 0.09) % 1, 2) : 0, blink: f < 1246 ? bl(60 + i) : 0, seed: 60 + i, tilt: q(run ? 8 : 0, 1) }, [x + rr, 0, z + rr * 0.15]));
      });
      break;
    }
    case 'escape': {
      // gendarmes burst into the empty attic room; the con man runs over the roofs outside
      if (f >= 1297) [[56.6, -6.9, 'gend'], [56.9, -6.2, 'gend2']].forEach(([x, z, who], i) => push(R(T, who, { expr: 'shock', L: 'up', R: 'whistle', blink: 0, seed: 70 + i }, [x - Math.min(0.6, (f - 1297) * 0.06), GR + 16.6, z], { tint: '#aab4e8' })));
      const w = walk(f, 1294, 6, 1.0);
      push(R(T, 'con', { run: true, step: q(w.phase, 2), L: 'run', R: 'run', expr: 'grin', blink: 0, tilt: 10, seed: 3 }, [54 - w.dist, GR + 22.62, -42], { tint: '#c4ccf4', s: 1.5 }));
      break;
    }
    case 'cellblock': {
      const w = walk(f, 1386, 1.5, 0.8);
      push(R(T, 'guard', { expr: 'stern', step: q(w.phase, 2), blink: bl(80), seed: 80, look: -0.5, L: 'hang', R: 'hang' }, [0.25, 0, -4.6 + w.dist]));
      push(R(T, 'prisoner', { sit: true, expr: 'sad', L: 'hang', R: 'hang', blink: bl(3), seed: 3, ...id(f, 3) }, [-4.35, 0, 0.55], { blobW: 0.8 }));
      break;
    }
    case 'souvenir': {
      const sigh = Math.sin(ramp(f, 1458, 1478) * Math.PI);
      push(R(T, 'prisoner', { sit: true, expr: f > 1476 ? 'sad' : 'sleepy', L: 'hang', R: 'fig', look: 0.4, blink: bl(3), seed: 3, bob: q(-0.03 * sigh, 3), headTilt: q(-6 * sigh, 1) }, [-4.35, 0, 0.55]));
      break;
    }
    case 'wink': {
      push(R(T, 'prisoner', { sit: true, expr: f < 1531 ? 'smirk' : f < 1545 ? 'wink' : 'smirk', L: 'hang', R: 'fig', blink: 0, seed: 3, headTilt: q(f > 1531 ? 4 : 0, 1) }, [-4.35, 0, 0.55]));
      break;
    }
    case 'press': {
      push(R(T, 'con', { expr: 'grin', L: 'hang', R: 'holdUp', hold: 'note', look: 0.5, blink: 0, ...id(f, 1), hatOff: false }, [-0.75, 0, 0.15]));
      break;
    }
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (S.id === 'hook') for (let i = 0; i < 7; i++) { const t = (f + i * 9) / 40, k = q((f * 0.25 + i * 0.3) % 1, 1); out.push(FX('bird' + k, (p) => T.fxBird(p, k), [-14 + i * 4 + t * 9, TER + 8 + i * 1.6 + Math.sin(t * 3 + i) * 0.6, -12 - i * 3], 1.2, { flip: i % 2 === 0, tint: '#c8a0a8' })); }
  if (S.id === 'scrap') {
    for (let i = 0; i < 3; i++) { const t = Math.max(0, (f - 50 - i * 2) / 30), k = q((f * 0.3 + i * 0.3) % 1, 1); if (t > 0) out.push(FX('bird' + k, (p) => T.fxBird(p, k), [19.4 + t * 3 + i * 0.3, 58.8 + t * 2.0 + i * 0.25, -217.8 + t * 1.5], 0.5, { flip: true, tint: '#d8b0b0' })); }
    if (f >= 60) { const k = q(ramp(f, 60, 66), 2); out.push(FX('ting' + k, (p) => T.fxSpark(p, k, '#fff4c0'), [16.9, 56.6, -217.4], 0.25)); }
  }
  if (S.id === 'idea' && f >= 178 && f < 192) { const k = q(ramp(f, 178, 192), 2); out.push(FX('spk' + k, (p) => T.fxSpark(p, k), [0.12, 1.33, 0.12], 0.1)); }
  if (S.id === 'bite' && f >= 492 && f < 506) { const k = q(ramp(f, 492, 506), 2); for (const dx of [-0.07, 0.07]) out.push(FX('spk' + k, (p) => T.fxSpark(p, k), [dx, 1.27, -0.4], 0.07)); }
  if (S.id === 'bulb' && f >= 778) { const k = q(Math.min(1, (f - 778) / 6), 2); out.push(FX('bulb' + k, (p) => T.fxBulb(p, k), [0.65, 1.38, 0.42], 0.3)); }
  if (S.id === 'pocket' && f >= 880 && f < 892) { const k = q(ramp(f, 880, 892), 2); out.push(FX('spk' + k, (p) => T.fxSpark(p, k), [-0.38, 1.66, 0.45], 0.08)); }
  if (['table', 'whisper', 'again'].includes(S.id)) for (let i = 0; i < 3; i++) { const t = ((f - S.a) / 60 + i / 3) % 1; out.push(FX('smk' + q(t, 1), (p) => T.fxSteam(p, q(t, 1), '#d8d0c8', 0.35), [-1.4 + i * 1.3, 1.3 + t * 1.2, -0.7], 0.35)); }
  if (S.id === 'train') for (let i = 0; i < 6; i++) { const x = trainX(f) + 1.2, t = ((f - 927) / 22 + i / 6) % 1; out.push(FX('stm' + q(t, 1), (p) => T.fxSteam(p, q(t, 1), '#f0ece6', 0.85), [x + t * 6, 4.6 + t * 3, -t * 1.5], 1.6 + t * 2.5, { order: 6 })); }
  if (S.id === 'back') { for (let i = 0; i < 9; i++) { const t = q(Math.min(0.95, ((f - 1126) / 30 + i / 9) % 1), 1); out.push(FX('stm2' + t, (p) => T.fxSteam(p, t, '#f4f0ea', f > 1150 ? 0.6 : 0.95), [-3 + i * 1.2, 1.2 + t * 1.5, 2.2 + (i % 3) * 0.6], 1.8 + t * 1.5, { order: 6 })); } }
  if (S.id === 'island') for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, t = q(((f / 24) + i * 0.37) % 1, 1); out.push(FX('foam' + t, (p) => T.fxSteam(p, t, '#dfe6f4', 0.7), [Math.cos(a) * 58, 0.5, Math.sin(a) * 42], 8, { order: 3 })); }
  if (S.id === 'press') for (let i = 0; i < 7; i++) { const t = ((f - 1491) / 26 + i / 7) % 1; out.push(FX('note', (p) => T.fxNote20(p), [0.9 + t * 0.4 + Math.sin(i) * 0.3, 1.0 + t * 1.4, -0.3 + t * 1.6], 0.22, { roll: q(t * 5 + i, 1) })); }
  if (S.id === 'police' && f >= 1243 && f < 1250) { const k = q(ramp(f, 1243, 1250), 2); out.push(FX('bang' + k, (p) => T.fxBurst(p, k), [0.12, 1.15, -0.4], 0.35)); }
  if (S.id === 'shame' && f >= 1099 && f < 1108) { const k = q(ramp(f, 1099, 1108), 2); out.push(FX('dust' + k, (p) => T.fxDust(p, k, '#d8c8a8'), [-2.0, 1.3, 0], 0.5)); }
  return out;
};
