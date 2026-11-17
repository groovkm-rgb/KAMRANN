// "Der menschliche Wecker" — vertical 1080x1920, 30 fps. Voice: voice.mp3 (50.23 s) + 0.5 s tail.
// Phrase times (s, checked against the waveform):
//  0.12-0.73 Drei Uhr nachts. | 1.04-3.06 Eine Frau schleicht ... | 3.58-4.72 Sie hebt ein Rohr an den Mund | 5.15-6.16 zielt auf ein Fenster
//  6.53-7.26 und pustet. | 7.76-8.30 Pling! | 8.73-10.05 Eine getrocknete Erbse. | 10.62-11.88 Direkt gegen die Scheibe.
//  12.06-13.09 Eine Einbrecherin? | 13.50-13.79 Nein. | 14.43-15.29 Sie ist ein Wecker. | 15.65-16.77 Ein menschlicher Wecker.
//  17.05-19.15 Wecker sind damals teuer, und nicht jeder hat einen. | 19.53-21.73 Aber wer zu spät ... Ärger. | 22.06-22.96 Oder fliegt raus.
//  23.36-25.65 Also zahlen ... | 26.05-28.42 Und jeden Morgen ... | 28.79-30.04 Mit einem langen Stock. | 30.52-31.86 Oder eben mit Erbsen.
//  32.15-34.12 Und er geht erst weiter ... | 34.53-36.13 Aber wer weckt eigentlich … den Wecker? | 36.74-39.51 Die meisten schlafen einfach tagsüber.
//  39.77-41.67 Und es gab sogar einen Zungenbrecher darüber: | 42.01-43.83 Unser Wecker(42.45) hatte einen Wecker(43.45).
//  44.33-47.79 Aber der Wecker(44.68) vom Wecker(45.18) hat unseren Wecker(46.20) nicht geweckt. | 48.01-49.87 Also hat unser Wecker(48.76) uns nicht geweckt.
import { A, O2, O3, O4, O5 } from './scene.js';
export const FPS = 30, TOTAL = 1522;
export const SHOTS = [
  { id: 's1', a: 0, b: 30, loc: 1, tod: 'night', L: 'night' },
  { id: 's2', a: 31, b: 104, loc: 1, tod: 'night', L: 'night' },
  { id: 's3a', a: 105, b: 149, loc: 1, tod: 'night', L: 'night' },
  { id: 's3b', a: 150, b: 191, loc: 1, tod: 'night', L: 'night' },
  { id: 's3c', a: 192, b: 218, loc: 1, tod: 'night', L: 'night' },
  { id: 's4', a: 219, b: 256, loc: 1, tod: 'night', L: 'night' },
  { id: 's5a', a: 257, b: 312, loc: 1, tod: 'night', L: 'night' },
  { id: 's5b', a: 313, b: 357, loc: 1, tod: 'night', L: 'night' },
  { id: 's6', a: 358, b: 424, loc: 1, tod: 'night', L: 'night' },
  { id: 's7a', a: 425, b: 466, loc: 2, tod: 'night', L: 'nightIn' },
  { id: 's7b', a: 467, b: 508, loc: 1, tod: 'night', L: 'night' },
  { id: 's8', a: 509, b: 581, loc: 3, tod: 'night', L: 'shop' },
  { id: 's9a', a: 582, b: 657, loc: 4, tod: 'night', L: 'gate' },
  { id: 's9b', a: 658, b: 695, loc: 4, tod: 'night', L: 'gate' },
  { id: 's10', a: 696, b: 777, loc: 1, tod: 'night', L: 'night' },
  { id: 's11', a: 778, b: 860, loc: 1, tod: 'night', L: 'night' },
  { id: 's12a', a: 861, b: 911, loc: 1, tod: 'night', L: 'night' },
  { id: 's12b', a: 912, b: 962, loc: 1, tod: 'night', L: 'night' },
  { id: 's13', a: 963, b: 1031, loc: 1, tod: 'night', L: 'night' },
  { id: 's14', a: 1032, b: 1098, loc: 1, tod: 'night', L: 'night' },
  { id: 's15a', a: 1099, b: 1125, loc: 1, tod: 'day', L: 'day' },
  { id: 's15b', a: 1126, b: 1189, loc: 5, tod: 'day', L: 'dayIn' },
  { id: 's16', a: 1190, b: 1257, loc: 1, tod: 'dawn', L: 'dawn' },
  { id: 's17', a: 1258, b: 1325, loc: 1, tod: 'dawn', L: 'dawn' },
  { id: 's18a', a: 1326, b: 1365, loc: 1, tod: 'dawn', L: 'dawn' },
  { id: 's18b', a: 1366, b: 1437, loc: 5, tod: 'dawn', L: 'dawnIn' },
  { id: 's19a', a: 1438, b: 1496, loc: 2, tod: 'day', L: 'dayBed' },
  { id: 's19b', a: 1497, b: 1521, loc: 1, tod: 'day', L: 'day' },
];
export const shotAt = (f) => { f = Math.round(f); return SHOTS.find((s) => f >= s.a && f <= s.b) || (f < 0 ? SHOTS[0] : SHOTS[SHOTS.length - 1]); };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const easeOut = (t) => 1 - (1 - clamp(t)) ** 3.2, easeIn = (t) => clamp(t) ** 2.4;
const lerp = (a, b, t) => a + (b - a) * t, lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t)), ramp = (f, a, b) => clamp((f - a) / (b - a));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const add3 = (a, b) => a.map((v, i) => v + b[i]);
const W2 = (p) => add3(p, O2), W3 = (p) => add3(p, O3), W4 = (p) => add3(p, O4), W5 = (p) => add3(p, O5);

// ---------------- light ----------------
const NIGHT = { az: 200, el: 34, sky: '#4a58a8', ground: '#1e1a38', hemi: 0.62, sun: '#9aaeff', sunI: 0.85, fog: '#1c1e48', fogNear: 14, fogFar: 95,
  skyTop: '#060920', skyHor: '#33285a', sat: 1.12, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.36, shadowExt: 12, ink: 1.5, lift: '#060618', gain: '#d8dcff' };
export const LIGHTS = {
  night: NIGHT,
  nightIn: { ...NIGHT, az: 180, el: 26, hemi: 0.75, sky: '#6a74c0', sunI: 1.3, fog: '#1e1c3a', fogNear: 30, fogFar: 200, vig: 0.38, shadowExt: 5 },
  shop: { ...NIGHT, hemi: 0.75, sunI: 0.5, vig: 0.34, shadowExt: 6, sat: 1.0 },
  gate: { ...NIGHT, skyTop: '#101440', skyHor: '#5a4474', fog: '#2c2c5a', fogNear: 18, fogFar: 140, hemi: 0.8, shadowExt: 10 },
  day: { az: 120, el: 55, sky: '#c8d8f4', ground: '#7a7088', hemi: 1.25, sun: '#fff1dc', sunI: 2.5, fog: '#cfe0f6', fogNear: 40, fogFar: 300,
    skyTop: '#3d7fd6', skyHor: '#d4e6f8', sat: 1.22, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.22, shadowExt: 14, ink: 1.5, gain: '#fffaf0', lift: '#000000' },
  dayIn: { az: -90, el: 32, sky: '#f0b888', ground: '#3a2a30', hemi: 0.6, sun: '#ffdcaa', sunI: 2.8, fog: '#5a3a3a', fogNear: 30, fogFar: 200, skyTop: '#ffd8a0', skyHor: '#ffd8a0',
    sat: 1.2, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.36, shadowExt: 5, ink: 1.6, gain: '#fff2e0', lift: '#0c0608' },
  dawn: { az: 15, el: 9, sky: '#e0b8d8', ground: '#6a4a6a', hemi: 1.2, sun: '#ffb89a', sunI: 1.9, fog: '#e0a8b8', fogNear: 40, fogFar: 260,
    skyTop: '#4a5cb8', skyHor: '#ffb49a', sunDisc: '#ffe0b0', sunSize: 0.02, sat: 1.22, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.28, shadowExt: 14, ink: 1.5, gain: '#fff4f0', lift: '#100818' },
  dawnIn: { az: -90, el: 20, sky: '#e0a0b8', ground: '#3a2a3a', hemi: 0.6, sun: '#ffb0a0', sunI: 2.2, fog: '#3a2a3a', fogNear: 30, fogFar: 200, skyTop: '#ffb0a0', skyHor: '#ffb0a0',
    sat: 1.2, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.36, shadowExt: 5, ink: 1.6, gain: '#fff0f0', lift: '#0c0610' },
  dayBed: { az: 180, el: 40, sky: '#ffe8c8', ground: '#5a4a40', hemi: 1.0, sun: '#fff0d0', sunI: 2.8, fog: '#5a4a40', fogNear: 30, fogFar: 200, skyTop: '#9ac8f0', skyHor: '#9ac8f0',
    sat: 1.2, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.3, shadowExt: 5, ink: 1.6, gain: '#fffaf0', lift: '#060404' },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.L] };
  if (S.id === 's16') { const t = ramp(f, 1190, 1257); L.sunI = lerp(1.1, 1.9, t); }
  return L;
};

// ---------------- camera ----------------
// keys: {f, pos, look, fov, roll, e} ; a key with cut:true starts a new shot (no interpolation across)
const K = [];
const key = (f, pos, look, fov, e, roll = 0, cut = false) => K.push({ f, pos, look, fov, e, roll, cut });
// S1 hook: low behind her, rushing in and swinging round to her side
key(0, [8.4, 0.5, -1.9], [2.6, 2.5, -4.75], 54, null, -3, true);
key(30, [5.7, 0.75, -1.2], [2.6, 1.85, -4.6], 46, 'out', -1);
// S2 low side tracking along the back row, street receding to the left
key(31, [5.0, 0.42, -1.0], [-1.2, 2.2, -4.9], 50, null, 2, true);
key(88, [1.9, 0.45, -1.15], [-4.6, 2.3, -4.9], 50, 'lin', 1);
key(104, [1.55, 0.5, -1.3], [-3.0, 2.6, -4.6], 48, 'out', 0);
// S3a medium close: pipe to the lips
key(105, [1.65, 1.3, -1.35], [-0.3, 1.75, -3.6], 46, null, 0, true);
key(149, [1.42, 1.35, -1.6], [-0.3, 1.78, -3.6], 42, 'lin', 1.5);
// S3b POV over her shoulder along the pipe to the window
key(150, [0.06, 1.42, -3.22], [-1.1, 4.25, -5.2], 46, null, 0, true);
key(191, [-0.2, 1.9, -3.55], [-1.1, 4.25, -5.2], 34, 'lin', 0);
// S3c cheeks puff, blow
key(192, [1.6, 1.35, -1.55], [-0.3, 1.8, -3.6], 44, null, -2, true);
key(218, [1.48, 1.38, -1.7], [-0.3, 1.82, -3.6], 41, 'lin', -3);
// S4 pea flight, wide slow-mo; impact at 233
key(219, [1.9, 1.7, -0.9], [-0.6, 2.9, -4.4], 50, null, 0, true);
key(233, [1.6, 2.1, -1.2], [-1.0, 4.6, -5.0], 46, 'lin', 0);
key(256, [1.55, 1.9, -1.25], [-1.0, 3.2, -5.0], 48, 'out', 0);
// S5a macro: pea bounces onto the pile
key(257, [-0.15, 0.45, -3.6], [-0.95, 0.22, -4.85], 42, null, 0, true);
key(312, [-0.3, 0.38, -3.85], [-0.95, 0.2, -4.85], 38, 'lin', 0);
// S5b deadpan: another pea from the pouch
key(313, [1.25, 1.2, -1.3], [-0.4, 1.65, -3.6], 46, null, 0, true);
key(357, [1.05, 1.25, -1.65], [-0.4, 1.7, -3.6], 42, 'lin', 0);
// S6 burglar silhouette against the far lamps, then the lantern up
key(358, [-3.6, 0.6, -2.5], [5.0, 2.3, -3.6], 50, null, 4, true);
key(398, [-3.2, 0.65, -2.6], [5.0, 2.3, -3.6], 48, 'lin', 4.5);
key(412, [-1.9, 1.25, -2.6], [1.0, 1.6, -3.6], 42, 'out', 0);
key(424, [-1.75, 1.3, -2.65], [1.0, 1.62, -3.6], 40, 'lin', 0);
// S7a bedroom: kids in front, parents behind; father jumps
key(425, W2([0.35, 1.75, 3.6]), W2([0.15, 0.8, -0.6]), 54, null, 0, true);
key(466, W2([0.32, 1.7, 3.2]), W2([0.15, 0.82, -0.6]), 52, 'lin', 0);
// S7b father at the window, she nods below
key(467, [1.75, 1.15, 1.5], [-0.9, 3.95, -5.2], 52, null, 0, true);
key(508, [1.65, 1.18, 1.2], [-0.9, 4.0, -5.2], 49, 'lin', 0);
// S8 clock shop: poor worker in the foreground
key(509, W3([1.6, 1.45, 4.2]), W3([-0.6, 1.85, -1.0]), 54, null, 0, true);
key(581, W3([1.4, 1.48, 3.8]), W3([-0.6, 1.88, -1.0]), 51, 'lin', 0);
// S9a factory gate, foreman
key(582, W4([1.3, 0.85, 6.6]), W4([-0.9, 3.4, -2.0]), 58, null, 0, true);
key(657, W4([1.1, 0.9, 5.8]), W4([-0.95, 3.4, -2.0]), 56, 'lin', 0);
// S9b the gate slams in his face
key(658, W4([-2.25, 1.3, 3.3]), W4([-2.0, 1.75, -2.0]), 54, null, 0, true);
key(695, W4([-2.25, 1.32, 3.05]), W4([-2.0, 1.75, -2.0]), 52, 'lin', 0);
// S10 spinning coin close-up -> pull back to the two-shot with the street behind
key(696, [3.55, 1.38, -3.7], [3.2, 1.33, -4.5], 34, null, 0, true);
key(712, [3.5, 1.3, -3.72], [3.13, 1.15, -4.4], 32, 'lin', 0);
key(736, [6.4, 1.4, -1.5], [2.6, 1.6, -4.7], 50, 'out', 0);
key(777, [6.2, 1.4, -1.7], [2.6, 1.6, -4.7], 48, 'lin', 0);
// S11 she walks toward us along the lit-up row, stops at the chalk board
key(778, [9.0, 1.35, -2.3], [16.0, 2.3, -4.7], 52, null, 0, true);
key(830, [8.2, 1.35, -2.4], [14.0, 2.0, -4.6], 50, 'lin', 0);
key(860, [10.9, 1.35, -2.35], [9.55, 1.35, -5.1], 46, 'out', 0);
// S12a pole man tapping (looking along the front row)
key(861, [13.0, 0.85, 1.9], [16.2, 3.4, 5.0], 54, null, -2, true);
key(911, [13.2, 0.9, 2.1], [16.2, 3.4, 5.0], 52, 'lin', -2);
// S12b whip to her: pling pling; whip back: he waves
key(912, [13.2, 0.9, 2.1], [16.2, 3.4, 5.0], 52, null, 0, true);
key(919, [11.2, 1.0, 0.0], [15.6, 2.6, -4.6], 52, 'out', 0);
key(945, [11.3, 1.02, -0.2], [15.6, 2.7, -4.6], 50, 'lin', 0);
key(952, [13.0, 0.9, 1.9], [16.2, 3.1, 5.0], 52, 'out', 0);
key(962, [13.05, 0.9, 2.0], [16.2, 3.1, 5.0], 51, 'lin', 0);
// S13 she waits (looking along the back row), he sinks, pea, he pops up
key(963, [-6.4, 0.8, -1.3], [-11.8, 3.8, -4.9], 54, null, 0, true);
key(1031, [-6.6, 0.82, -1.45], [-11.8, 3.85, -4.9], 52, 'lin', 0);
// S14 "who wakes the waker?" — push in on the pause, street and moon behind
key(1032, [-3.7, 1.4, -1.2], [-7.0, 1.75, -2.9], 48, null, 0, true);
key(1060, [-3.95, 1.42, -1.35], [-7.0, 1.76, -2.9], 46, 'lin', 0);
key(1098, [-4.4, 1.55, -1.75], [-7.0, 1.95, -2.9], 44, 'out', 0);
// S15a noisy day street -> fly to her shut window
key(1099, [6.8, 1.3, -2.6], [11.0, 2.7, 5.2], 58, null, 0, true);
key(1125, [10.2, 4.1, 3.6], [10.3, 4.25, 5.2], 46, 'in', 0);
// S15b inside: from the curtains to the sleeper
key(1126, W5([-0.32, 1.75, -1.25]), W5([-0.3, 1.75, -1.9]), 46, null, 0, true);
key(1150, W5([0.9, 1.5, 1.85]), W5([-1.1, 0.7, -1.0]), 50, 'out', 0);
key(1189, W5([0.75, 1.45, 1.55]), W5([-1.1, 0.72, -1.0]), 48, 'lin', 0);
// S16 dawn crane over the roofs
key(1190, [3.5, 1.6, 2.6], [-6.0, 3.2, -1.0], 52, null, 0, true);
key(1257, [5.0, 10.5, 5.6], [-12.0, 6.0, -1.0], 54, 'lin', 0);
// S17 old waker on his chair: two snap-ins on "Wecker"
key(1258, [-8.6, 1.9, -1.6], [-13.0, 1.6, 4.6], 52, null, 0, true);
key(1272, [-8.8, 1.85, -1.3], [-13.0, 1.6, 4.6], 51, 'lin', 0);
key(1280, [-10.9, 1.2, 1.0], [-12.8, 1.6, 4.4], 48, 'out', 0);
key(1302, [-11.0, 1.2, 1.15], [-12.8, 1.6, 4.4], 47, 'lin', 0);
key(1310, [-11.6, 1.25, 2.05], [-12.7, 1.75, 4.4], 46, 'out', 0);
key(1325, [-11.65, 1.25, 2.15], [-12.7, 1.75, 4.4], 45, 'lin', 0);
// S18a his pole slips (Wecker) -> whip along the street to her window (vom Wecker)
key(1326, [-11.65, 1.25, 2.15], [-12.7, 1.75, 4.4], 45, null, 0, true);
key(1339, [-11.68, 1.25, 2.2], [-12.7, 1.75, 4.4], 45, 'lin', 0);
key(1346, [-11.0, 1.3, 1.3], [-13.0, 1.5, 4.4], 50, 'out', 3);
key(1354, [-10.9, 1.3, 1.2], [-13.0, 1.5, 4.4], 50, 'lin', 3);
key(1363, [8.0, 2.6, 0.8], [10.3, 4.0, 5.2], 48, 'out', 0);
key(1365, [8.05, 2.62, 0.85], [10.3, 4.0, 5.2], 48, 'lin', 0);
// S18b her room at dawn: snore, push on "Wecker", pea rolls off the pipe
key(1366, W5([0.6, 1.4, 1.2]), W5([-1.15, 0.75, -1.25]), 48, null, 0, true);
key(1385, W5([0.55, 1.38, 1.1]), W5([-1.15, 0.75, -1.25]), 47, 'lin', 0);
key(1392, W5([-0.3, 1.1, 0.25]), W5([-1.2, 0.8, -1.3]), 40, 'out', 0);
key(1398, W5([-0.28, 1.1, 0.22]), W5([-1.2, 0.8, -1.3]), 40, 'lin', 0);
key(1405, W5([1.75, 1.25, -0.75]), W5([0.45, 1.05, -1.5]), 46, 'out', 0);
key(1437, W5([1.8, 0.8, -0.7]), W5([0.7, 0.2, -1.4]), 48, 'lin', 0);
// S19a family snores in full daylight; snap to father on "Wecker"; whistle; eyes pop
key(1438, W2([0.35, 1.75, 3.6]), W2([0.15, 0.8, -0.6]), 54, null, 0, true);
key(1462, W2([0.33, 1.72, 3.35]), W2([0.15, 0.81, -0.6]), 53, 'lin', 0);
key(1469, W2([0.15, 1.15, 0.6]), W2([0.1, 0.85, -1.3]), 42, 'out', 0);
key(1496, W2([0.14, 1.16, 0.45]), W2([0.1, 0.87, -1.3]), 40, 'lin', 0);
// S19b everyone bursts out, camera rockets up and back, the sun grins
key(1497, [3.2, 1.2, -1.0], [1.2, 1.4, -4.6], 46, null, 0, true);
key(1521, [7.5, 9.5, 6.5], [-3.0, 5.0, -2.5], 58, 'out', 0);

const KICKS = [{ f: 210, a: 0.008 }, { f: 233, a: 0.012 }, { f: 665, a: 0.03 }, { f: 1000, a: 0.008 }, { f: 1490, a: 0.02 }, { f: 1497, a: 0.02 }, { f: 1340, a: 0.01 }];
export const camAt = (f) => {
  let c;
  if (f <= K[0].f) c = { ...K[0] }; else if (f >= K[K.length - 1].f) c = { ...K[K.length - 1] };
  else for (let i = 0; i < K.length - 1; i++) if (f >= K[i].f && f < K[i + 1].f) {
    const a = K[i], b = K[i + 1]; if (b.cut) { c = { ...a }; break; }
    const r = (f - a.f) / (b.f - a.f), t = b.e === 'out' ? easeOut(r) : b.e === 'lin' ? r : b.e === 'in' ? easeIn(r) : smooth(r);
    c = { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) }; break;
  }
  c = { ...c, pos: [...c.pos], look: [...c.look] };
  if (f >= 31 && f < 105) { const x = womanX2(f), z = wz2(f), up = smooth(ramp(f, 90, 104)); c.pos = [x + 1.8, 0.42 + up * 0.1, z + 2.6]; c.look = [x - 1.2, 1.7 + up * 0.9, z - 1.2]; c.fov = 50; c.roll = 1.5 * (1 - up); }
  if (f >= 696 && f < 714) { const P = coinAt(f); c.look = [P[0], P[1] - 0.04, P[2]]; c.pos = [P[0] + 0.38, P[1] + 0.05, P[2] + 0.85]; }
  for (const k of KICKS) { const d = f - k.f; if (d >= 0 && d < 8) { const s = (Math.floor(d) % 2 ? -1 : 1) * k.a * (1 - d / 8); c.look[1] += s * 3; c.look[0] += s * 2; c.roll = (c.roll || 0) + s * 25; } }
  // hand-held breathing so no frame is ever frozen
  c.look[1] += Math.sin(f * 0.07) * 0.006; c.look[0] += Math.sin(f * 0.051 + 1) * 0.006;
  c.flash = f >= 233 && f < 237 ? (1 - (f - 233) / 4) * 0.35 : f >= 1497 && f < 1500 ? (1 - (f - 1497) / 3) * 0.5 : 0;
  c.shadowAt = c.look;
  return c;
};
const WHIP = [[0, 5, 3], [912, 919, 6], [946, 952, 6], [1119, 1125, 4], [1355, 1364, 6], [1497, 1508, 4], [661, 666, 4]];
globalThis.mbAt = (f) => { for (const [a, b, n] of WHIP) if (f >= a && f <= b) return n; return 1; };

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOCUS = {
  s1: [[3.9, 1.5, -3.85], 6], s2: [null, 11], s3a: [[-0.1, 1.55, -3.4], 15], s3b: [[-1.1, 4.25, -5.2], 10], s3c: [[-0.1, 1.55, -3.4], 15], s4: [null, 9],
  s5a: [null, 15], s5b: [[-0.1, 1.5, -3.4], 14], s6: [[-0.1, 1.4, -3.4], 8], s7a: [W2([0.4, 0.8, -1.3]), 9], s7b: [[-1.1, 4.2, -5.6], 6], s8: [W3([-1.0, 1.55, 0.55]), 9],
  s9a: [W4([-3.5, 1.6, -1.0]), 6], s9b: [W4([-0.4, 1.55, -1.1]), 9], s10: [null, 13], s11: [null, 8], s12a: [[14.5, 1.7, 4.4], 6], s12b: [null, 7], s13: [[-9.1, 1.5, -2.7], 8],
  s14: [[-6.0, 1.55, -2.5], 14], s15a: [[10.3, 4.25, 5.2], 4], s15b: [W5([-1.2, 0.75, -1.3]), 10], s16: [null, 1], s17: [[-12.6, 1.1, 4.5], 9], s18a: [[-12.6, 1.1, 4.5], 9],
  s18b: [null, 12], s19a: [W2([0.15, 0.8, -1.3]), 10], s19b: [null, 3],
};
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f), [p, cinf] = FOCUS[S.id];
  if (S.id === 's4' || S.id === 's5a' || S.id === 's18b') { const P = peaAt(f); if (P) return { focus: dist(C.pos, P), cinf: S.id === 's4' ? 9 : 15 }; }
  if (S.id === 's10') return { focus: f < 718 ? dist(C.pos, [4.0, 1.15, -4.2]) : dist(C.pos, [4.2, 1.4, -4.0]), cinf: f < 718 ? 15 : 9 };
  if (S.id === 's11') return { focus: dist(C.pos, [womanX11(f), 1.5, -4.0]), cinf: 8 };
  if (S.id === 's12b') return { focus: f < 948 ? dist(C.pos, [13.3, 1.6, -3.0]) : dist(C.pos, [14.5, 1.7, 4.4]), cinf: 7 };
  if (S.id === 's2') return { focus: dist(C.pos, [womanX2(f), 1.3, wz2(f)]), cinf: 11 };
  return { focus: p ? dist(C.pos, p) : 8, cinf };
};

// ---------------- story state ----------------
const womanX2 = (f) => lerp(3.55, -0.1, smooth(ramp(f, 31, 90)));
const wz2 = (f) => lerp(-3.85, -3.4, smooth(ramp(f, 40, 95)));
const womanX11 = (f) => lerp(14.4, 10.45, smooth(ramp(f, 778, 832)));
const GLASS = [-1.1, 4.22, -5.1];
/** pea position (shots 4, 5a, 12b, 13, 18b) */
const peaAt = (f) => {
  if (f >= 219 && f < 233) return lerp3([-0.42, 2.12, -3.82], GLASS, (f - 219) / 14);
  if (f >= 233 && f < 257) { const t = (f - 233) / 24; return [lerp(-1.1, -0.96, t), 4.22 + 0.9 * t - 4.8 * t * t, lerp(-5.1, -4.55, t)]; }
  if (f >= 257 && f <= 312) { const P0 = [-0.94, 0, -4.72], y0 = 0.185;
    let y; if (f < 268) y = lerp(1.25, y0, ((f - 257) / 11) ** 2); else if (f < 284) { const t = (f - 268) / 16; y = y0 + 0.28 * 4 * t * (1 - t); } else if (f < 294) { const t = (f - 284) / 10; y = y0 + 0.1 * 4 * t * (1 - t); } else y = y0;
    const rt = smooth(ramp(f, 294, 312)); return [lerp(P0[0], -0.86, rt), y, lerp(P0[2], -4.8, rt)]; }
  if (f >= 920 && f < 926) return lerp3([14.35, 2.05, -3.45], [14.9, 4.2, -5.1], (f - 920) / 6);
  if (f >= 935 && f < 941) return lerp3([14.35, 2.05, -3.45], [14.9, 4.2, -5.1], (f - 935) / 6);
  if (f >= 993 && f < 1000) return lerp3([-9.25, 2.05, -3.2], [-10.3, 4.1, -5.1], (f - 993) / 7);
  if (f >= 1398 && f <= 1437) { const tip = W5([0.64, 1.36, -1.5]);
    if (f < 1405) return [tip[0] + Math.sin(f * 1.3) * 0.006, tip[1], tip[2]];
    if (f < 1418) { const t = (f - 1405) / 13; return [tip[0] + 0.12 * t, tip[1] - (tip[1] - 0.045) * t * t, tip[2] + 0.05 * t]; }
    const t = (f - 1418) / 19; return [tip[0] + 0.12 + 0.25 * t, 0.045 + 0.12 * Math.max(0, Math.sin(Math.min(1, t * 1.6) * Math.PI)) * (t < 0.62 ? 1 : 0), tip[2] + 0.05 + 0.1 * t]; }
  return null;
};
const LIT_BASE = ['b3u2', 'f5g', 'b11u1', 'f12u2', 'b13g', 'f2u1'];
export const worldAt = (f) => {
  const S = shotAt(f), W = { loc: S.loc, tod: S.tod, lit: [...LIT_BASE], shut: ['f9u1'], open: {}, fog: 0.26, pl: [] };
  if (S.tod !== 'night') W.lit = [];
  if (S.tod === 'dawn') { W.smoke = 0; W.fog = 0.12; }
  if (S.tod === 'day') W.fog = 0;
  W.pea = peaAt(f);
  const lampPL = (x, z) => ({ pos: [x, 4.0, z], col: '#ff9a48', i: 12, d: 13 });
  if (S.loc === 1 && S.tod === 'night') W.pl.push(lampPL(-7.2, -3.95), lampPL(8.4, 3.95));
  const lan = (p, i = 14) => W.pl.push({ pos: p, col: '#ffa04a', i: i * 0.75 * (0.9 + 0.1 * Math.sin(f * 1.3) * Math.sin(f * 0.71)), d: 6 });
  switch (S.id) {
    case 's1': lan([womanXs1(f) - 0.3, 0.75, -3.75], 10); break;
    case 's2': lan([womanX2(f) - 0.3, 0.75, wz2(f) + 0.1], 10); break;
    case 's3a': case 's3c': case 's5b': lan([-0.4, 0.8, -3.2], 9); break;
    case 's3b': lan([-0.4, 0.8, -3.2], 9); W.pipe3d = [[-0.1, 1.45, -3.35], [-0.55, 2.62, -4.08]]; break;
    case 's4': lan([-0.4, 0.8, -3.2], 9); break;
    case 's5a': lan([-0.4, 0.5, -3.3], 7); W.noPeaGlow = 1; break;
    case 's6': lan(f < 400 ? [-0.4, 0.6, -3.1] : [-0.45, 2.1, -3.0], f < 400 ? 1 : lerp(2, 16, ramp(f, 400, 408))); break;
    case 's7a': W.pl = [{ pos: W2([-1.6, 1.8, -0.3]), col: '#7088e0', i: 6, d: 6 }]; break;
    case 's7b': W.open = { b7u1: 1 }; lan([0.3, 0.8, -1.1], 9); W.pl.push({ pos: [-1.1, 4.4, -6.2], col: '#ffc070', i: 6, d: 3 }); break;
    case 's8': W.pl = [{ pos: W3([0, 2.4, -1.6]), col: '#ffb860', i: 5, d: 5 }, { pos: W3([0, 1.4, 0.4]), col: '#ffa860', i: 6, d: 4 }, { pos: W3([3.6, 4.2, 1.6]), col: '#ffb060', i: 10, d: 10 }]; break;
    case 's9a': case 's9b': W.pl = [{ pos: W4([-2.75, 5.5, -1.6]), col: '#ffb060', i: 22, d: 14 }, { pos: W4([2.75, 5.5, -1.6]), col: '#ffb060', i: 22, d: 14 }];
      W.gate = S.id === 's9a' ? 0 : easeIn(ramp(f, 657, 665)); if (S.id === 's9b' && f >= 665) { W.gateShake = Math.max(0, 1 - (f - 665) / 20); W.plaqueSwing = 0.2 * Math.max(0, 1 - (f - 665) / 30); } break;
    case 's10': lan([2.6, 0.75, -3.8], 10); W.lit.push('b8g'); break;
    case 's11': { lan([womanX11(f) - 0.35, f > 834 ? 2.0 : 0.75, -3.8], 10); const seq = [[788, 'b10u1'], [798, 'b10u2'], [806, 'b10g'], [816, 'b9u2'], [826, 'b9g'], [842, 'b9u1'], [850, 'b8u2']]; for (const [t, id] of seq) if (f >= t) W.lit.push(id); break; }
    case 's12a': W.pole = poleAt(f); if (f >= 896) W.lit.push('f10u1'); W.lit.push('f10u2'); break;
    case 's12b': W.pole = poleAt(f); W.lit.push('f10u1', 'f10u2'); lan([14.0, 0.8, -3.3], 9); if (f >= 943) W.lit.push('b10u2'); break;
    case 's13': lan([-9.4, 0.8, -2.5], 10); W.open = { b5u1: 1 }; W.pl.push({ pos: [-10.3, 4.3, -6.3], col: '#ffc070', i: f > 1002 ? 8 : 1.5, d: 3 }); break;
    case 's14': lan([-6.3, 0.9, -2.3], 11); break;
    case 's15a': break;
    case 's16': case 's17': case 's18a': W.pole2 = pole2At(f); break;
    case 's18b': W.noPeaGlow = 1; W.peaS = 0.6; W.pl = [{ pos: W5([0.9, 1.0, -0.8]), col: '#ffc0a0', i: 4, d: 4 }]; break;
    case 's19b': W.lit = []; break;
  }
  return W;
};
const coinAt = (f) => lerp3([3.24, 1.5, -4.55], [3.12, 1.12, -4.35], smooth((f - 696) / 22));
const womanXs1 = (f) => lerp(4.4, 3.55, f / 30);
const cardPt = (f, pos, sc, dx, dy) => { const c = camAt(f), th = Math.atan2(c.pos[0] - pos[0], c.pos[2] - pos[2]), ox = (dx / 600 - 0.5) * 1.35 * sc, oy = ((1 - dy / 1000) * 2.25 - 0.05625) * sc;
  return [pos[0] + Math.cos(th) * ox, pos[1] + oy, pos[2] - Math.sin(th) * ox]; };
const KNP = [15.9, 0.14, 4.4];
const poleAt = (f) => { const tap = [868, 878, 888].some((t) => f >= t && f < t + 4) ? 1 : 0; const h = cardPt(f, KNP, 1.08, 470, tap ? 150 : 170); const tip = [14.9, 4.0 + tap * 0.05, 5.04 - tap * 0.06]; const d = tip.map((v, i) => v - h[i]);
  return [[h[0] - d[0] * 0.25, h[1] - d[1] * 0.25, h[2] - d[2] * 0.25 + 0.05], tip]; };
const pole2At = (f) => { const slip = clamp((f - 1340) / 22); const a = lerp(0.0, 0.85, easeIn(slip)); const base = [-12.95, 0.15, 4.62], L = 3.0; return [base, [base[0] - Math.sin(0.35 + a) * L, base[1] + Math.cos(0.35 + a) * L, 4.62]]; };

// ---------------- cast ----------------
const blinkAt = (f, seed) => { const per = 50 + (seed * 17) % 30, ph = (f + seed * 13) % per; return ph < 2 ? 1 : 0; };
const TINT = { night: '#c8ccee', nightIn: '#a8b0dc', shop: '#ffe0c4', gate: '#c4c8ec', day: '#ffffff', dayIn: '#ffe2c4', dawn: '#ffe0dc', dawnIn: '#ffd8d4', dayBed: '#fff6ea' };
const LANT = { side: -1, col: '#ffb060' }, MOON = { side: 1, col: '#9ab4ff' }, SUNR = { side: 1, col: '#fff0c0' };
let T_ = null;
const C = (id, draw, pos, ex = {}) => ({ key: id, draw, x: pos[0], y: pos[1], z: pos[2], ...ex });
const CH = (id, spec, o, pos, ex = {}) => C(id + JSON.stringify(o), (p) => T_.toonChar(p, T_[spec], o), pos, ex);
const SL = (id, spec, o, pos, ex = {}) => C('sl' + id + JSON.stringify(o), (p) => T_.sleeper(p, typeof spec === 'string' ? T_[spec] : spec, o), pos, { blob: false, ...ex });
const FX = (key, draw, pos, s, ex = {}) => ({ key, draw, x: pos[0], y: pos[1] - 1.069 * s, z: pos[2], s, blob: false, shadow: false, order: 6, ...ex });
const snoreB = (f, ph = 0) => q(0.25 + 0.75 * Math.max(0, Math.sin(f * 0.13 + ph)), 2);
let WN = null; // waker in her nightcap
export const actorsAt = (f, T) => {
  T_ = T; if (!WN) WN = { ...T.WOMAN, hat: { type: 'nightcap', color: '#e8a0b0', stripes: '#fff4f0', band: '#ffffff', flop: -1 } };
  const S = shotAt(f), out = [], tint = TINT[S.L], fi = Math.round(f);
  const W = (o, pos, ex = {}) => out.push(CH('W', 'WOMAN', { blink: blinkAt(fi, 5), ...o }, pos, { tint, ...ex }));
  const wstep = (f2, sp = 15) => q((f2 % sp) / sp, 2);
  switch (S.id) {
    case 's1': { const x = womanXs1(f), lit = smooth(ramp(f, 2, 16));
      W({ back: f < 15, expr: 'determined', turn: -0.45, look: -0.7, legs: 'walk', step: wstep(fi, 16), tilt: -5, bob: q(Math.abs(Math.sin(f / 16 * Math.PI)) * 0.012, 3), L: 'hang', holdL: 'lantern', holdR: 'pipe', R: 'hang', rim: LANT }, [x, 0, -3.85],
        { tint: lit < 0.5 ? '#4a4870' : tint });
      out.push(FX('cat0' + (fi % 30 < 15), (p) => T.fxCat(p, (f % 40) / 40, 'sit'), [1.5, 6.42, -5.35], 0.42, { order: 2 })); break; }
    case 's2': { const x = womanX2(f), z = wz2(f), stop = f > 90;
      W({ expr: f > 93 ? 'aim' : 'determined', eyeL: f > 96 ? 'closed' : undefined, turn: stop ? -0.25 : -0.45, look: stop ? -0.6 : -0.7, legs: stop ? 'stand' : 'walk', step: wstep(fi, 18), tilt: stop ? 0 : -6, headTilt: stop ? -8 : 0,
        bob: stop ? 0 : q(Math.abs(Math.sin(f / 18 * Math.PI)) * 0.012, 3), L: 'hang', holdL: 'lantern', R: 'hang', holdR: 'pipe', rim: LANT }, [x, 0, z]);
      out.push(FX('cat' + (fi > 70 ? 1 : 0) + (fi % 40 < 20), (p) => T.fxCat(p, (f % 40) / 40, 'sit'), [-1.6, 6.45, -5.3], 0.42, { order: 2, flip: true })); break; }
    case 's3a': { const t = smooth(ramp(f, 110, 128)); const mouth = [316, 338];
      const o = { expr: 'aim', eyeL: f > 128 ? 'closed' : undefined, turn: 0.3, look: 0.8, L: 'hang', holdL: 'lantern', rim: LANT };
      if (t <= 0) Object.assign(o, { R: 'hang', holdR: 'pipe' }); else Object.assign(o, { holdL: undefined, lanternBelt: true, pipe: { x0: q(lerp(440, mouth[0], t), 0), y0: q(lerp(640, mouth[1], t), 0), ang: q(lerp(-88, -25, t), 1), len: 340 } });
      W(o, [-0.1, 0, -3.4]); break; }
    case 's3b': break;
    case 's3c': { const puff = f < 209 ? smooth(ramp(f, 193, 205)) : 1 - ramp(f, 209, 212);
      W({ expr: 'aim', eyeL: 'closed', turn: 0.45, puff: q(puff * 1.15, 2), pipe: { ang: -25, len: 340 }, lanternBelt: true, rim: LANT, bob: f >= 209 && f < 213 ? 0.006 : 0 }, [-0.1, 0, -3.4]);
      if (f >= 210 && f < 219) { const t = q((f - 210) / 9); out.push(FX('blow' + t, (p) => T.fxPuff(p, t), cardPt(f, [-0.1, 0, -3.4], 1, 500, 40), 0.5)); } break; }
    case 's4': { const P = peaAt(f); if (P && f < 233) for (let k = 1; k <= 5; k++) { const P2 = peaAt(f - k * 0.7); if (P2) out.push(FX('trail' + k, (p) => T.fxMote(p, 0.5), add3(P2, [0, 1.069 * 0.12 - 0.0, 0]), 0.12, { alpha: 1 - k / 6, tint: '#d0ffb0' })); }
      if (f >= 233 && f < 247) { const t = q((f - 233) / 14); out.push(FX('pling' + t, (p) => T.fxPling(p, t), [-1.1, 4.22, -5.0], 0.9)); }
      W({ expr: 'aim', eyeL: 'closed', turn: 0.4, pipe: { ang: -25, len: 340 }, lanternBelt: true, rim: LANT }, [-0.1, 0, -3.4]);
      break; }
    case 's5a': break;
    case 's5b': { const reach = smooth(ramp(f, 315, 324)), up = smooth(ramp(f, 328, 340));
      const R = up > 0 ? { x: q(lerp(410, 430, up), 0), y: q(lerp(610, 330, up), 0) } : { x: q(lerp(470, 410, reach), 0), y: q(lerp(560, 610, reach), 0) };
      W({ expr: f > 340 ? 'smug' : 'neutral', turn: -0.2, look: f > 340 ? -0.5 : 0.4, L: 'hang', holdL: 'lantern', R, holdR: up > 0.5 ? 'pea' : undefined, tuck: true, rim: LANT, headTilt: f > 340 ? -6 : 0 }, [-0.1, 0, -3.4]); break; }
    case 's6': { const turned = f >= 401, sx = f >= 397 && f < 405 ? Math.abs(Math.cos((f - 397) / 8 * Math.PI)) : 1;
      if (!turned) W({ back: true, tilt: -7, L: 'hang', holdL: 'lanternOff', R: { x: 420, y: 520 }, legs: 'walk', step: wstep(fi, 26), bob: q(Math.abs(Math.sin(f / 26 * Math.PI)) * 0.01, 3), rim: MOON }, [lerp(0.3, -0.1, ramp(f, 358, 396)), 0, -3.4], { tint: '#3e3c60', sx: q(Math.max(0.05, sx), 2) });
      else W({ expr: 'sweet', blush: true, turn: 0.1, L: 'up', holdL: 'lantern', R: 'wave', tuck: true, rim: LANT, bob: q(Math.max(0, Math.sin((f - 401) / 8 * Math.PI)) * 0.03 * (f < 409 ? 1 : 0), 3) }, [-0.1, 0, -3.4], { tint: '#ffe4c4', sx: q(Math.max(0.05, sx), 2) });
      break; }
    case 's7a': { const jump = f >= 430, jy = jump ? Math.max(0, Math.sin(clamp((f - 430) / 12) * Math.PI)) * 0.45 : 0;
      out.push(SL('F', 'FATHER', jump ? { expr: f < 448 ? 'shock' : 'sleepy', L: 'up', R: 'up', lift: 0.12, hat: { type: 'nightcap', color: '#d84a4a', stripes: '#f4efe4', flop: 1, tilt: f < 445 ? -25 : -10 } } : { expr: 'snore', bubble: snoreB(f) }, W2([0.1, q(-0.19 + jy, 3), -1.3]), { s: 0.72, tint }));
      out.push(SL('M', 'MOTHER', { expr: 'snoreO', bubble: snoreB(f, 2) }, W2([0.9, -0.19, -1.3]), { s: 0.72, tint }));
      ['KID1', 'KID2', 'KID3'].forEach((k, i) => out.push(SL(k, k, { expr: i === 1 ? 'snore' : 'sleep', bubble: i === 0 ? snoreB(f, i * 2) : 0, quilt: '#7a9ac8' }, W2([-0.55 + i * 0.55, -0.28, 1.35]), { s: 0.45, tint })));
      break; }
    case 's7b': { const wave = Math.floor(f / 6) % 2;
      out.push(CH('F', 'FATHER', { expr: f < 482 ? 'sleepy' : 'happy', look: 0.6, turn: 0.25, R: f > 478 ? (wave ? 'wave' : 'up') : 'hang', L: { x: 170, y: 560 }, headTilt: 8, hat: { type: 'nightcap', color: '#d84a4a', stripes: '#f4efe4', flop: 1, tilt: -18 } }, [-1.1, 2.62, -5.75], { tint: '#d8c8c0', blob: false }));
      const nod = f > 486 ? Math.sin((f - 486) / 7 * Math.PI) * 6 : 0;
      W({ expr: f > 484 ? 'happy' : 'neutral', turn: -0.35, look: -0.7, headTilt: q(-8 + nod, 1), L: 'hang', holdL: 'lantern', R: f > 492 ? 'thumb' : 'hang', holdR: f > 492 ? undefined : 'pipe', tuck: f > 492, rim: LANT }, [0.55, 0, -1.2]);
      break; }
    case 's8': { const out_ = f >= 545;
      out.push(CH('P', 'POORMAN', out_ ? { expr: 'worried', turn: 0.2, look: 0.2, pockets: true, L: { x: 90, y: 640 }, R: { x: 510, y: 640 }, headTilt: 6 } : { expr: 'shock', turn: -0.6, look: -0.9, L: 'hang', R: 'chin' }, W3([0.05, 0.14, 1.75]), { tint: '#ffd8b8' }));
      out.push(CH('K', 'CLOCKMAKER', { expr: 'proud', glasses: true, turn: 0.3, look: 0.4, L: 'wave', R: f % 30 < 15 ? 'point' : 'reach', headTilt: q(Math.sin(f * 0.1) * 4, 1) }, W3([-0.55, 0.45, -2.45]), { tint: '#fff0dc', s: 0.92, blob: false }));
      if (out_) { const t = ramp(f, 548, 581); out.push(FX('moth' + (fi % 6), (p) => T.fxMoth(p, (f % 6) / 6), [lerp(399.75, 400.2, t) + Math.sin(f * 0.4) * 0.1, lerp(1.0, 2.6, t), lerp(1.85, 2.0, t)], 0.2)); }
      break; }
    case 's9a': { out.push(CH('FM', 'FOREMAN', { expr: f > 620 ? 'angry' : 'determined', look: f > 620 ? 0.5 : 0.8, turn: 0.2, R: { x: 470, y: 440 }, holdR: 'watch', L: 'hip', headTilt: f > 620 ? 0 : 10 }, W4([-1.7, 0, -1.15]), { tint }));
      for (let k = 0; k < 7; k++) { const t0 = 582 + k * 11, t = (f - t0) / 70; if (t < 0 || t > 1) continue; const x = [0.4, 1.3, 0.8, 1.6, 0.1, 1.1, 0.6][k];
        out.push(C('wk' + k + JSON.stringify([wstep(fi + k * 3, 12)]), (p) => T.toonChar(p, T.WORKERS[k % 5], { expr: 'worried', turn: -0.2, legs: 'walk', step: wstep(fi + k * 3, 12), L: 'hang', R: 'hang', bob: q(Math.abs(Math.sin((f + k * 3) / 12 * Math.PI)) * 0.015, 3) }), W4([x, 0, lerp(3.4, -5, t)]), { tint, s: 0.96 })); }
      break; }
    case 's9b': { const run = f < 664, z = lerp(3.4, -1.05, easeOut(ramp(f, 652, 664)));
      out.push(C('late' + JSON.stringify([run, wstep(fi, 8), f > 664 ? (f > 674 ? 2 : 1) : 0]), (p) => T.toonChar(p, T.WORKERS[3], run ? { expr: 'scared', sweat: true, legs: 'walk', step: wstep(fi, 8), tilt: -10, L: 'forward', R: 'forward', turn: 0.2 }
        : { expr: f > 674 ? 'worried' : 'shock', sweat: true, L: f > 674 ? 'hang' : 'up', R: f > 674 ? 'chin' : 'up', turn: -0.1, look: 0.3 }), W4([-1.3, 0, z]), { tint }));
      out.push(CH('FM', 'FOREMAN', { expr: 'angry', R: Math.floor(f / 5) % 2 ? 'point' : 'up', L: 'hip', holdL: 'watch', turn: 0.1 }, W4([-1.0, 0, -3.1]), { tint }));
      break; }
    case 's10': { const pull = f >= 712;
      out.push(CH('cust', 'POORMAN', { expr: 'sleepy', turn: -0.4, look: -0.6, R: 'hang', L: f < 716 ? { x: 80, y: 470 } : 'hang', hat: undefined, hair: '#8a5a2e', hairStyle: 'mop' }, [3.35, 0.14, -4.95], { tint, blob: true }));
      const palm = f < 740 ? { x: 450, y: 520 } : f < 754 ? { x: 410, y: 600 } : 'thumb';
      W({ expr: f > 752 ? 'happy' : 'neutral', turn: 0.35, look: 0.6, L: 'hang', holdL: 'lantern', R: palm, holdR: f >= 716 && f < 742 ? 'coins' : undefined, tuck: true, rim: LANT, headTilt: f > 752 ? -6 : 0 }, [2.75, 0, -3.95]);
      if (f < 718) { const P = coinAt(f); out.push(FX('coin' + (fi % 8), (p) => T.fxCoin(p, (f % 8) / 8), P, 0.32, { order: 8 })); }
      if (f >= 716 && f < 728) { const t = q((f - 716) / 12); out.push(FX('spark' + t, (p) => T.fxBurst(p, t, '#fff3b0', 8, 20, 120), [3.1, 1.12, -4.25], 0.35)); }
      break; }
    case 's11': { const x = womanX11(f), stop = f > 832;
      W({ expr: stop ? (f > 846 ? 'happy' : 'determined') : 'determined', turn: -0.45, look: -0.9, legs: stop ? 'stand' : 'walk', step: wstep(fi, 15), bob: stop ? 0 : q(Math.abs(Math.sin(f / 15 * Math.PI)) * 0.012, 3),
        L: stop ? 'up' : 'hang', holdL: 'lantern', R: 'hang', holdR: 'pipe', headTilt: stop && f > 846 ? q(Math.sin((f - 846) / 6 * Math.PI) * 6, 1) : 0, rim: LANT }, [x, 0, -4.0]);
      out.push(FX('catS' + (fi % 40 < 20), (p) => T.fxCat(p, (f % 40) / 40, 'walk'), [lerp(16, 11, ramp(f, 778, 860)), 0.62, -4.75], 0.3, { order: 2, flip: true }));
      break; }
    case 's12a': { const tap = [868, 878, 888].some((t) => f >= t && f < t + 4);
      out.push(CH('KN', 'KNOCKER', { expr: 'determined', turn: 0.35, look: 0.9, L: { x: 400, y: tap ? 300 : 320 }, R: { x: 470, y: tap ? 150 : 170 }, headTilt: 8 }, KNP, { tint, s: 1.08 }));
      break; }
    case 's12b': { const shoot = (t0) => f >= t0 - 6 && f < t0 + 1;
      const puff = shoot(925) || shoot(940) ? 1 : 0;
      W(f < 944 ? { expr: 'aim', eyeL: 'closed', turn: 0.15, puff, pipe: { ang: -76, len: 340 }, lanternBelt: true, rim: LANT } : { expr: 'happy', turn: 0.4, look: 0.8, L: 'hang', holdL: 'lantern', R: Math.floor(f / 5) % 2 ? 'wave' : 'up', tuck: true, rim: LANT }, [14.2, 0, -3.2]);
      out.push(CH('KN', 'KNOCKER', f >= 950 ? { expr: 'happy', turn: -0.2, look: -0.5, L: { x: 400, y: 320 }, R: Math.floor(f / 5) % 2 ? 'wave' : 'up' } : { expr: 'determined', turn: 0.35, look: 0.9, L: { x: 400, y: 320 }, R: { x: 470, y: 170 }, headTilt: 8 }, KNP, { tint, s: 1.08 }));
      for (const t0 of [926, 941]) if (f >= t0 && f < t0 + 12) { const t = q((f - t0) / 12); out.push(FX('pl' + t0 + t, (p) => T.fxPling(p, t), [14.9, 4.22, -5.0], 0.7)); }
      break; }
    case 's13': { const tap = q(Math.abs(Math.sin(f * 0.5)), 2), shoot = f >= 986 && f < 1000, puff = f >= 986 && f < 993 ? smooth(ramp(f, 986, 991)) : 0;
      const manY = f < 972 ? 2.62 : f < 984 ? lerp(2.62, 1.75, easeIn(ramp(f, 972, 984))) : f < 1001 ? 1.75 : lerp(1.75, 2.72, easeOut(ramp(f, 1001, 1006)));
      const manO = f < 984 ? { expr: f < 972 ? 'sleepy' : 'sleep', L: { x: 160, y: 560 }, R: { x: 440, y: 560 }, headTilt: q(lerp(0, -20, ramp(f, 966, 980)), 1) } : f < 1012 ? { expr: 'shock', L: 'up', R: 'up', sweat: true } : { expr: 'happy', R: Math.floor(f / 5) % 2 ? 'wave' : 'up', L: { x: 160, y: 560 } };
      out.push(CH('M13', T.WORKERS ? 'FATHER' : 'FATHER', { ...manO, hat: { type: 'nightcap', color: '#3a7ac8', stripes: '#f4efe4', flop: -1 }, hair: '#3a2a22', mous: '#3a2a22' }, [-10.3, q(manY, 3), -5.75], { tint: f > 1002 ? '#ffe0c0' : '#a8a8d0', blob: false }));
      const walkOff = f > 1016, x = lerp(-9.15, -10.6, smooth(ramp(f, 1016, 1031)));
      if (shoot) W({ expr: 'aim', eyeL: 'closed', turn: 0.35, puff: q(puff, 2), pipe: { ang: -25, len: 340 }, lanternBelt: true, rim: LANT }, [-9.15, 0, -2.75]);
      else W({ expr: f < 1004 ? 'determined' : 'happy', turn: walkOff ? -0.4 : 0.35, look: walkOff ? -0.6 : 0.8, L: f < 986 ? 'cross' : 'hang', R: f < 986 ? 'cross' : 'hang', holdL: f < 986 ? undefined : 'lantern', tuck: true, robeTap: 1, tap: f < 986 ? tap : 0, legs: walkOff ? 'walk' : 'stand', step: wstep(fi, 15), rim: LANT }, [x, 0, -2.75]);
      if (f >= 1000 && f < 1012) { const t = q((f - 1000) / 12); out.push(FX('pl13' + t, (p) => T.fxPling(p, t), [-10.3, 4.2, -5.0], 0.8)); }
      break; }
    case 's14': { const lookCam = f > 1064;
      W({ expr: 'raised', turn: lookCam ? 0 : -0.3, look: lookCam ? 0 : -0.6, eyeL: undefined, L: lookCam ? 'chin' : 'chin', R: 'hang', holdR: 'lantern', tuck: true, headTilt: lookCam ? 6 : -4, rim: { side: 1, col: '#ffb060' } }, [-6.0, 0, -2.5]);
      if (f >= 1040) { const t = q(ramp(f, 1040, 1098), 2); out.push(FX('qs' + t, (p) => T.fxQSmoke(p, t), cardPt(f, [-6.0, 0, -2.5], 1, 470, 330), 0.4, { order: 7 })); }
      break; }
    case 's15a': { const t = ramp(f, 1099, 1125);
      out.push(FX('cart' + (fi % 12), (p) => T.fxHorseCart(p, (f % 12) / 12), [lerp(7.4, 10.4, t), 1.3, 2.4], 1.25, { order: 2, blob: true, shadow: true, tint: '#ffffff' }));
      out.push(FX('barrow', (p) => T.fxBarrow(p, 0), [12.2, 0.95, 2.8], 1.0, { order: 2, shadow: true }));
      out.push(CH('vend', 'POORMAN', { expr: 'laugh', turn: -0.4, L: 'forward', R: 'up', hat: { type: 'wide', color: '#d8b06a', band: '#8a5a2e' } }, [12.9, 0.0, 3.0], { tint }));
      out.push(C('kid15' + (fi % 10 < 5), (p) => T.toonChar(p, T.KID1, { expr: 'laugh', legs: 'walk', step: (f % 10) / 10, L: 'up', R: 'wave' }), [lerp(11.5, 9.0, t), 0, 0.2], { tint, s: 0.62 }));
      break; }
    case 's15b': out.push(SL('WN', WN, { expr: 'snoreO', bubble: snoreB(f), blush: true, quilt: '#5a6a9a' }, W5([-1.2, -0.165, -1.32]), { s: 0.7, tint }));
      out.push(FX('fly' + (fi % 4), (p) => T.fxMoth(p, (f % 4) / 4), W5([-0.35 + Math.sin(f * 0.11) * 0.35, 1.5 + Math.sin(f * 0.17) * 0.25, -0.6 + Math.cos(f * 0.09) * 0.3]), 0.08));
      break;
    case 's16': { const cx = lerp(-14, -4, ramp(f, 1190, 1257));
      out.push(FX('cat16' + (fi % 40 < 20), (p) => T.fxCat(p, (f % 40) / 40, 'walk'), [cx, 7.95, -8.2], 0.55, { order: 2, tint: '#2a2030' }));
      for (let k = 0; k < 5; k++) { const bx = lerp(-25, 10, ((f - 1190) / 67 + k * 0.17) % 1), by = 10 + k * 1.3 + Math.sin(f * 0.2 + k) * 0.3; out.push(FX('bird' + (fi % 6 < 3), (p) => birdDraw(p, (f % 6) / 6), [bx, by, -3 + k * 1.5], 0.35, { tint: '#2a2030' })); }
      break; }
    case 's17': case 's18a': { const nod = f >= 1340 && f < 1352 ? Math.sin((f - 1340) / 12 * Math.PI) * 14 : 0;
      out.push(CH('OM', 'OLDMAN', { expr: 'snore', bubble: snoreB(f, 1), legs: 'sit', headTilt: q(14 + nod, 1), L: { x: 150, y: 640 }, R: { x: 420, y: 560 }, turn: 0.2 }, [-12.6, 0.1, 4.18], { tint }));
      out.push(FX('catOM', (p) => T.fxCat(p, (f % 80) / 80, 'sit'), [-13.35, 0.62, 4.75], 0.3, { order: 2, tint: '#d8c8c8' }));
      break; }
    case 's18b': out.push(SL('WN', WN, { expr: 'snore', bubble: snoreB(f, 1), blush: true, quilt: '#5a6a9a' }, W5([-1.2, -0.165, -1.32]), { s: 0.7, tint })); break;
    case 's19a': { const pop = f >= 1488;
      out.push(SL('F', 'FATHER', pop ? { expr: 'shock', lift: q(f >= 1491 ? 0.08 : 0, 2), hat: { type: 'nightcap', color: '#d84a4a', stripes: '#f4efe4', flop: 1, tilt: -12 } } : { expr: 'snore', bubble: snoreB(f) }, W2([0.1, -0.19, -1.3]), { s: 0.72, tint }));
      out.push(SL('M', 'MOTHER', { expr: 'snoreO', bubble: snoreB(f, 2) }, W2([0.9, -0.19, -1.3]), { s: 0.72, tint }));
      ['KID1', 'KID2', 'KID3'].forEach((k, i) => out.push(SL(k, k, { expr: i === 1 ? 'snore' : 'sleep', bubble: i === 2 ? snoreB(f, 3) : 0, quilt: '#7a9ac8' }, W2([-0.55 + i * 0.55, -0.28, 1.35]), { s: 0.45, tint })));
      break; }
    case 's19b': { const t = ramp(f, 1497, 1521);
      out.push(C('F19' + (fi % 8), (p) => T.toonChar(p, T.FATHER, { expr: 'scream', legs: 'walk', step: (f % 8) / 8, L: 'up', R: 'up', tilt: -12, hat: { type: 'nightcap', color: '#d84a4a', stripes: '#f4efe4', flop: 1, tilt: -40 } }), [lerp(1.2, -1.2, t), 0, lerp(-4.4, -2.8, t)], { tint }));
      const runners = [[5.8, -4.6], [-3.4, -4.6], [10.4, -4.6], [-1.2, 4.6], [3.4, 4.6], [8.0, 4.6], [-6.8, -4.6], [-10.4, 4.6]];
      runners.forEach(([x, z], k) => { const tt = clamp(t * 1.4 - k * 0.04); out.push(C('run' + k + (fi % 8), (p) => T.toonChar(p, T.WORKERS[k % 5], { expr: k % 2 ? 'scared' : 'shock', legs: 'walk', step: ((f + k * 2) % 8) / 8, L: 'forward', R: 'up', tilt: -10, sweat: true }), [x - tt * 3.5, 0, z * (1 - tt * 0.55)], { tint })); });
      break; }
  }
  return out;
};
function birdDraw(p, t) { const g = p.g, w = Math.sin(t * Math.PI * 2) * 40; g.lineWidth = 16; g.lineCap = 'round'; g.strokeStyle = '#2a2030'; g.beginPath(); g.moveTo(160, 500 - w); g.quadraticCurveTo(230, 470, 300, 520); g.quadraticCurveTo(370, 470, 440, 500 - w); g.stroke(); }

export const fxAt = (f, T) => {
  const S = shotAt(f), out = [], fi = Math.round(f);
  const glowAt = (key, pos, s, col = '255,190,110', k = 0.85) => out.push(FX(key, (p) => T.fxGlow(p, col, k), pos, s, { order: 1 }));
  // lantern glow halos on the waker
  const H = (pos, dx = 157, dy = 660) => cardPt(f, pos, 1, dx, dy), BELT = [209, 620];
  const LG = { s1: H([womanXs1(f), 0, -3.85]), s2: H([womanX2(f), 0, wz2(f)]), s3a: f < 110 ? H([-0.1, 0, -3.4]) : H([-0.1, 0, -3.4], ...BELT), s3c: H([-0.1, 0, -3.4], ...BELT), s5b: H([-0.1, 0, -3.4]),
    s6: f >= 401 ? H([-0.1, 0, -3.4], 131, 260) : null, s7b: H([0.55, 0, -1.2]), s10: H([2.75, 0, -3.95]), s11: f > 832 ? H([womanX11(f), 0, -4.0], 131, 260) : H([womanX11(f), 0, -4.0]),
    s12b: f >= 944 ? H([14.2, 0, -3.2]) : H([14.2, 0, -3.2], ...BELT), s13: f >= 986 && f < 1000 ? H([-9.15, 0, -2.75], ...BELT) : f >= 1000 ? H([-9.15, 0, -2.75]) : null, s14: H([-6.0, 0, -2.5], 440, 660) };
  const lg = LG[S.id]; if (lg) { const fl = q(0.75 + 0.12 * Math.sin(f * 1.1) * Math.sin(f * 0.43), 2); glowAt('lg' + fl, lg, 0.75, '255,190,110', fl); }
  // moths around the lantern (night street shots)
  if (lg && S.tod === 'night') for (let k = 0; k < 3; k++) { const a = f * (0.21 + k * 0.05) + k * 2.1; out.push(FX('moth' + k + (fi % 4), (p) => T.fxMoth(p, ((f + k) % 4) / 4), [lg[0] + Math.cos(a) * 0.32, lg[1] + 0.1 + Math.sin(a * 1.3) * 0.22, lg[2] + Math.sin(a) * 0.25], 0.07)); }
  // breath vapour in the cold night (waker close-ups)
  if (['s3a', 's5b', 's14', 's2'].includes(S.id)) { const t = q(((f % 50) / 50), 2); if (t < 0.6) out.push(FX('breath' + t, (p) => T.fxPuff(p, t / 0.6), S.id === 's14' ? [-5.75, 1.55, -2.35] : S.id === 's2' ? [womanX2(f) - 0.25, 1.5, wz2(f) + 0.1] : [-0.0, 1.5, -3.25], 0.35, { alpha: 0.7 })); }
  // dust motes in light beams
  if (['s15b', 's18b', 's19a', 's7a', 's8'].includes(S.id)) for (let i = 0; i < 12; i++) { const t = ((f * 0.004 + i * 0.137) % 1); const base = S.id === 's8' ? W3([-1.5 + (i * 0.27) % 3, 0.6, 0.2]) : S.id === 's7a' || S.id === 's19a' ? W2([-1.6 + (i * 0.31) % 2, 0.4, -0.6 + (i % 3) * 0.4]) : W5([-0.6 + (i * 0.11) % 0.6, 0.3, -1.2 + (i % 4) * 0.35]);
    out.push(FX('mote' + q(Math.sin(t * Math.PI), 1), (p) => T.fxMote(p, t), [base[0] + Math.sin(f * 0.02 + i) * 0.15, base[1] + t * 1.8, base[2]], 0.1)); }
  // the big grinning sun at the end
  if (S.id === 's19b') { const t = ramp(f, 1497, 1521); out.push(FX('sun' + q(t, 1), (p) => T.fxSun(p, t), [-26, lerp(14, 22, t), -30], 14, { order: 0, blob: false, tint: '#ffffff', fogless: true })); }
  if (S.id === 's15a') out.push(FX('sun15', (p) => T.fxSun(p, 0), [30, 30, 40], 12, { order: 0 }));
  return out;
};
