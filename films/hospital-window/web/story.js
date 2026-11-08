// Shot plan: "Das Fenster" (hospital window study), timed to voice.mp3 (45.40 s) + 0.5 s tail = 45.90 s @ 30 fps.
// Phrase times (s), checked against the RMS envelope (cuts sit in the pauses):
//  0.00-0.87 Zwei Patienten. | 1.13-2.15 Gleiche Operation. | 2.40-3.08 Gleiches Zimmer. | 3.42-4.39 Gleiche Krankenschwestern. |
//  4.92-6.22 Nur eine Sache ist anders: | 6.53-7.13 das Fenster. | 7.58-9.03 Der eine schaut auf ein paar Bäume. |
//  9.39-10.87 Der andere auf eine braune Ziegelmauer. | 11.24-12.73 Ein Forscher wertet die Akten aus. |
//  13.04-14.70 Aber nur von Mai bis Oktober – | 14.92-16.07 dann tragen die Bäume Blätter. | 16.30-17.79 Und was er findet, |
//  17.94-18.60 ist verrückt. | 19.06-21.21 Die Mauer-Patienten brauchen mehr starke Schmerzmittel. |
//  21.55-24.38 Und die Schwestern notieren bei ihnen fast viermal so oft | 24.64-26.19 Sachen wie: „weint", „ist aufgewühlt", |
//  26.32-27.36 „braucht viel Zuspruch". | 27.56-28.38 Die Baum-Patienten? | 28.84-30.53 Gehen fast einen Tag früher nach Hause. |
//  30.94-32.12 Mit weniger Komplikationen. | 32.40-33.48 Kein neues Medikament. | 33.60-34.37 Keine Therapie. |
//  34.75-36.40 Nur ein anderer Blick aus dem Fenster. | 36.83-39.29 Diese Entdeckung hat verändert, wie Krankenhäuser gebaut werden: |
//  39.47-41.49 mit Gärten, Innenhöfen und Blick ins Grüne. | 41.90-42.21 Also … | 42.83-45.10 was siehst du gerade, wenn du von deinem Handy aufschaust?
import { M as E, ramp, clamp, lerp, lerp3, camFromKeys, idle, blinkAt, q } from './motion.js';

export const FPS = 30, TOTAL = 1377;
export const SHOTS = [
  { id: 'twoPatients', a: 0, b: 29 },      // M1 split
  { id: 'operation', a: 30, b: 67 },       // M2
  { id: 'sameRoom', a: 68, b: 139 },       // M1 split, mirrored nurse
  { id: 'window', a: 140, b: 219 },        // M1 split, push to the curtained windows
  { id: 'trees', a: 220, b: 275 },         // M3
  { id: 'wall', a: 276, b: 331 },          // M4
  { id: 'archive', a: 332, b: 385 },       // M5
  { id: 'select', a: 386, b: 443 },        // M5 time-lapse begins, folder picking
  { id: 'leaves', a: 444, b: 484 },        // M5 tree bursts into leaf
  { id: 'crazy', a: 485, b: 564 },         // M5 glasses off, papers fly
  { id: 'pills', a: 565, b: 640 },         // M6
  { id: 'notes', a: 641, b: 734 },         // M6 nurse writing
  { id: 'cry', a: 735, b: 787 },           // M6 B crying
  { id: 'comfort', a: 788, b: 823 },       // M6 nurse comforts
  { id: 'birds', a: 824, b: 857 },         // M7 A smiles at birds
  { id: 'pack', a: 858, b: 921 },          // M7 zip bag, wave
  { id: 'leave', a: 922, b: 967 },         // M7 out through the glass door
  { id: 'noDrug', a: 968, b: 1036 },       // M8 split
  { id: 'flyOut', a: 1037, b: 1097 },      // M8 fly through window A, B fades
  { id: 'building', a: 1098, b: 1180 },    // M9 glass building -> courtyard
  { id: 'courtyard', a: 1181, b: 1250 },   // M9 patients in the garden
  { id: 'phone', a: 1251, b: 1275 },       // M10 POV phone
  { id: 'lookUp', a: 1276, b: 1376 },      // M10 tilt to the window, flash
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- lights ----------
const BASE = { az: 30, el: 30, shadowExt: 5, fog: '#d8ecf8', fogNear: 40, fogFar: 260, skyTop: '#4f95e2', skyHor: '#d2ecfb', vig: 0.2 };
export const LIGHTS = {
  neutral: { ...BASE, sky: '#f4eee2', ground: '#8c8272', hemi: 3.4, sun: '#fff3e0', sunI: 1.3, sat: 1.0, gain: '#ffffff', tint: '#fbf8f2' },
  neutralWarm: { ...BASE, sky: '#f7eedc', ground: '#8c8068', hemi: 3.0, sun: '#ffe2b0', sunI: 1.4, sat: 1.05, gain: '#fff8ee', tint: '#fff8ec' },
  neutralCold: { ...BASE, sky: '#e4e6ea', ground: '#7a7c80', hemi: 2.9, sun: '#d8e2ee', sunI: 0.5, sat: 0.92, gain: '#f2f5fa', tint: '#f2f4f8', shadow: false },
  warm: { ...BASE, sky: '#fff0d6', ground: '#a08c62', hemi: 2.3, sun: '#ffd596', sunI: 3.4, sat: 1.18, gain: '#fff1dc', lift: '#0a0500', vig: 0.18, sunDisc: '#fff4d8', sunSize: 0.002, tint: '#fff1de' },
  cold: { ...BASE, sky: '#a9b8c9', ground: '#4c5058', hemi: 2.5, sun: '#b9c9dc', sunI: 0.35, az: 0, el: 25, shadow: false, sat: 0.6, gain: '#d4e0ec', lift: '#04070c', vig: 0.32, fog: '#8f9aa6', fogNear: 8, fogFar: 70, tint: '#c6d2de' },
  colder: { ...BASE, sky: '#98a8ba', ground: '#40444c', hemi: 2.2, sun: '#a9b9cc', sunI: 0.3, az: 0, el: 25, shadow: false, sat: 0.5, gain: '#c2cfdd', lift: '#03060a', vig: 0.42, fog: '#7f8a96', fogNear: 8, fogFar: 70, tint: '#b6c3d1' },
  or: { ...BASE, sky: '#eef8f2', ground: '#5e6e66', hemi: 2.4, sun: '#ffffff', sunI: 2.0, az: 90, el: 82, shadowExt: 6, sat: 1.0, gain: '#f4fff9', vig: 0.26, tint: '#f6fffa' },
  archive: { ...BASE, sky: '#d6c4a0', ground: '#3e3428', hemi: 1.35, sun: '#ffe2a8', sunI: 1.6, az: -95, el: 28, shadowExt: 6, sat: 1.0, gain: '#ffeccc', lift: '#060300', vig: 0.36,
    lamp: { pos: [-0.68, 1.15, -0.4], color: '#ffd38a', i: 2.4, d: 4.5 }, tint: '#fff0d6', skyTop: '#7fb0e0', skyHor: '#e9f2f6' },
  sunny: { ...BASE, sky: '#d8ecff', ground: '#8a9a60', hemi: 1.1, sun: '#fff0d0', sunI: 2.5, az: 70, el: 48, shadowExt: 12, sat: 1.15, gain: '#fff8ec', tint: '#fff6ea', sunDisc: '#fff6dc', sunSize: 0.002 },
  garden: { ...BASE, sky: '#d8ecff', ground: '#8a9a60', hemi: 1.1, sun: '#fff0d0', sunI: 2.4, az: 120, el: 52, shadowExt: 24, sat: 1.18, gain: '#fff6e6', tint: '#fff4e4', fogNear: 60, fogFar: 420, sunDisc: '#fff6dc', sunSize: 0.002 },
  pov: { ...BASE, sky: '#efe6d8', ground: '#6a5e50', hemi: 2.2, sun: '#ffe9c6', sunI: 1.6, az: -90, el: 22, shadowExt: 5, sat: 1.05, gain: '#fff6ea', vig: 0.3, tint: '#fff4e6' },
};
const Lx = (k, o = {}) => ({ ...LIGHTS[k], ...o });

// ---------- helpers ----------
const CM = 2.25;
const yOff = (designY, s) => (CM * 0.975 - designY * CM / 1000) * s;          // card origin -> design y, in metres
const hipSit = (T, seed) => 975 - 0.74 * 2 * T.headBlob(seed, 118, 0).b;     // design y of hips in sit mode
const A = (T, who, o, pos, ex = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.hosp(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...ex });
const FX = (key, draw, pos, s, ex = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...ex });
const K = (keys, f, o) => camFromKeys(keys, f, o);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const kick = (f, f0, a = 1) => { const d = f - f0; return d >= 0 && d < 8 ? a * Math.sin(d * 1.9) * (1 - d / 8) : 0; };
const SEED = 3;     // twins share the head shape
const BED = { x: 1.05, z: -2.0, s: 0.8, mat: 0.6 };
const patient = (T, who, o, L, f, ex = {}) => {
  const s = ex.s || BED.s, id = idle(f, who === 'patA' ? 1 : 2);
  const oo = { seed: SEED, sit: true, blink: blinkAt(f, who === 'patA' ? 4 : 9), headTilt: q(id.headTilt, 1), tilt: q(id.tilt * 0.5, 1), ...o };
  return A(T, who, oo, [BED.x + (ex.dx || 0), BED.mat - yOff(hipSit(T, SEED), s) + (ex.dy || 0), BED.z + (ex.dz || 0)], { s, tint: L.tint, ...ex });
};
const stand = (T, who, o, L, pos, f, s = 0.86, ex = {}) => {
  const id = idle(f, who.length + (pos[0] * 7 | 0));
  return A(T, who, { seed: ex.seed || 5, blink: blinkAt(f, who.length * 3 + 1), headTilt: q(id.headTilt, 1), tilt: q(id.tilt * 0.5, 1), ...o }, [pos[0], pos[1] - yOff(975, s) + (pos[1] === 0 ? 0 : 0), pos[2]], { s, tint: L.tint, ground: pos[1], ...ex });
};
// split-screen geometry: top view 0..1010 px, bottom view 1010..1920 px (divider stays below the text zone 250-650)
const SPLIT = 1010 / 1920;
const bird = (T, f, pos, s, i, col) => FX('bird' + i + q(((f * 0.18 + i * 0.37) % 1), 1), (p) => T.fxBird(p, ((f * 0.18 + i * 0.37) % 1), col), pos, s, { tint: '#ffffff' });

// ---------- room views ----------
// window on the +x wall (x 2.45, z -1.35..0.25, y 0.85..2.55); bed head at z -2.45, bed x 0.53..1.58.
const roomCam = (f, keys) => K(keys, f);
const birdsOutside = (T, f, L, out = []) => {
  out.push(bird(T, f, [3.75, 1.37 + 0.015 * Math.abs(Math.sin(f * 0.3)), -0.92], 0.34, 1, '#e9573f'));
  out.push(bird(T, f, [3.75, 1.42 + 0.015 * Math.abs(Math.sin(f * 0.27 + 1)), -0.42], 0.3, 2, '#f2a33a'));
  return out;
};
const leafDrift = (T, f, out, n = 6) => { for (let i = 0; i < n; i++) { const t = ((f * 0.008 + i / n) % 1); out.push(FX('lf' + (i % 3), (p) => T.fxLeaf(p, ['#7fb84a', '#b6c94a', '#5f9e3c'][i % 3]), [3.1 + i * 0.25, 2.7 - t * 2.4, -1.4 + t * 1.6 + Math.sin(t * 8 + i) * 0.3], 0.06, { roll: q(t * 9 + i, 1) })); } return out; };

function roomView(set, f, L, cam, actors, world, ex = {}) {
  return { set, light: L, cam, actors, world, dof: ex.dof || { focus: 3, cinf: 0 }, y0: ex.y0, y1: ex.y1, fade: ex.fade, flash: ex.flash };
}

// ---------- the views ----------
export const viewsAt = (f, T) => {
  const S = shotAt(f);
  switch (S.id) {
    // 1. two patients drop onto their beds at once (starts mid-action)
    case 'twoPatients': {
      const drop = (k) => { const t = clamp((f + 6) / 14); return 0.5 * (1 - E.easeIn(t)) - (t >= 1 ? 0.05 * Math.exp(-(f - 8) * 0.35) * Math.sin((f - 8) * 0.9) : 0); };
      const sq = q(f < 9 ? 0 : 0.03 * Math.exp(-(f - 9) * 0.3), 3);
      const cam = (y0) => roomCam(f, [{ f: 0, pos: [-0.2, 1.85, 0.95], look: [1.2, 1.72, -1.9], fov: 54 }, { f: 29, pos: [0.15, 1.8, 0.3], look: [1.15, 1.7, -1.95], fov: 50, ease: 'easeOut' }]);
      const camB = roomCam(f, [{ f: 0, pos: [-0.2, 1.55, 0.95], look: [1.2, 1.22, -1.9], fov: 50 }, { f: 29, pos: [0.15, 1.5, 0.3], look: [1.15, 1.2, -1.95], fov: 46, ease: 'easeOut' }]);
      const LA = LIGHTS.neutral, LB = LIGHTS.neutral;
      const a = [patient(T, 'patA', { expr: f < 10 ? 'shock' : 'neutral', bob: sq, L: f < 10 ? 'up' : 'hang', R: f < 10 ? 'up' : 'hang' }, LA, f, { dy: drop() })];
      const b = [patient(T, 'patB', { expr: f < 10 ? 'shock' : 'neutral', bob: sq, L: f < 10 ? 'up' : 'hang', R: f < 10 ? 'up' : 'hang' }, LB, f, { dy: drop() })];
      return [roomView('roomA', f, LA, cam(), a, { curtain: 0 }, { y0: 0, y1: SPLIT }), roomView('roomB', f, LB, camB, b, { curtain: 0 }, { y0: SPLIT, y1: 1 })];
    }
    // 2. operating room: two stretchers roll out of the same door, symmetric
    case 'operation': {
      const t = E.easeOut(ramp(f, 30, 67)), z = lerp(-2.9, 1.7, t);
      const L = LIGHTS.or;
      const cam = K([{ f: 30, pos: [0, 1.75, 5.6], look: [0, 1.25, -2.0], fov: 50 }, { f: 67, pos: [0, 1.62, 4.7], look: [0, 1.05, -1.0], fov: 46 }], f);
      const str = [[-0.75, 0, z], [0.75, 0, z]];
      const act = [];
      const sl = 0.62;
      act.push({ key: 'lyA' + blinkAt(f, 4), draw: (p) => T.lying(p, 'patA', { blink: blinkAt(f, 4), seed: SEED, expr: 'dazed' }), x: -0.75, y: 0.92 - yOff(950, sl), z: z - 0.55, s: sl, tint: L.tint, blob: false });
      act.push({ key: 'lyB' + blinkAt(f, 9), draw: (p) => T.lying(p, 'patB', { blink: blinkAt(f, 9), seed: SEED, expr: 'dazed' }), x: 0.75, y: 0.92 - yOff(950, sl), z: z - 0.55, s: sl, tint: L.tint, blob: false });
      act.push(stand(T, 'surgeon', { expr: 'focus', L: 'hang', R: 'up', look: 0 }, L, [0, 0, -3.7], f, 0.9));
      act.push(FX('orglow', (p) => T.fxGlow(p, '255,255,240', 0.9), [0, 1.9, -3.55], 2.2, { order: 6, depthWrite: false }));
      return [{ set: 'or', light: L, cam, actors: act, world: { doors: E.easeOut(ramp(f, 30, 40)), str }, dof: { focus: dist(cam.pos, [0, 1, z]), cinf: 4 } }];
    }
    // 3. same room, same nurse, same motion (mirror)
    case 'sameRoom': {
      const pk = f < 103 ? 0 : 1; // punch-in on "Gleiche Krankenschwestern"
      const camA = K([{ f: 68, pos: [-0.75, 1.85, 1.0], look: [0.7, 1.75, -1.8], fov: 54 }, { f: 102, pos: [-0.6, 1.83, 0.8], look: [0.7, 1.75, -1.8], fov: 52 },
        { f: 108, pos: [-0.3, 1.78, 0.15], look: [0.6, 1.72, -1.8], fov: 46, ease: 'easeOut' }, { f: 139, pos: [-0.25, 1.78, 0.05], look: [0.6, 1.72, -1.8], fov: 44 }], f);
      const camB = K([{ f: 68, pos: [-0.75, 1.55, 1.0], look: [0.7, 1.15, -1.8], fov: 50 }, { f: 102, pos: [-0.6, 1.53, 0.8], look: [0.7, 1.15, -1.8], fov: 48 },
        { f: 108, pos: [-0.3, 1.5, 0.15], look: [0.6, 1.15, -1.8], fov: 42, ease: 'easeOut' }, { f: 139, pos: [-0.25, 1.5, 0.05], look: [0.6, 1.15, -1.8], fov: 40 }], f);
      const LA = LIGHTS.neutral, LB = LIGHTS.neutral;
      const ph = (f - 68) / 18, fluff = Math.sin(ph * Math.PI * 2);
      const nurse = (L) => stand(T, 'nurse', { expr: 'kind', L: 'fluff', R: 'fluff', pat: q(ph % 1, 1), look: 0.6, headTilt: q(4 * fluff, 0) }, L, [0.32, 0, -1.95], f, 0.84, { seed: 6 });
      const pat = (who, L) => patient(T, who, { expr: 'neutral', look: -0.4 }, L, f, { dz: 0.05, dx: 0.12 });
      return [roomView('roomA', f, LA, camA, [pat('patA', LA), nurse(LA)], { curtain: 0, fluff: Math.max(0, fluff) }, { y0: 0, y1: SPLIT }),
        roomView('roomB', f, LB, camB, [pat('patB', LB), nurse(LB)], { curtain: 0, fluff: Math.max(0, fluff) }, { y0: SPLIT, y1: 1 })];
    }
    // 4. "only one thing is different: the window" — push toward the curtained windows
    case 'window': {
      const camA = K([{ f: 140, pos: [-0.45, 1.8, 1.05], look: [1.5, 1.7, -1.3], fov: 52 }, { f: 192, pos: [0.0, 1.78, 0.85], look: [2.45, 1.72, -0.6], fov: 52 },
        { f: 200, pos: [0.35, 1.76, 0.7], look: [2.45, 1.72, -0.55], fov: 47, ease: 'easeOut' }, { f: 219, pos: [0.42, 1.76, 0.66], look: [2.45, 1.72, -0.55], fov: 45 }], f);
      const camB = K([{ f: 140, pos: [-0.45, 1.6, 1.05], look: [1.5, 1.3, -1.3], fov: 50 }, { f: 192, pos: [0.0, 1.58, 0.85], look: [2.45, 1.5, -0.6], fov: 50 },
        { f: 200, pos: [0.35, 1.56, 0.7], look: [2.45, 1.5, -0.55], fov: 45, ease: 'easeOut' }, { f: 219, pos: [0.42, 1.56, 0.66], look: [2.45, 1.5, -0.55], fov: 43 }], f);
      const tremble = f > 196 ? 0.04 + 0.02 * Math.sin(f * 1.3) : 0;
      const LA = Lx('neutralWarm', { sunI: lerp(1.4, 2.2, ramp(f, 150, 219)) }), LB = LIGHTS.neutralCold;
      const pa = patient(T, 'patA', { expr: 'curious', look: 0.8 }, LA, f), pb = patient(T, 'patB', { expr: 'curious', look: 0.8 }, LB, f);
      return [roomView('roomA', f, LA, camA, [pa], { curtain: tremble }, { y0: 0, y1: SPLIT }), roomView('roomB', f, LB, camB, [pb], { curtain: tremble }, { y0: SPLIT, y1: 1 })];
    }
    // 5. M3: curtain opens on trees, birds, sun; A smiles
    case 'trees': {
      const op = E.easeOut(ramp(f, 220, 236));
      const L = Lx('warm', { sunI: lerp(1.4, 3.4, op), hemi: lerp(2.8, 2.3, op) });
      const cam = K([{ f: 220, pos: [0.95, 1.6, 0.9], look: [2.6, 1.7, -0.55], fov: 50 }, { f: 246, pos: [0.85, 1.6, 0.8], look: [2.5, 1.75, -0.6], fov: 48 },
        { f: 262, pos: [0.15, 1.55, 0.35], look: [1.1, 1.45, -2.0], fov: 46 }, { f: 275, pos: [0.2, 1.53, 0.2], look: [1.1, 1.45, -2.0], fov: 43 }], f);
      const act = [patient(T, 'patA', { expr: f < 248 ? 'curious' : 'glad', look: 0.9, blush: f > 252 }, L, f)];
      birdsOutside(T, f, L, act); leafDrift(T, f, act);
      return [roomView('roomA', f, L, cam, act, { curtain: op }, { dof: { focus: 2.5, cinf: 0 } })];
    }
    // 6. M4: curtain opens on the brick wall; B's face falls, short silent beat
    case 'wall': {
      const op = E.easeOut(ramp(f, 276, 292));
      const L = Lx('cold', { hemi: lerp(2.9, 2.5, op), sat: lerp(0.85, 0.6, op) });
      const cam = K([{ f: 276, pos: [0.95, 1.55, 0.9], look: [2.6, 1.7, -0.55], fov: 50 }, { f: 300, pos: [0.85, 1.55, 0.8], look: [2.6, 1.75, -0.6], fov: 47 },
        { f: 314, pos: [0.15, 1.5, 0.35], look: [1.1, 1.42, -2.0], fov: 46 }, { f: 331, pos: [0.25, 1.48, 0.1], look: [1.1, 1.42, -2.0], fov: 41 }], f);
      const act = [patient(T, 'patB', { expr: f < 300 ? 'curious' : f < 312 ? 'worried' : 'sad', look: f < 312 ? 0.9 : 0.2 }, L, f, { dy: f > 312 ? -0.02 : 0 })];
      act.push(FX('drip', (p) => T.fxDrop(p), [4.95, 2.6 - ((f - 276) % 40) * 0.05, -1.62], 0.05));
      return [roomView('roomB', f, L, cam, act, { curtain: op })];
    }
    // 7. M5 archive: the researcher dives into the files, dust rises
    case 'archive': case 'select': case 'leaves': case 'crazy': return archiveView(f, S, T);
    // 10-11. M6 wall room getting worse
    case 'pills': case 'notes': case 'cry': case 'comfort': return wallRoom(f, S, T);
    // 12-13. M7 tree room, recovery
    case 'birds': {
      const L = LIGHTS.warm;
      const cam = K([{ f: 824, pos: [-2.2, 1.62, -0.95], look: [1.8, 1.55, -1.6], fov: 60 }, { f: 857, pos: [-1.85, 1.62, -0.97], look: [1.8, 1.57, -1.6], fov: 57 }], f);
      const act = [patient(T, 'patA', { expr: f < 836 ? 'smile' : 'glad', look: -0.9, blush: true, headTilt: q(4 + 2 * Math.sin(f * 0.2), 1) }, L, f)];
      birdsOutside(T, f, L, act); leafDrift(T, f, act);
      return [roomView('roomA', f, L, cam, act, { curtain: 1 })];
    }
    case 'pack': {
      const L = LIGHTS.warm, zip = E.smooth(ramp(f, 860, 884)), wave = f > 888;
      const cam = K([{ f: 858, pos: [-0.35, 1.6, 3.2], look: [-0.35, 1.3, -0.8], fov: 46 }, { f: 921, pos: [-0.38, 1.58, 2.75], look: [-0.38, 1.3, -0.8], fov: 44 }], f);
      const act = [stand(T, 'patA', { seed: SEED, expr: wave ? 'glad' : 'smile', bag: q(zip, 2), L: wave ? 'wave' : 'zip', R: 'zip', zip: q(zip, 2), wv: q(f * 0.6, 1), look: wave ? -0.8 : 0 }, L, [0.3, 0, -1.2], f, 0.86)];
      act.push(stand(T, 'nurse', { expr: 'kind', L: 'clip', R: wave ? 'wave' : 'hang', wv: q(f * 0.55 + 1, 1), lines: 3 }, L, [-1.05, 0, -0.35], f, 0.84, { seed: 6 }));
      return [roomView('roomA', f, L, cam, act, { curtain: 1 })];
    }
    case 'leave': {
      const L = LIGHTS.sunny, t = ramp(f, 922, 967), z = lerp(-1.6, 1.9, t);
      const cam = K([{ f: 922, pos: [0.25, 1.45, 6.2], look: [0, 1.35, 0], fov: 46 }, { f: 967, pos: [0.15, 1.38, 5.5], look: [0, 1.3, 0.8], fov: 44 }], f);
      const ph = (f * 0.06) % 1;
      const act = [stand(T, 'patA', { seed: SEED, expr: 'glad', step: q(ph, 2), bag: 1, L: f > 948 ? 'wave' : 'hang', R: 'hang', wv: q(f * 0.6, 1), blush: true }, L, [0, 0, z], f, 0.86)];
      act.push(bird(T, f, [-2.4 + (f - 922) * 0.05, 3.2 + 0.2 * Math.sin(f * 0.2), 3.5], 0.18, 3, '#e9573f'));
      return [{ set: 'exit', light: L, cam, actors: act, world: { doors: E.easeOut(ramp(f, 922, 936)) }, dof: { focus: dist(cam.pos, [0, 1.3, z]), cinf: 5 } }];
    }
    // 14. split: two patients side by side
    case 'noDrug': {
      const camA = K([{ f: 968, pos: [-0.55, 1.62, 0.7], look: [1.1, 1.5, -1.8], fov: 48 }, { f: 1005, pos: [-0.35, 1.6, 0.45], look: [1.1, 1.5, -1.8], fov: 46 },
        { f: 1010, pos: [0.05, 1.56, -0.2], look: [1.1, 1.5, -1.95], fov: 42, ease: 'easeOut' }, { f: 1036, pos: [0.1, 1.55, -0.3], look: [1.1, 1.5, -1.95], fov: 40 }], f);
      const camB = K([{ f: 968, pos: [-0.55, 1.42, 0.7], look: [1.1, 1.18, -1.8], fov: 46 }, { f: 1005, pos: [-0.35, 1.4, 0.45], look: [1.1, 1.18, -1.8], fov: 44 },
        { f: 1010, pos: [0.05, 1.38, -0.2], look: [1.1, 1.2, -1.95], fov: 40, ease: 'easeOut' }, { f: 1036, pos: [0.1, 1.37, -0.3], look: [1.1, 1.2, -1.95], fov: 38 }], f);
      const LA = LIGHTS.warm, LB = LIGHTS.cold;
      const a = [patient(T, 'patA', { expr: 'glad', look: 0.2, blush: true }, LA, f)]; birdsOutside(T, f, LA, a);
      const b = [patient(T, 'patB', { expr: 'sad', look: 0.4 }, LB, f)];
      return [roomView('roomA', f, LA, camA, a, { curtain: 1 }, { y0: 0, y1: SPLIT }), roomView('roomB', f, LB, camB, b, { curtain: 1 }, { y0: SPLIT, y1: 1 })];
    }
    // 15. fly out of window A into the trees; B side fades away
    case 'flyOut': {
      const t = ramp(f, 1037, 1097), sp = lerp(SPLIT, 0.985, E.smooth(ramp(f, 1050, 1097)));
      const camA = K([{ f: 1037, pos: [0.3, 1.7, 0.4], look: [2.45, 1.7, -0.55], fov: 46 }, { f: 1066, pos: [1.9, 1.72, -0.5], look: [4.5, 1.9, -0.6], fov: 48 },
        { f: 1097, pos: [5.6, 2.5, -0.9], look: [11, 3.4, -0.6], fov: 52, ease: 'easeIn' }], f);
      const camB = K([{ f: 1037, pos: [0.3, 1.5, 0.4], look: [2.45, 1.45, -0.55], fov: 44 }, { f: 1097, pos: [0.5, 1.5, 0.3], look: [2.45, 1.45, -0.55], fov: 42 }], f);
      const LA = LIGHTS.warm, LB = Lx('colder', {});
      const a = [patient(T, 'patA', { expr: 'glad', look: 0.9 }, LA, f)]; birdsOutside(T, f, LA, a); leafDrift(T, f, a, 8);
      for (let i = 0; i < 3; i++) a.push(bird(T, f, [7 + i * 1.3 + (f - 1037) * 0.04, 3.4 + i * 0.4 + 0.2 * Math.sin(f * 0.2 + i), -1.5 + i * 0.9], 0.22, 10 + i, ['#e9573f', '#f2a33a', '#4f8fd9'][i]));
      const b = [patient(T, 'patB', { expr: 'sad', look: 0.6 }, LB, f)];
      return [roomView('roomA', f, LA, camA, a, { curtain: 1 }, { y0: 0, y1: sp }), roomView('roomB', f, LB, camB, b, { curtain: 1 }, { y0: sp, y1: 1, fade: lerp(0.1, 0.85, t) })];
    }
    // 16. healing-garden hospital
    case 'building': {
      const L = LIGHTS.garden;
      const cam = K([{ f: 1098, pos: [-9, 2.2, 36], look: [-2, 7.5, 19], fov: 52 }, { f: 1180, pos: [-3.0, 14.5, 7.5], look: [-0.5, 0.5, -1.5], fov: 50, path: [[-7, 9, 27], [-5.5, 15, 17]] }], f);
      const act = [stand(T, 'granny', { sit: true, chair: true, expr: 'serene', blink: 1, lap: '#8fae6a' }, L, [-2.6, 0, 4.0], f, 0.82, { seed: 8 }),
        stand(T, 'youngman', { crutch: q((f * 0.03) % 1, 2), L: 'crutch', R: 'crutch', expr: 'smile', step: q((f * 0.03) % 1, 2) }, L, [1.6 - (f - 1098) * 0.01, 0, 2.6], f, 0.86, { seed: 11 }),
        stand(T, 'nurse2', { expr: 'kind', L: 'push', R: 'hang' }, L, [-3.4, 0, 3.6], f, 0.84, { seed: 12 })];
      act.push(FX('spray' + q((f * 0.05) % 1, 2), (p) => T.fxSpray(p, (f * 0.05) % 1), [0, 1.2, 0], 0.9, { order: 4 }));
      return [{ set: 'garden', light: L, cam, actors: act, world: {}, dof: { focus: 20, cinf: 0 } }];
    }
    case 'courtyard': {
      const L = LIGHTS.garden;
      const cam = K([{ f: 1181, pos: [-6.2, 1.5, 9.0], look: [-1.2, 1.2, 2.8], fov: 46 }, { f: 1250, pos: [-4.4, 1.45, 8.3], look: [-0.6, 1.25, 2.6], fov: 42 }], f);
      const act = [stand(T, 'granny', { sit: true, chair: true, expr: 'serene', blink: 1, lap: '#8fae6a', headTilt: -6 }, L, [-2.6, 0, 4.0], f, 0.82, { seed: 8 }),
        stand(T, 'youngman', { crutch: q((f * 0.03) % 1, 2), L: 'crutch', R: 'crutch', expr: 'smile', step: q((f * 0.03) % 1, 2), look: -0.6 }, L, [0.9 - (f - 1181) * 0.012, 0, 2.3], f, 0.86, { seed: 11 }),
        stand(T, 'nurse2', { expr: 'kind', L: 'push', R: 'hang', look: 0.5 }, L, [-3.35, 0, 3.4], f, 0.84, { seed: 12 })];
      act.push(FX('spray' + q((f * 0.05) % 1, 2), (p) => T.fxSpray(p, (f * 0.05) % 1), [0, 1.2, 0], 0.9, { order: 4 }));
      for (let i = 0; i < 2; i++) act.push(bird(T, f, [-1 + i * 2 + Math.sin(f * 0.02 + i) * 2, 4.5 + i, -2 + (f - 1181) * 0.03], 0.3, 20 + i, ['#e9573f', '#f2a33a'][i]));
      return [{ set: 'garden', light: L, cam, actors: act, world: {}, dof: { focus: dist(cam.pos, [-2.0, 1.2, 3.6]), cinf: 6 } }];
    }
    // 17. POV: phone, then look up at a window
    case 'phone': case 'lookUp': {
      const L = LIGHTS.pov, ph = S.id === 'phone';
      const cam = ph ? K([{ f: 1251, pos: [0, 1.3, 1.25], look: [0, 0.62, 0.5], fov: 50 }, { f: 1275, pos: [0, 1.28, 1.2], look: [0, 0.6, 0.45], fov: 47 }], f)
        : K([{ f: 1276, pos: [0, 1.3, 1.15], look: [0, 0.64, 0.42], fov: 48 }, { f: 1326, pos: [0, 1.38, 1.1], look: [0, 1.62, -2.2], fov: 50, ease: 'smooth' }, { f: 1376, pos: [0, 1.42, 0.7], look: [0, 1.66, -2.2], fov: 44 }], f);
      const vib = ph && f > 1256 && f < 1270 ? (f % 2 ? 0.006 : -0.006) : 0;
      const pp = [0 + vib, 0.5, 0.62], s = 0.42;
      const pitch = -Math.atan2(cam.pos[1] - (pp[1] + 0.25), cam.pos[2] - pp[2]);
      const act = [{ key: 'hands' + (ph ? 1 : 0), draw: (p) => T.phoneHands(p, { glow: 1 }), x: pp[0], y: pp[1] - yOff(1000, s) - 0.2, z: pp[2], s, pitch, blob: false, shadow: false, tint: '#fff6ea', order: 3 }];
      if (!ph) act.push(FX('sunglow', (p) => T.fxGlow(p, '255,240,205', 1), [0.25, 1.9, -2.6], lerp(0.6, 3.2, E.easeIn(ramp(f, 1330, 1376))), { order: 6, depthWrite: false }));
      const flash = ph ? 0 : 0.75 * E.easeIn(ramp(f, 1350, 1376));
      const near = ph ? 0 : ramp(f, 1300, 1330);
      return [{ set: 'pov', light: L, cam, actors: act, world: {}, flash, flashCol: '#fff6e0', dof: { focus: ph ? dist(cam.pos, pp) : lerp(dist(cam.pos, pp), dist(cam.pos, [0, 1.6, -2.2]), near), cinf: ph ? 5 : 12 } }];
    }
  }
  return [];
};

// ---------- archive (M5) ----------
function archiveView(f, S, T) {
  const L = LIGHTS.archive, out = [];
  let cam, leaves = 0, folders = [], resO = {}, dof = { focus: 2.6, cinf: 0 };
  const R0 = [0.05, 0, -1.28];
  const stack = (i) => [0.62, 0.05 + i * 0.05, 0.05, 0];
  const motes = (n = 16) => { for (let i = 0; i < n; i++) { const r = (k) => ((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) % 1; const t = (f * 0.004 + r(1)) % 1;
    out.push(FX('mote', (p) => T.fxMote(p, 0.8), [-1.3 + r(2) * 2.8 + Math.sin(f * 0.02 + i) * 0.1, 0.9 + t * 1.9, -1.9 + r(3) * 2.6], 0.035, { order: 6, depthWrite: false })); } };
  switch (S.id) {
    case 'archive': {
      cam = K([{ f: 332, pos: [0.4, 1.9, 2.9], look: [0, 1.15, -1.4], fov: 54 }, { f: 385, pos: [0.15, 1.55, 1.55], look: [0, 1.2, -1.2], fov: 46, ease: 'easeOut' }], f);
      const dive = E.back(ramp(f, 336, 350));
      resO = { expr: f < 348 ? 'curious' : 'focus', L: f < 352 ? 'up' : 'cross', R: f < 352 ? 'up' : 'lens', tilt: q(-6 * dive, 1), bob: q(0.03 * dive, 3), look: 0.2 };
      folders = [0, 1, 2, 3, 4, 5].map((i) => [0.15 + (i % 3) * 0.12 - 0.25, 0.04 + Math.floor(i / 3) * 0.04, 0.05 + (i % 2) * 0.04, (i - 2.5) * 0.15]);
      if (f >= 346) { const k = q(ramp(f, 346, 385), 2); out.push(FX('dust' + k, (p) => T.fxDust(p, k, '#e8dcc4'), [0.15, 0.8, -0.35], 0.42, { order: 6, depthWrite: false, alpha: 0.6 })); }
      motes(); dof = { focus: dist(cam.pos, [0, 1.4, -1.2]), cinf: 3 };
      break;
    }
    case 'select': {
      cam = K([{ f: 386, pos: [-1.15, 1.55, 1.35], look: [0.55, 1.65, -2.4], fov: 50 }, { f: 443, pos: [-0.95, 1.6, 1.0], look: [0.7, 1.7, -2.5], fov: 46 }], f);
      leaves = 0.45 * E.smooth(ramp(f, 392, 443));
      const pick = [0, 2, 4], k = (i) => E.smooth(ramp(f, 392 + i * 7, 406 + i * 7));
      folders = [0, 1, 2, 3, 4, 5].map((i) => { const a = [-0.1 + (i % 3) * 0.12, 0.04 + Math.floor(i / 3) * 0.04, 0.05 + (i % 2) * 0.04, (i - 2.5) * 0.15];
        const b = pick.includes(i) ? [-0.15 + pick.indexOf(i) * 0.04, 0.0 + pick.indexOf(i) * 0.036, -0.22, 0.05 * pick.indexOf(i)] : [0.62, 0.32 + (i % 3) * 0.05, 0.05, 0.1];
        return a.map((v, j) => lerp(v, b[j], k(i))); });
      const reach = Math.floor((f - 392) / 7) % 2 === 0;
      resO = { expr: 'focus', L: 'hang', R: reach ? 'reach' : 'cross', look: 0.3, tilt: q(reach ? -4 : 0, 0) };
      motes(); dof = { focus: dist(cam.pos, [0.05, 1.4, -1.28]), cinf: 2.5 };
      break;
    }
    case 'leaves': {
      cam = K([{ f: 444, pos: [0.85, 1.85, -0.35], look: [1.5, 2.3, -3.2], fov: 46 }, { f: 484, pos: [1.2, 1.95, -1.45], look: [1.55, 2.35, -3.2], fov: 40, ease: 'easeIn' }], f);
      leaves = lerp(0.45, 1, E.easeOut(ramp(f, 446, 476)));
      folders = [0, 1, 2, 3, 4, 5].map((i) => [0.62, 0.32 + (i % 3) * 0.05, 0.05, 0.1]);
      resO = { expr: 'curious', look: 0.6 };
      for (let i = 0; i < 8; i++) { const t = ((f - 444) * 0.025 + i / 8) % 1; out.push(FX('lfA' + (i % 3), (p) => T.fxLeaf(p, ['#7fb84a', '#b6c94a', '#5f9e3c'][i % 3]), [1.0 + i * 0.15, 2.9 - t * 1.6, -4.0 + Math.sin(i) * 0.3], 0.12, { roll: q(t * 9 + i, 1) })); }
      dof = { focus: dist(cam.pos, [1.5, 2.1, -3.1]), cinf: 0 };
      break;
    }
    case 'crazy': {
      const hit = 538;
      cam = K([{ f: 485, pos: [0.25, 1.5, 1.25], look: [0.05, 1.3, -1.3], fov: 42 }, { f: 536, pos: [0.15, 1.5, 0.95], look: [0.05, 1.32, -1.3], fov: 39 },
        { f: 542, pos: [0.08, 1.48, 0.15], look: [0.05, 1.36, -1.3], fov: 36, ease: 'easeOut' }, { f: 564, pos: [0.06, 1.48, 0.05], look: [0.05, 1.36, -1.3], fov: 34 }], f);
      cam.roll = (cam.roll || 0) + kick(f, hit, 1.6);
      leaves = 1;
      folders = [0, 1, 2, 3, 4, 5].map((i) => [-0.15 + (i % 3) * 0.04, (i % 3) * 0.036, -0.22, 0.05 * i]);
      const after = f >= hit;
      resO = after ? { expr: 'amazed', L: 'hang', R: 'glassesOff', noGlasses: true, look: 0, bob: q(-0.02 * Math.exp(-(f - hit) * 0.2), 3) }
        : { expr: f < 512 ? 'focus' : 'curious', L: 'hang', R: 'lens', look: 0.2, headTilt: q(5 * Math.sin(f * 0.15), 1) };
      if (after) for (let i = 0; i < 9; i++) { const t = (f - hit) / 26, a = i * 0.7; out.push(FX('paper' + (i % 2), (p) => T.fxPaper(p), [0.05 + Math.sin(a) * (0.35 + t * 0.8), 0.95 + t * 1.5 - t * t * 0.6 + (i % 3) * 0.1, -0.85 + Math.cos(a) * 0.25], 0.16, { roll: q(t * 5 * (i % 2 ? 1 : -1) + i, 1), order: 6 })); }
      motes(10); dof = { focus: dist(cam.pos, [0.05, 1.7, -1.28]), cinf: 4 };
      break;
    }
  }
  const id = idle(f, 4);
  out.push(A(T, 'researcher', { seed: 7, blink: blinkAt(f, 13), headTilt: q(id.headTilt, 1), ...resO }, [R0[0], R0[1] - yOff(975, 0.92), R0[2]], { s: 0.92, tint: L.tint }));
  return [{ set: 'archive', light: L, cam, actors: out, world: { leaves, folders }, dof }];
}

// ---------- wall room getting worse (M6) ----------
function wallRoom(f, S, T) {
  const L = LIGHTS.colder, out = [];
  let cam, pills = 0, dof = { focus: 2, cinf: 0 };
  const tickF = [570, 590, 610, 630, 680, 760, 800];
  pills = tickF.filter((t) => f >= t).length; const last = tickF.filter((t) => f >= t).pop(); if (last !== undefined) pills = pills - 1 + clamp((f - last) / 4);
  switch (S.id) {
    case 'pills': {
      cam = K([{ f: 565, pos: [-0.75, 1.15, -0.95], look: [0.12, 0.72, -2.2], fov: 46 }, { f: 640, pos: [-0.35, 1.2, -1.15], look: [0.45, 0.85, -2.2], fov: 42 }], f);
      cam.roll = 3 * Math.sin(f * 0.03);
      out.push(patient(T, 'patB', { expr: 'sad', look: -0.5 }, L, f));
      dof = { focus: dist(cam.pos, [0.12, 0.75, -2.2]), cinf: 6 };
      break;
    }
    case 'notes': {
      cam = K([{ f: 641, pos: [-0.95, 1.6, 0.55], look: [0.25, 1.5, -1.4], fov: 46 }, { f: 734, pos: [-0.65, 1.55, 0.1], look: [0.3, 1.45, -1.4], fov: 40 }], f);
      const lines = 2 + (f - 641) * 0.1;
      out.push(stand(T, 'nurse', { expr: 'worried', L: 'clip', R: 'write', pen: q(((f - 641) * 0.04) % 1, 2), lines: q(lines, 0), look: 0.2 }, L, [0.2, 0, -1.3], f, 0.84, { seed: 6 }));
      out.push(patient(T, 'patB', { expr: 'sad', look: -0.6 }, L, f));
      dof = { focus: dist(cam.pos, [0.2, 1.5, -1.3]), cinf: 5 };
      break;
    }
    case 'cry': {
      cam = K([{ f: 735, pos: [0.3, 1.55, -0.1], look: [1.05, 1.32, -2.0], fov: 46 }, { f: 787, pos: [0.42, 1.52, -0.4], look: [1.05, 1.34, -2.0], fov: 41, roll: -3 }], f);
      out.push(patient(T, 'patB', { expr: 'cry', hug: true, L: 'hug', R: 'hug', tears: q(((f - 735) * 0.05) % 1, 2), bob: q(0.012 * Math.abs(Math.sin(f * 0.45)), 3), headTilt: q(-6 + 3 * Math.sin(f * 0.45), 1) }, L, f));
      dof = { focus: dist(cam.pos, [1.05, 1.42, -2.0]), cinf: 6 };
      break;
    }
    case 'comfort': {
      cam = K([{ f: 788, pos: [-0.35, 1.5, 0.15], look: [0.8, 1.38, -1.9], fov: 46 }, { f: 823, pos: [-0.15, 1.48, -0.1], look: [0.8, 1.38, -1.9], fov: 42 }], f);
      out.push(patient(T, 'patB', { expr: f < 806 ? 'cry' : 'sad', hug: true, L: 'hug', R: 'hug', tears: q(((f - 735) * 0.05) % 1, 2), look: -0.6 }, L, f));
      out.push(stand(T, 'nurse', { expr: 'kind', L: 'clip', R: 'pat', pat: q((f * 0.05) % 1, 2), lines: 10, look: 0.6, headTilt: 6 }, L, [0.32, 0, -1.6], f, 0.84, { seed: 6 }));
      dof = { focus: dist(cam.pos, [0.6, 1.4, -1.8]), cinf: 4 };
      break;
    }
  }
  return [{ set: 'roomB', light: L, cam, actors: out, world: { curtain: 1, pills }, dof }];
}

// kit-compatible exports (single-view helpers)
export const camAt = (f) => null; export const dofAt = () => ({ focus: 5, cinf: 0 }); export const lightFor = (S) => LIGHTS.neutral;
export const worldAt = () => ({}); export const actorsAt = () => []; export const fxAt = () => [];
