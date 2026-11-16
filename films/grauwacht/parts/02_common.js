const { F } = K;
function W() { return 1920; }
const { lerp, clamp, ramp, sm, key, rng } = K;
const SC = [];
/** scene i (1-based, from PLAN): calm crossfade by default */
const scene = (i, def) => { SC[i - 1] = { name: 'S' + i, dur: PLAN[i - 1].dur, in: 'fade', inDur: 1.2, ...def }; };
/** very slow Ken Burns camera between two framings (smoothstep, clamps past the end for crossfades) */
const kb = (a, b, dur) => (t) => { const u = sm(clamp(t / dur)); return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lerp(a.z, b.z, u) }; };
const blink = (t, seed) => K.blinkAt(t, seed);
/** soft in-scene dissolve weight: 0 before a, 1 after a + d */
const dis = (t, a, d = 1) => sm(clamp((t - a) / d));
/** draw fn with alpha (for in-scene dissolves) */
const withA = (g, a, fn) => { if (a <= 0.001) return; g.save(); g.globalAlpha *= a; fn(); g.restore(); };
/** draw a figure rotated about its feet point (floating, lying on the sea, swimming) */
const rotNoah = (g, o, ang, px = o.x, py = o.y) => { g.save(); g.translate(px, py); g.rotate(ang); g.translate(-px, -py); const r = K.noah(g, o); g.restore(); return r; };

// ------------------------------------------------------------------ cast (NOAH rig, outfits only)
const O = K.OUTFITS;
const JAKOB = { ...O.shipwright };
const JAKOB_PR = (years = 0) => ({ ...O.prisoner, top: { ...O.prisoner.top, color: K.mixc('#9a9484', '#7e7a6e', clamp(years / 8)) },
  hair: years < 2 ? { type: 'messy', color: '#5a3a22' } : { type: 'long', color: '#5a3a22' } });
const JAKOB_SEA = { ...O.prisoner, top: { type: 'shirt', color: '#8e8a7c', color2: '#7e7a6c', pattern: 'tweed' }, hair: { type: 'long', color: '#4a3220' } };
const JAKOB_FISH = { ...O.fisherman, top: { type: 'sweater', color: '#5a6a4a', pattern: 'knit' }, hat: { type: 'none' }, hair: { type: 'long', color: '#4a3220' }, beard: null };
const JAKOB_FISH2 = { ...O.fisherman, top: { type: 'sweater', color: '#5a6a4a', pattern: 'knit' }, hat: { type: 'none' }, hair: { type: 'short', color: '#5a3a22' }, beard: { color: '#5a3a22', len: 12 } };
const JAKOB_GENT = { ...O.gentleman };
const ANSELM = { ...O.professor };
const ANSELM_YOUNG = { ...O.professor, top: { type: 'suit', color: '#3a3a46', color2: '#f2eee4', pattern: 'tweed' }, hair: { type: 'short', color: '#9a9488' }, beard: { color: '#a8a296', len: 30 }, tie: '#5a2a2a', watch: true };
const GRETA = { ...O.lady1900 };
const GRETA_OLD = { ...O.lady1900, top: { ...O.lady1900.top, color: '#4a6a82' }, bottom: { type: 'skirt', color: '#4a6a82' }, hair: { type: 'bun', color: '#7a4a26', grey: 1 }, shawl: '#9a6a44' };
const GRETA_BRIDE = { ...O.lady1900, top: { type: 'dress', color: '#efe6d2', color2: '#ffffff', pattern: 'floral' }, bottom: { type: 'skirt', color: '#efe6d2' }, shawl: null, hair: { type: 'bun', color: '#7a4a26', grey: 1 } };
const KONRAD = { ...O.clerk };
const KONRAD_OLD = { ...O.clerk, hair: { type: 'short', color: '#8a8478' } };
const LINDQVIST = { ...O.gentleman, top: { type: 'suit', color: '#2a3442', color2: '#f2eee4', pattern: 'plain' }, waistcoat: '#7a6a4a', hat: { type: 'tophat', color: '#1e1c1e' }, beard: { color: '#b8b4aa', len: 40 }, hair: { type: 'short', color: '#b8b4aa' }, tie: '#2a2a2a' };
const GUARD = { ...O.guard };
const GUARD2 = { ...O.guard, beard: { color: '#4a3a2a', len: 16 } };
const POLICE = { ...O.guard, top: { type: 'coat', color: '#2a3656', color2: '#222c46', pattern: 'plain' }, bottom: { type: 'trousers', color: '#222838' }, hat: { type: 'pickelhaube', color: '#1e1e22' } };
const HINNERK = { ...O.fisherman, hat: { type: 'captain', color: '#22283a' }, beard: { color: '#8a7a64', len: 54 }, top: { type: 'sweater', color: '#2e3a52', pattern: 'knit' } };
const FISHER_A = { ...O.fisherman, beard: { color: '#6a4a30', len: 48 }, hat: { type: 'souwester', color: '#e0b030' }, top: { type: 'sweater', color: '#7a3a2e', pattern: 'knit' } };
const FISHER_B = { ...O.fisherman, beard: { color: '#3a2a1e', len: 44 }, hat: { type: 'beanie', color: '#3a4a3a', color2: '#2e3a2e' }, top: { type: 'sweater', color: '#5a5a62', pattern: 'knit' } };
const JUDGE = { top: { type: 'coat', color: '#1e1e26', color2: '#16161c', pattern: 'plain' }, bottom: { type: 'trousers', color: '#1e1e24' }, shoes: { type: 'shoes', color: '#151312' }, socks: '#222', hair: { type: 'short', color: '#e0dcd2' }, glasses: true, hat: { type: 'none' }, scarf: null };
const LAWYER = { ...O.clerk, top: { type: 'suit', color: '#3a3e48', color2: '#f2eee4', pattern: 'plain' }, waistcoat: '#4a4a52', hair: { type: 'short', color: '#a8a49c' }, beard: { color: '#a8a49c', len: 8 }, tie: '#3a2a4a' };
const OLDWORKER = { ...O.villager, scarf: null, hat: { type: 'flatcap', color: '#4a4440' }, beard: { color: '#c8c4bc', len: 30 }, top: { type: 'cardigan', color: '#6a5a46', color2: '#cbb894', pattern: 'knit' }, bottom: { type: 'trousers', color: '#4a4238' } };
const WORKER_A = { ...O.shipwright, top: { type: 'vest', color: '#3e4a5a', color2: '#e6dcc4', pattern: 'tweed', sleeveColor: '#dcd2bc' }, hat: { type: 'flatcap', color: '#3a3a3a' }, beard: { color: '#7a5a3a', len: 20 } };
const WORKER_B = { ...O.shipwright, top: { type: 'shirt', color: '#5a7aa8', color2: '#5a7aa8', pattern: 'denim' }, hat: { type: 'beanie', color: '#6a3a2a', color2: '#5a2e22' }, hair: { type: 'short', color: '#2a1c14' } };
const KID = (c, hair, hc = '#5a3a22') => ({ top: { type: 'sweater', color: c, pattern: 'knit' }, bottom: { type: 'knickers', color: '#4a4036', pattern: 'tweed' }, shoes: { type: 'boots', color: '#3a2a20' }, socks: '#d8ccb4', hair: { type: hair, color: hc }, hat: { type: 'none' } });
const KID_GIRL = (c, hc = '#7a4a26') => ({ top: { type: 'dress', color: c, color2: '#f4f0e6' }, bottom: { type: 'skirt', color: c }, shoes: { type: 'shoes', color: '#2a2220' }, socks: '#4a4a52', hair: { type: 'braid', color: hc } });

// ------------------------------------------------------------------ shared drawing helpers for this film
/** distant gulls: little ink "m" strokes gliding */
function gulls(g, t, list) { g.save(); g.strokeStyle = 'rgba(40,36,40,.85)'; g.lineCap = 'round'; for (const [x0, y0, sp, s = 1, ph = 0] of list) { const x = x0 + t * sp, y = y0 + Math.sin(t * 0.9 + ph) * 10, f = Math.sin(t * 6 + ph) * 0.35;
  g.lineWidth = 3 * s; g.beginPath(); g.moveTo(x - 18 * s, y - 6 * s * (1 + f)); g.quadraticCurveTo(x - 8 * s, y - 12 * s * (1 - f), x, y); g.quadraticCurveTo(x + 8 * s, y - 12 * s * (1 - f), x + 18 * s, y - 6 * s * (1 + f)); g.stroke(); } g.restore(); }
/** standing gull */
function gullSit(g, x, y, s = 1, flip = false) { g.save(); g.translate(x, y); g.scale(s * (flip ? -1 : 1), s); K.ell(g, 0, -26, 30, 18, '#f4f2ec', 3); K.ell(g, 26, -44, 13, 12, '#f4f2ec', 3); K.poly(g, [[36, -46], [52, -42], [36, -40]]); K.fillInk(g, '#e8b030', 2); K.ell(g, 28, -47, 2.5, 2.5, '#1a1210', 0);
  K.poly(g, [[-30, -32], [-12, -38], [10, -28], [-26, -18]]); K.fillInk(g, '#9aa0aa', 2.5); g.strokeStyle = '#e8a030'; g.lineWidth = 3; g.beginPath(); g.moveTo(-4, -10); g.lineTo(-6, 0); g.moveTo(6, -10); g.lineTo(8, 0); g.stroke(); g.restore(); }
/** candle flame glow at (x,y) */
function candleGlow(g, x, y, t, s = 1, a = 1) { const f = K.flicker(t, x * 0.01); K.glow(g, x, y, 520 * s, '255,190,110', 0.32 * f * a); K.glow(g, x, y, 140 * s, '255,225,170', 0.4 * f * a); }
/** moon shaft through a small high window onto the floor */
function moonBeam(g, win, floorPts, a = 0.18, color = '170,195,255') { K.beam(g, [[win.x, win.y], [win.x + win.w, win.y], ...floorPts], { color, a }); }
/** cell door panel swinging in a doorway: u 0 closed .. 1 open (toward the camera on the left) */
function cellDoor(g, x, y, u, { w = 280, h = 470 } = {}) {
  g.fillStyle = '#100c0a'; g.fillRect(x - w / 2, y - h, w, h);
  const vis = 1 - u * 0.82, px = x - w / 2; g.save(); g.translate(px, 0); g.scale(vis, 1); g.translate(-px, 0);
  K.rrect(g, x - w / 2, y - h, w, h, 6, '#3a3632', 5); g.fillStyle = '#4a4440'; for (const yy of [y - h + 70, y - h + 270, y - h + 410]) { g.fillRect(x - w / 2 - 4, yy, w + 8, 18); g.strokeStyle = K.INK; g.lineWidth = 2.5; g.strokeRect(x - w / 2 - 4, yy, w + 8, 18); }
  K.rrect(g, x - 50, y - h + 110, 100, 50, 4, '#151312', 3); g.restore();
}
/** tally marks scratched into the wall: groups of five */
function tally(g, n, x, y, { cols = 12, a = 0.75 } = {}) { g.save(); g.strokeStyle = `rgba(232,226,212,${a})`; g.lineWidth = 3; g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const grp = (i / 5) | 0, k = i % 5, bx = x + (grp % cols) * 34, by = y + ((grp / cols) | 0) * 44; g.beginPath(); if (k < 4) { g.moveTo(bx + k * 6, by); g.lineTo(bx + k * 6 + 1, by + 30); } else { g.moveTo(bx - 4, by + 24); g.lineTo(bx + 26, by + 6); } g.stroke(); } g.restore(); }
/** head-only placement: returns noah y so that the head centre lands on hy (standing pose) */
const headToY = (hy, s) => hy + 484 * s;
