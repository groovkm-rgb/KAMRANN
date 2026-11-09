// Shot plan for "Der Tür-zu-Knopf" — timed to voice.mp3 (44.12 s) + 0.5 s tail = 1339 frames @ 30 fps.
// Phrase times (s), checked by hand against the 10 ms RMS envelope (see work/phrases.json):
//  0.13-0.99 Du stehst im Aufzug. | 1.18-1.93 Du hast es eilig. | 2.15-2.85 Also drückst du: | 3.00-3.45 Tür zu. |
//  3.62-4.05 Einmal. | 4.09-4.58 Zweimal. | 4.65-5.14 Fünfmal. | 5.40-5.85 Und? | 6.27-6.90 Die Tür geht zu. | 7.33-8.14 Hat geklappt, oder? |
//  8.58-10.03 In vielen amerikanischen Aufzügen … | 10.30-11.75 hätte sich die Tür sowieso geschlossen. | 12.14-13.65 Der Knopf macht dort oft gar nichts. |
//  14.19-15.94 Seit einem Gesetz für Menschen mit Behinderung | 16.13-17.82 müssen die Türen lange genug offen bleiben – | 18.09-19.72 damit jeder in Ruhe einsteigen kann. |
//  20.13-21.52 Kein Knopf darf das abkürzen. | 21.84-23.44 Nur die Feuerwehr hat einen Schlüssel, | 23.51-25.08 mit dem er wirklich funktioniert. |
//  25.48-25.87 Aber | 26.41-28.19 warum ist der Knopf dann überhaupt noch da? | 28.62-29.52 Weil er dich beruhigt. | 29.95-31.76 Psychologen nennen das gefühlte Kontrolle: |
//  32.13-33.54 Wenn du glaubst, etwas tun zu können, | 33.72-34.95 bist du weniger gestresst. | 35.31-36.04 Und in New York? | 36.41-37.82 Waren an den Fußgängerampeln |
//  37.87-39.55 über zweitausendfünfhundert Drückknöpfe … | 39.94-40.80 nur Attrappen. | 41.13-41.43 Also: | 41.79-43.80 Wie viele Knöpfe hast du heute schon umsonst gedrückt?
// Every cut sits in a silence between phrases; no shot is longer than 90 frames (3.0 s); phrases < 0.8 s are merged into the next shot.
import { M as E, camFromKeys, blinkAt, q } from './motion.js';

export const FPS = 30, TOTAL = 1339;
export const SHOTS = [
  { id: 's01', a: 0, b: 31, set: 'lobby', light: 'lobby' },       // dash through the closing doors
  { id: 's02', a: 32, b: 105, set: 'lobby', light: 'cabin' },     // eilig: watch, coffee, foot -> finger to "close"
  { id: 's03', a: 106, b: 157, set: 'lobby', light: 'cabin' },    // Einmal / Zweimal / Fünfmal punch-ins
  { id: 's04', a: 158, b: 214, set: 'lobby', light: 'cabin' },    // Und? doors slowly close
  { id: 's05', a: 215, b: 252, set: 'lobby', light: 'cabin' },    // proud finger-gun
  { id: 's06', a: 253, b: 304, set: 'blueprint', light: 'bp' },   // x-ray: wires
  { id: 's07', a: 305, b: 358, set: 'blueprint', light: 'bp' },   // hourglass + gears close the doors
  { id: 's08', a: 359, b: 419, set: 'blueprint', light: 'bp' },   // press: light blinks, cut wire swings
  { id: 's09', a: 420, b: 481, set: 'lobby', light: 'lobby' },    // wheelchair user approaches
  { id: 's10', a: 482, b: 538, set: 'lobby', light: 'lobby' },    // doors wait, green sensor
  { id: 's11', a: 539, b: 598, set: 'lobby', light: 'cabin' },    // both women roll / walk in
  { id: 's12', a: 599, b: 651, set: 'lobby', light: 'cabin' },    // pressing again, sand keeps running
  { id: 's13', a: 652, b: 703, set: 'lobby', light: 'red' },      // firefighter + key
  { id: 's14', a: 704, b: 761, set: 'lobby', light: 'red' },      // zack! doors slam
  { id: 's15', a: 762, b: 849, set: 'lobby', light: 'cabin' },    // why is it there? thought bubble
  { id: 's16', a: 850, b: 894, set: 'lobby', light: 'cabin' },    // press -> stress cloud puffs away
  { id: 's17', a: 895, b: 961, set: 'lab', light: 'lab' },        // brain + toy steering wheel
  { id: 's18', a: 962, b: 1048, set: 'lab', light: 'lab' },       // stress meter red -> green
  { id: 's19', a: 1049, b: 1134, set: 'city', light: 'city' },    // New York crossing
  { id: 's20', a: 1135, b: 1224, set: 'city', light: 'city' },    // button x-ray -> endless pole field
  { id: 's21', a: 1225, b: 1314, set: 'lobby', light: 'cabin' },  // looks at us, finger hovers
  { id: 's22', a: 1315, b: 1338, set: 'lobby', light: 'cabin' },  // presses anyway, grin, ding
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const ramp = (f, a, b) => clamp((f - a) / (b - a));
const sm = E.smooth;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// ---------- lights ----------
export const LIGHTS = {
  lobby: { az: 96, el: 24, sky: '#fff4e6', ground: '#d6c4aa', hemi: 1.25, sun: '#ffefd2', sunI: 2.2, skyTop: '#5ea2e8', skyHor: '#d6ecff', sat: 1.12, vig: 0.16, shadowExt: 9 },
  cabin: { az: 115, el: 68, sky: '#fffaf2', ground: '#cdbda8', hemi: 1.45, sun: '#fffaf0', sunI: 1.45, sat: 1.1, vig: 0.16, shadowExt: 3.5 },
  red: { az: 115, el: 68, sky: '#fff2f0', ground: '#d8b4b4', hemi: 1.45, sun: '#ffeae6', sunI: 1.45, sat: 1.1, vig: 0.3, shadowExt: 3.5, tint: '#fff4f2' },
  bp: { az: 125, el: 55, sky: '#e2efff', ground: '#4d74ad', hemi: 1.55, sun: '#ffffff', sunI: 1.2, sat: 1.06, vig: 0.26, shadowExt: 3, ink: '#eaf6ff' },
  lab: { az: 128, el: 58, sky: '#ffffff', ground: '#cfd8e0', hemi: 1.45, sun: '#fffdf6', sunI: 1.35, sat: 1.1, vig: 0.15, shadowExt: 6 },
  city: { az: 140, el: 47, sky: '#cfe3ff', ground: '#8f8572', hemi: 1.15, sun: '#fff2dc', sunI: 2.4, skyTop: '#3d86de', skyHor: '#d2e8ff', fog: '#d8e8f6', fogNear: 120, fogFar: 520, sat: 1.15, vig: 0.16, shadowExt: 16 },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 's20') { const t = sm(ramp(f, 1168, 1215)); L.fogNear = lerp(120, 45, t); L.fogFar = lerp(520, 190, t); L.shadowExt = lerp(8, 30, t); }
  if (S.id === 's19') L.shadowExt = lerp(30, 9, sm(ramp(f, 1049, 1078)));
  if (S.id === 's13') { const pulse = 0.5 + 0.5 * Math.sin(f * 0.35); L.hemi = 1.2 + 0.15 * pulse; }
  return L;
};
const tintOf = (S) => LIGHTS[S.light].tint || '#ffffff';

// ---------- key places ----------
const BTN_CLOSE = [0.922, 0.98, -0.237], BTN_OPEN = [0.798, 0.98, -0.237], KEYHOLE = [0.86, 0.84, -0.229];
const BP_CLOSE = [0.075, 1.22, 0.05];
const POLE = [-7.7, 0.16, 6.8], PBTN = [-7.62, 1.13, 6.66], PDIR = [0.498, 0, -0.867];
const camOrbit = (tgt, dir, d) => { const l = Math.hypot(...dir); return tgt.map((v, i) => v + dir[i] / l * d); };

// punch-in schedule for "Einmal. Zweimal. Fünfmal." (word onsets f109 / f123 / f140)
const PUNCH = [[106, 0.62, 0], [108, 0.46, -2], [122, 0.34, 3], [139, 0.24, -5]];
const punchAt = (f) => { let d = PUNCH[0][1], r = 0; for (let i = 0; i < PUNCH.length; i++) { const [k, dd, rr] = PUNCH[i]; if (f >= k) { const prev = i ? PUNCH[i - 1] : PUNCH[0]; const t = E.easeOut(ramp(f, k, k + 3)); d = lerp(prev[1], dd, t); r = lerp(prev[2], rr, t); } } return { d: d * (1 - 0.0015 * (f - 106)), r }; };

// ---------- cameras ----------
const CAMS = {
  s01: [
    { f: 0, pos: [0.0, 1.45, -1.3], look: [0.0, 1.22, 3.5], fov: 50 },
    { f: 14, pos: [0.0, 1.47, -2.25], look: [0.0, 1.26, 2.0], fov: 49, ease: 'easeOut' },
    { f: 31, pos: [-0.05, 1.5, -3.25], look: [0.0, 1.32, 0.5], fov: 47 },
  ],
  s02: [
    { f: 32, pos: [-0.38, 1.5, -3.35], look: [-0.06, 1.36, -0.6], fov: 44 },
    { f: 62, pos: [-0.3, 1.5, -3.1], look: [-0.04, 1.36, -0.6], fov: 43 },
    { f: 84, pos: [0.25, 1.32, -1.15], look: [0.88, 1.05, -0.24], fov: 44, ease: 'smooth' },
    { f: 105, pos: [0.5, 1.12, -0.7], look: [0.91, 0.99, -0.24], fov: 42 },
  ],
  s04: [
    { f: 158, pos: [-0.3, 1.5, -3.45], look: [-0.06, 1.36, 0.0], fov: 46 },
    { f: 214, pos: [-0.24, 1.5, -3.15], look: [-0.08, 1.34, 0.0], fov: 44, roll: 1 },
  ],
  s05: [
    { f: 215, pos: [-0.02, 1.5, -3.35], look: [-0.1, 1.4, -0.6], fov: 44, roll: -1.5 },
    { f: 252, pos: [0.0, 1.5, -3.05], look: [-0.12, 1.4, -0.6], fov: 41, roll: 1.5 },
  ],
  s06: [
    { f: 253, pos: [0.7, 1.95, 1.05], look: [0.0, 1.62, -0.12], fov: 46 },
    { f: 285, pos: [0.78, 1.55, 1.1], look: [0.02, 1.25, -0.12], fov: 46 },
    { f: 304, pos: [0.8, 1.12, 1.2], look: [0.05, 0.86, -0.14], fov: 46 },
  ],
  s07: [
    { f: 305, pos: [0.85, 0.18, 1.65], look: [0.02, -0.32, -0.12], fov: 46 },
    { f: 358, pos: [0.62, 0.05, 1.3], look: [0.02, -0.38, -0.12], fov: 44, roll: -2 },
  ],
  s08: [
    { f: 359, pos: [0.55, 1.4, 0.82], look: [0.08, 1.1, -0.06], fov: 44 },
    { f: 419, pos: [0.42, 1.22, 0.55], look: [0.1, 0.98, -0.08], fov: 42, roll: 3 },
  ],
  s09: [
    { f: 420, pos: [0.08, 1.3, -1.6], look: [0.05, 1.02, 3.5], fov: 50 },
    { f: 481, pos: [0.05, 1.26, -1.2], look: [0.04, 0.98, 3.5], fov: 48 },
  ],
  s10: [
    { f: 482, pos: [1.3, 1.45, 4.2], look: [0.05, 1.12, 0.0], fov: 44 },
    { f: 538, pos: [1.1, 1.4, 3.75], look: [0.05, 1.08, 0.0], fov: 43 },
  ],
  s11: [
    { f: 539, pos: [0.0, 1.5, -3.6], look: [0.0, 1.18, 0.6], fov: 50 },
    { f: 598, pos: [-0.05, 1.52, -3.8], look: [0.0, 1.16, 0.4], fov: 52 },
  ],
  s12: [
    { f: 599, pos: [-0.3, 1.5, -3.35], look: [0.42, 1.3, -0.4], fov: 44 },
    { f: 651, pos: [-0.22, 1.5, -3.1], look: [0.45, 1.28, -0.35], fov: 42, roll: -2 },
  ],
  s13: [
    { f: 652, pos: [-0.3, 1.5, -3.3], look: [0.2, 1.38, -0.6], fov: 44 },
    { f: 676, pos: [-0.2, 1.5, -3.05], look: [0.25, 1.36, -0.6], fov: 43 },
    { f: 690, pos: [0.5, 1.12, -0.95], look: [0.86, 0.85, -0.24], fov: 42 },
    { f: 703, pos: [0.64, 0.98, -0.62], look: [0.86, 0.845, -0.24], fov: 40 },
  ],
  s14: [
    { f: 704, pos: [0.6, 1.1, -0.66], look: [0.92, 0.99, -0.24], fov: 42 },
    { f: 712, pos: [0.58, 1.1, -0.64], look: [0.92, 0.99, -0.24], fov: 41 },
    { f: 721, pos: [-0.05, 1.5, -3.3], look: [0.02, 1.38, -0.6], fov: 44, ease: 'easeOut' },
    { f: 761, pos: [-0.03, 1.5, -3.05], look: [0.0, 1.38, -0.6], fov: 42 },
  ],
  s15: [
    { f: 762, pos: [-0.25, 1.5, -3.35], look: [0.08, 1.38, -0.6], fov: 44 },
    { f: 849, pos: [0.05, 1.5, -3.1], look: [0.1, 1.38, -0.6], fov: 42, roll: -2 },
  ],
  s16: [
    { f: 850, pos: [-0.35, 1.5, -3.35], look: [0.22, 1.36, -0.5], fov: 44 },
    { f: 894, pos: [-0.28, 1.5, -3.1], look: [0.22, 1.36, -0.5], fov: 42 },
  ],
  s17: [
    { f: 895, pos: [0.8, 2.5, 3.4], look: [0.1, 1.35, -1.3], fov: 50 },
    { f: 915, pos: [0.4, 1.75, 2.2], look: [0.1, 1.38, -1.3], fov: 46, ease: 'easeOut' },
    { f: 961, pos: [0.3, 1.7, 1.85], look: [0.1, 1.38, -1.3], fov: 45 },
  ],
  s18: [
    { f: 962, pos: [-0.6, 1.45, 0.7], look: [-0.98, 1.42, -3.9], fov: 42 },
    { f: 1005, pos: [-0.6, 1.42, 0.6], look: [-0.95, 1.32, -3.9], fov: 42 },
    { f: 1048, pos: [-0.05, 1.62, 1.4], look: [0.05, 1.35, -1.3], fov: 45 },
  ],
  s19: [
    { f: 1049, pos: [6, 24, 26], look: [-6, 3, 8], fov: 52 },
    { f: 1078, pos: [-5.7, 1.85, 3.2], look: [-8.5, 1.4, 11.0], fov: 46, ease: 'easeOut' },
    { f: 1106, pos: [-6.0, 1.6, 3.8], look: [-8.4, 1.3, 9.0], fov: 45 },
    { f: 1134, pos: [-6.25, 1.5, 4.15], look: [-8.0, 1.22, 6.95], fov: 44 },
  ],
  s20: [
    { f: 1135, pos: [-6.62, 1.5, 4.85], look: [-7.92, 1.38, 6.8], fov: 50 },
    { f: 1168, pos: [-6.78, 1.48, 5.12], look: [-7.92, 1.36, 6.8], fov: 48 },
    { f: 1224, pos: [7.3, 24, -19.2], look: [-11, 0, 12], fov: 52, ease: 'smooth' },
  ],
  s21: [
    { f: 1225, pos: [0.12, 1.5, -3.4], look: [0.42, 1.36, -0.5], fov: 44 },
    { f: 1314, pos: [0.16, 1.5, -3.1], look: [0.44, 1.36, -0.5], fov: 42 },
  ],
  s22: [
    { f: 1315, pos: [0.16, 1.5, -3.1], look: [0.44, 1.36, -0.5], fov: 42 },
    { f: 1338, pos: [0.19, 1.49, -2.9], look: [0.44, 1.36, -0.5], fov: 40, roll: -1.5 },
  ],
};
const KICKS = [{ f: 109, a: 0.012 }, { f: 123, a: 0.014 }, { f: 140, a: 0.018 }, { f: 716, a: 0.05 }, { f: 1316, a: 0.02 }];
export const camAt = (f) => {
  const S = shotAt(f);
  let c;
  if (S.id === 's03') {
    const { d, r } = punchAt(f); const tgt = [BTN_CLOSE[0] - 0.01, BTN_CLOSE[1] + 0.012, BTN_CLOSE[2]];
    c = { pos: camOrbit(tgt, [-0.42, 0.3, -1], d), look: tgt, fov: 42, roll: r + 0.6 * Math.sin(f * 0.21) };
    if (f >= 145) { const j = (f % 2 ? 1 : -1) * 0.0025; c.look = [tgt[0] + j, tgt[1] - j, tgt[2]]; }
  } else c = camFromKeys(CAMS[S.id], f, { creep: 0.0009 });
  for (const k of KICKS) { const d = f - k.f; if (d >= 0 && d < 7) { const s = (d % 2 ? -1 : 1) * k.a * (1 - d / 7); c.look = [c.look[0] + s, c.look[1] + s * 1.5, c.look[2]]; c.roll = (c.roll || 0) + s * 30; } }
  c.flash = 0;
  if (S.id === 's06' && f < 266) c.scan = 1 - ramp(f, 253, 265) * 1.05;
  if (S.id === 's09' && f < 423) c.flash = 0.5 * (1 - (f - 420) / 3);
  if (S.id === 's17' && f < 898) c.flash = 0.6 * (1 - (f - 895) / 3);
  if (S.id === 's19' && f < 1052) c.flash = 0.6 * (1 - (f - 1049) / 3);
  if (S.id === 's21' && f < 1228) c.flash = 0.45 * (1 - (f - 1225) / 3);
  if (S.light === 'red') { c.flash = 0.13 + 0.05 * Math.sin(f * 0.35); c.flashCol = '#ff2a1a'; }
  if (S.id === 's14' && f >= 715 && f < 719) { c.flash = 0.35 * (1 - (f - 715) / 4); c.flashCol = '#ffffff'; }
  if (S.id === 's22' && f >= 1316 && f < 1320) { c.flash = 0.22 * (1 - (f - 1316) / 4); c.flashCol = '#fff2c4'; }
  if (S.set === 'city' && S.id === 's20') c.shadowAt = lerp3([-7.7, 1, 6.9], [-7.7, 0, 0], sm(ramp(f, 1168, 1215)));
  if (S.set === 'lobby' && (S.light === 'lobby')) c.shadowAt = [0.5, 1, 3];
  return c;
};

// ---------- lens ----------
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  switch (S.id) {
    case 's03': return { focus: dist(C.pos, BTN_CLOSE), cinf: 7 };
    case 's02': return f > 84 ? { focus: dist(C.pos, BTN_CLOSE), cinf: 6 } : { focus: dist(C.pos, [-0.12, 1.4, -1.0]), cinf: 3 };
    case 's13': return f > 684 ? { focus: dist(C.pos, KEYHOLE), cinf: 6 } : { focus: dist(C.pos, [0.25, 1.4, -0.75]), cinf: 3 };
    case 's14': return f < 714 ? { focus: dist(C.pos, BTN_CLOSE), cinf: 6 } : { focus: dist(C.pos, [-0.3, 1.4, -0.95]), cinf: 3 };
    case 's08': return { focus: dist(C.pos, BP_CLOSE), cinf: 4 };
    case 's09': return { focus: dist(C.pos, [0.05, 1.0, lerp(4.0, 1.7, ramp(f, 420, 481))]), cinf: 4 };
    case 's20': return f < 1168 ? { focus: dist(C.pos, PBTN), cinf: 5 } : { focus: 30, cinf: 0 };
    case 's19': return f < 1075 ? { focus: 30, cinf: 0 } : { focus: dist(C.pos, [-8.2, 1.3, 7.6]), cinf: 3 };
    case 's17': case 's18': return { focus: dist(C.pos, [0, 1.2, -1.3]), cinf: 2.5 };
    default: return { focus: 3, cinf: 0 };
  }
};

// ---------- world state ----------
const runZ = (f) => lerp(1.9, -0.85, E.easeOut(ramp(f, 0, 24)));
const taxiAt = (f, lane, z0, speed, dir) => { const z = z0 + dir * speed * (f - 1049) / 30; return [lane, z, dir > 0 ? 0 : Math.PI]; };
const pressT = (f, list, len = 5) => { for (const p of list) if (f >= p && f < p + len) return 1 - (f - p) / len; return 0; };
const S3_PRESS = [109, 123, 140, 146, 149, 152, 155];
export const worldAt = (f) => {
  const S = shotAt(f);
  const W = { set: S.set, door: 1, sensor: 0, beams: 0, floorDot: 2, floorLit: 3, closeLit: 0, closePush: 0, hide: [], bcase: null };
  switch (S.id) {
    case 's01': {
      W.door = f < 14 ? lerp(0.72, 0.4, ramp(f, 0, 14)) : lerp(0.4, 1, E.easeOut(ramp(f, 16, 28)));
      W.sensor = f >= 12 && f < 30 ? 1 : 0; W.beams = f >= 12 && f < 22 ? 0.6 * (1 - ramp(f, 16, 22)) : 0; W.hide = ['back']; break;
    }
    case 's02': W.hide = ['back']; W.bcase = [-0.5, -0.92, 0.2]; W.closeLit = pressT(f, [100], 6); W.closePush = W.closeLit; break;
    case 's03': W.closeLit = pressT(f, S3_PRESS, 4); W.closePush = W.closeLit; break;
    case 's04': W.door = 1 - sm(ramp(f, 172, 207)); W.hide = ['back']; W.bcase = [-0.72, -1.05, 0.2]; break;
    case 's05': W.door = 0; W.hide = ['back']; W.bcase = [-0.62, -0.95, 0.2]; break;
    case 's06': case 's07': case 's08': {
      W.sand = S.id === 's06' ? 0.55 - 0.25 * ramp(f, 253, 304) : S.id === 's07' ? 0.3 * (1 - ramp(f, 305, 336)) : 0.75;
      W.gear = f * 0.025 + (S.id === 's07' ? 0.9 * E.easeOut(ramp(f, 336, 350)) : 0);
      W.mini = S.id === 's07' ? 1 - E.easeOut(ramp(f, 337, 350)) : 1;
      W.bpClose = S.id === 's08' ? pressT(f, [370, 393], 7) : 0; W.bpPush = W.bpClose;
      const hit = S.id === 's08' ? (f >= 393 ? f - 393 : f >= 370 ? f - 370 : -1) : -1;
      W.swing = hit >= 0 ? hit * 0.42 : f * 0.06; W.swingAmp = hit >= 0 ? 1.4 * Math.exp(-hit / 22) + 0.15 : 0.18;
      break;
    }
    case 's09': W.sensor = 1; W.beams = 0; W.closeLit = pressT(f, [430, 446, 462], 4); break;
    case 's10': W.sensor = 1; W.beams = 0.7; W.door = 1 - 0.06 * Math.max(0, Math.sin(Math.PI * ramp(f, 495, 515))); break;
    case 's11': W.sensor = 1; W.beams = 0; W.hide = ['back']; break;
    case 's12': W.sensor = 1; W.beams = 0; W.hide = ['back']; W.closeLit = pressT(f, [606, 614, 620, 626, 632, 638, 644], 3); W.closePush = W.closeLit; break;
    case 's13': W.keyTurn = -1.57 * E.back(ramp(f, 692, 699)); W.door = 1; W.hide = ['back']; W.alarm = 1; break;
    case 's14': W.alarm = 1; W.keyTurn = -1.57; W.closeLit = f < 714 ? pressT(f, [707], 8) : 0; W.closePush = W.closeLit; W.door = f < 714 ? 1 : 1 - E.easeOut(ramp(f, 714, 717)); W.hide = ['back']; break;
    case 's15': W.door = 0; W.hide = ['back']; W.floorDot = Math.floor(ramp(f, 762, 849) * 2.99) + 2; break;
    case 's16': W.door = 0; W.hide = ['back']; W.floorDot = 4; W.closeLit = pressT(f, [866], 7); W.closePush = W.closeLit; break;
    case 's17': W.stress = 0.95 + 0.04 * Math.sin(f * 0.4); break;
    case 's18': W.stress = lerp(0.97, 0.08, sm(ramp(f, 972, 1036))); break;
    case 's19': case 's20': {
      W.taxis = [taxiAt(f, 3.6, -40, 13, 1), taxiAt(f, -3.6, 60, 11, -1), taxiAt(f, 3.6, -75, 13, 1), taxiAt(f, -3.6, 18, 9, -1)];
      W.walk = false; W.btnPush = S.id === 's19' ? pressT(f, [1118, 1126], 4) : pressT(f, [1137, 1143, 1149, 1155, 1161, 1167], 3);
      if (S.id === 's20') { W.sink = sm(ramp(f, 1172, 1206)); W.field = f >= 1166; }
      break;
    }
    case 's21': W.door = 0; W.hide = ['back']; W.floorDot = 5 % 5; break;
    case 's22': W.door = 0; W.hide = ['back']; W.floorDot = 0; W.closeLit = pressT(f, [1316], 10); W.closePush = W.closeLit; break;
  }
  return W;
};

// ---------- actors (2D cards) ----------
const CM = 2.25;
const R = (T, who, o, pos, extra = {}) => ({ key: (typeof who === 'string' ? who : JSON.stringify(who)) + JSON.stringify(o), draw: (p) => T.castFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
/** place a card so its design point (dx, dy) lands on world point tgt (nudged `toward` metres to the camera) */
const pin = (cam, tgt, dx, dy, s, flip = false, toward = 0.02) => {
  const v = [cam[0] - tgt[0], cam[1] - tgt[1], cam[2] - tgt[2]], l = Math.hypot(...v);
  const t = tgt.map((x, i) => x + v[i] / l * toward);
  const yaw = Math.atan2(cam[0] - t[0], cam[2] - t[2]);
  const lx = (dx - 300) / 1000 * CM * s * (flip ? -1 : 1), ly = (975 - dy) / 1000 * CM * s;
  return { x: t[0] - Math.cos(yaw) * lx, y: t[1] - ly, z: t[2] + Math.sin(yaw) * lx, fixYaw: yaw };
};
const HAND = (T, o, at, s, flip, extra = {}) => ({ key: 'hand' + JSON.stringify(o), draw: (p) => T.handCard(p, o), ...at, s, flip, blob: false, shadow: false, order: 4, ...extra });
const FIRE_SLEEVE = { sleeve: '#d8c08e', stripe: true, cuff: '#2a2a2a', skin: '#f0c39b' };
const bob = (f, k = 1, sp = 0.11) => q(0.006 * k * Math.sin(f * sp), 3);
const sway = (f, seed = 1, k = 1) => q(1.2 * k * Math.sin((f + seed * 7) * 0.05), 1);

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], C = camAt(f), cam = C.pos, tint = tintOf(S);
  const man = (o, pos, extra = {}) => out.push(R(T, 'hurry', { seed: 3, blink: blinkAt(f, 3), tilt: sway(f, 3), bob: bob(f), ...o }, pos, { tint, ...extra }));
  const wheel = (o, pos) => out.push(R(T, 'wheel', { seed: 5, L: 'rim', R: 'rim', blink: blinkAt(f, 5), ...o }, pos, { tint }));
  const granny = (o, pos) => out.push(R(T, 'granny', { seed: 6, expr: 'happy', L: 'hang', R: 'cane', tilt: sway(f, 6), ...o }, pos, { tint }));
  const gstep = q(0.012 * Math.abs(Math.sin(f * 0.3)), 3);
  switch (S.id) {
    case 's01': {
      const z = runZ(f), st = q((f * 0.11) % 1, 2);
      man({ expr: f < 17 ? 'hurry' : 'worried', L: 'case', R: 'cup', step: f < 20 ? st : 0, slosh: q(Math.sin(f * 0.7) * (f < 22 ? 0.9 : 0.4), 1), drop: f >= 16 && f <= 28 ? q(ramp(f, 16, 28), 2) : 0, swing: q(18 * Math.sin(f * 0.6), 0), bob: q(0.02 * Math.abs(Math.sin(f * 0.6)), 3), tilt: q(-4 + 2 * Math.sin(f * 0.6), 1), look: 0, blink: 0 },
        [0.02, 0, z], { s: f >= 12 && f <= 16 ? 0.97 : 1 });
      break;
    }
    case 's02': {
      const pressing = f >= 64, reach = q(sm(ramp(f, 66, 80)), 2);
      man({ expr: f < 64 ? 'impatient' : 'focus', L: pressing ? 'press' : 'watch', R: 'cup', reach, lookY: f < 62 ? 1 : 0, look: pressing ? -1 : 0, tap: f < 62 ? q(Math.max(0, Math.sin(f * 0.9)), 2) : 0, slosh: q(0.6 * Math.sin(f * 0.5), 1) }, [-0.05, 0, -0.95]);
      if (f >= 84) { const t = E.easeOut(ramp(f, 84, 99)); const tgt = [BTN_CLOSE[0] - 0.012 - (1 - t) * 0.16, BTN_CLOSE[1] + 0.004, BTN_CLOSE[2] - (1 - t) * 0.06]; out.push(HAND(T, { bend: 0 }, pin(cam, tgt, 460, 500, 0.36, true, 0.03), 0.36, true)); }
      break;
    }
    case 's03': {
      const pr = pressT(f, S3_PRESS, 4), jab = f >= 145 ? 0.006 * Math.sin(f * 2.4) : 0;
      const tgt = [BTN_CLOSE[0] - 0.004 + pr * 0.006 + jab, BTN_CLOSE[1] + 0.004, BTN_CLOSE[2]];
      out.push(HAND(T, { bend: q(pr, 1) }, pin(cam, tgt, 460, 500, 0.36, true, 0.03 - pr * 0.008), 0.36, true));
      break;
    }
    case 's04': man({ expr: f < 190 ? 'hopeful' : 'smile', L: 'hang', R: 'cup', look: -0.7, lookY: -0.2, slosh: q(0.2 * Math.sin(f * 0.3), 1) }, [-0.36, 0, -0.75]); break;
    case 's05': man({ expr: f < 230 ? 'proud' : 'sly', L: 'gun', R: 'cup', look: f < 230 ? 0 : -0.4, headTilt: q(4 * Math.sin(f * 0.2), 1) }, [-0.12, 0, -0.95]); break;
    case 's08': {
      const pr = pressT(f, [370, 393], 7);
      if (f >= 362) { const t = E.easeOut(ramp(f, 362, 369)); const tgt = [BP_CLOSE[0] + 0.012 + (1 - t) * 0.12 - pr * 0.008, BP_CLOSE[1] + 0.003, BP_CLOSE[2] + 0.02]; out.push(HAND(T, { bend: q(pr, 1) }, pin(cam, tgt, 460, 500, 0.36, true, 0.02), 0.36, true)); }
      break;
    }
    case 's09': {
      const z = lerp(4.6, 1.8, ramp(f, 420, 481));
      wheel({ expr: 'kind', wheelRot: q(-z / 0.3 % 6.283, 1), bob: bob(f, 0.5) }, [0.05, 0, z]);
      granny({ bob: gstep }, [0.85, 0, lerp(7.0, 5.9, ramp(f, 420, 481))]);
      break;
    }
    case 's10': {
      const z = lerp(1.65, 0.35, sm(ramp(f, 482, 538)));
      wheel({ expr: 'smile', wheelRot: q(-z / 0.3 % 6.283, 1), look: -0.4 }, [0.05, 0, z]);
      granny({ bob: gstep }, [-0.85, 0, lerp(3.2, 2.05, ramp(f, 482, 538))]);
      man({ expr: 'impatient', L: 'cup', R: 'press', reach: 1, look: 1, tap: q(Math.max(0, Math.sin(f * 1.1)), 2) }, [0.32, 0, -0.85]);
      break;
    }
    case 's11': {
      const zw = lerp(0.4, -1.25, sm(ramp(f, 539, 585))), zg = lerp(1.9, -0.55, sm(ramp(f, 545, 598)));
      wheel({ expr: f < 575 ? 'kind' : 'happy', wheelRot: q(-zw / 0.3 % 6.283, 1) }, [-0.45, 0, zw]);
      granny({ bob: gstep }, [0.18, 0, zg]);
      man({ expr: 'impatient', L: 'hang', R: 'cup', look: -1, tap: q(Math.max(0, Math.sin(f * 1.1)), 2) }, [0.68, 0, -0.55]);
      break;
    }
    case 's12': {
      const pr = pressT(f, [606, 614, 620, 626, 632, 638, 644], 3);
      man({ expr: f < 625 ? 'impatient' : 'hurry', L: 'press', R: 'cup', reach: q(0.9 + 0.1 * pr, 2), look: -1, slosh: q(0.5 * Math.sin(f * 0.8), 1) }, [0.38, 0, -0.8]);
      wheel({ expr: 'smile', look: -0.6 }, [-0.6, 0, -1.3]);
      break;
    }
    case 's13': {
      out.push(R(T, 'fire', { seed: 8, expr: f < 670 ? 'focus' : 'smile', L: 'hang', R: 'keyUp', blink: blinkAt(f, 8), tilt: sway(f, 8), bob: bob(f) }, [0.05, 0, -0.95], { tint }));
      man({ expr: 'worried', L: 'hang', R: 'cup', look: -1 }, [-0.55, 0, -1.4]);
      if (f >= 683) { const t = E.easeOut(ramp(f, 683, 691)); const tgt = [KEYHOLE[0] - 0.006 - (1 - t) * 0.12, KEYHOLE[1] + 0.004, KEYHOLE[2] - (1 - t) * 0.04]; out.push(HAND(T, { ...FIRE_SLEEVE, key: true, keyTurn: q(1.57 * E.back(ramp(f, 692, 699)), 2) }, pin(cam, tgt, 470, 496, 0.32, true, 0.035), 0.32, true)); }
      break;
    }
    case 's14': {
      if (f < 716) { const pr = pressT(f, [707], 8); const tgt = [BTN_CLOSE[0] - 0.004 + pr * 0.006, BTN_CLOSE[1] + 0.004, BTN_CLOSE[2]]; out.push(HAND(T, { ...FIRE_SLEEVE, bend: q(pr, 1) }, pin(cam, tgt, 460, 500, 0.36, true, 0.03), 0.36, true)); }
      else {
        man({ expr: f < 718 ? 'worried' : 'shock', L: 'hang', R: 'cup', slosh: q(f > 717 ? 0.9 * Math.sin((f - 717) * 0.6) * Math.exp(-(f - 717) / 25) : 0, 1), bob: f > 717 && f < 722 ? 0.02 : 0, blink: 0 }, [-0.22, 0, -0.95]);
        out.push(R(T, 'fire', { seed: 8, expr: 'smile', L: 'thumb', R: 'hang', blink: blinkAt(f, 8) }, [0.42, 0, -0.72], { tint }));
      }
      break;
    }
    case 's15': man({ expr: 'confused', L: 'scratch', R: 'cup', look: q(-0.6 + 0.3 * Math.sin(f * 0.05), 2), lookY: -0.6, headTilt: q(5 + 2 * Math.sin(f * 0.08), 1) }, [0.24, 0, -0.95]); break;
    case 's16': {
      const relaxed = f >= 868;
      man({ expr: relaxed ? 'relaxed' : 'impatient', L: f >= 858 ? 'press' : 'hang', R: 'cup', reach: q(sm(ramp(f, 856, 866)), 2), look: relaxed ? 0 : -1, bob: relaxed ? q(0.01 * Math.sin(f * 0.2), 3) : 0 }, [0.25, 0, -0.85]);
      break;
    }
    case 's17': case 's18': {
      const wh = S.id === 's17' ? 1.1 * Math.sin(f * 0.42) : 0.6 * Math.sin(f * 0.2) * (1 - ramp(f, 1000, 1048));
      const expr = S.id === 's17' ? 'excited' : f < 1010 ? 'excited' : 'happy', bo = q(Math.abs(Math.sin(f * 0.42)) * (S.id === 's17' ? 0.4 : 0.12), 2);
      out.push({ key: 'brain' + q(wh, 2) + expr + blinkAt(f, 9) + bo, draw: (p) => T.brainCard(p, { wheel: q(wh, 2), expr, blink: blinkAt(f, 9), bounce: bo }), x: 0, y: 0.56, z: -1.12, s: 0.8, blob: false });
      out.push(R(T, 'psych', { seed: 11, expr: S.id === 's18' && f > 1015 ? 'happy' : 'smile', L: 'clip', R: 'pen', pen: q(f * 0.02, 2), lookY: 0.6, look: -0.6, blink: blinkAt(f, 11), tilt: sway(f, 11) }, [0.66, 0, -1.75], {}));
      break;
    }
    case 's19': {
      const t = ramp(f, 1060, 1110), z = lerp(14.5, 6.72, sm(t)), x = lerp(-9.2, -8.22, sm(t)), walking = f < 1108;
      out.push(R(T, 'ped', { seed: 12, expr: f < 1110 ? 'neutral' : 'impatient', L: f >= 1110 ? 'press' : 'hang', R: 'strap', reach: q(sm(ramp(f, 1110, 1117)), 2), step: walking ? q((f * 0.07) % 1, 2) : 0, bob: walking ? q(0.012 * Math.abs(Math.sin(f * 0.44)), 3) : 0, blink: blinkAt(f, 12), look: f > 1100 ? -1 : 0 }, [x, 0.16, z], { ground: 0.16 }));
      break;
    }
    case 's20': {
      const pr = pressT(f, [1137, 1143, 1149, 1155, 1161, 1167], 3);
      out.push(R(T, 'ped', { seed: 12, expr: f < 1150 ? 'impatient' : 'worried', L: 'press', R: 'strap', reach: q(0.85 + 0.15 * pr, 2), blink: blinkAt(f, 12), look: -1 }, [-8.22, 0.16, 6.72], { ground: 0.16 }));
      break;
    }
    case 's21': {
      const reach = q(0.95 * sm(ramp(f, 1262, 1302)), 2);
      man({ expr: f < 1255 ? 'smile' : 'sly', L: reach > 0.02 ? 'press' : 'hang', R: 'cup', reach, look: f < 1290 ? 0 : 0.7, headTilt: q(-3 + 2 * Math.sin(f * 0.06), 1) }, [0.15, 0, -0.9]);
      break;
    }
    case 's22': man({ expr: f < 1318 ? 'sly' : 'grin', L: 'press', R: 'cup', reach: q(0.95 + 0.05 * pressT(f, [1316], 6), 2), look: 0, headTilt: q(-3 + 3 * ramp(f, 1316, 1325), 1) }, [0.15, 0, -0.9]); break;
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [], cam = camAt(f).pos;
  const PIN = (key, draw, tgt, dx, dy, s, extra = {}) => ({ key, draw, ...pin(cam, tgt, dx, dy, s, false, 0.0), s, blob: false, shadow: false, order: 5, ...extra });
  if (S.id === 's01' && f < 14) out.push(FX('speed' + (f % 6), (p) => T.fxSpeed(p, (f % 6) / 6), [0.0, 0.25, runZ(f) + 0.25], 1.0, { alpha: 0.9 }));
  if (S.id === 's07' && f >= 349 && f < 360) { const t = q((f - 349) / 10, 2); out.push(FX('bang' + t, (p) => T.fxBang(p, t), [-0.02, -0.95, 0.05], 0.4)); }
  if (S.id === 's08') { for (const h of [370, 393]) if (f >= h && f < h + 8) { const t = q((f - h) / 8, 2); out.push(FX('spk' + t, (p) => T.fxSpark(p, t), [0.13, 0.9, -0.05], 0.1)); } }
  if (S.id === 's12') { const t = q(E.back(ramp(f, 600, 608)), 2); out.push(PIN('xh' + t + q((f % 30) / 30, 2), (p) => T.fxXray(p, 'hourglass', 0.65 - 0.002 * (f - 599), f / 30), [0.86, 1.36, -0.42], 300, 500, 0.32 * t)); }
  if (S.id === 's13' && f >= 664 && f < 680) { const t = q((f - 664) / 16, 2); out.push(FX('glint' + t, (p) => T.fxSpark(p, t), [-0.22, 1.42, -0.9], 0.14)); }
  if (S.id === 's14' && f >= 716 && f < 728) { const t = q((f - 716) / 12, 2); out.push(FX('bang' + t, (p) => T.fxBang(p, t), [0.0, 0.35, -0.12], 0.75)); }
  if (S.id === 's15' && f >= 786) { const t = q(ramp(f, 786, 798), 2); out.push(PIN('thought' + t, (p) => T.fxThought(p, t), [-0.2, 1.68, -0.95], 300, 430, 0.36, { roll: q(0.03 * Math.sin(f * 0.1), 3) })); }
  if (S.id === 's16') { const k = q(ramp(f, 867, 884), 2); if (k < 1) out.push(PIN('stress' + k + (k === 0 ? f % 4 : 0), (p) => T.fxStress(p, k), [-0.18 + (k === 0 ? 0.008 * Math.sin(f * 1.7) : 0), 1.72, -0.85], 300, 420, 0.34)); }
  if (S.id === 's17') { for (const h of [918, 940]) if (f >= h && f < h + 9) { const t = q((f - h) / 9, 2); out.push(FX('honk' + t, (p) => T.fxBang(p, t), [0, 0.95, -0.9], 0.28)); } }
  if (S.set === 'city') { // steam from the sidewalk grate
    for (let i = 0; i < 4; i++) { const k = q(((f * 0.012) + i / 4) % 1, 2); out.push(FX('steam' + k, (p) => T.fxPuffSoft(p, k), [-9.6 + Math.sin(k * 5 + i) * 0.3, -0.5 + k * 3.4, 16.5], 1.3 + k * 1.2, { alpha: 1 })); }
  }
  if (S.id === 's20' && f >= 1148 && f < 1196) { const t = q(E.back(ramp(f, 1148, 1156)), 2); out.push(PIN('xw' + t + q(f * 0.25 % 6.28, 1), (p) => T.fxXray(p, 'wire', f * 0.25), [-7.56, 1.26, 6.62], 300, 500, 0.22 * t)); }
  if (S.id === 's22' && f >= 1316) { const t = q(ramp(f, 1316, 1330), 2); out.push(FX('ding' + t, (p) => T.fxSpark(p, t), [0.9, 0.92, -0.32], 0.12)); }
  return out;
};
