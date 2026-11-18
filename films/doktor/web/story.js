// "Stell dir vor, du bist Arzt" — 42.3 s voice + 0.5 s tail. Phrase times (silence-aligned, checked against the mp3):
//  0.00-1.66 Stell dir vor, du bist Arzt. | 1.86-2.93 Vor zweihundert Jahren. | 3.22-4.73 Dein erster Patient hat Fieber.
//  5.00-7.59 Was machst du? (5.00-5.57) Ganz klar: (5.68-6.18) Blut abnehmen. (6.33-6.92) Viel Blut. (7.05-7.59)
//  7.83-9.13 Oder du setzt ihm Blutegel an. | 9.39-11.28 Die sollen das „schlechte Blut“ rausholen.
// 11.51-14.56 Danach gehst du direkt rüber zu den Frauen, (13.24) die gerade ein Baby bekommen. | 14.69-15.26 Hände waschen? | 15.57-16.04 Wozu?
// 16.46-18.09 Vorher hast du noch an Leichen gearbeitet … (pause 18.07-18.33) 18.34-19.03 aber egal.
// 19.38-20.70 Dann kommt ein Kollege und sagt: | 20.86-21.71 Wascht euch die Hände! | 21.89-23.13 Dann sterben weniger Mütter.
// 23.46-24.28 Und er hat recht. | 24.61-25.95 Die Zahlen gehen sofort runter. | 26.37-27.80 Und was machen die anderen Ärzte? | 28.24-29.13 Sie lachen ihn aus.
// 29.59-32.02 Und wenn jemand halb ertrunken aus dem Fluss gezogen wird? | 32.34-34.38 Dafür liegt am Ufer ein Notfallkoffer bereit. | 34.61-35.63 Mit einem Blasebalg.
// 35.95-37.98 Damit pustest du dem Patienten Tabakrauch … (pause 37.96-38.22) 38.22-38.84 in den Hintern.
// 39.09-39.64 Kein Witz. | 40.23-41.03 Damals hieß das: | 41.29-41.95 Erste Hilfe.
export const FPS = 30, TOTAL = 1285;
export const SHOTS = [
  { id: 'hook', a: 0, b: 54, loc: 'clinic', light: 'clinic' },
  { id: 'room', a: 55, b: 94, loc: 'clinic', light: 'clinic' },
  { id: 'fever', a: 95, b: 147, loc: 'clinic', light: 'clinic' },
  { id: 'blood', a: 148, b: 232, loc: 'clinic', light: 'clinic' },
  { id: 'leech', a: 233, b: 279, loc: 'clinic', light: 'clinic' },
  { id: 'thumbs', a: 280, b: 343, loc: 'clinic', light: 'clinic' },
  { id: 'morgue', a: 344, b: 399, loc: 'hall', light: 'hall' },
  { id: 'walk', a: 400, b: 438, loc: 'hall', light: 'hall' },
  { id: 'basin', a: 439, b: 491, loc: 'hall', light: 'hall' },
  { id: 'door', a: 492, b: 578, loc: 'hall', light: 'hall' },
  { id: 'koleg', a: 579, b: 654, loc: 'wash', light: 'wash' },
  { id: 'ward', a: 655, b: 700, loc: 'ward', light: 'wardWarm' },
  { id: 'graph', a: 701, b: 787, loc: 'wash', light: 'wash' },
  { id: 'docs', a: 788, b: 844, loc: 'wash', light: 'wash' },
  { id: 'laugh', a: 845, b: 884, loc: 'wash', light: 'wash' },
  { id: 'river', a: 885, b: 967, loc: 'river', light: 'river' },
  { id: 'kit', a: 968, b: 1035, loc: 'river', light: 'river' },
  { id: 'bellows', a: 1036, b: 1075, loc: 'river', light: 'river' },
  { id: 'smoke', a: 1076, b: 1169, loc: 'river', light: 'river' },
  { id: 'cough', a: 1170, b: 1204, loc: 'river', light: 'riverWarm' },
  { id: 'final', a: 1205, b: 1284, loc: 'river', light: 'riverWarm' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f < s.b + 1) || (f < 0 ? SHOTS[0] : SHOTS[SHOTS.length - 1]);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const easeOut = (t) => 1 - (1 - clamp(t)) ** 3.2;
const easeIn = (t) => clamp(t) ** 2.6;
const lerp = (a, b, t) => a + (b - a) * t, lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t)), ramp = (f, a, b) => clamp((f - a) / (b - a));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const PX = 2.25 / 1000;

// ---------------- light ----------------
const base = { az: 120, el: 40, sat: 1.12, vig: 0.28, shadowExt: 6, waterDeep: '#3a5a50', waterShal: '#6a8a78', glint: '#d8e8d8', ink: 1.5 };
export const LIGHTS = {
  clinic: { ...base, az: 200, el: 38, sky: '#8a6a48', ground: '#2a1a10', hemi: 0.95, sun: '#ffb070', sunI: 1.7, fog: '#24160e', fogNear: 5, fogFar: 22, skyTop: '#1a1410', skyHor: '#2a1e16', gain: '#ffe6cc', lift: '#0c0608', vig: 0.34, sat: 1.18, ink: 1.6 },
  hall: { ...base, az: 280, el: 52, sky: '#c4d0e4', ground: '#5a6274', hemi: 1.1, sun: '#dce8ff', sunI: 1.5, fog: '#9aa8c0', fogNear: 7, fogFar: 34, skyTop: '#9aa8c0', skyHor: '#c0cce0', gain: '#e4eeff', lift: '#05070e', vig: 0.3 },
  wardWarm: { ...base, az: 160, el: 30, sky: '#ffe4c8', ground: '#8a7060', hemi: 1.2, sun: '#ffd8a8', sunI: 1.9, fog: '#e8d8c4', fogNear: 6, fogFar: 32, skyTop: '#e8d8c4', skyHor: '#f4e8d8', gain: '#fff2e0', lift: '#080604', vig: 0.24 },
  wash: { ...base, az: 170, el: 42, sky: '#eaf4ff', ground: '#8a98a8', hemi: 1.45, sun: '#ffffff', sunI: 1.8, fog: '#d8e6f4', fogNear: 9, fogFar: 40, skyTop: '#d8e6f4', skyHor: '#eaf2fa', gain: '#f2f8ff', lift: '#060a10', vig: 0.2, sat: 1.1 },
  river: { ...base, az: 230, el: 30, sky: '#b8c4b0', ground: '#4a5444', hemi: 1.2, sun: '#e4ead4', sunI: 1.3, fog: '#aab8a6', fogNear: 10, fogFar: 85, skyTop: '#7f9284', skyHor: '#c4ccbc', gain: '#eef4e2', lift: '#050905', vig: 0.26, sat: 1.05, shadowExt: 8 },
  riverWarm: { ...base, az: 230, el: 26, sky: '#e4d8c0', ground: '#5a5444', hemi: 1.25, sun: '#ffe2b4', sunI: 1.6, fog: '#c8c0a8', fogNear: 10, fogFar: 90, skyTop: '#a09888', skyHor: '#e0d4bc', gain: '#fff2dc', lift: '#080604', vig: 0.24, sat: 1.12, shadowExt: 8 },
};
const flashAt = (f) => { let k = 0; for (const [a, p] of [[5, 1], [9, 0.6], [62, 0.5], [118, 0.35]]) { const d = f - a; if (d >= 0 && d < 9) k = Math.max(k, p * (d < 1 ? 1 : Math.exp(-(d - 1) * 0.6))); } return k; };
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.loc === 'clinic') { const k = flashAt(f); L.hemi += 1.2 * k; if (k > 0.3) L.sky = '#c8d4ff'; }
  return L;
};

// ---------------- camera ----------------
const K = [
  { f: 0, pos: [0.12, 1.64, 1.0], look: [-0.25, 1.62, -1.6], fov: 44, roll: -2 },
  { f: 16, pos: [0.1, 1.62, 0.86], look: [-0.25, 1.6, -1.6], fov: 42, roll: -1.5, e: 'lin' },
  { f: 30, pos: [0.06, 1.52, 0.68], look: [0.02, 1.43, -0.5], fov: 40, roll: 2, e: 'out' },
  { f: 55, pos: [0.05, 1.51, 0.6], look: [0.02, 1.43, -0.5], fov: 39, roll: 2.5, e: 'lin' },
  { f: 72, pos: [0.95, 1.95, 2.6], look: [0.25, 1.45, -1.9], fov: 50, roll: 0, e: 'out' },
  { f: 95, pos: [1.0, 1.92, 2.42], look: [0.3, 1.45, -1.9], fov: 49, e: 'lin' },
  { f: 108, pos: [0.95, 1.35, 1.0], look: [1.45, 1.15, -1.6], fov: 44, e: 'out' },
  { f: 148, pos: [0.98, 1.33, 0.85], look: [1.45, 1.16, -1.6], fov: 42, e: 'lin' },
  { f: 160, pos: [1.15, 1.15, 1.4], look: [1.15, 1.12, -1.5], fov: 44, e: 'out' },
  { f: 208, pos: [1.2, 1.12, 1.18], look: [1.2, 1.12, -1.5], fov: 43, e: 'lin' },
  { f: 216, pos: [1.45, 1.22, 0.32], look: [1.5, 1.14, -1.6], fov: 38, e: 'out' },
  { f: 228, pos: [1.46, 1.22, 0.24], look: [1.5, 1.14, -1.6], fov: 37, e: 'lin' },
  { f: 238, pos: [2.38, 1.52, -0.72], look: [1.9, 0.98, -1.55], fov: 38, e: 'out' },
  { f: 280, pos: [2.32, 1.46, -0.84], look: [1.9, 0.98, -1.55], fov: 36, e: 'lin' },
  { f: 288, pos: [2.3, 1.3, -0.85], look: [1.91, 0.98, -1.54], fov: 36, e: 'out' },
  { f: 300, pos: [2.27, 1.28, -0.9], look: [1.91, 0.98, -1.54], fov: 35, e: 'lin' },
  { f: 314, pos: [0.95, 1.32, 1.5], look: [1.15, 1.22, -1.5], fov: 46, e: 'out' },
  { f: 334, pos: [1.0, 1.31, 1.36], look: [1.15, 1.22, -1.5], fov: 45, e: 'lin' },
  { f: 344, pos: [1.05, 1.31, 1.32], look: [5.0, 1.2, 0.2], fov: 45, roll: -4, e: 'in' },
  { f: 344, cut: true, pos: [101.6, 1.45, 0.7], look: [97.4, 1.3, -0.6], fov: 44, roll: 4 },
  { f: 352, pos: [101.6, 1.45, 0.7], look: [100.1, 1.32, -2.2], fov: 42, roll: 0, e: 'out' },
  { f: 396, pos: [101.42, 1.42, 0.45], look: [100.25, 1.3, -1.9], fov: 40, e: 'lin' },
  { f: 412, pos: [101.6, 1.6, 2.3], look: [101.9, 1.3, -0.7], fov: 50, e: 'smooth' },
  { f: 438, pos: [104.0, 1.6, 2.3], look: [106.6, 1.3, 1.0], fov: 48, e: 'lin' },
  { f: 450, pos: [106.6, 1.5, -1.0], look: [107.45, 1.25, 1.8], fov: 42, e: 'out' },
  { f: 491, pos: [106.75, 1.48, -0.85], look: [107.6, 1.25, 1.8], fov: 40, e: 'lin' },
  { f: 500, pos: [108.0, 1.5, -0.3], look: [109.25, 1.36, 1.8], fov: 40, e: 'out' },
  { f: 541, pos: [108.1, 1.48, -0.15], look: [109.25, 1.36, 1.8], fov: 39, e: 'lin' },
  { f: 547, pos: [108.1, 1.48, -0.15], look: [100.0, 1.55, -2.32], fov: 9, e: 'out' },
  { f: 553, pos: [108.1, 1.48, -0.15], look: [100.0, 1.55, -2.32], fov: 8, e: 'lin' },
  { f: 560, pos: [108.1, 1.48, -0.15], look: [109.25, 1.36, 1.8], fov: 40, e: 'out' },
  { f: 572, pos: [108.15, 1.47, -0.05], look: [109.3, 1.36, 1.8], fov: 39, e: 'lin' },
  { f: 579, pos: [108.15, 1.47, -0.05], look: [113.5, 1.3, 0.8], fov: 39, roll: -4, e: 'in' },
  { f: 579, cut: true, pos: [300.6, 1.45, 2.2], look: [298.6, 1.35, -3.4], fov: 46, roll: 4 },
  { f: 588, pos: [300.6, 1.45, 2.1], look: [300.95, 1.3, -3.5], fov: 46, roll: 0, e: 'out' },
  { f: 626, pos: [300.62, 1.44, 1.85], look: [300.95, 1.3, -3.5], fov: 45, e: 'lin' },
  { f: 655, pos: [300.65, 1.43, 1.7], look: [300.95, 1.3, -3.5], fov: 44, e: 'lin' },
  { f: 655, cut: true, pos: [199.3, 1.4, 2.7], look: [202.4, 1.0, -3.6], fov: 46 },
  { f: 692, pos: [199.5, 1.35, 1.8], look: [202.5, 1.0, -3.8], fov: 44, e: 'lin' },
  { f: 701, pos: [199.5, 1.35, 1.7], look: [197.0, 1.0, -3], fov: 44, roll: 4, e: 'in' },
  { f: 701, cut: true, pos: [302.7, 1.35, -0.55], look: [303.6, 1.3, -3.4], fov: 44, roll: 4 },
  { f: 710, pos: [302.7, 1.35, -0.6], look: [301.0, 1.25, -3.95], fov: 44, roll: 0, e: 'out' },
  { f: 745, pos: [302.6, 1.33, -0.8], look: [301.0, 1.25, -3.95], fov: 43, e: 'lin' },
  { f: 768, pos: [302.4, 1.3, -1.0], look: [301.15, 1.22, -3.95], fov: 42, e: 'out' },
  { f: 785, pos: [302.35, 1.3, -1.1], look: [301.15, 1.22, -3.95], fov: 41, e: 'lin' },
  { f: 794, pos: [300.6, 1.4, 0.95], look: [302.6, 1.25, -2.0], fov: 48, e: 'out' },
  { f: 845, pos: [300.7, 1.38, 0.7], look: [302.6, 1.25, -2.0], fov: 46, e: 'lin' },
  { f: 853, pos: [301.4, 1.45, 0.0], look: [302.9, 1.4, -1.9], fov: 40, roll: -3, e: 'out' },
  { f: 870, pos: [301.6, 1.45, -0.2], look: [302.9, 1.42, -1.9], fov: 39, roll: -3.5, e: 'lin' },
  { f: 880, pos: [302.85, 1.48, -1.25], look: [303.2, 1.46, -1.9], fov: 28, roll: -2, e: 'out' },
  { f: 885, pos: [302.95, 1.47, -1.38], look: [303.2, 1.46, -1.9], fov: 26, e: 'lin' },
  { f: 885, cut: true, pos: [1000.8, -0.2, -0.95], look: [1000.4, -0.52, -2.4], fov: 40, roll: -2 },
  { f: 902, pos: [1001.2, 0.92, 0.95], look: [1000.4, 0.25, -1.6], fov: 46, roll: 0, e: 'out' },
  { f: 968, pos: [1001.32, 0.95, 1.25], look: [1000.4, 0.25, -1.6], fov: 44, e: 'lin' },
  { f: 980, pos: [999.2, 1.45, 3.7], look: [998.35, 0.5, 1.25], fov: 46, e: 'out' },
  { f: 1036, pos: [999.15, 1.4, 3.45], look: [998.35, 0.5, 1.25], fov: 44, e: 'lin' },
  { f: 1046, pos: [998.6, 0.45, 2.6], look: [998.15, 1.55, 0.6], fov: 46, roll: 2, e: 'out' },
  { f: 1076, pos: [998.62, 0.42, 2.42], look: [998.15, 1.55, 0.6], fov: 44, roll: 3, e: 'lin' },
  { f: 1088, pos: [1000.3, 1.75, 5.4], look: [1000.5, 0.85, 0.6], fov: 48, roll: 0, e: 'out' },
  { f: 1139, pos: [1000.3, 1.7, 5.0], look: [1000.3, 0.85, 0.6], fov: 45, e: 'lin' },
  { f: 1147, pos: [1000.0, 1.1, 3.6], look: [999.65, 0.55, 0.8], fov: 38, e: 'out' },
  { f: 1170, pos: [999.98, 1.08, 3.45], look: [999.65, 0.57, 0.8], fov: 37, e: 'lin' },
  { f: 1178, pos: [1000.2, 1.3, 3.9], look: [1000.1, 1.1, 0.9], fov: 44, e: 'out' },
  { f: 1205, pos: [1000.2, 1.3, 3.75], look: [1000.15, 1.1, 0.9], fov: 43, e: 'lin' },
  { f: 1214, pos: [1000.3, 1.38, 3.4], look: [1000.75, 1.3, 1.0], fov: 44, e: 'out' },
  { f: 1242, pos: [1000.3, 1.38, 3.2], look: [1000.75, 1.3, 1.0], fov: 43, e: 'lin' },
  { f: 1284, pos: [1000.0, 2.1, 5.4], look: [1000.0, 1.65, 0.8], fov: 50, e: 'smooth' },
];
const KICKS = [{ f: 8, a: 0.02 }, { f: 30, a: 0.03 }, { f: 190, a: 0.015 }, { f: 628, a: 0.035 }, { f: 763, a: 0.02 }, { f: 849, a: 0.025 }, { f: 997, a: 0.02 }, { f: 1155, a: 0.03 }, { f: 1172, a: 0.04 }, { f: 1231, a: 0.03 }];
export const camAt = (f) => {
  let i = -1; for (let k = 0; k < K.length; k++) if (K[k].f <= f) i = k;
  let c;
  if (i < 0) c = { ...K[0] }; else if (i === K.length - 1) c = { ...K[i] };
  else { const a = K[i], b = K[i + 1];
    if (b.cut) c = { ...a };
    else { const r = (f - a.f) / (b.f - a.f), t = b.e === 'out' ? easeOut(r) : b.e === 'lin' ? r : b.e === 'in' ? easeIn(r) : smooth(r);
      c = { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) }; } }
  c = { pos: [...c.pos], look: [...c.look], fov: c.fov, roll: c.roll || 0 };
  for (const k of KICKS) { const d = f - k.f; if (d >= 0 && d < 7) { const s = (Math.floor(d) % 2 ? -1 : 1) * k.a * (1 - d / 7); c.look[1] += s * 3; c.look[0] += s * 2; c.roll += s * 20; } }
  if (f >= 404 && f < 440) { const d = docPathHall(f), k = smooth(ramp(f, 404, 412)); c.look = lerp3(c.look, [d[0] + 0.2, 1.3, d[2]], k); }
  c.look[0] += 0.004 * Math.sin(f * 0.05); c.look[1] += 0.003 * Math.sin(f * 0.037 + 1);
  const fl = (a, n = 4) => (f >= a && f < a + n ? (1 - (f - a) / n) * 0.85 : 0);
  c.flash = Math.max(fl(655, 5), flashAt(f) * 0.35, fl(1155, 3) * 0.3);
  c.shadowAt = [...c.look];
  return c;
};
const WHIP = [[2, 9], [229, 238], [336, 352], [541, 548], [553, 561], [572, 588], [692, 709], [785, 793], [1139, 1147], [1170, 1176]];
globalThis.mbAt = (f) => (WHIP.some(([a, b]) => f >= a && f < b) ? 4 : 1);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// ---------------- world state ----------------
const DOC1 = [-0.3, 0, -1.6], DOCB = [0.55, 0, -1.25], PAT = [1.45, -0.11, -1.58], ARM = [1.93, 0.86, -1.53];
const KOL = [299.95, 0, -3.0];
const MAN_L = [1000.0, 0, 0.8], DOC_K = [1001.15, 0, 0.95];
const docPathHall = (f) => {
  if (f < 360) return [100.0, 0, -2.6]; if (f < 392) { const t = smooth(ramp(f, 360, 392)); return [lerp(100.0, 100.4, t), 0, lerp(-2.6, -1.2, t)]; }
  if (f < 440) { const t = smooth(ramp(f, 392, 440)); return [lerp(100.4, 106.95, t), 0, lerp(-1.2, 1.3, t)]; }
  if (f < 472) return [106.95, 0, 1.3]; if (f < 492) { const t = smooth(ramp(f, 472, 492)); return [lerp(106.95, 109.05, t), 0, lerp(1.3, 1.55, t)]; }
  if (f < 563) return [109.05, 0, 1.55]; const t = smooth(ramp(f, 563, 578)); return [lerp(109.05, 109.4, t), 0, lerp(1.55, 2.7, t)]; };
const morgueOpenAt = (f) => (f < 354 ? 0 : f < 362 ? -1.35 * easeOut(ramp(f, 354, 362)) : f < 384 ? -1.35 : -1.35 * (1 - smooth(ramp(f, 384, 398))));
const jarAt = (f) => {
  if (f < 18) return { pos: [DOC1[0] + 0.5, 1.02, DOC1[2] + 0.1], s: 1 };
  if (f < 56) { const t = easeOut(ramp(f, 18, 30)); const p = lerp3([DOC1[0] + 0.5, 1.02, DOC1[2] + 0.1], [0.12, 1.26, -0.22], t); p[1] += 0.01 * Math.sin(f * 0.5); return { pos: p, s: 1, rz: 0.05 * Math.sin(f * 0.3) * t }; }
  if (f < 95) { const t = smooth(ramp(f, 56, 68)); const p = lerp3([0.12, 1.26, -0.22], [DOC1[0] - 0.52, 0.98, DOC1[2] + 0.08], t); p[1] -= 0.45 * Math.sin(t * Math.PI); return { pos: p, s: 1 }; }
  if (f < 344) return { pos: [2.42, 0.89, -1.28], s: 0.85 };
  return null; };
export const worldAt = (f) => {
  const S = shotAt(f), C = camAt(f), W = { loc: S.loc, cam: C };
  if (S.loc === 'clinic') { W.flash = flashAt(f); W.jar = jarAt(f); W.skelKick = f >= 5 && f < 40 ? 0.14 * Math.exp(-(f - 5) * 0.1) * Math.sin((f - 5) * 0.5) : 0;
    if (f >= 186) { const t = easeOut(ramp(f, 186, 192)); W.bowl = lerp3([1.3, 1.05, -1.25], [2.15, 0.58, -1.45], t); } }
  if (S.loc === 'hall') { W.morgueOpen = morgueOpenAt(f); W.wardOpen = f < 500 ? 0 : f < 512 ? 1.1 * easeOut(ramp(f, 500, 512)) : 1.1; W.fg = S.id === 'morgue' ? [102.35, 0, 0.0] : S.id === 'door' || S.id === 'basin' ? [107.15, 0, -1.6] : null; }
  if (S.loc === 'ward') W.wardWarm = true;
  if (S.loc === 'wash') { W.tap = true; W.graph = f < 745 ? 0 : smooth(ramp(f, 748, 772)); W.textFade = f < 855 ? 1 : 1 - smooth(ramp(f, 855, 884)) * 0.92; }
  if (S.loc === 'river') { W.lid = f < 992 ? 0 : 1.9 * easeOut(ramp(f, 992, 1000)); W.kitGlow = f >= 992 && f < 1030 ? Math.sin(ramp(f, 992, 1030) * Math.PI) * 0.9 : 0; W.bellowsTaken = f >= 1036; }
  return W;
};
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f), F = (p, c) => ({ focus: dist(C.pos, p), cinf: c });
  switch (S.id) {
    case 'hook': return f < 22 ? F([DOC1[0], 1.6, DOC1[2]], 12) : F(jarAt(f).pos.map((v, i) => v + (i === 1 ? 0.16 : 0)), 11);
    case 'room': return F([0.1, 1.5, -1.6], lerp(9, 4, ramp(f, 56, 72)));
    case 'fever': return F([1.5, 1.25, -1.55], 13);
    case 'blood': return f < 211 ? F([1.1, 1.3, -1.4], 10) : F([1.5, 1.22, -1.55], 14);
    case 'leech': return F([1.92, 0.98, -1.5], 16);
    case 'thumbs': return f < 302 ? F([1.92, 0.98, -1.5], 16) : F([1.1, 1.35, -1.4], 10);
    case 'morgue': return f < 356 ? F([100.0, 1.55, -2.3], 6) : F([100.3, 1.5, -1.6], 11);
    case 'walk': return F(docPathHall(f).map((v, i) => v + (i === 1 ? 1.5 : 0)), 8);
    case 'basin': return F([107.1, 1.5, 1.35], 9);
    case 'door': return f >= 545 && f < 556 ? F([100, 1.55, -2.35], 4) : F([109.1, 1.5, 1.6], 11);
    case 'koleg': return F([KOL[0], 1.5, KOL[2]], 10);
    case 'ward': return F([203.2, 1.0, -1.6], 7);
    case 'graph': return f < 750 ? F([KOL[0] + 0.1, 1.4, KOL[2]], 10) : F([301.2, 1.2, -3.95], 12);
    case 'docs': return F([302.8, 1.5, -2.1], 6);
    case 'laugh': return F([303.2, 1.47, -1.9], f < 872 ? 9 : 14);
    case 'river': return f < 900 ? F([1000.4, -0.5, -2.4], 6) : F([1000.2, 0.4, -1.4], 10);
    case 'kit': return F([998.4, 0.45, 1.3], 15);
    case 'bellows': return F([998.15, 1.6, 0.6], 12);
    case 'smoke': return f < 1144 ? F([1000.4, 0.6, 0.9], 8) : F([999.6, 0.45, 0.8], 14);
    case 'cough': return F([999.9, 1.3, 0.85], 10);
    default: return F([1000.4, 1.4, 1.1], lerp(11, 5, ramp(f, 1242, 1284)));
  }
};

// ---------------- cast + fx drawing ----------------
const blinkAt = (f, seed) => { const per = 40 + (seed * 17) % 30, ph = (f + seed * 13) % per; return ph < 2 ? 1 : 0; };
const RIM = { clinic: { col: 'rgba(150,180,255,0.75)', side: -1 }, hall: { col: 'rgba(225,235,255,0.8)', side: -1 }, wash: { col: 'rgba(230,248,255,0.9)', side: -1 }, ward: { col: 'rgba(255,225,170,0.85)', side: -1 }, river: { col: 'rgba(230,240,210,0.75)', side: 1 }, riverWarm: { col: 'rgba(255,215,150,0.85)', side: 1 } };
const TINT = { clinic: '#ffe2c4', hall: '#e6edff', ward: '#fff1de', wash: '#ffffff', river: '#eef2e4', riverWarm: '#fff3e2' };
const C = (T, spec, o, pos, extra = {}) => ({ key: JSON.stringify([typeof spec === 'string' ? spec : spec.body, o]), draw: (p) => T.toonChar(p, typeof spec === 'string' ? T.CAST[spec] : spec, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const FXC = (key, draw, P, s, extra = {}) => ({ key, draw, x: P[0], y: P[1] - 1.069 * s, z: P[2], s, blob: false, shadow: false, order: 6, ...extra });
const FXB = (key, draw, P, s, extra = {}) => FXC(key, draw, [P[0] + 50 * PX * s, P[1] - 250 * PX * s, P[2]], s, extra); // fxBurst is centred at design (250,250)
const onCard = (a, cam, dx, dy) => { const s = a.s || 1, yaw = Math.atan2(cam.pos[0] - a.x, cam.pos[2] - a.z), ox = (dx - 300) * PX * s * (a.flip ? -1 : 1); return [a.x + ox * Math.cos(yaw), a.y + (975 - dy) * PX * s, a.z - ox * Math.sin(yaw)]; };
const INK = '#1a1416';
const circ = (g, x, y, r, fill, w = 0) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } if (w) { g.lineWidth = w; g.strokeStyle = INK; g.stroke(); } };
const line = (g, pts, w, col = INK) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.lineWidth = w; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); };
const drop = (g, x, y, r, col = '#8fd0ff') => { g.beginPath(); g.moveTo(x, y - r * 2); g.quadraticCurveTo(x + r * 1.2, y, x, y + r); g.quadraticCurveTo(x - r * 1.2, y, x, y - r * 2); g.fillStyle = col; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); };
const heart = (g, x, y, r, col = '#ff6a8a') => { g.beginPath(); for (let i = 0; i <= 40; i++) { const s = i / 40 * Math.PI * 2, hx = 16 * Math.sin(s) ** 3, hy = -(13 * Math.cos(s) - 5 * Math.cos(2 * s) - 2 * Math.cos(3 * s) - Math.cos(4 * s)); i ? g.lineTo(x + hx * r / 16, y + hy * r / 16) : g.moveTo(x + hx * r / 16, y + hy * r / 16); } g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); };
const patientFx = (stage, f) => (g, H, o) => { const u = H.rx / 100, fx = H.cx + (o.turn || 0) * 26 * u, cy = H.cy;
  if (stage < 1) { for (const s of [-1, 1]) circ(g, fx + s * 58 * u, cy + 26 * u, 18 * u, 'rgba(240,90,90,0.55)'); circ(g, fx, cy + 18 * u, 15 * u, '#e8404a', 5 * u); }
  else circ(g, fx, cy + 18 * u, 11 * u, stage < 2 ? '#e8a0a0' : '#d8d0d8', 4 * u);
  const mx = fx + 18 * u, my = cy + 44 * u; line(g, [[mx, my], [mx + 92 * u, my - 26 * u]], 13 * u); line(g, [[mx, my], [mx + 92 * u, my - 26 * u]], 7 * u, '#f4fbff'); circ(g, mx + 94 * u, my - 27 * u, 8 * u, stage < 1 ? '#e8303a' : '#e88080', 3 * u);
  if (stage < 1) for (let i = 0; i < 3; i++) { const t = ((f * 0.03 + i * 0.33) % 1); drop(g, H.cx + (i - 1) * 70 * u + 20 * u, cy - 70 * u + t * 90 * u, 9 * u); }
  else { g.fillStyle = 'rgba(140,170,150,0.3)'; g.beginPath(); g.ellipse(fx, cy + 30 * u, 70 * u, 30 * u, 0, 0, Math.PI * 2); g.fill(); } };
const PAT_SPEC = (stage) => ({ body: '#e8ecf8', bw: 196, detail: ['nightgown'], hair: '#b07a3a', hairStyle: 'mop', seed: 4, legs: '#e8ecf8', headCol: stage < 1 ? '#fbfaf7' : stage < 2 ? '#e6eee6' : '#dde6ee', headSh: stage < 1 ? '#e6e2dc' : '#c8d4d0' });
const babyFx = (blanket, cooing) => (g) => {
  g.save(); g.beginPath(); g.moveTo(120, 700); g.quadraticCurveTo(300, 640, 480, 700); g.lineTo(520, 990); g.lineTo(80, 990); g.closePath(); g.fillStyle = blanket; g.fill(); g.lineWidth = 9; g.strokeStyle = INK; g.stroke();
  for (let x = 140; x < 480; x += 60) line(g, [[x, 700], [x + 20, 980]], 4, 'rgba(255,255,255,0.35)'); g.restore();
  g.beginPath(); g.ellipse(300, 560, 92, 62, -0.2, 0, Math.PI * 2); g.fillStyle = '#f4e8c8'; g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
  circ(g, 248, 530, 46, '#fbfaf7', 7); line(g, [[228, 528], [240, 532]], 5); line(g, [[256, 532], [268, 528]], 5); circ(g, 248, 552, cooing ? 7 : 4, cooing ? '#5a1e28' : INK);
  circ(g, 228, 545, 9, 'rgba(255,140,150,0.5)'); circ(g, 270, 545, 9, 'rgba(255,140,150,0.5)'); };
const lyingMan = (state, f) => (p) => { const g = p.g, sh = state.shake ? Math.sin(f * 1.7) * 6 : 0;
  g.save(); g.translate(sh, 0);
  const hx = 120, hy = 880; g.beginPath(); g.ellipse(hx, hy, 82, 74, -0.15, 0, Math.PI * 2); g.fillStyle = '#eef2f4'; g.fill(); g.lineWidth = 9; g.strokeStyle = INK; g.stroke();
  g.save(); g.beginPath(); g.ellipse(hx, hy, 82, 74, -0.15, 0, Math.PI * 2); g.clip(); g.fillStyle = '#3a3a30'; g.beginPath(); g.ellipse(hx + 40, hy - 50, 80, 50, 0.3, 0, Math.PI * 2); g.fill(); g.restore();
  g.beginPath(); g.ellipse(hx, hy, 82, 74, -0.15, 0, Math.PI * 2); g.lineWidth = 9; g.strokeStyle = INK; g.stroke();
  for (let k = 0; k < 3; k++) line(g, [[hx + 20 + k * 18, hy - 70], [hx + 30 + k * 18, hy - 100], [hx + 22 + k * 18, hy - 118]], 7, '#4f8a3a');
  if (state.eyes === 'shock') { circ(g, hx - 40, hy - 6, 20, '#ffffff', 5); circ(g, hx - 44, hy - 4, 7, INK); circ(g, hx - 6, hy - 10, 18, '#ffffff', 5); circ(g, hx - 10, hy - 8, 6, INK); line(g, [[hx - 62, hy - 40], [hx - 28, hy - 46]], 7); }
  else { line(g, [[hx - 56, hy - 4], [hx - 30, hy - 8]], 6); line(g, [[hx - 18, hy - 10], [hx + 4, hy - 12]], 6); }
  g.beginPath(); g.ellipse(hx - 40, hy + 34, state.eyes === 'shock' ? 12 : 8, state.eyes === 'shock' ? 14 : 5, 0, 0, Math.PI * 2); g.fillStyle = '#3a1a20'; g.fill();
  g.beginPath(); g.moveTo(170, 975); g.bezierCurveTo(170, 800, 250, 770, 330, 790); g.bezierCurveTo(400, 760, 470, 800, 520, 840); g.bezierCurveTo(570, 870, 590, 940, 590, 975); g.closePath();
  g.fillStyle = '#b8443a'; g.fill(); g.save(); g.clip();
  for (let x = 150; x < 600; x += 46) { g.fillStyle = 'rgba(40,80,50,0.45)'; g.fillRect(x, 760, 16, 220); }
  for (let y = 790; y < 980; y += 46) { g.fillStyle = 'rgba(40,80,50,0.45)'; g.fillRect(150, y, 450, 14); }
  for (let x = 160; x < 600; x += 46) { g.fillStyle = 'rgba(250,220,120,0.5)'; g.fillRect(x + 26, 760, 4, 220); }
  g.restore(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
  g.restore();
  line(g, [[560, 960], [600, 950]], 16); line(g, [[560, 960], [600, 950]], 8, '#6a5a44'); };
const docPump = (T, pump, f, expr, rim) => (p) => {
  T.toonChar(p, 'doctor', { expr, turn: -0.35, look: -0.6, legs: 'crouch', L: { x: 150, y: 560 + pump * 30, b: 0.5 }, R: { x: 250, y: 470 - pump * 50, b: 0.6 }, rim, blink: blinkAt(f, 5), bob: q(-0.015 * pump, 3),
    after: (g) => { const y0 = 540 + pump * 10, sq = 1 - 0.35 * pump; g.save(); g.translate(170, y0); g.scale(1, sq);
      g.beginPath(); g.moveTo(-40, -80); g.lineTo(40, -80); g.lineTo(70, 40); g.lineTo(0, 70); g.lineTo(-70, 40); g.closePath(); g.fillStyle = '#8a4a2a'; g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
      for (let k = 0; k < 4; k++) line(g, [[-58 + k * 4, -24 + k * 18], [58 - k * 4, -24 + k * 18]], 5, '#3a2014'); g.restore();
      const hp = [[170, y0 + 70 * sq], [150, y0 + 130], [60, 760], [0, 940]]; line(g, hp, 16); line(g, hp, 8, '#6a5a44'); } }); };
const tweezHand = (T, carry, f) => (p) => { const g = p.g; line(g, [[640, -40], [470, 260], [330, 470]], 9); circ(g, 330, 470, 14, INK);
  line(g, [[330, 470], [255, 600]], 7, '#c8ccd6'); line(g, [[340, 476], [268, 606]], 7, '#c8ccd6'); line(g, [[330, 470], [262, 604]], 2.5);
  if (carry) { g.save(); g.translate(240, 650); g.scale(0.32, 0.32); g.translate(-300, -560); T.fxLeech(p, { t: f, pose: 'wave' }); g.restore(); } };
const armClose = (T, n, pose, f) => (p) => { const g = p.g;
  g.beginPath(); g.moveTo(20, 820); g.lineTo(150, 810); g.lineTo(150, 960); g.lineTo(20, 975); g.closePath(); g.fillStyle = '#e8ecf8'; g.fill(); g.lineWidth = 9; g.strokeStyle = INK; g.stroke();
  for (let y = 840; y < 960; y += 40) line(g, [[30, y], [140, y - 4]], 4, 'rgba(120,140,190,0.5)');
  g.beginPath(); g.moveTo(150, 830); g.bezierCurveTo(300, 820, 450, 840, 540, 862); g.bezierCurveTo(600, 880, 600, 930, 540, 940); g.bezierCurveTo(430, 955, 300, 950, 150, 945); g.closePath(); g.fillStyle = '#fbfaf7'; g.fill();
  g.save(); g.clip(); g.fillStyle = '#e6e2dc'; g.fillRect(140, 915, 480, 60); g.restore(); g.lineWidth = 9; g.strokeStyle = INK; g.stroke();
  const X = [230, 340, 450]; for (let i = 0; i < n; i++) { g.save(); g.translate(X[i], 830); g.scale(0.36, 0.36); g.rotate(Math.sin(f * 0.2 + i) * 0.1); g.translate(-300, -560 - 150); T.fxLeech(p, { t: f + i * 7, pose: pose[i], look: Math.sin(f * 0.1 + i) * 0.5 }); g.restore(); } };
const steam = (t) => (p) => { const g = p.g; for (let i = 0; i < 5; i++) { const k = (t + i / 5) % 1, x = 300 + Math.sin(k * 6 + i) * 60, y = 760 - k * 520, r = 40 + k * 90; g.fillStyle = `rgba(245,245,250,${(0.55 * Math.sin(k * Math.PI)).toFixed(3)})`; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); } };
const smokePuff = (t, col = '235,235,240') => (p) => { const g = p.g; for (let i = 0; i < 6; i++) { const a = i * 1.05, d = 40 + t * 160, r = (50 + 20 * (i % 2)) * (0.6 + t); g.fillStyle = `rgba(${col},${(0.85 * (1 - t)).toFixed(3)})`; g.beginPath(); g.arc(300 + Math.cos(a) * d, 500 + Math.sin(a) * d * 0.6 - t * 120, r, 0, Math.PI * 2); g.fill(); g.lineWidth = 4; g.strokeStyle = `rgba(90,90,100,${(0.5 * (1 - t)).toFixed(3)})`; g.stroke(); } };
const fountain = (t) => (p) => { const g = p.g; line(g, [[300, 700], [330, 540], [430, 400]], 26, 'rgba(170,220,240,0.9)'); for (let i = 0; i < 14; i++) { const k = (t + i / 14) % 1, x = 330 + k * 240 * (i % 2 ? 1 : 0.8), y = 520 - Math.sin(k * Math.PI) * 300 * (0.8 + 0.2 * (i % 3)) + k * 200; drop(g, x, y, 14 - k * 6, '#a8dcf0'); } };
const bird = (ph, col) => (p) => { const g = p.g, w = Math.sin(ph) * 60; line(g, [[160, 500 + w], [240, 470], [300, 500], [360, 470], [440, 500 + w]], 16, col); };
const hatFly = (rot) => (p) => { const g = p.g; g.save(); g.translate(300, 500); g.rotate(rot); g.beginPath(); g.rect(-70, -150, 140, 150); g.fillStyle = '#3a2a22'; g.fill(); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(); g.fillStyle = '#7a2a2a'; g.fillRect(-70, -40, 140, 26); g.beginPath(); g.ellipse(0, 0, 130, 20, 0, 0, Math.PI * 2); g.fillStyle = '#3a2a22'; g.fill(); g.stroke(); g.restore(); };
const blanketFly = (t) => (p) => { const g = p.g; g.save(); g.translate(300, 500); g.rotate(t * 2.5); g.beginPath(); g.moveTo(-200, -60); g.quadraticCurveTo(0, -140, 200, -60); g.lineTo(220, 80); g.quadraticCurveTo(0, 20, -220, 80); g.closePath(); g.fillStyle = '#b8443a'; g.fill(); g.save(); g.clip(); for (let x = -220; x < 220; x += 46) { g.fillStyle = 'rgba(40,80,50,0.45)'; g.fillRect(x, -150, 16, 300); } g.restore(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke(); g.restore(); };
const ding = (t) => (p) => { const g = p.g; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r0 = 60 + t * 80, r1 = r0 + 60 + 140 * (1 - t); line(g, [[300 + Math.cos(a) * r0, 500 + Math.sin(a) * r0], [300 + Math.cos(a) * r1, 500 + Math.sin(a) * r1]], 14 * (1 - t) + 3, `rgba(255,236,150,${(1 - t).toFixed(3)})`); } };
const heartPop = (t) => (p) => heart(p.g, 300, 500 - t * 160, 50 + t * 30, `rgba(255,110,140,${(1 - t * 0.8).toFixed(3)})`);
const chalkDust = (t) => (p) => { const g = p.g; for (let i = 0; i < 12; i++) { const a = i * 0.52, d = 30 + t * 220; g.fillStyle = `rgba(250,250,240,${(0.8 * (1 - t)).toFixed(3)})`; g.beginPath(); g.arc(300 + Math.cos(a) * d, 500 + Math.sin(a) * d, 14 + 30 * t, 0, Math.PI * 2); g.fill(); } };
const coo = (t) => (p) => { const g = p.g; for (let i = 0; i < 2; i++) { const k = (t + i * 0.5) % 1; heart(g, 300 + i * 80 + Math.sin(k * 6) * 20, 600 - k * 300, 30, `rgba(255,170,190,${Math.sin(k * Math.PI).toFixed(3)})`); } };

export const actorsAt = (f, T) => {
  const S = shotAt(f), cam = camAt(f), out = [], loc = S.loc, lk = S.light === 'riverWarm' ? 'riverWarm' : loc, rim = RIM[lk] || RIM.clinic, tint = TINT[lk];
  const push = (a) => { a.tint = a.tint || tint; out.push(a); return a; };
  const doc = (o, pos, extra = {}) => push(C(T, 'doctor', { blink: blinkAt(f, 5), rim, ...o }, pos, extra));
  if (loc === 'clinic') {
    const stage = f < 205 ? 0 : f < 250 ? 1 : 2;
    if (S.id === 'hook' || S.id === 'room') {
      const back = f < 6, turn = f < 6 ? 0 : f < 9 ? -0.7 * (1 - (f - 6) / 3) : 0;
      const thrust = f >= 18 && f < 56 ? easeOut(ramp(f, 18, 28)) : 0, hatUp = S.id === 'room' && f > 70 && f < 92;
      const hatTilt = hatUp ? q(-10 + 14 * smooth(ramp(f, 72, 86)), 1) : 0;
      doc({ back, turn: q(turn, 2), expr: back ? 'neutral' : f < 14 ? 'shock' : 'sly', look: back ? 0 : 0.2, rim: f < 14 ? { col: 'rgba(170,200,255,0.95)', side: -1, w: 40 } : rim,
        L: S.id === 'room' && f > 60 ? 'reach' : 'hang', R: back ? 'hang' : thrust > 0 ? { x: q(470 + 60 * thrust), y: q(470 - 40 * thrust), b: 0.4 } : hatUp ? { x: 400, y: 150, b: 0.9 } : 'hip', hat: { type: 'top', color: '#1c1a22', band: '#4a2a30', tilt: hatTilt },
        tilt: q(f < 14 ? 0 : 2 * Math.sin(f * 0.15), 1), headTilt: q(thrust * 4, 1) }, DOC1, { order: 2 });
    } else if (S.id === 'fever' || S.id === 'blood') {
      let o = { expr: 'smug', turn: 0.45, look: 0.6, L: 'hip', R: 'chin' };
      if (f >= 168 && f < 186) o = { expr: 'proud', turn: 0.3, look: 0.4, L: 'hip', R: 'up', headTilt: -6 };
      if (f >= 186 && f < 194) o = { expr: 'sly', turn: 0.5, look: 0.8, L: 'hip', R: { x: 520, y: 600, b: 0.4 } };
      if (f >= 194) o = { expr: 'sly', turn: 0.4, look: 0.7, L: 'hip', R: 'thumb', tilt: q(2 * Math.sin(f * 0.2), 1) };
      doc(o, DOCB);
    } else if (S.id === 'thumbs' && f > 296) {
      doc({ expr: 'proud', turn: 0.2, look: 0.3, L: 'hip', R: { x: 470, y: 120, b: 0.4 }, headTilt: -10 }, DOCB);
    } else if (S.id === 'leech') {
      const trips = [[235, 246], [248, 259], [261, 272]], armA = { x: ARM[0], y: ARM[1], z: ARM[2], s: 0.5 }, X = [230, 340, 450], src = [2.42, 1.15, -1.28];
      let P = null, carry = false;
      for (let i = 0; i < 3; i++) { const [a, b] = trips[i]; if (f >= a && f < b) { const t = smooth(ramp(f, a, b)), tgt = onCard(armA, cam, X[i], 840);
        P = t < 0.7 ? lerp3(src, tgt, smooth(t / 0.7)) : tgt; P = [P[0], P[1] + Math.sin(t * Math.PI) * 0.12, P[2]]; carry = t < 0.85; } }
      if (!P) P = lerp3(src, onCard(armA, cam, 400, 820), 0.6);
      push(FXC('tw' + (carry ? 1 : 0) + (f % 8), tweezHand(T, carry, f), [P[0] + 0.06, P[1] + 0.15, P[2]], 0.42, { order: 7 }));
    }
    const shiver = stage === 0 ? Math.sin(f * 2.1) * 0.012 : 0, sway = stage > 0 ? Math.sin(f * 0.12) * (stage === 2 ? 5 : 3) : 0;
    let po = { expr: stage === 0 ? (f % 6 < 3 ? 'scared' : 'worried') : 'dizzy', spin: q(f * 0.3, 1), legs: 'sit', turn: -0.2, L: 'belly', R: stage === 0 ? 'cross' : { x: 520, y: 690, b: 0.8 }, tilt: q(sway, 1), seed: 4 };
    if (S.id === 'blood' && f < 205) po = { ...po, expr: f < 190 ? 'worried' : 'shock', R: { x: 520, y: 690, b: 0.8 } };
    if (S.id === 'leech' || (S.id === 'thumbs' && f < 302)) po = { ...po, expr: f % 30 < 15 ? 'scared' : 'worried', hideR: true };
    const spec = PAT_SPEC(stage), fq = Math.floor(f / 3) * 3;
    push({ ...C(T, spec, { ...po, faceFx: patientFx(stage, fq) }, [PAT[0] + shiver, PAT[1], PAT[2]]), key: JSON.stringify(['pat', stage, po, fq]), blob: false, order: 2 });
    if (stage === 0) push(FXC('steam' + (Math.floor(f / 2) % 30), steam(((f / 2) % 30) / 30), [PAT[0] + 0.02, 1.95, PAT[2] + 0.05], 0.42));
    if (stage >= 1 && S.id !== 'leech') push(FXC('stars' + (f % 30), (p) => T.fxStars(p, (f % 30) / 30), [PAT[0] + 0.07, 1.6, PAT[2] + 0.1], 0.35));
    if (S.id === 'leech' || S.id === 'thumbs') {
      const n = S.id === 'leech' ? (f >= 272 ? 3 : f >= 259 ? 2 : f >= 246 ? 1 : 0) : 3, pose = S.id === 'thumbs' ? ['thumb', 'thumb', 'thumb'] : ['kiss', 'stick', 'kiss'];
      push({ key: 'arm' + n + pose.join() + (f % 10), draw: armClose(T, n, pose, f), x: ARM[0], y: ARM[1], z: ARM[2], s: 0.5, blob: false, order: 3 });
      for (const hb of [246, 259, 272]) if (f >= hb && f < hb + 14) push(FXC('hp' + (f - hb), heartPop((f - hb) / 14), [ARM[0] + 0.05, 1.08, ARM[2] + 0.05], 0.12));
    }
    const J = jarAt(f); if (J && f < 95) { const lw = f < 22 ? 'stick' : 'wave'; push(FXC('lj' + lw + (f % 12), (p) => T.fxLeech(p, { t: f, pose: lw, look: Math.sin(f * 0.2) * 0.4 }), [J.pos[0], J.pos[1] + 0.15, J.pos[2] + 0.07], 0.2, { order: 5 })); }
  }
  if (loc === 'hall') {
    const d = docPathHall(f), walking = (f >= 362 && f < 438) || (f >= 472 && f < 492) || f >= 563, step = q((f % 16) / 16);
    let o = { expr: 'smug', turn: 0.4, look: 0.5, legs: walking ? 'walk' : 'stand', step, bob: walking ? q(Math.abs(Math.sin(f / 16 * Math.PI * 2)) * 0.02, 3) : 0, L: 'hang', R: 'hang' };
    if (f < 392) { const w = Math.sin(f * 0.6); o = { ...o, expr: 'smug', turn: 0.1, L: { x: q(240 + 30 * w), y: 600, b: 0.6 }, R: { x: q(360 - 30 * w), y: 610, b: 0.6 } }; }
    if (S.id === 'basin') { if (f < 472) o = { ...o, turn: -0.5, look: -0.9, expr: f >= 446 && f < 456 && (f % 4 < 2) ? 'sleep' : f < 458 ? 'neutral' : 'smug', headTilt: f >= 458 ? -12 : 0, L: f >= 458 ? 'hip' : 'hang', R: f >= 458 ? 'hip' : 'hang' };
      else o = { ...o, turn: 0.6, look: 0.6, headTilt: -12 }; }
    if (S.id === 'door') { if (f < 548) o = { ...o, expr: 'smug', turn: 0.3, look: -0.3, legs: 'stand', bob: 0, L: 'hip', R: 'hip' };
      else if (f < 563) o = { ...o, expr: 'sly', turn: 0.2, legs: 'stand', bob: 0, L: { x: 70, y: 330, b: -0.4 }, R: { x: 530, y: 330, b: -0.4 }, headTilt: q(8 * Math.sin(ramp(f, 548, 562) * Math.PI), 1) };
      else o = { ...o, expr: 'smug', turn: 0.8, look: 0.8 }; }
    doc(o, d, { order: 2 });
    const nurseRun = (x0, x1, z, a, b, seed) => { if (f < a || f > b) return; const t = ramp(f, a, b); push(C(T, 'nurse', { expr: 'worried', legs: 'walk', step: q(((f + seed) % 12) / 12), turn: 0.6, L: 'forward', R: 'forward', rim, bob: q(Math.abs(Math.sin((f + seed) / 12 * Math.PI * 2)) * 0.025, 3) }, [lerp(x0, x1, t), 0, z], { flip: x1 < x0, s: 0.95 })); };
    nurseRun(96, 104, -0.6, 344, 372, 0); nurseRun(113, 101, 1.6, 398, 440, 5); nurseRun(104, 112, 0.4, 470, 520, 3);
    if (f >= 498) { const mw = smooth(ramp(f, 498, 510)); push(C(T, 'nurse', { expr: f >= 552 ? 'scared' : f >= 540 ? 'worried' : 'neutral', turn: -0.4, look: f >= 552 ? -0.5 : -0.8, L: f >= 552 ? { x: 230, y: 330, b: 1.2 } : 'cross', R: f >= 552 ? { x: 370, y: 330, b: 1.2 } : 'hip', rim, blink: blinkAt(f, 9) }, [109.85, 0, lerp(2.9, 2.15, mw)], { s: 0.96 })); }
  }
  if (loc === 'wash') {
    const KO = (o) => push(C(T, 'koleg', { rim, blink: blinkAt(f, 8), faceFx: o.noGlasses ? null : T.glassesFx, ...o }, KOL, { order: 2 }));
    if (S.id === 'koleg') { const slap = f >= 624 && f < 640; KO({ expr: f < 624 ? 'determined' : 'angry', turn: 0.35, look: 0.6, L: 'hip', R: slap ? { x: 560, y: 300, b: 0.3 } : f >= 596 ? 'point' : { x: 430, y: 420, b: 0.8 }, holdR: slap ? null : 'chalk', tilt: q(slap ? 4 : 0, 1) });
      if (f >= 628 && f < 644) push(FXC('cd' + (f - 628), chalkDust((f - 628) / 16), [300.95, 1.5, -3.85], 0.32)); }
    if (S.id === 'graph') { const proud = f >= 772; KO({ expr: proud ? 'proud' : f < 730 ? 'happy' : 'determined', turn: 0.35, look: 0.6, headTilt: q(f < 730 ? 5 * Math.sin(f * 0.35) : 0, 1), L: 'hip', R: proud ? { x: 420, y: 300, b: 1.2 } : 'point' });
      if (f >= 770 && f < 786) push(FXB('gb' + (f - 770), (p) => T.fxBurst(p, (f - 770) / 16, '#fff0b0', 10, 30, 180), [302.0, 0.95, -3.85], 0.35)); }
    if (S.id === 'docs' || S.id === 'laugh') {
      const laugh = S.id === 'laugh', L = (seed) => laugh ? { expr: 'laugh', L: 'belly', R: 'belly', bob: q(Math.abs(Math.sin(f * 0.6 + seed)) * 0.03, 3), tilt: q(6 * Math.sin(f * 0.45 + seed), 1), headTilt: q(-8 + 4 * Math.sin(f * 0.7 + seed), 1) } : { expr: 'smug', L: 'cross', R: 'cross', headTilt: -6 };
      const hatOff = laugh && f >= 856;
      push(C(T, 'docA', { rim, ...L(0), turn: -0.3, blink: blinkAt(f, 2) }, [302.3, 0, -2.4]));
      push(C(T, 'docB', { rim, ...L(1.3), turn: -0.2, blink: blinkAt(f, 3), hat: hatOff ? null : T.CAST.docB.hat }, [303.2, 0, -1.9]));
      push(C(T, 'docC', { rim, ...L(2.1), turn: -0.4, blink: blinkAt(f, 4) }, [304.05, 0, -2.6]));
      doc({ ...L(0.7), turn: -0.3 }, [304.6, 0, -1.6], { s: 0.97 });
      if (hatOff) { const t = ramp(f, 856, 884), hp = [303.2 + t * 0.5, 2.35 + Math.sin(t * Math.PI) * 0.5 - t * t * 1.6, -1.85]; push(FXC('hat' + q(t * 6, 1), hatFly(t * 6), hp, 0.3)); }
      KO({ expr: laugh ? 'sad' : 'worried', turn: 0.5, look: 0.8, L: 'hang', R: laugh && f >= 860 ? { x: 470, y: 520, b: 0.8 } : laugh ? { x: 420, y: 290, b: 1.2 } : 'hang', holdR: laugh && f >= 860 ? 'glasses' : null, noGlasses: laugh && f >= 860, headTilt: laugh ? 8 : 0 });
    }
  }
  if (loc === 'ward') {
    const blank = ['#9ab4d4', '#d4b4c4', '#b4ccb0', '#d8ccaa']; let i = 0;
    for (const z of [1.2, -1.6, -4.4, -7.2, -10.0]) for (const sx of [-1, 1]) { const spec = { ...T.CAST.mother, body: ['#f2e8f0', '#e8f0f4', '#f4f0e0', '#eae4f4'][i % 4], hair: ['#6a3a22', '#3a2a22', '#a8743a', '#2a2228'][i % 4], seed: 13 + i };
      const cooing = (f + i * 9) % 40 < 20, tl = q(2 * Math.sin(f * 0.05 + i), 1);
      push({ ...C(T, spec, { expr: i % 3 === 0 ? 'sleep' : 'happy', turn: -sx * 0.3, L: { x: 250, y: 560, b: 0.6 }, R: { x: 350, y: 580, b: 0.6 }, legs: 'sit', rim: RIM.ward, tilt: tl, after: babyFx(blank[i % 4], cooing) }, [200 + sx * 3.25, 0.0, z]), key: 'mom' + i + cooing + tl, blob: false, s: 0.92 });
      if (i < 4) push(FXC('coo' + i + (Math.floor(f / 2) % 20), coo(((f / 2 + i * 5) % 20) / 20), [200 + sx * 3.1, 1.7, z + 0.1], 0.25)); i++; }
    const t = ramp(f, 655, 700); push(C(T, 'nurse', { expr: 'happy', legs: 'walk', step: q((f % 14) / 14), turn: 0.2, L: 'forward', R: 'forward', rim: RIM.ward, bob: q(Math.abs(Math.sin(f / 14 * Math.PI * 2)) * 0.02, 3) }, [200.6, 0, lerp(-5.5, -3.8, t)], { s: 0.95 }));
  }
  if (loc === 'river') {
    const R5 = rim, B2 = { hat: { type: 'flatcap', color: '#5a4a3a', stripes: '#7a6a5a' }, body: '#5a6a4a', seed: 15 };
    if (S.id === 'river') {
      const pull = smooth(ramp(f, 892, 925)), bob = Math.sin(f * 0.1) * 0.04;
      push(C(T, 'boatman', { expr: 'determined', turn: 0.4, look: 0.6, L: { x: 430, y: q(470 - pull * 80), b: 0.4 }, R: { x: 520, y: q(470 - pull * 80), b: 0.4 }, rim: R5, blink: blinkAt(f, 12), tilt: q(-6 * pull, 1) }, [999.5, -0.25 + bob, -1.6], { blob: false }));
      push(C(T, { ...T.CAST.boatman, ...B2 }, { expr: 'worried', turn: -0.4, look: -0.6, L: { x: 90, y: q(480 - pull * 80), b: 0.4 }, R: { x: 170, y: q(470 - pull * 80), b: 0.4 }, rim: R5, blink: blinkAt(f, 14) }, [1001.0, -0.25 + bob, -1.75], { blob: false }));
      const my = lerp(-1.45, -0.35, pull);
      push({ ...C(T, 'drowned', { expr: f < 925 ? 'sleep' : 'goofy', turn: 0.1, L: 'up', R: 'up', headCol: '#e6f0f4', rim: R5, tilt: q(8 * Math.sin(f * 0.15), 1), after: (g) => { for (let k = 0; k < 4; k++) drop(g, 200 + k * 60, 160 + ((f * 7 + k * 40) % 120), 10); } }, [1000.2, my, -1.25], { blob: false, order: 3 }), key: 'dr' + f });
      if (f >= 912 && f < 960) push(FXC('ft' + (f % 12), fountain(((f - 912) % 12) / 12), [1000.35, my + 1.35, -1.2], 0.45, { order: 6 }));
      if (f < 905) push(FXC('spl' + (f - 885), (p) => T.fxSplash(p, ramp(f, 885, 905)), [1000.3, -0.75, -1.4], 0.9));
    }
    if (S.id === 'kit' || S.id === 'bellows') {
      const lift = S.id === 'bellows' ? easeOut(ramp(f, 1036, 1048)) : 0;
      const o = S.id === 'kit' ? { expr: f < 992 ? 'sly' : 'goofy', turn: 0.3, look: 0.4, L: { x: 200, y: 600, b: 0.6 }, R: { x: 430, y: 640, b: 0.6 }, headTilt: 6 }
        : { expr: 'proud', turn: 0.2, look: 0.3, L: { x: 80, y: q(300 - 120 * lift), b: 0.6 }, R: { x: q(420 + 30 * lift), y: q(220 - 130 * lift), b: 0.6 }, holdR: 'bellows', headTilt: -8, tilt: q(2 * Math.sin(f * 0.2), 1) };
      doc(o, S.id === 'kit' ? [998.1, 0, 0.55] : [998.15, 0, 0.6]);
      if (S.id === 'kit' && f >= 992 && f < 1012) push(FXC('ding' + (f - 992), ding((f - 992) / 20), [998.35, 0.75, 1.32], 0.55, { order: 7 }));
      if (S.id === 'bellows' && f >= 1040 && f < 1058) push(FXB('bb' + (f - 1040), (p) => T.fxBurst(p, (f - 1040) / 18, '#fff3b0', 12, 40, 220), [998.6, 2.2, 0.7], 0.55));
      push(C(T, 'lady', { expr: 'worried', turn: 0.3, look: 0.4, L: 'cross', R: 'cross', rim: R5, blink: blinkAt(f, 14) }, [999.6, 0, -0.1], { s: 0.95 }));
      push(C(T, 'drowned', { expr: 'sleep', legs: 'sit', turn: 0.2, L: 'hang', R: 'hang', headCol: '#e6f0f4', rim: R5, tilt: -10 }, [1000.4, -0.1, -0.1], { s: 0.95 }));
    }
    if (S.id === 'smoke' || S.id === 'cough' || S.id === 'final') {
      const cough = S.id !== 'smoke', shockK = f >= 1150, mouthHands = { L: { x: 270, y: 340, b: 1.2 }, R: { x: 330, y: 340, b: 1.2 } };
      const faint = S.id === 'final' ? smooth(ramp(f, 1220, 1230)) : 0;
      push(C(T, 'lady', { expr: faint > 0.5 ? 'dizzy' : shockK ? 'shock' : 'worried', spin: faint > 0.5 ? q(f * 0.3, 1) : 0, turn: -0.2, ...(shockK || cough ? mouthHands : { L: 'cross', R: 'cross' }), rim: R5, blink: 0, tilt: q(-85 * faint, 1) }, [1001.4, 0, 0.25], { s: 0.95, order: 2 }));
      push(C(T, 'boatman', { expr: shockK ? 'shock' : 'worried', turn: 0.3, ...(shockK ? mouthHands : { L: 'hip', R: 'hip' }), rim: R5, blink: blinkAt(f, 12) }, [998.3, 0, 0.1], { s: 0.97 }));
      push(C(T, { ...T.CAST.boatman, ...B2 }, { expr: shockK ? 'scared' : 'neutral', turn: -0.3, ...(shockK ? mouthHands : { L: 'hang', R: 'hang' }), rim: R5, blink: blinkAt(f, 15) }, [1002.2, 0, -0.05], { s: 0.97 }));
      push(C(T, 'worker', { expr: shockK ? 'shock' : 'goofy', turn: 0.1, ...(shockK ? mouthHands : { L: 'hang', R: 'cross' }), rim: R5, blink: blinkAt(f, 16) }, [997.6, 0, -0.1], { s: 0.92 }));
      if (S.id === 'final' && f >= 1229 && f < 1240) push(FXB('thud' + (f - 1229), (p) => T.fxBurst(p, (f - 1229) / 11, '#f4ecd8', 8, 30, 160), [1002.1, 0.25, 0.3], 0.5));
      if (S.id === 'smoke') {
        const pump = Math.max(0, Math.sin(ramp(f, 1080, 1138) * Math.PI * 8)) * (f < 1140 ? 1 : 0), eyes = f >= 1150 ? 'shock' : 'closed';
        push({ key: 'ly' + eyes + (f >= 1150 ? f % 4 : 0), draw: lyingMan({ eyes, shake: f >= 1150 }, f), x: MAN_L[0], y: 0, z: MAN_L[2], s: 1.45, order: 2, blob: false });
        push({ key: 'dp' + q(pump, 1) + (f >= 1150 ? 's' : '') + blinkAt(f, 5), draw: docPump(T, q(pump, 1), f, f >= 1150 ? 'proud' : 'determined', rim), x: DOC_K[0], y: 0, z: DOC_K[2], s: 1, order: 2 });
        for (const [a, dx, dy] of [[1153, -0.05, 0.05], [1157, -0.35, 0.12], [1161, 0.12, 0.2]]) if (f >= a && f < a + 16) { const t = (f - a) / 16; push(FXC('pf' + a + (f - a), smokePuff(t), [MAN_L[0] - 0.72 + dx, 0.55 + dy + t * 0.3, MAN_L[2] + 0.05], 0.3)); }
        for (const [a, dx] of [[1155, -0.1], [1159, -0.4], [1163, 0.05]]) if (f >= a) { const t = Math.min(1, (f - a) / 22); push(FXC('rg' + a + q(t, 2), (p) => T.fxSmokeRing(p, t), [MAN_L[0] - 0.75 + dx - t * 0.1, 0.7 + t * 0.7, MAN_L[2] + 0.08], 0.3)); }
      } else {
        const up = easeOut(ramp(f, 1170, 1178));
        push(C(T, 'drowned', { expr: f % 20 < 10 ? 'cough' : 'shock', turn: 0.2, L: 'up', R: f < 1205 ? 'up' : 'belly', headCol: '#eef4f4', rim: R5, tilt: q(6 * Math.sin(f * 0.6), 1), blink: 0 }, [999.9, lerp(-1.2, 0, up), 0.85], { order: 2 }));
        if (f < 1200) { const t = ramp(f, 1170, 1200); push(FXC('bf' + q(t, 2), blanketFly(t), [1000.1 + t * 0.8, 0.6 + Math.sin(t * Math.PI) * 1.4, 0.85], 0.6)); }
        for (const a of [1174, 1184, 1194, 1208]) if (f >= a && f < a + 14) push(FXC('cp' + a + (f - a), smokePuff((f - a) / 14), [1000.05, 1.6, 0.9], 0.3));
        const o = S.id === 'cough' ? { expr: 'proud', turn: -0.3, look: -0.7, L: 'hip', R: 'hip' }
          : f < 1236 ? { expr: 'sly', turn: 0, look: 0, L: 'hip', R: 'thumb', headTilt: -4 } : { expr: 'proud', turn: 0, look: 0, L: 'hip', R: { x: 520, y: 260, b: 0.6 }, holdR: 'hat', hat: null, headTilt: q(-8 * Math.sin(ramp(f, 1236, 1252) * Math.PI), 1), tilt: q(4 * Math.sin(ramp(f, 1236, 1252) * Math.PI), 1) };
        doc({ ...o, rim: RIM.riverWarm }, [1000.9, 0, 1.15], { order: 3 });
        if (f >= 1214 && f < 1230) push(FXB('ts' + (f - 1214), (p) => T.fxBurst(p, (f - 1214) / 16, '#fff3b0', 10, 30, 170), [1001.4, 1.4, 1.2], 0.35));
        if (f >= 1240) { const t = ramp(f, 1240, 1284); push(FXC('heart' + q(t, 2), (p) => T.fxSmokeRing(p, t * 0.8, true), [1000.0 + t * 0.2, 2.1 + t * 0.9, 1.0], 0.55, { order: 8 })); }
      }
    }
  }
  return out;
};
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (S.loc === 'river') for (let i = 0; i < 5; i++) { const t = ((f * 0.0025 + i * 0.21) % 1), x = 960 + t * 90, y = 6 + i * 1.3 + Math.sin(f * 0.03 + i) * 0.6, z = -18 - i * 5; out.push(FX('bird' + i + ((f + i * 3) % 8), bird(((f + i * 3) % 8) / 8 * Math.PI * 2, i % 2 ? '#2a2a30' : '#4a4a50'), [x, y, z], 1.4 + i * 0.2)); }
  return out;
};
