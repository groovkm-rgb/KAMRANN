// Shot plan for "Gefängnis zu vermieten" — timed to voice.mp3 (47.83 s) + 0.5 s tail = 1450 frames @ 30 fps.
// Phrase times (s), hand-checked against the energy envelope and Parakeet word times (work/phrases.json):
//  0.00- 2.15 Ein Land in Europa hat ein seltsames Problem: | 2.41- 3.72 Es hat zu wenige Verbrecher.
//  4.06- 6.52 Die Strafen werden kürzer, die Kriminalität sinkt. | 6.78- 9.59 In zehn Jahren schrumpft ... Hälfte.
//  9.96-11.70 Über zwanzig Gefängnisse machen dicht. | 12.03-13.72 Aber was macht man mit den leeren Zellen?
// 13.99-15.69 Und mit den Wärtern, die ihren Job verlieren? | 16.04-17.59 Die Lösung: Man vermietet sie.
// 17.94-21.29 Ein Nachbarland schickt rund fünfhundert ... Grenze. | 21.61-27.04 Ein Land im hohen Norden ... Gefängnis.
// 27.62-30.39 Die Häftlinge züchten dort Hühner und bauen Gemüse an. | 30.77-35.36 Viele kommen sogar freiwillig ... billiger sind.
// 35.73-37.11 Nur eine Regel gibt's: | 37.35-40.77 Spätestens zwei Monate ... nach Hause.
// 41.20-44.42 Damit keiner auf die Idee kommt … dort Asyl zu beantragen. | 44.83-45.90 Und welches Land ist das? | 46.54-47.39 Die Niederlande.
// Cuts sit in pauses or on word boundaries (never mid-word); no shot is longer than 3.0 s; average 2.0 s.
import { M as E, camFromKeys, idle, blinkAt, walk, q, clamp, lerp, ramp } from './motion.js';

export const FPS = 30, TOTAL = 1450;
export const SHOTS = [
  { id: 'hook', a: 0, b: 68, light: 'day' }, { id: 'guard', a: 69, b: 116, light: 'day' },
  { id: 'board', a: 117, b: 197, light: 'office' }, { id: 'pop', a: 198, b: 287, light: 'lineup' },
  { id: 'lights', a: 288, b: 355, light: 'dusk' }, { id: 'corridor', a: 356, b: 415, light: 'corridor' },
  { id: 'guardroom', a: 416, b: 475, light: 'guardroom' }, { id: 'idea', a: 476, b: 532, light: 'office' },
  { id: 'barrier', a: 533, b: 569, light: 'day' }, { id: 'buses', a: 570, b: 643, light: 'day' },
  { id: 'fjord', a: 644, b: 682, light: 'north' }, { id: 'ferry', a: 683, b: 764, light: 'north' },
  { id: 'handshake', a: 765, b: 823, light: 'day' }, { id: 'chickens', a: 824, b: 883, light: 'day' },
  { id: 'veggies', a: 884, b: 916, light: 'day' }, { id: 'market', a: 917, b: 990, light: 'market' },
  { id: 'pricetag', a: 991, b: 1066, light: 'market' }, { id: 'rule', a: 1067, b: 1116, light: 'office' },
  { id: 'calendar', a: 1117, b: 1186, light: 'cell' }, { id: 'busleave', a: 1187, b: 1229, light: 'day' },
  { id: 'tiptoe', a: 1230, b: 1287, light: 'day' }, { id: 'caught', a: 1288, b: 1337, light: 'day' },
  { id: 'rise', a: 1338, b: 1388, light: 'day' }, { id: 'reveal', a: 1389, b: 1449, light: 'final' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const SET_OF = { hook: 'prison', guard: 'prison', board: 'office', pop: 'lineup', lights: 'row', corridor: 'corridor', guardroom: 'guardroom', idea: 'office',
  barrier: 'border', buses: 'border', fjord: 'north', ferry: 'north', handshake: 'prison', chickens: 'prison', veggies: 'prison', market: 'market', pricetag: 'market',
  rule: 'office', calendar: 'cell', busleave: 'prison', tiptoe: 'prison', caught: 'prison', rise: 'prison', reveal: 'prison' };

// ---------- lights ----------
const BASE = { az: 140, el: 46, sky: '#c4d6f2', ground: '#8a8262', hemi: 1.15, sun: '#fff1dc', sunI: 2.5, fog: '#cadcf0', fogNear: 80, fogFar: 1100,
  skyTop: '#3f80d4', skyHor: '#c3daf2', sunDisc: '#000000', sunSize: 0, sat: 1.1, gain: '#ffffff', lift: '#000000', waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#effaff',
  vig: 0.2, shadowExt: 30, clouds: true };
export const LIGHTS = {
  day: { ...BASE },
  office: { ...BASE, az: 100, el: 58, sky: '#fff2dc', ground: '#a08060', hemi: 1.35, sun: '#fff0d8', sunI: 1.6, fogNear: 40, fogFar: 300, sat: 1.08, gain: '#fff8ee', shadowExt: 7, clouds: false },
  lineup: { ...BASE, az: 90, el: 50, sky: '#e8f0ff', ground: '#9aa3ad', hemi: 1.4, sun: '#ffffff', sunI: 1.5, fogNear: 60, fogFar: 300, sat: 1.05, shadowExt: 12, clouds: false, vig: 0.3 },
  dusk: { ...BASE, az: 35, el: 7, sky: '#8f86c0', ground: '#5a4a50', hemi: 0.9, sun: '#ffab6a', sunI: 1.9, fog: '#d99a86', fogNear: 60, fogFar: 520,
    skyTop: '#3a4a8c', skyHor: '#f3a073', sunDisc: '#fff0c8', sunSize: 0.004, sat: 1.15, gain: '#ffe9dc', shadowExt: 60, vig: 0.3 },
  corridor: { ...BASE, az: 80, el: 70, sky: '#d8e2e6', ground: '#8c8a80', hemi: 1.15, sun: '#fff6e2', sunI: 1.0, fog: '#7f8c8a', fogNear: 6, fogFar: 46, sat: 1.0, gain: '#f4f6ee', shadowExt: 10, clouds: false, vig: 0.38 },
  guardroom: { ...BASE, az: 120, el: 62, sky: '#ffe8c4', ground: '#8a6a4a', hemi: 1.25, sun: '#ffe2b0', sunI: 1.4, fogNear: 40, fogFar: 300, sat: 1.05, gain: '#fff1dc', shadowExt: 6, clouds: false, vig: 0.3 },
  north: { ...BASE, az: 160, el: 22, sky: '#d6e6f6', ground: '#b9c6d2', hemi: 1.3, sun: '#f2f6ff', sunI: 1.6, fog: '#e6eef6', fogNear: 60, fogFar: 900,
    skyTop: '#7aa6d6', skyHor: '#eef4fb', sat: 0.98, gain: '#f4f8ff', waterDeep: '#355f80', waterShal: '#86b8d2', glint: '#ffffff', shadowExt: 26 },
  market: { ...BASE, az: 110, el: 60, sky: '#fff4e0', ground: '#c0a080', hemi: 1.4, sun: '#fff4e2', sunI: 1.4, fogNear: 40, fogFar: 300, sat: 1.15, shadowExt: 8, clouds: false, vig: 0.22 },
  cell: { ...BASE, az: 70, el: 55, sky: '#e2ecf4', ground: '#9a9488', hemi: 1.3, sun: '#fff4e0', sunI: 1.3, fogNear: 40, fogFar: 300, sat: 1.02, shadowExt: 6, clouds: false, vig: 0.3 },
  final: { ...BASE, az: 150, el: 48, hemi: 1.2, sunI: 2.4, fog: '#d4e4f4', fogNear: 400, fogFar: 2600, sat: 1.22, skyTop: '#3d7ed6', skyHor: '#cfe2f6', shadowExt: 300, waterDeep: '#3a7fa8', waterShal: '#6fbcd8' },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 'hook') L.shadowExt = 45;
  if (S.id === 'lights') { L.sunI = lerp(1.9, 1.1, ramp(f, 288, 355)); }
  if (S.id === 'rise') L.shadowExt = 70;
  if (S.id === 'reveal') L.shadowExt = lerp(200, 520, ramp(f, 1389, 1425));
  if (S.id === 'rule') { L.sat = 0.95; L.vig = 0.34; }
  return L;
};

// ---------- cameras ----------
const HOOK_TW = (f) => [15 - f * 0.12, -13];
const BUSX = (f, i) => -11 - i * 13 + (f - 570) * 0.34;      // convoy in shot 'buses'
const BUS9 = (f) => -17 + (f - 533) * 0.42;                    // first bus in 'barrier'
const OFFI = (f) => { const t = ramp(f, 686, 760); return [3.6 + t * 1.2, 1.22, -4.5 - t * 8.0]; }; // official on the dock
const PRI = (f) => { const t = ramp(f, 1232, 1287); return [lerp(-3.4, -8.4, t), 0, lerp(13.6, 12.5, t)]; }; // tiptoe path
const CAMS = {
  hook: [{ f: 0, pos: [21, 36, 24], look: [7, 1.0, -11], fov: 46, roll: -2 }, { f: 68, pos: [16, 12.5, 6], look: [9, 2.2, -18], fov: 40, roll: 1, ease: 'easeOut' }],
  guard: [{ f: 69, pos: [1.9, 1.75, 7.0], look: [0.1, 1.68, 2.4], fov: 40, roll: 0 }, { f: 116, pos: [0.9, 1.72, 5.6], look: [0.0, 1.7, 2.4], fov: 38, roll: -1 }],
  board: [{ f: 117, pos: [2.35, 1.25, 0.15], look: [1.9, 1.02, -1.25], fov: 34 }, { f: 150, pos: [2.25, 1.22, -0.1], look: [1.9, 1.0, -1.25], fov: 32 },
    { f: 162, pos: [-0.2, 1.62, 2.6], look: [-0.5, 1.5, -2.9], fov: 44, ease: 'easeOut' }, { f: 197, pos: [-0.3, 1.6, 2.05], look: [-0.55, 1.5, -2.9], fov: 43 }],
  pop: [{ f: 198, pos: [-8.6, 1.55, 2.9], look: [0.5, 1.2, -0.8], fov: 40, roll: 0 }, { f: 287, pos: [-7.1, 1.5, 2.2], look: [1.5, 1.15, -0.8], fov: 38, roll: -1.5 }],
  lights: [{ f: 288, pos: [1.0, 7.5, 18], look: [0, 4.6, -80], fov: 46, roll: 1 }, { f: 355, pos: [-0.6, 6.2, 9], look: [0.5, 4.2, -110], fov: 42, roll: -1 }],
  corridor: [{ f: 356, pos: [0.35, 1.7, 4.2], look: [0, 1.45, -30], fov: 50 }, { f: 394, pos: [0.3, 1.62, -2.2], look: [-1.0, 1.3, -11], fov: 48 },
    { f: 415, pos: [0.3, 1.55, -4.6], look: [-2.9, 0.95, -7.0], fov: 46, roll: 2 }],
  guardroom: [{ f: 416, pos: [0.3, 1.55, 4.2], look: [0, 1.45, -1.3], fov: 40, roll: 0 }, { f: 475, pos: [0.12, 1.5, 3.4], look: [0, 1.43, -1.3], fov: 39, roll: -2 }],
  idea: [{ f: 476, pos: [0.4, 1.7, 3.3], look: [0.2, 1.62, -1.0], fov: 42 }, { f: 498, pos: [0.35, 1.7, 3.0], look: [0.2, 1.62, -1.0], fov: 41 },
    { f: 514, pos: [0.3, 1.68, 1.3], look: [0.25, 1.68, -1.0], fov: 40, ease: 'easeOut' }, { f: 532, pos: [0.3, 1.68, 1.15], look: [0.25, 1.68, -1.0], fov: 39 }],
  barrier: [{ f: 533, pos: [3.2, 1.5, 7.5], look: [-1.8, 1.9, -2.5], fov: 44 }, { f: 569, pos: [2.2, 1.6, 6.6], look: [-2.6, 2.1, -2.0], fov: 42, roll: 1.5 }],
  buses: [{ f: 570, pos: [-3, 2.3, 7.8], look: [-4, 2.5, -1.6], fov: 46 }, { f: 643, pos: [6, 2.2, 7.4], look: [5, 2.5, -1.6], fov: 44 }],
  fjord: [{ f: 644, pos: [-1, 10, 48], look: [2, 6, -60], fov: 48, roll: -1 }, { f: 682, pos: [0, 9, 42], look: [3, 5.6, -60], fov: 46, roll: 0 }],
  ferry: [{ f: 683, pos: [-1.8, 2.8, -1.5], look: [4.5, 2.75, -6], fov: 44 }, { f: 764, pos: [-1.2, 3.0, -9.5], look: [5.6, 2.95, -11.6], fov: 44 }],
  handshake: [{ f: 765, pos: [0.15, 1.75, 7.5], look: [0, 1.75, 4.5], fov: 40 }, { f: 823, pos: [0.4, 3.4, 12], look: [0, 3.7, 2.0], fov: 44, ease: 'easeIn' }],
  chickens: [{ f: 824, pos: [-9.8, 1.5, -3.0], look: [-11.6, 1.4, -8.3], fov: 42 }, { f: 883, pos: [-10.4, 1.55, -3.9], look: [-11.6, 1.42, -8.3], fov: 40, roll: -1.5 }],
  veggies: [{ f: 884, pos: [2.2, 2.0, -0.8], look: [5.6, 1.75, -8.0], fov: 46 }, { f: 916, pos: [3.6, 1.95, -1.4], look: [6.6, 1.75, -8.2], fov: 44 }],
  market: [{ f: 917, pos: [-1.0, 1.7, 4.0], look: [-0.6, 1.5, -2.0], fov: 44 }, { f: 990, pos: [0.6, 1.66, 3.6], look: [0.8, 1.48, -2.0], fov: 42 }],
  pricetag: [{ f: 991, pos: [0.2, 1.4, 1.9], look: [0.75, 1.42, -1.9], fov: 42 }, { f: 1066, pos: [0.45, 1.4, 1.55], look: [0.85, 1.5, -1.9], fov: 42, roll: 2 }],
  rule: [{ f: 1067, pos: [0.35, 1.72, 2.6], look: [0.2, 1.74, -1.0], fov: 38 }, { f: 1116, pos: [0.3, 1.72, 1.75], look: [0.2, 1.74, -1.0], fov: 36, roll: -2 }],
  calendar: [{ f: 1117, pos: [-0.75, 1.7, 0.5], look: [-1.2, 1.66, -2.0], fov: 40 }, { f: 1140, pos: [-0.6, 1.66, 0.7], look: [-1.1, 1.6, -2.0], fov: 40 },
    { f: 1160, pos: [0.1, 1.55, 2.7], look: [0.55, 1.4, -0.4], fov: 42, ease: 'easeOut' }, { f: 1186, pos: [0.25, 1.52, 2.35], look: [0.6, 1.38, -0.4], fov: 41 }],
  busleave: [{ f: 1187, pos: [-5.2, 1.9, 4.5], look: [-1.0, 1.7, 17], fov: 44 }, { f: 1229, pos: [-4.6, 2.4, 5.6], look: [0, 2.3, 32], fov: 40 }],
  tiptoe: [{ f: 1230, pos: [-2.4, 1.7, 21], look: [-6.8, 1.45, 12.2], fov: 42 }, { f: 1287, pos: [-4.2, 1.65, 19.8], look: [-8.6, 1.42, 11.8], fov: 40 }],
  caught: [{ f: 1288, pos: [-5.8, 1.75, 17.6], look: [-8.0, 1.62, 12.4], fov: 40 }, { f: 1337, pos: [-5.3, 1.75, 17.0], look: [-7.3, 1.62, 12.6], fov: 39, roll: 1.5 }],
  rise: [{ f: 1338, pos: [0.5, 2.2, 19], look: [0, 5, 0], fov: 44 }, { f: 1388, pos: [0, 62, 36], look: [0, 130, -120], fov: 50, ease: 'easeIn' }],
  reveal: [{ f: 1389, pos: [55, 38, 150], look: [0, 0, -20], fov: 46 }, { f: 1422, pos: [6, 230, 330], look: [0, 0, -90], fov: 46, ease: 'easeOut' }, { f: 1449, pos: [0, 245, 350], look: [0, 0, -95], fov: 45 }],
};
const KICKS = [{ f: 128, a: 0.02 }, { f: 141, a: 0.02 }, { f: 512, a: 0.04 }, { f: 590, a: 0.02 }, { f: 781, a: 0.03 }, { f: 1031, a: 0.03 }, { f: 1297, a: 0.04 }];
export const camAt = (f) => {
  const S = shotAt(f);
  const c = camFromKeys(CAMS[S.id], f, { creep: 0.0012, kicks: KICKS });
  if (S.id === 'buses') { c.pos[0] = lerp(BUSX(570, 0) + 4, BUSX(643, 1) + 6, E.smooth(ramp(f, 570, 643))); c.look[0] = c.pos[0] - 0.5; }
  if (S.id === 'ferry') c.shadowAt = OFFI(f);
  if (S.id === 'hook') c.shadowAt = [0, 0, -14];
  if (S.id === 'reveal' || S.id === 'rise') c.shadowAt = [0, 0, -15];
  c.flash = 0;
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  const at = (p, k) => ({ focus: dist(C.pos, p), cinf: k });
  switch (S.id) {
    case 'guard': return at([0, 1.5, 2.6], 7);
    case 'board': return f < 158 ? at([1.9, 1.0, -1.25], 10) : at([-1.0, 1.75, -2.85], 4);
    case 'pop': return at([-2, 1.4, -0.7], 5);
    case 'guardroom': return at([0, 1.2, -1.35], 6);
    case 'idea': return at([0.2, 1.5, -0.9], 7);
    case 'barrier': return at([-1.6, 1.4, -2], 5);
    case 'ferry': return at(OFFI(f), 6);
    case 'handshake': return at([0, 1.5, 4.5], 6);
    case 'chickens': return at([-11.6, 1.0, -8.2], 7);
    case 'veggies': return at([6.2, 1.0, -7.4], 5);
    case 'market': return at([0, 1.3, -1.5], 5);
    case 'pricetag': return at([0.9, 1.3, -1.9], 8);
    case 'rule': return at([0.2, 1.6, -1.0], 8);
    case 'calendar': return f < 1150 ? at([-1.2, 1.65, -1.95], 7) : at([0.9, 1.2, -0.8], 7);
    case 'tiptoe': return at(PRI(f), 6);
    case 'caught': return at([-8.0, 1.4, 12.5], 7);
  }
  return { focus: 10, cinf: 0 };
};

// ---------- world state ----------
export const worldAt = (f) => {
  const S = shotAt(f), W = { set: SET_OF[S.id] };
  if (['chickens', 'veggies'].includes(S.id)) W.garden = true;
  if (S.id === 'reveal') W.dutch = true;
  if (S.id === 'board') { const steps = [[125, 0.84], [137, 0.68], [149, 0.52]]; let h = 1; for (const [ff, v] of steps) if (f >= ff) h = v + (f - ff < 5 ? 0.06 * Math.sin((f - ff) / 5 * Math.PI) : 0); W.hourglass = h; W.sand = ramp(f, 117, 197) * 0.6 + 0.2; }
  if (S.id === 'idea' || S.id === 'rule') W.hourglass = 0.52;
  if (S.id === 'lights') W.dark = Math.floor(clamp((f - 304) / 1.7, 0, 28));
  if (S.id === 'barrier') { W.barrier = E.back(ramp(f, 537, 553), 1.2); W.buses = [{ x: BUS9(f), z: -1.6 }]; }
  if (S.id === 'buses') { W.barrier = 1; W.buses = [0, 1, 2].map((i) => ({ x: BUSX(f, i), z: -1.6 })); }
  if (S.id === 'busleave') { const t = Math.max(0, f - 1207); W.pBus = { x: 0.3, z: 12 + t * t * 0.018, ry: -Math.PI / 2 }; }
  if (S.id === 'tiptoe' || S.id === 'caught') W.pBus = { x: 0.3, z: 12, ry: -Math.PI / 2 };
  return W;
};

// ---------- actors ----------
const C = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.castFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, k = 1) => { const i = idle(f, seed); return { bob: q(i.bob * k, 3), tilt: q(i.tilt * k, 1), headTilt: q(i.headTilt * k, 1) }; };
const CONS = ['conBeard', 'conGlasses', 'conTall', 'conBald'];
/** northern official dragging the money bag: character drawn 150 px right of the card centre so the bag fits on the left */
const OB = (T, o, pos) => ({ key: 'OB' + JSON.stringify(o), draw: (p) => { p.g.translate(150, 0); T.castFront(p, 'north', o); }, x: pos[0], y: pos[1], z: pos[2], ground: pos[1] });
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], push = (a) => out.push(a);
  const B = (seed) => blinkAt(f, seed);
  switch (S.id) {
    case 'guard': {
      const lk = f < 84 ? -0.7 : f < 98 ? 0.7 : 0;
      const fc = f < 84 ? -1 : f < 98 ? 1 : 0;
      push(C(T, 'guardThin', { expr: f < 104 ? 'nervous' : 'neutral', look: lk, facing: fc, L: 'hold', hold: { L: 'clipboard' }, R: f >= 104 ? 'cheek' : 'hang', blink: B(5), seed: 5, ...life(f, 5) }, [0, 0, 2.7]));
      break;
    }
    case 'board': {
      const pt = f > 165;
      push(C(T, 'warden', { expr: f > 182 ? 'sly' : 'smile', L: pt ? 'point' : 'hang', R: 'hip', facing: -1, look: -0.3, blink: B(3), seed: 3, ...life(f, 3) }, [-0.05, 0, -2.3]));
      break;
    }
    case 'pop': {
      const POPS = { 1: 222, 3: 233, 6: 244, 8: 255, 4: 266 };
      for (let i = 0; i < 10; i++) {
        const x = -6.3 + i * 1.4, who = CONS[(i * 3 + 1) % 4], pf = POPS[i];
        if (pf !== undefined && f >= pf + 4) continue;
        const k = pf !== undefined && f >= pf ? 1 - (f - pf) / 4 : 1;
        const sq = pf !== undefined && f >= pf - 3 && f < pf ? 1 + 0.08 * Math.sin((f - pf + 3) / 3 * Math.PI) : 1;
        push(C(T, who, { expr: pf !== undefined && f >= pf - 6 ? 'shock' : ['grin', 'smile_closed', 'neutral', 'smile'][i % 4], seed: 20 + i, blink: B(20 + i), look: (i % 3 - 1) * 0.4, ...life(f, 20 + i) }, [x, 0, -0.7], { s: q(Math.max(0.05, k) * sq, 2) }));
      }
      break;
    }
    case 'guardroom': {
      const yawn = f >= 432 && f < 462;
      push(C(T, 'guardFat', { expr: yawn ? 'yawn' : 'bored', blink: yawn ? 0 : 0.55, L: yawn ? 'yawn' : 'hold', R: 'hold', hold: { R: yawn ? null : 'mug' }, seed: 7, headTilt: yawn ? -6 : q(2 * Math.sin(f * 0.05), 1), bob: yawn ? 0.02 : 0, tilt: q(-2 + 1.5 * Math.sin(f * 0.04), 1) }, [-0.48, -0.06, -1.4]));
      const shuffle = Math.floor(f / 6) % 2;
      push(C(T, 'guardThin', { expr: 'bored', blink: B(8), look: -0.4, facing: -1, L: 'hold', R: shuffle ? 'hold' : 'belly', hold: { L: 'cards' }, seed: 8, ...life(f, 8) }, [0.52, -0.38, -1.4]));
      break;
    }
    case 'idea': {
      const push2 = f >= 502;
      push(C(T, 'warden', { expr: f < 483 ? 'neutral' : push2 ? 'grin' : 'smile', blink: f < 483 ? 0 : B(3), look: 0, L: 'hang', R: push2 ? 'forward' : f >= 488 ? 'up' : 'hang', hold: { R: push2 ? 'key' : null, big: 1.5 }, seed: 3, ...life(f, 3, 0.6) }, [0.2, 0, -1.0]));
      break;
    }
    case 'rule': {
      push(C(T, 'warden', { expr: 'stern', blink: B(3), R: f >= 1072 ? 'finger' : 'hang', L: 'hip', seed: 3, ...life(f, 3, 0.4) }, [0.2, 0, -1.0]));
      break;
    }
    case 'barrier': {
      const bx = BUS9(f);
      busRiders(T, f, push, bx, -1.6, 0, true, 0);
      break;
    }
    case 'buses': {
      for (let i = 0; i < 3; i++) busRiders(T, f, push, BUSX(f, i), -1.6, 0, i === 0, i);
      break;
    }
    case 'fjord': {
      const w = walk(f, 644, 0.9, 0.7);
      push(OB(T, { expr: 'grin', L: 'drag', hold: { L: 'bagDrag', big: 1.3, off: 34 }, step: q(w.phase, 2), seed: 9, blink: B(9) }, [3.6, 1.24, 1.0 - w.dist]));
      break;
    }
    case 'ferry': {
      const p = OFFI(f), w = walk(f, 686, 1.1, 0.7);
      const strain = f > 700 && f < 742;
      push(OB(T, { expr: f > 748 ? 'grin' : strain ? 'pained' : 'smile', L: 'drag', R: f > 748 ? 'hip' : 'hang', hold: { L: 'bagDrag', big: 1.3, off: 34 }, step: f < 760 ? q(w.phase, 2) : 0, facing: 1, tilt: strain ? 6 : 2, seed: 9, blink: B(9) }, p));
      break;
    }
    case 'handshake': {
      const shake = Math.sin((f - 765) * 0.55) * 0.05;
      push(C(T, 'warden', { expr: 'grin', R: 'shake', hy: q(0.16 + shake, 2), L: 'hang', seed: 3, blink: B(3), facing: 1, ...life(f, 3, 0.5) }, [-0.56, 0, 4.5]));
      push(C(T, 'north', { expr: 'laugh', L: 'shake', hy: q(shake, 2), R: 'hang', seed: 9, blink: B(9), facing: -1, ...life(f, 9, 0.5) }, [0.56, 0, 4.5]));
      push({ key: 'bagH', draw: (p) => T.bagCard(p, 1.6), x: 1.45, y: 0, z: 4.3 });
      break;
    }
    case 'chickens': {
      push(C(T, 'conBeard', { expr: f % 40 < 26 ? 'laugh' : 'joy', L: 'wave', wv: q(f * 0.4, 1), R: 'hug', hold: { R: 'chicken' }, cluck: f % 14 < 5 ? 1 : 0, seed: 11, blink: B(11), ...life(f, 11) }, [-11.4, 0, -8.0]));
      push(C(T, 'conGlasses', { expr: 'grin', L: 'hold', R: 'hang', seed: 12, blink: B(12), look: -0.5, facing: -1, ...life(f, 12) }, [-13.0, 0, -9.6]));
      [[-10.6, -7.0, 1, 0], [-12.2, -6.9, -1, 7], [-10.9, -9.4, 1, 3], [-12.8, -8.3, 1, 11], [-10.2, -8.3, -1, 5]].forEach(([x, z, sd, ph], i) => {
        const peck = (f + ph * 3) % 22 < 6 ? 1 : 0, cl = (f + ph * 5) % 30 < 6 ? 1 : 0;
        push({ key: `ck${sd}${peck}${cl}`, draw: (p) => T.chickenCard(p, cl, sd, peck), x: x + Math.sin((f + ph * 9) * 0.05) * 0.15, y: 0, z, s: 0.8 });
      });
      break;
    }
    case 'veggies': {
      push(C(T, 'conTall', { expr: 'grin', R: 'carry', hold: { R: 'can' }, tilt: 8, seed: 13, blink: B(13), look: 0.4, facing: 1, ...life(f, 13) }, [5.0, 0, -7.1]));
      push(C(T, 'conBald', { expr: 'laugh', L: 'wave', wv: q(f * 0.35, 1), R: 'hang', seed: 14, blink: B(14), ...life(f, 14) }, [8.4, 0, -9.3]));
      break;
    }
    case 'market': {
      const w = walk(f, 917, 0.6, 0.6);
      push(C(T, 'conBald', { expr: 'joy', R: 'carry', hold: { R: 'basket' }, L: 'hang', step: q(w.phase, 2), seed: 15, blink: B(15), facing: 1, ...life(f, 15) }, [-1.5 + w.dist * 0.5, 0, -1.1]));
      push(C(T, 'conBeard', { expr: 'grin', L: 'carry', hold: { L: 'basket' }, R: 'point', seed: 16, blink: B(16), facing: -1, look: -0.4, ...life(f, 16) }, [0.1, 0, -1.75]));
      push(C(T, 'conTall', { expr: 'laugh', R: 'carry', hold: { R: 'basket' }, L: 'thumb', seed: 17, blink: B(17), ...life(f, 17) }, [1.3, 0, -1.25]));
      break;
    }
    case 'pricetag': {
      const see = f >= 1005, jump = f >= 1016 ? Math.abs(Math.sin((f - 1016) / 15 * Math.PI)) * 0.42 : 0;
      push(C(T, 'conGlasses', { expr: see ? 'joy' : 'neutral', L: see ? 'cheer' : 'hang', R: see ? 'cheer' : 'carry', hold: { R: see ? null : 'basket' }, look: see ? 0 : -0.7, facing: see ? 0 : -1, seed: 18, blink: see ? 0 : B(18), ...life(f, 18) }, [0.95, q(jump, 3), -1.9], { ground: 0 }));
      break;
    }
    case 'calendar': {
      const done = f > 1168;
      push(C(T, 'conGlasses', { expr: done ? 'joy' : 'grin', L: 'hold', R: 'hold', hold: { R: 'suitcase' }, seed: 18, blink: B(18), ...life(f, 18) }, [0.6, 0, -0.2]));
      break;
    }
    case 'busleave': {
      const t = ramp(f, 1188, 1205), w = walk(f, 1188, 1.4, 0.7);
      if (f < 1206) push(C(T, 'conGlasses', { expr: 'grin', R: 'carry', hold: { R: 'suitcase' }, L: f > 1198 ? 'wave' : 'hang', wv: q(f * 0.5, 1), step: q(w.phase, 2), seed: 18, blink: B(18) }, [lerp(-2.0, -1.5, t), 0, lerp(9.5, 16.0, t)]));
      break;
    }
    case 'tiptoe': {
      const p = PRI(f);
      push(C(T, 'conBald', { expr: 'sly', L: 'sneak', R: 'hold', hold: { R: 'form' }, toe: q(((f - 1230) / 18) % 1, 2), look: -0.6, facing: -1, seed: 19, blink: B(19), headTilt: q(4 * Math.sin(f * 0.3), 1) }, p));
      break;
    }
    case 'caught': {
      const back = ramp(f, 1306, 1337), px = lerp(-8.4, -7.5, back), gx = px + 0.98;
      push(C(T, 'conBald', { expr: f < 1297 ? 'sly' : 'innocent', L: 'hang', R: 'hold', hold: { R: 'form' }, toe: f < 1297 ? q(((f - 1230) / 18) % 1, 2) : 0, look: f < 1297 ? -0.6 : 0.3, facing: f < 1297 ? -1 : 0, seed: 19, blink: B(19), headTilt: f >= 1297 ? -6 : 0 }, [px, 0, 12.5]));
      const gIn = ramp(f, 1288, 1297);
      push(C(T, 'guardThin', { expr: f < 1300 ? 'stern' : 'smile', L: gIn > 0.6 ? 'shoulder' : 'hang', R: 'hang', facing: -1, look: -0.5, seed: 5, blink: B(5), step: f < 1297 ? q(((f - 1288) / 16) % 1, 2) : 0 }, [lerp(gx + 2.2, gx, E.easeOut(gIn)), 0, 12.55]));
      break;
    }
  }
  return out;
};
/** prisoners waving from the near-side windows of a bus at (bx, bz) facing +x */
function busRiders(T, f, push, bx, bz, ry, driver, bi) {
  const seats = [-3.7, -2.15, -0.6, 0.95, 2.5];
  const H = { conBeard: 1.06, conGlasses: 1.2, conTall: 0.84, conBald: 1.06 };
  seats.forEach((sx, k) => {
    const who = CONS[(k + bi * 2) % 4], wv = q(f * 0.6 + k * 1.3, 1), up = (k + bi) % 2 === 0;
    push(C(T, who, { expr: (f + k * 7) % 40 < 22 ? 'laugh' : 'joy', L: up ? 'wave' : 'hang', R: up ? 'hang' : 'wave', wv, seed: 30 + k + bi * 5, blink: 0 }, [bx + sx, H[who], bz + 0.35], { s: 0.82, blob: false }));
  });
  if (driver) push(C(T, 'driver', { expr: 'laugh', R: 'wave', wv: q(f * 0.5, 1), seed: 40, blink: blinkAt(f, 40) }, [bx + 4.55, 0.95, bz + 0.1], { s: 0.82, blob: false }));
}

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [], C_ = camAt(f);
  const flatYaw = (x, z) => -Math.atan2(C_.pos[0] - x, C_.pos[2] - z);
  if (S.id === 'hook') { const [x, z] = HOOK_TW(f), ang = q((x - 15) / 1.5, 2); out.push(FX('tw' + ang, (p) => { p.g.translate(300, 500); p.g.rotate(ang); p.g.translate(-300, -500); T.fxTumble(p); }, [x, Math.abs(Math.sin(f * 0.25)) * 1.1, z], 3.3, { shadow: true, order: 3 })); }
  if (S.id === 'board' && f >= 160) { const k = q(E.easeOut(ramp(f, 162, 192)), 2); out.push(FX('chalk' + k, (p) => T.fxChalk(p, k), [-1.05, -0.86, -2.8], 2.0, { yaw: flatYaw(-1.05, -2.8), order: 2 })); }
  if (S.id === 'pop') {
    const POPS = { 1: 222, 3: 233, 6: 244, 8: 255, 4: 266 };
    for (const [i, pf] of Object.entries(POPS)) if (f >= pf && f < pf + 14) { const t = q((f - pf) / 14, 2); out.push(FX('puff' + t, (p) => { p.g.translate(150, 300); p.g.scale(1.6, 1.6); T.fxPuff(p, t); }, [-6.3 + i * 1.4, 0.3, -0.5], 1.4)); }
  }
  if (S.id === 'lights') {
    const dark = Math.floor(clamp((f - 304) / 1.7, 0, 28));
    for (let k = 0; k < Math.min(dark, 12); k++) { const i = k >> 1, sd = k % 2 ? 1 : -1, z = -6 - i * 17 - (sd > 0 ? 8 : 0), t = q(clamp((f - (304 + k * 1.7)) / 6, 0, 1), 2);
      out.push(FX('lock' + t, (p) => T.fxLock(p, E.back(t)), [sd * (10.5 - 2.9), 0.75, z], 1.3, { shadow: false })); }
  }
  if (S.id === 'corridor') for (const [x, y, z, s] of [[-1.35, 2.55, -3.4, 0.55], [1.35, 2.6, -8.6, 0.5], [-1.35, 2.6, -13.5, 0.5], [-2.6, 2.3, -6.4, 0.5]]) out.push(FX('web', (p) => T.fxWeb(p), [x, y, z], s, { order: 1 }));
  if (S.id === 'idea' && f >= 480) { const t = q(clamp((f - 480) / 10, 0, 1), 2); out.push(FX('bulb' + t, (p) => T.fxBulb(p, t), [-0.3, 1.04, -0.95], 0.48, { order: 6 })); }
  if (S.id === 'idea' && f >= 503 && f < 520) { const t = q((f - 503) / 17, 2); out.push(FX('spark' + t, (p) => T.fxSpark(p, t), [0.62, 0.65, -0.6], 0.35)); }
  if (S.id === 'veggies') { const t = q(((f - 884) / 12) % 1, 2); out.push(FX('drops' + t, (p) => T.fxDrops(p, t), [5.72, 0.05, -6.95], 0.35)); }
  if (S.id === 'pricetag') {
    const g = q(f >= 1005 ? clamp((f - 1005) / 8, 0, 1) * (0.7 + 0.3 * Math.sin(f * 0.6)) : 0, 2);
    out.push(FX('tag' + g, (p) => T.fxTag(p, g), [0.3, 0.5, -1.25], 0.45, { order: 4 }));
    if (f >= 1016) for (let i = 0; i < 3; i++) { const t = q(((f - 1016) / 16 + i / 3) % 1, 2); out.push(FX('sp' + t, (p) => T.fxSpark(p, t), [0.45 + i * 0.45, 1.6 + i * 0.15, -1.7], 0.3)); }
  }
  if (S.id === 'calendar') {
    const torn = Math.floor(clamp((f - 1119) / 5, 0, 8));
    out.push(FX('cal' + torn, (p) => T.fxCalendar(p, torn), [-1.2, 0.95, -1.95], 0.75, { yaw: flatYaw(-1.2, -1.95), order: 1 }));
    for (let k = 0; k < torn; k++) { const t = (f - (1119 + k * 5)) / 22; if (t < 0 || t > 1 || f > 1158) continue; const x = -1.2 - t * (0.9 + (k % 3) * 0.4), y = 0.95 + t * 1.3, z = -1.9 + t * 1.2, ang = q(t * (k % 2 ? 3 : -3), 2); out.push(FX('pg' + k + ang, (p) => { p.g.translate(300, 320); p.g.rotate(ang); p.g.translate(-300, -320); T.fxPage(p, k, 0.5); }, [x, y, z], 0.45)); }
  }
  if (S.id === 'reveal') {
    for (let i = 0; i < 7; i++) { const z = 30 + ((f * 0.35 + i * 46) % 300); out.push(FX('bike' + (i % 3) + (Math.floor(f / 3) % 4), (p) => T.fxBike(p, (Math.floor(f / 3) % 4) / 4, ['#e05a8a', '#3f8fd9', '#f2c230'][i % 3]), [12.5 + (i % 2) * 1.6, 0, z], 2.2, { shadow: true })); }
    for (let i = 0; i < 5; i++) { const x = -220 + ((f * 0.4 + i * 90) % 440); out.push(FX('bikeH' + (i % 3) + (Math.floor(f / 3) % 4), (p) => T.fxBike(p, (Math.floor(f / 3) % 4) / 4, ['#e05a8a', '#3f8fd9', '#f2c230'][i % 3]), [x, 0, 270.5 + (i % 2) * 1.5], 3.2, { shadow: true })); }
  }
  return out;
};
