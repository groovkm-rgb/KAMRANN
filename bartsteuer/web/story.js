// story.js: "Bartsteuer" (46.4 s voice + 0.5 s tail). Phrase times hand-checked against voice.mp3 (silence gaps + energy dips):
//  0.00-1.32 Ein Zar steht auf einem Fest. | 1.65-3.17 In der Hand: ein Rasiermesser. | 3.50-5.63 Vor ihm: die mächtigsten Männer des Landes.
//  5.77-7.04 Mit riesigen Bärten. | 7.34-8.73 Und dann rasiert er sie. ("rasiert" starts 7.97) | 9.03-10.05 Einen nach dem anderen. | 10.10-11.01 Höchstpersönlich.
// 11.34-13.75 Der Zar kommt gerade ... zurück. | 14.14-15.90 Und da sind Bärte total out. | 15.95-17.86 Aber für viele hier ist der Bart heilig.
// 18.05-19.59 Also macht der Zar einen Deal: | 19.88-21.43 Du willst deinen Bart behalten? | 21.66-22.31 Kein Problem. | 22.57-23.45 Dann zahl.
// 23.50-24.35 Eine Bartsteuer. | 24.63-25.51 Je reicher du bist, | 25.65-26.93 desto teurer wird dein Bart. | 27.09-28.90 Wer zahlt, kriegt eine kleine Marke,
// 28.95-30.26 die er immer dabeihaben muss. | 30.74-31.80 Auf einer steht sogar: | 32.14-34.04 „Der Bart ist eine überflüssige Last.“
// 34.20-35.77 Und wer ohne Marke erwischt wird? | 36.17-36.86 Wird rasiert. | 36.99-38.11 Mitten auf der Straße.
// 38.49-42.13 Und manche alten Männer ... aufgehoben haben. | 42.49-43.32 Für ihren Sarg. | 43.62-46.18 Damit sie im Himmel nicht ohne Bart ankommen.
import { OFF } from './scene.js';
import { TSAR, NOBLES, OFFICIAL, GUARD, PEASANT, OLDMAN, RICH, GENT, VENDOR } from './chars.js';

export const FPS = 30, TOTAL = 1408;
export const SHOTS = [
  { id: 's1', a: 0, b: 43, set: 'palace' }, { id: 's2', a: 44, b: 99, set: 'palace' }, { id: 's3a', a: 100, b: 170, set: 'palace' }, { id: 's3b', a: 171, b: 215, set: 'palace' },
  { id: 's4', a: 216, b: 265, set: 'palace' }, { id: 's5', a: 266, b: 334, set: 'palace' }, { id: 's7', a: 335, b: 417, set: 'map' }, { id: 's8', a: 418, b: 477, set: 'europe' },
  { id: 's9', a: 478, b: 537, set: 'palace' }, { id: 's10', a: 538, b: 591, set: 'study' }, { id: 's11', a: 592, b: 672, set: 'study' }, { id: 's12', a: 673, b: 703, set: 'study' },
  { id: 's13', a: 704, b: 734, set: 'study' }, { id: 's14', a: 735, b: 809, set: 'mint' }, { id: 's15a', a: 810, b: 867, set: 'mint' }, { id: 's15b', a: 868, b: 914, set: 'mint' },
  { id: 's16a', a: 915, b: 958, set: 'mint' }, { id: 's16b', a: 959, b: 1023, set: 'mint' }, { id: 's17', a: 1024, b: 1078, set: 'snow' }, { id: 's18', a: 1079, b: 1148, set: 'snow' },
  { id: 's19', a: 1149, b: 1268, set: 'house' }, { id: 's20', a: 1269, b: 1303, set: 'house' }, { id: 's21a', a: 1304, b: 1341, set: 'house' }, { id: 's21b', a: 1342, b: 1407, set: 'heaven' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b + 0.999) || SHOTS[SHOTS.length - 1];
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const easeOut = (t) => 1 - (1 - clamp(t)) ** 3.2;
const lerp = (a, b, t) => a + (b - a) * t, lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t)), ramp = (f, a, b) => clamp((f - a) / (b - a));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const W_ = (set, p) => [p[0] + OFF[set][0], p[1], p[2]];
const back = (t) => { t = clamp(t) - 1; return t * t * (2.7 * t + 1.7) + 1; };

// ---------------------------------------------------------------- lights
const L0 = { az: 120, el: 50, sky: '#c4d6f2', ground: '#7a7088', hemi: 1.2, sun: '#fff1dc', sunI: 2.5, fog: '#c6daf2', fogNear: 60, fogFar: 700, skyTop: '#3d7fd6', skyHor: '#c8ddf4', sat: 1.2,
  waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#effaff', vig: 0.25, shadowExt: 10, ink: 1.5 };
export const LIGHTS = {
  palace: { ...L0, az: 70, el: 58, sky: '#ffcf9a', ground: '#5a2420', hemi: 1.15, sun: '#ffd49a', sunI: 1.9, fog: '#3a1a12', fogNear: 10, fogFar: 46, skyTop: '#1a1030', skyHor: '#3a2040', sat: 1.22, gain: '#fff0d8', lift: '#0c0406', vig: 0.34, shadowExt: 9, ink: 1.4 },
  map: { ...L0, az: 40, el: 55, sky: '#ffd8a0', ground: '#4a2a18', hemi: 1.15, sun: '#ffd8a0', sunI: 2.0, fog: '#3a2414', fogNear: 4, fogFar: 14, skyTop: '#3a2414', skyHor: '#3a2414', sat: 0.55, gain: '#ffe0b0', lift: '#140a00', vig: 0.42, shadowExt: 3, ink: 1.8 },
  europe: { ...L0, az: 150, el: 34, sky: '#f0dcb8', ground: '#8a7058', hemi: 1.2, sun: '#ffe8c0', sunI: 2.3, fog: '#e8d0a8', fogNear: 18, fogFar: 110, skyTop: '#c8a87a', skyHor: '#f4e0b8', sat: 0.55, gain: '#ffe4b8', lift: '#140a00', vig: 0.38, shadowExt: 10, ink: 1.4 },
  study: { ...L0, az: 200, el: 40, sky: '#ffc890', ground: '#2a1a14', hemi: 1.05, sun: '#ffcf90', sunI: 1.9, fog: '#1e140e', fogNear: 6, fogFar: 22, skyTop: '#101020', skyHor: '#202040', sat: 1.18, gain: '#fff0dc', lift: '#04060c', vig: 0.36, shadowExt: 5, ink: 1.5 },
  mint: { ...L0, az: 10, el: 30, sky: '#ffe0b0', ground: '#4a3020', hemi: 1.15, sun: '#ffe2a8', sunI: 2.4, fog: '#3a2618', fogNear: 7, fogFar: 26, skyTop: '#3a2618', skyHor: '#3a2618', sat: 1.2, gain: '#fff2dc', lift: '#080404', vig: 0.34, shadowExt: 5, ink: 1.6 },
  snow: { ...L0, az: 230, el: 22, sky: '#c8daf4', ground: '#8a9ac0', hemi: 1.25, sun: '#fff2e4', sunI: 2.1, fog: '#cbd8ec', fogNear: 14, fogFar: 95, skyTop: '#7a9cd0', skyHor: '#e4ecf8', sat: 1.15, gain: '#eef4ff', lift: '#000610', vig: 0.28, shadowExt: 9, ink: 1.4 },
  house: { ...L0, az: 150, el: 26, sky: '#ffc890', ground: '#3a1a10', hemi: 1.05, sun: '#ffb070', sunI: 2.0, fog: '#24140a', fogNear: 4, fogFar: 14, skyTop: '#101020', skyHor: '#101020', sat: 1.2, gain: '#fff0dc', lift: '#06040a', vig: 0.38, shadowExt: 4, ink: 1.5 },
  heaven: { ...L0, az: 100, el: 30, sky: '#ffd0e4', ground: '#ffb0c8', hemi: 1.25, sun: '#fff0d0', sunI: 1.5, fog: '#ffc4d8', fogNear: 25, fogFar: 220, skyTop: '#e070a8', skyHor: '#ffd090', sat: 1.3, gain: '#fff4ec', lift: '#100008', vig: 0.22, shadowExt: 8, ink: 1.0, sunDisc: '#fff4d0', sunSize: 0.02 },
};
export const lightFor = (S, f) => ({ ...LIGHTS[S.set] });
const TINT = { palace: '#fff8f0', map: '#f6e6cc', europe: '#f6e6cc', study: '#fff8f0', mint: '#fffaf2', snow: '#f6f9ff', house: '#fff6ee', heaven: '#fffafa' };
const RIM = { palace: '#ffc860', map: '#ffd890', europe: '#fff0c8', study: '#ffd890', mint: '#ffe0a0', snow: '#d4e8ff', house: '#ffa850', heaven: '#fff0c0' };

// ---------------------------------------------------------------- camera
// keys per shot: { f, pos, look | yaw/pitch, fov, roll, e: 'out'|'lin'|'smooth' }, local set coords
const yawLook = (pos, yaw, pitch) => { const a = yaw * Math.PI / 180, p = pitch * Math.PI / 180; return [pos[0] + Math.sin(a) * Math.cos(p) * 5, pos[1] + Math.sin(p) * 5, pos[2] + Math.cos(a) * Math.cos(p) * 5]; };
const CAM = {
  s1: [{ f: 0, pos: [0.22, 0.75, 2.45], look: [0.04, 2.2, 0.6], fov: 52, roll: -5 }, { f: 22, pos: [0.14, 1.7, 2.35], look: [0.02, 2.36, 0.6], fov: 38, roll: -2.5, e: 'out' }, { f: 44, pos: [0.1, 1.86, 2.0], look: [0.02, 2.4, 0.6], fov: 35, roll: -1.5, e: 'lin' }],
  s2: [{ f: 44, pos: [0.8, 2.3, 2.2], look: [0.15, 2.55, 0.6], fov: 42, roll: 3 }, { f: 60, pos: [0.62, 2.45, 1.95], look: [0.2, 2.68, 0.6], fov: 38, roll: 1, e: 'out' }, { f: 99, pos: [0.55, 2.52, 1.8], look: [0.22, 2.72, 0.6], fov: 35, roll: -1, e: 'lin' }],
  s3a: [{ f: 100, pos: [-3.4, 1.5, -1.0], yaw: -110, pitch: 5, fov: 50 }, { f: 109, pos: [-3.6, 1.55, -1.5], look: [0.4, 1.45, 4.2], fov: 58, e: 'out' }, { f: 170, pos: [-3.4, 1.55, -1.0], look: [0.4, 1.45, 4.2], fov: 54, e: 'lin' }],
  s3b: [{ f: 171, pos: [-2.6, 1.15, 2.75], look: [-2.35, 1.25, 4.2], fov: 40, roll: 2 }, { f: 215, pos: [0.15, 1.2, 2.75], look: [0.35, 1.3, 4.2], fov: 37, roll: -2, e: 'smooth' }],
  s4: [{ f: 216, pos: [-1.35, 1.62, 1.05], look: [-2.0, 1.65, 4.0], fov: 44, roll: -3 }, { f: 236, pos: [-1.5, 1.6, 1.35], look: [-2.05, 1.62, 4.0], fov: 41, roll: -2, e: 'lin' }, { f: 244, pos: [-1.55, 1.62, 1.1], look: [-2.15, 1.85, 4.0], fov: 45, roll: 3, e: 'out' }, { f: 265, pos: [-1.6, 1.62, 1.3], look: [-2.15, 1.85, 4.0], fov: 43, roll: 2, e: 'lin' }],
  s5: [{ f: 266, pos: [-1.7, 1.6, 0.3], look: [-1.5, 1.55, 4.2], fov: 50 }, { f: 296, pos: [2.3, 1.65, 0.4], look: [2.5, 1.6, 4.2], fov: 50, e: 'smooth' }, { f: 306, pos: [3.05, 2.2, 2.05], look: [3.25, 2.3, 3.7], fov: 36, e: 'out' }, { f: 334, pos: [3.1, 2.27, 2.25], look: [3.25, 2.36, 3.7], fov: 31, roll: -2, e: 'lin' }],
  s7: [{ f: 335, pos: [1.15, 1.95, 2.05], look: [0.55, 0.81, 0.9], fov: 42, roll: 4 }, { f: 380, pos: [0.4, 1.75, 1.2], look: [0.05, 0.81, 0.0], fov: 40, roll: 1 }, { f: 417, pos: [-0.2, 1.6, 0.2], look: [-0.45, 0.81, -0.75], fov: 38, roll: -2, e: 'smooth' }],
  s8: [{ f: 418, pos: [1.0, 1.6, 0.2], yaw: 120, pitch: 8, fov: 46 }, { f: 425, pos: [0.6, 1.6, -0.4], look: [0.0, 2.0, -4.0], fov: 46, e: 'out' }, { f: 477, pos: [0.4, 1.7, -1.1], look: [0.0, 2.1, -4.0], fov: 43, e: 'lin' }],
  s9: [{ f: 478, pos: [-0.6, 1.4, 1.2], yaw: -60, pitch: 0, fov: 44 }, { f: 485, pos: [-0.3, 1.4, 1.5], look: [0.0, 1.45, 4.2], fov: 44, roll: 2, e: 'out' }, { f: 537, pos: [-0.15, 1.42, 1.95], look: [0.0, 1.5, 4.2], fov: 40, roll: -1, e: 'lin' }],
  s10: [{ f: 538, pos: [-1.4, 1.9, 1.4], yaw: 210, pitch: 0, fov: 42 }, { f: 545, pos: [0.55, 1.75, 1.3], look: [0.0, 2.15, -2.0], fov: 44, roll: -2, e: 'out' }, { f: 591, pos: [0.4, 1.85, 0.75], look: [0.0, 2.3, -2.0], fov: 40, roll: 1, e: 'lin' }],
  s11: [{ f: 592, pos: [-0.5, 1.55, 3.6], look: [0.05, 1.7, 0.2], fov: 50, roll: 2 }, { f: 672, pos: [-0.25, 1.62, 2.75], look: [0.05, 1.78, 0.2], fov: 47, roll: -1, e: 'lin' }],
  s12: [{ f: 673, pos: [0.65, 2.05, 2.2], look: [0.45, 2.2, 0.2], fov: 46 }, { f: 680, pos: [0.55, 2.15, 1.55], look: [0.45, 2.25, 0.2], fov: 42, e: 'out' }, { f: 703, pos: [0.52, 2.17, 1.4], look: [0.45, 2.27, 0.2], fov: 40, e: 'lin' }],
  s13: [{ f: 704, pos: [0.22, 2.12, -0.85], look: [0.15, 0.99, -1.37], fov: 40, roll: -5 }, { f: 734, pos: [0.2, 1.98, -0.92], look: [0.15, 0.99, -1.35], fov: 39, roll: -2, e: 'lin' }],
  s14: [{ f: 735, pos: [0.6, 3.0, 1.6], yaw: 235, pitch: 10, fov: 44 }, { f: 742, pos: [0.05, 3.0, 1.75], look: [0.0, 3.75, -3.84], fov: 44, e: 'out' }, { f: 760, pos: [0.0, 3.0, 1.45], look: [0.0, 3.75, -3.84], fov: 43, e: 'lin' }, { f: 770, pos: [-0.55, 1.85, 1.6], look: [-0.8, 1.35, -1.0], fov: 46, e: 'smooth' }, { f: 782, pos: [-0.5, 1.82, 1.4], look: [-0.78, 1.33, -1.0], fov: 45, e: 'lin' }, { f: 792, pos: [0.6, 1.85, 1.5], look: [0.7, 1.3, -1.0], fov: 46, e: 'smooth' }, { f: 809, pos: [0.6, 1.8, 1.25], look: [0.7, 1.28, -1.0], fov: 44, e: 'lin' }],
  s15a: [{ f: 810, pos: [2.65, 1.5, 0.75], look: [2.2, 1.2, -0.2], fov: 38, roll: 3 }, { f: 836, pos: [2.55, 1.42, 0.55], look: [2.2, 1.18, -0.2], fov: 36, roll: 1, e: 'lin' }, { f: 846, pos: [2.5, 1.4, 0.65], look: [2.2, 1.3, -0.2], fov: 40, roll: -2, e: 'out' }, { f: 867, pos: [2.45, 1.55, 0.5], look: [2.2, 1.6, -0.2], fov: 38, e: 'smooth' }],
  s15b: [{ f: 868, pos: [0.0, 1.62, 1.25], look: [0.0, 1.55, 0.0], fov: 36 }, { f: 893, pos: [0.0, 1.62, 1.1], look: [0.0, 1.55, 0.0], fov: 35, e: 'lin' }, { f: 914, pos: [0.15, 1.5, 2.2], look: [0.0, 1.45, -0.6], fov: 42, e: 'smooth' }],
  s16a: [{ f: 915, pos: [0.3, 1.25, 0.05], look: [0.04, 1.14, -0.9], fov: 40, roll: -4 }, { f: 958, pos: [0.22, 1.24, -0.05], look: [0.04, 1.15, -0.9], fov: 38, roll: -1, e: 'lin' }],
  s16b: [{ f: 959, pos: [0.08, 1.22, 0.05], look: [0.05, 1.22, -0.9], fov: 38 }, { f: 1023, pos: [0.08, 1.22, -0.02], look: [0.05, 1.23, -0.9], fov: 36, e: 'lin' }],
  s17: [{ f: 1024, pos: [-1.8, 1.25, -1.5], yaw: 120, pitch: 6, fov: 44 }, { f: 1031, pos: [0.5, 1.5, -2.0], look: [0.1, 3.6, -16.0], fov: 44, e: 'out' }, { f: 1078, pos: [0.4, 1.5, -2.7], look: [0.1, 3.6, -16.0], fov: 41, e: 'lin' }],
  s18: [{ f: 1079, pos: [0.7, 1.5, -2.2], look: [-0.15, 3.5, -16.0], fov: 47, roll: -3 }, { f: 1148, pos: [0.5, 1.5, -3.0], look: [-0.1, 3.5, -16.0], fov: 43, roll: 2, e: 'lin' }],
  s19: [{ f: 1149, pos: [1.6, 1.7, 2.3], look: [0.35, 1.3, -1.15], fov: 46, roll: -2 }, { f: 1200, pos: [1.2, 1.6, 1.6], look: [0.42, 1.32, -1.15], fov: 42, roll: 0, e: 'lin' }, { f: 1215, pos: [0.85, 1.45, 0.75], look: [0.45, 1.25, -1.15], fov: 40, roll: 2, e: 'smooth' }, { f: 1268, pos: [0.8, 1.45, 0.6], look: [0.45, 1.27, -1.15], fov: 38, roll: 1, e: 'lin' }],
  s20: [{ f: 1269, pos: [1.05, 1.5, 0.75], look: [0.95, 1.2, -0.8], fov: 44 }, { f: 1303, pos: [1.0, 1.45, 0.55], look: [0.95, 1.2, -0.8], fov: 41, e: 'lin' }],
  s21a: [{ f: 1304, pos: [1.0, 1.55, 0.5], look: [0.6, 1.6, -1.15], fov: 42 }, { f: 1314, pos: [1.2, 1.6, 0.2], look: [1.3, 1.85, -2.4], fov: 40, e: 'smooth' }, { f: 1341, pos: [1.2, 1.95, -0.6], look: [1.3, 2.0, -2.4], fov: 36, e: 'smooth' }],
  s21b: [{ f: 1342, pos: [0.2, 2.8, 5.4], look: [0.0, 1.8, -0.8], fov: 50, roll: 3 }, { f: 1370, pos: [0.1, 2.0, 4.0], look: [0.0, 1.6, -0.8], fov: 48, roll: 1, e: 'out' }, { f: 1407, pos: [0.05, 1.9, 3.5], look: [0.0, 1.62, -0.8], fov: 45, roll: -1, e: 'lin' }],
};
const KICKS = [{ f: 239, a: 0.012 }, { f: 724, a: 0.03 }, { f: 776, a: 0.025 }, { f: 838, a: 0.03 }, { f: 1092, a: 0.015 }];
const keyLook = (k) => k.look || yawLook(k.pos, k.yaw, k.pitch);
export const camAt = (f) => {
  const S = shotAt(f), K = CAM[S.id], o = OFF[S.set]; let c;
  if (f <= K[0].f) c = { pos: K[0].pos, look: keyLook(K[0]), fov: K[0].fov, roll: K[0].roll || 0 };
  else if (f >= K[K.length - 1].f) { const k = K[K.length - 1]; c = { pos: k.pos, look: keyLook(k), fov: k.fov, roll: k.roll || 0 }; }
  else for (let i = 0; i < K.length - 1; i++) if (f >= K[i].f && f < K[i + 1].f) {
    const a = K[i], b = K[i + 1], r = (f - a.f) / (b.f - a.f), t = b.e === 'out' ? easeOut(r) : b.e === 'lin' ? r : smooth(r);
    const pos = lerp3(a.pos, b.pos, t);
    let look; if (a.yaw !== undefined && b.yaw !== undefined) look = yawLook(pos, lerp(a.yaw, b.yaw, t), lerp(a.pitch, b.pitch, t));
    else if (a.yaw !== undefined) { const la = yawLook(a.pos, a.yaw, a.pitch), lb = keyLook(b); const ya = Math.atan2(la[0] - a.pos[0], la[2] - a.pos[2]), yb = Math.atan2(lb[0] - b.pos[0], lb[2] - b.pos[2]);
      let dy = yb - ya; while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI; const pa = Math.asin(clamp((la[1] - a.pos[1]) / 5, -1, 1)), dist = Math.hypot(lb[0] - b.pos[0], lb[1] - b.pos[1], lb[2] - b.pos[2]), pb = Math.asin(clamp((lb[1] - b.pos[1]) / dist, -1, 1));
      const yy = ya + dy * t, pp = lerp(pa, pb, t); look = [pos[0] + Math.sin(yy) * Math.cos(pp) * 5, pos[1] + Math.sin(pp) * 5, pos[2] + Math.cos(yy) * Math.cos(pp) * 5]; }
    else look = lerp3(keyLook(a), keyLook(b), t);
    c = { pos, look, fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) }; break;
  }
  c = { pos: [c.pos[0] + o[0], c.pos[1], c.pos[2]], look: [c.look[0] + o[0], c.look[1], c.look[2]], fov: c.fov, roll: c.roll };
  // handheld breathing so no frame ever freezes
  c.pos[0] += 0.006 * Math.sin(f * 0.07); c.pos[1] += 0.005 * Math.sin(f * 0.053 + 1);
  for (const k of KICKS) { const d = f - k.f; if (d >= 0 && d < 7) { const s = (Math.floor(d) % 2 ? -1 : 1) * k.a * (1 - d / 7); c.look[1] += s * 3; c.look[0] += s * 2; c.roll += s * 20; } }
  c.flash = 0;
  for (const [a, n, k] of [[335, 5, 0.95], [1149, 6, 1], [1342, 7, 1], [704, 2, 0.35]]) if (f >= a && f < a + n) c.flash = (1 - (f - a) / n) * k;
  if (f >= 1336 && f < 1342) c.flash = ramp(f, 1336, 1341.5);
  if (f >= 1141 && f < 1149) c.flash = ramp(f, 1141, 1148.5) * 0.9;
  c.shadowAt = c.look;
  return c;
};
globalThis.mbAt = (f) => { const W = [[100, 109], [418, 425], [478, 485], [538, 545], [735, 742], [1024, 1031], [276, 280], [289, 293], [240, 246]]; return W.some(([a, b]) => f >= a && f < b) ? 5 : 1; };

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOCUS = { _: 0,
  s1: [0, 2.4, 0.6, 9], s2: [0.33, 2.75, 0.6, 15], s3a: [-1.2, 1.5, 4.2, 9], s3b: [null, 1.25, 4.2, 14], s4: [-2.0, 1.7, 4.0, 11], s5: [null, 1.6, 4.0, 10],
  s7: [null, 0.81, 0, 12], s8: [0, 2.0, -4.0, 10], s9: [0, 1.45, 4.2, 14], s10: [0, 2.2, -2.0, 11], s11: [0.05, 1.6, 0.25, 10], s12: [0.45, 2.3, 0.2, 12], s13: [0.16, 0.99, -1.37, 13],
  s14: [null, 1.5, -1.2, 9], s15a: [2.2, 1.12, -0.2, 16], s15b: [0, 1.55, 0, 15], s16a: [0, 1.12, -0.9, 16], s16b: [0.02, 1.2, -0.9, 14], s17: [0, 1.5, -6.2, 10], s18: [0, 1.5, -6.2, 8],
  s19: [0.42, 1.3, -1.15, 11], s20: [1.0, 1.05, -0.6, 12], s21a: [1.3, 2.0, -2.4, 10], s21b: [0, 1.7, 0, 8],
};
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f), fc = FOCUS[S.id], o = OFF[S.set];
  let p = fc[0] === null ? [C.look[0] - o[0], fc[1], fc[2]] : [fc[0], fc[1], fc[2]];
  if (S.id === 's16b' && f > 995) p = lerp3(p, [0.0, 1.6, -2.3], smooth(ramp(f, 995, 1005)));
  if (S.id === 's15b' && f > 893) p = lerp3(p, [0.0, 1.5, -0.6], smooth(ramp(f, 893, 905)));
  return { focus: dist(C.pos, [p[0] + o[0], p[1], p[2]]), cinf: fc[3] };
};

// ---------------------------------------------------------------- cast helpers
const blinkAt = (f, seed) => { const per = 38 + (seed * 17) % 31, ph = (Math.floor(f) + seed * 13) % per; return ph < 2 ? 0.5 : ph < 4 ? 1 : 0; };
const NS = 1.2, TS = 1.7; // noble / tsar card scales
const ROW = [-2.4, -1.2, 0, 1.2, 2.4], RZ = 4.2;
const nob = (i, mods = {}) => ({ ...NOBLES[i], ...mods });
let CUR = 'palace';
const A = (T, spec, o, pos, ex = {}) => {
  const opts = { rim: RIM[CUR], rimDir: -1, ...o }, k = JSON.stringify([spec, opts]);
  return { key: k, draw: (p) => T.char2(p, spec, opts), x: pos[0], y: pos[1], z: pos[2], s: 1, tint: TINT[CUR], ...ex };
};
const idleY = (f, seed, a = 0.012) => a * Math.sin((f + seed * 11) * 0.12);
const idleR = (f, seed, a = 0.02) => a * Math.sin((f + seed * 7) * 0.05);
const beardPh = (f, seed, speed = 0.12) => q(Math.floor(f / 2) * speed * 2 + seed, 1);
const COURT = [
  { ...NOBLES[3], body: '#4a2a6a', bigBeard: 'long', beardCol: '#5a3a24', hat: { ...NOBLES[3].hat, crown: '#4a2a6a', h: 150 } },
  { ...NOBLES[1], body: '#7a1a1a', bigBeard: 'fork', beardCol: '#9a9a96', hat: { ...NOBLES[1].hat, crown: '#7a1a1a', h: 130 } },
  { robe: true, fit: 0.84, body: '#c84a7a', bw: 190, detail: ['brocade', { t: 'fur', c: '#f4ece0' }], hair: '#5a3a24', hairStyle: 'bun', hat: { type: 'crown', color: '#e8b840' } },
  { ...NOBLES[4], body: '#2a5a8a', bigBeard: 'spade', beardCol: '#c8562a', hat: { ...NOBLES[4].hat, crown: '#2a5a8a', h: 170 } },
  { robe: true, fit: 0.84, body: '#3a8a6a', bw: 180, detail: ['brocade', { t: 'fur', c: '#e8dcc8' }], hair: '#c88a3a', hairStyle: 'bun', hat: { type: 'crown', color: '#f2d060' } },
  { ...NOBLES[0], body: '#8a6a1a', bigBeard: 'curly', beardCol: '#3a2618', hat: { ...NOBLES[0].hat, crown: '#8a6a1a', h: 120 } },
];
const courtier = (T, f, i, pos, s = 1.1) => {
  const ph = Math.floor((f + i * 17) / 26) % 3, side = i % 2 ? 1 : -1;
  const o = { expr: ['worried', 'gulp', 'shock', 'sly', 'scared', 'worried'][i % 6], turn: ph === 1 ? side * 0.5 : ph === 2 ? -side * 0.3 : 0, blink: blinkAt(f, i + 20), beardPh: beardPh(f, i, 0.06),
    L: ph === 1 ? (side < 0 ? { x: 230, y: 320 } : 'hang') : 'belly', R: ph === 1 ? (side > 0 ? { x: 370, y: 320 } : 'hang') : 'belly' };
  return A(T, COURT[i % 6], o, [pos[0], pos[1] + idleY(f, i), pos[2]], { s, roll: idleR(f, i) });
};
const beardFly = (T, f, f0, style, col, from, dir, s = 0.96) => {
  const t = (f - f0) / 30; if (t < 0 || t > 1.5) return null;
  const x = from[0] + dir[0] * t * 1.4, y = from[1] + 1.6 * t - 1.2 * t * t, z = from[2] + dir[2] * t;
  return { key: 'beard' + style + col + q(t * 6, 0), draw: (p) => T.beardCard(p, style, col, q(t * 6, 0)), x, y: y - (975 - 300) / 1000 * 2.25 * s, z, s, roll: t * 5 * (dir[0] > 0 ? -1 : 1), blob: false, shadow: false, order: 3, tint: TINT[CUR] };
};
const hairBurst = (out, f, f0, at, col, n = 40) => { const t = (f - f0) / 30; if (t < 0 || t > 2) return;
  for (let i = 0; i < n; i++) { const a = hash(i + f0) * Math.PI * 2, sp = 0.4 + hash(i * 3 + f0) * 1.0, tt = t;
    out.push([at[0] + Math.cos(a) * sp * tt, at[1] + Math.sin(a) * sp * tt * 0.8 + 0.6 * tt - 0.55 * tt * tt * 2, at[2] + (hash(i * 7) - 0.5) * 0.5 * tt, 0.06 + hash(i) * 0.05, clamp(1.6 - tt), tt * 3 + i, col]); } };
const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };

// ---------------------------------------------------------------- world state per frame
export const worldAt = (f) => {
  const S = shotAt(f), W = { set: S.set, hair: [], sparks: [], glows: [], foam: [], puffs: [] }, id = S.id, o = OFF[S.set];
  const P = (x, y, z) => [x + o[0], y, z];
  if (S.set === 'palace') {
    // razor glints
    const tip = [0.41, 2.98, 0.8];
    for (const [fa, k] of [[14, 1.0], [76, 1.3]]) { const d = f - fa; if (d > -2 && d < 12) W.sparks.push([...tip, 0.75 * k * Math.sin(clamp((d + 2) / 14) * Math.PI), 1, d * 0.08, [1, 0.95, 0.8]]); }
    if (id === 's1' && f < 14) { /* razor rising */ }
    // shaving hair bursts
    hairBurst(W.hair, f, 239, [ROW[0], 1.3, RZ - 0.2], rgb(NOBLES[0].beardCol));
    hairBurst(W.hair, f, 272, [ROW[1], 1.3, RZ - 0.2], rgb(NOBLES[1].beardCol));
    hairBurst(W.hair, f, 285, [ROW[3], 1.3, RZ - 0.2], rgb(NOBLES[3].beardCol));
    hairBurst(W.hair, f, 298, [ROW[4], 1.3, RZ - 0.2], rgb(NOBLES[4].beardCol));
    for (const fa of [239, 272, 285, 298]) { const d = f - fa; if (d >= 0 && d < 10) { const nx = fa === 239 ? ROW[0] : fa === 272 ? ROW[1] : fa === 285 ? ROW[3] : ROW[4]; W.sparks.push([nx + 0.25, 1.45, RZ - 0.3, 0.45 * (1 - d / 10), 1, d * 0.2]); W.puffs.push([nx, 1.25, RZ - 0.25, 0.4 + d * 0.06, 0.7 * (1 - d / 10), [1, 0.95, 0.9]]); } }
    // hair drifting from the razor on "Höchstpersönlich" (blown)
    if (f >= 308 && f < 335) for (let i = 0; i < 18; i++) { const t = (f - 308) / 27 + hash(i) * 0.2; W.hair.push([3.5 - t * 1.2 + hash(i + 2) * 0.1, 2.45 + t * 0.4 + Math.sin(t * 6 + i) * 0.05, 3.5 - t * 0.6, 0.05, clamp(1.4 - t), t * 4 + i, rgb('#6a4024')]); }
    // floating hair tufts all over S5
    if (id === 's5') for (let i = 0; i < 60; i++) { const t = ((f - 266) * 0.01 + hash(i)) % 1; W.hair.push([-2.6 + hash(i + 1) * 5.6, 2.8 - t * 2.6, 3.4 + hash(i + 2) * 1.2, 0.05, 0.9, f * 0.05 + i, rgb([NOBLES[0].beardCol, NOBLES[1].beardCol, NOBLES[3].beardCol, NOBLES[4].beardCol][i % 4])]); }
    // fainted noble: dizzy stars
    if (id === 's5') for (let i = 0; i < 4; i++) { const a = f * 0.25 + i * Math.PI / 2; W.sparks.push([ROW[0] - 0.75 + Math.cos(a) * 0.25, 0.75 + Math.sin(a) * 0.08, RZ + Math.sin(a) * 0.2, 0.18, 1, a, [1, 0.85, 0.2]]); }
    if (id === 's9') { W.glows.push([0, 1.7, 5.4, 4.2, 0.55, [1, 0.8, 0.5]]); for (let i = 0; i < 16; i++) { const t = ((f - 478) * 0.008 + hash(i)) % 1; W.sparks.push([-0.8 + hash(i + 1) * 1.6, 0.8 + t * 1.8, 4.0 + hash(i + 3) * 0.6, 0.06, Math.sin(t * Math.PI), 0, [1, 0.9, 0.6]]); } }
    W.sway = id === 's9' ? 0.4 : 1;
  }
  if (S.set === 'map') W.mapT = smooth(ramp(f, 337, 415));
  if (S.set === 'study') {
    W.write = id === 's13' ? smooth(ramp(f, 704, 721)) : (f > 734 ? 1 : 0); W.writing = id === 's13' && f < 722;
    const sl = id === 's13' ? (f < 718 ? [0.2, 0.45] : f < 724 ? [lerp(0.2, 1, smooth(ramp(f, 718, 722))), lerp(0.45, 0.0, easeOut(ramp(f, 720, 724)))] : [1, 0.012 + 0.12 * smooth(ramp(f, 728, 734))]) : [0.2, 0.45];
    W.seal = sl; W.sealed = id === 's13' && f >= 724 ? 1 : 0;
    W.bounce = id === 's13' && f >= 724 ? 0.03 * Math.abs(Math.sin((f - 724) * 0.9)) * Math.exp(-(f - 724) * 0.3) : 0;
    if (id === 's13' && f >= 724 && f < 734) W.sparks.push([0.15 + o[0], 1.03, -1.02, 0.4 * (1 - (f - 724) / 10), 1, 0, [1, 0.8, 0.5]]);
    if (id === 's13' && f < 722) { const t = ramp(f, 704, 721); W.sparks.push([o[0] + 0.15 - 0.17 + t * 0.34, 1.0, -1.42, 0.05, 1, 0, [1, 0.9, 0.7]]); }
    if (id === 's10' && f >= 546) { const k = back(ramp(f, 546, 556)); W.idea = [o[0], 3.05 + 0.03 * Math.sin(f * 0.2), -2.0, k]; }
  }
  if (S.set === 'mint') {
    // falling sack (rich man) and single coin (peasant)
    if (id === 's14') {
      const tf = ramp(f, 768, 776), land = f >= 776, sq = land ? 0.18 * Math.exp(-(f - 776) * 0.35) * Math.cos((f - 776) * 0.9) : 0;
      if (f >= 762) W.sack = [-0.85, lerp(1.9, 1.01, tf * tf), -1.05, sq];
      if (f >= 776 && f < 790) for (let i = 0; i < 10; i++) { const t = (f - 776) / 14; W.sparks.push([o[0] - 0.85 + (hash(i) - 0.5) * 0.8 * t, 1.05 + Math.sin(t * Math.PI) * 0.3 * hash(i + 1), -1.0, 0.08, 1 - t, 0]); }
      const tc = ramp(f, 788, 794); if (f >= 784) W.coin1 = [0.75, f < 794 ? lerp(1.6, 1.035, tc * tc) : 1.035 + 0.03 * Math.abs(Math.sin((f - 794) * 0.8)) * Math.exp(-(f - 794) * 0.25), -1.05, f < 794 ? f * 0.4 : 0.1 * Math.sin((f - 794) * 0.8) * Math.exp(-(f - 794) * 0.2)];
      if (f >= 794 && f < 802) W.sparks.push([o[0] + 0.75, 1.07, -1.05, 0.25 * (1 - (f - 794) / 8), 1, 0]);
    }
    if (id === 's15a') {
      W.press = f < 826 ? 0.15 * Math.sin((f - 810) * 0.3) ** 2 : f < 838 ? (ramp(f, 826, 838)) ** 3 : f < 846 ? 1 : 1 - smooth(ramp(f, 846, 858));
      if (f >= 838 && f < 850) { const t = (f - 838) / 12; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; W.sparks.push([o[0] + 2.2 + Math.cos(a) * 0.35 * t, 1.12 + Math.abs(Math.sin(a)) * 0.25 * t, -0.2 + Math.sin(a) * 0.15, 0.08 * (1 - t), 1, a, [1, 0.85, 0.4]]); } W.sparks.push([o[0] + 2.2, 1.12, -0.05, 0.6 * (1 - t), 1, 0]); }
      if (f >= 852) { const t = ramp(f, 852, 867); W.coinA = [o[0] + 2.2, 1.12 + t * t * 0.9, -0.2 + t * 0.3, -Math.PI / 2 * (1 - t), t * 9, 0, 0.16 + t * 0.06]; }
    } else W.press = 0;
    if (id === 's15b') { const t = ramp(f, 868, 890), spin = (1 - easeOut(t)) * 14; if (f < 898) W.coinA = [o[0], 1.55 + 0.02 * Math.sin(f * 0.2), 0, 0.12 * Math.sin(f * 0.13), spin, 0.06 * Math.sin(f * 0.1), lerp(0.4, 0.5, easeOut(t))];
      if (f > 876 && f < 898) { const d = (f - 876) % 14; W.sparks.push([o[0] - 0.12, 1.68, 0.06, 0.35 * Math.sin(d / 14 * Math.PI), 1, f * 0.05]); } }
    if (id === 's16a') { const t = ramp(f, 915, 958); W.coinB = [o[0] + 0.04, 1.01 + 0.14, -0.9, -0.12, Math.PI * 2.6 * (1 - easeOut(t)) + Math.PI, Math.sin(f * 0.3) * 0.05 * (1 - t), 0.27]; }
    if (id === 's16b') { W.coinB = [o[0] + 0.04, 1.22, -0.9, 0.05 * Math.sin(f * 0.05), Math.PI + 0.14 * Math.sin((f - 959) * 0.05), 0.02 * Math.sin(f * 0.04), 0.27]; if ((f - 959) % 30 < 12) W.sparks.push([o[0] + 0.04, 1.235, -0.85, 0.14 * Math.sin(((f - 959) % 30) / 12 * Math.PI), 1, f * 0.05]); }
  }
  if (S.set === 'snow') {
    W.wind = 0.6; W.breath = [[o[0] + 0.62, 1.38, -6.0, 0], [o[0] - 0.2, 1.55, -6.2, 17]];
    if (id === 's18') { // soap foam cloud on "rasiert"
      const t = (f - 1088) / 26; if (t > -0.2 && t < 1.3) for (let i = 0; i < 70; i++) { const a = hash(i) * Math.PI * 2, r = (0.15 + hash(i + 1) * 0.6) * clamp(t * 3), dropT = clamp(t - 0.55); W.foam.push([o[0] + 0.55 + Math.cos(a) * r, 1.35 + Math.sin(a) * r * 0.9 - dropT * 1.0 * hash(i + 2), -6.1 + hash(i + 3) * 0.3, (0.18 + hash(i + 4) * 0.22) * clamp(t * 4), clamp(1.3 - t), i]); }
      if (f >= 1141) for (let i = 0; i < 40; i++) { const t = ramp(f, 1141, 1149), a = hash(i) * Math.PI * 2; W.foam.push([o[0] + 1.05 + Math.cos(a) * 0.4 * t, 1.38 + Math.sin(a) * 0.4 * t, -3.0 - 0.3 * hash(i), 0.1 + t * 0.5, 1, i]); }
      if (f >= 1100 && f < 1108) W.sparks.push([o[0] + 0.25, 1.6, -6.0, 0.35 * (1 - (f - 1100) / 8), 1, 0]);
      if (f >= 1112) for (let i = 0; i < 3; i++) { const d = (f - 1112 + i * 9) % 27; W.sparks.push([o[0] + 0.55 + (i - 1) * 0.25, 1.25 + d * 0.01, -6.0, 0.15 * Math.sin(d / 27 * Math.PI), 1, d]); }
    }
  }
  if (S.set === 'house') {
    W.lid = id === 's19' ? 0 : id === 's20' ? smooth(ramp(f, 1278, 1292)) : 1; W.inChest = id === 's20' && f >= 1272 ? 1 : 0; W.glowK = 1;
    if (id === 's20' && f >= 1293) { const t = ramp(f, 1293, 1303); W.hearts = [[o[0] + 1.1, 1.3 + t * 0.35, -0.45, 0.09 + 0.04 * Math.sin(t * Math.PI), Math.sin(t * Math.PI), 0]]; }
    if (id === 's21a') { const t = ramp(f, 1314, 1341); W.flake = [o[0] + 1.3 - 0.08 * t, 2.0 + Math.sin(t * 5) * 0.03, -2.25 + t * 1.5, 0.05 + t * t * 0.7, clamp(t * 4), t * 2]; }
  }
  return W;
};

// ---------------------------------------------------------------- actors per frame
export const actorsAt = (f, T) => {
  const S = shotAt(f), id = S.id, out = []; CUR = S.set; const o = OFF[S.set];
  const P = (x, y, z) => [x + o[0], y, z];
  const push = (a) => a && out.push(a);
  if (S.set === 'palace') {
    const tsarBase = { blink: blinkAt(f, 3), glint: true };
    // the five nobles in a row (z = RZ)
    const shavedAt = [239, 272, 99999, 285, 298];
    const gulp = f >= 190 && f < 216, gulpDip = f >= 196 && f < 208 ? -0.04 * Math.sin((f - 196) / 12 * Math.PI) : 0;
    if (id !== 's9' && id !== 's1' && id !== 's2') for (let i = 0; i < 5; i++) {
      const shaved = f >= shavedAt[i], x = ROW[i];
      let o2 = { expr: gulp ? 'gulp' : 'worried', blink: blinkAt(f, i + 5), beardPh: beardPh(f, i), sweat: gulp || f > 230, look: id === 's3a' ? -0.6 : 0, L: 'belly', R: 'belly', lookY: gulp ? -0.3 : 0 };
      let spec = nob(i), roll = idleR(f, i, 0.015), y = idleY(f, i) + gulpDip;
      if (shaved) { spec = nob(i, { bigBeard: null }); o2 = { ...o2, shaved: true, sweat: false };
        const dt = f - shavedAt[i];
        if (i === 0) o2 = { ...o2, expr: dt < 30 ? 'shock' : 'sleep', L: { x: 250, y: 380 }, R: { x: 350, y: 380 } };
        if (i === 1) o2 = { ...o2, expr: 'shock', L: { x: 262, y: 375 }, R: { x: 338, y: 375 } };
        if (i === 3) o2 = { ...o2, expr: 'scream', R: { x: 480, y: 290 }, holdR: 'mirror', L: 'up' };
        if (i === 4) o2 = { ...o2, expr: 'cry', tears: q((f % 12) / 12, 1), L: { x: 240, y: 330 }, R: 'hang' };
        if (i === 0 && dt > 34) { roll = -Math.PI / 2 * smooth(ramp(f, shavedAt[0] + 34, shavedAt[0] + 44)); y = 0.06; }
      }
      if (i === 2) o2 = { ...o2, expr: id === 's5' ? 'scared' : o2.expr, L: id === 's5' ? { x: 250, y: 560 } : o2.L, R: id === 's5' ? { x: 350, y: 560 } : o2.R, sweat: id === 's5' };
      if (id === 's4' && i === 0 && f < 239) o2 = { ...o2, expr: 'scared', lookY: 0.4, look: 0.4 };
      const a = A(T, spec, o2, [x, y, RZ], { s: NS, roll });
      if (i === 0 && roll < -0.2) { a.x += -0.0; a.z = RZ; a.y = 0.12; }
      push(a);
    }
    // courtiers in the background (hook side and reverse side)
    if (id === 's1' || id === 's2') [[-1.7, -2.2], [1.8, -2.7], [-2.9, -4.6], [3.0, -5.0], [-0.9, -6.2], [1.1, -6.8]].forEach(([x, z], i) => push(courtier(T, f, i, [x, 0, z])));
    if (['s3a', 's3b', 's4', 's5', 's9'].includes(id)) [[-1.6, 7.6], [1.5, 8.2], [-0.2, 9.4], [2.9, 7.4], [-3.2, 8.4]].forEach(([x, z], i) => push(courtier(T, f, i + 1, [x, 0, z])));
    // the Tsar
    if (id === 's1' || id === 's2') {
      const up = smooth(ramp(f, 2, 12)), wig = id === 's2' ? Math.sin(f * 0.18) * 14 : 0;
      const R = f < 12 ? { x: lerp(400, 430, up), y: lerp(560, 190, up), b: 0.8 } : { x: 430 + q(wig, 0), y: 190 - q(wig * 0.5, 0), b: 0.6 };
      push(A(T, TSAR, { ...tsarBase, expr: 'manic', R, holdR: 'razor', L: 'hip', headTilt: q(3 * Math.sin(f * 0.1), 1) }, [0, idleY(f, 1, 0.01), 0.6], { s: TS, roll: idleR(f, 1, 0.015) }));
    }
    if (id === 's4') {
      const lean = smooth(ramp(f, 216, 236)), cut = f >= 239;
      const R = cut ? { x: lerp(600, 560, smooth(ramp(f, 239, 247))), y: lerp(700, 380, easeOut(ramp(f, 239, 247))), b: 0.5 } : { x: 600, y: lerp(560, 700, lean), b: 0.5 };
      push(A(T, TSAR, { ...tsarBase, expr: cut ? 'laugh' : 'manic', turn: 0.5, look: 0.7, R, holdR: 'razor', L: 'hip' }, [-1.55, 0, 3.65], { s: TS, roll: -0.16 * lean + (cut ? 0.1 * smooth(ramp(f, 239, 250)) : 0) }));
      push(beardFly(T, f, 239, 'fork', NOBLES[0].beardCol, [ROW[0], 1.51, RZ - 0.1], [0.9, 0, -0.6]));
    }
    if (id === 's5') {
      const stops = [[266, -0.4], [278, 2.0], [291, 3.2]]; let tx = -0.4; for (const [fa, x] of stops) if (f >= fa) tx = x;
      const slide = f >= 278 && f < 281 ? lerp(-0.4, 2.0, ramp(f, 277, 280)) : f >= 291 && f < 294 ? lerp(2.0, 3.2, ramp(f, 290, 293)) : tx;
      const cutT = [272, 285, 298].find((c) => f >= c - 6 && f < c + 6);
      const R = f >= 303 ? { x: 470, y: 230, b: 0.6 } : cutT ? { x: 600, y: f < cutT ? 680 : 420, b: 0.5 } : { x: 560, y: 560, b: 0.5 };
      const exprT = f >= 318 ? 'smug' : f >= 303 ? 'sly' : 'manic';
      push(A(T, TSAR, { ...tsarBase, expr: exprT, wink: f >= 318 && f < 332, turn: f >= 303 ? 0.2 : 0.5, look: 0.6, R, holdR: 'razor', L: 'hip' }, [slide, 0, 3.65], { s: TS, roll: f >= 303 ? 0 : -0.12 }));
      push(beardFly(T, f, 272, 'curly', NOBLES[1].beardCol, [ROW[1], 1.51, RZ - 0.1], [-0.9, 0, -0.6]));
      push(beardFly(T, f, 285, 'spade', NOBLES[3].beardCol, [ROW[3], 1.51, RZ - 0.1], [0.9, 0, -0.6]));
      push(beardFly(T, f, 298, 'bushy', NOBLES[4].beardCol, [ROW[4], 1.51, RZ - 0.1], [-0.6, 0, -0.6]));
      push(beardFly(T, f, 239, 'fork', NOBLES[0].beardCol, [ROW[0], 1.51, RZ - 0.1], [0.9, 0, -0.6]));
    }
    if (id === 's9') { // the old noble hugs his holy beard
      push(A(T, nob(2), { expr: 'tender', beardPh: beardPh(f, 2, 0.08), L: { x: 220, y: 600 }, R: { x: 380, y: 600 }, headTilt: q(5 * Math.sin(f * 0.05), 1), blush: true, rim: '#ffe0a0', rimW: 7 }, [0, idleY(f, 2), RZ], { s: NS, roll: 0.03 * Math.sin(f * 0.05) }));
    }
  }
  if (S.set === 'europe') {
    const disgust = f >= 438;
    push(A(T, TSAR, { expr: f < 452 ? 'shock' : 'smug', look: f < 452 ? -0.6 : 0.3, R: f >= 452 ? { x: 300 + q(Math.sin(f * 0.3) * 20, 0), y: 360 } : 'hang', L: 'hip', blink: blinkAt(f, 3), turn: -0.2 }, P(0, 0, -4), { s: TS }));
    [[-1.3, -3.2, 0], [1.4, -3.6, 1], [-2.2, -6.5, 2], [2.0, -7.5, 3], [0.6, -9, 1]].forEach(([x, z, v], i) => {
      const wk = i >= 3, st = q(((f + i * 9) % 20) / 20);
      push(A(T, GENT(v), { expr: disgust && i < 3 ? 'disgust' : 'smug', turn: disgust && i < 3 ? (x < 0 ? 0.6 : -0.6) : 0, look: disgust ? (x < 0 ? 0.8 : -0.8) : 0, legs: wk ? 'walk' : 'stand', step: wk ? st : 0, blink: blinkAt(f, i + 30), R: i === 1 && disgust ? { x: 330, y: 300 } : 'hang' },
        P(x + (wk ? (i === 3 ? -1 : 1) * (f - 418) * 0.02 : 0), wk ? Math.abs(Math.sin(st * Math.PI * 2)) * 0.02 : idleY(f, i), z), { s: 1.0, flip: wk && i === 3 }));
    });
    // a bearded traveller passes: everyone wrinkles their nose
    const tt = ramp(f, 420, 476); push(A(T, { ...PEASANT, body: '#6a4a3a' }, { expr: 'happy', legs: 'walk', step: q((f % 18) / 18), beardPh: beardPh(f, 9) }, P(lerp(3.2, -2.6, tt), 0, -5.3), { s: 1.05, flip: true }));
  }
  if (S.set === 'study') {
    if (id === 's10') push(A(T, TSAR, { expr: f < 548 ? 'determined' : 'sly', glint: f >= 548, R: f >= 544 ? 'up' : 'hang', L: 'hip', blink: blinkAt(f, 3) }, P(0, idleY(f, 1, 0.008), -2.0), { s: TS }));
    if (id === 's11' || id === 's12') {
      const hug = id === 's11' ? smooth(ramp(f, 600, 614)) : 1, relax = f >= 650, frozen = id === 's12' && f >= 680;
      const nobO = { expr: frozen ? 'gulp' : relax ? 'happy' : 'worried', beardPh: beardPh(f, 2, 0.06), blink: blinkAt(f, 12), L: 'belly', R: relax && !frozen ? 'thumb' : 'belly', sweat: frozen, look: 0.4 };
      push(A(T, nob(2), nobO, P(-0.38, idleY(f, 2), 0.3), { s: NS }));
      const tsO = id === 's12' ? { expr: 'sly', R: { x: 330, y: 470 }, holdR: 'palm', L: { x: 30, y: 700 }, wink: false } : { expr: relax ? 'sly' : 'happy', wink: f >= 652 && f < 668, L: { x: lerp(170, 30, hug), y: lerp(560, 700, hug) }, R: f >= 652 ? 'thumb' : 'hip' };
      push(A(T, TSAR, { ...tsO, blink: blinkAt(f, 3), turn: id === 's12' ? 0 : -0.3, look: id === 's12' ? 0 : -0.5 }, P(id === 's12' ? 0.42 : lerp(1.2, 0.38, smooth(ramp(f, 592, 606))), 0, 0.2), { s: TS, roll: id === 's11' ? 0.06 * hug : 0 }));
    }
    if (id === 's13') { // the Tsar's hand/quill writing is implied by the moving spark; the hand appears for the seal slam
    }
  }
  if (S.set === 'mint') {
    if (id === 's14') {
      push(A(T, OFFICIAL, { expr: 'smug', glasses: true, headTilt: -8, L: 'forward', holdL: 'ledger', R: f > 790 ? 'reach' : 'hip', holdR: 'quill', blink: blinkAt(f, 41), lookY: 0.3 }, P(0, idleY(f, 41), -2.0), { s: 1.0 }));
      const drop = f >= 768;
      push(A(T, RICH, { expr: drop ? 'scared' : 'worried', beardPh: beardPh(f, 5), R: drop ? 'forward' : { x: 470, y: 400 }, holdR: drop ? null : 'goldsack', L: 'belly', tears: drop ? q((f % 12) / 12, 1) : 0, sweat: !drop, blink: blinkAt(f, 42) }, P(-1.05, idleY(f, 5), -0.75), { s: 1.15 }));
      push(A(T, PEASANT, { expr: f > 794 ? 'happy' : 'neutral', beardPh: beardPh(f, 6), R: f < 790 ? { x: 420, y: 520 } : 'hang', holdR: f < 786 ? 'coin' : null, L: 'hang', blink: blinkAt(f, 43) }, P(1.1, idleY(f, 6), -0.7), { s: 1.0, flip: true }));
      [[-0.9, 1.6, 0], [-1.1, 2.9, 3], [-0.7, 4.0, 1]].forEach(([x, z, i]) => push(A(T, nob(i === 3 ? 3 : i === 1 ? 1 : 0, { body: ['#5a3a6a', '#3a6a5a', '#8a4a2a'][i % 3] }), { expr: 'worried', beardPh: beardPh(f, i + 50), blink: blinkAt(f, i + 50), L: 'belly', R: 'belly' }, P(x - 0.6, idleY(f, i + 50), z), { s: 1.1 })));
    }
    if (id === 's15b' && f >= 893) push(A(T, nob(2), { expr: f >= 900 ? 'proud' : 'happy', beardPh: beardPh(f, 2), L: f < 900 ? { x: 250, y: 300 } : 'hip', R: f < 900 ? { x: 350, y: 300 } : 'hip', detail: undefined, headTilt: -6, medal: true }, P(0, 0, -0.6), { s: NS }));
    if (id === 's16a' || id === 's16b') push(A(T, RICH, { expr: 'neutral', lookY: f > 990 ? 1 : 0, look: f > 990 ? 0.2 : 0, beardPh: beardPh(f, 5), L: 'hip', R: 'hip', blink: f > 990 ? 0 : blinkAt(f, 42) }, P(0.05, 0, -2.3), { s: 1.15 }));
  }
  if (S.set === 'snow') {
    const sl = ((f - 1024) * 0.07) % 40; push({ key: 'horse' + q(((f * 0.08) % 1), 1), draw: (p) => T.horseSled(p, q((f * 0.08) % 1, 1)), x: o[0] - 12 + sl, y: 0, z: -11.5, s: 1.8, flip: false, tint: TINT.snow, order: 2 });
    const guardO = id === 's17' ? { expr: 'determined', R: f >= 1036 ? { x: 470, y: 470 } : 'hang', holdR: f >= 1036 ? 'palm' : null, L: 'hip', look: 0.7, turn: 0.4 } : { expr: f < 1100 ? 'determined' : 'laugh', L: f < 1094 ? { x: 470, y: 380 } : 'hip', holdL: 'brush', R: 'up', holdR: 'scissors', turn: 0.3, look: 0.5 };
    const shaved = id === 's18' && f >= 1100;
    const search = id === 's17' && f >= 1040 && f < 1060, pullOut = id === 's17' && f >= 1060;
    const pO = shaved ? { spec: { ...PEASANT, bigBeard: null }, o: { expr: 'shock', shaved: true, L: { x: 262, y: 380 }, R: { x: 338, y: 380 } } }
      : { spec: PEASANT, o: { expr: pullOut ? 'goofy' : search ? 'scared' : 'worried', beardPh: beardPh(f, 7), sweat: search, L: search ? (Math.floor(f / 5) % 2 ? 'belly' : 'hip') : 'hang', R: pullOut ? { x: 480, y: 260 } : search ? (Math.floor(f / 5) % 2 ? 'hip' : 'belly') : 'hang', holdR: pullOut ? 'drumstick' : null, look: -0.6, turn: -0.3 } };
    push(A(T, pO.spec, { ...pO.o, blink: blinkAt(f, 61) }, P(0.55, idleY(f, 61) + (search ? 0.02 * Math.abs(Math.sin(f * 0.6)) : 0), -6.1), { s: 1.05 }));
    push(A(T, GUARD(0), { ...guardO, blink: blinkAt(f, 62) }, P(id === 's18' ? lerp(-0.9, -0.35, smooth(ramp(f, 1079, 1092))) : -0.3, idleY(f, 62), -6.3), { s: 1.12 }));
    push(A(T, GUARD(1), { expr: id === 's18' && f > 1100 ? 'laugh' : 'smug', blink: blinkAt(f, 63), L: 'hip', R: 'hip' }, P(-2.1, idleY(f, 63), -8.6), { s: 1.12 }));
    // market people (laugh in s18)
    [[1.5, -7.6, 0], [-1.2, -7.9, 1], [2.2, -9.4, 2], [-0.4, -9.9, 0]].forEach(([x, z, v], i) => { const lg = id === 's18' && f > 1104;
      push(A(T, VENDOR(v), { expr: lg ? 'laugh' : 'neutral', beardPh: beardPh(f, i + 70), blink: blinkAt(f, i + 70), L: lg ? 'belly' : 'hang', R: lg ? (i % 2 ? 'point' : 'belly') : 'hang', look: x > 0 ? -0.6 : 0.6 }, P(x, lg ? 0.03 * Math.abs(Math.sin(f * 0.5 + i)) : idleY(f, i + 70), z), { s: 1.05, roll: lg ? 0.05 * Math.sin(f * 0.5 + i) : 0, flip: x < 0 })); });
  }
  if (S.set === 'house') {
    const s19 = id === 's19', s20 = id === 's20', s21 = id === 's21a';
    const hold = s19 ? (f < 1206 ? 'beardpiece' : 'bundle') : null;
    const kiss = s20 && f >= 1292;
    const oO = { expr: kiss ? 'blissful' : 'tender', shaved: true, blush: true, blink: blinkAt(f, 81), L: s19 ? { x: 250, y: 470 } : s20 ? { x: 380, y: f < 1278 ? 520 : 600 } : 'hang', R: s19 ? { x: 370, y: 470 } : s20 ? { x: 560, y: f < 1278 ? 520 : 600 } : 'hang', holdR: hold, headTilt: q(6 + 3 * Math.sin(f * 0.05), 1), tilt: kiss ? 16 : s20 ? 9 : 4, look: s21 ? 0.8 : 0.3 };
    push(A(T, OLDMAN, oO, P(0.42, 0, -1.15), { s: 1.05 }));
  }
  if (S.set === 'heaven') {
    push(A(T, { ...OLDMAN, bigBeard: 'long', beardCol: '#f4f2ee' }, { expr: 'blissful', blink: 0, beardPh: q(Math.floor(f / 2) * 0.35, 1), R: f > 1380 ? { x: 470, y: 330 } : 'belly', L: 'belly', headTilt: q(4 * Math.sin(f * 0.07), 1), blush: true, rim: '#fff4c8', rimW: 7 }, P(0, 0.15 + 0.03 * Math.sin(f * 0.08), 0), { s: 1.15 }));
    [[-1.3, -0.9, 'fork', '#d8d4cc', '#6a4a8a'], [1.35, -0.8, 'curly', '#e8e4dc', '#3a6a8a'], [-0.6, -2.4, 'spade', '#c8c4bc', '#8a3a3a'], [0.9, -2.6, 'bushy', '#f0ece4', '#3a7a5a']].forEach(([x, z, st, bc, body], i) => {
      const wave = Math.floor((f + i * 7) / 8) % 2;
      push(A(T, { ...OLDMAN, body, bigBeard: st, beardCol: bc }, { expr: i % 2 ? 'happy' : 'laugh', beardPh: q(Math.floor(f / 2) * 0.3 + i, 1), R: wave ? 'wave' : { x: 480, y: 220 }, L: 'hang', blink: blinkAt(f, i + 90), rim: '#fff4c8' }, P(x, 0.1 + 0.03 * Math.sin(f * 0.08 + i), z), { s: 1.0, flip: x > 0 }));
    });
  }
  return out;
};
export const fxAt = (f, T) => [];
