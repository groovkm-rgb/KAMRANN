// "Tochter-Ausbruch" — 53.6 s German voice-over, 31 shots. No captions; scene text German only.
// Phrase times (30 fps frames, from work/phrases.json, checked against the audio):
//   0-57 Ein Häftling läuft Richtung Gefängnisausgang | 67-103 Langes schwarzes Haar | 113-126 Brille | 130-176 ein pinkes T-Shirt mit Donuts drauf
//   183-215 Ein junges Mädchen | 226-252 Genauer gesagt | 258-295 seine eigene Tochter | 311-364 Er soll noch über siebzig Jahre absitzen | 376-406 Und er hat einen Plan
//   416-475 Seine neunzehnjährige Tochter kommt zu Besuch | 485-577 Irgendwie landen (485) eine Perücke (508) eine Brille (528) und eine Silikonmaske (546) bei ihm
//   590-610 Er zieht sich um | 620-650 Sie bleibt in seiner Zelle | 659-721 Und er geht nach der Besuchszeit Richtung Ausgang | 734-747 Als sie
//   764-798 Fast hätte es geklappt | 808-846 Aber den Wärtern fällt was auf | 857-896 Dieses Mädchen ist irgendwie | 910-930 nervös | 944-972 Viel zu nervös
//   987-1009 Sie halten ihn an | 1021-1070 Ein Wärter zieht die Perücke (1050) runter | 1074-1141 Darunter: eine glatte Glatze aus Silikon | 1153-1189 Dann zieht er die Maske (1177) ab
//   1202-1222 Und darunter | 1228-1268 ein Mann in den Vierzigern | 1281-1332 Das Video geht um die ganze Welt | 1341-1373 Und das Verrückteste
//   1383-1435 Es war nicht mal sein erster Ausbruchsversuch | 1442-1545 Jahre vorher ist er schon mal mit dreißig anderen Häftlingen abgehauen | 1556-1596 durch die Kanalisation
import { OFF } from './scene.js';
import { GIRL, DISG, BALD, UNMASK, DAD, DADMUD, G1, G2, G3, G4, VIS, CON } from './cast_specs.js';
export const FPS = 30, TOTAL = 1622;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const eo = (t) => 1 - (1 - clamp(t)) ** 3.2;
const back = (t) => { t = clamp(t); const c = 2.2; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; };
const lerp = (a, b, t) => a + (b - a) * t, l3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t)), ramp = (f, a, b) => clamp((f - a) / (b - a));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const hsh = (n) => { const x = Math.sin(n * 127.1 + 3.7) * 43758.5453; return x - Math.floor(x); };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const CMH = 2.25;
/** world point -> design px of an actor card (for arm targets) */
const des = (ax, ay, s, wx, wy, b = 0.6) => ({ x: q(clamp(300 + (wx - ax) / (CMH * s) * 1000, 6, 594), 0), y: q(975 - (wy - ay) / (CMH * s) * 1000, 0), b });
const blinkAt = (f, seed) => { const per = 40 + (seed * 17) % 30, ph = (Math.floor(f) + seed * 13) % per; return ph < 3 ? 1 : 0; };
const step = (f, per) => q(((Math.floor(f) % per) + per) % per / per, 3);
const wbob = (f, per, a = 0.012) => q(Math.abs(Math.sin(Math.floor(f) / per * Math.PI * 2)) * a, 3);

// ---------- lights ----------
const BASE = { az: 100, el: 68, sky: '#d2ead6', ground: '#5c7264', hemi: 1.3, sun: '#eaffea', sunI: 0.95, fog: '#a8c2b0', fogNear: 7, fogFar: 44, skyTop: '#bcd0c0', skyHor: '#bcd0c0', sat: 1.14,
  gain: '#f1fff0', lift: '#020503', waterDeep: '#3a4420', waterShal: '#6a6a34', glint: '#c8c890', vig: 0.3, shadowExt: 9, ink: 1.5 };
export const LIGHTS = {
  cor: { ...BASE }, door: { ...BASE, sky: '#f4e6c8', gain: '#fff4dc', sat: 1.2, fog: '#c8c4a0' },
  cell: { ...BASE, az: 262, el: 52, sky: '#c8d8ea', ground: '#48545e', hemi: 1.05, sun: '#e2f0ff', sunI: 1.35, fog: '#8494a2', fogNear: 4, fogFar: 26, gain: '#eef4ff', lift: '#020308', vig: 0.36, shadowExt: 6 },
  vis: { ...BASE, sky: '#e2efe0', hemi: 1.42, sunI: 1.1, az: 200, el: 60, fog: '#b4c8b8', fogNear: 9, fogFar: 50, vig: 0.26 },
  under: { ...BASE, sky: '#c8dcd0', hemi: 1.05, sunI: 0.5, fog: '#7a9486', fogNear: 3, fogFar: 22, vig: 0.42, gain: '#eefaf0' },
  split: { ...BASE, sky: '#ffffff', ground: '#9ab0a8', hemi: 1.55, sunI: 1.2, fog: '#ffffff', fogNear: 60, fogFar: 300, sat: 1.22, gain: '#ffffff', lift: '#000000', vig: 0.14 },
  viral: { ...BASE, sky: '#90a0ff', ground: '#2a2a60', hemi: 1.25, sun: '#ffffff', sunI: 1.7, az: 60, el: 40, fog: '#141a44', fogNear: 30, fogFar: 200, skyTop: '#0a0e2c', skyHor: '#2a3272', sat: 1.3, gain: '#ffffff', lift: '#03020a', vig: 0.3, shadowExt: 12 },
  sewer: { ...BASE, sky: '#9aa878', ground: '#2c3222', hemi: 1.1, sun: '#ffd8a0', sunI: 0.7, fog: '#3c3a22', fogNear: 4, fogFar: 30, sat: 0.42, gain: '#ffe4b6', lift: '#100a03', vig: 0.42, ink: 1.8 },
  street: { ...BASE, az: 205, el: 48, sky: '#8090c0', ground: '#34344a', hemi: 0.95, sun: '#c8d4ff', sunI: 1.0, fog: '#2c2c44', fogNear: 18, fogFar: 110, skyTop: '#141a38', skyHor: '#3c3c5e', sat: 0.42, gain: '#ffe4b6', lift: '#100a03', vig: 0.4, shadowExt: 10 },
};
const TINT = { cor: '#e4f3e6', door: '#fff0d8', cell: '#e4ecf8', vis: '#eef6ee', under: '#a9bfb2', split: '#ffffff', viral: '#ffffff', sewer: '#e0d0a8', street: '#cfc8c0' };

// ---------- actor helpers ----------
const OFFC = {};
const rimDraw = (T, spec, o, rim) => (p) => {
  if (!rim) return T.toonChar(p, spec, o);
  const g = p.g, cw = g.canvas.width, ch = g.canvas.height, k = cw + 'x' + ch;
  const A = OFFC[k] || (OFFC[k] = [0, 1].map(() => { const c = document.createElement('canvas'); c.width = cw; c.height = ch; return c; }));
  const ga = A[0].getContext('2d'), gb = A[1].getContext('2d');
  ga.setTransform(1, 0, 0, 1, 0, 0); ga.clearRect(0, 0, cw, ch); ga.setTransform(cw / 600, 0, 0, ch / 1000, 0, 0); T.toonChar(new T.Pen(ga), spec, o);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(A[0], 0, 0);
  for (const [side, col, a, w] of [[rim.side, rim.col, rim.a ?? 0.9, rim.w ?? 9], ...(rim.col2 ? [[-rim.side, rim.col2, rim.a2 ?? 0.7, rim.w2 ?? 7]] : [])]) {
    const d = w * cw / 600; gb.setTransform(1, 0, 0, 1, 0, 0); gb.globalCompositeOperation = 'source-over'; gb.clearRect(0, 0, cw, ch); gb.drawImage(A[0], 0, 0);
    gb.globalCompositeOperation = 'destination-out'; gb.drawImage(A[0], -side * d, d * 0.3); gb.globalCompositeOperation = 'source-in'; gb.fillStyle = `rgba(${col},${a})`; gb.fillRect(0, 0, cw, ch);
    g.globalCompositeOperation = 'source-atop'; g.drawImage(A[1], 0, 0); }
  g.restore();
};
let LT = 'cor';
const A = (T, spec, o, pos, ex = {}) => ({ key: (spec._id || 'x') + JSON.stringify(o) + (ex.rim ? JSON.stringify(ex.rim) : ''), draw: rimDraw(T, spec, o, ex.rim), x: pos[0], y: pos[1], z: pos[2], tint: TINT[LT], ...ex });
const F = (key, draw, pos, s, ex = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...ex });
const RIMG = { side: 1, col: '200,255,215', a: 0.85, w: 8 }, RIMW = { side: -1, col: '255,214,130', a: 0.95, w: 10 }, RIMB = { side: -1, col: '190,220,255', a: 0.9, w: 9 };
const RIM2 = { side: 1, col: '255,220,140', a: 0.95, w: 10, col2: '255,200,120', a2: 0.8, w2: 8 };

// =====================================================================================================
// shots
// =====================================================================================================
const SH = [];
const shot = (id, a, light, o) => SH.push({ id, a, light, ...o });
const cx = OFF.cor, ce = OFF.cell, vi = OFF.vis, sp = OFF.split, vr = OFF.viral, sw = OFF.sewer, st = OFF.street;
// --- the disguised walk along the corridor (shots 1-2c) ---
const manZ = (f) => -4.0 + 0.04 * f;
const walkO = (f, ex = {}) => ({ legs: 'walk', step: step(f, 22), stiff: 1, bob: wbob(f, 11, 0.01), tilt: q(2.2 * Math.sin(Math.floor(f) / 22 * Math.PI * 2), 1), L: { x: 108, y: 610, b: 0.2 }, R: { x: 492, y: 610, b: 0.2 }, ...ex });
const corBG = (f, T) => { // people living in the lobby / corridor behind
  const out = [], gx = lerp(4.6, -1.6, ramp(f, -20, 200));
  out.push(A(T, G3, { legs: 'walk', step: step(f, 18), bob: wbob(f, 9), turn: -0.5, expr: 'neutral', keySwing: q(Math.sin(f * 0.35), 1) }, [cx + gx, 0, -8.8], { s: 1.0 }));
  out.push(A(T, G2, { expr: 'happy', holdR: 'mug', R: { x: 470, y: 440 }, steamT: q(f / 30, 1), blink: blinkAt(f, 2) }, [cx + 3.95, 0, -7.6], { s: 1.0 }));
  out.push(A(T, VIS[1], { legs: 'walk', step: step(f + 7, 20), bob: wbob(f + 7, 10), turn: 0.4 }, [cx + lerp(0.9, 2.6, ramp(f, 0, 230)), 0, -10.6], { s: 0.98, flip: true }));
  return out; };
shot('hook', 0, 'cor', {
  cam: (f) => { const z = manZ(f), t = eo(ramp(f, 34, 50)), d = lerp(lerp(3.75, 3.55, f / 34), lerp(2.25, 2.1, ramp(f, 50, 64)), t);
    return { pos: [cx + lerp(-0.3, 0.1, t), lerp(1.3, 1.64, t), z + d], look: [cx + lerp(0.04, 0.02, t), lerp(1.2, 1.6, t), z], fov: lerp(40, 34, t), roll: 0.5 * Math.sin(f * 0.21) }; },
  dof: (f, C) => ({ focus: dist(C.pos, [cx, 1.6, manZ(f)]), cinf: lerp(4.5, 15, ramp(f, 34, 50)) }),
  world: (f) => ({ set: 'cor', stand: [40, 0, 0], motes: { c: [cx, 1.6, manZ(f) + 1.5], s: [3.5, 2.8, 6], col: '#d8ffe0', n: 150, size: 0.03 } }),
  act: (f, T) => { const z = manZ(f), cl = ramp(f, 34, 50);
    return [...corBG(f, T), A(T, DISG, walkO(f, { maskEdge: q(lerp(0.3, 0.95, ramp(f, 30, 58)), 1), sweat: f > 30 ? 1 : 0, sweatT: q(lerp(0.12, 0.72, ramp(f, 32, 64)), 2), look: f < 38 ? 0 : f < 47 ? 0.9 : f < 56 ? -0.9 : 0.3,
      wigTilt: 2, glint: 0.25, glintX: q(0.2 + 0.5 * ramp(f, 36, 62), 2), hairSway: q(0.05 * Math.sin(f * 0.3), 2) }), [cx, 0, z], { hi: true, rim: { ...RIM2 }, order: 3 }),
      A(T, G4, { back: true, legs: 'walk', step: step(f, 16) }, [cx - 0.78, 0, z + 3.0 - f * 0.11], { s: 1.0 })]; },
});
shot('wig', 64, 'cor', { // "Langes schwarzes Haar": the wig swishes, slips, gets nudged back
  cam: (f) => { const z = manZ(f), u = ramp(f, 64, 110); return { pos: [cx - 0.25 + 0.2 * u, 1.9, z + 2.2 - 0.25 * u], look: [cx + 0.02, 1.86 + 0.03 * u, z], fov: 31, roll: -3 + 1.5 * u }; },
  dof: (f, C) => ({ focus: dist(C.pos, [cx, 1.8, manZ(f)]), cinf: 15 }),
  world: (f) => ({ set: 'cor', stand: [40, 0, 0], motes: { c: [cx, 1.9, manZ(f) + 1], s: [2, 1.6, 3], col: '#d8ffe0', n: 90, size: 0.02 } }),
  act: (f, T) => { const z = manZ(f), toss = Math.sin(ramp(f, 72, 92) * Math.PI), nud = ramp(f, 92, 100) - ramp(f, 104, 110);
    return [A(T, DISG, walkO(f, { headTilt: q(-9 * toss + 3 * Math.sin(f * 0.4), 1), hairSway: q(0.34 * Math.sin((f - 64) * 0.42) * (0.5 + toss), 2), wigTilt: q(lerp(2, 10, ramp(f, 76, 92)) - 7 * ramp(f, 98, 104), 1), wigUp: q(8 * ramp(f, 76, 92) - 6 * ramp(f, 98, 104), 0),
      maskEdge: 0.8, look: f < 90 ? 0.8 : -0.5, glint: 0.3, R: nud > 0.05 ? { x: q(lerp(492, 430, nud), 0), y: q(lerp(610, 150, nud), 0), b: 0.9 } : { x: 492, y: 610, b: 0.2 } }), [cx, 0, z], { hi: true, rim: { ...RIM2 }, order: 3 })]; },
});
shot('glasses', 110, 'cor', { // "Brille": glint
  cam: (f) => { const z = manZ(f), u = ramp(f, 110, 130); return { pos: [cx + 0.12, 1.72, z + 2.0 - 0.2 * u], look: [cx + 0.01, 1.71, z], fov: 25, roll: 2 }; },
  dof: (f, C) => ({ focus: dist(C.pos, [cx, 1.7, manZ(f)]), cinf: 16 }),
  world: (f) => ({ set: 'cor', stand: [40, 0, 0] }),
  act: (f, T) => [A(T, DISG, walkO(f, { glint: 1, glintX: q(ramp(f, 110, 124), 2), look: f < 120 ? -0.9 : 0.9, maskEdge: 0.8, wigTilt: 3 }), [cx, 0, manZ(f)], { hi: true, rim: { ...RIM2 }, order: 3 })],
  fx: (f, T) => f >= 113 && f < 127 ? [F('gl' + f, (p) => T.fxBurst(p, q((f - 113) / 14, 2), '#ffffff', 8, 16, 120), [cx + 0.23, 1.5, manZ(f) + 0.12], 0.42)] : [],
});
shot('shirt', 130, 'cor', { // "ein pinkes T-Shirt mit Donuts drauf": the seams are fighting
  cam: (f) => { const z = manZ(f), u = ramp(f, 130, 180), t = eo(ramp(f, 130, 146)); return { pos: [cx - 0.18 + 0.3 * u, lerp(1.62, 1.22, t), z + lerp(2.4, 2.75, t) - 0.25 * u], look: [cx, lerp(1.5, 1.12, t) - 0.05 * u, z], fov: 33, roll: 1.5 - 3 * u }; },
  dof: (f, C) => ({ focus: dist(C.pos, [cx, 1.2, manZ(f)]), cinf: 13 }),
  world: (f) => ({ set: 'cor', stand: [40, 0, 0], motes: { c: [cx, 1.3, manZ(f) + 1], s: [2.4, 2, 3], col: '#d8ffe0', n: 80, size: 0.022 } }),
  act: (f, T) => [A(T, DISG, walkO(f, { maskEdge: 0.85, wigTilt: 3, sweat: 2, sweatT: q(f / 40, 2), bob: q(wbob(f, 11, 0.01) + 0.006 * Math.sin(f * 0.9), 3) }), [cx, 0, manZ(f)], { hi: true, rim: { ...RIM2 }, order: 3 })],
  fx: (f, T) => [150, 164].flatMap((k, i) => f >= k && f < k + 12 ? [F('ck' + i + f, (p) => T.fxCreak(p, q((f - k) / 12, 2)), [cx + (i ? -0.42 : 0.42), 1.22, manZ(f) + 0.1], 0.5, { flip: !!i })] : []),
});
// --- shot 3: the guards look up, shrug, back to the coffee ---
shot('guards', 180, 'cor', {
  cam: (f) => { const u = ramp(f, 180, 223); return { pos: [cx - 0.75 + 0.25 * u, 1.62, -8.75 + 0.15 * u], look: [cx + 3.9, 1.63, -8.3], fov: 31 - 1.5 * u, roll: -1 }; },
  dof: (f, C) => ({ focus: dist(C.pos, [cx + 3.9, 1.4, -8.3]), cinf: 12 }),
  world: (f) => ({ set: 'cor', stand: [40, 0, 0], keyShake: 0.5, motes: { c: [cx + 2, 1.6, -8.4], s: [3, 2.4, 3], col: '#d8ffe0', n: 110, size: 0.022 } }),
  act: (f, T) => { const up = f >= 192 && f < 208, sip = ramp(f, 209, 216);
    const g1 = A(T, G1, up ? { expr: 'sus', look: -0.9, turn: -0.35, browLift: 10, L: 'hip', R: 'hang', keySwing: 0.4 } : sip > 0 ? { expr: 'sip', holdR: 'mug', R: { x: q(lerp(470, 370, sip), 0), y: q(lerp(480, 330, sip), 0), b: 1.2 }, headTilt: q(-8 * sip, 0), steamT: q(f / 30, 1) } : { expr: 'sleep', holdR: 'mug', R: { x: 470, y: 480 }, headTilt: 6, steamT: q(f / 30, 1) }, [cx + 3.85, 0, -8.72], { s: 1.0, rim: RIMG });
    const g2 = A(T, G2, up ? { expr: 'goofy', look: -0.9, turn: -0.3, holdR: 'mug', R: { x: 480, y: 450 }, steamT: q(f / 30, 1) } : sip > 0 ? { expr: 'sip', holdR: 'mug', R: { x: q(lerp(480, 392, sip), 0), y: q(lerp(450, 340, sip), 0), b: 1.2 }, headTilt: q(-7 * sip, 0), steamT: q(f / 30, 1) } : { expr: 'happy', look: 0.4, holdR: 'mug', R: { x: 480, y: 450 }, blink: blinkAt(f, 4), steamT: q(f / 30, 1) }, [cx + 3.95, 0, -7.9], { s: 1.0, rim: RIMG });
    const mz = lerp(-8.86, -9.5, ramp(f, 178, 212));
    return [g1, g2, A(T, DISG, { ...walkO(f), back: true, hairSway: q(0.1 * Math.sin(f * 0.4), 2) }, [cx + 1.35, 0, mz], { order: 4 })]; },
  fx: (f, T) => f >= 192 && f < 204 ? [F('q' + f, (p) => T.propMark(p, 'q'), [cx + 3.5, 1.2 + 0.006 * (f - 192), -8.25], 0.22)] : [],
});
// --- shot 4: split screen, daughter | "daughter" ---
shot('split', 223, 'split', {
  cam: (f) => { const t = eo(ramp(f, 256, 268)), u = ramp(f, 223, 306); return { pos: [sp + 0.08, 1.3, lerp(lerp(4.9, 4.6, ramp(f, 223, 256)), 4.0 - 0.25 * ramp(f, 268, 306), t)], look: [sp + 0.08, lerp(1.08, 1.22, t), 0], fov: 40, roll: lerp(0, -2, t) }; },
  dof: (f, C) => ({ focus: dist(C.pos, [sp, 1.3, 0]), cinf: 8 }),
  world: (f) => ({ set: 'split', motes: { c: [sp, 1.6, 1.2], s: [4, 3.4, 2], col: '#ffffff', n: 70, size: 0.03 } }),
  act: (f, T) => { const fl = back(ramp(f, 258, 268)), wv = q(Math.sin(f * 0.5) * 12, 0), fx_ = f >= 258;
    const pose = (k) => fx_ ? { L: 'hip', R: { x: q(lerp(480 + k * 20, 470 + k * 30, fl), 0), y: q(lerp(300, 210, fl), 0), b: 2.2 } } : { L: 'hip', R: { x: 500 + k * 20 + wv, y: 170, b: 1 } };
    return [A(T, GIRL, { ...pose(0), expr: fx_ ? 'nervous' : 'guilty', look: fx_ ? 0.9 : 0, blink: blinkAt(f, 5), hairSway: q(0.03 * Math.sin(f * 0.2), 2), bob: q(0.004 * Math.sin(f * 0.3), 3) }, [sp - 0.5, 0, 0], { s: 0.9, hi: true, rim: { side: -1, col: '255,255,255', a: 0.9, w: 8 } }),
      A(T, DISG, { ...pose(1), maskEdge: 0.7, look: fx_ ? -0.9 : 0, wigTilt: 4, sweat: fx_ ? 2 : 0, sweatT: q(f / 36, 2), bob: q(0.004 * Math.sin(f * 0.3 + 1), 3), hairSway: q(0.03 * Math.sin(f * 0.2 + 1), 2) }, [sp + 0.62, 0, 0], { s: 1.0, hi: true, rim: { side: 1, col: '255,255,255', a: 0.9, w: 8 } })]; },
  fx: (f, T) => f >= 260 && f < 276 ? [F('bst' + f, (p) => T.fxBurst(p, q((f - 260) / 16, 2), '#fff3b0', 10, 40, 240), [sp + 1.0, 1.15, -0.2], 0.9, { order: 1 })] : [],
});
// --- shot 5: seventy more years ---
const dadCell = [ce - 0.45, 0, -1.45];
shot('tally', 306, 'cell', {
  cam: (f) => { const u = ramp(f, 306, 372); return { pos: [ce - 1.0 + 1.7 * u, 1.5, 4.25 - 0.3 * u], look: [ce - 0.35 + 0.3 * u, 1.42, -2.4], fov: 35, roll: 1 - 2 * u }; },
  dof: (f, C) => ({ focus: dist(C.pos, [ce - 0.4, 1.5, -1.5]), cinf: 13, near: 3 }),
  world: (f) => ({ set: 'cell', motes: { c: [ce - 0.2, 1.4, -0.6], s: [2.2, 2.6, 3], col: '#e0f0ff', n: 170, size: 0.024 } }),
  act: (f, T) => { const sc = ramp(f, 318, 326) - ramp(f, 330, 336), sg = f >= 336;
    return [A(T, DAD, sg ? { expr: 'sigh', turn: -0.3, headTilt: q(lerp(0, 9, ramp(f, 336, 350)), 0), L: 'hang', R: 'hang', bob: q(-0.012 * ramp(f, 336, 352), 3) } : { expr: 'worried', turn: -0.6, look: -0.8, holdL: 'chalk', L: { x: 70, y: q(lerp(330, 420, sc), 0), b: 0.5 }, R: 'hang' }, dadCell, { s: 1.0, hi: true, rim: RIMB })]; },
  fx: (f, T) => f >= 342 && f < 362 ? [F('sg' + f, (p) => T.fxPuff(p, q((f - 342) / 20, 2)), [ce - 0.35, 1.1 + (f - 342) * 0.004, -1.3], 0.75)] : [],
});
// --- shot 6: he has a plan ---
shot('plan', 372, 'cell', {
  cam: (f) => { const u = ramp(f, 372, 412); return { pos: [ce + 0.18 - 0.1 * u, 1.35, 1.75 - 0.2 * u], look: [ce + 0.02, 1.22 + 0.03 * u, -1.2], fov: 38 - u, roll: -2 + u }; },
  dof: (f, C) => ({ focus: dist(C.pos, [ce, 1.3, -1.0]), cinf: 14, near: 1.8 }),
  world: (f) => ({ set: 'cell', bars: false, planOnBed: false, motes: { c: [ce, 1.4, -0.3], s: [2.2, 2.6, 3], col: '#e0f0ff', n: 150, size: 0.024 } }),
  act: (f, T) => { const up = back(ramp(f, 373, 383));
    return [A(T, DAD, { expr: 'sly', look: f > 395 ? 0.6 : 0, blink: blinkAt(f, 1), browLift: q(8 * Math.max(0, Math.sin((f - 386) * 0.5)), 0), L: { x: 150, y: q(lerp(760, 540, up), 0), b: 1.2 }, R: { x: 450, y: q(lerp(760, 540, up), 0), b: 1.2 } }, [ce, 0, -1.25], { s: 1.0, hi: true, rim: RIMB })]; },
  fx: (f, T) => { const up = back(ramp(f, 373, 383)); return [F('plan', (p) => T.propPlan(p), [ce + 0.01, lerp(-0.45, 0.3, up), -1.05], 0.62, { hi: true, roll: q(0.03 * Math.sin(f * 0.3), 3), order: 6 })]; },
});
// --- shot 7: the daughter visits ---
shot('visit', 412, 'vis', {
  cam: (f) => { const u = smooth(ramp(f, 412, 462)); return { pos: [vi + lerp(2.3, -0.05, u), 1.42, lerp(5.9, 5.2, u) - 0.2 * ramp(f, 462, 481)], look: [vi + lerp(2.4, -0.12, u), 1.22, 1.3], fov: 38, roll: 0 }; },
  dof: (f, C) => ({ focus: dist(C.pos, [vi, 1.3, 1.3]) , cinf: 10, near: 1.5 }),
  world: (f) => ({ set: 'vis', visSign: [-0.15, 2.72, -1.2], motes: { c: [vi - 1, 1.7, 1], s: [7, 3, 5], col: '#f0f8ff', n: 200, size: 0.03 } }),
  act: (f, T) => { const w = smooth(ramp(f, 408, 452)), gxp = lerp(4.6, 0.12, w), hug = eo(ramp(f, 450, 460)), walking = f < 452;
    const out = visBG(f, T);
    out.push(A(T, DAD, hug > 0 ? { expr: 'happy', turn: 0.3, L: { x: q(lerp(120, 250, hug), 0), y: 560, b: -1.5 }, R: { x: q(lerp(560, 520, hug), 0), y: q(lerp(360, 560, hug), 0), b: 1.6 }, tilt: q(3 * hug, 0) } : { expr: 'happy', turn: 0.5, look: 0.8, L: 'hang', R: { x: 560, y: q(360 + 14 * Math.sin(f * 0.6), 0), b: 0.8 } }, [vi - 0.5, 0, 1.25], { s: 1.0, hi: true, rim: RIMG }));
    out.push(A(T, GIRL, walking ? { expr: 'worried', turn: -0.5, look: -0.8, legs: 'walk', step: step(f, 16), bob: wbob(f, 8), hairSway: q(0.08 * Math.sin(f * 0.5), 2), R: { x: 420, y: 560 }, holdR: null, L: 'hang' } : { expr: 'guilty', turn: -0.3, look: f > 466 ? 0.9 : -0.5, L: { x: 190, y: 480, b: 1.5 }, R: 'hang', tilt: q(-3 * hug, 0), blink: blinkAt(f, 3) }, [vi + gxp, 0, 1.38], { s: 0.9, hi: true, order: 4, rim: { side: 1, col: '200,255,215', a: 0.85, w: 8 } }));
    if (f < 456) out.push(F('bagc', (p) => T.propBag(p), [vi + gxp + 0.4, 0.2 + wbob(f, 8), 1.42], 0.36, { order: 5, tint: TINT.vis }));
    else out.push(F('bagc', (p) => T.propBag(p), [vi + 0.52, -0.06, 1.42], 0.36, { order: 5, tint: TINT.vis }));
    out.push(A(T, VIS[3], { back: true }, [vi + lerp(3.6, 3.2, w), 0, 3.9], { s: 1.05, order: 6 }));
    return out; },
  fx: (f, T) => f >= 454 && f < 470 ? [F('hrt' + f, (p) => T.propMark(p, 'heart', '#ff4f6e'), [vi - 0.2, 2.1 + (f - 454) * 0.012, 1.2], 0.3)] : [],
});
function visBG(f, T) { // other visits, a guard on patrol
  const out = [];
  const pairs = [[-4.4, -3.4, DADc(1), VIS[0]], [4.4, -3.4, DADc(2), VIS[4]], [-4.4, 0, DADc(3), VIS[2]], [4.4, 0, DADc(0), VIS[5]], [0, -3.4, DADc(2), VIS[1]]];
  pairs.forEach(([x, z, a, b], i) => {
    out.push(A(T, a, { legs: 'sit', expr: i % 2 ? 'happy' : 'laugh', turn: 0.5, R: i % 2 ? 'hang' : { x: 450, y: q(430 + 20 * Math.sin(f * 0.3 + i), 0) }, bob: q(0.004 * Math.sin(f * 0.4 + i), 3), blink: blinkAt(f, i) }, [vi + x - 1.08, -0.14, z], { s: 0.98 }));
    out.push(A(T, b, { legs: 'sit', expr: i % 2 ? 'laugh' : 'happy', turn: -0.5, L: i % 2 ? { x: 150, y: q(430 + 22 * Math.sin(f * 0.35 + i), 0) } : 'hang', bob: q(0.004 * Math.sin(f * 0.4 + i + 2), 3), blink: blinkAt(f, i + 4) }, [vi + x + 1.08, b.robe ? 0 : -0.1, z], { s: 0.95, flip: true })); });
  out.push(A(T, G3, { legs: 'walk', step: step(f, 20), bob: wbob(f, 10), turn: 0.5, keySwing: q(Math.sin(f * 0.3), 1) }, [vi + lerp(-6, 5, ramp(f, 380, 640)), 0, -1.7], { s: 1.0 }));
  out.push(A(T, G4, { expr: 'neutral', L: 'hip', blink: blinkAt(f, 8), look: q(Math.sin(f * 0.05), 1) }, [vi + 3.4, 0, -4.6], { s: 1.0 }));
  return out; }
function DADc(i) { return { ...CON(i), _id: 'pris' + i, detail: ['hstripes'], mudHead: false, legs: '#f08a24' }; }
// --- shot 8: under the table: the bag, then wig / glasses / mask ---
const underSeats = (f, T, o = {}) => {
  const hand = o.hand, out = [];
  out.push(A(T, DAD, { legs: 'sit', expr: 'sly', L: 'hang', R: hand ? des(vi - 0.5, -0.14, 1, hand[0], hand[1], 1.2) : 'belly', bob: q(0.003 * Math.sin(f * 0.5), 3) }, [vi - 0.5, -0.14, 0], { s: 1.0, hi: true, tint: TINT.under }));
  out.push(A(T, GIRL, { legs: 'sit', expr: 'nervous', R: 'hang', L: o.ghand ? des(vi + 0.5, -0.08, 0.9, o.ghand[0], o.ghand[1], 1.2) : 'hang', bob: q(0.006 * Math.abs(Math.sin(f * 0.9)), 3) }, [vi + 0.5, -0.08, 0.02], { s: 0.9, hi: true, tint: TINT.under }));
  out.push(A(T, G3, { legs: 'walk', step: step(f, 20), bob: wbob(f, 10), keySwing: q(Math.sin(f * 0.3), 1) }, [vi + lerp(-1.5, 1.6, ramp(f, 470, 600)), 0, -2.0], { s: 1.0, tint: TINT.under }));
  out.push(A(T, DADc(2), { legs: 'sit', turn: 0.5 }, [vi - 1.08, -0.14, -3.4], { s: 0.98, tint: TINT.under })); out.push(A(T, VIS[1], { legs: 'sit', turn: -0.5 }, [vi + 1.08, -0.1, -3.4], { s: 0.95, flip: true, tint: TINT.under }));
  return out; };
shot('bag', 481, 'under', {
  cam: (f) => { const u = ramp(f, 481, 507); return { pos: [vi + 0.04 - 0.06 * u, 0.46, 1.62 - 0.12 * u], look: [vi, 0.42, 0], fov: 40, roll: 2 - 3 * u }; },
  dof: (f, C) => ({ focus: dist(C.pos, [vi, 0.4, 0.1]), cinf: 11, near: 1.4 }),
  world: (f) => ({ set: 'vis', visSign: [0, 20, 0], dim: 0.8 }),
  bagX: (f) => lerp(0.2, -0.26, smooth(ramp(f, 484, 504))),
  act: (f, T) => { const bx = vi + lerp(0.2, -0.26, smooth(ramp(f, 484, 504))); return underSeats(f, T, { hand: [Math.min(bx - 0.02, vi + lerp(-0.2, -0.04, ramp(f, 484, 494))), 0.5], ghand: f < 497 ? [bx + 0.03, 0.5] : [vi + lerp(0.0, 0.25, ramp(f, 497, 505)), 0.45] }); },
  fx: (f, T) => { const bx = vi + lerp(0.2, -0.26, smooth(ramp(f, 484, 504))); return [F('bag', (p) => T.propBag(p), [bx, 0.14 + 0.01 * Math.sin(f * 0.8), 0.14], 0.3, { order: 6, tint: TINT.under, hi: true })]; },
});
const lapCam = (a, b, p0, p1, roll, fov = 36) => (f) => { const u = ramp(f, a, b), k = eo(ramp(f, a, a + 6)); return { pos: l3(p0, p1, u).map((v, i) => i === 0 ? v + vi : v), look: [vi - 0.27, 0.6 + 0.04 * k, 0.1], fov: fov - 2 * k, roll }; };
const lapItem = (f, a) => { const k = back(ramp(f, a, a + 7)); return [vi - 0.27, lerp(0.24, 0.52, k), 0.16]; };
const lapBase = (f, T, a) => { const it = lapItem(f, a); return [...underSeats(f, T, { hand: [it[0] + 0.1, it[1] + 0.05] }), F('bag', (p) => T.propBag(p), [vi - 0.27, 0.12, 0.2], 0.3, { order: 6, tint: TINT.under, hi: true })]; };
shot('pWig', 507, 'under', { cam: lapCam(507, 526, [-0.42, 0.66, 1.25], [-0.36, 0.66, 1.15], -4), dof: (f, C) => ({ focus: dist(C.pos, [vi - 0.27, 0.6, 0.15]), cinf: 14 }), world: () => ({ set: 'vis', visSign: [0, 20, 0], dim: 0.8 }),
  act: (f, T) => lapBase(f, T, 507),
  fx: (f, T) => { const it = lapItem(f, 507); return [F('wig' + q(Math.sin((f - 507) * 0.9) * (1 - ramp(f, 507, 524)), 1), (p) => T.propWig(p, { sway: q(0.3 * Math.sin((f - 507) * 0.9) * (1 - ramp(f, 507, 524)), 1) }), [it[0], it[1] - 0.2, it[2]], 0.34, { order: 5, hi: true, tint: '#dcebe2' }),
    ...(f < 519 ? [F('wb' + f, (p) => T.fxBurst(p, q((f - 507) / 12, 2), '#fff3b0', 9, 30, 200), [it[0] + 0.02, it[1] + 0.02, it[2] - 0.05], 0.5, { order: 4 })] : [])]; } });
shot('pGlasses', 526, 'under', { cam: lapCam(526, 545, [-0.2, 0.62, 1.2], [-0.24, 0.63, 1.1], 3, 34), dof: (f, C) => ({ focus: dist(C.pos, [vi - 0.27, 0.6, 0.15]), cinf: 14 }), world: () => ({ set: 'vis', visSign: [0, 20, 0], dim: 0.8 }),
  act: (f, T) => lapBase(f, T, 526),
  fx: (f, T) => { const it = lapItem(f, 526); return [F('gls' + q(ramp(f, 529, 541), 2), (p) => T.propGlasses(p, { glint: 1, glintX: q(ramp(f, 529, 541), 2) }), [it[0], it[1] - 0.2, it[2]], 0.26, { order: 5, hi: true, roll: q(0.12 * Math.sin((f - 526) * 0.7) * (1 - ramp(f, 526, 540)), 2) }),
    ...(f >= 530 && f < 542 ? [F('gb' + f, (p) => T.fxBurst(p, q((f - 530) / 12, 2), '#ffffff', 8, 16, 130), [it[0] + 0.1, it[1] + 0.02, it[2] + 0.03], 0.36, { order: 7 })] : [])]; } });
shot('pMask', 545, 'under', { cam: (f) => { const u = ramp(f, 545, 586), k = eo(ramp(f, 545, 551)); return { pos: [vi - 0.3 + 0.05 * u, 0.56 + 0.03 * u, 1.32 - 0.3 * u], look: [vi - 0.27, 0.6 + 0.05 * k, 0.1], fov: 36 - 3 * u, roll: -3 + 7 * u }; },
  dof: (f, C) => ({ focus: dist(C.pos, [vi - 0.27, 0.6, 0.15]), cinf: 15 }), world: () => ({ set: 'vis', visSign: [0, 20, 0], dim: 0.62 }),
  act: (f, T) => lapBase(f, T, 545),
  fx: (f, T) => { const it = lapItem(f, 545), t = lerp(0.12, 1, back(ramp(f, 552, 566))), wb = q(Math.sin((f - 545) * 0.8) * (1 - 0.7 * ramp(f, 552, 580)), 1);
    return [F('glowm', (p) => T.fxGlow(p, '190,255,210', 0.5), [it[0], it[1] - 0.1, it[2] - 0.06], 0.5, { order: 4 }), F('msk' + q(t, 2) + wb, (p) => T.propMask(p, t, { wob: wb }), [it[0], it[1] - 0.26, it[2]], 0.33, { order: 5, hi: true })]; } });
// --- shot 9+10: he changes behind the blanket; she stays in the cell (one shot, whip pan) ---
const girlBunk = [ce + 0.78, 0.065, -0.12];
shot('change', 586, 'cell', {
  cam: (f) => { const w = smooth(ramp(f, 613, 621)), u = ramp(f, 621, 655), e = eo(ramp(f, 636, 655));
    const p0 = [ce - 0.45, 1.4, 2.25 - 0.15 * ramp(f, 586, 613)], l0 = [ce - 0.55, 1.3, -0.9], p1 = l3([ce + 0.55, 1.3, 2.35], [ce + 0.78, 1.47, 2.1], e), l1 = l3([ce + 0.78, 1.05, -0.12], [ce + 0.78, 1.47, -0.12], e);
    return { pos: l3(p0, p1, w), look: l3(l0, l1, w), fov: lerp(40, lerp(38, 24, e), w), roll: lerp(-2, 1, w) }; },
  dof: (f, C) => ({ focus: f < 617 ? dist(C.pos, [ce - 0.55, 1.2, -0.9]) : dist(C.pos, [ce + 0.78, 1.3, -0.12]), cinf: 11 }),
  world: (f) => ({ set: 'cell', bars: false, blanket: 1, blanketKick: Math.max(0, Math.sin((f - 586) * 0.7)) * (f < 612 ? 1 : 0), motes: { c: [ce, 1.4, 0], s: [3, 2.6, 3], col: '#e0f0ff', n: 150, size: 0.022 } }),
  act: (f, T) => { const hop = f < 612 ? Math.abs(Math.sin((f - 586) * 0.55)) * 0.16 : 0;
    return [A(T, f < 604 ? DAD : DISG, f < 604 ? { expr: 'determined', L: { x: 90, y: q(240 + 60 * Math.sin(f * 0.9), 0), b: 1 }, R: { x: 510, y: q(240 - 60 * Math.sin(f * 0.9), 0), b: 1 } } : { wigTilt: 14, wigUp: 10, L: { x: 100, y: 200, b: 1 }, R: { x: 500, y: 200, b: 1 } }, [ce - 0.55, hop, -1.35], { s: 1.0, rim: RIMB }),
      A(T, GIRL, { legs: 'sit', L: 'cross', R: 'cross', expr: f > 636 ? 'guilty' : 'nervous', look: f < 630 ? -0.9 : f < 640 ? 0.8 : 0, blink: blinkAt(f, 6), bob: q(0.006 * Math.abs(Math.sin(f * 0.8)), 3), glint: 0.3, glintX: 0.3 }, girlBunk, { s: 0.9, hi: true, rim: RIMB })]; },
  fx: (f, T) => [[590, 0, -1, 0.9], [595, 1, 1, 1.2], [600, 3, -0.4, 1.4], [604, 0, 0.6, 1.0], [608, 1, -0.8, 1.1]].flatMap(([a, kind, dir, pw], i) => { const t = (f - a) / 22; if (t < 0 || t > 1) return [];
    return [F('cl' + i, (p) => T.propCloth(p, kind), [ce - 0.55 + dir * 1.1 * t, 1.55 + 2.2 * pw * t - 3.4 * t * t, -1.0 + 0.5 * t], 0.5, { roll: q(dir * t * 5, 2), order: 6 })]; }),
});
// --- shot 11: after visiting time, towards the exit. As her. (starts as a match cut on the glasses) ---
const q11 = (f) => -6.45 - 0.017 * (f - 655);
const queue = (f, T, zoff = 0) => { const out = [];
  [[VIS[0], -9.6, -0.95, 20], [VIS[2], -8.5, -1.0, 16], [VIS[4], -4.6, 0.75, 18], [VIS[5], -3.6, 0.2, 15], [VIS[1], -2.4, 0.6, 19]].forEach(([v, z0, x, per], i) => { const z = z0 - 0.022 * (f - 655) + zoff;
    out.push(A(T, v, { legs: 'walk', step: step(f + i * 5, per), bob: wbob(f + i * 5, per / 2), expr: i === 2 && f > 690 ? 'wide' : 'happy', look: i === 2 ? -0.8 : 0, turn: i === 2 ? -0.3 : 0, blink: blinkAt(f, i) }, [cx + x, 0, z], { s: i === 3 ? 0.8 : 0.96, order: z < -8.5 ? 5 : 2 })); });
  out.push(A(T, G3, { L: 'hip', expr: 'neutral', blink: blinkAt(f, 2), keySwing: q(Math.sin(f * 0.2), 1) }, [cx - 1.85, 0, -3.6], { s: 1.0 }));
  out.push(A(T, G2, { expr: 'sip', holdR: 'mug', R: { x: 392, y: 340, b: 1.2 }, headTilt: -6, steamT: q(f / 30, 1) }, [cx + 3.95, 0, -7.65], { s: 1.0 }));
  return out; };
shot('queue', 655, 'cor', {
  cam: (f) => { const z = q11(f), t = eo(ramp(f, 657, 672)), u = ramp(f, 672, 730); return { pos: l3([cx - 0.32, 1.71, z - 2.45], [cx - 0.05, 1.25, -11.35 + 0.25 * u], t), look: l3([cx - 0.32, 1.71, z], [cx - 0.1, 1.15, -6.4], t), fov: lerp(24, 44, t), roll: lerp(0, -1.5, t) + u }; },
  dof: (f, C) => ({ focus: dist(C.pos, [cx - 0.32, 1.6, q11(f)]), cinf: lerp(14, 3.5, ramp(f, 657, 672)) }),
  world: (f) => ({ set: 'cor', stand: [0.27, 0, -8.3], standS: 0.6, motes: { c: [cx, 1.6, -8.5], s: [3.5, 2.8, 6], col: '#d8ffe0', n: 150, size: 0.03 } }),
  act: (f, T) => [...queue(f, T), A(T, DISG, { legs: 'walk', step: step(f, 26), stiff: 1, bob: wbob(f, 13, 0.012), tilt: q(5 * Math.sin(Math.floor(f) / 26 * Math.PI * 2), 1), L: { x: 100, y: 600, b: 0.1 }, R: { x: 500, y: 600, b: 0.1 }, maskEdge: 0.6, wigTilt: 4, glint: 0.3, glintX: 0.3,
    sweat: f > 690 ? 2 : 0, sweatT: q(f / 40, 2), look: f < 685 ? 0 : f < 705 ? -0.9 : 0.9, hairSway: q(0.08 * Math.sin(f * 0.25), 2) }, [cx - 0.32, 0, q11(f)], { hi: true, rim: RIMG, order: 3 })],
});
// --- shot 12: "Als sie." strut, whip around, the door, the sun, the hand ---
const z12 = (f) => -8.7 - 0.013 * (f - 730);
shot('door', 730, 'door', {
  cam: (f) => { const z = z12(f), w = smooth(ramp(f, 756, 763)), u = ramp(f, 763, 804);
    const pa = [cx + 0.2, 1.6, z - 2.3 + 0.2 * ramp(f, 730, 756)], la = [cx + 0.05, 1.56, z], pb = [cx + 0.42 - 0.1 * u, 1.5, -7.75 - 0.5 * u], lb = [cx + 0.3, 1.25 + 0.05 * u, -12];
    const ang = lerp(0, Math.PI, w), mid = [cx + 0.1, 1.55, z]; // swing the camera around him
    const da = [pa[0] - mid[0], pa[2] - mid[2]], r = lerp(Math.hypot(...da), 2.2, w), a0 = Math.atan2(da[0], da[1]);
    const pos = w <= 0 ? pa : w >= 1 ? pb : [mid[0] + Math.sin(a0 + ang) * r, lerp(pa[1], pb[1], w), mid[2] + Math.cos(a0 + ang) * r];
    return { pos, look: l3(la, lb, w), fov: lerp(32, 42, w), roll: lerp(-2, 2, w) - 2 * u }; },
  dof: (f, C) => f < 760 ? { focus: dist(C.pos, [cx, 1.6, z12(f)]), cinf: 13 } : { focus: dist(C.pos, [cx + 0.4, 1.3, -11.6]), cinf: 9, near: 0.8 },
  world: (f) => ({ set: 'cor', door: lerp(0.1, 0.42, smooth(ramp(f, 740, 800))), stand: [cx - 2.0, 0, -6.0], motes: { c: [cx + 0.3, 1.4, -10.2], s: [2.4, 2.8, 4.5], col: '#ffe6a8', n: 240, size: 0.03, op: 0.8 } }),
  act: (f, T) => { const z = z12(f), fr = f < 760, flip = ramp(f, 738, 746) - ramp(f, 748, 754), reach = eo(ramp(f, 770, 800));
    const out = [A(T, G1, { expr: 'neutral', look: -0.6, L: 'hip', keySwing: q(Math.sin(f * 0.2), 1), blink: blinkAt(f, 3) }, [cx + 1.9, 0, -10.4], { s: 1.0, tint: TINT.door })];
    if (fr) { out.push(A(T, DISG, { legs: 'walk', step: step(f, 24), stiff: 1, bob: wbob(f, 12, 0.012), tilt: q(-2 + 4 * Math.sin(Math.floor(f) / 24 * Math.PI * 2), 1), headTilt: q(-5 * flip, 0), hairSway: q(0.3 * flip, 2), maskEdge: 0.6, wigTilt: 4, glint: 0.7, glintX: q(ramp(f, 732, 752), 2),
        L: { x: 100, y: 600, b: 0.1 }, R: flip > 0.05 ? { x: q(lerp(500, 470, flip), 0), y: q(lerp(600, 190, flip), 0), b: 1 } : { x: 500, y: 600, b: 0.1 } }, [cx + 0.05, 0, z], { hi: true, rim: { side: -1, col: '255,214,130', a: 1, w: 13, col2: '255,225,160', a2: 0.9, w2: 9 }, order: 3 }));
      queue(f, T, -1.2).slice(2, 5).forEach((a) => out.push(a)); }
    else out.push(A(T, DISG, { back: true, legs: 'walk', step: step(f, 24), stiff: 1, bob: wbob(f, 12, 0.01), hairSway: q(0.05 * Math.sin(f * 0.3), 2), L: { x: 96, y: 600, b: 0.1 }, R: { x: q(lerp(500, 560, reach), 0), y: q(lerp(600, 330 + 6 * Math.sin(f * 1.4), reach), 0), b: 0.5 } }, [cx - 0.3, 0, lerp(z, -10.55, ramp(f, 763, 804))], { hi: true, rim: { side: 1, col: '255,220,140', a: 1, w: 14 }, order: 3 }));
    return out; },
});
// --- shot 13: the guard notices ---
const g1p = [cx + 2.05, 0, -8.5];
shot('notice', 804, 'cor', {
  cam: (f) => { const t = eo(ramp(f, 812, 821)), u = ramp(f, 821, 852); return { pos: [cx - 0.9 + 0.8 * t, 1.55 + 0.1 * t, -8.9 + 0.1 * t], look: [g1p[0] - 0.02 * t, lerp(1.4, 1.72, t), g1p[2]], fov: lerp(38, 21 - 2 * u, t), roll: lerp(0, -3, t) }; },
  dof: (f, C) => ({ focus: dist(C.pos, [g1p[0], 1.6, g1p[2]]), cinf: 13 }),
  world: (f) => ({ set: 'cor', keyShake: 1, motes: { c: [cx + 1.5, 1.6, -8.5], s: [3, 2.4, 3], col: '#d8ffe0', n: 100, size: 0.022 } }),
  act: (f, T) => { const n = f >= 812;
    return [A(T, G2, { expr: n ? 'goofy' : 'sip', holdR: 'mug', R: n ? { x: 480, y: 450 } : { x: 392, y: 340, b: 1.2 }, look: -0.8, steamT: q(f / 30, 1) }, [cx + 3.95, 0, -7.75], { s: 1.0 }),
      A(T, G1, n ? { expr: 'sus', look: -0.9, turn: -0.4, browLift: q(4 + 8 * ramp(f, 820, 850), 0), L: 'chin', keySwing: 0.3, headTilt: q(4 * eo(ramp(f, 812, 820)), 0) } : { expr: 'neutral', look: 0.2, L: 'hip', blink: blinkAt(f, 3), keySwing: q(Math.sin(f * 0.2), 1) }, g1p, { s: 1.0, hi: true, rim: RIMG, order: 3 }),
      ]; },
  fx: (f, T) => f >= 812 && f < 826 ? [F('ex' + f, (p) => T.propMark(p, 'excl', '#e03a3a'), [g1p[0] + 0.05, 2.15, g1p[2]], q(0.42 * back(ramp(f, 812, 818)), 2))] : [],
});
// --- shot 14: this girl is somehow ... nervous. Far too nervous. ---
const dP = [cx - 0.12, 0, -10.6], jit = (f, a = 0.008) => (hsh(Math.floor(f) * 1.7) - 0.5) * 2 * a;
const g1Door = [cx + 0.55, 0, -10.25];
shot('sweat', 852, 'door', {
  cam: (f) => { const u = ramp(f, 852, 903); return { pos: [cx + 0.25 - 0.1 * u, 1.62, -8.35 - 0.35 * u], look: [cx - 0.12, 1.58, -10.6], fov: 34, roll: -2 + 4 * u }; },
  dof: (f, C) => ({ focus: dist(C.pos, [dP[0], 1.6, dP[2]]), cinf: 13, near: 1.5 }),
  world: (f) => ({ set: 'cor', door: 0.42, stand: [cx - 2.0, 0, -6.0], motes: { c: [cx, 1.5, -10], s: [2.4, 2.6, 3], col: '#ffe6a8', n: 160, size: 0.026, op: 0.7 } }),
  act: (f, T) => { const u = ramp(f, 852, 903);
    return [A(T, DISG, { maskEdge: 0.9, wigTilt: 6, wigUp: 4, sweat: Math.round(lerp(3, 13, u)), sweatT: q((f - 852) / 22, 2), look: Math.floor(f / 5) % 2 ? 0.9 : -0.9, glint: 0.2, L: { x: 108, y: 600, b: 0.2 }, R: { x: 492, y: 600, b: 0.2 }, hairSway: q(jit(f, 0.03), 2) }, [dP[0] + jit(f, 0.006 + 0.008 * u), 0, dP[2]], { hi: true, rim: RIM2, order: 3, tint: TINT.door }),
      A(T, G1, { back: true }, [cx + 0.98, -0.05, -9.25], { s: 1.0, order: 6 })]; },
});
shot('brow', 903, 'cor', {
  cam: (f) => { const u = ramp(f, 903, 938); return { pos: [cx - 0.7 + 0.1 * u, 1.72, -9.2 + 0.25 * u], look: [g1Door[0] - 0.02, 1.74, g1Door[2]], fov: 22 - 2 * u, roll: 3 - u }; },
  dof: (f, C) => ({ focus: dist(C.pos, [g1Door[0], 1.7, g1Door[2]]), cinf: 15 }),
  world: (f) => ({ set: 'cor', door: 0.42, sunK: 0.15, stand: [cx - 2.0, 0, -6.0] }),
  act: (f, T) => [A(T, G1, { expr: 'sus', look: -0.9, turn: -0.3, browLift: q(lerp(2, 34, smooth(ramp(f, 906, 932))), 0), headTilt: q(5 * ramp(f, 906, 932), 0) }, g1Door, { s: 1.0, hi: true, rim: { side: -1, col: '255,214,130', a: 0.9, w: 9 }, order: 3 }),
    A(T, G2, { expr: 'wide', look: -0.8, holdR: 'mug', R: { x: 480, y: 450 }, steamT: q(f / 30, 1) }, [cx + 1.9, 0, -9.0], { s: 1.0 })],
});
shot('fog', 938, 'door', {
  cam: (f) => { const u = ramp(f, 938, 982); return { pos: [cx - 0.3 + 0.15 * u, 1.3, -7.75 - 0.4 * u], look: [cx - 0.12, 1.36, -10.6], fov: 36, roll: 3 - 7 * u }; },
  dof: (f, C) => ({ focus: dist(C.pos, [dP[0], 1.5, dP[2]]), cinf: 12 }),
  world: (f) => ({ set: 'cor', door: 0.42, stand: [cx - 2.0, 0, -6.0], motes: { c: [cx, 1.5, -10], s: [2.4, 2.6, 3], col: '#ffe6a8', n: 160, size: 0.026, op: 0.7 } }),
  act: (f, T) => { const u = ramp(f, 938, 982), j = (k) => q(jit(f + k * 9, 16), 0);
    return [A(T, DISG, { maskEdge: 1, wigTilt: 9, wigUp: 6, sweat: 14, sweatT: q((f - 852) / 16, 2), fog: q(smooth(ramp(f, 942, 962)), 2), glint: 0.1, legs: 'walk', step: q(0.25 + 0.06 * Math.sin(f * 2.4), 2), stiff: 0.3,
      L: { x: 215 + j(1), y: 470 + j(2), b: 1.6 }, R: { x: 385 + j(3), y: 470 + j(4), b: 1.6 }, hairSway: q(jit(f, 0.05), 2), bob: q(Math.abs(jit(f, 0.006)), 3) }, [dP[0] + jit(f, 0.016), 0, dP[2]], { hi: true, rim: RIM2, order: 3, tint: TINT.door }),
      A(T, G3, { expr: 'sus', look: 0.8, L: 'hip' }, [cx - 1.25, 0, -11.2], { s: 1.0, tint: TINT.door })]; },
  fx: (f, T) => [0, 1, 2, 3].flatMap((i) => { const a = 944 + i * 9, t = (f - a) / 10; return t >= 0 && t < 1 ? [F('dr' + i + f, (p) => T.fxSplash(p, q(t, 2)), [dP[0] + (i % 2 ? 0.3 : -0.28), 0.0, dP[2] + 0.1], 0.14)] : []; }),
});
// --- shot 15: they stop him ---
const tap = 990;
const stopPair = (f, T, o = {}) => { const h = o.hand; return A(T, G1, { expr: o.gex || 'sus', look: -0.9, turn: -0.35, browLift: o.brow ?? 14, blink: o.gblink || 0, L: h ? des(g1Door[0], 0, 1, h[0], h[1], o.hb ?? 0.8) : 'hip', R: 'hang', keySwing: 0.2, headTilt: o.gtilt || 0 }, g1Door, { s: 1.0, hi: true, order: 4, rim: { side: 1, col: '200,255,215', a: 0.8, w: 8 }, tint: TINT.door }); };
shot('stop', 982, 'door', {
  cam: (f) => { const t = eo(ramp(f, tap, tap + 7)); return { pos: [cx + 0.2, 1.5, -6.75 - 0.45 * t - 0.1 * ramp(f, 982, 1017)], look: [cx + 0.2, 1.3, -10.5], fov: 42, roll: -1.5 * t }; },
  dof: (f, C) => ({ focus: dist(C.pos, [dP[0], 1.5, dP[2]]), cinf: 10 }),
  world: (f) => ({ set: 'cor', door: lerp(0.42, 0.2, ramp(f, tap, 1010)), stand: [cx - 2.0, 0, -6.0], motes: { c: [cx, 1.5, -10], s: [2.4, 2.6, 3], col: '#ffe6a8', n: 120, size: 0.026, op: 0.6 } }),
  act: (f, T) => { const land = eo(ramp(f, 984, tap)), jmp = Math.sin(ramp(f, tap, tap + 8) * Math.PI) * 0.07, fr = f >= tap;
    return [A(T, DISG, { maskEdge: 1, wigTilt: 9, wigUp: 6, sweat: fr ? 6 : 12, sweatT: fr ? 0.5 : q((f - 852) / 16, 2), fog: fr ? 0.25 : 0.9, eyeOpen: 1.25, look: fr ? 0.9 : 0, L: { x: 108, y: fr ? 560 : 600, b: 0.2 }, R: { x: 492, y: fr ? 560 : 600, b: 0.2 }, bob: q(jmp, 3) }, [dP[0] + (fr ? 0 : jit(f, 0.012)), 0, dP[2]], { hi: true, rim: RIM2, order: 3, tint: TINT.door }),
      stopPair(f, T, { hand: [lerp(g1Door[0] - 0.2, dP[0] + 0.3, land), lerp(1.0, 1.52 + jmp, land)] }),
      A(T, G3, { expr: 'sus', L: 'hip', legs: f < 1004 ? 'walk' : 'stand', step: step(f, 16) }, [cx + lerp(-1.6, -1.05, ramp(f, 984, 1004)), 0, -11.3], { s: 1.0, tint: TINT.door })]; },
  fx: (f, T) => f >= tap && f < tap + 10 ? [F('tp' + f, (p) => T.fxBurst(p, q((f - tap) / 10, 2), '#ffffff', 8, 20, 130), [dP[0] + 0.32, 1.32, dP[2] + 0.3], 0.5, { order: 7 })] : [],
});
// --- shot 16: the wig comes off on "Perücke" (f 1050) ---
const yank = 1049;
shot('wigoff', 1017, 'door', {
  cam: (f) => { const k = eo(ramp(f, yank, yank + 6)) - smooth(ramp(f, yank + 10, 1074)); return { pos: [cx + 0.2, 1.6, -7.1 - 0.25 * ramp(f, 1017, 1074)], look: [cx + 0.2, 1.52 + 0.16 * k, -10.5], fov: 42, roll: 1 + 1.5 * k }; },
  dof: (f, C) => ({ focus: dist(C.pos, [dP[0], 1.6, dP[2]]), cinf: 11 }),
  world: (f) => ({ set: 'cor', door: 0.2, stand: [cx - 2.0, 0, -6.0], motes: { c: [cx, 1.5, -10], s: [2.4, 2.6, 3], col: '#ffe6a8', n: 120, size: 0.026, op: 0.6 } }),
  wigPos: (f) => { const t = back(ramp(f, yank, yank + 8)); return [lerp(dP[0], dP[0] + 0.62, t), lerp(1.98, 2.3, t) + 0.03 * Math.sin((f - yank) * 0.5), dP[2] + 0.2]; },
  act: (f, T) => { const gr = eo(ramp(f, 1030, 1044)), off = f >= yank, t = back(ramp(f, yank, yank + 8));
    const hx = off ? lerp(dP[0] + 0.05, dP[0] + 0.62, t) : lerp(g1Door[0] - 0.2, dP[0] + 0.05, gr), hy = off ? lerp(2.1, 2.42, t) + 0.03 * Math.sin((f - yank) * 0.5) : lerp(1.0, 2.12, gr);
    return [A(T, off ? BALD : DISG, off ? { maskEdge: 1, eyeOpen: 1.3, look: f < yank + 14 ? 0 : 0.9, gloss: 1.3, sweat: 3, sweatT: q(f / 30, 2), L: { x: 108, y: 560, b: 0.2 }, R: { x: 492, y: 560, b: 0.2 }, bob: q(0.03 * Math.sin(ramp(f, yank, yank + 8) * Math.PI), 3) }
        : { maskEdge: 1, wigTilt: q(9 + 6 * ramp(f, 1044, yank), 0), wigUp: q(6 + 16 * ramp(f, 1044, yank), 0), sweat: 6, sweatT: q(f / 30, 2), fog: 0.2, eyeOpen: 1.25, look: 0.9, L: { x: 108, y: 560, b: 0.2 }, R: { x: 492, y: 560, b: 0.2 } }, dP, { hi: true, rim: RIM2, order: 3, tint: TINT.door }),
      stopPair(f, T, { hand: [hx, hy], hb: 1.4, gex: off ? 'wide' : 'sus', brow: off ? 0 : 14 }),
      A(T, G3, { expr: off ? 'shock' : 'sus', L: 'hip' }, [cx - 1.05, 0, -11.3], { s: 1.0, tint: TINT.door })]; },
  fx: (f, T) => { if (f < yank) return []; const t = back(ramp(f, yank, yank + 8)), sw_ = q(0.4 * Math.sin((f - yank) * 0.7) * (1 - 0.6 * ramp(f, yank, 1074)), 1), gt = (f - yank) / 20;
    const out = [F('wigf' + sw_, (p) => T.propWig(p, { sway: sw_ }), [lerp(dP[0], dP[0] + 0.62, t), lerp(1.2, 1.55, t) + 0.03 * Math.sin((f - yank) * 0.5), dP[2] + 0.25], 1.0, { order: 5, hi: true, tint: TINT.door })];
    if (gt < 1) out.push(F('glf', (p) => T.propGlasses(p, {}), [dP[0] - 0.2 - 0.9 * gt, 1.3 + 1.6 * gt - 3.2 * gt * gt, dP[2] + 0.3], 0.4, { roll: q(gt * 7, 2), order: 6 }));
    if (f < yank + 12) out.push(F('wb' + f, (p) => T.fxBurst(p, q((f - yank) / 12, 2), '#ffffff', 10, 40, 240), [dP[0] + 0.05, 1.55, dP[2] - 0.1], 1.1, { order: 2 }));
    return out; },
});
// --- shot 17: a smooth bald head made of silicone ---
shot('bald', 1074, 'door', {
  cam: (f) => { const u = ramp(f, 1074, 1149); return { pos: [cx - 0.3 + 0.2 * u, 2.05, -8.7 - 0.25 * u], look: [cx - 0.02, 1.76, -10.55], fov: 30 - 2 * u, roll: -3 + 2 * u }; },
  dof: (f, C) => ({ focus: dist(C.pos, [dP[0], 1.7, dP[2]]), cinf: 13 }),
  world: (f) => ({ set: 'cor', door: 0.2, stand: [cx - 2.0, 0, -6.0], motes: { c: [cx, 1.7, -10], s: [2.4, 2.2, 3], col: '#ffe6a8', n: 110, size: 0.022, op: 0.6 } }),
  act: (f, T) => { const poke = Math.sin(ramp(f, 1118, 1128) * Math.PI), wob_ = f >= 1123 ? Math.sin((f - 1123) * 1.3) * Math.exp(-(f - 1123) * 0.14) : 0;
    return [A(T, BALD, { maskEdge: 1, gloss: 1.4, glossX: q(lerp(-0.35, 0.55, ramp(f, 1074, 1149)), 2), look: Math.floor(f / 8) % 2 ? 0.9 : -0.9, eyeOpen: 1.2, sweat: 2, sweatT: q(f / 34, 2), headTilt: q(7 * wob_, 1), L: { x: 108, y: 590, b: 0.2 }, R: { x: 492, y: 590, b: 0.2 } }, dP, { hi: true, rim: RIM2, order: 3, tint: '#fff6e6' }),
      stopPair(f, T, { hand: poke > 0.02 ? [lerp(g1Door[0] - 0.2, dP[0] + 0.27, poke), lerp(1.2, 1.86, poke)] : null, gex: 'wide', brow: 0, gblink: (f >= 1096 && f < 1100) || (f >= 1106 && f < 1110) ? 1 : 0, gtilt: q(6 * ramp(f, 1090, 1100), 0) }),
      F('wigh', (p) => T.propWig(p, { sway: q(0.12 * Math.sin(f * 0.25), 1) }), [g1Door[0] + 0.42, 0.55, g1Door[2] + 0.05], 0.8, { order: 5, tint: TINT.door })]; },
  fx: (f, T) => { const out = [F('hg', (p) => T.fxGlow(p, '235,255,235', 0.55), [dP[0] - 0.12 + 0.3 * ramp(f, 1074, 1149), 1.3, dP[2] + 0.05], 0.36, { order: 6 })];
    if (f >= 1086 && f < 1100) out.push(F('tg' + f, (p) => T.fxBurst(p, q((f - 1086) / 14, 2), '#ffffff', 8, 14, 110), [dP[0] - 0.14, 1.72, dP[2] + 0.1], 0.36, { order: 7 }));
    if (f >= 1123 && f < 1135) out.push(F('sq' + f, (p) => T.fxCreak(p, q((f - 1123) / 12, 2)), [dP[0] + 0.3, 1.8, dP[2] + 0.1], 0.4, { order: 7 }));
    return out; },
});
// --- shot 18: the mask comes off on "Maske" (f 1177) ---
const pl0 = 1168, pl1 = 1189;
const peelT = (f) => f < 1178 ? 0.3 * eo(ramp(f, pl0, 1178)) : lerp(0.3, 1, smooth(ramp(f, 1178, pl1)));
shot('maskoff', 1149, 'door', {
  cam: (f) => { const u = ramp(f, 1149, 1197), k = smooth(ramp(f, 1176, pl1)); return { pos: [cx + 0.1, 1.62, -8.05 - 0.2 * u], look: [cx + 0.04, 1.62 + 0.1 * k, -10.55], fov: 36, roll: 1.5 - 3 * k }; },
  dof: (f, C) => ({ focus: dist(C.pos, [dP[0], 1.6, dP[2]]), cinf: 12 }),
  world: (f) => ({ set: 'cor', door: 0.2, stand: [cx - 2.0, 0, -6.0], motes: { c: [cx, 1.6, -10], s: [2.4, 2.4, 3], col: '#ffe6a8', n: 110, size: 0.022, op: 0.6 } }),
  act: (f, T) => { const pt = peelT(f), done = f >= pl1, gr = eo(ramp(f, 1154, 1166));
    // hand follows the lifting mask edge: design y of the edge = cy + ry*1.2 - lift*1.25 with cy = 220, ry = 123.5
    const edgeY = 220 + 123.5 * 1.2 - pt * 123.5 * 1.5 * 1.25, wy = (975 - edgeY) / 1000 * CMH, hand = done ? [dP[0] + 0.45, 2.3 + 0.2 * ramp(f, pl1, 1197)] : f < pl0 ? [lerp(g1Door[0] - 0.2, dP[0] + 0.3, gr), lerp(1.0, 1.36, gr)] : [dP[0] + 0.3 - 0.06 * pt, wy];
    return [A(T, done ? UNMASK : BALD, done ? { expr: 'grump', sweat: 5, sweatT: q(f / 30, 2), L: { x: 108, y: 590, b: 0.2 }, R: { x: 492, y: 590, b: 0.2 } } : f < pl0 ? { maskEdge: 1, gloss: 1.2, eyeOpen: 1.25, look: 0.9, sweat: 2, sweatT: q(f / 34, 2), L: { x: 108, y: 590, b: 0.2 }, R: { x: 492, y: 590, b: 0.2 } }
        : { peel: q(pt, 2), sweatT: q(f / 30, 2), L: { x: 108, y: 590, b: 0.2 }, R: { x: 492, y: 590, b: 0.2 } }, dP, { hi: true, rim: RIM2, order: 3, tint: '#fff6e6' }),
      stopPair(f, T, { hand, hb: 1.2, gex: done ? 'shock' : 'determined', brow: 0 })]; },
  fx: (f, T) => { if (f < pl1) return []; const t = (f - pl1) / 8, wb = q(Math.sin((f - pl1) * 1.5), 1); return [F('mf' + wb, (p) => T.propMask(p, 1, { wob: wb }), [dP[0] + 0.45, 1.45 + 0.2 * t, dP[2] + 0.3], 0.55, { order: 6, hi: true, roll: q(-0.3 + 0.2 * wb, 2) }),
    F('pb' + f, (p) => T.fxBurst(p, q(clamp(t), 2), '#ffffff', 10, 40, 240), [dP[0], 1.5, dP[2] - 0.1], 1.0, { order: 2 })]; },
});
// --- shot 19: a man in his forties ---
shot('reveal', 1197, 'door', {
  cam: (f) => { const t = eo(ramp(f, 1226, 1240)), u = ramp(f, 1240, 1277); return { pos: l3([cx - 0.1, 1.72, -8.6 - 0.1 * ramp(f, 1197, 1226)], [cx + 0.15, 1.4, -6.95 + 0.2 * u], t), look: l3([cx - 0.12, 1.7, -10.6], [cx + 0.1, 1.2, -10.6], t), fov: lerp(24, 46, t), roll: lerp(-2, 1, t) }; },
  dof: (f, C) => ({ focus: dist(C.pos, [dP[0], 1.5, dP[2]]), cinf: lerp(14, 5, ramp(f, 1226, 1240)) }),
  world: (f) => ({ set: 'cor', door: 0.2, alarm: f >= 1226 ? 1 : 0, stand: [cx - 2.0, 0, -6.0], motes: { c: [cx, 1.6, -9.5], s: [3, 2.6, 4], col: '#ffe6a8', n: 130, size: 0.026, op: 0.6 } }),
  act: (f, T) => { const w = f >= 1226, bl = (f >= 1205 && f < 1209) || (f >= 1215 && f < 1219) || (f >= 1250 && f < 1254) ? 1 : 0;
    const ph = (i) => ({ holdR: 'phone', R: { x: 430, y: q(300 + 8 * Math.sin(f * 0.3 + i), 0), b: 1 }, expr: ['laugh', 'goofy', 'happy'][i % 3], blink: blinkAt(f, i + 2) });
    return [A(T, G3, ph(0), [cx - 0.95, 0, -11.2], { s: 1.0, tint: TINT.door }), A(T, G4, ph(1), [cx - 0.35, 0, -11.5], { s: 1.0, tint: TINT.door, flip: true }), A(T, G2, { ...ph(2), holdL: 'mug', L: { x: 140, y: 470 } }, [cx + 1.2, 0, -11.1], { s: 1.0, tint: TINT.door }),
      A(T, UNMASK, { expr: 'grump', blink: bl, look: w && f > 1252 ? 0.9 : 0, sweat: 5, sweatT: q(f / 30, 2), L: w ? 'cross' : { x: 108, y: 590, b: 0.2 }, R: w ? 'cross' : { x: 492, y: 590, b: 0.2 } }, dP, { hi: true, rim: RIM2, order: 3, tint: '#fff6e6' }),
      stopPair(f, T, { hand: [g1Door[0] + 0.38, 1.3], gex: 'smug', brow: 0, hb: -1 }),
      F('mh', (p) => T.propMask(p, 1, { wob: q(Math.sin(f * 0.4), 1) }), [g1Door[0] + 0.4, 0.42, g1Door[2] + 0.1], 0.5, { order: 6, roll: -0.2, tint: TINT.door }),
      F('wfl', (p) => T.propWig(p, { len: 1.2 }), [dP[0] - 0.75, -0.62, dP[2] + 0.5], 0.7, { order: 6, tint: TINT.door })]; },
  fx: (f, T) => f >= 1226 ? [0, 1, 2].flatMap((i) => { const per = 17 + i * 5, t = ((f + i * 6) % per) / 6; return t < 1 ? [F('fl' + i + q(t, 1), (p) => T.fxGlow(p, '255,255,255', q(1 - t, 1)), [[cx - 0.86, cx - 0.44, cx + 1.3][i], 0.9, -11.0], 0.4, { order: 7 })] : []; }) : [],
});
// --- shot 20: the video goes around the world ---
shot('phone', 1277, 'viral', {
  cam: (f) => { const u = ramp(f, 1277, 1306), k = eo(ramp(f, 1296, 1306)); return { pos: [vr + 0.1, 3.0, 9.6 - 0.25 * u + 1.2 * k], look: [vr, 2.95, 7], fov: 36, roll: -3 + 2 * u }; },
  dof: (f, C) => ({ focus: dist(C.pos, [vr, 3, 7]), cinf: 12 }),
  world: (f) => ({ set: 'viral', pop: 0, motes: { c: [vr, 3, 6], s: [6, 5, 4], col: '#bfd8ff', n: 120, size: 0.03 } }),
  act: (f, T) => [],
  fx: (f, T) => { const out = [F('scr' + q((f % 24) / 24, 1), (p) => T.propScreen(p, { t: q((f % 24) / 24, 1) }), [vr + 0.02 * Math.sin(f * 0.3), 1.98 + 0.6 * (1 - back(ramp(f, 1277, 1285))) * -1, 7], 0.85, { hi: true, order: 5, roll: q(0.03 * Math.sin(f * 0.25), 3) }),
      F('pg', (p) => T.fxGlow(p, '150,200,255', 0.6), [vr, 1.2, 6.8], 1.6, { order: 3 })];
    [[1283, 0, -0.5, 3.2], [1287, 1, 0.48, 3.5], [1291, 2, -0.42, 2.45], [1295, 0, 0.44, 2.7], [1299, 4, -0.1, 3.95]].forEach(([a, k, x, y], i) => { if (f >= a) { const t = clamp((f - a) / 14); out.push(F('bb' + i + q(t, 1), (p) => T.propBubble(p, k, q(t, 1)), [vr + x, y - 1.1 + 0.004 * (f - a), 7.15], 0.42, { order: 7 })); } });
    return out; },
});
shot('globe', 1306, 'viral', {
  cam: (f) => { const u = ramp(f, 1306, 1338), t = eo(ramp(f, 1306, 1318)); const a = 0.25 - 0.3 * u, r = lerp(9, 13.5, t) - 0.5 * u; return { pos: [vr + Math.sin(a) * r, 3.0 + 0.3 * u, Math.cos(a) * r], look: [vr, 2.75, 0], fov: 40, roll: 2 - 3 * u }; },
  dof: (f, C) => ({ focus: dist(C.pos, [vr, 3, 1.5]), cinf: 6 }),
  world: (f) => ({ set: 'viral', pop: (f - 1304) / 22, motes: { c: [vr, 3, 3], s: [10, 7, 6], col: '#bfd8ff', n: 200, size: 0.035 } }),
  act: () => [],
  fx: (f, T) => { const out = []; for (let i = 0; i < 9; i++) { const a = 1308 + i * 3, per = 22 + (i % 3) * 4; if (f < a) continue; const t = ((f - a) % per) / per, an = i * 2.4 + 0.5, r = 2.5 + (i % 3) * 0.35;
      out.push(F('gb' + i + q(t, 1), (p) => T.propBubble(p, i % 5, q(Math.min(1, t * 1.6), 1)), [vr + Math.cos(an) * r * 0.9, 3.2 + Math.sin(an) * r - 1.1 + t * 0.25, 2.0 + (i % 2) * 0.4], 0.5, { order: 6, alpha: t > 0.8 ? q((1 - t) * 5, 1) : 1 })); }
    return out; },
});
// --- shot 21: and the craziest part? not even his first attempt ---
const dadBunk = [ce + 0.2, 0, -1.0];
shot('crazy', 1338, 'cell', {
  cam: (f) => { const u = ramp(f, 1338, 1379); return { pos: [ce + 1.0 - 1.3 * u, 1.45, 4.3 - 0.25 * u], look: [ce + 0.2 - 0.1 * u, 1.35, -1.6], fov: 34, roll: -1 + 2 * u }; },
  dof: (f, C) => ({ focus: dist(C.pos, [dadBunk[0], 1.4, dadBunk[2]]), cinf: 13, near: 1.6 }),
  world: (f) => ({ set: 'cell', planOnBed: false, motes: { c: [ce - 0.2, 1.4, -0.6], s: [2.2, 2.6, 3], col: '#e0f0ff', n: 170, size: 0.024 } }),
  act: (f, T) => [A(T, DAD, { expr: 'grump', L: 'cross', R: 'cross', look: f < 1360 ? -0.8 : 0, blink: blinkAt(f, 2), headTilt: q(4 * Math.sin(f * 0.1), 0) }, dadBunk, { s: 1.0, hi: true, rim: RIMB })],
  fx: (f, T) => [F('pl2', (p) => T.propPlan(p), [ce - 0.75, -0.28, -0.5], 0.32, { roll: 1.2, order: 2, tint: '#c8d0dc' })],
});
const shrug = (f, a, b) => { const up = eo(ramp(f, a, a + 7)) - smooth(ramp(f, b - 8, b)); return { up, o: { L: { x: q(lerp(110, 60, up), 0), y: q(lerp(600, 400, up), 0), b: q(lerp(0.2, -1.6, up), 1) }, R: { x: q(lerp(490, 540, up), 0), y: q(lerp(600, 400, up), 0), b: q(lerp(0.2, -1.6, up), 1) }, bob: q(0.022 * up, 3), headTilt: q(8 * up, 0) } }; };
shot('shrug', 1379, 'cell', {
  cam: (f) => { const u = ramp(f, 1379, 1439); return { pos: [ce + 0.3 - 0.12 * u, 1.45, 2.7 - 0.5 * u], look: [dadBunk[0], 1.42, dadBunk[2]], fov: 34, roll: 2 - 3 * u }; },
  dof: (f, C) => ({ focus: dist(C.pos, [dadBunk[0], 1.4, dadBunk[2]]), cinf: 12 }),
  world: (f) => ({ set: 'cell', bars: false, planOnBed: false, motes: { c: [ce, 1.4, 0], s: [2.6, 2.6, 3], col: '#e0f0ff', n: 170, size: 0.024 } }),
  act: (f, T) => { const s = shrug(f, 1398, 1432); return [A(T, DAD, { expr: s.up > 0.3 ? 'smug' : 'neutral', browLift: q(12 * s.up, 0), blink: blinkAt(f, 2), ...s.o }, dadBunk, { s: 1.0, hi: true, rim: RIMB })]; },
});
// --- shot 22: years before, with thirty others ... through the sewer (sepia) ---
shot('sewer', 1439, 'sewer', {
  cam: (f) => { const u = ramp(f, 1439, 1495); return { pos: [sw + 0.35 - 0.3 * u, 1.1, 3.5 + 0.5 * u], look: [sw - 0.05, 1.05, -3], fov: 50, roll: -2 + 3 * u }; },
  dof: (f, C) => ({ focus: 4, cinf: 6 }),
  world: (f) => ({ set: 'sewer', motes: { c: [sw, 1.6, 2], s: [4.5, 2.6, 10], col: '#ffe8b0', n: 200, size: 0.035, op: 0.6 } }),
  act: (f, T) => { const out = [];
    for (let i = 0; i < 7; i++) { const z = 0.9 - i * 1.6 + 0.03 * (f - 1439), last = i === 6; out.push(A(T, last ? DADMUD : CON(i), { expr: ['laugh', 'goofy', 'happy', 'determined', 'goofy', 'laugh', 'sly'][i], legs: 'walk', step: step(f + i * 4, 16), bob: wbob(f + i * 4, 8, 0.02), L: i % 2 ? 'up' : { x: 150, y: 420 }, R: i % 3 === 0 ? 'wave' : { x: 450, y: 430 }, tilt: q(4 * Math.sin(f * 0.3 + i), 0), look: q(Math.sin(i * 2.1), 1) }, [sw + (i % 2 ? 0.55 : -0.5) + 0.1 * Math.sin(i * 1.7), -0.42, z], { s: last ? 1.0 : 0.95, rim: { side: i % 2 ? 1 : -1, col: '255,214,140', a: 0.85, w: 9 } })); }
    return out; },
  fx: (f, T) => { const out = [];
    for (let i = 0; i < 4; i++) { const z = 3.5 - i * 3.2 + 0.09 * (f - 1439); out.push(F('rat' + step(f + i * 3, 8), (p) => T.propRat(p, step(f + i * 3, 8)), [sw + (i % 2 ? -2.25 : 2.2), 0.16, z], 0.26, { flip: false, order: 4, tint: TINT.sewer, yaw: 0 })); }
    for (let i = 0; i < 7; i++) { const z = 0.9 - i * 1.6 + 0.03 * (f - 1439), t = ((f + i * 5) % 12) / 12; out.push(F('spl' + q(t, 1), (p) => T.fxSplash(p, q(t, 1)), [sw + (i % 2 ? 0.55 : -0.5), 0.1, z + 0.08], 0.3, { order: 6, tint: '#c8c8a0' })); }
    for (let i = 0; i < 4; i++) { const t = ((f * 0.02 + i * 0.27) % 1); out.push(F('stm' + i + q(t, 1), (p) => T.fxPuff(p, q(t, 1)), [sw + (i % 2 ? 1.4 : -1.5), 0.9 + t * 1.2, 2 - i * 3.5], 1.6, { order: 4, alpha: 0.6 })); }
    return out; },
});
const popY = (f, a, h = 1.9) => lerp(-h, 0, back(ramp(f, a, a + 9)));
const cons22 = (f, T, n0 = 0) => { const out = [];
  for (let i = n0; i < 7; i++) { const a = 1503 + i * 7, y = popY(f, a), run = ramp(f, a + 10, a + 46), dir = i % 2 ? 1 : -1; if (f < a) continue;
    const x = dir * (0.15 + run * (3.4 + (i % 3) * 0.5)), z = run * (0.5 + (i % 3) * 0.9) - (i % 2) * run * 1.6;
    out.push(A(T, CON(i), { expr: ['laugh', 'goofy', 'happy', 'laugh', 'goofy', 'happy', 'laugh'][i], legs: run > 0 ? 'walk' : 'stand', step: step(f + i * 3, 10), bob: run > 0 ? wbob(f + i * 3, 5, 0.02) : 0, L: 'up', R: run > 0 ? { x: 470, y: 420 } : 'up', turn: q(dir * 0.5 * Math.min(1, run * 4), 1) }, [st + x, y, z], { s: 0.95, flip: false, order: 3, rim: { side: -1, col: '255,214,140', a: 0.85, w: 9 } })); }
  return out; };
shot('manhole', 1495, 'street', {
  cam: (f) => { const u = ramp(f, 1495, 1551); return { pos: [st + 1.2 - 0.5 * u, 2.0 - 0.3 * u, 5.0 - 0.5 * u], look: [st + 0.1, 0.95, 0], fov: 42, roll: 2 - 3 * u }; },
  dof: (f, C) => ({ focus: dist(C.pos, [st, 1, 0]), cinf: 6 }),
  world: (f) => ({ set: 'street', cover: back(ramp(f, 1495, 1504)), motes: { c: [st, 1.6, 1], s: [8, 3.5, 6], col: '#ffe8b0', n: 160, size: 0.035, op: 0.5 } }),
  act: (f, T) => cons22(f, T),
  fx: (f, T) => { const out = []; for (let i = 0; i < 7; i++) { const a = 1503 + i * 7, t = (f - a) / 10; if (t >= 0 && t < 1) out.push(F('pp' + i + q(t, 1), (p) => T.fxBurst(p, q(t, 1), '#fff3b0', 8, 20, 150), [st, -0.1, 0.1], 0.8, { order: 2 })); }
    for (let i = 0; i < 3; i++) { const t = ((f * 0.025 + i * 0.33) % 1); out.push(F('stm' + i + q(t, 1), (p) => T.fxPuff(p, q(t, 1)), [st + 3.2, 0.2 + t * 1.6, 0.6], 1.4, { order: 4, alpha: 0.5 })); }
    return out; },
});
shot('final', 1551, 'street', {
  cam: (f) => { const u = ramp(f, 1551, 1622); return { pos: [st + 0.35 - 0.15 * u, 0.95, 3.35 - 0.7 * u], look: [st, 0.86 + 0.04 * u, 0], fov: 40, roll: -2 + 2.5 * u }; },
  dof: (f, C) => ({ focus: dist(C.pos, [st, 0.9, 0]), cinf: 11 }),
  world: (f) => ({ set: 'street', cover: 1, motes: { c: [st, 1.2, 1], s: [5, 3, 5], col: '#ffe8b0', n: 160, size: 0.03, op: 0.5 } }),
  act: (f, T) => { const y = lerp(-2.0, -0.92, back(ramp(f, 1553, 1563))), s = shrug(f, 1576, 1640);
    const out = [];
    for (let i = 4; i < 7; i++) { const dir = i % 2 ? 1 : -1, run = ramp(f, 1540, 1640); out.push(A(T, CON(i), { expr: 'laugh', legs: 'walk', step: step(f + i * 3, 12), bob: wbob(f + i * 3, 6, 0.02), L: 'up', R: 'up', turn: dir * 0.5 }, [st + dir * (2.2 + run * 2 + (i - 4) * 0.8), 0, -2.5 - (i - 4) * 1.5], { s: 0.95 })); }
    out.push(A(T, DADMUD, { expr: f < 1572 ? 'happy' : s.up > 0.3 ? 'sly' : 'smug', browLift: q(10 * s.up, 0), blink: blinkAt(f, 2), ...(f < 1572 ? { L: { x: 70, y: 560, b: 1 }, R: { x: 530, y: 560, b: 1 } } : s.o) }, [st, y + (f < 1572 ? 0 : 0), 0.02], { s: 1.0, hi: true, order: 3, rim: { side: -1, col: '255,214,140', a: 0.95, w: 11, col2: '160,255,170', a2: 0.6, w2: 7 } }));
    return out; },
  fx: (f, T) => { const out = [], y = lerp(-2.0, -0.92, back(ramp(f, 1553, 1563)));
    if (f >= 1553 && f < 1565) out.push(F('fp' + f, (p) => T.fxBurst(p, q((f - 1553) / 12, 2), '#fff3b0', 10, 30, 200), [st, -0.1, -0.1], 1.1, { order: 2 }));
    const rt = back(ramp(f, 1566, 1574)); if (f >= 1566) out.push(F('rath' + step(f, 10), (p) => T.propRat(p, f < 1580 ? step(f, 10) : 0.1 * Math.round(Math.sin(f * 0.5))), [st + 0.02, y + 1.72 + 0.12 * rt, 0.06], 0.22 * Math.min(1, rt), { order: 6 }));
    for (let i = 0; i < 3; i++) { const t = ((f * 0.022 + i * 0.33) % 1); out.push(F('stm' + i + q(t, 1), (p) => T.fxPuff(p, q(t, 1)), [st + (i - 1) * 0.5, 0.1 + t * 1.3, -0.5], 1.2, { order: 2, alpha: 0.45 })); }
    return out; },
});

// =====================================================================================================
SH.forEach((s, i) => { s.b = (SH[i + 1] ? SH[i + 1].a : TOTAL) - 1; });
export const SHOTS = SH;
export const shotAt = (f) => { const ff = Math.max(0, Math.floor(f + 1e-6)); for (let i = SH.length - 1; i >= 0; i--) if (ff >= SH[i].a) return SH[i]; return SH[0]; };
// whip transitions at cuts: [cut frame, yaw deg, pitch m]; kicks; flashes
const WHIPS = [[180, 26, 0], [306, -28, 0], [412, 26, 0], [481, 0, -1.6], [586, -26, 0], [804, 24, 0], [1277, 30, 0], [1338, -26, 0], [1495, 0, 2.2]];
const KICKS = [[258, 0.02], [507, 0.012], [526, 0.012], [545, 0.02], [813, 0.025], [990, 0.03], [1049, 0.035], [1123, 0.012], [1189, 0.035], [1228, 0.02], [1503, 0.012], [1555, 0.02]];
const FLASH = [[223, 0.55], [1049, 0.45], [1197, 0.75], [1277, 0.5], [1439, 0.9], [545, 0.3]];
const inWhip = (f) => WHIPS.some(([c]) => f >= c - 3 && f < c + 4) || (f >= 614 && f < 621) || (f >= 757 && f < 763) || (f >= 657 && f < 664) || (f >= 1228 && f < 1234) || (f >= 813 && f < 818);
globalThis.mbAt = (f) => (inWhip(f) ? 5 : 1);
export const lightFor = (S, f) => { const L = { ...LIGHTS[S.light] };
  if (S.id === 'plan') { const n = hsh(Math.floor(f / 2) * 3.1); if (n > 0.8) L.hemi *= 0.72; }
  if (S.id === 'reveal' && f >= 1226) { L.gain = Math.floor(f / 4) % 2 ? '#ffe2d8' : '#fff4dc'; }
  if (S.id === 'pMask') L.hemi *= 0.85;
  return L; };
export const camAt = (f) => {
  const S = shotAt(f), c0 = S.cam(f), c = { pos: [...c0.pos], look: [...c0.look], fov: c0.fov, roll: c0.roll || 0 };
  for (const [cut, yaw, pit] of WHIPS) { const d = f - cut; let k = 0; if (d >= -3 && d < 0) k = ((d + 3) / 3) ** 2; else if (d >= 0 && d < 4) k = -((1 - d / 4) ** 2); if (k) {
      const a = yaw * k * Math.PI / 180, vx = c.look[0] - c.pos[0], vz = c.look[2] - c.pos[2]; c.look[0] = c.pos[0] + vx * Math.cos(a) - vz * Math.sin(a); c.look[2] = c.pos[2] + vx * Math.sin(a) + vz * Math.cos(a); c.look[1] += pit * k; } }
  for (const [kf, a] of KICKS) { const d = Math.floor(f) - kf; if (d >= 0 && d < 7) { const s = (d % 2 ? -1 : 1) * a * (1 - d / 7); c.look[1] += s * 3; c.look[0] += s * 1.5; c.roll += s * 22; } }
  let fl = 0; for (const [ff, a] of FLASH) { const d = f - ff; if (d >= 0 && d < 5) fl = Math.max(fl, a * (1 - d / 5)); }
  c.flash = fl; c.shadowAt = c.look;
  return c;
};
export const dofAt = (f) => { const S = shotAt(f); return S.dof ? S.dof(f, camAt(f)) : { focus: 5, cinf: 0 }; };
export const worldAt = (f) => shotAt(f).world(f);
export const actorsAt = (f, T) => { const S = shotAt(f); LT = S.light; return S.act ? S.act(f, T) : []; };
export const fxAt = (f, T) => { const S = shotAt(f); LT = S.light; return S.fx ? S.fx(f, T) : []; };
