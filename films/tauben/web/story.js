// "Tauben" — shot plan, camera and actor state (pure functions of frame f).
//
// Phrase timeline (work/phrases.json; voice retimed by tools/timing.py — silence was
// inserted only inside detected pauses, the words themselves are untouched):
//   C1 0.370–2.697 s (f11–81)   "Ein alter Mann | fütterte jeden | Tag eine | Taube."
//        beat pause 1.004–1.306 s, word-boundary closures 1.935 s (f58) and 2.355 s (f70)
//   C2 3.073–4.409 s (f92–132)  "Eines Tages kam sie nicht."
//   C3 6.161–8.924 s (f185–268) "Am nächsten Morgen | saßen hundert Tauben vor seinem Fenster."
//        beat pause 6.984–7.436 s
//   tail 0.6 s  ->  TOTAL 286 frames (9.533 s)
// Every cut sits in a pause: f35 (1.167 s), f58/f70 (stop closures), f86 (2.867 s),
// f181 (6.033 s), f216 (7.200 s).

export const FPS = 30, TOTAL = 286, W = 1080, H = 1920;

export const SHOTS = [
  { id: 'S1',  a: 0,   b: 34,  set: 'ext', light: 'morning' },
  { id: 'S2a', a: 35,  b: 57,  set: 'ext', light: 'morning' },
  { id: 'S2b', a: 58,  b: 69,  set: 'ext', light: 'rain' },
  { id: 'S2c', a: 70,  b: 85,  set: 'ext', light: 'snow' },
  { id: 'S3',  a: 86,  b: 180, set: 'ext', light: 'gray' },
  { id: 'S4',  a: 181, b: 215, set: 'int', light: 'morning' },
  { id: 'S5',  a: 216, b: 285, set: 'ext', light: 'morning' },
];
export const shotAt = f => SHOTS.find(s => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- deterministic helpers ----------
export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const inv = (a, b, x) => clamp((x - a) / (b - a));
export const eio = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const eout = t => 1 - Math.pow(1 - t, 3);
export const ein = t => t * t * t;

// ---------- light ----------
export const SKY = { morning: '#bfe0f5', rain: '#9aa6b2', snow: '#c9d3dc', gray: '#9aa6b2', evening: '#f2b38a', night: '#2d3550' };
// multiply tint applied to every scene colour (sky is used raw)
export const TINT = { morning: '#ffffff', rain: '#ccd1d9', snow: '#e6ebf2', gray: '#d3d6da', evening: '#f6cfae', night: '#5d6790' };
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
export const mix = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], t)).toString(16).padStart(2, '0')).join(''); };

export function lightAt(f) {
  const sh = shotAt(f);
  if (sh.id !== 'S3') return { sky: SKY[sh.light], tint: TINT[sh.light], lamp: sh.id === 'S4' ? 0 : 1, night: 0 };
  // gray wait -> evening -> lamp off -> 8-frame fall to night
  const ev = eio(inv(128, 160, f)), nt = eio(inv(165, 172, f));
  let sky = mix(SKY.gray, SKY.evening, ev), tint = mix(TINT.gray, TINT.evening, ev);
  sky = mix(sky, SKY.night, nt); tint = mix(tint, TINT.night, nt);
  return { sky, tint, lamp: f < 164 ? 1 : 0, night: nt };
}

// ---------- staging geometry (world px; at cam s=1 the world is the 1080x1920 frame) ----------
export const GEO = {
  win: { x0: 360, x1: 720, y0: 640, y1: 1160 },
  sill: { x0: 326, x1: 754, y: 1160, h: 42 },
  facade: { x0: 160, x1: 920 },
  eave: 300, ridge: 150,
  otto: { x: 540, y: 868, R: 95 },
  pot: { x: 400 },
  clock: { x: 668, y: 716, r: 30 },
  lamp: { x: 404, y: 760 },
  wireTop: { a: [-40, 26], c: [540, 120], b: [1120, 46] },
  wireL: { a: [160, 560], c: [80, 590], b: [-40, 500] },
  wireR: { a: [920, 600], c: [1000, 632], b: [1120, 540] },
};
export const qpt = (w, t) => [
  (1 - t) * (1 - t) * w.a[0] + 2 * (1 - t) * t * w.c[0] + t * t * w.b[0],
  (1 - t) * (1 - t) * w.a[1] + 2 * (1 - t) * t * w.c[1] + t * t * w.b[1]];

// ---------- the flock: 99 others + the hero = 100 ----------
export const FLOCK = (() => {
  const r = mulberry32(100), L = [];
  const add = (x, y, layer, k = 1) => L.push({
    x, y, layer, s: (0.8 + 0.3 * r()) * k, dir: r() < 0.5 ? 1 : -1,
    tone: r() * 2 - 1, ph: r(), flapper: r() < 0.14, fph: r(),
  });
  // building plane (sharp)
  [458, 652, 702, 748].forEach(x => add(x, GEO.sill.y, 'sill'));                       // 4 on the sill
  [214, 268, 322, 758, 812, 866].forEach(x => add(x, GEO.win.y0 - 2, 'bld', 0.85));     // 6 on shutter tops
  for (let i = 0; i < 12; i++) add(196 + i * 62 + (r() - 0.5) * 14, GEO.eave, 'bld', 0.82); // 12 on the eave
  for (let i = 0; i < 10; i++) add(250 + i * 64 + (r() - 0.5) * 14, GEO.ridge, 'bld', 0.72); // 10 on the ridge
  for (let i = 0; i < 6; i++) add(408 + i * 52, 500, 'bld', 0.74);                      // 6 on the upper sill
  [200, 252, 304, 356, 724, 776, 828, 880].forEach(x => add(x, 1300, 'bld', 0.86));     // 8 on the ledge
  // wires (blur 6)
  for (let i = 0; i < 23; i++) { const p = qpt(GEO.wireTop, 0.04 + i * 0.04 + (r() - 0.5) * 0.012); add(p[0], p[1], 'wire', 0.7); }
  for (let i = 0; i < 3; i++) { const p = qpt(GEO.wireL, 0.25 + i * 0.25); add(p[0], p[1], 'wire', 0.7); }
  for (let i = 0; i < 3; i++) { const p = qpt(GEO.wireR, 0.25 + i * 0.25); add(p[0], p[1], 'wire', 0.7); }
  // opposite roofs (near: blur 10, far: blur 14)
  for (let i = 0; i < 6; i++) add(10 + i * 26, 906 + i * 9, 'near', 0.62);
  for (let i = 0; i < 6; i++) add(940 + i * 26, 1060 - i * 10, 'near', 0.62);
  for (let i = 0; i < 6; i++) add(16 + i * 24, 690 - (i % 2) * 4, 'far', 0.48);
  for (let i = 0; i < 6; i++) add(936 + i * 24, 760 + (i % 3) * 3, 'far', 0.48);
  if (L.length !== 99) throw new Error('flock ' + L.length);
  return L;
})();

// ---------- camera ----------
// {x, y} = world point at frame centre, s = zoom, dx/dy screen shake, whip = horizontal smear px
export function camAt(f) {
  const sh = shotAt(f), t = inv(sh.a, sh.b, f);
  let c = { x: 540, y: 960, s: 1, dx: 0, dy: 0, whip: 0 };
  if (sh.id === 'S1') c = { ...c, x: 540, y: 928 - 8 * t, s: 1 + 0.08 * eio(t) };
  else if (sh.id.startsWith('S2')) {
    const k = { S2a: 0, S2b: 1, S2c: 2 }[sh.id];
    c = { ...c, x: 572 + 10 * t - k * 4, y: 1004 - 6 * t, s: 1.76 + 0.05 * t };
    // 3-frame whip-pan at each mini-shot transition: outgoing b-1, b; incoming a
    const wp = { 56: [70, 50], 57: [230, 150], 58: [-170, 110], 68: [70, 50], 69: [230, 150], 70: [-170, 110] }[f];
    if (wp) { c.x += wp[0] / c.s; c.whip = wp[1]; }
  } else if (sh.id === 'S3') c = { ...c, x: 548, y: 958 + 52 * eio(t), s: 1.8 - 0.24 * eio(t) };
  else if (sh.id === 'S4') {
    c = { ...c, x: 540, y: 930 - 14 * t, s: 1 + 0.07 * eio(t) };
    const q = inv(196, 215, f) * 3; const rr = mulberry32(f * 7 + 1);
    c.dx = (rr() - 0.5) * q; c.dy = (rr() - 0.5) * q;
  } else if (sh.id === 'S5') {
    const u = eout(inv(216, 239, f));                  // 0.8 s pull-back, ease-out
    c = { ...c, x: 540, y: lerp(884, 960, u), s: lerp(1.6, 1.0, u) };
    const hold = inv(240, 267, f), fin = inv(268, 285, f);
    c.s += 0.012 * hold + 0.03 * eio(fin); c.y -= 6 * hold + 10 * fin;
    const shake = { 240: [12, -8], 241: [-9, 6], 242: [4, -3] }[f];
    if (shake) { c.dx = shake[0]; c.dy = shake[1]; }
  }
  return c;
}

// ---------- blinks: seeded, every 2–4 s, 5 frames ----------
const BLINKS = (() => { const r = mulberry32(42), b = []; let t = 0.9 + 0.8 * r(); while (t < 12) { b.push(Math.round(t * FPS)); t += 2 + 2 * r(); } return b; })();
export function blinkAt(f) {
  for (const b of BLINKS) { const d = f - b; if (d >= 0 && d < 5) return [0.55, 1, 1, 0.6, 0.2][d]; }
  return 0;
}

// peck curve, 0.25 s period
export const peck = (f, ph = 0) => Math.pow(Math.max(0, Math.sin(2 * Math.PI * (f / FPS / 0.25 + ph))), 1.5);

// ---------- actors ----------
export function actorsAt(f) {
  const sh = shotAt(f), lt = f - sh.a, n = sh.b - sh.a + 1, u = lt / (n - 1);
  const t = f / FPS;
  const O = GEO.otto;
  const otto = {
    x: O.x, y: O.y + Math.sin(2 * Math.PI * t / 2) * 1.6, R: O.R,
    expr: 'smile', lid: blinkAt(f), look: [0, 0], scarf: false, sink: 0,
    arms: { L: { hand: [-0.95, 3.0], elbow: [-1.55, 2.25] }, R: { hand: [0.95, 3.0], elbow: [1.55, 2.25] } },
    prop: null, tremble: 0,
  };
  const A = { shot: sh, set: sh.set, otto, shutter: 1, crumbs: 0, hero: null, flock: false, weather: null, snow: false, curtain: 0, shadows: 0, sprinkle: null };

  if (sh.id === 'S1') {
    const o = eio(inv(3, 21, f)); A.shutter = o;
    otto.expr = f < 15 ? 'wait' : 'smile';
    // hands push the shutters' free edges, then settle on the sill
    const push = 1 - inv(22, 30, f);
    const hx = 0.5 + 1.4 * o;
    otto.arms.L = push > 0 ? { hand: [-lerp(0.95, hx, push), lerp(3.0, 1.55, push)], elbow: [-lerp(1.55, 1.6, push), lerp(2.25, 2.0, push)] } : otto.arms.L;
    otto.arms.R = push > 0 ? { hand: [lerp(0.95, hx, push), lerp(3.0, 1.55, push)], elbow: [lerp(1.55, 1.6, push), lerp(2.25, 2.0, push)] } : otto.arms.R;
  }
  if (sh.id.startsWith('S2')) {
    // same action in every mini-shot, compressed to its length; whip frames still show it
    A.weather = { S2a: null, S2b: 'rain', S2c: 'snow' }[sh.id];
    A.snow = sh.id === 'S2c'; otto.scarf = sh.id === 'S2c';
    const sp = inv(0, 0.42, u);
    otto.arms.R = { hand: [1.08 + 0.06 * Math.sin(lt * 2.4), 2.42 - 0.1 * Math.sin(lt * 3.1)], elbow: [1.75, 1.95] };
    A.sprinkle = sp < 1 ? sp : null;
    A.crumbs = inv(0.08, 0.5, u);
    if (sh.id === 'S2b') { otto.prop = 'umbrella'; otto.arms.L = { hand: [-0.72, 1.75], elbow: [-1.5, 2.2] }; }
    // hero lands (two wing beats), then pecks
    const land = inv(0.02, 0.5, u);
    const hx = 712, hy = GEO.sill.y;
    if (land < 1) {
      const e = eout(land);
      A.hero = { x: lerp(860, hx, e), y: lerp(760, hy, e) - Math.sin(Math.PI * e) * 40, flap: Math.sin(land * Math.PI * 4 - 0.6), peck: 0, dir: -1 };
    } else {
      A.hero = { x: hx, y: hy, flap: null, peck: peck(f, 0.1), dir: -1 };
    }
    otto.look = [0.55, 0.7];
  }
  if (sh.id === 'S3') {
    A.crumbs = 1;
    otto.expr = f < 126 ? 'wait' : 'sad';
    // look at the clock (upper right), then back down to the empty sill
    const lk = eio(inv(98, 106, f)) * (1 - eio(inv(120, 128, f)));
    otto.look = [lerp(0.25, 0.85, lk), lerp(0.55, -0.9, lk)];
    otto.turn = lk * 0.12;
    otto.sink = eio(inv(126, 150, f)) * 0.14;
    if (f >= 126) otto.look = [0.15, 0.85];
  }
  if (sh.id === 'S4') {
    A.curtain = eout(inv(181, 193, f));
    A.shadows = inv(181, 215, f);
    otto.expr = 'shock'; otto.tremble = 1;
    otto.look = [0, -0.1];
  }
  if (sh.id === 'S5') {
    A.flock = true; A.crumbs = 1;
    otto.expr = f < 247 ? 'shock' : 'laugh';
    A.hero = { x: 540, y: GEO.sill.y, flap: null, peck: 0, dir: 1, s: 1.3, nod: true, hop: Math.max(0, Math.sin(inv(250, 258, f) * Math.PI)) * 14 };
    const lift = eout(inv(252, 262, f));
    if (f >= 252) {
      otto.prop = 'bag';
      otto.arms.R = { hand: [lerp(0.95, 1.35, lift), lerp(3.0, -0.35, lift)], elbow: [lerp(1.55, 1.9, lift), lerp(2.25, 1.15, lift)] };
    }
    otto.look = f < 247 ? [0, 0.15] : [0, 0];
  }
  return A;
}
