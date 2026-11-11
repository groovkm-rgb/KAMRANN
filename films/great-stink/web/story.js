// Der große Gestank — London 1858. voice.mp3 = 47.60 s, TOTAL = 47.60 + 0.5 s tail = 1443 frames @ 30 fps.
// Phrase times (silence-aligned, hand-checked against the RMS envelope; cut frame = middle of the gap before the phrase):
//  0.07- 2.90 Ein Gestank hat einmal eine ganze Stadt gerettet.        cut   0
//  2.98- 5.17 London, ein extrem heißer Sommer.                         cut  88
//  5.45- 7.98 Der Fluss mitten in der Stadt ist eine offene Kloake.     cut 160
//  8.29- 9.59 Alles landet dort drin.                                   cut 243
//  9.81-12.30 Und in der Hitze … fängt er an zu stinken. Richtig.       cut 290  ("Richtig" 11.88 = f356)
// 12.71-14.10 Wer kann, flieht aus der Stadt.                           cut 375
// 14.42-16.49 Und das Parlament? Liegt direkt am Fluss.                 cut 428  ("Liegt" 15.46 = f464)
// 17.06-19.15 Die Abgeordneten tränken ihre Vorhänge mit Chlorkalk.     cut 499
// 19.37-20.96 Halten sich Taschentücher vor die Nase.                   cut 578
// 21.24-22.14 Es hilft nichts.                                          cut 633
// 22.34-25.20 Jahrelang wurde über neue Abwasserkanäle nur geredet.     cut 667
// 25.52-27.30 Jetzt geht es plötzlich ganz schnell:                     cut 757
// 27.56-29.37 In nur achtzehn Tagen | ist das Gesetz durch.             cut 823, flash 851 (word gap 28.38), "durch" 29.06 = f871
// 29.66-31.04 Denn die meisten glauben damals:                          cut 886
// 31.26-32.63 Krankheiten kommen vom Gestank.                           cut 935
// 32.89-33.76 Das war falsch.                                           cut 984
// 34.14-36.56 Die tödliche Cholera kam aus verseuchtem Trinkwasser.     cut 1022, flash 1052
// 36.87-40.05 Aber die neuen Kanäle | leiten genau dieses Abwasser aus der Stadt.   cut 1101, word gap 37.90 -> cut 1137
// 40.20-42.54 Und die Cholera verschwindet nach und nach.               cut 1203
// 42.79-44.64 Falscher Grund. Richtige Lösung.                          cut 1279 ("Richtige" 43.72 = f1311)
// 45.04-47.32 Und Teile dieser Kanäle | sind bis heute in Betrieb.      cut 1344, word gap 46.14 -> cut 1384, end 1442
export const FPS = 30, TOTAL = 1443;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const easeOut = (t) => 1 - (1 - clamp(t)) ** 3.2;
const lerp = (a, b, t) => a + (b - a) * t, lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t)), ramp = (f, a, b) => clamp((f - a) / (b - a));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const K = (f, pos, look, fov = 40, e = 'out', roll = 0) => ({ f, pos, look, fov, e, roll });

// ---------------- shots ----------------
export const SHOTS = [
  { id: 'hero', a: 0, b: 87, light: 'heat', loc: ['city'], cam: [K(0, [58, 62, 178], [19, 33, 108], 46), K(22, [31, 40.5, 129], [19, 33.5, 108], 42), K(87, [29, 39, 125], [19, 34, 108], 41, 'lin', -2)] },
  { id: 'street', a: 88, b: 159, light: 'heat', loc: ['street'], flash: 1, cam: [K(88, [-4.6, 1.55, 4.0], [-5.85, 1.5, 3.0], 38), K(112, [-4.3, 1.6, 4.3], [-5.85, 1.5, 3.0], 36, 'lin'), K(128, [1.2, 1.6, 7.5], [-1.6, 1.2, -1.0], 44), K(159, [1.0, 1.55, 6.8], [-1.6, 1.2, -1.0], 42, 'lin', 2)] },
  { id: 'river', a: 160, b: 242, light: 'river', loc: ['river'], flash: 1, cam: [K(160, [-2.5, 2.8, 23.5], [0, -2.2, 12], 46), K(184, [-1, 2.4, 22.8], [1, -2.2, 12], 44), K(242, [2.0, 2.2, 22.5], [3.5, -2.2, 11], 43, 'lin', -2)] },
  { id: 'pour', a: 243, b: 289, light: 'river', loc: ['river'], cam: [K(243, [-6, 0.8, -8], [-4, -0.8, -23], 40), K(262, [6, 0.9, -8], [7, -0.6, -23], 40), K(289, [16, 1.4, -10], [20, 0.4, -25], 42, 'out', 2)] },
  { id: 'stink', a: 290, b: 374, light: 'river', loc: ['river'], cam: [K(290, [-1.6, 1.4, 32], [0.4, 0.9, 24.5], 44), K(312, [-0.6, 1.05, 30.2], [0.6, 0.7, 24.8], 40), K(374, [-0.2, 0.95, 29.3], [0.7, 0.62, 24.9], 38, 'lin', 3)] },
  { id: 'flee', a: 375, b: 427, light: 'heat', loc: ['street'], flash: 1, cam: [K(375, [5.2, 1.8, 8], [-2.5, 1.5, 6], 46), K(395, [5.2, 1.8, 2], [-2.5, 1.4, -1], 46), K(427, [5.0, 1.9, -4], [-2.5, 1.3, -9], 48, 'lin', -3)] },
  { id: 'parl', a: 428, b: 498, light: 'parl', loc: ['river'], flash: 1, cam: [K(428, [-3, 2.0, 31], [-14, 21, -34], 52), K(450, [-5, 2.2, 28], [-15, 17, -34], 48), K(468, [-7, 2.2, 24], [-17, 7, -30], 46), K(498, [-8, 2.3, 21], [-18, 8, -30], 44, 'lin')] },
  { id: 'curtain', a: 499, b: 577, light: 'hall', loc: ['hall'], flash: 1, cam: [K(499, [0.6, 2.3, -2.2], [0.1, 1.2, -10.6], 52), K(520, [0.4, 1.9, -3.6], [0.1, 1.15, -10.6], 50), K(577, [0.35, 1.85, -4.2], [0.1, 1.15, -10.6], 48, 'lin', 2)] },
  { id: 'hanky', a: 578, b: 632, light: 'hall', loc: ['hall'], cam: [K(578, [1.0, 1.7, 6.5], [-4, 1.5, 4.0], 46), K(596, [1.0, 1.6, 4.5], [-4, 1.5, 1.6], 44), K(632, [1.0, 1.6, 3.2], [-4, 1.5, 0.4], 42, 'lin')] },
  { id: 'faint', a: 633, b: 666, light: 'hall', loc: ['hall'], cam: [K(633, [0.6, 1.9, 5.2], [-2.6, 2.0, 1.4], 46), K(645, [0.4, 1.65, 4.4], [-2.6, 1.4, 1.6], 42), K(666, [0.3, 1.6, 4.1], [-2.6, 1.2, 1.6], 41, 'lin', -3)] },
  { id: 'talk', a: 667, b: 756, light: 'flashback', loc: ['hall'], flash: 1, cam: [K(667, [0.3, 1.5, 3.8], [0, 1.25, 2.5], 40), K(690, [0.8, 1.7, 5.0], [-0.3, 1.25, 2.4], 44), K(756, [1.4, 1.9, 6.8], [-1.8, 1.3, 2.0], 48, 'lin')] },
  { id: 'jump', a: 757, b: 822, light: 'hall', loc: ['hall'], flash: 1, cam: [K(757, [1.8, 1.4, 7.6], [-2.4, 1.6, 2.0], 50), K(770, [1.6, 1.3, 6.8], [-2.4, 2.0, 2.0], 46), K(822, [1.5, 1.25, 6.2], [-2.4, 2.1, 2.0], 44, 'lin', 3)] },
  { id: 'seal', a: 823, b: 885, light: 'parl', loc: ['river'], cam: [K(823, [-5, 46, -12], [-6, 48.8, -28.75], 40), K(851, [-5.6, 48, -19], [-6, 49, -28.75], 36, 'lin', 2)],
    b2: { f: 851, light: 'hall', loc: ['hall'], cam: [K(851, [0.15, 1.55, 3.7], [0, 1.2, 2.5], 40), K(873, [0.2, 1.5, 3.5], [0, 1.2, 2.5], 39, 'lin'), K(880, [1.4, 1.8, 6.6], [-1.6, 1.6, 2.2], 48), K(885, [1.4, 1.8, 6.4], [-1.6, 1.7, 2.2], 47, 'lin')] } },
  { id: 'doc', a: 886, b: 934, light: 'river', loc: ['river'], flash: 1, cam: [K(886, [-0.9, 1.7, 31], [0.1, 1.6, 26], 40), K(904, [-0.6, 1.62, 29.4], [0.1, 1.6, 26], 36), K(934, [-0.5, 1.6, 29.0], [0.1, 1.6, 26], 35, 'lin')] },
  { id: 'doc2', a: 935, b: 983, light: 'river', loc: ['river'], cam: [K(935, [-2.2, 1.7, 31.2], [0.9, 1.8, 24.8], 44), K(983, [-2.0, 1.65, 30.6], [0.9, 1.8, 24.8], 42, 'lin', 2)] },
  { id: 'false', a: 984, b: 1021, light: 'river', loc: ['river'], cam: [K(984, [-1.5, 1.6, 29.6], [0.6, 1.75, 25], 40), K(1021, [-1.3, 1.6, 29.1], [0.6, 1.75, 25], 38, 'lin', -3)] },
  { id: 'micro', a: 1022, b: 1100, light: 'micro', loc: ['micro'], flash: 1, cam: [K(1022, [0, 1.5, 1.75], [0, 1.5, 0], 40), K(1052, [0.02, 1.5, 1.5], [0.02, 1.5, 0], 40, 'lin', 6)],
    b2: { f: 1052, light: 'heat', loc: ['street'], pipe: 1, cam: [K(1052, [-2.3, 1.05, 19.5], [-3.2, 0.2, 14], 46), K(1080, [-2.2, 1.1, 6.5], [-3.2, 0.3, 1], 44, 'lin'), K(1090, [-0.4, 1.6, 4.0], [-2.6, 1.0, -2], 46), K(1100, [-0.4, 1.6, 3.7], [-2.6, 1.0, -2], 45, 'lin')] } },
  { id: 'tunA', a: 1101, b: 1136, light: 'tunnel', loc: ['tunnel'], flash: 1, cam: [K(1101, [1.2, 2.0, -0.6], [-2.4, 1.0, -8.0], 50), K(1136, [1.0, 1.85, -2.0], [-2.4, 0.95, -8.0], 48, 'lin')] },
  { id: 'tunB', a: 1137, b: 1202, light: 'tunnel', loc: ['tunnel'], cam: [K(1137, [0.4, 1.4, -16.5], [0, -0.2, -30], 46), K(1150, [0.3, 1.0, -19], [0, -0.3, -32], 44), K(1202, [0.2, 0.9, -20.5], [0, -0.3, -36], 42, 'lin')] },
  { id: 'clean', a: 1203, b: 1278, light: 'clean', loc: ['river'], flash: 1, cam: [K(1203, [-1.8, 2.4, 36], [1.6, 1.0, 26.2], 52), K(1226, [-0.8, 1.7, 33.6], [1.6, 1.0, 26.2], 50), K(1278, [-0.5, 1.6, 33.0], [1.7, 1.0, 26.2], 48, 'lin')] },
  { id: 'shake', a: 1279, b: 1343, light: 'clean', loc: ['river'], cam: [K(1279, [0.2, 1.75, 32.4], [0.95, 1.6, 25.8], 46), K(1300, [0.3, 1.7, 31.6], [0.95, 1.6, 25.8], 44), K(1343, [0.35, 1.65, 31.2], [0.95, 1.6, 25.8], 43, 'lin', 2)] },
  { id: 'modT', a: 1344, b: 1383, light: 'modernT', loc: ['tunnel'], flash: 1, cam: [K(1344, [0.9, 1.6, -29.5], [-2.75, 1.3, -35], 46), K(1383, [0.6, 1.6, -31.5], [-2.75, 1.3, -36.5], 44, 'lin')] },
  { id: 'modS', a: 1384, b: 1442, light: 'modern', loc: ['modern'], flash: 1, cam: [K(1384, [0, 0.15, 2.4], [0.3, 8, 1.4], 64), K(1400, [0.4, 1.8, 6.5], [-3, 2.2, -3], 50), K(1418, [0.6, 1.9, 6.8], [0, 2.6, -3], 48, 'lin'), K(1442, [0.8, 2.0, 7.2], [6, 11, -18], 52)] },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const fleeZ = (f) => lerp(6, -10, smooth(ramp(f, 372, 432)));
const part = (S, f) => (S.b2 && f >= S.b2.f ? S.b2 : S);

// ---------------- lights ----------------
const BASE = { az: 120, el: 48, sky: '#f4d8b0', ground: '#7a6058', hemi: 1.2, sun: '#ffe2b0', sunI: 2.6, fog: '#f0cc98', fogNear: 80, fogFar: 700,
  skyTop: '#d8925a', skyHor: '#f8dcaa', sat: 1.12, waterDeep: '#3e3420', waterShal: '#6a5c30', glint: '#9a9050', vig: 0.24, shadowExt: 16, sunDisc: '#fff2c0', sunSize: 0.012 };
export const LIGHTS = {
  heat: { ...BASE },
  river: { ...BASE, fog: '#d8c48a', skyHor: '#e8d49a', skyTop: '#c89a5a', sun: '#ffe0a0', shadowExt: 30, fogFar: 600 },
  parl: { ...BASE, az: 60, el: 34, fog: '#e8c48e', fogFar: 520, shadowExt: 60 },
  hall: { ...BASE, sky: '#ffe2b8', ground: '#5a3a2a', hemi: 1.45, sunI: 1.2, az: 200, el: 55, fog: '#3a2a20', fogNear: 30, fogFar: 200, vig: 0.3, shadowExt: 14 },
  flashback: { ...BASE, sky: '#ffe2b8', ground: '#5a3a2a', hemi: 1.45, sunI: 1.1, az: 200, el: 55, fog: '#3a2a20', fogNear: 30, fogFar: 200, sat: 0.35, gain: '#ffe6b8', lift: '#1a1008', vig: 0.42, shadowExt: 14 },
  micro: { ...BASE, sky: '#e0f0c0', ground: '#6a8a40', hemi: 1.6, sunI: 0.6, sat: 1.15, vig: 0.1 },
  tunnel: { ...BASE, sky: '#ffb870', ground: '#4a2a1a', hemi: 1.15, sun: '#ffb060', sunI: 0.5, az: 90, el: 80, fog: '#1e120c', fogNear: 10, fogFar: 70, sat: 1.15, vig: 0.38,
    waterDeep: '#3a4a3a', waterShal: '#6a7a50', glint: '#ffd8a0', shadowExt: 12 },
  clean: { ...BASE, az: 130, el: 52, sky: '#cfe2ff', ground: '#7a7088', hemi: 1.25, sun: '#fff6e6', sunI: 2.5, fog: '#c8dcf4', skyTop: '#3d82dc', skyHor: '#c8ddf4', sat: 1.2,
    waterDeep: '#2a6c94', waterShal: '#5ab0cc', glint: '#f0fbff', shadowExt: 18, vig: 0.18 },
  modernT: { ...BASE, sky: '#dfeeff', ground: '#3a4250', hemi: 1.5, sun: '#e8f2ff', sunI: 0.4, el: 80, fog: '#0e141c', fogNear: 14, fogFar: 80, sat: 1.05, waterDeep: '#2a4a5a', waterShal: '#4a7a8a', glint: '#e0f4ff', vig: 0.3 },
  modern: { ...BASE, az: 150, el: 50, sky: '#cfe2ff', ground: '#7a7088', hemi: 1.25, sun: '#fff6e6', sunI: 2.5, fog: '#c8dcf4', skyTop: '#3a80da', skyHor: '#c6dcf4', sat: 1.18, shadowExt: 24, vig: 0.16 },
};
export const lightFor = (S, f) => ({ ...LIGHTS[part(S, f).light || S.light] });

// ---------------- camera ----------------
const KICKS = [{ f: 140, a: 0.012 }, { f: 354, a: 0.02 }, { f: 645, a: 0.025 }, { f: 760, a: 0.03 }, { f: 870, a: 0.035 }, { f: 986, a: 0.025 }, { f: 1386, a: 0.02 }];
export const camAt = (f) => {
  const S = shotAt(f), P_ = part(S, f), Ks = P_.cam;
  let c;
  if (f <= Ks[0].f) c = { ...Ks[0] }; else if (f >= Ks[Ks.length - 1].f) {
    const a = Ks[Ks.length - 1], b = Ks[Ks.length - 2] || a, d = f - a.f; // keep creeping past the last key
    c = { pos: a.pos.map((v, i) => v + (v - b.pos[i]) / Math.max(1, a.f - b.f) * d * 0.5), look: a.look, fov: a.fov, roll: a.roll };
  } else for (let i = 0; i < Ks.length - 1; i++) if (f >= Ks[i].f && f < Ks[i + 1].f) {
    const a = Ks[i], b = Ks[i + 1], r = (f - a.f) / (b.f - a.f), t = b.e === 'out' ? easeOut(r) : b.e === 'lin' ? r : smooth(r);
    c = { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) }; break;
  }
  c = { ...c, pos: [...c.pos], look: [...c.look] };
  if (S.id === 'flee') { const zc = fleeZ(f); c.pos = [6.4, 1.9, zc + 2.4 - ramp(f, 375, 427) * 1.5]; c.look = [-2.5, 1.35, zc - 0.6]; c.fov = 48; c.roll = -2 * ramp(f, 375, 427); }
  for (const k of KICKS) { const d = f - k.f; if (d >= 0 && d < 7) { const s = (d % 2 ? -1 : 1) * k.a * (1 - d / 7); c.look[1] += s * 3; c.look[0] += s * 2; c.roll = (c.roll || 0) + s * 30; } }
  const fs = P_ === S ? S.a : P_.f; c.flash = 0;
  if (S.flash || P_ !== S) { const d = f - fs; if (d >= 0 && d < 4) c.flash = (1 - d / 4) * 0.85; }
  c.shadowAt = c.look;
  return c;
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOC = { hero: [[20, 34, 108], 3], street: [[-5.85, 1.5, 3.0], 12], river: [[1, -2, 12], 6], pour: [[8, 0, -23], 3], stink: [[0.9, 0.5, 25], 14], flee: [[-1.2, 1.4, 0], 8], parl: [[-22, 10, -30], 2],
  curtain: [[1.2, 1.4, -9.4], 13], hanky: [[-2.6, 1.6, 2.0], 12], faint: [[-2.6, 1.5, 0.8], 14], talk: [[0, 1.1, 2.5], 12], jump: [[-2.6, 1.8, 2.0], 10], seal: [[-6, 49, -28.75], 2],
  doc: [[0.1, 1.6, 26], 15], doc2: [[0.1, 1.6, 26], 12], false: [[0.1, 1.6, 26], 14], micro: [[0, 1.5, 0.4], 6], tunA: [[-1.6, 1.4, -6.5], 12], tunB: [[0, 0.3, -30], 6],
  clean: [[1.0, 1.2, 26], 11], shake: [[0.9, 1.6, 25.9], 14], modT: [[-1.6, 1.5, -35], 12], modS: [[0, 3, -6], 3] };
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f); let [p, k] = FOC[S.id];
  if (S.id === 'seal' && f >= 851) { p = f < 872 ? [0, 1.0, 2.5] : [-1.4, 1.7, 2.0]; k = 12; }
  if (S.id === 'micro' && f >= 1052) { p = f < 1086 ? camPipeGerm(f) : [-2.6, 1.0, -2]; k = 10; }
  return { focus: dist(C.pos, p), cinf: k };
};
const camPipeGerm = (f) => [-3.2, 0.3, pipeZ(f, 0)];
const pipeZ = (f, i) => 17.5 - (f - 1052) * 0.47 - i * 1.4;

// ---------------- world state ----------------
export const worldAt = (f) => {
  const S = shotAt(f), P_ = part(S, f), W = { loc: P_.loc || S.loc };
  if (S.id === 'pour') W.tip = smooth(ramp(f, 262, 280));
  if (S.id === 'seal' && f < 851) W.spin = Math.pow(ramp(f, 823, 851), 1.6) * 3;
  if (P_.pipe) { W.pipe = 1; W.pumping = f > 1084; }
  if (S.id === 'clean') { W.cleanPump = 1; W.pumping = true; }
  if (S.id === 'shake') W.cleanPump = 1;
  if (S.id === 'tunA') { W.water = 0; }
  if (S.id === 'tunB') { W.water = 0.15 + 0.6 * smooth(ramp(f, 1137, 1165)); W.building = false; }
  if (S.id === 'modT') { W.modern = 1; W.water = 0.55; W.building = false; }
  if (S.id === 'modS') { W.manholeOpen = f >= 1386; W.busX = 12 + (f - 1384) * 0.5; W.taxiX = 6 + (f - 1384) * 0.4; }
  return W;
};

// ---------------- actors ----------------
const blinkAt = (f, seed) => { const per = 40 + (seed * 17) % 30, ph = (f + seed * 13) % per; return ph < 2 ? 0.5 : ph < 4 ? 1 : 0; };
const C = (T, spec, o, pos, extra = {}) => ({ key: JSON.stringify([spec, o]), draw: (p) => T.toonChar(p, spec, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const X = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, ...extra });
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
const tq = (f, n = 1) => q(f / 30, 3);
const crowd = (T, i) => T.crowdMP(i);
// smoke puff (chimneys, carriages, dust)
const puff = (p, t, col = '230,220,200') => { const g = p.g; for (let i = 0; i < 5; i++) { const a = i * 1.3, r = (60 + i * 14) * (0.5 + t), y = 760 - t * 420 - i * 60;
  g.fillStyle = `rgba(${col},${(0.75 * (1 - t)).toFixed(3)})`; g.beginPath(); g.ellipse(300 + Math.sin(a + t * 2) * 60 * (1 + t), y, r, r * 0.8, 0, 0, 7); g.fill(); } };
// heat shimmer lines
const shimmer = (p, t) => { const g = p.g; g.globalAlpha = 0.35; g.strokeStyle = '#fff4d8'; g.lineWidth = 5; for (let k = 0; k < 4; k++) { g.beginPath(); for (let i = 0; i <= 20; i++) { const x = 80 + i * 22, y = 300 + k * 160 + Math.sin(i * 0.8 + t * 6 + k) * 14; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } g.globalAlpha = 1; };
const birds = (p, t) => { const g = p.g; g.strokeStyle = '#2a2430'; g.lineWidth = 7; g.lineCap = 'round'; for (let k = 0; k < 4; k++) { const x = 120 + k * 110 + t * 40, y = 300 + Math.sin(k * 2 + t) * 50, w = Math.sin(t * 12 + k) * 14; g.beginPath(); g.moveTo(x - 30, y - w); g.quadraticCurveTo(x - 12, y - 18, x, y); g.quadraticCurveTo(x + 12, y - 18, x + 30, y - w); g.stroke(); } };
const sparkle = (p, t) => { const g = p.g; for (let k = 0; k < 5; k++) { const ph = (t * 1.3 + k * 0.23) % 1, s = Math.sin(ph * Math.PI) * 50, x = 150 + (k * 97) % 300, y = 350 + (k * 131) % 400; g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.2, y); g.lineTo(x, y + s); g.lineTo(x - s * 0.2, y); g.closePath(); g.moveTo(x - s, y); g.lineTo(x, y + s * 0.2); g.lineTo(x + s, y); g.lineTo(x, y - s * 0.2); g.fill(); } };

export const actorsAt = (f, T) => {
  const S = shotAt(f), id = S.id, t = f / 30, out = [];
  if (id === 'hero') { // the caped stink cloud rises over the hot city
    const rise = easeOut(ramp(f, 0, 26)), y = lerp(16, 25.5, rise) + Math.sin(t * 3) * 0.3;
    out.push(X('cl' + tq(f), (p) => T.stinkCloud(p, { t, cape: true, expr: f < 50 ? 'proud' : 'smug', arms: 'none', armsR: 'hero', armsL: 'fist', nflies: 6 }), [20, y, 108], 8, { blob: false, order: 3 }));
  }
  if (id === 'street') {
    const lvl = lerp(0.82, 1.05, ramp(f, 88, 140)), crack = f >= 140 ? Math.min(1, (f - 140) / 4) : 0;
    out.push(X('th' + q(lvl) + crack, (p) => T.thermo(p, lvl, crack), [-5.82, 0.55, 3.0], 0.62, { blob: false, shadow: false }));
    const fanA = (k) => q(Math.sin(t * 14 + k) * 0.5, 2);
    out.push(C(T, 'mum', { expr: 'worried', look: 0.3, blink: blinkAt(f, 1), R: { x: 470, y: 330 }, holdR: 'fan', fanA: fanA(0), L: 'hip', headTilt: -4 }, [-1.6, 0, -0.6]));
    out.push(C(T, 'mp2', { expr: 'squint', R: { x: 470, y: 320 }, holdR: 'fan', fanA: fanA(2), L: 'hang', turn: -0.3 }, [0.9, 0, -2.6]));
    out.push(C(T, crowd(T, 4), { expr: 'worried', blink: blinkAt(f, 4), L: { x: 130, y: 330 }, holdL: 'fan', fanA: fanA(4), R: 'hip', turn: 0.3, noHat: false }, [-0.4, 0, -6], { s: 0.95 }));
    out.push(X('dog' + tq(f), (p) => T.dog(p, { t }), [-3.0, 0, 0.6], 0.62));
  }
  if (id === 'river' || id === 'pour' || id === 'stink' || id === 'doc' || id === 'doc2' || id === 'false' || id === 'parl' || (id === 'seal' && f < 851)) {
    // murky river life: bubbles everywhere, flies over the water
    if (id === 'river' || id === 'stink' || id === 'pour') for (let k = 0; k < 7; k++) { const x = -8 + k * 3.3, z = 6 + ((k * 7) % 12); out.push(FX('bb' + k + tq(f), (p) => T.bubbles(p, t, k), [x, -2.2, z], 1.2, { order: 3 })); }
  }
  if (id === 'river') { for (let k = 0; k < 3; k++) out.push(FX('fl' + k + tq(f), (p) => T.flies(p, t, 7, 300, 500, 240, k), [-2 + k * 4, -0.6, 12 - k * 2], 1.3)); }
  if (id === 'pour') {
    for (const [i, [x, y, z]] of [[0, [-4, 0.2, -22.3]], [1, [6, 0.2, -22.3]], [2, [14, 0.2, -22.3]], [3, [26, 0.2, -22.3]]]) out.push(FX('po' + i + tq(f), (p) => T.pour(p, t + i, '#7a7a3a', 700, 3), [x, -2.25, z + 0.3], 1.55, { order: 3 }));
    const tip = smooth(ramp(f, 262, 280)); if (tip > 0.5) out.push(FX('pc' + tq(f), (p) => T.pour(p, t, '#6a6a34', 880, 2.2), [19.0, -2.25, -24.4], 2.8, { order: 3 }));
    for (let k = 0; k < 2; k++) out.push(FX('sp' + k + tq(f), (p) => T.smell(p, t, 0.8, k), [6 + k * 14, -2.2, -18], 3.0));
    out.push(FX('fs' + tq(f), (p) => puff(p, (t * 0.6) % 1, '120,110,100'), [27, 26, -48], 10));
  }
  if (id === 'stink') {
    const w = smooth(ramp(f, 318, 350)), k = smooth(ramp(f, 292, 330));
    for (let i = 0; i < 4; i++) out.push(FX('sm' + i + tq(f), (p) => T.smell(p, t + i * 0.7, k, i), [-3 + i * 2.6, -2.2, 14 + (i % 2) * 3], 3.4, { order: 3 }));
    for (let i = 0; i < 5; i++) out.push(X('fw' + i + q(w), (p) => T.flower(p, w * (0.8 + (i % 3) * 0.1), ['#e8506a', '#f2a03a', '#d86ae0', '#e8506a', '#f2c43a'][i], i), [-1.7 + i * 0.5, 0, 25.2 + (i % 2) * 0.5], 0.36, { blob: false }));
    const faint = smooth(ramp(f, 350, 357));
    out.push(X('cat' + q(faint), (p) => T.cat(p, { faint }), [0.85, 0, 25.4], 0.5));
    if (f > 356) { const st = ((f - 356) % 24) / 24; out.push(FX('st' + q(st), (p) => T.fxStars(p, st), [0.6, 0.4, 25.5], 0.4)); }
    out.push(FX('fl' + tq(f), (p) => T.flies(p, t, 6, 300, 500, 230, 2), [0.6, 0.0, 24.6], 0.75));
  }
  if (id === 'flee') { // the rich family dashes off in an open carriage, holding their noses
    const zc = fleeZ(f), gal = q(Math.abs(Math.sin(t * 22)) * 0.012, 3);
    const fam = [['dad', 1.15, 0.72, { expr: 'squint', L: 'nose', R: 'hang' }], ['mum', 0.55, 0.72, { expr: 'squint', L: 'nose', R: 'hang' }], ['girl', -0.05, 0.58, { expr: 'teary', L: 'nose', R: 'wave' }], ['boy', -0.55, 0.58, { expr: 'squint', L: 'nose', R: 'hang' }]];
    fam.forEach(([sp, dz, s, o], i) => out.push(C(T, sp, { ...o, legs: 'sit', bob: gal }, [-2.8, 0.95, zc + dz + 0.1], { s, blob: false })));
    out.push(X('car' + tq(f), (p) => T.carriage(p, t), [-2.5, 0, zc], 2.1, { order: 3 }));
    for (let k = 0; k < 3; k++) { const ph = ((f * 0.05 + k * 0.33) % 1); out.push(FX('du' + k + q(ph), (p) => puff(p, ph, '200,180,150'), [-2.4, 0, zc + 1.7 + ph * 1.2], 0.9)); }
    out.push(X('dog' + tq(f), (p) => T.dog(p, { t }), [2.3, 0, -3.5], 0.62));
  }
  if (id === 'parl') { // the cloud drifts from the river up to the windows
    const k = smooth(ramp(f, 432, 492)), x = lerp(-10, -20, k), y = lerp(-3, 8, k), z = lerp(4, -26, k);
    out.push(X('pc' + tq(f), (p) => T.stinkCloud(p, { t, expr: 'sly', arms: 'none', armsR: 'point', nflies: 6 }), [x, y, z], lerp(6, 7.5, k), { blob: false }));
    out.push(FX('ps' + tq(f), (p) => T.smell(p, t, 0.7, 1), [-30, -2.2, -18], 5));
  }
  if (id === 'curtain') { // MPs dunk the curtains into buckets of chlorinated lime
    const dip = (ph) => Math.sin(t * 5 + ph), arm = (ph) => ({ x: 470, y: q(560 + dip(ph) * 140, 0) });
    out.push(C(T, 'mp2', { expr: 'determined', turn: -0.3, R: arm(0), holdR: 'curtain', drip: tq(f), L: 'hip' }, [0.2, 0, -10.9]));
    out.push(C(T, crowd(T, 1), { expr: 'squint', turn: 0.3, R: arm(2), holdR: 'curtain', drip: tq(f), L: 'nose' }, [-1.4, 0, -10.8]));
    out.push(C(T, crowd(T, 5), { expr: 'worried', look: 0.4, R: { x: 470, y: q(380 + dip(1) * 60, 0) }, holdR: 'curtain', cw: 1.2, drip: tq(f), L: 'hang', blink: blinkAt(f, 3) }, [1.6, 0, -10.6]));
    for (let k = 0; k < 3; k++) { const ph = ((t * 1.2 + k * 0.3) % 1); out.push(FX('sl' + k + q(ph), (p) => T.fxSplash(p, ph), [[-1.2, -0.2, 0.9][k], 0.45, [-9.6, -10.3, -9.4][k]], 0.35)); }
  }
  if (id === 'hanky' || id === 'faint' || id === 'talk' || id === 'jump' || (id === 'seal' && f >= 851)) {
    // benches: tier seats at x = -2.6 (y .67), -4.2 (1.12), -5.8 (1.57); z from -8 to 10
    const mode = id === 'hanky' || id === 'faint' ? 'hanky' : id === 'talk' ? 'yawn' : id === 'jump' ? 'jump' : 'cheer';
    const tiers = [[-2.6, 0.03], [-4.2, 0.48], [-5.8, 0.93]];
    let n = 0;
    for (let ti = 0; ti < 3; ti++) for (let k = 0; k < 7; k++) {
      const z = 5.4 - k * 1.25 - ti * 0.3, [x, y] = tiers[ti], i = ti * 7 + k; n++;
      if (ti === 0 && k === 3) continue; // MP1's seat
      const spec = i === 9 ? 'mp2' : crowd(T, i), sd = (i * 7) % 5;
      let o;
      if (mode === 'hanky') o = { expr: sd % 2 ? 'teary' : 'squint', R: 'nose', holdR: 'hanky', L: sd % 3 ? 'hang' : 'belly', legs: 'sit', turn: 0.25, headTilt: q(Math.sin(t * 3 + i) * 3, 1) };
      else if (mode === 'yawn') o = { expr: (f + i * 11) % 60 < 30 ? 'yawn' : 'sleep', L: sd % 2 ? 'up' : 'hang', R: sd % 2 ? 'up' : 'belly', legs: 'sit', headTilt: q(Math.sin(t * 1.2 + i) * 8, 1) };
      else if (mode === 'jump') { const jt = ramp(f, 757 + (i % 5), 772 + (i % 5)); o = { expr: jt > 0.2 ? 'shock' : 'sleep', L: jt > 0.2 ? 'up' : 'hang', R: jt > 0.2 ? 'up' : 'hang', legs: jt > 0.2 ? 'stand' : 'sit', bob: q(Math.sin(jt * Math.PI) * 0.2, 3) }; }
      else { const ht = f >= 872; o = { expr: ht ? 'cheer' : 'happy', L: ht ? 'up' : 'hang', R: ht ? 'up' : 'hip', legs: 'stand', noHat: ht, bob: ht ? q(Math.abs(Math.sin(t * 12 + i)) * 0.04, 3) : 0 }; }
      const yy = mode === 'jump' && o.legs === 'stand' ? y + 0.64 : mode === 'cheer' ? y + 0.64 : y;
      out.push(C(T, spec, { ...o, blink: blinkAt(f, i) }, [x, yy, z], { s: 0.92, blob: false }));
    }
    // MP1, front row
    let o1;
    if (id === 'hanky') o1 = { expr: 'squint', R: 'nose', holdR: 'hanky', L: 'belly', legs: 'sit', turn: 0.2 };
    else if (id === 'faint') { const k = smooth(ramp(f, 640, 652)); o1 = { expr: k > 0.3 ? 'dizzy' : 'teary', headCol: k > 0.1 ? '#b6dc8a' : undefined, R: k > 0.5 ? 'hang' : 'nose', holdR: k > 0.5 ? undefined : 'hanky', L: 'hang', legs: 'sit', tilt: q(-k * 34, 1), headTilt: q(-k * 18, 1), bob: q(-k * 0.06, 3) }; }
    else if (mode === 'yawn') o1 = { expr: f % 50 < 30 ? 'yawn' : 'sleep', L: 'up', R: 'up', legs: 'sit' };
    else if (mode === 'jump') { const jt = ramp(f, 757, 770); o1 = { expr: jt > 0.2 ? 'shock' : 'sleep', L: 'up', R: 'up', legs: jt > 0.2 ? 'stand' : 'sit', bob: q(Math.sin(jt * Math.PI) * 0.22, 3) }; }
    else { const ht = f >= 872; o1 = { expr: ht ? 'cheer' : 'happy', L: ht ? 'up' : 'belly', R: ht ? 'up' : 'hip', legs: 'stand', noHat: ht }; }
    const y1 = (mode === 'jump' && o1.legs === 'stand') || mode === 'cheer' ? 0.67 : 0.03;
    out.push(C(T, 'mp1', { ...o1, blink: blinkAt(f, 99) }, [-2.6, y1, 1.65], { s: 0.95, blob: false, order: 3 }));
    if (id === 'faint') { // the cloud squeezes through the curtains
      const k = smooth(ramp(f, 633, 650)); out.push(X('fc' + tq(f), (p) => T.stinkCloud(p, { t, expr: 'sly', squash: q(0.6 - k * 0.6, 2), arms: 'none', nflies: 4 }), [lerp(-7.6, -6.6, k), 2.4, -1.6], 1.7, { blob: false }));
      if (f > 652) { const st = ((f - 652) % 20) / 20; out.push(FX('fst' + q(st), (p) => T.fxStars(p, st), [-2.9, 1.5, 1.7], 0.45)); }
    }
    if (mode === 'yawn') { // dusty papers, cobwebs, calendar pages flying
      out.push(X('pap' + tq(f), (p) => T.papers(p, 1, t), [0, 0.95, 2.5], 0.5, { blob: false, order: 4 }));
      for (let k = 0; k < 6; k++) { const ph = ((t * 0.55 + k / 6) % 1); out.push(FX('cal' + k + q(ph), (p) => T.sheet(p, 'cal', ph * 6 + k), [lerp(0.6, -2.4, ph) + k * 0.15, 1.2 + ph * 2.8, 2.4 - k * 0.5], 0.42)); }
      if (f > 680 && f < 700) { const pt = (f - 680) / 20; out.push(FX('dp' + q(pt), (p) => puff(p, pt, '210,200,170'), [0, 1.0, 2.6], 0.5)); }
    }
    if (mode === 'jump') for (let k = 0; k < 9; k++) { const ph = clamp((f - 760 - k) / 40); if (ph > 0) out.push(FX('jp' + k + q(ph), (p) => T.sheet(p, 'lines', ph * 8 + k), [-1.2 + (k % 3) * 1.1, 1.0 + ph * 3.2 + (k % 2), 1.5 + (k * 0.9) % 3], 0.5)); }
    if (mode === 'cheer') {
      const d = f < 868 ? smooth(ramp(f, 856, 868)) * 0.15 + (f >= 862 ? smooth(ramp(f, 862, 870)) * 0.85 : 0) : 1 - smooth(ramp(f, 872, 885)) * 0.8;
      out.push(X('stp' + q(d), (p) => T.stamp(p, d, f >= 870), [0, 0.95, 2.5], 0.42, { blob: false, order: 4 }));
      if (f >= 870 && f < 884) { const bt = (f - 870) / 14; out.push(FX('sb' + q(bt), (p) => T.fxBurst(p, bt, '#fff3b0', 12, 40, 240), [0.0, 0.9, 2.55], 0.45)); }
      for (let k = 0; k < 8; k++) { const ht = clamp((f - 872 - k * 0.6) / 16); if (ht > 0) out.push(FX('hat' + k + q(ht), (p) => T.hatCard(p, ht * 9 + k), [-2.6 - (k % 3) * 1.6, 2.2 + ht * 3.4 - ht * ht * 1.2, 5 - k * 1.1], 0.3)); }
    }
  }
  if (id === 'doc' || id === 'doc2' || id === 'false') {
    const gl = id === 'false' ? smooth(ramp(f, 990, 1004)) * 44 : 0;
    const od = id === 'doc' ? { expr: 'serious', L: 'pointUp', R: 'hang', holdR: 'docbag', turn: 0.2, blink: blinkAt(f, 5) }
      : id === 'doc2' ? { expr: 'serious', R: 'point', L: 'hang', holdL: 'docbag', turn: 0.35, look: 0.8 }
        : { expr: 'shock', R: 'hang', L: 'hang', holdL: 'docbag', glassY: q(gl, 0), turn: 0 };
    out.push(C(T, 'doctor', od, [0, 0, 26.2]));
    const ce = id === 'doc' ? 'smug' : id === 'doc2' ? (f < 950 ? 'shock' : 'angry') : 'shrug';
    out.push(X('dc' + tq(f) + ce, (p) => T.stinkCloud(p, { t, expr: ce, arms: id === 'false' ? 'shrug' : 'none', armsL: id === 'doc2' ? 'fist' : undefined, armsR: id === 'doc2' ? 'fist' : undefined, look: id === 'doc' ? 0 : -0.6, nflies: 4 }), [1.9, -0.3 + Math.sin(t * 2) * 0.1, 23.4], 1.75, { blob: false }));
    for (let i = 0; i < 2; i++) out.push(FX('ds' + i + tq(f), (p) => T.smell(p, t + i, 0.6, i), [-4 + i * 9, -2.2, 14], 4));
  }
  if (id === 'micro') {
    if (f < 1052) {
      for (let k = 0; k < 7; k++) { const x = -0.14 + ((k * 0.093) % 0.28) + Math.sin(t * 1.4 + k) * 0.02, y = 1.38 + ((k * 0.071) % 0.2) + Math.cos(t * 1.1 + k) * 0.02, z = 0.2 + (k % 3) * 0.18;
        out.push(X('mg' + k + tq(f), (p) => T.germ(p, { t, seed: k, expr: k % 3 ? 'grin' : 'giggle', look: Math.sin(t + k), col: ['#62c44a', '#7ad04a', '#4ab85a'][k % 3] }), [x, y, z], 0.1, { blob: false, shadow: false, flip: k % 2 === 1 })); }
      const op = smooth(ramp(f, 1040, 1052));
      out.push(FX('mask' + q(op), (p) => T.scopeMask(p, op), [0, 1.19, 1.12], 0.29, { order: 9 }));
    } else {
      for (let i = 0; i < 4; i++) { const z = pipeZ(f, i); if (z > -1.3) out.push(X('pg' + i + tq(f), (p) => T.germ(p, { t, seed: i, expr: i % 2 ? 'giggle' : 'grin', look: -0.5 }), [-3.2, 0.1 + Math.sin(t * 8 + i) * 0.03, Math.max(0.2, z)], 0.4, { blob: false }));
        else if (i === 0) { const k = clamp((f - 1090) / 10); out.push(X('pj' + tq(f), (p) => T.germ(p, { t, expr: 'giggle', wave: true }), [-3.2 + 0.5 + k * 0.4, 1.2 + Math.sin(k * Math.PI) * 0.5 - k * 0.8, -1.9], 0.36, { blob: false })); } }
      out.push(C(T, 'worker', { expr: 'neutral', blink: blinkAt(f, 3), L: { x: 150, y: 470 }, R: 'hang', turn: 0.4, hat: { type: 'flatcap', color: '#4a5a8a' } }, [-4.4, 0, -2.2]));
      out.push(C(T, 'mum', { expr: 'happy', L: 'hang', R: { x: 450, y: 600 }, blink: blinkAt(f, 6), turn: -0.3 }, [-1.6, 0, -3.0], { s: 0.95 }));
      out.push(C(T, 'boy', { expr: 'happy', L: 'hang', R: 'wave', blink: blinkAt(f, 2) }, [-0.6, 0, -4.4], { s: 0.75 }));
    }
  }
  if (id === 'tunA') {
    const hm = q(Math.sin(t * 10) * 60, 0);
    out.push(C(T, 'digger', { expr: 'determined', turn: -0.3, L: 'hip', R: { x: 520, y: q(300 + hm, 0) }, holdR: 'hammer', blink: blinkAt(f, 2) }, [-2.8, 0, -6.8]));
    out.push(C(T, 'digger2', { expr: 'happy', turn: 0.3, L: { x: 180, y: q(520 + hm * 0.6, 0) }, R: { x: 380, y: 560 }, holdL: 'shovel' }, [-1.0, -1.1, -9.5]));
    const bx = lerp(-0.6, -5.5, ramp(f, 1101, 1136));
    out.push(C(T, { ...T.CAST.digger, body: '#d8c8a8', detail: [{ t: 'vest', c: '#7a4a2a' }], mous: undefined, hair: '#2a2228', seed: 15 }, { expr: 'goofy', L: 'forward', R: 'forward', legs: 'walk', step: q((f % 16) / 16) }, [-2.7, 0, bx - 3.5], { s: 0.96 }));
    out.push(X('bar' + tq(f), (p) => T.barrow(p, t), [-2.75, 0, bx - 2.4], 0.6));
    for (const [i, [x, y, z]] of [[0, [-3.75, 2.2, -4]], [1, [3.75, 2.2, -8.5]]]) out.push(FX('gl' + i, (p) => T.fxGlow(p, '255,190,110', 0.9), [x * 0.9, y - 1.1, z], 1.0));
    for (let k = 0; k < 10; k++) { const tt = ((f * 0.004 + k * 0.137) % 1); out.push(FX('mo' + k + q(Math.sin(tt * Math.PI), 1), (p) => T.fxMote(p, tt), [-2 + (k * 0.47) % 4, 0.4 + tt * 2.8, -4 - (k % 4)], 0.18)); }
  }
  if (id === 'tunB') {
    for (let k = 0; k < 5; k++) { const z = -22.5 - (f - 1137) * 0.09 - k * 1.5, wl = -1.1 + 0.6 * 0.8 + 0.12;
      out.push(X('tg' + k + tq(f), (p) => T.germ(p, { t, seed: k, wave: true, expr: 'grin', look: 0 }), [-0.9 + (k % 3) * 0.8, -0.75 + Math.sin(t * 5 + k) * 0.04, z], 0.55, { blob: false })); }
    for (let k = 0; k < 6; k++) { const l = [[-3.6, 2.2, -24], [3.6, 2.2, -33], [-3.6, 2.2, -42], [3.6, 2.2, -51], [-3.6, 2.2, -60], [3.6, 2.2, -69]][k]; out.push(FX('tl' + k, (p) => T.fxGlow(p, '255,190,110', 0.8), [l[0], l[1] - 1.1, l[2]], 1.0)); }
    out.push(C(T, 'digger', { expr: 'laugh', L: 'wave', R: 'hip' }, [2.7, 0, -23.5], { s: 0.95 }));
  }
  if (id === 'clean' || id === 'shake') {
    for (let i = 0; i < 6; i++) out.push(X('cf' + i, (p) => T.flower(p, 0, ['#e8506a', '#f2a03a', '#d86ae0', '#ffffff', '#f2c43a', '#e8506a'][i], i), [-2.2 + i * 0.7, 0, 25.0 + (i % 2) * 0.5], 0.38, { blob: false }));
    out.push(FX('bd' + tq(f), (p) => birds(p, t), [lerp(-3, 4, ramp(f, 1203, 1343)), 6, 18], 3));
  }
  if (id === 'clean') {
    out.push(FX('spk' + tq(f), (p) => sparkle(p, t), [3, 0.6, 27.3], 0.9));
    const j = (ph) => q(Math.abs(Math.sin(t * 7 + ph)) * 0.18, 3);
    out.push(C(T, 'girl', { expr: 'laugh', L: 'up', R: 'up', legs: 'jump', bob: j(0) }, [0.7, 0, 26.4], { s: 0.72 }));
    out.push(C(T, 'boy', { expr: 'laugh', L: 'wave', R: 'up', legs: 'walk', step: q((f % 14) / 14), bob: j(1.5) * 0.5 }, [lerp(-1.4, 0.0, ramp(f, 1203, 1278)), 0, 27.2], { s: 0.72 }));
    out.push(C(T, 'mum', { expr: 'happy', L: 'hip', R: { x: 470, y: 540 }, blink: blinkAt(f, 3), turn: 0.3 }, [2.3, 0, 26.2], { s: 0.95 }));
  }
  if (id === 'shake') {
    const hs = f >= 1290 && f < 1316, shrug = f >= 1316;
    out.push(C(T, 'doctor', { expr: shrug ? 'happy' : 'proud', R: hs ? { x: 520, y: q(470 + Math.sin(t * 18) * 25, 0) } : shrug ? 'shrug' : 'hang', L: shrug ? 'shrug' : 'hang', holdL: shrug ? undefined : 'docbag', turn: 0.3, look: 0.6, blink: blinkAt(f, 7) }, [0.35, 0, 26.0]));
    out.push(X('sc' + tq(f) + hs + shrug, (p) => T.stinkCloud(p, { t, expr: shrug ? 'happy' : 'proud', armsL: hs ? 'hand' : shrug ? 'shrug' : 'none', armsR: shrug ? 'shrug' : 'none', look: -0.6, nflies: 3, cape: false }), [1.6, 0.1, 25.6], 1.6, { blob: false }));
  }
  if (id === 'modT') {
    const z = lerp(-34, -36.5, ramp(f, 1344, 1383));
    out.push(C(T, 'modern', { expr: 'happy', legs: 'walk', step: q((f % 18) / 18), R: { x: 490, y: 470 }, holdR: 'torch', L: 'hang', turn: 0.3, blink: blinkAt(f, 4) }, [-2.75, 0, z]));
    out.push(FX('tg', (p) => T.fxGlow(p, '255,250,220', 0.8), [-2.1, 0.55, z + 0.3], 0.8));
  }
  if (id === 'modS') { // the caped cloud flies off into the sky
    const k = ramp(f, 1400, 1442), cx = lerp(1.5, 8, k), cy = lerp(1.6, 12, k * k), cz = lerp(-4, -19, k);
    out.push(X('mc' + tq(f), (p) => T.stinkCloud(p, { t, cape: true, expr: 'proud', armsR: 'hero', armsL: 'wave', nflies: 0, flies: false }), [cx, cy, cz], lerp(2.0, 3.4, k), { blob: false }));
    if (f > 1396) for (let i = 0; i < 4; i++) { const ph = ((f - 1396) / 14 + i * 0.25) % 1; out.push(FX('mw' + i + q(ph), (p) => puff(p, ph, '255,255,255'), [cx - 0.4, cy - 0.2 - ph * 1.5, cz + 0.4], 1.0)); }
  }
  return out;
};
export const fxAt = (f, T) => {
  const S = shotAt(f), id = S.id, t = f / 30, out = [];
  if (id === 'hero') {
    for (let k = 0; k < 10; k++) { const c = [[-20, 18, 60], [10, 20, 30], [40, 16, 70], [-40, 22, 0], [60, 18, 20], [0, 20, -40], [30, 22, -80], [-60, 20, -60], [70, 18, -30], [-10, 16, 90]][k]; const ph = ((t * 0.5 + k * 0.17) % 1);
      out.push(FX('ch' + k + q(ph), (p) => puff(p, ph, '210,200,190'), [c[0], c[1] + ph * 4, c[2]], 6)); }
    out.push(FX('shim' + tq(f), (p) => shimmer(p, t), [10, 12, 80], 22, { order: 1 }));
  }
  if (id === 'street') out.push(FX('shim' + tq(f), (p) => shimmer(p, t), [0, 0.3, -4], 4, { order: 1 }));
  if (id === 'street' || id === 'flee') for (const [i, [x, z]] of [[0, [-4.2, 2]], [1, [4.2, -6]]]) out.push(FX('gg' + i, (p) => T.fxGlow(p, '255,214,140', 0.5), [x, 3.85 - 1.1 * 0.6, z], 0.6));
  if (id === 'hall' || ['curtain', 'hanky', 'faint', 'jump'].includes(id) || (id === 'seal' && f >= 851)) for (let k = 0; k < 10; k++) { const tt = ((f * 0.004 + k * 0.137) % 1); out.push(FX('hm' + k + q(Math.sin(tt * Math.PI), 1), (p) => T.fxMote(p, tt), [-3 + (k * 0.71) % 6, 0.8 + tt * 3, -2 + (k * 1.3) % 6], 0.2)); }
  return out;
};
