// "Das Duell auf der Insel" — 1080x1920, 30 fps. Voice: voice.mp3 (46.63 s), TOTAL = 46.63 + 0.5 s tail.
// Phrase times (s), hand-checked against the waveform (silence-align + spectral checks; Ast ≈ 33.42, Zylinder ≈ 44.26, Fünf ≈ 45.46):
//  0.00- 2.19 Ein Mann steht auf einer kleinen Insel im Fluss.      | 2.73- 3.73 Fast zwei Meter groß.        | 4.31- 5.91 Dürr wie eine Bohnenstange.
//  6.51- 8.65 Und in der Hand: ein riesiges Schwert.                | 9.18-11.56 Ihm gegenüber: ein Mann, der ihn umbringen will.
// 12.05-12.91 Wie es dazu kam?   | 13.47-15.02 Der Lange hat in der Zeitung heimlich | 15.12-16.48 fiese Briefe über ihn geschrieben. | 16.63-17.51 Unter falschem Namen.
// 17.64-18.86 Und der andere ist stinksauer. | 18.96-19.95 Er fordert ihn zum Duell. | 20.14-22.47 Das Problem: Der Gegner ist ein richtig guter Schütze.
// 22.63-24.75 Aber wer gefordert wird, darf die Waffen wählen. | 24.85-26.69 Und der Lange sagt: Keine Pistolen. | 26.95-28.07 Riesige Reitersäbel.
// 28.43-30.76 Zwischen ihnen liegt ein Brett. Keiner darf drüber. | 31.11-32.43 Dann hebt der Lange sein Schwert … | 32.58-33.98 und schlägt einen Ast ab.
// 34.28-35.86 Hoch über dem Kopf seines Gegners. | 36.23-37.08 Da wird allen klar: | 37.30-39.09 Gegen diese Arme hast du keine Chance.
// 39.44-41.26 Kurz darauf wird das Duell abgeblasen. | 41.38-42.19 Und der lange Mann? | 42.57-43.65 Wird später Präsident. | 43.76-44.85 Der mit dem Zylinder. | 45.12-46.23 Auf dem Fünf-Dollar-Schein.
import { SET } from './scene.js';
export const FPS = 30, TOTAL = 1414;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const easeOut = (t) => 1 - (1 - clamp(t)) ** 3.2, easeIn = (t) => clamp(t) ** 2.6;
const lerp = (a, b, t) => a + (b - a) * t, lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t)), ramp = (f, a, b) => clamp((f - a) / (b - a));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const at = (set, p) => add3(SET[set], p);
const blinkAt = (f, seed) => { const per = 46 + (seed * 17) % 30, ph = (Math.floor(f) + seed * 13) % per; return ph < 2 ? 1 : 0; };
const pop = (f, f0, d = 6) => { const u = (f - f0) / d; if (u <= 0) return 0; if (u >= 1.6) return 1; return u < 1 ? easeOut(u) * 1.22 : 1.22 - 0.22 * smooth((u - 1) / 0.6); };

// ---------------------------------------------------------------- lights
const DAWN = { az: -128, el: 17, sky: '#b8c6e0', ground: '#6a6050', hemi: 1.15, sun: '#ffcf8a', sunI: 2.7, fog: '#d6d2d0', fogNear: 30, fogFar: 300,
  skyTop: '#4a7ccc', skyHor: '#f6cc90', sunDisc: '#ffe6a8', sunSize: 0.018, sat: 1.26, gain: '#fff2e2', lift: '#080a18', waterDeep: '#3e6a5a', waterShal: '#7a9a72', glint: '#fff0c8', vig: 0.28, shadowExt: 9, ink: 1.5 };
export const LIGHTS = {
  dawn: DAWN,
  dawnWide: { ...DAWN, shadowExt: 16, ink: 1.2, fogNear: 40, fogFar: 340 },
  sepia: { ...DAWN, sat: 0.28, gain: '#ffd49a', lift: '#1c0e06', vig: 0.45 },
  night: { az: -60, el: 30, sky: '#3a4a8a', ground: '#1a1420', hemi: 0.55, sun: '#8aa8ff', sunI: 0.9, fog: '#141428', fogNear: 5, fogFar: 22, skyTop: '#0a0c20', skyHor: '#1a2040',
    sat: 1.15, gain: '#ffe6cc', lift: '#06061a', waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.42, shadowExt: 4, ink: 1.8 },
  press: { az: -70, el: 28, sky: '#e8c8a0', ground: '#3a2820', hemi: 0.95, sun: '#ffd8a0', sunI: 2.0, fog: '#4a3226', fogNear: 6, fogFar: 26, skyTop: '#3a2a20', skyHor: '#5a4030',
    sat: 1.12, gain: '#fff0dc', lift: '#100804', waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.36, shadowExt: 5, ink: 1.8 },
  parlour: { az: 168, el: 26, sky: '#f4dcc0', ground: '#4a2a24', hemi: 1.0, sun: '#fff0c8', sunI: 2.5, fog: '#6a3a30', fogNear: 7, fogFar: 26, skyTop: '#3a2420', skyHor: '#6a4030',
    sat: 1.15, gain: '#fff4e4', lift: '#0c0608', waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.32, shadowExt: 5, ink: 1.8 },
  final: { az: 70, el: 32, sky: '#ffe2a8', ground: '#8a5a30', hemi: 1.35, sun: '#ffe6b0', sunI: 2.6, fog: '#f0b860', fogNear: 18, fogFar: 80, skyTop: '#d87a28', skyHor: '#ffd890',
    sat: 1.2, gain: '#fff4dc', lift: '#120a04', waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.3, shadowExt: 7, ink: 1.5 },
};

// ---------------------------------------------------------------- cast helpers
const TX = -1.25, RX = 1.25, Z0 = 0.2, TS = 1.35, RS = 0.92;
const RIM_GOLD = { col: '#ffd890', sx: -1, sy: -0.35, d: 6, a: 0.85 };
const RIM_MOON = { col: '#9ab8ff', sx: -1, sy: -0.3, d: 6, a: 0.7 }, RIM_CANDLE = { col: '#ffc070', sx: 1, sy: -0.2, d: 6, a: 0.7 };
const RIM_WIN = { col: '#fff0c0', sx: -1, sy: -0.3, d: 6, a: 0.75 }, RIM_FINAL = { col: '#fff0c0', sx: 1, sy: -0.4, d: 6, a: 0.7 };
const tall = (o, pos, ex = {}, rim = RIM_GOLD) => ({ key: 'T' + JSON.stringify([o, rim]), draw: (p) => window.__T.withRim(p, (pp) => window.__T.lanky(pp, o), rim), x: pos[0], y: pos[1], z: pos[2], s: TS / (o.fit || 1), order: 2, ...ex });
const rival = (o, pos, ex = {}, rim = RIM_GOLD) => ({ key: 'R' + JSON.stringify([o, rim]), draw: (p) => window.__T.withRim(p, (pp) => window.__T.rivalChar(pp, o), rim), x: pos[0], y: pos[1], z: pos[2], s: RS, order: 2, ...ex });
const extra = (spec, o, pos, ex = {}, rim = RIM_GOLD) => ({ key: 'E' + JSON.stringify([spec, o, rim]), draw: (p) => window.__T.withRim(p, (pp) => window.__T.extraChar(pp, spec, o), rim), x: pos[0], y: pos[1], z: pos[2], s: 0.9, order: 2, ...ex });
const FX = (key, draw, pos, s, ex = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 6, ...ex });
const SA = () => window.__T.SECOND_A, SB = () => window.__T.SECOND_B, CR = (i) => window.__T.CROWD[i % 8];
const idleBob = (f, seed, a = 0.006) => q(a * Math.sin(f * 0.13 + seed), 3);
// spectators in the two boats behind the island
const boatCrowd = (f, mood = 'neutral') => {
  const out = []; const P = [[-5.1, -12.4, 0, 'umb'], [-4.0, -12.6, 1, 'bin'], [-3.3, -12.4, 6, ''], [5.0, -13.4, 2, 'umb'], [6.1, -13.6, 3, 'bin'], [4.3, -13.5, 7, '']];
  const exprs = { neutral: 'neutral', tense: 'worried', ooo: 'shock', happy: 'laugh' };
  P.forEach(([x, z, i, k], j) => { const b = q(0.03 * Math.sin(f * 0.09 + j), 2);
    const o = { expr: exprs[mood] || mood, turn: x < 0 ? 0.4 : -0.4, blink: blinkAt(f, j + 3) };
    if (k === 'umb') { o.R = { x: 420, y: 430 }; o.umbrella = { x: 420, y: 430, col: ['#e8d0a0', '#d88aa0', '#a0c8e0'][j % 3] }; }
    if (k === 'bin') { o.L = { x: 250, y: 290 }; o.R = { x: 350, y: 290 }; o.binoc = true; }
    if (mood === 'happy') { o.L = 'wave'; if (j % 2) o.R = 'wave'; }
    out.push(extra(CR(i), o, [x, 0.15 + b, z], { s: 0.75, blob: false })); });
  return out;
};
const seconds = (f, oA = {}, oB = {}, pA = [-3.1, 0, -1.2], pB = [3.0, 0, -1.0]) => [
  extra(SA(), { expr: 'neutral', turn: 0.3, blink: blinkAt(f, 11), L: { x: 200, y: 520 }, R: { x: 400, y: 520 }, box: { x: 300, y: 540, w: 300 }, ...oA }, pA, { s: 0.92 }),
  extra(SB(), { expr: 'neutral', turn: -0.3, blink: blinkAt(f, 12), L: { x: 200, y: 520 }, R: { x: 400, y: 520 }, box: { x: 300, y: 540, w: 300 }, ...oB }, pB, { s: 0.92 }),
];

// ---------------------------------------------------------------- shots
const I = (p) => at('island', p), Dk = (p) => at('desk', p), Pr = (p) => at('press', p), Pa = (p) => at('parlour', p), Fn = (p) => at('final', p);
const islandParts = (f, c = [TX, 1.4, 0.4]) => ({ leaves: { c, n: 26, box: [7, 3.5, 5], s: 0.09 }, motes: { c: [c[0], c[1] + 0.4, c[2]], n: 40, box: [5, 3, 3], s: 0.045, col: '#fff0c0' }, smoke: 'boat' });
const BURST = { c: I([0.7, 3.0, -0.25]), f0: 1003, n: 130, s: 0.12 };
const SH = [
  { id: 'hook', a: 0, b: 73, light: 'dawn', set: 'island',
    keys: [{ f: 0, pos: I([-0.55, 0.24, 3.55]), look: I([TX, 2.0, Z0]), fov: 62, roll: -7 }, { f: 10, pos: I([-0.75, 0.3, 2.75]), look: I([TX, 2.1, Z0]), fov: 56, roll: -3, e: 'out' }, { f: 73, pos: I([-0.8, 0.32, 2.45]), look: I([TX, 2.15, Z0]), fov: 55, roll: -1.5, e: 'lin' }],
    act: (f) => [tall({ expr: 'determined', blink: blinkAt(f, 2), L: 'hang', R: 'hang', flap: q(0.5 + 0.5 * Math.sin(f * 0.31), 1) }, I([TX, 0, Z0])), ...boatCrowd(f, 'tense')],
    W: (f) => ({ mist: 0.55, mistAt: I([TX, -0.1, 1.2]), parts: islandParts(f), wind: 0.4, fg: [0.25, 0, 1.6] }), dof: { at: [TX, 2.5, Z0], cinf: 9 } },
  { id: 'tilt', a: 74, b: 119, light: 'dawn', set: 'island',
    keys: [{ f: 74, pos: I([-0.85, 0.45, 2.05]), look: I([TX, 0.15, Z0]), fov: 40 }, { f: 79, pos: I([-0.85, 0.45, 2.05]), look: I([TX, 0.2, Z0]), fov: 40, e: 'lin' }, { f: 99, pos: I([-0.85, 1.5, 2.05]), look: I([TX, 2.62, Z0]), fov: 40, e: 'io' }, { f: 119, pos: I([-0.88, 1.55, 1.9]), look: I([TX, 2.6, Z0]), fov: 39, e: 'lin' }],
    act: (f) => [tall({ expr: f < 100 ? 'neutral' : 'smug', blink: blinkAt(f, 2), turn: 0.1, L: 'hang', R: 'hang', flap: q(0.5 + 0.5 * Math.sin(f * 0.31), 1) }, I([TX, 0, Z0]))],
    W: (f) => ({ fg: [-0.3, 0, 1.6], mist: 0.5, mistAt: I([TX, -0.2, 1.0]), parts: islandParts(f, [TX, 1.4, 1.0]), wind: 0.4 }), dof: { at: [TX, 1.4, Z0], cinf: 9 }, mb: (f) => (f >= 82 && f <= 98 ? 5 : 1) },
  { id: 'bean', a: 120, b: 185, light: 'dawn', set: 'island',
    keys: [{ f: 120, pos: I([-0.2, 1.55, 4.5]), look: I([-1.9, 1.62, 0.1]), fov: 44, roll: 2 }, { f: 130, pos: I([-0.45, 1.5, 4.2]), look: I([-1.85, 1.6, 0.1]), fov: 43, e: 'out' }, { f: 185, pos: I([-0.65, 1.48, 3.85]), look: I([-1.8, 1.6, 0.1]), fov: 42, e: 'lin' }],
    act: (f) => [tall({ expr: f < 160 ? 'smug' : 'sly', blink: blinkAt(f, 2), turn: -0.35, look: f > 135 && f < 165 ? -0.8 : 0.3, L: 'hang', R: 'hang', flap: q(0.4 + 0.4 * Math.sin(f * 0.31), 1) }, I([TX, 0, Z0])), ...boatCrowd(f, 'tense')],
    W: (f) => { const u = ramp(f, 132, 178); const y = 0.4 + 1.95 * easeOut(u * 1.3); return { bean: true, fg: [0.4, 0, 2.6], mist: 0.45, mistAt: I([TX, -0.2, 1.0]), parts: islandParts(f), birdPass: { pos: I([-0.1 - 2.6 * Math.max(0, u - 0.75), Math.min(y, 2.15), 0.75]), ry: -0.2, s: 0.9 }, wind: 0.3 }; }, dof: { at: [TX, 1.6, Z0], cinf: 6 } },
  { id: 'sword', a: 186, b: 266, light: 'dawn', set: 'island',
    keys: [{ f: 186, pos: I([-0.15, 1.05, 3.0]), look: I([TX + 0.3, 2.35, Z0]), fov: 50, roll: 4 }, { f: 196, pos: I([-0.35, 1.0, 2.8]), look: I([TX + 0.25, 2.4, Z0]), fov: 48, roll: 2, e: 'out' }, { f: 266, pos: I([-0.5, 1.05, 2.45]), look: I([TX + 0.15, 2.55, Z0]), fov: 45, roll: -1, e: 'lin' }],
    act: (f) => { const u = smooth(ramp(f, 196, 230)), gl = f >= 236 ? Math.max(0, 1 - (f - 236) / 14) * 1.3 : 0;
      const hx = lerp(360, 330, u), hy = lerp(520, 300, u), ang = lerp(95, 18, u);
      return [tall({ expr: f < 236 ? 'determined' : 'sly', blink: blinkAt(f, 2), turn: 0.15, L: { x: hx - 20, y: hy + 6 }, R: { x: hx + 18, y: hy - 4 }, sabre: { x: hx, y: hy, ang, len: 470, glint: q(gl, 2) }, fit: 0.78, flap: q(0.4 + 0.4 * Math.sin(f * 0.31), 1), headCol: gl > 0.3 ? '#fff6d8' : undefined }, I([TX, 0, Z0]))]; },
    W: (f) => ({ mist: 0.4, mistAt: I([TX, -0.2, 1.0]), parts: islandParts(f), wind: 0.4, fg: [-0.1, 0, 2.0] }), dof: { at: [TX, 2.4, Z0], cinf: 8 },
    fx: (f) => f >= 234 && f < 250 ? [FX('glint' + (f - 234), (p) => window.__T.fxGlow(p, '255,246,210', 1 - (f - 234) / 16), I([TX + 0.95, 3.95, Z0 + 0.2]), 1.8)] : [] },
  { id: 'rival', a: 267, b: 353, light: 'dawn', set: 'island',
    keys: [{ f: 267, pos: I([-0.6, 1.5, 2.6]), look: I([TX + 0.6, 2.3, Z0]), fov: 46, roll: -6 }, { f: 276, pos: I([-0.95, 1.05, 2.6]), look: I([RX, 1.2, Z0]), fov: 42, roll: 3, e: 'out' }, { f: 353, pos: I([-0.75, 1.0, 2.25]), look: I([RX, 1.25, Z0]), fov: 40, roll: 4.5, e: 'lin' }],
    act: (f) => { const pf = smooth(ramp(f, 290, 330)); return [
      rival({ expr: f < 300 ? 'determined' : 'angry', blink: blinkAt(f, 5), turn: -0.45, look: -0.6, puff: q(pf, 2), bob: q(0.05 * pf + idleBob(f, 1, 0.004), 3), L: 'hip', R: { x: 500, y: 560 }, sabre: { x: 500, y: 560, ang: 168, len: 300 } }, I([RX, 0, Z0])),
      tall({ expr: 'smug', turn: 0.4, L: 'hang', R: 'hang' }, I([TX + 0.1, 0, Z0 + 0.6]), { order: 3 }),
      ...seconds(f, {}, { expr: 'determined' }, [-3.4, 0, -1.6], [2.6, 0, -1.5]), ...boatCrowd(f, 'tense')]; },
    W: (f) => ({ mist: 0.4, mistAt: I([RX, -0.2, 0.5]), parts: islandParts(f, [RX, 1.4, 0.4]), wind: 0.3, fg: [-1.7, 0, 1.4] }), dof: { at: [RX, 1.4, Z0], cinf: 12 }, mb: (f) => (f < 276 ? 6 : 1) },
  { id: 'rewind', a: 354, b: 395, light: 'sepia', set: 'island',
    keys: [{ f: 354, pos: I([0.2, 1.4, 2.6]), look: I([RX, 1.3, Z0]), fov: 42, roll: 0 }, { f: 395, pos: I([1.5, 8.5, 13]), look: I([0, 0.5, -1]), fov: 48, roll: -28, e: 'io' }],
    act: (f) => { const u = ramp(f, 354, 395); return [
      rival({ expr: 'angry', turn: -0.4, L: { x: 120, y: 480 }, R: { x: 470, y: 480 }, legs: 'walk', step: q((1 - u) * 3 % 1, 2) }, I([RX + 1.8 * u, 0, Z0])),
      tall({ expr: 'neutral', turn: 0.3, legs: 'walk', step: q((1 - u) * 3 % 1, 2) }, I([TX - 1.8 * u, 0, Z0])), ...boatCrowd(f)]; },
    W: (f) => ({ mist: 0.2, mistAt: I([0, -0.2, 1.0]), parts: islandParts(f, [0, 1.4, 0.4]) }), dof: { at: [0, 1.0, 0], cinf: 2 }, mb: () => 4 },
  { id: 'desk', a: 396, b: 451, light: 'night', set: 'desk',
    keys: [{ f: 396, pos: Dk([0.6, 1.85, 2.7]), look: Dk([0.0, 1.75, -0.6]), fov: 46, roll: -3 }, { f: 404, pos: Dk([0.4, 1.8, 2.3]), look: Dk([0.0, 1.74, -0.6]), fov: 44, roll: -1, e: 'out' }, { f: 451, pos: Dk([0.3, 1.78, 2.05]), look: Dk([0.0, 1.74, -0.6]), fov: 43, roll: 0, e: 'lin' }],
    act: (f) => { const wr = Math.sin(f * 0.9) * 10; return [tall({ expr: 'sly', blink: blinkAt(f, 2), look: f % 50 < 25 ? 0.7 : -0.3, turn: 0.1, legs: 'sit', L: { x: 230, y: 440 }, R: { x: q(380 + wr, 0), y: q(470 + Math.abs(wr) * 0.4, 0) }, quill: true }, Dk([0.05, -0.62, -0.62]), { blob: false }, RIM_MOON)]; },
    W: (f) => ({ candle: 1, sconce: 0.35, parts: { motes: { c: Dk([-0.9, 1.8, -1.0]), n: 50, box: [1.6, 2.4, 1.6], s: 0.035, col: '#c8d8ff' }, ink: { c: Dk([0.4, 1.05, 0.05]), n: 3 } } }), dof: { at: Dk([0, 1.55, -0.62]), cinf: 12, abs: true } },
  { id: 'press', a: 452, b: 496, light: 'press', set: 'press',
    keys: [{ f: 452, pos: Pr([1.9, 2.9, 1.6]), look: Pr([0.6, 1.2, -0.4]), fov: 50, roll: 6 }, { f: 461, pos: Pr([1.3, 2.45, 0.85]), look: Pr([1.1, 1.02, -0.3]), fov: 44, roll: 2, e: 'out' }, { f: 496, pos: Pr([1.22, 2.3, 0.7]), look: Pr([1.15, 1.02, -0.3]), fov: 42, roll: 0, e: 'lin' }],
    act: () => [], W: (f) => ({ sheetX: q(lerp(0.3, 1.15, smooth(ramp(f, 452, 470))), 3), parts: { motes: { c: Pr([1.6, 1.9, -1.2]), n: 50, box: [2, 3, 2], s: 0.04, col: '#ffe0a0' } } }), dof: { at: Pr([1.15, 1.02, 0.0]), cinf: 12, abs: true } },
  { id: 'anonym', a: 497, b: 526, light: 'night', set: 'desk',
    keys: [{ f: 497, pos: Dk([-0.3, 2.4, 0.8]), look: Dk([-0.36, 0.93, 0.3]), fov: 38, roll: -6 }, { f: 505, pos: Dk([-0.34, 2.2, 0.72]), look: Dk([-0.36, 0.93, 0.31]), fov: 37, roll: -3, e: 'out' }, { f: 526, pos: Dk([-0.35, 2.12, 0.7]), look: Dk([-0.36, 0.93, 0.32]), fov: 36, roll: -2, e: 'lin' }],
    act: () => [], W: (f) => ({ candle: 1, sign: q(ramp(f, 499, 522), 3), quill: f < 524, quillLift: f >= 522 ? 0.03 * (f - 522) : 0, parts: {} }), dof: { at: Dk([-0.35, 0.93, 0.33]), cinf: 8, abs: true } },
  { id: 'angry', a: 527, b: 567, light: 'parlour', set: 'parlour',
    keys: [{ f: 527, pos: Pa([0.3, 1.45, 2.9]), look: Pa([-0.9, 1.3, 0.2]), fov: 46, roll: -5 }, { f: 535, pos: Pa([-0.2, 1.3, 2.5]), look: Pa([-0.9, 1.25, 0.2]), fov: 42, roll: -2, e: 'out' }, { f: 567, pos: Pa([-0.4, 1.28, 2.1]), look: Pa([-0.9, 1.3, 0.2]), fov: 40, roll: 2, e: 'lin' }],
    act: (f) => { const red = smooth(ramp(f, 531, 550)), cr = smooth(ramp(f, 556, 566)); return [
      rival({ expr: f < 533 ? 'neutral' : 'angry', blink: blinkAt(f, 5), turn: -0.15, red: q(red, 2), steam: f >= 543 ? q(Math.min(1, (f - 543) / 6), 2) : 0, steamPh: q((f % 15) / 15, 2), paper: true, crumple: q(cr, 2), L: { x: q(300 - 165 * (1 - cr * 0.75), 0), y: q(520 + cr * 40, 0) }, R: { x: q(300 + 165 * (1 - cr * 0.75), 0), y: q(520 + cr * 40, 0) }, shake: f >= 545 ? (f % 2 ? 4 : -4) : 0 }, Pa([-0.9, 0, 0.2]), {}, RIM_WIN)]; },
    W: (f) => ({ holes: 9, parts: { motes: { c: Pa([-1.8, 1.8, 0.7]), n: 50, box: [2, 2.6, 1.8], s: 0.04, col: '#fff0c0' } } }), dof: { at: Pa([-0.9, 1.35, 0.2]), cinf: 12, abs: true } },
  { id: 'letter', a: 568, b: 601, light: 'parlour', set: 'parlour',
    keys: [{ f: 568, pos: Pa([0.42, 1.95, 1.15]), look: Pa([0.4, 0.9, 0.3]), fov: 42, roll: 6 }, { f: 575, pos: Pa([0.36, 1.72, 0.95]), look: Pa([0.34, 0.9, 0.3]), fov: 40, roll: 2, e: 'out' }, { f: 601, pos: Pa([0.36, 1.66, 0.92]), look: Pa([0.34, 0.9, 0.3]), fov: 39, roll: 0, e: 'lin' }],
    act: () => [],
    W: (f) => { const sy = f < 578 ? lerp(0.6, 0.02, easeIn(ramp(f, 570, 578))) : f < 584 ? 0.02 : lerp(0.02, 0.6, easeOut(ramp(f, 584, 592))); return { holes: 9, seal: f >= 578, stampY: f < 596 ? sy : undefined, parts: {} }; },
    dof: { at: Pa([0.38, 0.9, 0.52]), cinf: 9, abs: true }, fx: (f) => f >= 590 && f < 601 ? [FX('slam' + (f - 590), (p) => window.__T.fxBurst(p, (f - 590) / 11, '#fff2c0', 10, 30, 200), Pa([0.38, 0.95, 0.62]), 0.55)] : [] },
  { id: 'target', a: 602, b: 675, light: 'parlour', set: 'parlour',
    keys: [{ f: 602, pos: Pa([2.35, 1.72, -1.05]), look: Pa([2.6, 1.72, -2.35]), fov: 40, roll: -4 }, { f: 609, pos: Pa([2.4, 1.74, -1.25]), look: Pa([2.6, 1.74, -2.35]), fov: 38, e: 'out' }, { f: 642, pos: Pa([2.42, 1.74, -1.35]), look: Pa([2.6, 1.74, -2.35]), fov: 37, e: 'lin' },
      { f: 652, pos: Pa([1.0, 1.45, 1.55]), look: Pa([1.7, 1.15, -1.4]), fov: 44, roll: 3, e: 'out' }, { f: 675, pos: Pa([1.1, 1.4, 1.3]), look: Pa([1.7, 1.15, -1.4]), fov: 42, roll: 4, e: 'lin' }],
    act: (f) => [rival({ expr: f < 655 ? 'smug' : 'sly', blink: blinkAt(f, 5), turn: -0.2, puff: 0.6, L: 'hip', R: { x: 380 + (f % 20 < 10 ? 10 : -6), y: 320 }, mousStyle: 'handle' }, Pa([1.7, 0, -1.45]), {}, RIM_WIN)],
    W: (f) => ({ holes: Math.min(9, Math.max(0, Math.floor((f - 606) / 4))), parts: { motes: { c: Pa([1.6, 1.8, -1]), n: 40, box: [2.5, 2, 2], s: 0.04, col: '#fff0c0' } } }),
    dof: { focusFn: (f) => (f < 645 ? Pa([2.6, 1.74, -2.35]) : Pa([1.7, 1.35, -1.45])), cinf: 11 }, mb: (f) => (f >= 642 && f <= 650 ? 5 : 1) },
  { id: 'idea', a: 676, b: 743, light: 'night', set: 'desk',
    keys: [{ f: 676, pos: Dk([-0.4, 1.55, 2.3]), look: Dk([0.0, 1.7, -0.6]), fov: 46, roll: 3 }, { f: 684, pos: Dk([-0.2, 1.6, 2.1]), look: Dk([0.0, 1.85, -0.6]), fov: 44, e: 'out' }, { f: 743, pos: Dk([-0.05, 1.7, 1.6]), look: Dk([0.0, 2.05, -0.6]), fov: 42, roll: -2, e: 'lin' }],
    act: (f) => { const idea = f >= 706; const gulp = f >= 684 && f < 696 ? 0.02 * Math.sin((f - 684) * 0.6) : 0;
      return [tall({ expr: idea ? 'sly' : 'worried', blink: blinkAt(f, 2), turn: idea ? 0.2 : 0, look: idea ? 0.3 : -0.5, legs: 'sit', bob: q(gulp, 3), L: idea ? { x: 240, y: 460 } : { x: 160, y: 470 }, R: idea ? { x: 380, y: 60 } : { x: 440, y: 470 }, finger: idea, headTilt: idea ? 6 : 0 }, Dk([0.0, -0.62, -0.62]), { blob: false }, RIM_CANDLE),
        ...(idea ? [] : [FX('letterIn', (p) => { const g = p.g; g.fillStyle = '#f4ead2'; g.strokeStyle = '#1a1416'; g.lineWidth = 8; g.beginPath(); g.rect(130, 330, 340, 260); g.fill(); g.stroke(); g.fillStyle = '#2a1416'; g.font = 'bold italic 40px Georgia, serif'; g.textAlign = 'center'; g.fillText('Forderung', 300, 400); g.fillText('zum Duell', 300, 450); g.fillRect(170, 470, 260, 4); }, Dk([0.0, 0.25, -0.3]), 0.5, { order: 7 })])]; },
    W: (f) => ({ candle: 0.8, sconce: f < 706 ? 0.35 : q(0.35 + 2.4 * easeOut(ramp(f, 706, 716)) - 0.4 * ramp(f, 716, 743), 2), parts: { motes: { c: Dk([-0.9, 1.8, -1.0]), n: 50, box: [1.6, 2.4, 1.6], s: 0.035, col: '#c8d8ff' } } }),
    dof: { at: Dk([0, 1.85, -0.62]), cinf: 12, abs: true }, fx: (f) => f >= 706 && f < 720 ? [FX('idea' + (f - 706), (p) => window.__T.fxBurst(p, (f - 706) / 14, '#fff3b0', 12, 40, 220), Dk([0, 3.0, -2.0]), 1.2)] : [] },
  { id: 'pistols', a: 744, b: 803, light: 'night', set: 'desk',
    keys: [{ f: 744, pos: Dk([1.5, 2.2, 2.1]), look: Dk([0.3, 1.5, -0.2]), fov: 48, roll: -4 }, { f: 752, pos: Dk([1.2, 2.1, 1.85]), look: Dk([0.3, 1.5, -0.2]), fov: 46, roll: -2, e: 'out' }, { f: 803, pos: Dk([1.05, 2.05, 1.7]), look: Dk([0.35, 1.5, -0.2]), fov: 45, roll: 1, e: 'lin' }],
    act: (f) => { const push = ramp(f, 772, 794);
      const hx = f < 762 ? 470 : f < 772 ? 448 : lerp(448, 590, push), hy = f < 762 ? 300 : f < 772 ? lerp(300, 425, easeIn(ramp(f, 762, 768))) : 425;
      return [tall({ expr: f < 770 ? 'determined' : 'smug', blink: blinkAt(f, 2), turn: 0.35, look: 0.5, legs: 'sit', L: { x: 220, y: 470 }, R: { x: q(hx, 0), y: q(hy, 0) } }, Dk([0.0, -0.62, -0.62]), { blob: false }, RIM_CANDLE)]; },
    W: (f) => ({ candle: 1, sconce: 0.3, pcLid: f < 762 ? 1.2 : q(lerp(1.2, 0, easeIn(ramp(f, 762, 768))), 3), pcSlide: q(lerp(0, 0.47, smooth(ramp(f, 772, 794))), 3), parts: { motes: { c: Dk([-0.9, 1.8, -1.0]), n: 40, box: [1.6, 2.4, 1.6], s: 0.035, col: '#c8d8ff' } } }),
    dof: { at: Dk([0.3, 1.2, -0.2]), cinf: 9, abs: true } },
  { id: 'sabres', a: 804, b: 847, light: 'parlour', set: 'parlour',
    keys: [{ f: 804, pos: Pa([0.9, 2.5, 2.8]), look: Pa([0.45, 1.25, -0.3]), fov: 54, roll: 6 }, { f: 812, pos: Pa([0.6, 2.3, 2.45]), look: Pa([0.45, 1.25, -0.3]), fov: 52, roll: 2, e: 'out' }, { f: 847, pos: Pa([0.55, 2.25, 2.25]), look: Pa([0.45, 1.28, -0.3]), fov: 51, roll: 0, e: 'lin' }],
    act: (f) => [extra(SA(), { expr: f < 820 ? 'neutral' : 'smug', turn: 0.2, blink: blinkAt(f, 11), L: { x: 180, y: 600 }, R: { x: 430, y: 600 } }, Pa([0.0, 0, -0.85]), { s: 0.95 }, RIM_WIN),
      rival({ expr: f < 818 ? 'worried' : 'scared', blink: 0, turn: -0.5, look: -0.7, L: 'hip', R: 'cross', mousDroop: f >= 822, sweat: f >= 826, shake: f >= 818 ? (f % 2 ? 3 : -3) : 0 }, Pa([1.05, 0, -0.55]), {}, RIM_WIN)],
    W: (f) => ({ holes: 9, swordCase: true, letter: false, pistolCase2: false, scLid: q(2.3 * smooth(ramp(f, 806, 818)), 3), scGlow: 0, parts: { motes: { c: Pa([0.6, 1.4, 0.2]), n: 50, box: [2, 1.6, 1.4], s: 0.04, col: '#e8f2ff' } } }),
    dof: { at: Pa([0.7, 1.1, 0.2]), cinf: 10, abs: true }, fx: (f) => f >= 818 && f < 832 ? [FX('sab' + (f - 818), (p) => window.__T.fxBurst(p, (f - 818) / 14, '#eaf4ff', 12, 30, 220), Pa([0.55, 1.25, 0.4]), 0.9)] : [] },
  { id: 'board', a: 848, b: 927, light: 'dawnWide', set: 'island',
    keys: [{ f: 848, pos: I([0.3, 8.6, 8.4]), look: I([0, 1.4, 0.6]), fov: 46, roll: 10 }, { f: 858, pos: I([0.1, 7.6, 7.4]), look: I([0, 1.3, 0.3]), fov: 46, roll: 3, e: 'out' }, { f: 927, pos: I([0.0, 6.8, 6.6]), look: I([0, 1.2, -0.3]), fov: 45, roll: 0, e: 'io' }],
    act: (f) => { const toe = f >= 896 && f < 912 ? Math.sin(ramp(f, 896, 912) * Math.PI) : 0; return [
      tall({ expr: 'smug', blink: blinkAt(f, 2), turn: 0.4, L: 'hang', R: { x: 460, y: 300 }, sabre: { x: 460, y: 300, ang: 30, len: 470 }, fit: 0.8, flap: q(0.3 + 0.3 * Math.sin(f * 0.31), 1) }, I([TX, 0, Z0])),
      rival({ expr: toe > 0.1 ? 'worried' : 'angry', blink: blinkAt(f, 5), turn: -0.4, puff: 0.6, bob: q(0.04 + toe * 0.02, 3), L: 'hip', R: { x: 480, y: 540 }, sabre: { x: 480, y: 540, ang: 160, len: 300 } }, I([q(RX - toe * 0.35, 3), 0, Z0])),
      ...seconds(f, f >= 897 ? { L: 'wave', R: { x: 400, y: 520 }, expr: 'angry' } : {}, {}, [-3.1, 0, -1.2], [3.0, 0, -1.0]), ...boatCrowd(f, 'tense')]; },
    W: (f) => ({ fg: [1.5, 0, 3.8], mist: 0.35, mistAt: I([0, -0.2, 0]), parts: islandParts(f, [0, 1.6, 0.4]), wind: 0.3 }), dof: { at: [0, 1.0, 0.2], cinf: 3 } },
  { id: 'raise', a: 928, b: 974, light: 'dawn', set: 'island',
    keys: [{ f: 928, pos: I([-0.1, 0.75, 5.6]), look: I([-0.1, 2.0, Z0]), fov: 54, roll: -2 }, { f: 974, pos: I([-0.6, 1.6, 4.0]), look: I([TX + 0.1, 3.1, Z0]), fov: 44, roll: 3, e: 'io' }],
    act: (f) => { const u = smooth(ramp(f, 928, 968)); const hy = lerp(300, -40, u), hx = lerp(380, 320, u);
      return [tall({ expr: 'determined', blink: 0, turn: 0.35, L: { x: q(hx - 22, 0), y: q(hy + 6, 0) }, R: { x: q(hx + 18, 0), y: q(hy - 2, 0) }, sabre: { x: q(hx, 0), y: q(hy, 0), ang: q(lerp(30, -8, u), 1), len: 470, glint: f > 960 ? 0.5 : 0 }, fit: 0.6, flap: q(0.3 + 0.3 * Math.sin(f * 0.2), 1) }, I([TX, 0, Z0])),
        rival({ expr: 'scared', blink: 0, turn: -0.4, look: -0.6, headTilt: -8, puff: q(lerp(0.6, 0, u), 2), L: 'hip', R: { x: 480, y: 540 }, sabre: { x: 480, y: 540, ang: 162, len: 300 }, shake: f % 2 ? 2 : -2 }, I([RX, 0, Z0])), ...boatCrowd(f, 'tense')]; },
    W: (f) => ({ fg: [0.9, 0, 3.6], mist: 0.35, mistAt: I([0, -0.2, 0.6]), parts: islandParts(f, [0, 1.8, 0.4]), wind: 0.15 }), dof: { at: [-0.3, 2.4, Z0], cinf: 6 } },
  { id: 'slash', a: 975, b: 1023, light: 'dawn', set: 'island',
    keys: [{ f: 975, pos: I([-0.15, 1.3, 6.6]), look: I([0.0, 2.2, Z0]), fov: 54, roll: 2 }, { f: 1000, pos: I([-0.1, 1.25, 6.3]), look: I([0.05, 2.25, Z0]), fov: 53, roll: 2, e: 'lin' }, { f: 1023, pos: I([0.1, 1.2, 5.9]), look: I([0.2, 2.1, Z0]), fov: 52, roll: -2, e: 'out' }],
    act: (f) => { const s = ramp(f, 999, 1003); const ang = f < 999 ? -8 : lerp(-8, 80, easeOut(s)) + 6 * ramp(f, 1003, 1010); const hx = f < 999 ? 320 : lerp(320, 400, s), hy = f < 999 ? -40 : lerp(-40, 120, s);
      return [tall({ expr: f < 1003 ? 'determined' : 'smug', blink: 0, turn: 0.35, L: { x: q(hx - 20, 0), y: q(hy + 6, 0) }, R: { x: q(hx + 18, 0), y: q(hy - 2, 0) }, sabre: { x: q(hx, 0), y: q(hy, 0), ang: q(ang, 1), len: 500 }, fit: 0.6, flap: q(0.4 + 0.4 * Math.sin(f * 0.31), 1) }, I([TX, 0, Z0])),
        rival({ expr: f < 1003 ? 'scared' : 'shock', blink: 0, turn: -0.4, look: -0.6, headTilt: f < 1003 ? -8 : 0, L: 'hip', R: { x: 480, y: 540 }, sabre: { x: 480, y: 540, ang: 162, len: 300 }, bob: f >= 1003 && f < 1010 ? 0.04 : 0, pale: q(0.5 * ramp(f, 1005, 1023), 2), hatLeaves: f > 1010 ? Math.min(6, Math.floor((f - 1010) / 2)) : 0 }, I([RX, 0, Z0])), ...boatCrowd(f, f < 1003 ? 'tense' : 'ooo')]; },
    W: (f) => ({ fg: [-0.9, 0, 4.2], mist: 0.35, mistAt: I([0, -0.2, 0.6]), cut: { f: 1003, land: 0.9 }, parts: { ...islandParts(f, [0.6, 1.8, 0.4]), burst: BURST }, wind: 0.2 }),
    dof: { at: [0.3, 2.2, Z0], cinf: 5 }, mb: (f) => (f >= 998 && f <= 1006 ? 6 : 1),
    fx: (f) => f >= 1003 && f < 1015 ? [FX('cut' + (f - 1003), (p) => window.__T.fxBurst(p, (f - 1003) / 12, '#fff6c8', 12, 40, 240), I([0.62, 3.02, -0.1]), 1.5)] : [] },
  { id: 'leaves', a: 1024, b: 1079, light: 'dawn', set: 'island',
    keys: [{ f: 1024, pos: I([2.0, 1.75, 2.9]), look: I([RX, 1.35, Z0]), fov: 42, roll: 5 }, { f: 1032, pos: I([1.85, 1.6, 2.65]), look: I([RX, 1.35, Z0]), fov: 40, roll: 3, e: 'out' }, { f: 1079, pos: I([1.75, 1.55, 2.3]), look: I([RX, 1.4, Z0]), fov: 38, roll: 1, e: 'lin' }],
    act: (f) => [rival({ expr: 'shock', blink: 0, turn: -0.15, look: f < 1040 ? -0.4 : 0, pale: q(0.5 + 0.4 * ramp(f, 1024, 1060), 2), hatLeaves: Math.min(16, 6 + Math.floor((f - 1024) / 3)), L: { x: 130, y: 520 }, R: { x: 480, y: 540 }, sabre: { x: 480, y: 540, ang: 166, len: 300 }, mousDroop: f > 1050, shake: f % 2 ? 1 : -1 }, I([RX, 0, Z0])),
      ...seconds(f, {}, { expr: 'shock' }, [-3.1, 0, -1.2], [3.0, 0, -1.6])],
    W: (f) => ({ fg: [2.6, 0, 2.2], mist: 0.3, mistAt: I([RX, -0.2, 0.6]), cut: { f: 1003, land: 0.9 }, parts: { ...islandParts(f, [RX, 1.6, 0.4]), burst: BURST }, wind: 0.2 }),
    dof: { at: [RX, 1.5, Z0], cinf: 12 }, fx: (f) => f >= 1030 && f < 1046 ? [FX('thud' + (f - 1030), (p) => window.__T.fxPuff(p, (f - 1030) / 16), I([1.0, 0.0, 0.7]), 1.6, { order: 7 })] : [] },
  { id: 'crowd', a: 1080, b: 1115, light: 'dawnWide', set: 'island',
    keys: [{ f: 1080, pos: I([1.6, 2.6, 17.6]), look: I([0.0, 1.0, 24]), fov: 48, roll: -5 }, { f: 1088, pos: I([0.8, 2.3, 18.4]), look: I([0.0, 1.05, 24]), fov: 46, roll: -2, e: 'out' }, { f: 1115, pos: I([0.6, 2.2, 18.8]), look: I([0.0, 1.1, 24]), fov: 45, e: 'lin' }],
    act: (f) => { const ooo = f >= 1086; const out = [];
      const pos = [[-2.6, 23.6, 0, 'umb'], [-1.7, 23.2, 1, 'bin'], [-0.85, 23.7, 2, 'umb'], [0.0, 23.3, 3, 'bin'], [0.9, 23.6, 4, ''], [1.75, 23.2, 5, 'umb'], [2.6, 23.7, 6, 'bin'], [-3.4, 24.2, 7, '']];
      pos.forEach(([x, z, i, k], j) => { const o = { expr: ooo ? 'shock' : 'worried', blink: ooo ? 0 : blinkAt(f, j), turn: q(-x * 0.12, 2), look: q(-x * 0.2, 2), bob: ooo ? q(0.02 * Math.max(0, Math.sin((f - 1086 - j) * 0.4)), 3) : 0, headTilt: ooo ? (j % 2 ? 4 : -4) : 0 };
        if (k === 'umb') { o.R = { x: 420, y: 430 }; o.umbrella = { x: 420, y: 430, col: ['#e8d0a0', '#d88aa0', '#a0c8e0'][j % 3] }; }
        if (k === 'bin') { o.L = { x: 250, y: 290 }; o.R = { x: 350, y: 290 }; o.binoc = !ooo; if (ooo) { o.L = 'chin'; o.R = 'chin'; } }
        out.push(extra(CR(i), o, I([x, 0.05, z]), { s: 0.95 })); });
      return out; },
    W: (f) => ({ fg: [-0.9, -0.1, 20.4], mist: 0.25, mistAt: I([0, -0.3, 21]), parts: { leaves: { c: I([0, 1.6, 21.5]), n: 20, box: [6, 3, 3], s: 0.08 }, motes: { c: I([0, 1.6, 22]), n: 30, box: [6, 2, 2], s: 0.04 }, smoke: 'boat' }, wind: 0.2 }),
    dof: { at: [0, 1.4, 23.5], cinf: 9 } },
  { id: 'arms', a: 1116, b: 1177, light: 'dawn', set: 'island',
    keys: [{ f: 1116, pos: I([-3.9, 2.9, 1.5]), look: I([0.8, 1.3, Z0]), fov: 48, roll: -6 }, { f: 1124, pos: I([-3.5, 2.7, 1.25]), look: I([0.8, 1.35, Z0]), fov: 47, roll: -3, e: 'out' }, { f: 1177, pos: I([-3.3, 2.6, 1.15]), look: I([0.85, 1.4, Z0]), fov: 46, roll: -1, e: 'lin' }],
    act: (f) => { const sw = Math.sin(f * 0.18) * 30; return [
      tall({ back: true, expr: 'neutral', L: { x: q(150 + sw * 0.5, 0), y: 650 }, R: { x: 420, y: 330 }, sabre: { x: 420, y: 330, ang: 100, len: 470 }, flap: q(0.4 + 0.4 * Math.sin(f * 0.31), 1) }, I([TX, 0, Z0]), { flip: true, order: 3 }, { ...RIM_GOLD, sx: 1 }),
      rival({ expr: 'scared', blink: 0, turn: -0.3, look: -0.6, pale: 0.95, mousDroop: true, sweat: true, hatLeaves: 16, L: { x: 130, y: 520 }, R: { x: 480, y: 540 }, sabre: { x: 480, y: 540, ang: 166 + (f % 2 ? 4 : -4), len: 300 }, shake: f % 2 ? 2 : -2 }, I([RX, 0, Z0])),
      ...seconds(f, { look: f > 1140 ? 1 : 0.3, turn: f > 1140 ? 0.6 : 0.3, expr: 'worried' }, { look: f > 1140 ? -1 : -0.3, turn: f > 1140 ? -0.6 : -0.3, expr: 'worried' }, [-0.6, 0, -2.6], [3.3, 0, -1.4]), ...boatCrowd(f, 'ooo')]; },
    W: (f) => ({ fg: [-2.6, 0, 1.6], mist: 0.3, mistAt: I([RX, -0.2, 0.6]), cut: { f: 1003, land: 0.9 }, parts: { ...islandParts(f, [RX, 1.6, 0.4]), burst: BURST }, wind: 0.2 }),
    dof: { at: [RX, 1.35, Z0], cinf: 11 } },
  { id: 'peace', a: 1178, b: 1238, light: 'dawn', set: 'island',
    keys: [{ f: 1178, pos: I([0.8, 1.6, 5.4]), look: I([0.0, 1.5, Z0]), fov: 50, roll: 4 }, { f: 1186, pos: I([0.3, 1.5, 5.0]), look: I([0.0, 1.5, Z0]), fov: 48, roll: 1, e: 'out' }, { f: 1238, pos: I([0.1, 1.45, 4.6]), look: I([0.0, 1.45, Z0]), fov: 47, roll: 0, e: 'lin' }],
    act: (f) => { const sh = f >= 1206, pump = sh ? q(Math.sin((f - 1206) * 0.7) * 22, 0) : 0; return [
      tall({ expr: sh ? 'happy' : 'smug', blink: blinkAt(f, 2), turn: 0.4, L: 'hang', R: sh ? { x: 545, y: 575 + pump } : 'hang', flap: q(0.3 + 0.3 * Math.sin(f * 0.31), 1) }, I([-0.75, 0, Z0])),
      rival({ expr: sh ? 'worried' : 'scared', blink: blinkAt(f, 5), turn: -0.4, look: -0.5, pale: q(0.9 - 0.5 * ramp(f, 1206, 1238), 2), hatLeaves: 16, L: sh ? { x: 85, y: q(400 + pump * 0.5, 0) } : 'hip', R: 'hip', mousDroop: true }, I([0.45, 0, Z0])),
      ...seconds(f, { expr: 'happy', L: f < 1206 ? 'wave' : { x: 200, y: 520 }, R: f < 1206 && f % 10 < 5 ? 'wave' : { x: 400, y: 520 } }, { expr: 'happy', L: f < 1206 && f % 10 >= 5 ? 'wave' : { x: 200, y: 520 }, R: f < 1206 ? 'wave' : { x: 400, y: 520 } }, [-2.0, 0, -0.9], [1.9, 0, -0.9]),
      ...boatCrowd(f, f > 1212 ? 'happy' : 'neutral')]; },
    W: (f) => ({ fg: [-1.4, 0, 3.6], mist: 0.3, mistAt: I([0, -0.2, 0.6]), cut: { f: 1003, land: 0.9 }, rays: 1.3, parts: { ...islandParts(f, [0, 1.8, 0.4]) }, wind: 0.2 }),
    dof: { at: [0, 1.6, Z0], cinf: 6 } },
  { id: 'walk', a: 1239, b: 1311, light: 'final', set: 'final',
    keys: [{ f: 1239, pos: Fn([1.5, 1.2, 6.5]), look: Fn([0, 1.9, -1.0]), fov: 50, roll: -8 }, { f: 1248, pos: Fn([0.6, 1.0, 6.0]), look: Fn([0, 1.95, -0.5]), fov: 48, roll: -3, e: 'out' }, { f: 1311, pos: Fn([0.25, 1.0, 5.1]), look: Fn([0, 2.0, 1.0]), fov: 46, roll: 0, e: 'lin' }],
    act: (f) => { const z = lerp(-1.6, 1.4, ramp(f, 1239, 1311)); const old = f < 1262 ? 0 : f < 1285 ? 1 : 2;
      return [tall({ expr: old < 2 ? 'smug' : 'happy', blink: blinkAt(f, 2), old, legs: 'walk', step: q(((f - 1239) / 22) % 1, 2), L: 'hang', R: 'hang', bob: q(0.01 * Math.abs(Math.sin((f - 1239) / 22 * Math.PI * 2)), 3) }, Fn([0, 0, q(z, 3)]), {}, RIM_FINAL)]; },
    W: (f) => ({ parts: { confetti: { c: Fn([0, 3, 0]), n: 120, box: [7, 6, 5] }, motes: { c: Fn([0, 2.5, 0]), n: 50, box: [5, 4, 4], s: 0.05, col: '#fff0c0' } } }),
    dof: { focusFn: (f) => Fn([0, 2.3, lerp(-1.6, 1.4, ramp(f, 1239, 1311))]), cinf: 8 },
    fx: (f) => { const o = []; for (const f0 of [1262, 1285]) if (f >= f0 && f < f0 + 12) { const z = lerp(-1.6, 1.4, ramp(f, 1239, 1311)); o.push(FX('pf' + f0 + (f - f0), (p) => window.__T.fxPuff(p, (f - f0) / 12), Fn([0, 1.2, z + 0.3]), 1.1, { order: 7 })); o.push(FX('st' + f0 + (f - f0), (p) => window.__T.fxStars(p, (f - f0) / 12), Fn([0, 2.6, z + 0.3]), 1.4, { order: 7 })); } return o; } },
  { id: 'hat', a: 1312, b: 1349, light: 'final', set: 'final',
    keys: [{ f: 1312, pos: Fn([-0.6, 1.9, 4.4]), look: Fn([0, 2.45, 1.4]), fov: 44, roll: 4 }, { f: 1320, pos: Fn([-0.3, 1.95, 4.0]), look: Fn([0, 2.5, 1.4]), fov: 42, roll: 1, e: 'out' }, { f: 1349, pos: Fn([-0.2, 2.05, 3.7]), look: Fn([0, 2.65, 1.4]), fov: 41, roll: 0, e: 'lin' }],
    act: (f) => [tall({ expr: f < 1326 ? 'happy' : 'smug', blink: blinkAt(f, 2), old: 2, turn: 0.1, hat: q(pop(f, 1324, 5), 2), L: 'hang', R: f >= 1326 ? { x: 420, y: 300 } : 'hang', headTilt: f >= 1326 ? -3 : 0 }, Fn([0, 0, 1.4]), {}, RIM_FINAL)],
    W: (f) => ({ parts: { confetti: { c: Fn([0, 3, 1]), n: 120, box: [6, 6, 4] }, motes: { c: Fn([0, 2.5, 1]), n: 50, box: [4, 3, 3], s: 0.05, col: '#fff0c0' } } }),
    dof: { at: Fn([0, 2.5, 1.4]), cinf: 11, abs: true },
    fx: (f) => f >= 1324 && f < 1338 ? [FX('hp' + (f - 1324), (p) => window.__T.fxBurst(p, (f - 1324) / 14, '#fff3b0', 12, 40, 230), Fn([0, 3.35, 1.45]), 1.3), FX('hs' + (f - 1324), (p) => window.__T.fxStars(p, (f - 1324) / 14), Fn([0, 3.6, 1.5]), 1.0)] : [] },
  { id: 'note', a: 1350, b: 1413, light: 'final', set: 'final',
    keys: [{ f: 1350, pos: Fn([-0.15, 2.15, 3.6]), look: Fn([0, 2.68, 1.4]), fov: 40 }, { f: 1360, pos: Fn([0, 2.55, 2.3]), look: Fn([0, 2.62, 1.4]), fov: 34, e: 'io' },
      { f: 1361, pos: Fn([0, 2.4, 5.2]), look: Fn([0, 2.4, 1.4]), fov: 40, cut: true }, { f: 1413, pos: Fn([0, 2.4, 4.9]), look: Fn([0, 2.4, 1.4]), fov: 40, e: 'lin' }],
    act: (f) => f < 1361 ? [tall({ expr: 'smug', blink: 0, old: 2, turn: 0.1, hat: 1, L: 'hang', R: { x: 420, y: 300 }, headTilt: -3 }, Fn([0, 0, 1.4]), {}, RIM_FINAL)] : [],
    W: (f) => { const u = ramp(f, 1361, 1372), v = ramp(f, 1388, 1413); const note = f >= 1361 ? { pos: [0, 2.4 + 0.03 * Math.sin(f * 0.1), lerp(0.6, 1.75, easeIn(v))], ry: q(lerp(-2.6, 0, easeOut(u)) + 0.08 * Math.sin(f * 0.12) * (1 - v), 3), rz: q(lerp(0.4, -0.05, easeOut(u)), 3), rx: q(-0.05 * v, 3), s: 0.5 } : null;
      return { note, parts: { confetti: { c: Fn([0, 3, 1.5]), n: 150, box: [6, 6, 4] }, motes: { c: Fn([0, 2.5, 2]), n: 40, box: [4, 3, 2], s: 0.05, col: '#fff0c0' } } }; },
    dof: { focusFn: (f) => (f < 1361 ? Fn([0, 2.6, 1.4]) : Fn([0, 2.4, lerp(0.6, 1.75, easeIn(ramp(f, 1388, 1413)))])), cinf: 8 }, mb: (f) => (f >= 1355 && f <= 1366 ? 5 : 1) },
];
export const SHOTS = SH.map((s) => ({ id: s.id, a: s.a, b: s.b, light: s.light }));
const shotOf = (f) => { const ff = Math.floor(f + 1e-6); return SH.find((s) => ff >= s.a && ff <= s.b) || (ff < 0 ? SH[0] : SH[SH.length - 1]); };
export const shotAt = (f) => shotOf(f);
export const lightFor = (S, f) => ({ ...LIGHTS[S.light] });

// white flashes and impact kicks (absolute frames)
const FLASH = [[392, 4, 0.95], [1003, 3, 0.55], [1360, 4, 1.0], [1324, 2, 0.35], [236, 2, 0.25]];
const KICKS = [{ f: 578, a: 0.025 }, { f: 590, a: 0.04 }, { f: 1003, a: 0.035 }, { f: 1030, a: 0.03 }, { f: 766, a: 0.02 }, { f: 1324, a: 0.015 }];
export const camAt = (f) => {
  const S = shotOf(f), K = S.keys; let c;
  if (f <= K[0].f) c = { ...K[0] }; else if (f >= K[K.length - 1].f) c = { ...K[K.length - 1] };
  else for (let i = 0; i < K.length - 1; i++) if (f >= K[i].f && f < K[i + 1].f) {
    const a = K[i], b = K[i + 1]; if (b.cut) { c = { ...a }; break; }
    const r = (f - a.f) / (b.f - a.f), t = b.e === 'out' ? easeOut(r) : b.e === 'lin' ? r : smooth(r);
    c = { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) }; break; }
  c = { ...c, pos: [...c.pos], look: [...c.look] };
  c.look[0] += 0.006 * Math.sin(f * 0.07); c.look[1] += 0.005 * Math.sin(f * 0.053 + 1); // handheld breathing
  for (const k of KICKS) { const d = f - k.f; if (d >= 0 && d < 7) { const s = (Math.floor(d) % 2 ? -1 : 1) * k.a * (1 - d / 7); c.look[1] += s * 3; c.look[0] += s * 2; c.roll = (c.roll || 0) + s * 25; } }
  c.flash = 0; for (const [f0, n, a] of FLASH) if (f >= f0 && f < f0 + n) c.flash = Math.max(c.flash, a * (1 - (f - f0) / n));
  c.shadowAt = c.look;
  return c;
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotOf(f), C = camAt(f), d = S.dof || { at: [0, 1, 0], cinf: 4 };
  const p = d.focusFn ? d.focusFn(f) : d.abs ? d.at : add3(SET[S.set], d.at);
  return { focus: dist(C.pos, p), cinf: d.cinf, near: d.near ?? 1 };
};
export const worldAt = (f) => { const S = shotOf(f); const w = S.W ? S.W(f) : {}; return { set: S.set, ...w }; };
export const actorsAt = (f, T) => { window.__T = T; const S = shotOf(f); return S.act ? S.act(f) : []; };
export const fxAt = (f, T) => { window.__T = T; const S = shotOf(f); return S.fx ? S.fx(f) : []; };
globalThis.mbAt = (f) => { const S = shotOf(f); return S.mb ? S.mb(f) : 1; };
