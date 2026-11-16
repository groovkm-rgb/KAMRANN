/* NOAH engine: horizontal 16:9 (1920x1080) painted cartoon films.
 * The star is always the same character: a pure-white round head with two black oval eyes,
 * no mouth, no nose, white gloves, a bean body made of clothes. Outfits, places, seasons and
 * times of day change per film/scene; the character never does.
 * Everything is a pure function of time (no Math.random, no clocks) so every frame is reproducible.
 * Exposes window.K (kit) and window.FILM(def). */
(function () {
'use strict';
const W = 1920, H = 1080;
const INK = '#2a1c16', WHITE = '#fbfaf6', EYE = '#1a1210';
const K = {}; window.K = K;

// ======================================================================= math
const rng = (s) => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const sm = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const eio = (t) => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eout = (t) => 1 - Math.pow(1 - clamp(t), 3);
/** interpolate numbers / arrays / objects; strings and booleans switch at the midpoint */
function mixv(a, b, u) {
  if (typeof a === 'number' && typeof b === 'number') return lerp(a, b, u);
  if (Array.isArray(a) && Array.isArray(b)) return a.map((v, i) => mixv(v, b[i], u));
  if (a && b && typeof a === 'object' && typeof b === 'object') { const o = { ...a, ...b }; for (const k in o) if (k in a && k in b) o[k] = mixv(a[k], b[k], u); else if (!(k in b)) o[k] = a[k]; return o; }
  return u < .5 ? a : b;
}
/** keyframes: key(t, [[t0, v0], [t1, v1], ...], ease?) */
function key(t, fr, ease = eio) {
  if (t <= fr[0][0]) return fr[0][1];
  for (let i = 0; i < fr.length - 1; i++) { const a = fr[i], b = fr[i + 1]; if (t <= b[0]) return mixv(a[1], b[1], (b[2] || ease)((t - a[0]) / (b[0] - a[0] || 1))); }
  return fr[fr.length - 1][1];
}
/** true while t is inside any [a,b) window: blink windows etc. */
const inAny = (t, wins) => wins.some(([a, b]) => t >= a && t < b);
/** natural blink amount (0..1) for a character, given a seed */
const blinkAt = (t, seed = 1) => { const per = 2.6 + (seed * 0.77) % 1.6, ph = (t + seed * 1.3) % per; return ph < 0.06 ? ph / 0.06 : ph < 0.12 ? 1 - (ph - 0.06) / 0.06 : 0; };
Object.assign(K, { W, H, INK, WHITE, rng, clamp, lerp, ramp, sm, eio, eout, mixv, key, inAny, blinkAt });

// ======================================================================= color
const hex2 = (c) => { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const toHex = (a) => '#' + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const shade = (c, k) => toHex(hex2(c).map((v) => v * k));
const mixc = (a, b, u) => { const A = hex2(a), B = hex2(b); return toHex(A.map((v, i) => lerp(v, B[i], u))); };
const rgba = (c, a) => { const [r, g, b] = hex2(c); return `rgba(${r},${g},${b},${a})`; };
Object.assign(K, { shade, mixc, rgba });

// ======================================================================= drawing helpers
const LIGHT = { dir: 1 }; // 1 = light from screen-left (shadow on the right), -1 = from the right
K.LIGHT = LIGHT;
function poly(g, pts, close = true) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); if (close) g.closePath(); }
function inkStroke(g, w = 4, a = 1, col = INK) { g.save(); g.globalAlpha *= a; g.lineWidth = w; g.strokeStyle = col; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); g.restore(); }
function inkP(g, P, w = 4) { g.save(); g.lineWidth = w; g.strokeStyle = INK; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(P); g.restore(); }
/** painted blotches (call inside a clip) */
function paint(g, x, y, w, h, cols, n, seed, r0 = 6, r1 = 30, a = 0.08) {
  const r = rng(seed); g.save();
  for (let i = 0; i < n; i++) { g.globalAlpha = a * (0.4 + r()); g.fillStyle = cols[(r() * cols.length) | 0]; g.beginPath();
    const rr = r0 + r() * (r1 - r0); g.ellipse(x + r() * w, y + r() * h, rr, rr * (0.4 + r() * 0.5), r() * 3, 0, 7); g.fill(); }
  g.restore();
}
/** fill a Path2D, add a soft lit side / shadow side, then ink it */
function shape(g, P, fill, bb, { ink = 4.5, shade: sh = 0.32, hi = 0.14 } = {}) {
  g.fillStyle = fill; g.fill(P);
  if (sh || hi) {
    g.save(); g.clip(P); const [x0, y0, x1, y1] = LIGHT.dir > 0 ? bb : [bb[2], bb[1], bb[0], bb[3]];
    const gr = g.createLinearGradient(x0, y0, x1, y1);
    gr.addColorStop(0, `rgba(255,226,180,${hi})`); gr.addColorStop(0.45, 'rgba(255,226,180,0)'); gr.addColorStop(0.6, 'rgba(30,20,50,0)'); gr.addColorStop(1, `rgba(30,20,50,${sh})`);
    g.fillStyle = gr; g.fillRect(Math.min(bb[0], bb[2]) - 300, bb[1] - 300, Math.abs(bb[2] - bb[0]) + 600, bb[3] - bb[1] + 600); g.restore();
  }
  if (ink) inkP(g, P, ink);
}
/** quick filled + inked primitive helpers */
const fillInk = (g, fill, w = 3.5) => { g.fillStyle = fill; g.fill(); inkStroke(g, w); };
const rrect = (g, x, y, w, h, r, fill, ink = 3.5) => { g.beginPath(); g.roundRect(x, y, w, h, r); fillInk(g, fill, ink); };
const ell = (g, x, y, rx, ry, fill, ink = 3.5, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); } if (ink) inkStroke(g, ink); };
Object.assign(K, { poly, inkStroke, inkP, paint, shape, fillInk, rrect, ell });

// ======================================================================= fabric patterns
const PC = new WeakMap();
/** pattern(g, kind, color, color2): knit | rib | tweed | stripes | check | plain | denim | floral | dots */
function pattern(g, kind, c, c2, sc) {
  let m = PC.get(g); if (!m) PC.set(g, m = new Map());
  const id = kind + c + (c2 || '') + (sc || ''); if (m.has(id)) return m.get(id);
  const k = 3, dark = shade(c, 0.58), light = mixc(c, '#ffffff', 0.35); let tw = 32, th = 32, s0 = 1, draw;
  switch (kind) {
    case 'knit': tw = 22; th = 18; s0 = 0.62; draw = (x) => { x.fillStyle = dark; x.fillRect(0, 0, tw, th);
      for (const oy of [-th, 0, th]) for (const [cx, rot] of [[tw * 0.27, -0.55], [tw * 0.73, 0.55]]) { x.save(); x.translate(cx, th / 2 + oy); x.rotate(rot); x.fillStyle = c; x.beginPath(); x.ellipse(0, 0, tw * 0.21, th * 0.62, 0, 0, 7); x.fill();
        x.strokeStyle = light; x.globalAlpha = .55; x.lineWidth = 1.4; x.beginPath(); x.ellipse(-1, -1, tw * 0.1, th * 0.42, 0, Math.PI * 1.05, Math.PI * 1.95); x.stroke(); x.restore(); } }; break;
    case 'rib': tw = 10; th = 10; s0 = 1.2; draw = (x) => { x.fillStyle = c; x.fillRect(0, 0, 10, 10); x.fillStyle = dark; x.globalAlpha = .55; x.fillRect(0, 0, 2.4, 10); x.fillRect(5, 0, 1.2, 10); }; break;
    case 'tweed': tw = th = 16; s0 = 0.7; draw = (x) => { x.fillStyle = c; x.fillRect(0, 0, 16, 16); const r = rng(5);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.strokeStyle = (i + j) % 2 ? dark : light; x.lineWidth = 1.3; x.beginPath(); const d = i % 2 ? 1 : -1; x.moveTo(i * 4 + .5, j * 4 + (d > 0 ? .5 : 3.5)); x.lineTo(i * 4 + 3.5, j * 4 + (d > 0 ? 3.5 : .5)); x.stroke(); }
      for (let i = 0; i < 10; i++) { x.fillStyle = r() > .5 ? dark : light; x.fillRect(r() * 16, r() * 16, 1, 1); } }; break;
    case 'stripes': tw = 26; th = 8; draw = (x) => { x.fillStyle = c; x.fillRect(0, 0, tw, th); x.fillStyle = c2 || WHITE; x.fillRect(4, 0, 9, th); x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(13, 0, 2, th); }; break;
    case 'hstripes': tw = 8; th = 26; draw = (x) => { x.fillStyle = c; x.fillRect(0, 0, tw, th); x.fillStyle = c2 || WHITE; x.fillRect(0, 4, tw, 9); }; break;
    case 'check': tw = th = 30; draw = (x) => { x.fillStyle = c; x.fillRect(0, 0, 30, 30); x.fillStyle = rgba(c2 || shade(c, 0.6), 0.45); x.fillRect(0, 10, 30, 9); x.fillRect(10, 0, 9, 30);
      x.fillStyle = rgba(light, 0.5); x.fillRect(0, 25, 30, 1.5); x.fillRect(25, 0, 1.5, 30); }; break;
    case 'denim': tw = th = 12; draw = (x) => { x.fillStyle = c; x.fillRect(0, 0, 12, 12); x.strokeStyle = rgba(light, .45); x.lineWidth = 1.2; for (let i = -12; i < 24; i += 4) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 12, 12); x.stroke(); } }; break;
    case 'floral': tw = th = 34; draw = (x) => { x.fillStyle = c; x.fillRect(0, 0, 34, 34);
      for (const [fx, fy] of [[9, 9], [26, 25]]) { x.fillStyle = c2 || '#f2e6c8'; for (let p = 0; p < 5; p++) { const a = p / 5 * Math.PI * 2; x.beginPath(); x.arc(fx + Math.cos(a) * 3.6, fy + Math.sin(a) * 3.6, 2.6, 0, 7); x.fill(); } x.fillStyle = '#e8b84a'; x.beginPath(); x.arc(fx, fy, 1.8, 0, 7); x.fill(); }
      x.fillStyle = rgba('#4f8a3e', .8); x.beginPath(); x.ellipse(20, 10, 3, 1.6, .6, 0, 7); x.ellipse(8, 24, 3, 1.6, -.6, 0, 7); x.fill(); }; break;
    case 'dots': tw = th = 20; draw = (x) => { x.fillStyle = c; x.fillRect(0, 0, 20, 20); x.fillStyle = c2 || WHITE; x.beginPath(); x.arc(5, 5, 2.6, 0, 7); x.arc(15, 15, 2.6, 0, 7); x.fill(); }; break;
    default: tw = th = 32; draw = (x) => { x.fillStyle = c; x.fillRect(0, 0, 32, 32); const r = rng(9); for (let i = 0; i < 26; i++) { x.fillStyle = r() > .5 ? rgba(light, .35) : rgba(dark, .25); x.beginPath(); x.arc(r() * 32, r() * 32, 0.6 + r() * 1.6, 0, 7); x.fill(); } };
  }
  const cv = document.createElement('canvas'); cv.width = tw * k; cv.height = th * k; const x = cv.getContext('2d'); x.scale(k, k); draw(x);
  const p = g.createPattern(cv, 'repeat'); p.setTransform(new DOMMatrix().scale((sc || s0) / k)); m.set(id, p); return p;
}
const fabric = (g, f) => pattern(g, f.pattern || 'plain', f.color, f.color2, f.scale);
K.pattern = pattern; K.fabric = fabric;

// ======================================================================= outfits
/** Outfit = { top, bottom, shoes, socks, hat, hair, scarf, tie, belt, apron, glasses }.
 *  top:    { type: cardigan|sweater|shirt|pajama|coat|dress|hoodie|tshirt|vest, color, color2 (inner/collar), pattern, sleeve: 'long'|'short' }
 *  bottom: { type: trousers|knickers|shorts|skirt|pajama, color, color2, pattern }
 *  shoes:  { type: boots|shoes|sneakers|slippers, color }   socks: color
 *  hat:    { type: flatcap|beanie|sleepcap|hardhat|cap|fedora|headscarf|chef|none, color, color2 }
 *  hair:   { type: none|short|messy|braid|bun|long|curly, color } */
const OUTFITS = {
  villager: { top: { type: 'cardigan', color: '#83502e', color2: '#dcbf8f', pattern: 'knit' }, bottom: { type: 'knickers', color: '#6c4226', pattern: 'knit' },
    shoes: { type: 'boots', color: '#2e2522' }, socks: '#e2cfa6', hat: { type: 'flatcap', color: '#5d4837' }, scarf: '#c63c2a', hair: { type: 'none' } },
  villageGirl: { top: { type: 'dress', color: '#2f3442', color2: '#f4f0e6', pattern: 'plain' }, bottom: { type: 'skirt', color: '#2f3442' },
    shoes: { type: 'shoes', color: '#2a2220' }, socks: '#55585e', hair: { type: 'braid', color: '#6b3e22' } },
  granny: { top: { type: 'cardigan', color: '#6b6f8a', color2: '#e8dcc0', pattern: 'knit' }, bottom: { type: 'skirt', color: '#5a3a3a', pattern: 'floral', color2: '#e8c8a0' },
    shoes: { type: 'slippers', color: '#8a3a30' }, socks: '#d8ccb8', hat: { type: 'headscarf', color: '#f2ead8', color2: '#c84a3a' }, hair: { type: 'none' } },
  pajamas: { top: { type: 'pajama', color: '#5f80b8', color2: '#e8eef8', pattern: 'stripes' }, bottom: { type: 'pajama', color: '#5f80b8', color2: '#e8eef8', pattern: 'stripes' },
    shoes: { type: 'slippers', color: '#7a5a8a' }, socks: '#e8e0d0', hair: { type: 'messy', color: '#4a3020' } },
  office: { top: { type: 'shirt', color: '#eef2f6', color2: '#ffffff', pattern: 'plain' }, bottom: { type: 'trousers', color: '#3e4452', pattern: 'plain' },
    shoes: { type: 'shoes', color: '#2a2220' }, socks: '#2a2a30', tie: '#a8323a', belt: '#2a2220', hair: { type: 'short', color: '#3a2a20' } },
  casual: { top: { type: 'hoodie', color: '#d8743a', pattern: 'plain' }, bottom: { type: 'trousers', color: '#3e5a86', pattern: 'denim' },
    shoes: { type: 'sneakers', color: '#e8e4dc' }, socks: '#ffffff', hair: { type: 'short', color: '#4a3020' } },
  winter: { top: { type: 'coat', color: '#3e4a5e', color2: '#2a3240', pattern: 'tweed' }, bottom: { type: 'trousers', color: '#4a3a30', pattern: 'plain' },
    shoes: { type: 'boots', color: '#2e2522' }, socks: '#6a5a4a', hat: { type: 'beanie', color: '#c63c2a', color2: '#f2ead8' }, scarf: '#e8b84a', hair: { type: 'none' } },
  student: { top: { type: 'sweater', color: '#3f6e5a', pattern: 'knit' }, bottom: { type: 'trousers', color: '#5a4a3e', pattern: 'plain' },
    shoes: { type: 'sneakers', color: '#c8c2b6' }, socks: '#ffffff', hair: { type: 'curly', color: '#2a1c16' }, glasses: true },
  worker: { top: { type: 'shirt', color: '#5a7aa8', color2: '#5a7aa8', pattern: 'denim' }, bottom: { type: 'trousers', color: '#4a4f5a', pattern: 'plain' },
    shoes: { type: 'boots', color: '#5a3a24' }, socks: '#5a5a5a', hat: { type: 'hardhat', color: '#f2c43a' }, belt: '#3a2a20', hair: { type: 'none' } },
  chef: { top: { type: 'coat', color: '#f6f4ee', color2: '#f6f4ee', pattern: 'plain' }, bottom: { type: 'trousers', color: '#2e2e34', pattern: 'check', color2: '#f2f2f2' },
    shoes: { type: 'shoes', color: '#2a2220' }, socks: '#2a2a30', hat: { type: 'chef', color: '#ffffff' }, apron: '#f2f2ee', hair: { type: 'none' } },
  summer: { top: { type: 'tshirt', color: '#f2d24a', pattern: 'plain', sleeve: 'short' }, bottom: { type: 'shorts', color: '#4a7aa8', pattern: 'denim' },
    shoes: { type: 'sneakers', color: '#ffffff' }, socks: '#ffffff', hat: { type: 'cap', color: '#d84a3a' }, hair: { type: 'short', color: '#4a3020' } },
  // ---- period presets (c. 1900–1915, northern Europe)
  shipwright: { top: { type: 'vest', color: '#6a4a32', color2: '#ece2cc', pattern: 'tweed', sleeveColor: '#e6dcc4' }, bottom: { type: 'trousers', color: '#4e4438', pattern: 'tweed' },
    shoes: { type: 'boots', color: '#3a2a20' }, socks: '#6a5a4a', hat: { type: 'flatcap', color: '#4e4a44' }, hair: { type: 'short', color: '#5a3a22' }, belt: null },
  prisoner: { top: { type: 'shirt', color: '#9a9484', color2: '#8a8474', pattern: 'tweed' }, bottom: { type: 'trousers', color: '#77705f', pattern: 'tweed' },
    shoes: { type: 'shoes', color: '#4a3a2e' }, socks: '#5a5248', hair: { type: 'messy', color: '#5a3a22' } },
  professor: { top: { type: 'coat', color: '#5a5a66', color2: '#4a4a54', pattern: 'tweed' }, bottom: { type: 'trousers', color: '#55504a', pattern: 'plain' },
    shoes: { type: 'shoes', color: '#3a2a20' }, socks: '#4a4440', hair: { type: 'long', color: '#ece8de' }, beard: { color: '#f0ede4', len: 64 }, glasses: true },
  gentleman: { top: { type: 'suit', color: '#2e3448', color2: '#f6f2ea', pattern: 'tweed' }, bottom: { type: 'trousers', color: '#2a2e3e', pattern: 'plain' },
    shoes: { type: 'shoes', color: '#1e1a18' }, socks: '#2a2a30', hat: { type: 'bowler', color: '#22201e' }, tie: '#7a2a34', watch: true, hair: { type: 'short', color: '#5a3a22' }, beard: { color: '#5a3a22', len: 10 } },
  clerk: { top: { type: 'suit', color: '#4a4640', color2: '#f2eee4', pattern: 'plain' }, bottom: { type: 'trousers', color: '#3e3a34', pattern: 'plain' }, waistcoat: '#6a5a3e',
    shoes: { type: 'shoes', color: '#1e1a18' }, socks: '#2a2a30', tie: '#2e4a5a', watch: true, glasses: true, hair: { type: 'short', color: '#2a2018' } },
  lady1900: { top: { type: 'dress', color: '#3f5f7a', color2: '#f4f0e6', pattern: 'plain' }, bottom: { type: 'skirt', color: '#3f5f7a' }, shawl: '#b8743a',
    shoes: { type: 'shoes', color: '#2a2220' }, socks: '#4a4a52', hair: { type: 'bun', color: '#7a4a26' } },
  fisherman: { top: { type: 'sweater', color: '#3a4a62', pattern: 'knit' }, bottom: { type: 'trousers', color: '#3e3a36', pattern: 'plain' },
    shoes: { type: 'boots', color: '#2a2420' }, socks: '#5a5a5a', hat: { type: 'beanie', color: '#5a3a2e', color2: '#4a3026' }, beard: { color: '#6a4a30', len: 40 } },
  guard: { top: { type: 'coat', color: '#46523e', color2: '#3a4434', pattern: 'tweed' }, bottom: { type: 'trousers', color: '#3a4234', pattern: 'plain' },
    shoes: { type: 'boots', color: '#1e1a18' }, socks: '#2a2a2a', hat: { type: 'guard', color: '#46523e', color2: '#7a2a2a' }, belt: '#2a2018' },
};
K.OUTFITS = OUTFITS;
const outfitOf = (o) => { const base = typeof o === 'string' ? OUTFITS[o] : o; return { top: {}, bottom: {}, shoes: {}, hat: { type: 'none' }, hair: { type: 'none' }, socks: '#e2cfa6', ...base }; };

// ======================================================================= character rig
/* Local space: feet on y = 0, body centred on x = 0. Standing height ~640 at s = 1 (with a cap).
 * noah(g, {x, y, s, flip, pose, outfit, ...}) — see references/api.md for every option. */
const ARMS = { // [elbow, hand] offsets from the shoulder for the screen-right arm (mirrored for the left)
  hang: [[24, 106], [28, 206]], hip: [[72, 92], [16, 160]], wave: [[92, -18], [104, -150]], point: [[104, -6], [220, -30]],
  up: [[40, -116], [48, -232]], chin: [[48, 128], [-74, -16]], face: [[52, 120], [-60, -96]], hold: [[60, 118], [-18, 70]],
  drink: [[44, 130], [-62, -36]], rest: [[-4, 136], [-34, 236]], cross: [[44, 96], [-108, 92]], front: [[40, 112], [-30, 150]],
  type: [[56, 124], [-8, 168]], forward: [[70, 100], [40, 170]], shrug: [[86, 20], [128, -40]], head: [[96, -70], [-10, -150]],
};
// ---------------------------------------------------------------- human hands (white gloves) and shoes
const capsule = (g, x0, y0, a, len, w, fill = WHITE, ink = 3) => { g.save(); g.translate(x0, y0); g.rotate(a); g.beginPath(); g.roundRect(-w / 2, -w / 2, w, len + w / 2, w / 2); g.fillStyle = fill; g.fill(); if (ink) inkStroke(g, ink); g.restore(); };
/** white cartoon glove. local +y = finger direction. kind: open | grip | point | fist. mir = 1/-1 puts the thumb on the other side */
function glove(g, x, y, ang, kind = 'open', mir = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(mir, 1);
  const shadeHand = (P) => { g.save(); g.clip(P); g.fillStyle = 'rgba(110,100,130,.16)'; g.fillRect(6, -40, 50, 100); g.restore(); };
  if (kind === 'open') {
    [[-14, 12, 0.12, 24], [-4.6, 13, 0.04, 31], [4.8, 13, -0.03, 33], [14, 12, -0.11, 29]].forEach(([fx, fy, a, l]) => capsule(g, fx, fy, a, l, 11));
    const P = new Path2D(); P.roundRect(-21, -22, 42, 40, [12, 12, 16, 16]); g.fillStyle = WHITE; g.fill(P); shadeHand(P); inkP(g, P, 3.5);
    g.fillStyle = WHITE; g.fillRect(-17, 6, 34, 12); // hide the finger roots
    g.strokeStyle = rgba(INK, .55); g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); for (const sx of [-7, 0, 7]) { g.moveTo(sx, -14); g.lineTo(sx, -2); } g.stroke();
    capsule(g, -19, -6, 0.75, 22, 12);
    const C = new Path2D(); C.moveTo(-24, -42); C.lineTo(24, -42); C.lineTo(22, -22); C.lineTo(-22, -22); C.closePath(); g.fillStyle = WHITE; g.fill(C); inkP(g, C, 3);
    g.strokeStyle = rgba(INK, .5); g.lineWidth = 1.6; g.beginPath(); g.moveTo(-21, -29); g.lineTo(21, -29); g.stroke();
  } else {
    // fingers curled across the front: four stacked rounded segments, knuckles to one side
    const rows = kind === 'point' ? 3 : 4;
    for (let i = rows - 1; i >= 0; i--) { const yy = -16 + i * 10.5 + (kind === 'point' ? 10.5 : 0), w2 = 44 - i * 3; g.beginPath(); g.roundRect(-24, yy, w2, 12, 6); g.fillStyle = WHITE; g.fill(); inkStroke(g, 2.6); }
    const B = new Path2D(); B.roundRect(8, -24, 22, 48, 10); g.fillStyle = WHITE; g.fill(B); shadeHand(B); inkP(g, B, 3.5);
    if (kind === 'point') capsule(g, -18, -12, Math.PI - 0.05, 40, 12);
    capsule(g, 14, -22, Math.PI / 2 + 0.25, 30, 12); // thumb over the top
  }
  g.restore();
}
/** front-view shoe (toe toward the camera, turned out by sd) */
function shoe(g, x, y, sd, sh) {
  const type = sh.type || 'shoes', c = sh.color || '#2e2522';
  g.save(); g.translate(x, y); g.scale(sd, 1);
  const top = type === 'boots' ? -74 : type === 'slippers' ? -20 : -32;
  const P = new Path2D(); P.moveTo(-24, top); P.lineTo(22, top); P.lineTo(24, -26); P.bezierCurveTo(40, -24, 52, -12, 46, -1); P.quadraticCurveTo(40, 6, 12, 6); P.lineTo(-20, 6); P.quadraticCurveTo(-34, 5, -32, -8); P.lineTo(-26, -26); P.closePath();
  shape(g, P, c, [-32, top, 52, 6], { ink: 3.8, shade: 0.3, hi: 0.22 });
  g.fillStyle = type === 'sneakers' ? '#ffffff' : shade(c, 0.55); g.beginPath(); g.moveTo(-32, -4); g.quadraticCurveTo(-34, 6, -20, 7); g.lineTo(14, 7); g.quadraticCurveTo(42, 7, 47, -3); g.lineTo(46, 1); g.quadraticCurveTo(40, 11, 12, 11); g.lineTo(-20, 11); g.quadraticCurveTo(-34, 10, -32, -4); g.closePath(); g.fill(); inkStroke(g, 2.5);
  if (type === 'shoes' || type === 'sneakers') { g.strokeStyle = type === 'sneakers' ? '#ffffff' : mixc(c, '#ffffff', 0.4); g.lineWidth = 2.6; g.lineCap = 'round'; g.beginPath(); for (let k = 0; k < 3; k++) { g.moveTo(-6, -28 + k * 6); g.lineTo(14, -24 + k * 6); g.moveTo(14, -28 + k * 6); g.lineTo(-6, -24 + k * 6); } g.stroke();
    g.strokeStyle = rgba(INK, .5); g.lineWidth = 1.8; g.beginPath(); g.moveTo(18, -16); g.quadraticCurveTo(34, -18, 40, -8); g.stroke(); }
  if (type === 'boots') { g.fillStyle = shade(c, 0.75); g.fillRect(-26, top, 50, 10); g.strokeStyle = INK; g.lineWidth = 2.5; g.strokeRect(-26, top, 50, 10); g.strokeStyle = rgba('#ffffff', .2); g.beginPath(); g.moveTo(-18, top + 16); g.lineTo(-16, -30); g.stroke(); }
  if (type === 'slippers') { g.fillStyle = mixc(c, '#ffffff', 0.55); g.beginPath(); g.ellipse(8, -18, 26, 8, -0.15, 0, 7); g.fill(); inkStroke(g, 2); }
  g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(26, -14, 9, 4, -0.3, 0, 7); g.fill();
  g.restore();
}
/** side-view shoe facing +x; heel at x-34, toe at x+70. rot tilts it about the heel/ball */
function shoeSide(g, x, y, sh, rot = 0) {
  const type = sh.type || 'shoes', c = sh.color || '#2e2522';
  g.save(); g.translate(x, y); g.rotate(rot);
  const top = type === 'boots' ? -76 : type === 'slippers' ? -20 : -34;
  const P = new Path2D(); P.moveTo(-32, top); P.lineTo(12, top); P.lineTo(16, -30); P.bezierCurveTo(40, -30, 66, -24, 70, -10); P.quadraticCurveTo(72, -2, 62, 0); P.lineTo(-34, 0); P.quadraticCurveTo(-42, -2, -40, -16); P.lineTo(-32, top); P.closePath();
  shape(g, P, c, [-40, top, 72, 0], { ink: 3.8, shade: 0.3, hi: 0.22 });
  g.fillStyle = type === 'sneakers' ? '#ffffff' : shade(c, 0.5); g.beginPath(); g.roundRect(-40, -6, 112, 11, 5); g.fill(); inkStroke(g, 2.5);
  g.fillStyle = shade(c, 0.4); g.beginPath(); g.roundRect(-40, -8, 30, 15, 4); g.fill(); inkStroke(g, 2.5); // heel
  if (type === 'shoes' || type === 'sneakers') { g.strokeStyle = type === 'sneakers' ? '#ffffff' : mixc(c, '#ffffff', 0.4); g.lineWidth = 2.6; g.lineCap = 'round'; g.beginPath(); for (let k = 0; k < 3; k++) { g.moveTo(8 + k * 9, -30 + k * 2); g.lineTo(14 + k * 9, -24 + k * 2); } g.stroke();
    g.strokeStyle = rgba(INK, .5); g.lineWidth = 1.8; g.beginPath(); g.moveTo(40, -24); g.quadraticCurveTo(52, -14, 50, -4); g.stroke(); }
  if (type === 'boots') { g.fillStyle = shade(c, 0.75); g.fillRect(-34, top, 48, 10); g.strokeStyle = INK; g.lineWidth = 2.5; g.strokeRect(-34, top, 48, 10); }
  if (type === 'slippers') { g.fillStyle = mixc(c, '#ffffff', 0.55); g.beginPath(); g.ellipse(36, -16, 26, 8, 0, 0, 7); g.fill(); inkStroke(g, 2); }
  g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(46, -18, 10, 4, -0.2, 0, 7); g.fill();
  g.restore();
}
// ---------------------------------------------------------------- side (profile) view, facing +x (use flip for -x)
const SIDE_ARMS = {
  hang: [[4, 104], [12, 204]], hold: [[22, 112], [96, 84]], drink: [[36, 116], [116, -44]], point: [[100, -8], [210, -16]], forward: [[84, 56], [176, 64]],
  up: [[22, -112], [36, -226]], wave: [[70, -40], [86, -170]], chin: [[46, 112], [114, -12]], face: [[48, 110], [114, -84]], rest: [[60, 96], [146, 158]],
  type: [[60, 108], [156, 122]], cross: [[52, 96], [70, 92]], hip: [[-62, 76], [-24, 148]], head: [[64, -80], [50, -176]], shrug: [[40, 40], [64, -24]],
};
const DARK_O = new WeakMap();
/** the far arm/leg in profile: same outfit, colours at 78 % (cheap stand-in for a brightness filter) */
function darkOutfit(O) { let d = DARK_O.get(O); if (d) return d; const k = 0.78, sc = (c) => (typeof c === 'string' && c[0] === '#' ? shade(c, k) : c), dk = (f) => f ? { ...f, color: sc(f.color), color2: sc(f.color2), sleeveColor: sc(f.sleeveColor) } : f;
  d = { ...O, top: dk(O.top), bottom: dk(O.bottom), shoes: dk(O.shoes), socks: sc(O.socks) }; DARK_O.set(O, d); return d; }
function legsSide(g, o, F, O0) {
  const walk = o.pose === 'walk', sit = o.pose === 'sit'; let O = O0;
  for (const far of [true, false]) {
    O = far ? darkOutfit(O0) : O0; const b = O.bottom, bt = b.type || 'trousers', isDress = O.top.type === 'dress', bf = fabric(g, isDress ? O.top : { pattern: 'plain', ...b }), sock = O.socks;
    const ph = (o.step || 0) * Math.PI * 2 + (far ? Math.PI : 0);
    let hip = [-8, F.hipY + 16], knee, ankle, foot, rot = 0;
    if (sit) { hip = [-30, F.hipY + 4]; knee = [118 - (far ? 16 : 0), F.hipY + 14]; ankle = [126 - (far ? 16 : 0), -34]; foot = [ankle[0] + 2, 0]; }
    else if (o.pose === 'kneel') { const fo = far ? -26 : 0; knee = [64 + fo, -22]; ankle = [-92 + fo, -40]; g.save(); shoeSide(g, -104 + fo, -46, O.shoes, 1.05);
      if (bt === 'skirt' || isDress) { tube(g, knee[0], knee[1], ankle[0], ankle[1], 46, 42, sock); } else { tube(g, knee[0], knee[1], ankle[0], ankle[1], 74, 66, bf); tube(g, hip[0], hip[1], knee[0], knee[1], 88, 80, bf); } g.restore(); continue; }
    else if (walk) { const sw = Math.sin(ph) * 62, lift = Math.max(0, Math.cos(ph)) * 28; foot = [sw + 4, -lift]; ankle = [foot[0] - 4, foot[1] - 32]; knee = [(hip[0] + ankle[0]) / 2 + 12 + lift * 0.9, (hip[1] + ankle[1]) / 2 + lift * 0.2]; rot = lift > 1 ? -0.16 * Math.sin(ph) : 0; }
    else { foot = [far ? -12 : 14, 0]; ankle = [foot[0] - 4, -32]; knee = [(hip[0] + ankle[0]) / 2 + 6, (hip[1] + ankle[1]) / 2]; }
    g.save();
    shoeSide(g, foot[0], foot[1], O.shoes, rot);
    if (bt === 'trousers' || bt === 'pajama') { tube(g, knee[0], knee[1], ankle[0], ankle[1], 76, 68, bf); tube(g, hip[0], hip[1], knee[0], knee[1], 88, 78, bf); }
    else if (bt === 'knickers') { tube(g, knee[0], knee[1], ankle[0], ankle[1], 56, 54, pattern(g, 'knit', sock, null, 0.5)); tube(g, hip[0], hip[1], lerp(hip[0], knee[0], 1.08), lerp(hip[1], knee[1], 1.08), 98, 92, bf); }
    else if (bt === 'shorts') { tube(g, knee[0], knee[1], ankle[0], ankle[1], 38, 36, WHITE); tube(g, hip[0], hip[1], knee[0], knee[1], 40, 38, WHITE); tube(g, hip[0], hip[1], lerp(hip[0], knee[0], 0.55), lerp(hip[1], knee[1], 0.55), 92, 86, bf); }
    else { tube(g, knee[0], knee[1], ankle[0], ankle[1], 44, 42, sock); tube(g, hip[0], hip[1], knee[0], knee[1], 48, 44, sock); }
    g.restore();
  }
  O = O0; const b = O.bottom, bt = b.type || 'trousers', isDress = O.top.type === 'dress';
  if (sit && (isDress || bt === 'skirt')) { const P = new Path2D(), y0 = F.hipY - 40; P.moveTo(-84, y0); P.lineTo(60, y0); P.quadraticCurveTo(150, F.hipY - 22, 152, F.hipY + 10); P.lineTo(150, F.hipY + 70); P.quadraticCurveTo(120, F.hipY + 84, 92, F.hipY + 72); P.lineTo(96, F.hipY + 36); P.lineTo(-84, F.hipY + 40); P.closePath();
    shape(g, P, fabric(g, isDress ? O.top : b), [-84, y0, 152, F.hipY + 80]); return; }
  if (bt === 'skirt' && !isDress) { const P = new Path2D(), y0 = F.hipY - 10, y1 = F.hipY + (sit ? 40 : 120); P.moveTo(-78, y0); P.lineTo(78, y0); P.lineTo(sit ? 150 : 104, y1); P.quadraticCurveTo(0, y1 + 14, -100, y1); P.closePath(); shape(g, P, fabric(g, b), [-100, y0, 150, y1]); }
}
function torsoSide(g, o, F, O) {
  const T = O.top, tt = T.type || 'sweater', n = F.neckY, h = F.hipY, sit = o.pose === 'sit', t = o.t || 0;
  const long = tt === 'coat' ? (sit ? 30 : 120) : tt === 'suit' ? (sit ? 10 : 40) : tt === 'dress' ? (sit ? 0 : 96) : 0, fl = tt === 'dress' ? (sit ? 0 : 40) : tt === 'coat' ? 10 : tt === 'suit' ? 4 : 0;
  if (tt === 'hoodie') { const HP = new Path2D(); HP.ellipse(-52, n + 14, 46, 40, -0.3, 0, 7); shape(g, HP, shade(T.color, 0.82), [-98, n - 26, -6, n + 54]); }
  const P = new Path2D(); P.moveTo(-34, n); P.bezierCurveTo(-72, n + 6, -90, n + 46, -86, n + 100); P.bezierCurveTo(-84, n + 160, -82 - fl * 0.3, h - 30, -80 - fl * 0.6, h + long);
  P.quadraticCurveTo(0, h + long + 14, 80 + fl, h + long); P.bezierCurveTo(84 + fl * 0.3, h - 40, 90, n + 120, 80, n + 66); P.bezierCurveTo(70, n + 24, 46, n + 2, 30, n); P.closePath();
  shape(g, P, fabric(g, T), [-90, n, 90, h + long], { ink: 5, shade: 0.4, hi: 0.12 });
  const rib = (P2) => { g.fillStyle = pattern(g, 'rib', T.color); g.fill(P2); inkP(g, P2, 3); };
  const hem = () => { const HP = new Path2D(); HP.moveTo(-82, h - 22); HP.quadraticCurveTo(0, h - 8, 82, h - 22); HP.lineTo(82, h); HP.quadraticCurveTo(0, h + 14, -82, h); HP.closePath(); rib(HP); };
  const btn = (x, ys, c = '#3a2418') => { for (const y of ys) { g.fillStyle = c; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); g.strokeStyle = rgba('#000000', .4); g.lineWidth = 1.5; g.stroke(); } };
  if (tt === 'cardigan') { const SW = new Path2D(); SW.moveTo(46, n + 2); SW.lineTo(76, n + 40); SW.lineTo(84, h - 2); SW.lineTo(62, h - 2); SW.closePath(); shape(g, SW, pattern(g, 'rib', T.color2 || '#dcbf8f'), [46, n, 84, h], { ink: 3 }); btn(56, [n + 110, n + 154, n + 196]);
    const PK = new Path2D(); PK.roundRect(-18, h - 66, 54, 46, 8); g.fillStyle = 'rgba(40,20,10,.18)'; g.fill(PK); inkP(g, PK, 2.5); hem(); }
  else if (tt === 'sweater') { hem(); const C = new Path2D(); C.ellipse(0, n + 2, 40, 12, 0, 0, Math.PI); C.lineTo(-40, n - 6); C.ellipse(0, n - 6, 40, 10, 0, Math.PI, 0, true); rib(C); }
  else if (tt === 'shirt' || tt === 'pajama') { g.strokeStyle = rgba(INK, .6); g.lineWidth = 2.5; g.beginPath(); g.moveTo(66, n + 30); g.lineTo(80, h); g.stroke(); btn(70, [n + 76, n + 124, n + 172], tt === 'pajama' ? (T.color2 || WHITE) : '#d8d4cc');
    poly(g, [[22, n + 2], [70, n - 6], [58, n + 40]]); fillInk(g, T.color2 || WHITE, 3);
    if (O.tie) { const sw = Math.sin(t * 5) * (o.pose === 'walk' ? 6 : 0); poly(g, [[66, n + 10], [80, n + 12], [92 + sw, n + 140], [80 + sw, n + 160], [70 + sw, n + 138]]); fillInk(g, O.tie, 3); } }
  else if (tt === 'coat') { poly(g, [[30, n], [72, n - 2], [84, n + 70], [44, n + 120]]); fillInk(g, shade(T.color, 0.82), 3); btn(60, [n + 160, n + 214, h + 20], shade(T.color, .5));
    g.fillStyle = T.color2 || shade(T.color, .7); g.fillRect(-84, h - 40, 168, 22); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(-84, h - 40, 168, 22); }
  else if (tt === 'suit') { poly(g, [[34, n], [74, n - 2], [70, n + 120]]); fillInk(g, T.color2 || WHITE, 3); if (O.tie) { poly(g, [[62, n + 8], [74, n + 10], [80, n + 110], [70, n + 124], [64, n + 108]]); fillInk(g, O.tie, 3); }
    poly(g, [[30, n], [62, n + 6], [80, n + 60], [60, n + 150]]); fillInk(g, shade(T.color, 0.8), 3); btn(62, [n + 176, n + 214], shade(T.color, .45)); }
  else if (tt === 'dress') { const C = new Path2D(); C.moveTo(20, n + 2); C.quadraticCurveTo(50, n + 44, 76, n + 16); C.quadraticCurveTo(64, n - 4, 20, n - 2); g.fillStyle = T.color2 || WHITE; g.fill(C); inkP(g, C, 3); btn(66, [n + 70, n + 110, n + 150], '#cfc8bc'); }
  else if (tt === 'hoodie') { const PK = new Path2D(); PK.moveTo(-10, h - 86); PK.lineTo(70, h - 86); PK.lineTo(84, h - 18); PK.lineTo(-10, h - 18); PK.closePath(); g.fillStyle = rgba('#000000', .1); g.fill(PK); inkP(g, PK, 3);
    g.strokeStyle = '#f2ead8'; g.lineWidth = 4; g.beginPath(); g.moveTo(52, n + 20); g.lineTo(60, n + 100); g.stroke(); hem(); }
  else if (tt === 'tshirt') { const C = new Path2D(); C.ellipse(10, n + 2, 40, 12, 0, 0, Math.PI); C.lineTo(-30, n - 6); C.ellipse(10, n - 6, 40, 10, 0, Math.PI, 0, true); rib(C); }
  else if (tt === 'vest') { const SW = new Path2D(); SW.moveTo(40, n + 2); SW.lineTo(78, n + 30); SW.lineTo(70, n + 120); SW.closePath(); shape(g, SW, T.color2 || WHITE, [40, n, 78, n + 120], { ink: 3 }); }
  if (O.belt && tt !== 'dress' && tt !== 'coat') { g.fillStyle = O.belt; g.fillRect(-84, h - 18, 168, 18); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(-84, h - 18, 168, 18); g.fillStyle = '#d9a93a'; g.fillRect(56, h - 20, 22, 22); g.strokeRect(56, h - 20, 22, 22); }
  if (O.apron) { const A = new Path2D(); A.roundRect(36, n + 70, 54, h - n - 10 + (sit ? 20 : 90), 14); shape(g, A, O.apron, [36, n + 70, 90, h + 90], { ink: 3.5, shade: 0.2 }); }
  if (O.scarf) { const sc = pattern(g, 'knit', O.scarf, null, 0.52), fl2 = o.pose === 'walk' ? Math.sin(t * 7) * 10 : 0;
    const ST = new Path2D(); ST.moveTo(-40, n + 6); ST.bezierCurveTo(-80, n + 30, -110 + fl2, n + 70, -126 + fl2, n + 120); ST.lineTo(-90 + fl2, n + 130); ST.bezierCurveTo(-76, n + 80, -50, n + 46, -14, n + 30); ST.closePath();
    shape(g, ST, sc, [-126, n, -14, n + 130], { ink: 4, shade: 0.3 });
    const SB = new Path2D(); SB.moveTo(-60, n - 10); SB.quadraticCurveTo(10, n + 4, 72, n - 12); SB.lineTo(76, n + 26); SB.quadraticCurveTo(10, n + 46, -64, n + 26); SB.closePath(); shape(g, SB, sc, [-64, n - 12, 76, n + 46], { ink: 4, shade: 0.3 });
    const FT = new Path2D(); FT.moveTo(46, n + 20); FT.bezierCurveTo(60, n + 70, 64, n + 110, 62, n + 150); FT.lineTo(92, n + 150); FT.bezierCurveTo(90, n + 100, 82, n + 60, 72, n + 18); FT.closePath(); shape(g, FT, sc, [46, n + 20, 92, n + 150], { ink: 4, shade: 0.3 }); }
  if (O.watch && (tt === 'vest' || tt === 'suit')) { g.strokeStyle = '#e8c050'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(66, h - 70); g.quadraticCurveTo(40, h - 40, 10, h - 60); g.stroke(); }
  if (O.shawl) { const shw = pattern(g, 'knit', O.shawl, null, 0.5), P = new Path2D(); P.moveTo(-94, n + 30); P.quadraticCurveTo(-60, n - 10, 30, n - 6); P.quadraticCurveTo(70, n, 78, n + 40); P.quadraticCurveTo(74, n + 120, 50, n + 170); P.lineTo(10, n + 120); P.quadraticCurveTo(-40, n + 150, -96, n + 170); P.closePath();
    shape(g, P, shw, [-96, n - 10, 78, n + 170], { ink: 4, shade: 0.3 }); }
}
function armSideDraw(g, o, F, O, far) {
  if (far) O = darkOutfit(O);
  const S = [-6, F.neckY + 54], spec = far ? o.armL : o.armR, t = o.t || 0; let E, Hh;
  if (spec && typeof spec === 'object' && spec.H) { E = spec.E; Hh = spec.H; }
  else {
    let p = Array.isArray(spec) ? spec : SIDE_ARMS[spec || 'hang'];
    if (spec === 'swing') { const a = Math.sin((o.step || 0) * Math.PI * 2 + (far ? 0 : Math.PI)) * 0.55; p = [[Math.sin(a * 0.7) * 104 + 6, Math.cos(a * 0.7) * 104], [Math.sin(a) * 204 + 14, Math.cos(a) * 200]]; }
    if (spec === 'wave') { const w = Math.sin(t * 9) * 22; p = [[70, -40], [86 + w, -170]]; }
    if (spec === 'type') p = [[60, 108], [156 + Math.sin(t * 22 + (far ? 1 : 0)) * 5, 122 - Math.max(0, Math.sin(t * 18)) * 6]];
    if (!p) p = SIDE_ARMS.hang; if (far) p = [[p[0][0] - 10, p[0][1]], [p[1][0] - 12, p[1][1]]];
    E = [S[0] + p[0][0], S[1] + p[0][1]]; Hh = [S[0] + p[1][0], S[1] + p[1][1]];
  }
  const hold = far ? o.holdL : o.holdR, hs = hold ? (typeof hold === 'string' ? { item: hold } : hold) : null;
  const dx = Hh[0] - E[0], dy = Hh[1] - E[1], L = Math.hypot(dx, dy) || 1, wrist = [Hh[0] - dx / L * 26, Hh[1] - dy / L * 26];
  const T = O.top, sleeveF = T.sleeveColor ? pattern(g, T.sleevePattern || 'plain', T.sleeveColor) : fabric(g, T), cuffC = T.sleeveColor || T.color, short = T.sleeve === 'short';
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  if (short) { const mid = [lerp(S[0], E[0], 0.6), lerp(S[1], E[1], 0.6)]; g.beginPath(); g.moveTo(mid[0], mid[1]); g.lineTo(E[0], E[1]); g.lineTo(wrist[0], wrist[1]); g.strokeStyle = INK; g.lineWidth = 44; g.stroke(); g.strokeStyle = WHITE; g.lineWidth = 35; g.stroke();
    g.beginPath(); g.moveTo(S[0], S[1]); g.lineTo(mid[0], mid[1]); g.strokeStyle = INK; g.lineWidth = 72; g.stroke(); g.strokeStyle = sleeveF; g.lineWidth = 63; g.stroke(); }
  else { g.beginPath(); g.moveTo(S[0], S[1]); g.lineTo(E[0], E[1]); g.lineTo(wrist[0], wrist[1]); g.strokeStyle = INK; g.lineWidth = 72; g.stroke(); g.strokeStyle = sleeveF; g.lineWidth = 63; g.stroke();
    g.strokeStyle = 'rgba(30,20,50,.16)'; g.lineWidth = 24; g.save(); g.translate(8, 8); g.stroke(); g.restore();
    const CU = new Path2D(); CU.ellipse(wrist[0], wrist[1], 29, 21, Math.atan2(dy, dx) + Math.PI / 2, 0, 7); g.fillStyle = T.sleeveColor ? shade(cuffC, 0.92) : pattern(g, 'rib', T.color); g.fill(CU); inkP(g, CU, 3); }
  const ang = Math.atan2(dy, dx) - Math.PI / 2;
  if (hs) { const off = HOLD_OFF[hs.item] || [0, 0]; ITEMS[hs.item](g, Hh[0] + off[0], Hh[1] + off[1], hs.s || 1, hs); glove(g, Hh[0], Hh[1], (hs.tilt || 0) * 0.6, 'grip', -1); }
  else glove(g, Hh[0], Hh[1], ang, spec === 'point' ? 'point' : 'open', -1);
  g.restore();
  return { hand: Hh, elbow: E };
}
function headSideDraw(g, o, F, O) {
  const cx = 10, cy = F.headY;
  g.save(); g.translate(0, F.neckY + 20); g.rotate(o.headTilt || 0); g.translate(0, -(F.neckY + 20));
  hairBack(g, cx, cy, O);
  const HP = new Path2D(); HP.ellipse(cx, cy, 116, 128, 0, 0, 7);
  g.fillStyle = '#e2ddd4'; g.fill(HP); g.save(); g.clip(HP); g.fillStyle = WHITE; g.beginPath(); g.ellipse(cx + 10, cy - 10, 110, 121, 0, 0, 7); g.fill();
  g.restore(); inkP(g, HP, 5.5);
  if (O.beard) beardDraw(g, cx, cy, O.beard, true);
  g.save(); g.clip(HP); eyesDraw(g, cx, cy, { ...o, side: true, outfitGlasses: O.glasses }); g.restore();
  const hr = O.hair || {}, ht = hr.type || 'none';
  if (['short', 'messy', 'curly', 'long', 'bun', 'braid'].includes(ht)) { const c = hr.color || '#4a3020', P = new Path2D();
    P.ellipse(cx, cy - 4, 122, 134, 0, -0.3 * Math.PI, 0.72 * Math.PI, true); P.quadraticCurveTo(cx - 70, cy + 10, cx - 50, cy - 40); P.quadraticCurveTo(cx + 10, cy - 70, cx + 72, cy - 104); P.closePath();
    shape(g, P, c, [cx - 122, cy - 138, cx + 76, cy + 96], { ink: 4.5, shade: 0.3 });
    g.strokeStyle = rgba(mixc(c, '#ffffff', 0.35), 0.7); g.lineWidth = 2.5; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(cx - 30 + k * 24, cy - 60, 60, 50, 0, Math.PI * 1.2, Math.PI * 1.55); g.stroke(); }
    if (ht === 'messy') for (const [a, l] of [[-2.2, 22], [-1.9, 28], [-1.6, 24], [-1.3, 20]]) { const x0 = cx + Math.cos(a) * 118, y0 = cy + Math.sin(a) * 128; poly(g, [[x0 - 10, y0 + 8], [x0 + Math.cos(a - 0.3) * l, y0 + Math.sin(a - 0.3) * l], [x0 + 10, y0 + 8]]); fillInk(g, c, 3.5); }
    if (ht === 'bun') ell(g, cx - 86, cy - 96, 36, 30, c, 4); if (ht === 'curly') for (let i = 0; i < 7; i++) { const a = Math.PI * (0.75 + i * 0.12); ell(g, cx + Math.cos(a) * 112, cy - 4 + Math.sin(a) * 124, 20, 18, c, 3.5); } }
  greyStrands(g, cx, cy, O, true); hatDraw(g, cx, cy, O, o);
  g.restore();
}
/** beard = { color, len (px below the chin), short: bool }. Covers jaw and chin only; the eyes stay free, there is never a mouth. */
function beardDraw(g, cx, cy, b, side) {
  const c = b.color || '#f2efe6', L = b.len ?? 60, P = new Path2D();
  if (side) { const e = (a) => [cx + 116 * Math.cos(a), cy + 128 * Math.sin(a)]; P.moveTo(cx - 64, cy + 26); P.quadraticCurveTo(cx + 10, cy + 70, cx + 64, cy + 58); P.quadraticCurveTo(cx + 92, cy + 52, ...e(0.42));
    for (const a of [0.6, 0.85, 1.1]) P.lineTo(...e(a)); P.quadraticCurveTo(cx + 70, cy + 120 + L * 0.8, cx + 46, cy + 126 + L); P.quadraticCurveTo(cx - 10, cy + 120 + L * 0.5, cx - 40, cy + 112); P.quadraticCurveTo(cx - 70, cy + 80, cx - 64, cy + 26); P.closePath(); }
  else { P.moveTo(cx - 116, cy + 6); P.bezierCurveTo(cx - 122, cy + 90, cx - 80, cy + 130 + L * 0.8, cx, cy + 132 + L); P.bezierCurveTo(cx + 80, cy + 130 + L * 0.8, cx + 122, cy + 90, cx + 116, cy + 6);
    P.quadraticCurveTo(cx + 96, cy + 52, cx + 46, cy + 56); P.quadraticCurveTo(cx, cy + 74, cx - 46, cy + 56); P.quadraticCurveTo(cx - 96, cy + 52, cx - 116, cy + 6); P.closePath(); }
  shape(g, P, c, side ? [cx - 44, cy + 30, cx + 124, cy + 128 + L] : [cx - 122, cy, cx + 122, cy + 132 + L], { ink: 4.5, shade: 0.28, hi: 0.1 });
  g.save(); g.clip(P); g.strokeStyle = rgba(shade(c, 0.72), 0.75); g.lineWidth = 2.4; g.lineCap = 'round'; const r = rng(77);
  for (let i = 0; i < 26; i++) { const x = cx + (side ? -20 + r() * 130 : -100 + r() * 200), y = cy + 60 + r() * (60 + L); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 6, y + 12, x + (r() - 0.5) * 10, y + 24); g.stroke(); }
  g.restore();
}
/** a few grey strands over the hair (hair.grey 0..1) */
function greyStrands(g, cx, cy, O, side) {
  const hr = O.hair || {}; if (!hr.grey || hr.type === 'none') return;
  g.save(); g.strokeStyle = rgba('#e4e0dc', 0.85 * hr.grey); g.lineWidth = 3; g.lineCap = 'round';
  const arcs = side ? [[-40, -40], [-10, -70], [20, -96]] : [[-70, -60], [-30, -96], [40, -90], [80, -50]];
  for (const [dx, dy] of arcs) { g.beginPath(); g.moveTo(cx + dx - 20, cy + dy + 18); g.quadraticCurveTo(cx + dx, cy + dy - 6, cx + dx + 26, cy + dy + 10); g.stroke(); }
  g.restore();
}
// ---------------------------------------------------------------- in-scene text (ALWAYS German, only when the story needs it)
const FONTS = { sans: '"Inter","DejaVu Sans",Arial,sans-serif', serif: '"DejaVu Serif",Georgia,serif', hand: '"DejaVu Serif",Georgia,serif', mono: '"DejaVu Sans Mono",monospace', display: '"Inter Display","Inter","DejaVu Sans",sans-serif' };
/** text(g, 'Schlaf ist wichtig', x, y, {size, font: sans|serif|hand|mono|display, weight, color, align, maxW, rot, outline, lineH}) — multi-line with \n */
function text(g, s, x, y, { size = 40, font = 'sans', weight = 'bold', color = INK, align = 'center', base = 'middle', maxW = null, rot = 0, outline = null, outlineW = 6, lineH = 1.18, alpha = 1 } = {}) {
  const lines = String(s).split('\n'); g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha *= alpha;
  const fam = FONTS[font] || font, sty = font === 'hand' ? 'italic ' : '';
  let sz = size; g.font = `${sty}${weight} ${sz}px ${fam}`;
  if (maxW) { const w = Math.max(...lines.map((l) => g.measureText(l).width)); if (w > maxW) { sz = size * maxW / w; g.font = `${sty}${weight} ${sz}px ${fam}`; } }
  g.textAlign = align; g.textBaseline = base; g.lineJoin = 'round';
  lines.forEach((l, i) => { const yy = (i - (lines.length - 1) / 2) * sz * lineH; if (outline) { g.strokeStyle = outline; g.lineWidth = outlineW; g.strokeText(l, 0, yy); } g.fillStyle = color; g.fillText(l, 0, yy); });
  g.restore();
}
K.text = text; K.FONTS = FONTS;
function frameOf(o) {
  let hipY = o.pose === 'sit' ? -268 : o.pose === 'kneel' ? -112 : -168;
  if (o.pose === 'walk') hipY -= Math.abs(Math.sin(o.step * Math.PI * 2)) * 9;
  hipY += o.bob || 0;
  const neckY = hipY - 212 + (o.hunch || 0) * 22;
  return { hipY, neckY, headY: neckY - 104, sh: [[-98, neckY + 48], [98, neckY + 48]] };
}
function tube(g, x0, y0, x1, y1, w0, w1, fill, ink = 4.5) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const P = new Path2D(); P.moveTo(x0 + nx * w0 / 2, y0 + ny * w0 / 2); P.lineTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2);
  P.quadraticCurveTo(x1 + dx / L * w1 * 0.3, y1 + dy / L * w1 * 0.3, x1 - nx * w1 / 2, y1 - ny * w1 / 2); P.lineTo(x0 - nx * w0 / 2, y0 - ny * w0 / 2); P.closePath();
  shape(g, P, fill, [Math.min(x0, x1) - w0 / 2, Math.min(y0, y1), Math.max(x0, x1) + w0 / 2, Math.max(y0, y1)], { ink, shade: 0.36 });
}
function legs(g, o, F, O) {
  const b = O.bottom, bt = b.type || 'trousers', isDress = O.top.type === 'dress', bf = fabric(g, isDress ? O.top : { pattern: 'plain', ...b }), sock = O.socks;
  if (o.pose === 'sit') {
    for (const sd of [-1, 1]) {
      const kx = sd * 72; g.fillStyle = 'rgba(30,15,10,.35)';
      shoe(g, kx + sd * 6, 0, sd, O.shoes);
      if (bt === 'trousers' || bt === 'pajama') tube(g, kx, -150, kx + sd * 4, -30, 84, 76, bf);
      else { tube(g, kx, -120, kx + sd * 4, -26, 62, 60, isDress || bt === 'skirt' ? sock : pattern(g, 'knit', sock, null, 0.5));
        if (bt === 'knickers') tube(g, kx, -150, kx + sd * 2, -84, 104, 92, bf); if (bt === 'shorts') tube(g, kx, -130, kx + sd * 4, -40, 42, 40, WHITE); }
    }
    const t = F.hipY - 20, kb = -100, lapF = isDress || bt === 'skirt' ? fabric(g, isDress ? O.top : b) : bf;
    const P = new Path2D(); P.moveTo(-134, t); P.bezierCurveTo(-154, t + 50, -152, kb - 40, -132, kb - 12); P.bezierCurveTo(-104, kb + 16, -28, kb + 12, -2, kb - 14);
    P.bezierCurveTo(26, kb + 12, 104, kb + 16, 132, kb - 12); P.bezierCurveTo(152, kb - 40, 154, t + 50, 134, t); P.closePath();
    shape(g, P, lapF, [-150, t, 150, kb + 10], { ink: 4.5, shade: 0.38 });
    g.save(); g.clip(P); const kg = g.createLinearGradient(0, t, 0, kb); kg.addColorStop(0, 'rgba(20,10,5,.4)'); kg.addColorStop(0.5, 'rgba(20,10,5,0)'); g.fillStyle = kg; g.fillRect(-160, t, 320, kb - t + 30); g.restore();
    g.strokeStyle = 'rgba(42,28,22,.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-2, kb - 70); g.lineTo(-2, kb - 16); g.stroke();
    return;
  }
  if (o.pose === 'kneel') { for (const sd of [-1, 1]) { if (bt === 'skirt' || isDress) tube(g, sd * 40, F.hipY + 12, sd * 54, -10, 52, 50, sock); else tube(g, sd * 46, F.hipY + 12, sd * 56, -8, 88, 84, bf); }
    if (bt === 'skirt' && !isDress) { const P = new Path2D(); P.moveTo(-118, F.hipY - 10); P.lineTo(118, F.hipY - 10); P.lineTo(140, -6); P.quadraticCurveTo(0, 8, -140, -6); P.closePath(); shape(g, P, fabric(g, b), [-140, F.hipY, 140, 0]); } return; }
  for (const sd of [-1, 1]) {
    const ph = (o.step || 0) * Math.PI * 2 + (sd > 0 ? 0 : Math.PI), walk = o.pose === 'walk';
    const sw = walk ? Math.sin(ph) * 34 : 0, lift = walk ? Math.max(0, -Math.cos(ph)) * 16 : 0;
    const hx = sd * 46, hy = F.hipY + 12, fx = sd * (o.wide ? 70 : 52) + sw, fy = -lift;
    shoe(g, fx, fy, sd, O.shoes);
    const ax = fx - sd * 2, ay = fy - 30;
    if (bt === 'trousers' || bt === 'pajama') tube(g, hx, hy, ax, ay, 86, 74, bf);
    else if (bt === 'knickers') { tube(g, lerp(hx, ax, 0.55), lerp(hy, ay, 0.55), ax, ay, 58, 56, pattern(g, 'knit', sock, null, 0.5)); tube(g, hx, hy, lerp(hx, ax, 0.62), lerp(hy, ay, 0.62), 90, 96, bf); }
    else if (bt === 'shorts') { tube(g, hx, hy, ax, ay, 40, 36, WHITE); tube(g, ax, ay - 30, ax, ay, 40, 38, sock); tube(g, hx, hy, lerp(hx, ax, 0.38), lerp(hy, ay, 0.38), 92, 86, bf); }
    else tube(g, hx * 0.8, hy, ax, ay, 48, 44, sock); // skirt / dress: stockings
  }
  if (bt === 'skirt' && !isDress) { const P = new Path2D(); const y0 = F.hipY - 10, y1 = F.hipY + 120; P.moveTo(-118, y0); P.lineTo(118, y0); P.lineTo(150, y1); P.quadraticCurveTo(0, y1 + 16, -150, y1); P.closePath(); shape(g, P, fabric(g, b), [-150, y0, 150, y1]); }
}
function torso(g, o, F, O) {
  const T = O.top, tt = T.type || 'sweater', n = F.neckY, h = F.hipY, sit = o.pose === 'sit';
  const long = tt === 'coat' ? (sit ? 40 : 120) : tt === 'suit' ? (sit ? 10 : 44) : tt === 'dress' ? (sit ? 60 : 96) : 0, fl = tt === 'dress' ? 46 : tt === 'coat' ? 12 : tt === 'suit' ? 6 : 0;
  const P = new Path2D(); P.moveTo(-58, n); P.bezierCurveTo(-100, n + 6, -120, n + 30, -124, n + 70); P.bezierCurveTo(-130, n + 130, -126 - fl * 0.4, h - 40, -120 - fl, h + long);
  P.quadraticCurveTo(0, h + long + 18, 120 + fl, h + long); P.bezierCurveTo(126 + fl * 0.4, h - 40, 130, n + 130, 124, n + 70); P.bezierCurveTo(120, n + 30, 100, n + 6, 58, n); P.closePath();
  if (tt === 'hoodie') { const HP = new Path2D(); HP.ellipse(0, n + 4, 96, 40, 0, 0, 7); shape(g, HP, shade(T.color, 0.82), [-96, n - 36, 96, n + 44]); }
  shape(g, P, fabric(g, T), [-130, n, 130, h + long], { ink: 5, shade: 0.4, hi: 0.12 });
  const rib = (P2) => { g.fillStyle = pattern(g, 'rib', T.color); g.fill(P2); inkP(g, P2, 3); };
  const hem = () => { const HP = new Path2D(); HP.moveTo(-122, h - 22); HP.quadraticCurveTo(0, h - 2, 122, h - 22); HP.lineTo(122, h); HP.quadraticCurveTo(0, h + 20, -122, h); HP.closePath(); rib(HP); };
  const buttons = (x, ys, c = '#3a2418') => { for (const y of ys) { g.fillStyle = c; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); g.strokeStyle = rgba('#000000', .4); g.lineWidth = 1.5; g.stroke(); } };
  if (tt === 'cardigan') {
    const SW = new Path2D(); SW.moveTo(-44, n + 4); SW.lineTo(44, n + 4); SW.lineTo(20, h + 4); SW.lineTo(-18, h + 4); SW.closePath(); shape(g, SW, pattern(g, 'rib', T.color2 || '#dcbf8f'), [-44, n, 44, h], { ink: 3 });
    g.strokeStyle = INK; g.lineWidth = 2.5; g.beginPath(); g.moveTo(20, n + 80); g.lineTo(20, h); g.stroke(); buttons(27, [n + 106, n + 150, n + 194]);
    for (const x of [-112, 48]) { const PK = new Path2D(); PK.roundRect(x, h - 66, 62, 48, 8); g.fillStyle = 'rgba(40,20,10,.18)'; g.fill(PK); inkP(g, PK, 2.5); } hem();
  } else if (tt === 'sweater') { hem(); const C = new Path2D(); C.ellipse(0, n + 2, 62, 18, 0, 0, Math.PI); C.lineTo(-62, n - 6); C.ellipse(0, n - 6, 62, 14, 0, Math.PI, 0, true); rib(C); }
  else if (tt === 'shirt' || tt === 'pajama') {
    g.strokeStyle = rgba(INK, .6); g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, n + 20); g.lineTo(0, h); g.stroke(); buttons(8, [n + 70, n + 120, n + 170], tt === 'pajama' ? (T.color2 || WHITE) : '#d8d4cc');
    const col = tt === 'pajama' ? (T.color2 || WHITE) : (T.color2 || WHITE);
    for (const sd of [-1, 1]) { poly(g, [[sd * 6, n + 4], [sd * 64, n - 4], [sd * 42, n + 46]]); fillInk(g, col, 3); }
    if (O.tie) { poly(g, [[-10, n + 8], [10, n + 8], [16, n + 140], [0, n + 162], [-16, n + 140]]); fillInk(g, O.tie, 3); poly(g, [[-12, n + 4], [12, n + 4], [8, n + 22], [-8, n + 22]]); fillInk(g, shade(O.tie, .85), 3); }
    if (tt === 'pajama') { const PK = new Path2D(); PK.roundRect(-96, n + 70, 50, 44, 6); g.fillStyle = rgba(T.color2 || WHITE, .25); g.fill(PK); inkP(g, PK, 2.5); }
  } else if (tt === 'coat') {
    for (const sd of [-1, 1]) { poly(g, [[sd * 10, n + 4], [sd * 62, n - 2], [sd * 74, n + 70], [sd * 18, n + 130]]); fillInk(g, shade(T.color, 0.82), 3); }
    buttons(-30, [n + 160, n + 214, h + 20], shade(T.color, .5)); buttons(30, [n + 160, n + 214, h + 20], shade(T.color, .5));
    g.fillStyle = T.color2 || shade(T.color, .7); g.fillRect(-124, h - 40, 248, 22); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(-124, h - 40, 248, 22);
  } else if (tt === 'suit') {
    poly(g, [[-44, n + 2], [44, n + 2], [0, n + 136]]); fillInk(g, T.color2 || WHITE, 3);
    if (O.waistcoat) { poly(g, [[-30, n + 70], [30, n + 70], [24, n + 150], [-24, n + 150]]); fillInk(g, O.waistcoat, 2.5); }
    if (O.tie) { poly(g, [[-9, n + 8], [9, n + 8], [14, n + 120], [0, n + 138], [-14, n + 120]]); fillInk(g, O.tie, 3); poly(g, [[-11, n + 4], [11, n + 4], [7, n + 20], [-7, n + 20]]); fillInk(g, shade(O.tie, .85), 3); }
    for (const sd of [-1, 1]) { poly(g, [[sd * 8, n + 2], [sd * 62, n - 4], [sd * 72, n + 56], [sd * 54, n + 66], [sd * 62, n + 82], [sd * 6, n + 152]]); fillInk(g, shade(T.color, 0.8), 3); }
    buttons(-8, [n + 176, n + 214], shade(T.color, .45));
    g.strokeStyle = rgba(INK, .55); g.lineWidth = 2.5; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 70, h - 60); g.lineTo(sd * 112, h - 62); g.stroke(); }
    if (O.pocketSquare) { poly(g, [[-96, n + 96], [-66, n + 94], [-72, n + 110], [-90, n + 112]]); fillInk(g, O.pocketSquare, 2); }
  } else if (tt === 'dress') {
    const C = new Path2D(); for (const sd of [-1, 1]) { C.moveTo(0, n + 4); C.quadraticCurveTo(sd * 30, n + 44, sd * 66, n + 14); C.quadraticCurveTo(sd * 60, n - 4, 0, n - 2); }
    g.fillStyle = T.color2 || WHITE; g.fill(C); inkP(g, C, 3); buttons(0, [n + 70, n + 110, n + 150], '#cfc8bc');
  } else if (tt === 'hoodie') {
    const PK = new Path2D(); PK.moveTo(-70, h - 90); PK.lineTo(70, h - 90); PK.lineTo(90, h - 18); PK.lineTo(-90, h - 18); PK.closePath(); g.fillStyle = rgba('#000000', .1); g.fill(PK); inkP(g, PK, 3);
    g.strokeStyle = '#f2ead8'; g.lineWidth = 4; g.beginPath(); g.moveTo(-18, n + 20); g.lineTo(-22, n + 100); g.moveTo(18, n + 20); g.lineTo(22, n + 96); g.stroke(); hem();
  } else if (tt === 'tshirt') { const C = new Path2D(); C.ellipse(0, n + 4, 56, 16, 0, 0, Math.PI); C.lineTo(-56, n - 4); C.ellipse(0, n - 4, 56, 12, 0, Math.PI, 0, true); rib(C); }
  else if (tt === 'vest') { const SW = new Path2D(); SW.moveTo(-40, n + 4); SW.lineTo(40, n + 4); SW.lineTo(0, n + 120); SW.closePath(); shape(g, SW, T.color2 || WHITE, [-40, n, 40, n + 120], { ink: 3 }); buttons(0, [n + 150, n + 190], shade(T.color, .5)); }
  if (O.belt && tt !== 'dress' && tt !== 'coat') { g.fillStyle = O.belt; g.fillRect(-122, h - 18, 244, 18); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(-122, h - 18, 244, 18); g.fillStyle = '#d9a93a'; g.fillRect(-12, h - 20, 24, 22); g.strokeRect(-12, h - 20, 24, 22); }
  if (O.apron) { const A = new Path2D(); A.roundRect(-84, n + 70, 168, h - n - 10 + (o.pose === 'sit' ? 20 : 90), 18); shape(g, A, O.apron, [-84, n + 70, 84, h + 90], { ink: 3.5, shade: 0.2 });
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(-60, n + 70); g.lineTo(-40, n); g.moveTo(60, n + 70); g.lineTo(40, n); g.stroke(); }
  if (O.scarf) {
    const sc = pattern(g, 'knit', O.scarf, null, 0.52), ST = new Path2D(); ST.moveTo(-58, n + 26); ST.bezierCurveTo(-68, n + 86, -76, n + 140, -78, n + 196); ST.lineTo(-30, n + 200); ST.bezierCurveTo(-30, n + 150, -26, n + 90, -14, n + 34); ST.closePath();
    shape(g, ST, sc, [-78, n + 26, -14, n + 200], { ink: 4, shade: 0.3 });
    g.strokeStyle = O.scarf; g.lineWidth = 3.5; g.beginPath(); for (let x = -74; x < -32; x += 7) { g.moveTo(x, n + 198); g.lineTo(x - 1, n + 220); } g.stroke();
    const SB = new Path2D(); SB.moveTo(-74, n - 12); SB.quadraticCurveTo(0, n + 8, 76, n - 12); SB.lineTo(80, n + 28); SB.quadraticCurveTo(0, n + 52, -78, n + 28); SB.closePath();
    shape(g, SB, sc, [-78, n - 12, 80, n + 52], { ink: 4, shade: 0.3 });
  }
  if (O.watch && (tt === 'vest' || tt === 'suit')) { g.strokeStyle = '#e8c050'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(-6, h - 70); g.quadraticCurveTo(-40, h - 40, -72, h - 66); g.stroke(); ell(g, -74, h - 64, 7, 7, '#e8c050', 2); }
  if (O.shawl) { const sh = pattern(g, 'knit', O.shawl, null, 0.5), P = new Path2D(); P.moveTo(-132, n + 40); P.quadraticCurveTo(-120, n - 6, -40, n - 6); P.quadraticCurveTo(0, n + 14, 40, n - 6); P.quadraticCurveTo(120, n - 6, 132, n + 40);
    P.quadraticCurveTo(132, n + 120, 86, n + 150); P.quadraticCurveTo(40, n + 170, 0, n + 210); P.quadraticCurveTo(-40, n + 170, -86, n + 150); P.quadraticCurveTo(-132, n + 120, -132, n + 40); P.closePath();
    shape(g, P, sh, [-132, n - 6, 132, n + 210], { ink: 4, shade: 0.3 });
    g.strokeStyle = shade(O.shawl, 0.8); g.lineWidth = 3; g.beginPath(); for (let k = 0; k <= 12; k++) { const u = k / 12, x = lerp(-86, 0, u), y = lerp(n + 150, n + 210, u); g.moveTo(x, y); g.lineTo(x - 2, y + 18); g.moveTo(-x, y); g.lineTo(-x + 2, y + 18); } g.stroke(); }
}
// ---------------------------------------------------------------- head, eyes, hair, hats
function eyesDraw(g, cx, cy, o) {
  const st = o.eyes || 'open', lx = (o.look ? o.look[0] : 0), ly = (o.look ? o.look[1] : 0), tn = o.turn || 0, bl = clamp(o.blink || 0);
  const pos = o.side ? [[94, 1, 0.55], [50, -1, 1]] : [[-40 + tn * 28, -1, 1], [36 + tn * 28, 1, 1]];
  for (const [ex, side, ek] of pos) {
    const x = cx + ex + lx * 14 * (o.side ? 0.5 : 1), y = cy + 14 + ly * 12;
    g.save(); g.translate(x, y); g.scale(ek, 1); g.translate(-x, -y);
    if (o.bags) { g.strokeStyle = `rgba(96,76,120,${0.75 * clamp(o.bags)})`; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.ellipse(x - lx * 6, y + 16, 15, 9, 0, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
      if (o.bags > 0.55) { g.strokeStyle = `rgba(96,76,120,${0.6 * (o.bags - 0.55) / 0.45})`; g.lineWidth = 3; g.beginPath(); g.ellipse(x - lx * 6, y + 24, 13, 8, 0, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke(); } }
    g.fillStyle = EYE; g.strokeStyle = EYE; g.lineCap = 'round';
    if (st === 'happy') { g.lineWidth = 5.5; g.beginPath(); g.ellipse(x, y + 6, 13, 10, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.restore(); continue; }
    if (st === 'closed') { g.lineWidth = 5; g.beginPath(); g.ellipse(x, y - 2, 13, 8, 0, Math.PI * 0.12, Math.PI * 0.88); g.stroke(); g.restore(); continue; }
    if (st === 'dizzy') { g.lineWidth = 3.5; g.beginPath(); for (let a = 0; a < 12; a += 0.3) { const r = a * 1.25, px = x + Math.cos(a + (o.t || 0) * 6) * r, py = y + Math.sin(a + (o.t || 0) * 6) * r; a ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); g.restore(); continue; }
    if (st === 'x') { g.lineWidth = 5; g.beginPath(); g.moveTo(x - 10, y - 10); g.lineTo(x + 10, y + 10); g.moveTo(x + 10, y - 10); g.lineTo(x - 10, y + 10); g.stroke(); g.restore(); continue; }
    const big = st === 'wide', rx = big ? 13 : 10.5, ry = (big ? 23 : 19) * (1 - bl * 0.88);
    const lid = st === 'tired' ? 0.45 : st === 'sleepy' ? 0.7 : 0;
    g.save(); if (lid) { g.beginPath(); g.rect(x - 30, y - ry + ry * 2 * lid, 60, 60); g.clip(); }
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill();
    if (bl < 0.5 && !lid) { g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(x - 3, y - ry * 0.45, big ? 4.5 : 3, big ? 7 : 5, 0, 0, 7); g.fill(); }
    g.restore();
    if (lid && bl < 0.9) { g.lineWidth = 4.5; g.beginPath(); const ly2 = y - ry + ry * 2 * lid; g.moveTo(x - 15, ly2 - side * 2); g.lineTo(x + 15, ly2 + side * 2); g.stroke(); }
    // inner brow ends rise for sad/worried and drop for angry (side = -1 left eye, +1 right eye)
    if (st === 'sad' || st === 'worried') { g.lineWidth = 4.5; g.beginPath(); g.moveTo(x - 14, y - 34 - side * 6); g.lineTo(x + 14, y - 34 + side * 6); g.stroke(); }
    if (st === 'angry') { g.lineWidth = 5; g.beginPath(); g.moveTo(x - 14, y - 36 + side * 6); g.lineTo(x + 14, y - 36 - side * 6); g.stroke(); }
    g.restore();
  }
  if (o.blush) { for (const ex of [-62, 58]) { g.fillStyle = `rgba(240,120,120,${0.35 * o.blush})`; g.beginPath(); g.ellipse(cx + ex + tn * 28, cy + 50, 16, 9, 0, 0, 7); g.fill(); } }
  if (o.outfitGlasses) { g.strokeStyle = INK; g.lineWidth = 4; for (const [ex] of pos) { g.beginPath(); g.arc(cx + ex, cy + 14, 26, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(cx - 14 + tn * 28, cy + 10); g.quadraticCurveTo(cx - 2 + tn * 28, cy + 4, cx + 10 + tn * 28, cy + 10); g.stroke(); }
}
function hairBack(g, cx, cy, O) {
  const hr = O.hair || {}, c = hr.color || '#4a3020';
  if (hr.type === 'long') { const P = new Path2D(); P.moveTo(cx - 126, cy - 40); P.bezierCurveTo(cx - 150, cy + 60, cx - 150, cy + 170, cx - 112, cy + 220); P.lineTo(cx + 112, cy + 220); P.bezierCurveTo(cx + 150, cy + 170, cx + 150, cy + 60, cx + 126, cy - 40); P.closePath(); shape(g, P, c, [cx - 150, cy - 40, cx + 150, cy + 220]); }
  if (O.hat && O.hat.type === 'headscarf') { const hc = O.hat; const P = new Path2D(); P.ellipse(cx, cy - 6, 146, 150, 0, 0, 7); P.moveTo(cx - 120, cy + 70); P.lineTo(cx - 150, cy + 200); P.lineTo(cx + 150, cy + 200); P.lineTo(cx + 120, cy + 70);
    shape(g, P, pattern(g, 'floral', hc.color || '#f2ead8', hc.color2 || '#c84a3a', 0.9), [cx - 150, cy - 150, cx + 150, cy + 200]); }
}
function hairFront(g, cx, cy, O) {
  const hr = O.hair || {}, c = hr.color || '#4a3020', t = hr.type || 'none';
  if (t === 'none') return;
  const cap = (fringeY, wav = 10) => { const P = new Path2D(); P.moveTo(cx - 124, cy - 10);
    for (let i = 0; i <= 30; i++) { const a = Math.PI * (1.02 + 0.96 * i / 30); P.lineTo(cx + Math.cos(a) * 126, cy - 4 + Math.sin(a) * 134); }
    for (let i = 0; i <= 10; i++) { const u = i / 10, x = cx + 124 - u * 248; P.lineTo(x, cy + fringeY + (i % 2 ? wav : 0) - Math.sin(u * Math.PI) * 26); }
    P.closePath(); shape(g, P, c, [cx - 126, cy - 140, cx + 126, cy + fringeY], { ink: 4.5, shade: 0.3 });
    g.strokeStyle = rgba(mixc(c, '#ffffff', 0.35), 0.7); g.lineWidth = 2.5; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(cx - 30 + k * 30, cy - 70, 50, 40, 0, Math.PI * 1.25, Math.PI * 1.6); g.stroke(); } };
  if (t === 'short' || t === 'messy' || t === 'curly') cap(-56, t === 'curly' ? 14 : 8);
  if (t === 'messy') { g.strokeStyle = INK; g.lineWidth = 4; g.fillStyle = c; for (const [a, l] of [[-2.5, 20], [-2.15, 26], [-1.8, 22], [-1.45, 28], [-1.1, 20], [-0.8, 18]]) { const x0 = cx + Math.cos(a) * 118, y0 = cy + Math.sin(a) * 126; poly(g, [[x0 - 10, y0 + 8], [x0 + Math.cos(a + 0.25) * l, y0 + Math.sin(a + 0.25) * l], [x0 + 10, y0 + 8]]); fillInk(g, c, 3.5); } }
  if (t === 'curly') for (let i = 0; i < 9; i++) { const a = Math.PI * (1.08 + i * 0.1); ell(g, cx + Math.cos(a) * 118, cy - 4 + Math.sin(a) * 124, 22, 20, c, 3.5); }
  if (t === 'long') cap(-50, 6);
  if (t === 'bun') { cap(-50, 6); ell(g, cx, cy - 150, 40, 32, c, 4); }
  if (t === 'braid') { // full cap with a centre part; the braid itself hangs over the shoulder (braidTail)
    cap(-46, 4); g.strokeStyle = rgba(shade(c, 0.55), 0.9); g.lineWidth = 3; g.beginPath(); g.moveTo(cx + 2, cy - 132); g.quadraticCurveTo(cx - 2, cy - 100, cx + 4, cy - 70); g.stroke();
  }
}
function braidTail(g, cx, cy, O) { const c = O.hair.color || '#4a3020'; for (let i = 0; i < 7; i++) ell(g, cx - 104 + Math.sin(i * 0.9) * 4 - i * 2, cy + 40 + i * 30, 20 - i * 0.8, 20, c, 3.5, 0.3); g.fillStyle = '#c63c2a'; g.fillRect(cx - 128, cy + 236, 22, 10); }
function hatDraw(g, cx, cy, O, o) {
  const h = O.hat || {}, c = h.color || '#5d4837', ty = h.type || 'none';
  if (ty === 'none' || ty === 'headscarf') { if (ty === 'headscarf') { const P = new Path2D(); P.moveTo(cx - 132, cy - 34); P.bezierCurveTo(cx - 132, cy - 170, cx + 132, cy - 170, cx + 132, cy - 34); P.quadraticCurveTo(cx, cy - 76, cx - 132, cy - 34); P.closePath(); shape(g, P, pattern(g, 'floral', c, h.color2 || '#c84a3a', 0.9), [cx - 132, cy - 160, cx + 132, cy - 30]); } return; }
  if (ty === 'flatcap') {
    const P = new Path2D(); P.moveTo(cx - 130, cy - 45); P.bezierCurveTo(cx - 137, cy - 130, cx - 52, cy - 178, cx + 26, cy - 164); P.bezierCurveTo(cx + 111, cy - 152, cx + 149, cy - 97, cx + 140, cy - 52); P.quadraticCurveTo(cx, cy - 21, cx - 130, cy - 45); P.closePath();
    shape(g, P, pattern(g, 'tweed', c), [cx - 130, cy - 175, cx + 148, cy - 35], { ink: 5, shade: 0.38, hi: 0.16 });
    g.strokeStyle = 'rgba(30,20,15,.55)'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(cx + 4, cy - 165); g.quadraticCurveTo(cx - 60, cy - 112, cx - 104, cy - 52); g.moveTo(cx + 4, cy - 165); g.quadraticCurveTo(cx + 70, cy - 120, cx + 104, cy - 48); g.stroke();
    const B = new Path2D(); B.moveTo(cx - 60, cy - 38); B.quadraticCurveTo(cx + 60, cy - 5, cx + 154, cy - 48); B.quadraticCurveTo(cx + 78, cy - 45, cx - 60, cy - 38); B.closePath(); shape(g, B, shade(c, 0.7), [cx - 60, cy - 52, cx + 154, cy - 8], { ink: 4.5 });
    ell(g, cx + 5, cy - 163, 8, 8, shade(c, 0.85), 3);
  } else if (ty === 'beanie') {
    const P = new Path2D(); P.moveTo(cx - 128, cy - 40); P.bezierCurveTo(cx - 132, cy - 190, cx + 132, cy - 190, cx + 128, cy - 40); P.closePath(); shape(g, P, pattern(g, 'knit', c, null, 0.55), [cx - 130, cy - 170, cx + 130, cy - 40]);
    const R = new Path2D(); R.moveTo(cx - 134, cy - 70); R.quadraticCurveTo(cx, cy - 92, cx + 134, cy - 70); R.lineTo(cx + 132, cy - 30); R.quadraticCurveTo(cx, cy - 50, cx - 132, cy - 30); R.closePath(); g.fillStyle = pattern(g, 'rib', h.color2 || shade(c, .85)); g.fill(R); inkP(g, R, 4);
    ell(g, cx, cy - 172, 26, 24, h.color2 || '#f2ead8', 4);
  } else if (ty === 'sleepcap') {
    const sw = Math.sin((o.t || 0) * 1.5) * 8; const P = new Path2D(); P.moveTo(cx - 128, cy - 44); P.bezierCurveTo(cx - 120, cy - 170, cx + 20, cy - 200, cx + 150 + sw, cy - 120); P.quadraticCurveTo(cx + 170 + sw, cy - 60, cx + 196 + sw, cy - 20); P.lineTo(cx + 176 + sw, cy - 12); P.quadraticCurveTo(cx + 140, cy - 60, cx + 128, cy - 44); P.closePath();
    shape(g, P, pattern(g, 'hstripes', c, h.color2 || WHITE, 0.9), [cx - 128, cy - 200, cx + 196, cy - 10]);
    const R = new Path2D(); R.moveTo(cx - 134, cy - 66); R.quadraticCurveTo(cx, cy - 86, cx + 134, cy - 66); R.lineTo(cx + 132, cy - 34); R.quadraticCurveTo(cx, cy - 54, cx - 132, cy - 34); R.closePath(); g.fillStyle = h.color2 || WHITE; g.fill(R); inkP(g, R, 4);
    ell(g, cx + 190 + sw, cy - 10, 20, 20, h.color2 || WHITE, 4);
  } else if (ty === 'hardhat') {
    const P = new Path2D(); P.moveTo(cx - 118, cy - 52); P.bezierCurveTo(cx - 120, cy - 190, cx + 120, cy - 190, cx + 118, cy - 52); P.closePath(); shape(g, P, c, [cx - 120, cy - 170, cx + 120, cy - 52], { hi: 0.3 });
    ell(g, cx, cy - 52, 156, 16, shade(c, 0.9), 4.5); g.strokeStyle = shade(c, 0.75); g.lineWidth = 12; g.beginPath(); g.moveTo(cx, cy - 166); g.lineTo(cx, cy - 64); g.stroke();
  } else if (ty === 'cap') {
    const P = new Path2D(); P.moveTo(cx - 126, cy - 48); P.bezierCurveTo(cx - 128, cy - 180, cx + 128, cy - 180, cx + 126, cy - 48); P.closePath(); shape(g, P, c, [cx - 126, cy - 170, cx + 126, cy - 48]);
    const B = new Path2D(); B.moveTo(cx - 20, cy - 52); B.quadraticCurveTo(cx + 120, cy - 30, cx + 200, cy - 56); B.quadraticCurveTo(cx + 120, cy - 66, cx - 20, cy - 52); B.closePath(); shape(g, B, shade(c, .8), [cx - 20, cy - 66, cx + 200, cy - 30]); ell(g, cx, cy - 162, 9, 6, shade(c, .8), 3);
  } else if (ty === 'fedora') {
    ell(g, cx, cy - 66, 190, 26, shade(c, 0.9), 4.5); const P = new Path2D(); P.moveTo(cx - 100, cy - 68); P.lineTo(cx - 92, cy - 170); P.quadraticCurveTo(cx, cy - 140, cx + 92, cy - 170); P.lineTo(cx + 100, cy - 68); P.closePath(); shape(g, P, c, [cx - 100, cy - 170, cx + 100, cy - 68]);
    g.fillStyle = h.color2 || shade(c, .5); g.fillRect(cx - 98, cy - 100, 196, 22); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(cx - 98, cy - 100, 196, 22);
  } else if (ty === 'bowler' || ty === 'tophat') {
    const top = ty === 'tophat';
    ell(g, cx, cy - 92, top ? 150 : 146, 20, shade(c, 0.85), 4.5);
    const P = new Path2D(); if (top) { P.moveTo(cx - 92, cy - 96); P.lineTo(cx - 100, cy - 300); P.quadraticCurveTo(cx, cy - 316, cx + 100, cy - 300); P.lineTo(cx + 92, cy - 96); P.quadraticCurveTo(cx, cy - 84, cx - 92, cy - 96); }
    else { P.moveTo(cx - 102, cy - 96); P.bezierCurveTo(cx - 108, cy - 214, cx + 108, cy - 214, cx + 102, cy - 96); P.quadraticCurveTo(cx, cy - 84, cx - 102, cy - 96); }
    P.closePath(); shape(g, P, c, [cx - 104, cy - (top ? 310 : 200), cx + 104, cy - 90], { ink: 5, shade: 0.4, hi: 0.22 });
    g.save(); g.clip(P); g.fillStyle = h.color2 || shade(c, 0.55); g.fillRect(cx - 120, cy - 128, 240, 24); g.restore();
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx - 60, cy - (top ? 280 : 170)); g.quadraticCurveTo(cx - 76, cy - 150, cx - 70, cy - 112); g.stroke();
  } else if (ty === 'guard' || ty === 'captain') {
    const side = (o.view || (o.pose === 'walk' ? 'side' : 'front')) === 'side', wtop = ty === 'captain' ? 136 : 112;
    const P = new Path2D(); P.moveTo(cx - 112, cy - 56); P.lineTo(cx - wtop, cy - 150); P.quadraticCurveTo(cx, cy - 172, cx + wtop, cy - 150); P.lineTo(cx + 112, cy - 56); P.quadraticCurveTo(cx, cy - 44, cx - 112, cy - 56); P.closePath();
    shape(g, P, c, [cx - wtop, cy - 170, cx + wtop, cy - 50], { ink: 5, shade: 0.4 });
    ell(g, cx, cy - 152, wtop, 18, mixc(c, '#ffffff', ty === 'captain' ? 0.08 : 0.05), 4);
    const B = new Path2D(); B.moveTo(cx - 114, cy - 90); B.quadraticCurveTo(cx, cy - 80, cx + 114, cy - 90); B.lineTo(cx + 112, cy - 58); B.quadraticCurveTo(cx, cy - 46, cx - 112, cy - 58); B.closePath(); g.fillStyle = h.color2 || '#2a2a30'; g.fill(B); inkP(g, B, 3.5);
    if (side) { poly(g, [[cx + 60, cy - 62], [cx + 170, cy - 46], [cx + 166, cy - 34], [cx + 56, cy - 48]]); fillInk(g, '#1e1a18', 3.5); }
    else { g.beginPath(); g.ellipse(cx, cy - 54, 104, 24, 0, 0, Math.PI); g.closePath(); fillInk(g, '#1e1a18', 3.5); }
    ell(g, side ? cx + 70 : cx, cy - 104, 13, 11, '#e0b040', 3);
  } else if (ty === 'pickelhaube') {
    const side = (o.view || (o.pose === 'walk' ? 'side' : 'front')) === 'side', P = new Path2D(); P.moveTo(cx - 116, cy - 60); P.bezierCurveTo(cx - 120, cy - 190, cx + 120, cy - 190, cx + 116, cy - 60); P.quadraticCurveTo(cx, cy - 46, cx - 116, cy - 60); P.closePath();
    shape(g, P, c, [cx - 120, cy - 180, cx + 120, cy - 50], { ink: 5, shade: 0.4, hi: 0.3 }); poly(g, [[cx - 12, cy - 168], [cx, cy - 236], [cx + 12, cy - 168]]); fillInk(g, '#d8b450', 3.5); ell(g, cx, cy - 166, 20, 8, '#d8b450', 3);
    if (side) { poly(g, [[cx + 60, cy - 66], [cx + 160, cy - 44], [cx + 150, cy - 34], [cx + 56, cy - 52]]); fillInk(g, '#1e1a18', 3.5); } else { g.beginPath(); g.ellipse(cx, cy - 56, 100, 20, 0, 0, Math.PI); g.closePath(); fillInk(g, '#1e1a18', 3.5); }
    poly(g, [[side ? cx + 40 : cx - 26, cy - 140], [side ? cx + 80 : cx + 26, cy - 140], [side ? cx + 76 : cx + 20, cy - 92], [side ? cx + 58 : cx, cy - 80], [side ? cx + 44 : cx - 20, cy - 92]]); fillInk(g, '#d8b450', 2.5);
  } else if (ty === 'souwester') {
    ell(g, cx, cy - 56, 164, 30, shade(c, 0.9), 4.5); const P = new Path2D(); P.moveTo(cx - 120, cy - 60); P.bezierCurveTo(cx - 126, cy - 200, cx + 126, cy - 200, cx + 120, cy - 60); P.quadraticCurveTo(cx, cy - 44, cx - 120, cy - 60); P.closePath();
    shape(g, P, c, [cx - 126, cy - 190, cx + 126, cy - 50], { ink: 5, shade: 0.35, hi: 0.25 }); g.strokeStyle = shade(c, 0.7); g.lineWidth = 3; for (const k of [-1, 0, 1]) { g.beginPath(); g.moveTo(cx + k * 50, cy - 168); g.quadraticCurveTo(cx + k * 70, cy - 120, cx + k * 76, cy - 64); g.stroke(); }
  } else if (ty === 'chef') {
    const P = new Path2D(); P.moveTo(cx - 100, cy - 60); P.lineTo(cx - 104, cy - 150); P.bezierCurveTo(cx - 170, cy - 200, cx - 90, cy - 290, cx - 20, cy - 240); P.bezierCurveTo(cx + 20, cy - 300, cx + 120, cy - 270, cx + 96, cy - 210); P.bezierCurveTo(cx + 170, cy - 200, cx + 140, cy - 140, cx + 104, cy - 150); P.lineTo(cx + 100, cy - 60); P.closePath();
    shape(g, P, c, [cx - 160, cy - 290, cx + 160, cy - 60], { shade: 0.2 }); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - 102, cy - 100); g.lineTo(cx + 102, cy - 100); g.stroke();
  }
}
function headDraw(g, o, F, O) {
  const cx = (o.turn || 0) * 6, cy = F.headY;
  g.save(); g.translate(0, F.neckY + 20); g.rotate(o.headTilt || 0); g.translate(0, -(F.neckY + 20));
  hairBack(g, cx, cy, O);
  const HP = new Path2D(); HP.ellipse(cx, cy, 120, 128, 0, 0, 7);
  g.fillStyle = '#e2ddd4'; g.fill(HP); g.save(); g.clip(HP); g.fillStyle = WHITE; g.beginPath(); g.ellipse(cx - 12 * LIGHT.dir, cy - 10, 113, 121, 0, 0, 7); g.fill();
  if (O.hat && O.hat.type !== 'none' || (O.hair && O.hair.type !== 'none')) { const cs = g.createLinearGradient(0, cy - 100, 0, cy - 30); cs.addColorStop(0, 'rgba(60,40,30,.22)'); cs.addColorStop(1, 'rgba(60,40,30,0)'); g.fillStyle = cs; g.fillRect(cx - 130, cy - 130, 260, 100); }
  g.restore(); inkP(g, HP, 5.5);
  if (O.beard) beardDraw(g, cx, cy, O.beard, false);
  eyesDraw(g, cx, cy, { ...o, outfitGlasses: O.glasses });
  hairFront(g, cx, cy, O); greyStrands(g, cx, cy, O, false); hatDraw(g, cx, cy, O, o);
  g.restore();
}
// ---------------------------------------------------------------- held items
const ITEMS = {
  tea(g, x, y, s = 1, o = {}) { const ang = o.tilt || 0; g.save(); g.translate(x, y); g.scale(s, s); g.rotate(ang);
    const P = new Path2D(); P.moveTo(-28, -54); P.bezierCurveTo(-26, -26, -13, -10, -15, 0); P.bezierCurveTo(-17, 12, -24, 21, -22, 31); P.quadraticCurveTo(-21, 40, -18, 42); P.lineTo(18, 42); P.quadraticCurveTo(21, 40, 22, 31); P.bezierCurveTo(24, 21, 17, 12, 15, 0); P.bezierCurveTo(13, -10, 26, -26, 28, -54); P.closePath();
    g.save(); g.clip(P); g.rotate(-ang); const lvl = -40 * Math.cos(ang) + 5 * Math.abs(Math.sin(ang)) + (o.empty || 0) * 60;
    const tg = g.createLinearGradient(0, lvl, 0, 50); tg.addColorStop(0, '#e8823a'); tg.addColorStop(0.5, '#b8441a'); tg.addColorStop(1, '#7e2410'); g.fillStyle = tg; g.fillRect(-100, lvl, 200, 200); g.fillStyle = 'rgba(255,200,120,.8)'; g.fillRect(-100, lvl, 200, 3.5); g.restore();
    g.fillStyle = 'rgba(235,242,255,.2)'; g.fill(P); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 3.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(-19, -45); g.quadraticCurveTo(-16, -21, -9, -9); g.moveTo(-15, 12); g.quadraticCurveTo(-19, 23, -16, 33); g.stroke();
    g.strokeStyle = '#e0b040'; g.lineWidth = 3; g.beginPath(); g.ellipse(0, -54, 28, 5, 0, 0, 7); g.stroke(); inkP(g, P, 3); g.restore(); },
  saucer(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); ell(g, 0, 0, 46, 12, o.color || '#c23a2e', 3); g.strokeStyle = '#f2ead8'; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, 36, 8, 0, 0, 7); g.stroke(); g.restore(); },
  mug(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.tilt || 0); g.beginPath(); g.arc(30, -4, 16, -1.4, 1.4); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(); g.lineWidth = 5; g.strokeStyle = o.color || '#e8e2d4'; g.stroke();
    const P = new Path2D(); P.roundRect(-28, -34, 58, 66, 9); shape(g, P, o.color || '#e8e2d4', [-28, -34, 30, 32], { ink: 3.5, shade: 0.3 }); if (o.band !== false) { g.fillStyle = o.band || '#3d6ea8'; g.fillRect(-28, -10, 58, 8); }
    ell(g, 1, -33, 28, 6, '#5a2e18', 3); g.restore(); },
  coffee(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.tilt || 0); poly(g, [[-24, -40], [24, -40], [18, 40], [-18, 40]]); fillInk(g, '#f2ead8', 3); poly(g, [[-23, -16], [23, -16], [21, 12], [-21, 12]]); fillInk(g, o.color || '#a8662e', 2.5);
    rrect(g, -28, -52, 56, 14, 6, '#ffffff', 3); g.restore(); },
  phone(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.tilt || 0); rrect(g, -22, -60, 44, 84, 8, '#26242a', 3.5); const gr = g.createLinearGradient(0, -54, 0, 18); gr.addColorStop(0, '#9fd0ff'); gr.addColorStop(1, '#4a7ad8'); g.fillStyle = gr; g.fillRect(-17, -54, 34, 72);
    if (o.time) text(g, o.time, 0, -32, { size: 15, color: '#ffffff', font: 'display', maxW: 30 });
    if (o.text) text(g, o.text, 0, -6, { size: 7, color: '#ffffff', weight: '600', maxW: 30 });
    if (o.lines) o.lines.forEach((l, i) => { const me = i % 2 === 1; g.fillStyle = me ? '#d8f2c8' : '#ffffff'; g.beginPath(); g.roundRect(me ? -6 : -15, -50 + i * 15, 21, 11, 4); g.fill(); text(g, l, me ? 4.5 : -4.5, -44.5 + i * 15, { size: 5, color: INK, weight: '600', maxW: 18 }); });
    if (o.glow !== false) { g.save(); g.globalCompositeOperation = 'screen'; const rg = g.createRadialGradient(0, -20, 0, 0, -20, 120); rg.addColorStop(0, 'rgba(140,190,255,.35)'); rg.addColorStop(1, 'rgba(140,190,255,0)'); g.fillStyle = rg; g.fillRect(-120, -140, 240, 240); g.restore(); } g.restore(); },
  book(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.tilt || 0); poly(g, [[-70, -40], [0, -30], [70, -40], [70, 30], [0, 38], [-70, 30]]); fillInk(g, o.color || '#8a2f3a', 3.5);
    poly(g, [[-64, -44], [0, -34], [64, -44], [64, 24], [0, 32], [-64, 24]]); fillInk(g, '#f6efe0', 3); g.strokeStyle = 'rgba(120,100,80,.6)'; g.lineWidth = 2; if (o.title || o.lines) { if (o.title) text(g, o.title, -34, -24, { size: 11, font: 'serif', maxW: 52, rot: 0.07 }); (o.lines || []).forEach((l, i) => text(g, l, 34, -24 + i * 13, { size: 8, font: 'serif', weight: 'normal', maxW: 52, rot: -0.07 })); }
    else for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-54, -24 + i * 12); g.lineTo(-10, -18 + i * 12); g.moveTo(10, -18 + i * 12); g.lineTo(54, -24 + i * 12); g.stroke(); } g.restore(); },
  clock(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); for (const sd of [-1, 1]) { ell(g, sd * 24, -34, 14, 10, '#d9a93a', 3, sd * 0.5); g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(sd * 20, 26); g.lineTo(sd * 28, 40); g.stroke(); }
    ell(g, 0, 0, 36, 36, o.color || '#d8443a', 3.5); ell(g, 0, 0, 27, 27, '#fbf6ea', 3); const tt = o.time ?? 0.12; g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 3.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(tt * Math.PI * 2) * 13, -Math.cos(tt * Math.PI * 2) * 13);
    g.moveTo(0, 0); g.lineTo(Math.sin(tt * 24 * Math.PI) * 20, -Math.cos(tt * 24 * Math.PI) * 20); g.stroke(); if (o.ring) { g.strokeStyle = INK; g.lineWidth = 3; for (const sd of [-1, 1]) { g.beginPath(); g.arc(0, 0, 50 + (o.ring % 1) * 10, sd > 0 ? -0.9 : Math.PI - 0.4, sd > 0 ? -0.4 : Math.PI + 0.9 - 0.5); g.stroke(); } } g.restore(); },
  pillow(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); const P = new Path2D(); P.roundRect(-90, -34, 180, 68, 30); shape(g, P, o.color || '#f2f0ea', [-90, -34, 90, 34], { shade: 0.25 }); g.restore(); },
  /** hanging oil lantern: the hand holds the ring at (x, y) */
  lantern(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.tilt || 0); g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.arc(0, 4, 16, Math.PI, 0); g.stroke();
    rrect(g, -30, 18, 60, 16, 6, '#3a3430', 3); const P = new Path2D(); P.moveTo(-26, 34); P.lineTo(26, 34); P.lineTo(30, 104); P.lineTo(-30, 104); P.closePath(); const on = o.on !== false;
    g.fillStyle = on ? '#ffd58a' : '#6a6458'; g.fill(P); if (on) { const gr = g.createRadialGradient(0, 72, 2, 0, 72, 34); gr.addColorStop(0, '#fffbe8'); gr.addColorStop(0.4, '#ffc860'); gr.addColorStop(1, 'rgba(255,170,60,.6)'); g.fillStyle = gr; g.fill(P);
      g.fillStyle = '#fff6d0'; g.beginPath(); g.moveTo(0, 54); g.quadraticCurveTo(9, 74, 0, 84); g.quadraticCurveTo(-9, 74, 0, 54); g.fill(); }
    inkP(g, P, 3.5); g.strokeStyle = '#3a3430'; g.lineWidth = 4; for (const sx of [-14, 14]) { g.beginPath(); g.moveTo(sx, 34); g.lineTo(sx * 1.1, 104); g.stroke(); }
    rrect(g, -34, 102, 68, 16, 5, '#3a3430', 3); g.restore(); },
  /** walking cane; the hand grips under the knob. o.len = length below the hand, o.knob = colour */
  cane(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.tilt || 0); const L = o.len || 300; g.strokeStyle = INK; g.lineWidth = 13; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -20); g.lineTo(0, L); g.stroke();
    g.strokeStyle = o.color || '#3a2418'; g.lineWidth = 7; g.stroke(); rrect(g, -5, L - 14, 10, 16, 3, '#c8c8c8', 2); ell(g, 0, -30, 15, 13, o.knob || '#d8dce4', 3.5); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(-5, -35, 4, 0, 7); g.fill(); g.restore(); },
  keys(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(0, 26, 22, 0, 7); g.stroke(); g.strokeStyle = '#b89a4a'; g.lineWidth = 3; g.stroke();
    for (const [a, l] of [[-0.5, 70], [0.05, 82], [0.5, 64]]) { g.save(); g.translate(Math.sin(a) * 20, 26 + Math.cos(a) * 20); g.rotate(-a + Math.sin((o.t || 0) * 4 + a * 3) * 0.08); rrect(g, -4, 0, 8, l, 3, '#a88a3a', 2.5); rrect(g, 0, l - 18, 16, 8, 2, '#a88a3a', 2); g.restore(); } g.restore(); },
  spoon(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.tilt ?? -0.5); rrect(g, -4, -70, 8, 96, 4, '#b8bcc4', 2.5); if (!o.handleOnly) ell(g, 0, -84, 13, 20, '#c8ccd4', 2.5); else { poly(g, [[-4, -70], [0, -86], [4, -70]]); fillInk(g, '#d8dce4', 2); } g.restore(); },
  /** sheet of paper with handwriting; o.text (German) or scribble lines */
  letter(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.tilt || 0); rrect(g, -46, -60, 92, 120, 4, o.color || '#f2e8d0', 3); g.strokeStyle = 'rgba(40,40,90,.6)'; g.lineWidth = 2;
    if (o.text) text(g, o.text, 0, -10, { size: 10, font: 'hand', color: '#23264a', maxW: 80, weight: 'normal' }); else for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-34, -40 + i * 14); for (let k = 0; k < 8; k++) g.lineTo(-34 + k * 9, -40 + i * 14 + Math.sin(k * 2.1 + i) * 2.5); g.stroke(); } g.restore(); },
  candle(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); ell(g, 0, 18, 30, 8, '#8a7a5a', 3); rrect(g, -11, -34, 22, 52, 4, '#efe6cc', 3); g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -34); g.lineTo(0, -42); g.stroke();
    const f = flicker(o.t || 0, 3); g.fillStyle = '#ffd56a'; g.beginPath(); g.moveTo(0, -66 - f * 6); g.quadraticCurveTo(9, -48, 0, -40); g.quadraticCurveTo(-9, -48, 0, -66 - f * 6); g.fill(); g.fillStyle = '#fff6d8'; g.beginPath(); g.ellipse(0, -48, 3, 6, 0, 0, 7); g.fill(); g.restore(); },
  knife(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.tilt ?? -0.6); rrect(g, -6, -10, 12, 40, 4, '#5a3a24', 2.5); poly(g, [[-6, -10], [6, -10], [4, -70], [-6, -54]]); fillInk(g, '#cdd2da', 2.5); g.restore(); },
  driftwood(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.tilt ?? 0.4); poly(g, [[-8, -110], [6, -112], [10, 60], [-10, 64]]); fillInk(g, '#9a8a72', 3); g.strokeStyle = 'rgba(60,50,40,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-2, -90); g.lineTo(0, 40); g.stroke(); g.restore(); },
  fish(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.tilt ?? 1.4); const P = new Path2D(); P.moveTo(-60, 0); P.quadraticCurveTo(-10, -22, 46, -4); P.lineTo(70, -18); P.lineTo(64, 2); P.lineTo(70, 20); P.lineTo(46, 4); P.quadraticCurveTo(-10, 22, -60, 0); P.closePath();
    shape(g, P, '#9fb2c4', [-60, -22, 70, 22], { ink: 3, hi: 0.4, shade: 0.3 }); g.fillStyle = '#5a7088'; g.beginPath(); g.ellipse(-4, -6, 40, 5, -0.05, 0, 7); g.fill(); ell(g, -44, -3, 3.5, 3.5, INK, 0); g.restore(); },
  magnifier(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.tilt ?? -0.4); rrect(g, -7, 0, 14, 70, 5, '#4a2e1c', 3); ell(g, 0, -46, 44, 44, 'rgba(220,235,250,.25)', 6); g.strokeStyle = '#c8a040'; g.lineWidth = 4; g.beginPath(); g.arc(0, -46, 44, 0, 7); g.stroke(); g.restore(); },
  needle(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.tilt ?? -0.8); rrect(g, -3, -60, 6, 70, 3, '#d0d4dc', 2); g.strokeStyle = '#d8c8a0'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -58); g.quadraticCurveTo(30, -20, 10 + Math.sin((o.t || 0) * 3) * 10, 40); g.stroke(); g.restore(); },
  plate(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); ell(g, 0, 0, 60, 16, '#f6f2ea', 3); g.strokeStyle = o.color || '#3d6ea8'; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, 48, 11, 0, 0, 7); g.stroke(); g.restore(); },
};
const HOLD_OFF = { tea: [0, -4], mug: [-8, -6], coffee: [0, -8], phone: [0, -30], book: [0, -36], clock: [0, -40], lantern: [0, 0], cane: [0, 0], keys: [0, 0], spoon: [0, 0], letter: [0, -40], candle: [0, -6], knife: [0, 0], driftwood: [0, 0], fish: [0, 0], magnifier: [0, 0], needle: [0, 0], hat: [0, 0] };
K.HOLD_OFF = HOLD_OFF;
K.ITEMS = ITEMS; K.item = (g, name, x, y, s, o) => ITEMS[name](g, x, y, s, o);
function armDraw(g, o, F, O, sd) {
  const S = F.sh[sd < 0 ? 0 : 1], spec = sd < 0 ? o.armL : o.armR, t = o.t || 0;
  let E, Hh;
  if (spec && typeof spec === 'object' && spec.H) { E = spec.E; Hh = spec.H; }
  else {
    let name = spec || 'hang', p = Array.isArray(spec) ? spec : ARMS[name];
    if (name === 'swing') { const ph = (o.step || 0) * Math.PI * 2 + (sd > 0 ? Math.PI : 0); p = [[26 + Math.sin(ph) * 10, 104], [30 + Math.sin(ph) * 26, 202 - Math.abs(Math.sin(ph)) * 8]]; }
    if (name === 'type') p = [[56, 124], [-8 + Math.sin(t * 22 + sd) * 6, 168 + Math.max(0, Math.sin(t * 18 + sd * 2)) * -8]];
    if (name === 'wave') { const w = Math.sin(t * 9) * 26; p = [[92, -18], [104 + w, -150]]; }
    if (!p) p = ARMS.hang;
    E = [S[0] + sd * p[0][0], S[1] + p[0][1]]; Hh = [S[0] + sd * p[1][0], S[1] + p[1][1]];
  }
  const hold = sd < 0 ? o.holdL : o.holdR, hs = hold ? (typeof hold === 'string' ? { item: hold } : hold) : null;
  const dx = Hh[0] - E[0], dy = Hh[1] - E[1], L = Math.hypot(dx, dy) || 1, wrist = [Hh[0] - dx / L * 26, Hh[1] - dy / L * 26];
  const T = O.top, sleeveF = T.sleeveColor ? pattern(g, T.sleevePattern || 'plain', T.sleeveColor) : fabric(g, T), cuffC = T.sleeveColor || T.color, short = T.sleeve === 'short';
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  if (short) { const mid = [lerp(S[0], E[0], 0.6), lerp(S[1], E[1], 0.6)];
    g.beginPath(); g.moveTo(mid[0], mid[1]); g.lineTo(E[0], E[1]); g.lineTo(wrist[0], wrist[1]); g.strokeStyle = INK; g.lineWidth = 44; g.stroke(); g.strokeStyle = WHITE; g.lineWidth = 35; g.stroke();
    g.beginPath(); g.moveTo(S[0], S[1]); g.lineTo(mid[0], mid[1]); g.strokeStyle = INK; g.lineWidth = 76; g.stroke(); g.strokeStyle = sleeveF; g.lineWidth = 67; g.stroke();
  } else { g.beginPath(); g.moveTo(S[0], S[1]); g.lineTo(E[0], E[1]); g.lineTo(wrist[0], wrist[1]); g.strokeStyle = INK; g.lineWidth = 76; g.stroke(); g.strokeStyle = sleeveF; g.lineWidth = 67; g.stroke();
    g.strokeStyle = 'rgba(30,20,50,.16)'; g.lineWidth = 26; g.save(); g.translate(12 * LIGHT.dir, 9); g.stroke(); g.restore();
    const CU = new Path2D(); CU.ellipse(wrist[0], wrist[1], 30, 22, Math.atan2(dy, dx) + Math.PI / 2, 0, 7); g.fillStyle = T.sleeveColor ? shade(cuffC, 0.92) : pattern(g, 'rib', T.color); g.fill(CU); inkP(g, CU, 3); }
  g.restore();
  const ang = Math.atan2(dy, dx) - Math.PI / 2;
  if (hs) { const s = hs.s || 1, it = hs.item;
    const off = HOLD_OFF[it] || [0, 0];
    ITEMS[it](g, Hh[0] + off[0], Hh[1] + off[1], s, hs); glove(g, Hh[0], Hh[1], (hs.tilt || 0) * 0.6, 'grip', -sd); }
  else glove(g, Hh[0], Hh[1], ang, spec === 'point' ? 'point' : 'open', sd);
  return { hand: Hh, elbow: E };
}
// ---------------------------------------------------------------- lying in bed
function lieDraw(g, o, O) {
  g.save(); g.rotate(o.headTilt ?? -0.12);
  hairBack(g, 0, 0, O); const HP = new Path2D(); HP.ellipse(0, 0, 120, 128, 0, 0, 7); g.fillStyle = '#e2ddd4'; g.fill(HP); g.save(); g.clip(HP); g.fillStyle = WHITE; g.beginPath(); g.ellipse(-10, -10, 113, 121, 0, 0, 7); g.fill(); g.restore(); inkP(g, HP, 5.5);
  if (O.beard) beardDraw(g, 0, 0, O.beard, false); eyesDraw(g, 0, 0, { ...o, outfitGlasses: O.glasses }); hairFront(g, 0, 0, O); greyStrands(g, 0, 0, O, false); hatDraw(g, 0, 0, O, o); g.restore();
  const bc = o.blanket || '#6f8fbf', P = new Path2D(); const r = o.breath || 0;
  P.moveTo(70, 150); P.bezierCurveTo(60, 60, 120, 40 - r, 220, 40 - r); P.bezierCurveTo(360, 38 - r, 470, 50, 560, 80); P.lineTo(600, 160); P.closePath();
  shape(g, P, pattern(g, o.blanketPattern || 'check', bc, shade(bc, 0.7)), [60, 40, 600, 160], { ink: 5, shade: 0.35 });
  if (o.handsOut) { glove(g, 160, 40 - r, Math.PI + 0.15, 'open', 1); glove(g, 238, 34 - r, Math.PI - 0.1, 'open', -1); }
  const SH = new Path2D(); SH.moveTo(68, 120); SH.bezierCurveTo(64, 74, 110, 56 - r, 200, 54 - r); SH.lineTo(204, 80 - r); SH.bezierCurveTo(130, 84, 96, 100, 92, 140); SH.closePath(); shape(g, SH, '#f6f2ea', [64, 54, 204, 140], { ink: 4, shade: 0.2 });
}
/** draw the character. Returns {hands:[left,right], head:[x,y], top:[x,y]} in world space for attaching fx */
function noah(g, opt) {
  const o = { x: 960, y: 900, s: 1, pose: 'stand', outfit: 'villager', eyes: 'open', armL: 'hang', armR: 'hang', shadow: true, step: 0, t: 0, ...opt };
  const O = outfitOf(o.outfit), fl = o.flip ? -1 : 1;
  g.save(); g.translate(o.x, o.y); g.scale(o.s * fl, o.s);
  if (o.pose === 'lie') { lieDraw(g, o, O); g.restore(); return { head: [o.x, o.y], top: [o.x, o.y - 140 * o.s], hands: [] }; }
  if (o.shadow) { const sg = g.createRadialGradient(0, 4, 10, 0, 4, 180); sg.addColorStop(0, 'rgba(25,12,8,.42)'); sg.addColorStop(1, 'rgba(25,12,8,0)'); g.fillStyle = sg; g.save(); g.scale(1, 0.16); g.beginPath(); g.arc(0, 24, 180, 0, 7); g.fill(); g.restore(); }
  const F = frameOf(o), view = o.view || (o.pose === 'walk' ? 'side' : 'front');
  if (view === 'side') {
    const lean = (o.hunch || 0) * 0.2 + (o.lean || 0), rotUp = () => { g.translate(0, F.hipY); g.rotate(lean); g.translate(0, -F.hipY); };
    g.save(); rotUp(); const hl = armSideDraw(g, o, F, O, true); g.restore(); legsSide(g, o, F, O); g.save(); rotUp(); torsoSide(g, o, F, O);
    if (O.hair && O.hair.type === 'braid') { g.save(); g.translate(0, F.neckY + 20); g.rotate(o.headTilt || 0); g.translate(0, -(F.neckY + 20)); braidTail(g, 30, F.headY, O); g.restore(); }
    headSideDraw(g, o, F, O); const hr = armSideDraw(g, o, F, O, false); g.restore(); g.restore();
    const rot = (p) => { const dx = p[0], dy = p[1] - F.hipY, c = Math.cos(lean), s2 = Math.sin(lean); return [dx * c - dy * s2, F.hipY + dx * s2 + dy * c]; };
    const w = (p) => { p = rot(p); return [o.x + p[0] * o.s * fl, o.y + p[1] * o.s]; };
    return { head: w([10, F.headY]), top: w([10, F.headY - 150]), hands: [w(hl.hand), w(hr.hand)], F };
  }
  legs(g, o, F, O); torso(g, o, F, O);
  if (O.hair && O.hair.type === 'braid') { g.save(); g.translate(0, F.neckY + 20); g.rotate(o.headTilt || 0); g.translate(0, -(F.neckY + 20)); braidTail(g, (o.turn || 0) * 6, F.headY, O); g.restore(); }
  // arms that stay behind the head (hands near the face are drawn after the head anyway)
  headDraw(g, o, F, O);
  const hl = armDraw(g, o, F, O, -1), hr = armDraw(g, o, F, O, 1);
  g.restore();
  const w = (p) => [o.x + p[0] * o.s * fl, o.y + p[1] * o.s];
  return { head: w([0, F.headY]), top: w([0, F.headY - 150]), hands: [w(hl.hand), w(hr.hand)], F };
}
K.noah = noah; K.glove = glove; K.ARMS = ARMS; K.SIDE_ARMS = SIDE_ARMS; K.shoe = shoe; K.shoeSide = shoeSide;

// ======================================================================= FX
function steam(g, x0, y0, t, { s = 1, a = 0.6, h = 180, seed = 0.3 } = {}) {
  if (a <= 0.01) return;
  for (let w = 0; w < 3; w++) for (let i = 0; i < 14; i++) {
    const p = (t * 0.32 + i / 14 + w * 0.31 + seed) % 1, ph = seed * 7 + w * 2.1;
    const x = x0 + (w - 1) * 10 * s + Math.sin(p * 6 + t * 1.6 + ph) * 16 * p * s, y = y0 - p * h * s, r = (6 + p * 22) * s, al = a * Math.sin(p * Math.PI) * 0.55;
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(255,255,255,${al})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
}
function zzz(g, x, y, t, { s = 1, n = 3 } = {}) {
  for (let i = 0; i < n; i++) { const p = (t * 0.35 + i / n) % 1, sz = (16 + p * 26) * s, px = x + Math.sin(p * 5 + i) * 20 * s + p * 50 * s, py = y - p * 160 * s, a = Math.sin(p * Math.PI);
    g.save(); g.globalAlpha = a; poly(g, [[px - sz / 2, py - sz / 2], [px + sz / 2, py - sz / 2], [px - sz / 2, py + sz / 2], [px + sz / 2, py + sz / 2]], false); g.lineJoin = 'round'; g.lineCap = 'round';
    g.strokeStyle = INK; g.lineWidth = sz * 0.34; g.stroke(); g.strokeStyle = '#f6f2ea'; g.lineWidth = sz * 0.2; g.stroke(); g.restore(); }
}
function sweat(g, x, y, s = 1, t = 0) { const dy = (t * 40) % 30; g.save(); g.translate(x, y + dy * s); g.scale(s, s); g.globalAlpha = 1 - dy / 30; g.beginPath(); g.moveTo(0, -22); g.bezierCurveTo(10, -6, 14, 4, 0, 12); g.bezierCurveTo(-14, 4, -10, -6, 0, -22); g.fillStyle = '#a8d4f2'; g.fill(); inkStroke(g, 3); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(-3, 0, 2.5, 5, 0, 0, 7); g.fill(); g.restore(); }
function star(g, x, y, r, rot, fill) { const pts = []; for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } poly(g, pts); fillInk(g, fill, Math.max(2, r * 0.15)); }
function dizzy(g, x, y, t, { r = 110, s = 1, n = 4 } = {}) { for (let i = 0; i < n; i++) { const a = t * 3 + i / n * Math.PI * 2, px = x + Math.cos(a) * r * s, py = y + Math.sin(a) * r * 0.25 * s, front = Math.sin(a) > 0; star(g, px, py, (front ? 18 : 13) * s, t * 4, front ? '#f6d24a' : '#d8b03a'); } }
function snow(g, rect, t, { n = 80, seed = 3, size = 1, wind = 0.3 } = {}) { const [x, y, w, h] = rect, r = rng(seed); g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  for (let i = 0; i < n; i++) { const sx = r(), sp = 0.6 + r() * 1.2, sz = (1.5 + r() * 3) * size, py = y + ((t * 60 * sp + r() * h) % h), px = x + ((sx * w + t * 30 * wind * sp + Math.sin(t * 1.5 + i) * 10) % w + w) % w;
    g.fillStyle = 'rgba(255,255,255,.92)'; g.beginPath(); g.arc(px, py, sz, 0, 7); g.fill(); } g.restore(); }
function rain(g, rect, t, { n = 120, seed = 4, a = 0.5 } = {}) { const [x, y, w, h] = rect, r = rng(seed); g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.strokeStyle = `rgba(200,220,255,${a})`; g.lineWidth = 2; g.beginPath();
  for (let i = 0; i < n; i++) { const sp = 0.8 + r() * 0.6, py = y + ((t * 900 * sp + r() * h) % h), px = x + r() * w - (py - y) * 0.15; g.moveTo(px, py); g.lineTo(px - 6, py + 34); } g.stroke(); g.restore(); }
function motes(g, rect, t, { n = 26, seed = 200, color = '255,244,210' } = {}) { const [x0, y0, w, h] = rect; g.save(); g.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) { const r = rng(seed + i), bx = x0 + r() * w, by = y0 + r() * h, x = bx + Math.sin(t * 0.6 + i) * 18 + t * 6, y = by - t * 10 + Math.cos(t * 0.8 + i * 2) * 10, rr = 2 + r() * 3, al = 0.5 + 0.5 * Math.sin(t * 2 + i);
    const mg = g.createRadialGradient(x, y, 0, x, y, rr * 3); mg.addColorStop(0, `rgba(${color},${0.8 * al})`); mg.addColorStop(1, `rgba(${color},0)`); g.fillStyle = mg; g.fillRect(x - rr * 3, y - rr * 3, rr * 6, rr * 6); } g.restore(); }
function beam(g, pts, { color = '255,236,196', a = 0.2, from = null, to = null } = {}) { g.save(); g.globalCompositeOperation = 'screen'; const f0 = from || pts[0], t0 = to || pts[Math.floor(pts.length / 2)];
  const gr = g.createLinearGradient(f0[0], f0[1], t0[0], t0[1]); gr.addColorStop(0, `rgba(${color},${a})`); gr.addColorStop(1, `rgba(${color},0)`); poly(g, pts); g.fillStyle = gr; g.fill(); g.restore(); }
function glow(g, x, y, r, color = '255,214,140', a = 0.6) { g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${color},${a})`); gr.addColorStop(1, `rgba(${color},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); }
const flicker = (t, seed = 0) => 0.75 + 0.25 * Math.sin(t * 21 + seed) * Math.sin(t * 7 + 1 + seed);
function burst(g, x, y, t, { r = 120, n = 10, color = '#f6d24a' } = {}) { if (t < 0 || t > 1) return; const k = eout(t); g.save(); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r0 = r * (0.4 + k * 0.6), r1 = r0 + r * 0.35 * (1 - k); g.strokeStyle = INK; g.lineWidth = 10 * (1 - k) + 2; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke();
    g.strokeStyle = color; g.lineWidth = 6 * (1 - k) + 1; g.stroke(); } g.restore(); }
/** thought bubble: draws a cloud and calls inner(g, cx, cy, w, h) clipped inside it */
function thought(g, x, y, w, h, inner, { from = null, a = 1 } = {}) {
  g.save(); g.globalAlpha *= a; const P = new Path2D(), n = 9;
  for (let i = 0; i < n; i++) { const an = i / n * Math.PI * 2, px = x + Math.cos(an) * w * 0.42, py = y + Math.sin(an) * h * 0.38; P.moveTo(px + w * 0.16, py); P.arc(px, py, w * 0.16, 0, 7); }
  P.moveTo(x + w * 0.45, y); P.ellipse(x, y, w * 0.45, h * 0.4, 0, 0, 7);
  g.fillStyle = '#fbfaf6'; g.fill(P); g.save(); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(P); g.restore(); g.fillStyle = '#fbfaf6'; g.fill(P);
  if (from) for (let i = 1; i <= 3; i++) { const u = i / 4; ell(g, lerp(from[0], x - w * 0.2, u), lerp(from[1], y + h * 0.4, u), 6 + i * 6, 6 + i * 6, '#fbfaf6', 4); }
  g.save(); g.clip(P); inner && inner(g, x, y, w, h); g.restore(); g.restore();
}
Object.assign(K, { steam, zzz, sweat, star, dizzy, snow, rain, motes, beam, glow, flicker, burst, thought });

// ======================================================================= SETS: rooms
function wall(g, { x0 = 0, x1 = W, y0 = 0, y1 = 720, color = '#e7c9a0', seed = 11, wainscot = null, trim = true } = {}) {
  let gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, shade(color, 0.95)); gr.addColorStop(1, mixc(color, '#ffffff', 0.12)); g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip(); paint(g, x0, y0, x1 - x0, y1 - y0, [shade(color, 0.85), mixc(color, '#ffffff', 0.35), shade(color, 0.9), color], Math.round((x1 - x0) * (y1 - y0) / 700), seed, 8, 70, 0.07); g.restore();
  if (wainscot) { const wy = wainscot.y, wc = wainscot.color || '#8b9874'; g.fillStyle = wc; g.fillRect(x0, wy, x1 - x0, y1 - wy); g.save(); g.beginPath(); g.rect(x0, wy, x1 - x0, y1 - wy); g.clip(); paint(g, x0, wy, x1 - x0, y1 - wy, [shade(wc, .88), mixc(wc, '#fff', .2)], Math.round((x1 - x0) * (y1 - wy) / 500), seed + 1, 6, 40, 0.09); g.restore();
    if (trim) { g.fillStyle = shade(wc, 0.8); g.fillRect(x0, wy - 8, x1 - x0, 14); g.beginPath(); g.moveTo(x0, wy - 8); g.lineTo(x1, wy - 8); inkStroke(g, 3, .7); } }
}
function ceiling(g, { y1 = 90, color = '#b98c60', beams = true, x0 = 0, x1 = W } = {}) { g.fillStyle = color; g.fillRect(x0, 0, x1 - x0, y1); if (beams) for (let x = x0 - 40; x < x1; x += 200) { g.fillStyle = shade(color, 0.65); g.fillRect(x, 0, 52, y1 - 4); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x + 40, 0, 12, y1 - 4); }
  g.fillStyle = mixc(color, '#ffffff', 0.55); g.fillRect(x0, y1 - 4, x1 - x0, 16); g.fillStyle = 'rgba(80,50,30,.25)'; g.fillRect(x0, y1 + 12, x1 - x0, 6); g.beginPath(); g.moveTo(x0, y1 - 4); g.lineTo(x1, y1 - 4); inkStroke(g, 3, .7); }
function floor(g, { y0 = 720, y1 = H, type = 'planks', color = '#b06c3c', color2 = null, vp = [W / 2, 300], seed = 100, base = true } = {}) {
  const k = (y0 - vp[1]) / (y1 - vp[1]);
  if (type === 'planks') { const pw = 150; for (let i = -14; i < 26; i++) { const xb0 = -1200 + i * pw, xb1 = xb0 + pw, t0 = vp[0] + (xb0 - vp[0]) * k, t1 = vp[0] + (xb1 - vp[0]) * k, r = rng(seed + i);
      poly(g, [[t0, y0], [t1, y0], [xb1, y1], [xb0, y1]]); g.fillStyle = [color, shade(color, .93), mixc(color, '#ffd8a8', .12), shade(color, .88)][(i + 14) % 4]; g.fill();
      g.save(); g.clip(); g.strokeStyle = 'rgba(70,35,15,.22)'; g.lineWidth = 1.5; for (let j = 0; j < 5; j++) { const u = 0.15 + r() * 0.7; g.beginPath(); g.moveTo(lerp(t0, t1, u), y0); g.lineTo(lerp(xb0, xb1, u), y1); g.stroke(); }
      const jy = y0 + 40 + r() * (y1 - y0 - 60); g.strokeStyle = 'rgba(50,25,10,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-200, jy); g.lineTo(W + 200, jy); g.stroke(); g.restore();
      g.beginPath(); g.moveTo(t0, y0); g.lineTo(xb0, y1); g.strokeStyle = 'rgba(40,20,10,.55)'; g.lineWidth = 2; g.stroke(); } }
  else if (type === 'tiles') { const c2 = color2 || mixc(color, '#ffffff', 0.5), rows = 8; for (let j = 0; j < rows; j++) { const v0 = j / rows, v1 = (j + 1) / rows, yy0 = lerp(y0, y1, v0 * v0 * 0.4 + v0 * 0.6), yy1 = lerp(y0, y1, v1 * v1 * 0.4 + v1 * 0.6);
      for (let i = -14; i < 28; i++) { const xb0 = -1400 + i * 140, xb1 = xb0 + 140, at = (y) => (y - vp[1]) / (y1 - vp[1]); const X = (xb, y) => vp[0] + (xb - vp[0]) * at(y);
        poly(g, [[X(xb0, yy0), yy0], [X(xb1, yy0), yy0], [X(xb1, yy1), yy1], [X(xb0, yy1), yy1]]); g.fillStyle = (i + j) % 2 ? color : c2; g.fill(); g.strokeStyle = 'rgba(40,30,30,.3)'; g.lineWidth = 1.5; g.stroke(); } } }
  else if (type === 'stone') { g.fillStyle = color; g.fillRect(0, y0, W, y1 - y0); const r = rng(seed); for (let y = y0; y < y1; y += 18 + (y - y0) * 0.08) { const hh = 18 + (y - y0) * 0.08; for (let x = -40 + r() * 40; x < W; x += hh * 2.2 + r() * 20) { ell(g, x, y + hh / 2, hh * 1.05, hh * 0.45, r() > .5 ? shade(color, .9) : mixc(color, '#fff', .12), 2); } } }
  else { g.fillStyle = color; g.fillRect(0, y0, W, y1 - y0); g.save(); g.beginPath(); g.rect(0, y0, W, y1 - y0); g.clip(); paint(g, 0, y0, W, y1 - y0, [shade(color, .85), mixc(color, '#fff', .15)], 600, seed, 6, 30, 0.12); g.restore(); }
  const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(40,20,20,.35)'); gr.addColorStop(0.3, 'rgba(40,20,20,0)'); g.fillStyle = gr; g.fillRect(0, y0, W, y1 - y0);
  if (base) { g.fillStyle = '#5a3420'; g.fillRect(0, y0 - 14, W, 16); g.beginPath(); g.moveTo(0, y0 + 2); g.lineTo(W, y0 + 2); inkStroke(g, 3, .7); }
}
/** rug on the floor: corners [[tl],[tr],[br],[bl]] */
function rug(g, C, { style = 'kilim', color = '#a3302a', color2 = '#e8a23a', color3 = '#2f3e5e', seed = 41 } = {}) {
  const Mp = (u, v) => { const ax = lerp(C[0][0], C[1][0], u), ay = lerp(C[0][1], C[1][1], u), bx = lerp(C[3][0], C[2][0], u), by = lerp(C[3][1], C[2][1], u); return [lerp(ax, bx, v), lerp(ay, by, v)]; };
  const kp = (pts, col) => { poly(g, pts.map(([u, v]) => Mp(u, v))); g.fillStyle = col; g.fill(); };
  if (style === 'round') { const cx = (C[0][0] + C[2][0]) / 2, cy = (C[0][1] + C[2][1]) / 2, rx = (C[1][0] - C[0][0]) / 2, ry = (C[2][1] - C[0][1]) / 2; ell(g, cx, cy, rx, ry, color, 3); ell(g, cx, cy, rx * 0.8, ry * 0.8, color2, 0); ell(g, cx, cy, rx * 0.62, ry * 0.62, color, 0); return; }
  kp([[0, 0], [1, 0], [1, 1], [0, 1]], color); g.save(); poly(g, C); g.clip(); paint(g, Math.min(C[3][0], C[0][0]), C[0][1], Math.abs(C[2][0] - C[3][0]), C[2][1] - C[0][1], [shade(color, .75), mixc(color, '#fff', .15)], 300, seed, 6, 30, 0.12); g.restore();
  if (style === 'kilim') {
    for (const [a, b, c] of [[0, 0.07, '#e9d4a8'], [0.025, 0.05, color3]]) { kp([[a, a * 1.6], [1 - a, a * 1.6], [1 - a, 1 - a * 1.2], [a, 1 - a * 1.2]], c); kp([[b, b * 1.6], [1 - b, b * 1.6], [1 - b, 1 - b * 1.2], [b, 1 - b * 1.2]], color); }
    for (let i = 0; i < 26; i++) { const u = 0.075 + i * 0.0335; kp([[u, 0.13], [u + 0.0167, 0.1], [u + 0.0335, 0.13], [u + 0.0167, 0.16]], i % 2 ? color2 : '#f0e2c0'); }
    for (const cu of [0.27, 0.5, 0.73]) { kp([[cu, 0.28], [cu + 0.1, 0.55], [cu, 0.82], [cu - 0.1, 0.55]], color2); kp([[cu, 0.38], [cu + 0.06, 0.55], [cu, 0.72], [cu - 0.06, 0.55]], color3); kp([[cu, 0.49], [cu + 0.025, 0.55], [cu, 0.61], [cu - 0.025, 0.55]], '#f0e2c0'); }
  } else { kp([[0.04, 0.06], [0.96, 0.06], [0.96, 0.94], [0.04, 0.94]], color2); kp([[0.07, 0.11], [0.93, 0.11], [0.93, 0.89], [0.07, 0.89]], color); }
  poly(g, C); inkStroke(g, 3, .6);
  for (let i = 0; i <= 40; i++) { const [x, y] = Mp(i / 40, 0); g.strokeStyle = '#efe0c0'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 1, y - 12); g.stroke(); }
}
// ---------------------------------------------------------------- landscapes (windows and outdoor scenes)
const SKIES = {
  day: ['#7fa8dc', '#dfe9f4'], golden: ['#e8a868', '#f8dcae'], night: ['#141c3a', '#3a4a7a'], dusk: ['#5a5a9a', '#e89a7a'], overcast: ['#a8b4c4', '#e4e8ee'],
};
function sky(g, x, y, w, h, { time = 'day', seed = 5, clouds = true } = {}) {
  const [c0, c1] = SKIES[time] || SKIES.day, gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.fillRect(x, y, w, h); const r = rng(seed);
  if (time === 'night') { for (let i = 0; i < w * h / 4000; i++) { g.fillStyle = `rgba(255,255,240,${0.4 + r() * 0.6})`; g.beginPath(); g.arc(x + r() * w, y + r() * h * 0.7, 0.8 + r() * 1.8, 0, 7); g.fill(); }
    const mx = x + w * 0.78, my = y + h * 0.22, mr = Math.min(w, h) * 0.07; glow(g, mx, my, mr * 4, '220,230,255', 0.35); ell(g, mx, my, mr, mr, '#f6f2dc', 0); g.fillStyle = 'rgba(200,190,160,.5)'; for (const [a, b, c] of [[-.3, -.2, .18], [.25, .2, .12], [-.1, .35, .1]]) { g.beginPath(); g.arc(mx + a * mr, my + b * mr, c * mr, 0, 7); g.fill(); } }
  else if (time === 'golden' || time === 'dusk') glow(g, x + w * 0.2, y + h * 0.75, Math.max(w, h) * 0.5, '255,220,150', 0.5);
  if (clouds && time !== 'night') for (let i = 0; i < 2 + w / 400; i++) { const cx = x + r() * w, cy = y + h * (0.1 + r() * 0.3), s = (0.5 + r()) * Math.min(1, w / 900) * 1.2; g.fillStyle = time === 'golden' ? 'rgba(255,240,220,.85)' : 'rgba(255,255,255,.85)';
    for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(cx + (k - 2) * 34 * s, cy - Math.sin(k / 4 * Math.PI) * 20 * s, 40 * s, 24 * s, 0, 0, 7); g.fill(); } }
}
function mountains(g, x, y, w, h, { season = 'winter', time = 'day', seed = 3, layers = 2 } = {}) {
  const r = rng(seed), night = time === 'night';
  const cols = { winter: ['#7d90bb', '#6a7ca6'], summer: ['#7a9cc0', '#5f8e5a'], autumn: ['#9a8ab0', '#b0763e'], spring: ['#86a6c8', '#7aae4e'] }[season] || ['#7d90bb', '#6a7ca6'];
  for (let L = 0; L < layers; L++) {
    const base = y + h * (0.55 + L * 0.2), amp = h * (0.45 - L * 0.17), pts = [[x - 20, y + h + 20]]; let px = x - 20;
    while (px < x + w + 40) { pts.push([px, base - amp * (0.4 + r() * 0.6)]); px += w * (0.08 + r() * 0.12); pts.push([px, base - amp * r() * 0.35]); px += w * (0.05 + r() * 0.08); }
    pts.push([x + w + 40, y + h + 20]); poly(g, pts); let c = cols[L % 2]; if (night) c = mixc(c, '#1a2448', 0.55); g.fillStyle = c; g.fill();
    if (season === 'winter' || L === 0) { g.save(); g.clip(); const sc = Math.max(0.6, h / 300);
      for (let yy = y; yy < y + h + 20; yy += 11 * sc) for (let xx = x - 20; xx < x + w + 20; xx += (18 + r() * 14) * sc) { if (season !== 'winter' && yy > base - amp * 0.6) continue; g.strokeStyle = night ? `rgba(200,210,240,${0.4 + r() * 0.3})` : `rgba(250,252,255,${0.6 + r() * 0.3})`; g.lineWidth = (3.5 + r() * 2) * sc; g.lineCap = 'round';
        g.beginPath(); g.moveTo(xx, yy + r() * 4); g.quadraticCurveTo(xx + 6 * sc, yy - 3, xx + (12 + r() * 6) * sc, yy + r() * 4); g.stroke(); }
      g.restore(); }
  }
}
/** a house front: style stone|plaster|wood|brick; lit windows at night */
function house(g, x, y, w, h, { style = 'stone', snow = false, lit = false, seed = 1, roof = '#9a5a3a', color = null } = {}) {
  const r = rng(seed), wc = color || { stone: '#c79566', plaster: '#ecd8b4', wood: '#9a6a44', brick: '#b0583e' }[style] || '#c79566';
  g.fillStyle = wc; g.fillRect(x, y, w, h);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); const u = Math.max(4, w / 14);
  if (style === 'stone') for (let yy = y; yy < y + h; yy += u * 0.7) for (let xx = x - (Math.round((yy - y) / u) % 2 ? u * 0.5 : 0); xx < x + w; xx += u) ell(g, xx + u / 2, yy + u * 0.3, u * 0.48, u * 0.32, r() > .5 ? mixc(wc, '#fff', .15) : shade(wc, .9), Math.max(0.8, u * 0.06));
  else if (style === 'brick') for (let yy = y; yy < y + h; yy += u * 0.45) for (let xx = x - (Math.round((yy - y) / (u * 0.45)) % 2 ? u * 0.5 : 0); xx < x + w; xx += u) { g.fillStyle = r() > .5 ? shade(wc, .9) : mixc(wc, '#fff', .1); g.fillRect(xx + 1, yy + 1, u - 2, u * 0.45 - 2); }
  else if (style === 'wood') for (let yy = y; yy < y + h; yy += u * 0.6) { g.strokeStyle = shade(wc, .7); g.lineWidth = Math.max(1, u * 0.08); g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); }
  else paint(g, x, y, w, h, [shade(wc, .9), mixc(wc, '#fff', .2)], 40, seed, u * 0.3, u * 1.5, 0.15);
  g.fillStyle = 'rgba(40,40,90,.22)'; g.fillRect(x + w * 0.62, y, w * 0.38, h); g.restore();
  g.strokeStyle = INK; g.lineWidth = Math.max(1.5, w / 60); g.strokeRect(x, y, w, h);
  const nw = Math.max(1, Math.round(w / (h * 0.7))), ww = w * 0.14, wh = h * 0.24;
  for (let k = 0; k < nw + 1; k++) { const wx = x + w * (0.12 + k * 0.76 / Math.max(1, nw)) - ww / 2 + ww / 2, wy = y + h * 0.28; g.fillStyle = lit ? '#f6c860' : '#5a6a8a'; g.fillRect(wx, wy, ww, wh); g.strokeRect(wx, wy, ww, wh); if (lit) glow(g, wx + ww / 2, wy + wh / 2, ww * 2.2, '255,200,110', 0.45);
    g.strokeStyle = shade('#8a5530', .9); g.lineWidth = Math.max(1, w / 120); g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.stroke(); g.strokeStyle = INK; g.lineWidth = Math.max(1.5, w / 60); }
  // flat village roof with optional snow slab
  rrect(g, x - w * 0.06, y - h * 0.16, w * 1.12, h * 0.18, h * 0.06, snow ? '#f6f8fc' : roof, Math.max(1.5, w / 60));
  if (snow) { g.fillStyle = '#c8d4ea'; g.fillRect(x - w * 0.05, y + 1, w * 1.1, h * 0.04); for (let k = 0; k < 6; k++) { g.fillStyle = '#f6f8fc'; g.beginPath(); g.ellipse(x + w * (0.05 + k * 0.18), y + h * 0.02, w * 0.04, h * 0.05, 0, 0, Math.PI); g.fill(); } }
  g.fillStyle = shade('#9a6a48', .9); g.fillRect(x + w * 0.7, y - h * 0.34, w * 0.09, h * 0.2); g.strokeRect(x + w * 0.7, y - h * 0.34, w * 0.09, h * 0.2);
}
function tree(g, x, y, s = 1, { type = 'bare', snow = false, seed = 21, color = null } = {}) {
  const r = rng(seed);
  if (type === 'bare' || snow && type === 'bare') { const br = (bx, by, a, len, w, d) => { if (d === 0 || len < 3) return; const x2 = bx + Math.cos(a) * len, y2 = by + Math.sin(a) * len;
      g.strokeStyle = '#5e4232'; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(bx, by); g.lineTo(x2, y2); g.stroke();
      if (snow && w > 1.5) { g.strokeStyle = 'rgba(250,252,255,.92)'; g.lineWidth = w * 0.42; g.beginPath(); g.moveTo(bx, by - w * 0.4); g.lineTo(x2, y2 - w * 0.4); g.stroke(); }
      br(x2, y2, a - 0.35 - r() * 0.3, len * 0.72, w * 0.68, d - 1); br(x2, y2, a + 0.3 + r() * 0.3, len * 0.7, w * 0.66, d - 1); };
    br(x, y, -Math.PI / 2 - 0.1 + r() * 0.2, 130 * s, 16 * s, 7); return; }
  if (type === 'pine') { g.fillStyle = '#5e4232'; g.fillRect(x - 8 * s, y - 40 * s, 16 * s, 40 * s); for (let k = 0; k < 4; k++) { const yy = y - 40 * s - k * 50 * s, ww = (110 - k * 22) * s; poly(g, [[x - ww / 2, yy], [x + ww / 2, yy], [x, yy - 90 * s]]); fillInk(g, k % 2 ? '#3a6a46' : '#2f5c3c', 2.5 * s);
      if (snow) { poly(g, [[x - ww * 0.3, yy - 40 * s], [x, yy - 90 * s], [x + ww * 0.3, yy - 40 * s], [x, yy - 50 * s]]); g.fillStyle = '#f4f7fc'; g.fill(); } } return; }
  g.fillStyle = '#6a4a32'; poly(g, [[x - 12 * s, y], [x + 12 * s, y], [x + 7 * s, y - 120 * s], [x - 7 * s, y - 120 * s]]); fillInk(g, '#6a4a32', 3 * s);
  const cols = type === 'autumn' ? ['#e09a3a', '#c8602e', '#f2c24a'] : ['#5aa040', '#78b84a', '#4a8a3a'];
  for (let k = 0; k < 6; k++) ell(g, x + (r() - 0.5) * 120 * s, y - (150 + r() * 90) * s, (60 + r() * 30) * s, (50 + r() * 20) * s, color || cols[k % 3], 3 * s);
}
function stoneWall(g, x0, x1, y, { s = 1, snow = false, color = '#c99a6c', seed = 9 } = {}) { const r = rng(seed); for (let row = 0; row < 3; row++) for (let x = x0 - (row % 2) * 14 * s; x < x1; x += 30 * s) { const yy = y - row * 18 * s; ell(g, x, yy, 16 * s, 11 * s, r() > .5 ? color : shade(color, .9), 2 * s); if (snow && row === 2) { g.fillStyle = '#f7f9fd'; g.beginPath(); g.ellipse(x, yy - 7 * s, 15 * s, 7 * s, 0, Math.PI, 0); g.fill(); } } }
/** full landscape inside a rect: sky, mountains, village, ground. Used by windows and outdoor scenes. */
function landscape(g, x, y, w, h, { season = 'winter', time = 'day', village = true, seed = 7, trees = true } = {}) {
  const snowy = season === 'winter', night = time === 'night', r = rng(seed);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  sky(g, x, y, w, h * 0.75, { time, seed });
  mountains(g, x, y + h * 0.1, w, h * 0.5, { season, time, seed });
  const gy = y + h * 0.72, gc = snowy ? ['#f2f5fb', '#d6e0f0'] : season === 'autumn' ? ['#c8a050', '#a87a3a'] : ['#8cc060', '#6a9a48'];
  let gr = g.createLinearGradient(0, gy, 0, y + h); gr.addColorStop(0, night ? mixc(gc[0], '#2a3458', .5) : gc[0]); gr.addColorStop(1, night ? mixc(gc[1], '#1a2040', .5) : gc[1]); g.fillStyle = gr; g.fillRect(x, gy - h * 0.03, w, h * 0.35);
  if (village) { const n = Math.max(2, Math.round(w / 140)); for (let i = 0; i < n; i++) { const hw = w / n * (0.6 + r() * 0.25), hh = hw * (0.6 + r() * 0.3), hx = x + i * w / n + r() * w / n * 0.2; house(g, hx, gy - hh * 0.92, hw, hh, { snow: snowy, lit: night || r() > .5, seed: seed + i, style: r() > .3 ? 'stone' : 'plaster' }); } }
  if (trees) tree(g, x + w * (0.82 + r() * 0.1), y + h, h / 600, { type: snowy ? 'bare' : season === 'autumn' ? 'autumn' : 'leafy', snow: snowy, seed });
  stoneWall(g, x, x + w, y + h * 0.9, { s: h / 560, snow: snowy, seed });
  if (night) { g.fillStyle = 'rgba(20,30,70,.25)'; g.fillRect(x, y, w, h); }
  g.restore();
}
/** window in a wall, with landscape outside. outside: {season,time} or a function(g,x,y,w,h) */
function windowFrame(g, x, y, w, h, { outside = { season: 'winter', time: 'day' }, frame = '#8a5530', cols = 2, rows = 3, sill = true, curtains = null, plant = false, seed = 31 } = {}) {
  const b = Math.max(14, w * 0.06), ix = x + b, iy = y + b, iw = w - 2 * b, ih = h - 2 * b;
  if (typeof outside === 'function') { g.save(); g.beginPath(); g.rect(ix, iy, iw, ih); g.clip(); outside(g, ix, iy, iw, ih); g.restore(); } else landscape(g, ix, iy, iw, ih, outside);
  g.fillStyle = frame; g.beginPath(); g.rect(x, y, w, h); g.rect(ix, iy, iw, ih); g.fill('evenodd'); g.save(); g.beginPath(); g.rect(x, y, w, h); g.rect(ix, iy, iw, ih); g.clip('evenodd'); paint(g, x, y, w, h, [mixc(frame, '#fff', .15), shade(frame, .8)], 200, seed, 3, 18, 0.25); g.restore();
  g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(x, y, w, h); g.lineWidth = 3; g.strokeRect(ix, iy, iw, ih);
  const mb = b * 0.6; for (let i = 1; i < cols; i++) { const mx = ix + iw * i / cols - mb / 2; g.fillStyle = frame; g.fillRect(mx, iy, mb, ih); g.lineWidth = 2.5; g.strokeRect(mx, iy, mb, ih); }
  for (let j = 1; j < rows; j++) { const my = iy + ih * j / rows - mb / 2; g.fillStyle = frame; g.fillRect(ix, my, iw, mb); g.lineWidth = 2.5; g.strokeRect(ix, my, iw, mb); }
  g.save(); g.beginPath(); g.rect(ix, iy, iw, ih); g.clip(); g.globalAlpha = .13; g.fillStyle = '#fff'; for (const o of [0, iw * 0.15]) { g.beginPath(); g.moveTo(ix + iw * 0.1 + o, iy); g.lineTo(ix + iw * 0.22 + o, iy); g.lineTo(ix + o, iy + ih * 0.3); g.lineTo(ix + o, iy + ih * 0.18); g.fill(); } g.restore();
  if (sill) { g.fillStyle = '#f2dfc0'; g.fillRect(x - 24, y + h, w + 48, 28); g.fillStyle = 'rgba(80,50,30,.3)'; g.fillRect(x - 18, y + h + 28, w + 36, 10); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(x - 24, y + h, w + 48, 28); }
  if (plant) { const px = x + w - 60, py = y + h; poly(g, [[px - 24, py - 42], [px + 24, py - 42], [px + 18, py], [px - 18, py]]); fillInk(g, '#b8603a', 3);
    for (let i = 0; i < 6; i++) ell(g, px - 18 + i * 7, py - 54 - (i % 3) * 8, 13, 9, i % 2 ? '#4f8a3e' : '#5f9e48', 2, i); for (const [a, b2] of [[-10, -80], [10, -74], [0, -90]]) ell(g, px + a, py + b2, 8, 8, '#e0384a', 2); }
  if (curtains) for (const sd of [-1, 1]) { const cx = sd < 0 ? x - 30 : x + w + 30, P = new Path2D(); P.moveTo(cx - 40, y - 30); P.lineTo(cx + 40, y - 30); P.bezierCurveTo(cx + 30 - sd * 30, y + h * 0.5, cx + 40, y + h * 0.8, cx + 34, y + h + 40); P.lineTo(cx - 34, y + h + 40); P.bezierCurveTo(cx - 40, y + h * 0.8, cx - 30 - sd * 30, y + h * 0.5, cx - 40, y - 30); P.closePath();
    shape(g, P, pattern(g, 'plain', curtains), [cx - 40, y, cx + 40, y + h], { ink: 3.5 }); g.strokeStyle = rgba(shade(curtains, .6), .6); g.lineWidth = 3; for (const k of [-16, 4, 22]) { g.beginPath(); g.moveTo(cx + k, y - 20); g.quadraticCurveTo(cx + k - sd * 10, y + h * 0.5, cx + k, y + h + 30); g.stroke(); } }
  if (curtains) { g.fillStyle = '#5a3a24'; g.fillRect(x - 70, y - 40, w + 140, 12); }
}
// ---------------------------------------------------------------- furniture & props (positions are the floor contact point unless noted)
const F_ = {};
F_.sedir = (g, x0, x1, y, { color = '#87522e', cushion = '#b23a2c', seed = 61 } = {}) => { // y = floor line at its front
  const top = y - 100; g.fillStyle = color; g.fillRect(x0, top, x1 - x0, 100); for (let x = x0 + 20; x < x1 - 90; x += 112) { g.fillStyle = shade(color, .82); g.fillRect(x, top + 16, 92, 66); g.strokeStyle = 'rgba(42,28,22,.7)'; g.lineWidth = 2.5; g.strokeRect(x, top + 16, 92, 66); }
  g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(x0, top, x1 - x0, 100);
  const kil = (P, bb, s) => { g.fillStyle = cushion; g.fill(P); g.save(); g.clip(P); const [a, b, c, d] = bb; for (let x = a; x < c; x += 46) { poly(g, [[x + 23, b + 20], [x + 42, (b + d) / 2], [x + 23, d - 20], [x + 4, (b + d) / 2]]); g.fillStyle = '#e8a23a'; g.fill(); poly(g, [[x + 23, b + 40], [x + 33, (b + d) / 2], [x + 23, d - 40], [x + 13, (b + d) / 2]]); g.fillStyle = '#263555'; g.fill(); }
    g.fillStyle = '#efe0c0'; g.fillRect(a, b + 6, c - a, 6); g.fillRect(a, d - 12, c - a, 6); const gr = g.createLinearGradient(a, b, c, d); gr.addColorStop(0, 'rgba(255,220,170,.15)'); gr.addColorStop(1, 'rgba(30,10,40,.3)'); g.fillStyle = gr; g.fillRect(a, b, c - a, d - b); g.restore(); inkP(g, P, 4); };
  const n = Math.max(1, Math.round((x1 - x0) / 230)), cw = (x1 - x0 - 20) / n; for (let i = 0; i < n; i++) { const P = new Path2D(); P.roundRect(x0 + 10 + i * cw, top - 200, cw - 6, 170, [40, 40, 14, 14]); kil(P, [x0 + 10 + i * cw, top - 200, x0 + 4 + (i + 1) * cw, top - 30], seed + i); }
  const P = new Path2D(); P.roundRect(x0 - 8, top - 46, x1 - x0 + 16, 56, 22); kil(P, [x0 - 8, top - 46, x1 + 8, top + 10], seed + 9);
};
F_.bed = (g, x0, x1, y, { frame = '#8a5530', blanket = '#6f8fbf', sheet = '#f6f2ea', pillow = '#f2f0ea', made = false } = {}) => {
  const top = y - 150; rrect(g, x0 - 20, top - 210, 36, 250, 10, frame, 4); for (let k = 0; k < 3; k++) rrect(g, x0 + 18, top - 170 + k * 50, 90, 30, 8, shade(frame, .85), 3);
  rrect(g, x1 - 16, top - 70, 30, 110, 8, frame, 4); g.fillStyle = frame; g.fillRect(x0, y - 70, x1 - x0, 60); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(x0, y - 70, x1 - x0, 60);
  for (const lx of [x0 + 10, x1 - 30]) rrect(g, lx, y - 14, 22, 14, 3, shade(frame, .7), 3);
  rrect(g, x0 + 4, top - 10, x1 - x0 - 8, 88, 22, sheet, 4); ITEMS.pillow(g, x0 + 120, top - 26, 1, { color: pillow });
  if (made) { const P = new Path2D(); P.roundRect(x0 + 200, top - 20, x1 - x0 - 210, 110, 24); shape(g, P, pattern(g, 'check', blanket, shade(blanket, .7)), [x0 + 200, top - 20, x1, top + 90]); }
};
F_.nightstand = (g, x, y, { color = '#8a5530' } = {}) => { rrect(g, x - 70, y - 150, 140, 150, 8, color, 4); for (let k = 0; k < 2; k++) { rrect(g, x - 58, y - 136 + k * 66, 116, 54, 6, shade(color, .9), 3); ell(g, x, y - 109 + k * 66, 7, 7, '#d9a93a', 2.5); } };
F_.lamp = (g, x, y, { on = true, color = '#d8b46a' } = {}) => { // bedside / desk lamp standing on surface y
  rrect(g, x - 30, y - 14, 60, 14, 6, '#5a4a3a', 3); g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(x, y - 12); g.lineTo(x, y - 110); g.stroke(); g.strokeStyle = '#7a6a5a'; g.lineWidth = 5; g.stroke();
  if (on) glow(g, x, y - 120, 260, '255,214,140', 0.55); poly(g, [[x - 60, y - 100], [x + 60, y - 100], [x + 38, y - 180], [x - 38, y - 180]]); fillInk(g, color, 4); if (on) { g.fillStyle = 'rgba(255,240,200,.5)'; poly(g, [[x - 56, y - 102], [x + 56, y - 102], [x + 48, y - 120], [x - 48, y - 120]]); g.fill(); } };
F_.hangingLamp = (g, x, y, { on = true, color = '#4c5a4a', top = 0 } = {}) => { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x, top); g.lineTo(x, y); g.stroke(); if (on) glow(g, x, y + 58, 220, '255,224,150', 0.55);
  g.beginPath(); g.moveTo(x - 8, y); g.lineTo(x + 8, y); g.bezierCurveTo(x + 50, y + 6, x + 66, y + 34, x + 70, y + 54); g.lineTo(x - 70, y + 54); g.bezierCurveTo(x - 66, y + 34, x - 50, y + 6, x - 8, y); g.closePath(); fillInk(g, color, 3.5); ell(g, x, y + 60, 22, 12, on ? '#fff3c4' : '#d8d0c0', 2.5); };
F_.wallClock = (g, x, y, r = 50, { color = '#7a4a2a' } = {}) => { ell(g, x, y, r, r, color, 4); ell(g, x, y, r * 0.82, r * 0.82, '#fbf6ea', 3); g.strokeStyle = INK; g.lineCap = 'round'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r0 = r * (i % 3 ? 0.68 : 0.6); g.lineWidth = i % 3 ? 2 : 4; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r * 0.76, y + Math.sin(a) * r * 0.76); g.stroke(); } };
/** clock hands (dynamic: call in draw). hours 0..12 */
const clockHands = (g, x, y, r, hours) => { g.save(); g.strokeStyle = INK; g.lineCap = 'round'; const ha = hours / 12 * Math.PI * 2, ma = (hours % 1) * Math.PI * 2; g.lineWidth = r * 0.1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(ha) * r * 0.42, y - Math.cos(ha) * r * 0.42); g.stroke();
  g.lineWidth = r * 0.06; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(ma) * r * 0.66, y - Math.cos(ma) * r * 0.66); g.stroke(); ell(g, x, y, r * 0.07, r * 0.07, INK, 0); g.restore(); };
F_.desk = (g, x0, x1, y, { color = '#9a6a3e', h = 250 } = {}) => { const top = y - h; rrect(g, x0 - 10, top - 26, x1 - x0 + 20, 30, 6, color, 4); g.save(); g.beginPath(); g.rect(x0 - 10, top - 26, x1 - x0 + 20, 30); g.clip(); paint(g, x0, top - 26, x1 - x0, 30, [shade(color, .85), mixc(color, '#fff', .15)], 80, 5, 3, 20, .3); g.restore();
  for (const lx of [x0 + 10, x1 - 40]) rrect(g, lx, top + 4, 30, h - 4, 4, shade(color, .8), 3.5); rrect(g, x1 - 200, top + 4, 160, 110, 6, shade(color, .9), 3.5); rrect(g, x1 - 186, top + 20, 132, 36, 5, shade(color, .82), 2.5); ell(g, x1 - 120, top + 38, 6, 6, '#d9a93a', 2); };
F_.computer = (g, x, y, { on = true, screen = '#2a4a7a' } = {}) => { // y = desk surface
  rrect(g, x - 40, y - 16, 80, 16, 5, '#3a3a40', 3); rrect(g, x - 14, y - 70, 28, 56, 4, '#4a4a52', 3); rrect(g, x - 170, y - 300, 340, 236, 14, '#2a2a30', 4);
  const gr = g.createLinearGradient(0, y - 286, 0, y - 80); gr.addColorStop(0, on ? '#6ab0f0' : '#1a1e26'); gr.addColorStop(1, on ? screen : '#14161c'); g.fillStyle = gr; g.fillRect(x - 154, y - 284, 308, 204);
  if (on) { g.fillStyle = 'rgba(255,255,255,.75)'; for (let k = 0; k < 5; k++) g.fillRect(x - 130, y - 260 + k * 30, 140 + (k * 53) % 110, 10); g.fillStyle = 'rgba(255,220,120,.85)'; g.fillRect(x + 50, y - 260, 80, 70); }
  rrect(g, x - 120, y - 6, 240, 14, 4, '#d8d4cc', 3); };
F_.chair = (g, x, y, { color = '#9a6a3e', back = true } = {}) => { // front-facing chair; character sits with y = floor
  if (back) { rrect(g, x - 120, y - 520, 240, 250, 18, color, 4); for (let k = 0; k < 3; k++) { g.strokeStyle = shade(color, .7); g.lineWidth = 3; g.beginPath(); g.moveTo(x - 90 + k * 90, y - 500); g.lineTo(x - 90 + k * 90, y - 290); g.stroke(); } }
  for (const sd of [-1, 1]) rrect(g, x + sd * 118 - 11, y - 280, 22, 280, 5, shade(color, .82), 3.5); rrect(g, x - 140, y - 300, 280, 30, 10, color, 4); };
F_.sofa = (g, x0, x1, y, { color = '#7a8a5a' } = {}) => { const P = new Path2D(); P.roundRect(x0, y - 420, x1 - x0, 300, 40); shape(g, P, pattern(g, 'plain', color), [x0, y - 420, x1, y - 120]);
  for (const ax of [x0 - 30, x1 - 70]) { const A = new Path2D(); A.roundRect(ax, y - 300, 100, 260, 34); shape(g, A, pattern(g, 'plain', shade(color, .92)), [ax, y - 300, ax + 100, y - 40]); }
  const S = new Path2D(); S.roundRect(x0 + 50, y - 200, x1 - x0 - 100, 110, 20); shape(g, S, pattern(g, 'plain', mixc(color, '#fff', .08)), [x0, y - 200, x1, y - 90]); for (const lx of [x0 + 40, x1 - 60]) rrect(g, lx, y - 40, 22, 40, 4, '#4a3020', 3); };
F_.stove = (g, x, y, { teapot = true } = {}) => { // x = centre, y = floor
  g.fillStyle = '#34302e'; g.fillRect(x - 19, 0, 38, y - 290); g.fillStyle = '#4c4744'; g.fillRect(x - 13, 0, 8, y - 290); g.strokeStyle = INK; g.lineWidth = 3.5; g.strokeRect(x - 19, 0, 38, y - 290);
  for (let yy = 140; yy < y - 300; yy += 200) { g.fillStyle = '#2a2624'; g.fillRect(x - 23, yy, 46, 12); g.strokeRect(x - 23, yy, 46, 12); }
  g.fillStyle = '#2a2624'; g.fillRect(x - 67, y - 44, 14, 46); g.fillRect(x + 53, y - 44, 14, 46);
  const SP = new Path2D(); SP.roundRect(x - 83, y - 330, 166, 290, 22); shape(g, SP, '#3d3836', [x - 83, y - 330, x + 83, y - 40], { ink: 4.5, shade: 0.35, hi: 0.18 }); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x - 65, y - 310, 16, 250);
  for (const yy of [y - 304, y - 72]) { g.fillStyle = '#2a2624'; g.fillRect(x - 87, yy, 174, 16); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(x - 87, yy, 174, 16); }
  rrect(g, x - 38, y - 194, 76, 82, 8, '#221e1c', 3); for (let i = 0; i < 4; i++) { g.fillStyle = '#ff9a3a'; g.fillRect(x - 28 + i * 16, y - 172, 8, 42); }
  ell(g, x, y - 328, 90, 16, '#2e2a28', 3.5);
  if (teapot) { const kx = x, ky = y - 332; const KP = new Path2D(); KP.moveTo(kx - 46, ky); KP.bezierCurveTo(kx - 58, ky - 38, kx - 40, ky - 56, kx - 22, ky - 60); KP.lineTo(kx + 26, ky - 60); KP.bezierCurveTo(kx + 44, ky - 56, kx + 60, ky - 38, kx + 48, ky); KP.closePath();
    const mg = g.createLinearGradient(kx - 50, 0, kx + 55, 0); mg.addColorStop(0, '#9a9894'); mg.addColorStop(0.3, '#f2f0ea'); mg.addColorStop(0.55, '#bdbab4'); mg.addColorStop(1, '#6e6c6a'); g.fillStyle = mg; g.fill(KP); inkP(g, KP, 3.5);
    g.beginPath(); g.moveTo(kx + 44, ky - 18); g.quadraticCurveTo(kx + 70, ky - 24, kx + 78, ky - 58); g.lineTo(kx + 86, ky - 56); g.quadraticCurveTo(kx + 80, ky - 12, kx + 48, ky - 6); g.closePath(); fillInk(g, '#b8b5ae', 3);
    const TP = new Path2D(); TP.moveTo(kx - 26, ky - 60); TP.bezierCurveTo(kx - 38, ky - 88, kx - 26, ky - 110, kx - 12, ky - 114); TP.lineTo(kx + 16, ky - 114); TP.bezierCurveTo(kx + 30, ky - 110, kx + 40, ky - 88, kx + 28, ky - 60); TP.closePath();
    g.fillStyle = '#b93a2e'; g.fill(TP); g.save(); g.clip(TP); g.fillStyle = 'rgba(255,240,220,.9)'; for (const [a, b] of [[-12, -93], [10, -80], [20, -100]]) { g.beginPath(); g.arc(kx + a, ky + b, 5, 0, 7); g.fill(); } g.restore(); inkP(g, TP, 3.5);
    ell(g, kx + 2, ky - 115, 22, 6, '#d9a93a', 2.5); ell(g, kx + 2, ky - 124, 6, 6, '#d9a93a', 2.5); }
  return { spout: [x + 82, y - 390], fire: [x, y - 150] };
};
F_.lowTable = (g, x, y, { r = 128, color = '#a8662e' } = {}) => { // y = floor at the front legs
  for (const [lx, ly] of [[-85, 0], [85, 0], [-30, 20], [35, 22]]) { poly(g, [[x + lx - 8, y - 150], [x + lx + 8, y - 150], [x + lx + 6, y + ly], [x + lx - 6, y + ly]]); fillInk(g, '#6e4024', 3); }
  const ty = y - 152; g.beginPath(); g.ellipse(x, ty + 12, r, r * 0.28, 0, 0, Math.PI); g.lineTo(x - r, ty); g.ellipse(x, ty, r, r * 0.28, 0, Math.PI, 0, true); g.closePath(); fillInk(g, shade(color, .8), 3.5);
  const mg = g.createLinearGradient(x - r, ty - 30, x + r, ty + 30); mg.addColorStop(0, '#f2b468'); mg.addColorStop(0.5, '#d48a42'); mg.addColorStop(1, '#a8622c'); g.fillStyle = mg; g.beginPath(); g.ellipse(x, ty, r, r * 0.28, 0, 0, 7); g.fill(); inkStroke(g, 3.5);
  g.strokeStyle = 'rgba(120,60,20,.5)'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, ty, r * 0.8, r * 0.21, 0, 0, 7); g.stroke(); return { top: ty };
};
F_.table = (g, x0, x1, y, { color = '#9a6a3e', h = 250, cloth = null } = {}) => { const top = y - h; for (const lx of [x0 + 20, x1 - 44]) rrect(g, lx, top, 24, h, 4, shade(color, .8), 3.5); rrect(g, x0, top - 24, x1 - x0, 28, 6, color, 4);
  if (cloth) { const P = new Path2D(); P.moveTo(x0 - 10, top - 26); P.lineTo(x1 + 10, top - 26); P.lineTo(x1 + 20, top + 60); P.lineTo(x0 - 20, top + 60); P.closePath(); shape(g, P, pattern(g, 'check', cloth, '#ffffff'), [x0, top - 26, x1, top + 60]); } return { top: top - 24 }; };
F_.shelf = (g, x0, x1, y, { color = '#7a4a2a', items = ['jug', 'plates'] } = {}) => { g.fillStyle = color; g.fillRect(x0, y, x1 - x0, 18); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(x0, y, x1 - x0, 18);
  for (const x of [x0 + 20, x1 - 30]) { poly(g, [[x, y + 18], [x + 10, y + 18], [x + 10, y + 58]]); fillInk(g, shade(color, .85), 2.5); }
  let cx = x0 + 40; for (const it of items) { if (it === 'jug') { g.beginPath(); g.moveTo(cx - 22, y); g.bezierCurveTo(cx - 40, y - 32, cx - 26, y - 54, cx - 10, y - 60); g.lineTo(cx - 14, y - 82); g.lineTo(cx + 16, y - 82); g.lineTo(cx + 12, y - 60); g.bezierCurveTo(cx + 30, y - 54, cx + 40, y - 32, cx + 22, y); g.closePath(); fillInk(g, '#c4703a', 3); cx += 80; }
    if (it === 'plates') { for (const c of ['#3d6ea8', '#b3402e']) { ell(g, cx, y - 34, 32, 32, '#f2ead8', 3); g.strokeStyle = c; g.lineWidth = 6; g.beginPath(); g.arc(cx, y - 34, 24, 0, 7); g.stroke(); ell(g, cx, y - 34, 8, 8, c, 0); cx += 54; } cx += 20; }
    if (it === 'books') { for (let i = 0; i < 6; i++) { const hh = 60 + (i * 17) % 24; rrect(g, cx + i * 18, y - hh, 16, hh, 2, ['#8a2f3a', '#3d6ea8', '#4f8a3e', '#d9a93a'][i % 4], 2.5); } cx += 130; }
    if (it === 'jar') { rrect(g, cx - 20, y - 56, 40, 56, 8, 'rgba(220,235,240,.8)', 3); g.fillStyle = '#e8a23a'; g.fillRect(cx - 17, y - 34, 34, 31); rrect(g, cx - 22, y - 64, 44, 12, 4, '#b8603a', 2.5); cx += 70; }
    if (it === 'plant') { poly(g, [[cx - 20, y - 36], [cx + 20, y - 36], [cx + 15, y], [cx - 15, y]]); fillInk(g, '#b8603a', 3); for (let i = 0; i < 5; i++) ell(g, cx - 14 + i * 7, y - 48 - (i % 3) * 7, 11, 8, i % 2 ? '#4f8a3e' : '#5f9e48', 2, i); cx += 70; } } };
F_.frame = (g, x, y, w, h, { color = '#6e4428', inner = null } = {}) => { g.fillStyle = color; g.fillRect(x, y, w, h); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(x, y, w, h); g.fillStyle = '#d9c09a'; g.fillRect(x + 10, y + 10, w - 20, h - 20);
  if (inner) { g.save(); g.beginPath(); g.rect(x + 10, y + 10, w - 20, h - 20); g.clip(); inner(g, x + 10, y + 10, w - 20, h - 20); g.restore(); }
  else { const cx = x + w / 2, cy = y + h * 0.48, s = w / 104; g.fillStyle = '#b89a72'; g.beginPath(); g.ellipse(cx, y + h - 12, 26 * s, 30 * s, 0, Math.PI, 0); g.fill(); ell(g, cx, cy, 20 * s, 22 * s, '#f1e6d2', 2); g.fillStyle = INK; g.beginPath(); g.ellipse(cx - 7 * s, cy + 3 * s, 2.5 * s, 4 * s, 0, 0, 7); g.ellipse(cx + 7 * s, cy + 3 * s, 2.5 * s, 4 * s, 0, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(80,50,30,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 14, y - 2); g.lineTo(x + w / 2, y - 34); g.lineTo(x + w - 14, y - 2); g.stroke(); };
F_.plant = (g, x, y, { s = 1, pot = '#b8603a' } = {}) => { g.save(); g.translate(x, y); g.scale(s, s); poly(g, [[-46, -90], [46, -90], [36, 0], [-36, 0]]); fillInk(g, pot, 3.5); for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.32; ell(g, Math.cos(a) * 70, -100 + Math.sin(a) * 90, 24, 50, i % 2 ? '#4f8a3e' : '#5f9e48', 3, a + Math.PI / 2); } g.restore(); };
F_.wardrobe = (g, x, y, { w = 300, h = 600, color = '#8a5530' } = {}) => { rrect(g, x - w / 2, y - h, w, h, 10, color, 4); g.save(); g.beginPath(); g.rect(x - w / 2, y - h, w, h); g.clip(); paint(g, x - w / 2, y - h, w, h, [shade(color, .85), mixc(color, '#fff', .15)], 160, 7, 4, 30, .25); g.restore();
  for (const sd of [-1, 1]) { rrect(g, x + (sd < 0 ? -w / 2 + 16 : 6), y - h + 20, w / 2 - 22, h - 60, 6, shade(color, .92), 3); ell(g, x + sd * 18, y - h / 2, 7, 7, '#d9a93a', 2.5); } rrect(g, x - w / 2 - 10, y - h - 20, w + 20, 24, 6, shade(color, .8), 4); };
F_.door = (g, x, y, { w = 220, h = 470, color = '#7a4a2a', open = 0 } = {}) => { rrect(g, x - w / 2 - 16, y - h - 16, w + 32, h + 16, 4, shade(color, .7), 4); g.fillStyle = '#1a1210'; g.fillRect(x - w / 2, y - h, w, h);
  const dw = w * (1 - open * 0.75); rrect(g, x - w / 2, y - h, dw, h, 4, color, 4); for (let k = 0; k < 2; k++) rrect(g, x - w / 2 + dw * 0.15, y - h + 30 + k * h * 0.48, dw * 0.7, h * 0.4, 4, shade(color, .9), 2.5); ell(g, x - w / 2 + dw * 0.86, y - h * 0.48, 9, 9, '#d9a93a', 2.5); };
F_.counter = (g, x0, x1, y, { color = '#c8b89a', top = '#e8e2d4', h = 330 } = {}) => { rrect(g, x0, y - h, x1 - x0, h, 6, color, 4); for (let x = x0 + 16; x < x1 - 120; x += 170) { rrect(g, x, y - h + 60, 150, h - 80, 6, shade(color, .92), 3); ell(g, x + 75, y - h + 80, 20, 5, '#8a8a90', 2); } rrect(g, x0 - 16, y - h - 28, x1 - x0 + 32, 32, 6, top, 4); return { top: y - h - 28 }; };
F_.fridge = (g, x, y, { color = '#e8ecee', w = 230, h = 620 } = {}) => { rrect(g, x - w / 2, y - h, w, h, 24, color, 4); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x - w / 2, y - h * 0.62); g.lineTo(x + w / 2, y - h * 0.62); g.stroke(); for (const yy of [y - h * 0.8, y - h * 0.48]) rrect(g, x + w / 2 - 34, yy, 14, 70, 6, '#b8bcc4', 2.5); };
F_.streetLamp = (g, x, y, { on = false, h = 520 } = {}) => { g.fillStyle = '#2e3236'; g.fillRect(x - 8, y - h, 16, h); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(x - 8, y - h, 16, h); rrect(g, x - 26, y - 20, 52, 20, 4, '#2e3236', 3);
  if (on) glow(g, x, y - h - 40, 260, '255,214,140', 0.6); poly(g, [[x - 30, y - h], [x + 30, y - h], [x + 22, y - h - 60], [x - 22, y - h - 60]]); fillInk(g, on ? '#ffe6a0' : '#d8d0b8', 3); poly(g, [[x - 36, y - h - 60], [x + 36, y - h - 60], [x, y - h - 86]]); fillInk(g, '#2e3236', 3); };
F_.firewood = (g, x, y, { rows = 4, cols = 4 } = {}) => { const r = rng(77); for (let row = 0; row < rows; row++) for (let i = 0; i < cols - (row > 1 ? 1 : 0); i++) { const px = x + i * 30 + (row % 2) * 15, py = y - row * 28 - 14; ell(g, px, py, 16, 14, '#c99a62', 2.5); g.strokeStyle = 'rgba(120,70,30,.6)'; g.lineWidth = 1.5; g.beginPath(); g.arc(px, py, 7 + r() * 3, 0, 7); g.stroke(); } };
F_.calendar = (g, x, y, opts2 = {}) => { const { w = 150, h = 170, label = null, color = '#c23a2e' } = opts2; rrect(g, x, y, w, h, 6, '#fbf6ea', 3.5); g.fillStyle = color; g.fillRect(x + 2, y + 2, w - 4, h * 0.24); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(x, y, w, h * 0.24 + 2);
  for (const k of [0.3, 0.7]) ell(g, x + w * k, y, 6, 10, '#8a8a90', 2);
  if (label) { text(g, label, x + w / 2, y + h * 0.63, { size: h * 0.36, maxW: w * 0.86, font: 'display' }); if (opts2.month) text(g, opts2.month, x + w / 2, y + h * 0.12, { size: h * 0.12, color: '#ffffff', maxW: w * 0.8 }); }
  else { g.fillStyle = 'rgba(42,28,22,.5)'; for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++) g.fillRect(x + 14 + i * (w - 28) / 5, y + h * 0.34 + j * h * 0.15, (w - 28) / 5 - 6, h * 0.1); } };
F_.radiator = (g, x, y, { w = 200, h = 150 } = {}) => { for (let i = 0; i < w / 24; i++) rrect(g, x + i * 24, y - h, 20, h, 8, '#e8e4dc', 2.5); };
/** paper poster with a German title + lines; draw(g, x, y, w, h) adds a picture area */
F_.poster = (g, x, y, w, h, { title = '', lines = [], bg = '#f6efe0', color = INK, accent = '#c23a2e', pic = null, rot = 0 } = {}) => {
  g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(rot); g.translate(-w / 2, -h / 2);
  g.fillStyle = 'rgba(40,20,10,.18)'; g.fillRect(6, 8, w, h); rrect(g, 0, 0, w, h, 4, bg, 3.5);
  if (title) { g.fillStyle = accent; g.fillRect(10, 10, w - 20, h * 0.2); text(g, title, w / 2, 10 + h * 0.1, { size: h * 0.11, color: '#ffffff', maxW: w - 34, font: 'display' }); }
  if (pic) { g.save(); g.beginPath(); g.rect(16, h * 0.26, w - 32, h * 0.42); g.clip(); pic(g, 16, h * 0.26, w - 32, h * 0.42); g.restore(); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(16, h * 0.26, w - 32, h * 0.42); }
  lines.forEach((l, i) => text(g, l, w / 2, (pic ? h * 0.76 : h * 0.34) + i * h * 0.09, { size: h * 0.065, color, weight: '600', maxW: w - 30 }));
  for (const px of [14, w - 14]) ell(g, px, 12, 6, 6, '#c23a2e', 2); g.restore(); };
/** wooden sign board (shop sign, door sign) — German text */
F_.sign = (g, x, y, w, h, label, { bg = '#7a4a26', color = '#f6e2b0', border = '#e2b84c', hang = true, font = 'serif' } = {}) => {
  if (hang) { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x + w * 0.2, y - 40); g.lineTo(x + w * 0.2, y); g.moveTo(x + w * 0.8, y - 40); g.lineTo(x + w * 0.8, y); g.stroke(); }
  rrect(g, x, y, w, h, h * 0.18, bg, 4); g.save(); g.beginPath(); g.roundRect(x, y, w, h, h * 0.18); g.clip(); paint(g, x, y, w, h, [shade(bg, .8), mixc(bg, '#fff', .15)], 60, 3, 3, 20, .3); g.restore();
  g.strokeStyle = border; g.lineWidth = 4; g.beginPath(); g.roundRect(x + 8, y + 8, w - 16, h - 16, h * 0.12); g.stroke();
  text(g, label, x + w / 2, y + h / 2 + 2, { size: h * 0.48, color, font, maxW: w - 40, outline: shade(bg, .5), outlineW: 5 }); };
/** sticky note with handwriting */
F_.note = (g, x, y, label, { color = '#f6e27a', s = 1, rot = -0.06 } = {}) => { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.fillStyle = 'rgba(40,20,10,.18)'; g.fillRect(4, 5, 110, 110);
  g.fillStyle = color; g.fillRect(0, 0, 110, 110); g.strokeStyle = rgba(INK, .6); g.lineWidth = 2; g.strokeRect(0, 0, 110, 110); g.fillStyle = shade(color, .9); g.fillRect(0, 0, 110, 16);
  text(g, label, 55, 62, { size: 22, font: 'hand', color: '#2a2a6a', maxW: 94 }); g.restore(); };
/** chalkboard with German lines */
F_.chalkboard = (g, x, y, w, h, lines = [], { frame = '#8a5530' } = {}) => { rrect(g, x - 14, y - 14, w + 28, h + 28, 6, frame, 4); g.fillStyle = '#2f4a3e'; g.fillRect(x, y, w, h); g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); paint(g, x, y, w, h, ['#3e5a4c', '#26403a', '#8aa89a'], 120, 5, 10, 60, .12); g.restore();
  lines.forEach((l, i) => text(g, l, x + w / 2, y + h * 0.2 + i * h * 0.2, { size: h * 0.12, font: 'hand', weight: 'normal', color: 'rgba(240,240,230,.9)', maxW: w - 40 })); };
K.F = F_; K.clockHands = clockHands;
Object.assign(K, { wall, ceiling, floor, rug, sky, mountains, house, tree, stoneWall, landscape, window: windowFrame });
/** full-frame outdoor scene: sky, mountains, village row, ground. Returns { groundY } */
K.outdoor = (g, { season = 'winter', time = 'day', groundY = 820, village = true, seed = 7, path = true } = {}) => {
  const snowy = season === 'winter', night = time === 'night', r = rng(seed);
  sky(g, 0, 0, W, groundY, { time, seed }); mountains(g, 0, 60, W, groundY * 0.55, { season, time, seed });
  const gc = snowy ? ['#eef2f8', '#d2dcee'] : season === 'autumn' ? ['#c8a050', '#a87a3a'] : ['#8cc060', '#6a9a48'];
  let gr = g.createLinearGradient(0, groundY - 120, 0, H); gr.addColorStop(0, night ? mixc(gc[0], '#2a3458', .5) : gc[0]); gr.addColorStop(1, night ? mixc(gc[1], '#1a2040', .5) : gc[1]); g.fillStyle = gr; g.fillRect(0, groundY - 130, W, H);
  if (village) { for (let i = 0; i < 8; i++) { const hw = 150 + r() * 90, hh = hw * (0.6 + r() * 0.3), hx = -60 + i * 260 + r() * 60; house(g, hx, groundY - 130 - hh * 0.9, hw, hh, { snow: snowy, lit: night || r() > .6, seed: seed + i, style: r() > .3 ? 'stone' : 'plaster' }); }
    for (let i = 0; i < 5; i++) tree(g, 120 + i * 420 + r() * 80, groundY - 120, 1.1 + r() * 0.5, { type: snowy ? 'bare' : season === 'autumn' ? 'autumn' : 'leafy', snow: snowy, seed: seed + 30 + i }); }
  stoneWall(g, -20, W + 20, groundY - 70, { s: 1.6, snow: snowy, seed });
  if (path) { poly(g, [[W * 0.36, groundY - 40], [W * 0.62, groundY - 40], [W * 0.82, H], [W * 0.18, H]]); g.fillStyle = snowy ? '#e2e8f4' : season === 'autumn' ? '#b89a6a' : '#c8b48a'; g.fill();
    g.save(); g.clip(); paint(g, W * 0.18, groundY - 40, W * 0.64, H - groundY + 40, snowy ? ['#c8d4ea', '#ffffff'] : ['#a88a5a', '#d8c49a'], 400, seed, 6, 30, 0.2); g.restore(); }
  if (night) { g.fillStyle = 'rgba(20,30,70,.28)'; g.fillRect(0, 0, W, H); }
  return { groundY };
};

// >>> PERIOD KIT
// ======================================================================= SETS: period & maritime (northern Europe, c. 1900–1915)
// Painted, detailed building blocks for harbour towns, fortresses, cells, courtrooms, the open sea and islands.
// No electricity, no cars, no telephones: gas lamps, candles, sail and early steam. All deterministic (K.rng).
/** irregular masonry: blocks with lit tops, dark joints, damp stains and moss. opts: color, bw, bh, seed, damp (0..1), moss (0..1), mortar */
function stoneBlocks(g, x0, y0, x1, y1, { color = '#8a8a86', bw = 110, bh = 62, seed = 31, damp = 0.4, moss = 0.15, mortar = null, rough = 1 } = {}) {
  const r = rng(seed); g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
  g.fillStyle = mortar || shade(color, 0.55); g.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let y = y0 - r() * bh, row = 0; y < y1; y += bh, row++) {
    let x = x0 - (row % 2 ? bw * 0.5 : 0) - r() * bw * 0.3;
    while (x < x1) { const w = bw * (0.65 + r() * 0.7), h = bh * (0.86 + r() * 0.1), c = mixc(shade(color, 0.82 + r() * 0.3), ['#9a8a70', '#7a8890', '#8a8070'][(r() * 3) | 0], 0.18 * r());
      const P = new Path2D(), j = 5 * rough; P.moveTo(x + 4 + r() * j, y + 4 + r() * j); P.lineTo(x + w - 4 - r() * j, y + 3 + r() * j); P.lineTo(x + w - 3 - r() * j, y + h - 4 - r() * j); P.lineTo(x + 3 + r() * j, y + h - 3 - r() * j); P.closePath();
      g.fillStyle = c; g.fill(P); g.save(); g.clip(P); paint(g, x, y, w, h, [shade(c, 0.8), mixc(c, '#ffffff', 0.2), shade(c, 0.9)], 10, seed + (x | 0) + row * 97, 4, 18, 0.18);
      g.fillStyle = 'rgba(255,240,215,.16)'; g.fillRect(x, y, w, 7); g.fillStyle = 'rgba(20,15,10,.22)'; g.fillRect(x, y + h - 10, w, 12); g.restore();
      g.strokeStyle = rgba(INK, 0.45); g.lineWidth = 2; g.stroke(P); x += w; }
  }
  if (damp) for (let i = 0; i < (x1 - x0) / 140 * damp + 1; i++) { const dx = x0 + r() * (x1 - x0), dy = y0 + r() * (y1 - y0) * 0.6, dh = 80 + r() * 260, gr = g.createLinearGradient(0, dy, 0, dy + dh);
    gr.addColorStop(0, 'rgba(40,46,40,0)'); gr.addColorStop(0.3, `rgba(40,46,40,${0.2 + r() * 0.15})`); gr.addColorStop(1, 'rgba(40,46,40,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(dx, dy + dh / 2, 26 + r() * 40, dh / 2, 0, 0, 7); g.fill(); }
  if (moss) for (let i = 0; i < (x1 - x0) / 60 * moss; i++) { g.fillStyle = `rgba(${80 + r() * 30},${110 + r() * 30},60,${0.25 + r() * 0.3})`; g.beginPath(); g.ellipse(x0 + r() * (x1 - x0), y1 - r() * (y1 - y0) * 0.3, 6 + r() * 16, 3 + r() * 6, 0, 0, 7); g.fill(); }
  g.restore();
}
/** red-brown north-German brick with dark headers and soft dirt */
function bricks(g, x0, y0, x1, y1, { color = '#9a4a32', bw = 46, bh = 18, seed = 7, soot = 0.25 } = {}) {
  const r = rng(seed); g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip(); g.fillStyle = '#c8b8a0'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let y = y0, row = 0; y < y1; y += bh, row++) for (let x = x0 - (row % 2 ? bw / 2 : 0); x < x1; x += bw) { const k = 0.82 + r() * 0.3, c = r() < 0.12 ? shade(color, 0.6) : shade(color, k); g.fillStyle = c; g.fillRect(x + 1.5, y + 1.5, bw - 3, bh - 3); }
  if (soot) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, `rgba(30,20,20,${soot})`); gr.addColorStop(0.5, 'rgba(30,20,20,0)'); gr.addColorStop(1, `rgba(30,20,20,${soot * 0.8})`); g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0); }
  paint(g, x0, y0, x1 - x0, y1 - y0, ['#5a3020', '#c88a6a', '#3a2a24'], Math.round((x1 - x0) * (y1 - y0) / 1600), seed + 3, 10, 60, 0.06);
  g.restore();
}
/** perspective cobblestones between y0 and y1 */
function cobbles(g, y0, y1, { color = '#8a8278', seed = 12, x0 = 0, x1 = W, wet = 0 } = {}) {
  const r = rng(seed); g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip(); g.fillStyle = shade(color, 0.6); g.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let y = y0; y < y1;) { const k = (y - y0) / (y1 - y0), sh = 7 + k * 26, sw = sh * 1.5; for (let x = x0 - r() * sw; x < x1; x += sw * (0.9 + r() * 0.25)) { const c = shade(color, 0.8 + r() * 0.35);
      g.fillStyle = c; g.beginPath(); g.ellipse(x, y + sh / 2, sw * 0.46, sh * 0.42, 0, 0, 7); g.fill(); g.fillStyle = `rgba(255,240,220,${0.12 + wet * 0.2})`; g.beginPath(); g.ellipse(x - sw * 0.1, y + sh * 0.3, sw * 0.25, sh * 0.14, 0, 0, 7); g.fill(); } y += sh * 0.92; }
  const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(30,25,30,.45)'); gr.addColorStop(0.35, 'rgba(30,25,30,0)'); g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0); g.restore();
}
/** rich sky: time = night | dawn | day | golden | dusk | overcast | fog | storm. opts: moon [x,y,r], stars (count), seed */
const SKY2 = { night: ['#0c1430', '#1e2c58', '#3a4c7c'], dawn: ['#3e4c80', '#c88a8a', '#f4c890'], day: ['#6a9ad4', '#a8c8e8', '#e4eef6'], golden: ['#7a7ab0', '#e8a070', '#f8d8a0'],
  dusk: ['#2a2c5a', '#8a5a7a', '#e88a5a'], overcast: ['#8a94a4', '#b4bcc6', '#d4d8dc'], fog: ['#9aa4ac', '#b8c0c4', '#cfd4d4'], storm: ['#3a4250', '#5a6270', '#7a828a'] };
function sky2(g, x, y, w, h, { time = 'day', moon = null, stars = null, seed = 5, clouds = true } = {}) {
  const c = SKY2[time] || SKY2.day, gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, c[0]); gr.addColorStop(0.55, c[1]); gr.addColorStop(1, c[2]); g.fillStyle = gr; g.fillRect(x, y, w, h);
  const r = rng(seed);
  const ns = stars ?? (time === 'night' ? Math.round(w * h / 3000) : time === 'dawn' || time === 'dusk' ? Math.round(w * h / 20000) : 0);
  for (let i = 0; i < ns; i++) { const sx = x + r() * w, sy = y + Math.pow(r(), 1.4) * h * 0.85, a = (0.35 + r() * 0.65) * (1 - (sy - y) / h * 0.6); g.fillStyle = `rgba(255,252,235,${a})`; g.beginPath(); g.arc(sx, sy, 0.6 + r() * 1.6, 0, 7); g.fill(); }
  if (moon) { const [mx, my, mr] = moon; glow(g, mx, my, mr * 6, '200,215,255', 0.35); glow(g, mx, my, mr * 2.2, '235,240,255', 0.4); ell(g, mx, my, mr, mr, '#f4f0dc', 0); g.fillStyle = 'rgba(190,180,150,.45)'; for (const [a, b, cc] of [[-.3, -.2, .2], [.25, .22, .13], [-.08, .38, .1], [.35, -.3, .08]]) { g.beginPath(); g.arc(mx + a * mr, my + b * mr, cc * mr, 0, 7); g.fill(); } }
  if (clouds) { const cc = { night: 'rgba(70,84,130,.45)', dawn: 'rgba(250,200,180,.55)', golden: 'rgba(255,220,190,.6)', dusk: 'rgba(200,120,130,.45)', overcast: 'rgba(240,242,246,.5)', fog: 'rgba(230,234,236,.5)', storm: 'rgba(60,64,74,.6)' }[time] || 'rgba(255,255,255,.75)';
    for (let i = 0; i < 3 + w / 300; i++) { const cx = x + r() * w, cy = y + h * (0.08 + r() * 0.5), s = (0.6 + r()) * 1.3; g.fillStyle = cc; for (let k = 0; k < 7; k++) { g.beginPath(); g.ellipse(cx + (k - 3) * 40 * s, cy - Math.sin(k / 6 * Math.PI) * 18 * s + r() * 6, 60 * s, 16 * s, 0, 0, 7); g.fill(); } } }
}
/** static painted sea between y and y+h (gradient + wave dashes). time as sky2 */
function sea(g, x, y, w, h, { time = 'day', seed = 9, color = null, calm = 0.5 } = {}) {
  const C = { night: ['#1a2a4a', '#0a1426'], dawn: ['#6a7a9a', '#2a3a5a'], day: ['#5a8aaa', '#2a5a78'], golden: ['#a88a7a', '#3a5a72'], dusk: ['#5a4a6a', '#1a2440'], overcast: ['#7a8a94', '#3e4e5a'], fog: ['#9aa4a8', '#5a6a72'], storm: ['#4a5660', '#1e2a32'] }[time] || ['#5a8aaa', '#2a5a78'];
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, color ? color[0] : C[0]); gr.addColorStop(1, color ? color[1] : C[1]); g.fillStyle = gr; g.fillRect(x, y, w, h);
  const r = rng(seed); g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.lineCap = 'round';
  for (let i = 0; i < w * h / 2200; i++) { const v = Math.pow(r(), 1.6), yy = y + v * h, len = 8 + v * 70 * (1.2 - calm * 0.5), xx = x + r() * w;
    g.strokeStyle = r() > 0.45 ? `rgba(255,255,255,${0.06 + v * 0.12})` : `rgba(0,10,30,${0.08 + v * 0.14})`; g.lineWidth = 1 + v * 3.5; g.beginPath(); g.moveTo(xx, yy); g.quadraticCurveTo(xx + len / 2, yy - 2 - v * 4, xx + len, yy); g.stroke(); }
  g.restore();
}
/** animated wave glints and swell lines over a sea rect (call in draw) */
function waves(g, x, y, w, h, t, { time = 'day', n = 70, seed = 4, speed = 1, a = 1 } = {}) {
  const r = rng(seed), light = time === 'night' ? '200,215,255' : time === 'golden' || time === 'dusk' || time === 'dawn' ? '255,220,170' : '255,255,255';
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const v = Math.pow(r(), 1.5), ph = r() * 6.28, bx = r() * w, yy = y + v * h + Math.sin(t * 0.8 * speed + ph) * (2 + v * 6), xx = x + ((bx + t * (8 + v * 20) * speed) % w), len = 12 + v * 80;
    const al = (0.25 + 0.75 * Math.max(0, Math.sin(t * 0.9 * speed + ph))) * (0.1 + v * 0.25) * a; g.strokeStyle = `rgba(${light},${al})`; g.lineWidth = 1.2 + v * 3; g.beginPath(); g.moveTo(xx, yy); g.quadraticCurveTo(xx + len / 2, yy - 3 - v * 4, xx + len, yy); g.stroke(); }
  g.restore();
}
/** drifting fog banks (call in draw); rect [x,y,w,h] */
function fog(g, rect, t, { a = 0.35, seed = 8, n = 9, color = '230,234,238', speed = 6 } = {}) {
  const [x, y, w, h] = rect, r = rng(seed); g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  for (let i = 0; i < n; i++) { const cy = y + r() * h, cw = 300 + r() * 600, ch = 40 + r() * 90, cx = x + ((r() * (w + cw) + t * speed * (0.6 + r())) % (w + cw)) - cw / 2, gr = g.createRadialGradient(cx, cy, 0, cx, cy, cw / 2);
    gr.addColorStop(0, `rgba(${color},${a * (0.5 + r() * 0.5)})`); gr.addColorStop(1, `rgba(${color},0)`); g.fillStyle = gr; g.save(); g.translate(cx, cy); g.scale(1, ch / cw * 2); g.translate(-cx, -cy); g.beginPath(); g.arc(cx, cy, cw / 2, 0, 7); g.fill(); g.restore(); }
  g.restore();
}
/** grey sea rock / island mass. w,h = size; opts: color, guano (0..1 white spots), seed, grass */
function rock(g, x, y, w, h, { color = '#7a7a78', guano = 0, seed = 3, grass = 0, wet = 0.4 } = {}) {
  const r = rng(seed), P = new Path2D(), n = 12; P.moveTo(x - w / 2, y);
  for (let i = 1; i < n; i++) { const u = i / n, px = x - w / 2 + u * w, py = y - h * Math.pow(Math.sin(u * Math.PI), 0.7) * (0.75 + r() * 0.35); P.lineTo(px, py); }
  P.lineTo(x + w / 2, y); P.closePath(); shape(g, P, color, [x - w / 2, y - h, x + w / 2, y], { ink: 4, shade: 0.45, hi: 0.18 });
  g.save(); g.clip(P); paint(g, x - w / 2, y - h, w, h, [shade(color, 0.7), mixc(color, '#ffffff', 0.25), shade(color, 0.85)], Math.round(w * h / 900), seed, 6, 40, 0.22);
  g.strokeStyle = rgba(INK, 0.35); g.lineWidth = 2.5; for (let i = 0; i < w / 50; i++) { const sx = x - w / 2 + r() * w, sy = y - r() * h * 0.8; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + (r() - 0.5) * 40, sy + 20 + r() * 40); g.stroke(); }
  if (wet) { const gr = g.createLinearGradient(0, y - h * 0.25, 0, y); gr.addColorStop(0, 'rgba(20,30,30,0)'); gr.addColorStop(1, `rgba(20,30,30,${wet})`); g.fillStyle = gr; g.fillRect(x - w / 2, y - h * 0.25, w, h * 0.25); }
  for (let i = 0; i < guano * w / 4; i++) { const gx = x - w / 2 + r() * w, gy = y - h * (0.3 + r() * 0.75); g.fillStyle = `rgba(245,243,232,${0.5 + r() * 0.4})`; g.beginPath(); g.ellipse(gx, gy, 2 + r() * 7, 1.5 + r() * 4, r() * 3, 0, 7); g.fill(); if (r() < 0.3) { g.fillRect(gx - 1, gy, 2.5, 6 + r() * 14); } }
  if (grass) for (let i = 0; i < grass * w / 3; i++) { const u = r(), gx = x - w / 2 + u * w, gy = y - h * Math.pow(Math.sin(u * Math.PI), 0.7) * 0.92 + r() * 10; g.strokeStyle = r() > 0.5 ? '#8a9a5a' : '#6a7a42'; g.lineWidth = 2; g.beginPath(); g.moveTo(gx, gy + 6); g.lineTo(gx + (r() - 0.5) * 10, gy - 10 - r() * 14); g.stroke(); }
  g.restore();
}
/** stone fortress on a rock (Grauwacht type). x = centre, y = waterline. opts: time, lit (window glow 0..1) */
function fortress(g, x, y, s = 1, { time = 'night', lit = 0.6, seed = 21, color = '#7c7e80' } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); const r = rng(seed), night = time === 'night' || time === 'dusk';
  rock(g, 0, 0, 1200, 300, { color: '#6c6c6a', seed: seed + 1, wet: 0.5 });
  const wallC = night ? shade(color, 0.7) : color, tw = (x0, x1, y0, y1, crenel = true) => { stoneBlocks(g, x0, y0, x1, y1, { color: wallC, bw: 46, bh: 24, seed: seed + x0, damp: 0.6, moss: 0.3 }); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(x0, y0, x1 - x0, y1 - y0);
    if (crenel) for (let cx = x0; cx < x1 - 10; cx += 40) { stoneBlocks(g, cx, y0 - 26, cx + 24, y0, { color: wallC, bw: 24, bh: 26, seed: cx, damp: 0, moss: 0 }); g.strokeRect(cx, y0 - 26, 24, 26); } };
  tw(-470, 470, -390, -200); tw(-300, 120, -560, -380); tw(160, 320, -640, -380); tw(-560, -400, -470, -200); tw(400, 540, -500, -200);
  // roofs (slate cones) and the keep
  for (const [cx, w2, top] of [[-480, 90, -470], [470, 80, -500], [240, 90, -640]]) { poly(g, [[cx - w2, top], [cx, top - 150], [cx + w2, top]]); g.fillStyle = night ? '#3a4050' : '#5a6070'; g.fill(); inkStroke(g, 4); g.save(); g.clip(); paint(g, cx - w2, top - 150, w2 * 2, 150, ['#2a3040', '#7a8090'], 30, cx | 0, 4, 18, 0.2); g.restore(); }
  // windows: slits, some lit
  for (let i = 0; i < 16; i++) { const wx = -440 + r() * 960, wy = -360 + r() * 180, on = r() < lit; if ((wx > -300 && wx < 120 && wy < -380) || wx > 540) continue; rrect(g, wx, wy, 12, 30, 5, on ? '#ffcf70' : '#1a1a20', 2); if (on && night) glow(g, wx + 6, wy + 15, 40, '255,200,110', 0.4); }
  for (let i = 0; i < 8; i++) { const wx = -280 + r() * 380, wy = -540 + r() * 140, on = r() < lit; rrect(g, wx, wy, 12, 28, 5, on ? '#ffcf70' : '#1a1a20', 2); if (on && night) glow(g, wx + 6, wy + 15, 40, '255,200,110', 0.35); }
  // landing stair and a small gate to the water
  poly(g, [[-140, -200], [-60, -200], [-20, -20], [-180, -20]]); g.fillStyle = shade(wallC, 0.85); g.fill(); inkStroke(g, 3); for (let k = 0; k < 8; k++) { g.strokeStyle = rgba(INK, .5); g.lineWidth = 2; g.beginPath(); g.moveTo(-140 - k * 5, -200 + k * 22); g.lineTo(-60 + k * 5, -200 + k * 22); g.stroke(); }
  g.beginPath(); g.moveTo(-130, -200); g.lineTo(-130, -260); g.arc(-100, -260, 30, Math.PI, 0); g.lineTo(-70, -200); g.closePath(); g.fillStyle = '#1a1614'; g.fill(); inkStroke(g, 3);
  g.restore();
}
/** three-masted sailing ship (barque). x = bow-stern centre at the waterline. opts: sails 'set'|'furled', hull, flip, seed */
function sailship(g, x, y, s = 1, { sails = 'furled', hull = '#2a2420', stripe = '#e8e0cc', flip = false, seed = 2, time = 'day' } = {}) {
  g.save(); g.translate(x, y); g.scale(s * (flip ? -1 : 1), s);
  const H = new Path2D(); H.moveTo(-430, -110); H.lineTo(380, -120); H.quadraticCurveTo(470, -128, 520, -170); H.quadraticCurveTo(470, -40, 360, 0); H.lineTo(-380, 0); H.quadraticCurveTo(-440, -40, -430, -110); H.closePath();
  shape(g, H, hull, [-440, -170, 520, 0], { ink: 4.5, shade: 0.4, hi: 0.18 }); g.save(); g.clip(H); g.fillStyle = stripe; g.fillRect(-460, -96, 1000, 14); for (let k = -380; k < 360; k += 46) { g.fillStyle = '#1a1614'; g.fillRect(k, -94, 16, 10); } g.fillStyle = 'rgba(140,60,40,.85)'; g.fillRect(-460, -18, 1000, 30); g.restore();
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(500, -160); g.lineTo(700, -260); g.stroke(); // bowsprit
  const masts = [[-260, 760], [60, 860], [330, 780]];
  g.strokeStyle = rgba(INK, 0.6); g.lineWidth = 1.6; for (const [mx, mh] of masts) { g.beginPath(); g.moveTo(mx, -120 - mh); g.lineTo(mx - 160, -120); g.moveTo(mx, -120 - mh); g.lineTo(mx + 160, -120); g.stroke(); }
  g.beginPath(); g.moveTo(330, -900); g.lineTo(700, -260); g.moveTo(60, -980); g.lineTo(330, -900); g.moveTo(-260, -880); g.lineTo(60, -980); g.stroke();
  for (const [mx, mh] of masts) { g.lineWidth = 12; g.strokeStyle = INK; g.beginPath(); g.moveTo(mx, -110); g.lineTo(mx, -120 - mh); g.stroke(); g.lineWidth = 8; g.strokeStyle = '#7a5434'; g.stroke();
    for (const [k, yw] of [[0.3, 190], [0.55, 160], [0.78, 120]]) { const yy = -120 - mh * k; g.lineWidth = 8; g.strokeStyle = INK; g.beginPath(); g.moveTo(mx - yw, yy); g.lineTo(mx + yw, yy); g.stroke(); g.lineWidth = 5; g.strokeStyle = '#6a4a2e'; g.stroke();
      if (sails === 'furled') { g.fillStyle = '#e8dcc0'; for (let fx = -yw + 10; fx < yw - 10; fx += 26) { g.beginPath(); g.ellipse(mx + fx + 13, yy + 6, 15, 8, 0, 0, 7); g.fill(); } g.strokeStyle = rgba(INK, .5); g.lineWidth = 1.5; g.beginPath(); g.moveTo(mx - yw + 10, yy + 12); g.lineTo(mx + yw - 10, yy + 12); g.stroke(); }
      else { const P = new Path2D(), y2 = yy + mh * 0.22; P.moveTo(mx - yw, yy); P.lineTo(mx + yw, yy); P.quadraticCurveTo(mx + yw * 1.08, (yy + y2) / 2, mx + yw * 1.02, y2); P.quadraticCurveTo(mx, y2 + 22, mx - yw * 1.02, y2); P.quadraticCurveTo(mx - yw * 1.08, (yy + y2) / 2, mx - yw, yy); P.closePath();
        shape(g, P, time === 'night' ? '#b8b4a4' : '#efe6cc', [mx - yw, yy, mx + yw, y2], { ink: 3, shade: 0.3, hi: 0.2 }); } } }
  ell(g, -260, -920, 10, 6, '#c03a2a', 2); g.restore();
}
/** early steamship: black hull, red boot-topping, tall funnel with a band, two masts. smoke drawn by caller (K.smoke) */
function steamship(g, x, y, s = 1, { hull = '#1e1c1e', band = '#c43a2a', flip = false, house = '#e8e0cc' } = {}) {
  g.save(); g.translate(x, y); g.scale(s * (flip ? -1 : 1), s);
  const H = new Path2D(); H.moveTo(-500, -150); H.lineTo(470, -160); H.quadraticCurveTo(530, -165, 560, -200); H.lineTo(520, -20); H.quadraticCurveTo(500, 0, 470, 0); H.lineTo(-440, 0); H.quadraticCurveTo(-510, -10, -520, -110); H.closePath();
  shape(g, H, hull, [-520, -200, 560, 0], { ink: 4.5, shade: 0.35, hi: 0.15 }); g.save(); g.clip(H); g.fillStyle = 'rgba(170,50,40,.95)'; g.fillRect(-560, -30, 1200, 40); g.fillStyle = '#e8e0cc'; g.fillRect(-560, -150, 1200, 8); for (let k = -420; k < 440; k += 40) ell(g, k, -110, 7, 7, '#d8d0b8', 2); g.restore();
  rrect(g, -260, -240, 440, 92, 6, house, 4); for (let k = -240; k < 170; k += 44) rrect(g, k, -222, 26, 26, 4, '#3a4a5a', 2.5); rrect(g, -120, -300, 200, 62, 6, house, 4);
  rrect(g, -60, -560, 90, 270, 8, '#2a2626', 4); g.fillStyle = band; g.fillRect(-60, -520, 90, 40); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(-60, -520, 90, 40); ell(g, -15, -560, 45, 10, '#151313', 3.5);
  g.strokeStyle = INK; g.lineWidth = 10; for (const mx of [-380, 360]) { g.beginPath(); g.moveTo(mx, -150); g.lineTo(mx, -720); g.stroke(); g.lineWidth = 6; g.beginPath(); g.moveTo(mx - 90, -560); g.lineTo(mx + 90, -560); g.stroke(); g.lineWidth = 10; }
  g.strokeStyle = rgba(INK, 0.55); g.lineWidth = 1.6; g.beginPath(); g.moveTo(-380, -720); g.lineTo(-520, -110); g.moveTo(-380, -720); g.lineTo(360, -720); g.moveTo(360, -720); g.lineTo(560, -200); g.stroke();
  g.restore();
}
/** chimney / funnel smoke, animated */
function smoke(g, x, y, t, { s = 1, a = 0.45, color = '90,86,90', wind = 1, n = 12 } = {}) {
  g.save(); for (let i = 0; i < n; i++) { const u = ((t * 0.12 + i / n) % 1), px = x + u * 360 * wind * s + Math.sin(u * 7 + i) * 20 * s, py = y - u * 260 * s, rr = (20 + u * 110) * s;
    g.fillStyle = `rgba(${color},${a * (1 - u) * (0.6 + 0.4 * Math.sin(i))})`; g.beginPath(); g.arc(px, py, rr, 0, 7); g.fill(); } g.restore();
}
/** Hanseatic brick warehouse with a stepped gable, loading doors and a hoist beam. (x, y) = bottom-left */
function warehouse(g, x, y, w, h, { color = '#9a4a32', seed = 4, sign = null, lit = 0, doors = true } = {}) {
  const r = rng(seed), steps = 5, gh = w * 0.55, P = new Path2D(); P.moveTo(x, y); P.lineTo(x, y - h);
  for (let i = 0; i < steps; i++) { const u0 = i / steps / 2, u1 = (i + 1) / steps / 2, yy = y - h - gh * (i + 1) / steps; P.lineTo(x + w * u0, yy); P.lineTo(x + w * u1, yy); }
  for (let i = steps - 1; i >= 0; i--) { const u0 = 1 - (i + 1) / steps / 2, u1 = 1 - i / steps / 2, yy = y - h - gh * (i + 1) / steps; P.lineTo(x + w * u0, yy); P.lineTo(x + w * u1, yy); }
  P.lineTo(x + w, y - h); P.lineTo(x + w, y); P.closePath();
  g.save(); g.clip(P); bricks(g, x, y - h - gh - 4, x + w, y, { color, seed, bw: Math.max(22, w / 14), bh: Math.max(9, w / 34) }); g.restore(); inkP(g, P, 4.5);
  const cols = 3, rows = Math.max(2, Math.round(h / (w * 0.32)));
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const cw = w / (cols * 2.2), ch = cw * 1.5, wx = x + w * (i + 0.5) / cols - cw / 2, wy = y - h + (j + 0.3) * h / rows;
    if (i === 1 && doors) { rrect(g, wx - 4, wy - 4, cw + 8, ch * 1.2, 3, '#4a3a2e', 3); g.strokeStyle = rgba(INK, .5); g.lineWidth = 2; g.beginPath(); g.moveTo(wx + cw / 2, wy); g.lineTo(wx + cw / 2, wy + ch * 1.1); g.stroke(); continue; }
    const on = r() < lit; g.beginPath(); g.moveTo(wx, wy + ch); g.lineTo(wx, wy + cw / 2); g.arc(wx + cw / 2, wy + cw / 2, cw / 2, Math.PI, 0); g.lineTo(wx + cw, wy + ch); g.closePath(); g.fillStyle = on ? '#ffcf78' : '#2a3038'; g.fill(); inkStroke(g, 3);
    if (on) glow(g, wx + cw / 2, wy + ch / 2, cw * 2, '255,200,120', 0.35); else { g.fillStyle = 'rgba(180,200,220,.25)'; g.fillRect(wx + 3, wy + cw / 2, cw * 0.3, ch * 0.4); } }
  for (let i = 0; i < 3; i++) { const yy = y - h - gh * (0.2 + i * 0.25); rrect(g, x + w / 2 - w * 0.05, yy, w * 0.1, w * 0.1, 3, '#3a3030', 2.5); }
  g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(x + w / 2, y - h - gh * 0.86); g.lineTo(x + w / 2, y - h - gh * 0.86 - 4); g.lineTo(x + w / 2 + w * 0.16, y - h - gh * 0.86 - 4); g.stroke(); g.strokeStyle = '#5a3a24'; g.lineWidth = 4; g.stroke();
  g.strokeStyle = rgba('#d8c8a0', 0.9); g.lineWidth = 2; g.beginPath(); g.moveTo(x + w / 2 + w * 0.15, y - h - gh * 0.86); g.lineTo(x + w / 2 + w * 0.15, y - h * 0.55); g.stroke();
  if (doors) { rrect(g, x + w * 0.38, y - h * 0.24, w * 0.24, h * 0.24, 4, '#5a3e2a', 4); g.strokeStyle = rgba(INK, .55); g.lineWidth = 2.5; for (let k = 1; k < 5; k++) { g.beginPath(); g.moveTo(x + w * 0.38 + k * w * 0.048, y - h * 0.24); g.lineTo(x + w * 0.38 + k * w * 0.048, y); g.stroke(); } }
  if (sign) { const sw = w * 0.8, sh = w * 0.1; rrect(g, x + (w - sw) / 2, y - h + 10, sw, sh, 4, '#2a3a2e', 4); text(g, sign, x + w / 2, y - h + 10 + sh / 2 + 1, { size: sh * 0.6, font: 'serif', color: '#e8d08a', maxW: sw - 20 }); }
}
/** Lübeck townhouse: plaster or brick, gable, door, windows with shutters. (x, y) = bottom-left */
function townhouse(g, x, y, w, h, { color = '#e8d8b8', brick = false, shutters = null, door = '#5a3a28', seed = 6, lit = 0, gable = 'curved', roof = '#8a4a34' } = {}) {
  const r = rng(seed), gh = w * 0.5, P = new Path2D(); P.moveTo(x, y); P.lineTo(x, y - h);
  if (gable === 'curved') { P.quadraticCurveTo(x, y - h - gh * 0.4, x + w * 0.2, y - h - gh * 0.5); P.quadraticCurveTo(x + w * 0.3, y - h - gh, x + w * 0.5, y - h - gh); P.quadraticCurveTo(x + w * 0.7, y - h - gh, x + w * 0.8, y - h - gh * 0.5); P.quadraticCurveTo(x + w, y - h - gh * 0.4, x + w, y - h); }
  else { P.lineTo(x + w / 2, y - h - gh); P.lineTo(x + w, y - h); }
  P.lineTo(x + w, y); P.closePath();
  if (brick) { g.save(); g.clip(P); bricks(g, x, y - h - gh, x + w, y, { color, seed, bw: Math.max(20, w / 12), bh: Math.max(8, w / 30) }); g.restore(); inkP(g, P, 4); }
  else { shape(g, P, color, [x, y - h - gh, x + w, y], { ink: 4, shade: 0.3, hi: 0.12 }); g.save(); g.clip(P); paint(g, x, y - h - gh, w, h + gh, [shade(color, 0.85), mixc(color, '#fff', 0.3)], Math.round(w * h / 1200), seed, 6, 30, 0.12); g.restore(); }
  const rows = Math.max(2, Math.round(h / (w * 0.45))), cols = w > 240 ? 3 : 2;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { if (j === rows - 1 && i === (cols === 3 ? 1 : 0)) continue; const cw = w / (cols * 2.4), ch = cw * 1.5, wx = x + w * (i + 0.5) / cols - cw / 2, wy = y - h + (j + 0.32) * h / rows, on = r() < lit;
    if (shutters) for (const sd of [-1, 1]) { rrect(g, sd < 0 ? wx - cw * 0.48 : wx + cw, wy, cw * 0.46, ch, 2, shutters, 2.5); g.strokeStyle = rgba(INK, .4); g.lineWidth = 1.5; for (let k = 1; k < 5; k++) { g.beginPath(); g.moveTo(sd < 0 ? wx - cw * 0.45 : wx + cw + 3, wy + k * ch / 5); g.lineTo(sd < 0 ? wx - 5 : wx + cw * 1.43, wy + k * ch / 5); g.stroke(); } }
    rrect(g, wx, wy, cw, ch, 2, on ? '#ffd080' : '#34404c', 3); g.strokeStyle = '#f2ead8'; g.lineWidth = 3; g.beginPath(); g.moveTo(wx + cw / 2, wy); g.lineTo(wx + cw / 2, wy + ch); g.moveTo(wx, wy + ch * 0.45); g.lineTo(wx + cw, wy + ch * 0.45); g.stroke(); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(wx, wy, cw, ch);
    if (on) glow(g, wx + cw / 2, wy + ch / 2, cw * 1.8, '255,200,120', 0.4); else { g.fillStyle = 'rgba(200,220,240,.25)'; g.fillRect(wx + 3, wy + 3, cw * 0.3, ch * 0.3); }
    rrect(g, wx - 4, wy + ch - 2, cw + 8, 7, 2, shade(color, 0.8), 2); }
  const dw = w * 0.2, dh = Math.min(h * 0.4, dw * 2.2), dx = x + w / 2 - dw / 2 + (cols === 2 ? -w * 0.25 : 0);
  g.beginPath(); g.moveTo(dx, y); g.lineTo(dx, y - dh + dw / 2); g.arc(dx + dw / 2, y - dh + dw / 2, dw / 2, Math.PI, 0); g.lineTo(dx + dw, y); g.closePath(); g.fillStyle = door; g.fill(); inkStroke(g, 3.5);
  g.strokeStyle = rgba(INK, .5); g.lineWidth = 2; g.strokeRect(dx + dw * 0.15, y - dh * 0.75, dw * 0.7, dh * 0.3); g.strokeRect(dx + dw * 0.15, y - dh * 0.4, dw * 0.7, dh * 0.3); ell(g, dx + dw * 0.8, y - dh * 0.45, 4, 4, '#d8b050', 1.5);
  rrect(g, dx - 10, y - 6, dw + 20, 8, 2, '#8a8478', 2);
  return { door: [dx + dw / 2, y], doorW: dw, doorH: dh };
}
/** period gas street lamp (cast iron post, glass lantern) */
function gasLamp(g, x, y, { on = true, s = 1 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); rrect(g, -18, -24, 36, 24, 4, '#26282a', 3); g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.moveTo(0, -20); g.lineTo(0, -330); g.stroke(); g.strokeStyle = '#33373a'; g.lineWidth = 7; g.stroke();
  rrect(g, -14, -160, 28, 20, 4, '#2a2c2e', 2.5); g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(-26, -318); g.lineTo(26, -318); g.stroke();
  const P = new Path2D(); P.moveTo(-26, -330); P.lineTo(-34, -400); P.lineTo(34, -400); P.lineTo(26, -330); P.closePath(); g.fillStyle = on ? '#ffe2a0' : '#9aa4aa'; g.fill(P); inkP(g, P, 3.5);
  if (on) { g.fillStyle = '#fff8e0'; g.beginPath(); g.ellipse(0, -362, 8, 14, 0, 0, 7); g.fill(); }
  poly(g, [[-42, -400], [0, -432], [42, -400]]); fillInk(g, '#26282a', 3.5); ell(g, 0, -436, 7, 7, '#26282a', 2.5); g.restore();
  if (on) { glow(g, x, y - 365 * s, 260 * s, '255,205,130', 0.5); glow(g, x, y - 365 * s, 80 * s, '255,235,190', 0.6); }
}
function barrel(g, x, y, s = 1, { color = '#8a5a34', side = false } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); const P = new Path2D(); P.moveTo(-44, -110); P.quadraticCurveTo(-56, -55, -44, 0); P.lineTo(44, 0); P.quadraticCurveTo(56, -55, 44, -110); P.closePath();
  shape(g, P, color, [-56, -110, 56, 0], { ink: 3.5, shade: 0.4, hi: 0.2 }); g.save(); g.clip(P); g.strokeStyle = rgba(INK, .35); g.lineWidth = 2; for (let k = -30; k <= 30; k += 15) { g.beginPath(); g.moveTo(k, -110); g.quadraticCurveTo(k * 1.25, -55, k, 0); g.stroke(); }
  for (const yy of [-92, -18]) { g.fillStyle = '#4a4440'; g.fillRect(-60, yy, 120, 10); } g.restore(); ell(g, 0, -110, 44, 10, shade(color, 1.1), 3); g.restore();
}
function crate(g, x, y, w = 110, h = 80, { color = '#a87a4a', label = null } = {}) {
  rrect(g, x, y - h, w, h, 3, color, 3.5); g.save(); g.beginPath(); g.rect(x, y - h, w, h); g.clip(); g.strokeStyle = rgba(INK, .35); g.lineWidth = 2; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x, y - h + k * h / 4); g.lineTo(x + w, y - h + k * h / 4); g.stroke(); }
  g.strokeStyle = shade(color, 0.7); g.lineWidth = 8; g.beginPath(); g.moveTo(x + 6, y - 6); g.lineTo(x + w - 6, y - h + 6); g.stroke(); g.restore(); if (label) text(g, label, x + w / 2, y - h / 2, { size: h * 0.22, font: 'mono', color: '#3a2a1a', maxW: w - 12 });
}
function ropeCoil(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); for (let k = 0; k < 5; k++) ell(g, 0, -k * 7, 60 - k * 4, 18 - k, k % 2 ? '#c8a870' : '#b8965c', 2.5); ell(g, 0, -36, 18, 6, '#6a5a3a', 2); g.restore(); }
function bollard(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); const P = new Path2D(); P.moveTo(-26, 0); P.lineTo(-22, -50); P.quadraticCurveTo(-36, -64, -30, -76); P.lineTo(30, -76); P.quadraticCurveTo(36, -64, 22, -50); P.lineTo(26, 0); P.closePath(); shape(g, P, '#3a3c40', [-36, -76, 36, 0], { ink: 3.5, hi: 0.25 }); g.restore(); }
/** wooden quay edge seen from the front (planks + posts), top at y */
function quay(g, x0, x1, y, { h = 80, color = '#6a5240', stone = true } = {}) {
  if (stone) stoneBlocks(g, x0, y, x1, y + h, { color: '#8a8478', bw: 70, bh: 34, seed: 55, damp: 0.8, moss: 0.4 }); else { g.fillStyle = color; g.fillRect(x0, y, x1 - x0, h); }
  g.fillStyle = shade(color, 1.1); g.fillRect(x0, y - 12, x1 - x0, 14); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y - 12); g.lineTo(x1, y - 12); g.moveTo(x0, y + 2); g.lineTo(x1, y + 2); g.stroke();
  for (let px = x0 + 40; px < x1; px += 180) { rrect(g, px, y - 4, 22, h + 60, 4, '#4a3a2c', 3); }
}
/** a small rowing boat seen from the side. (x,y) = waterline centre */
function rowboat(g, x, y, s = 1, { color = '#6a4a32', flip = false } = {}) {
  g.save(); g.translate(x, y); g.scale(s * (flip ? -1 : 1), s); const P = new Path2D(); P.moveTo(-200, -70); P.lineTo(200, -76); P.quadraticCurveTo(190, -10, 150, 6); P.lineTo(-150, 6); P.quadraticCurveTo(-200, -20, -200, -70); P.closePath();
  shape(g, P, color, [-200, -76, 200, 6], { ink: 4, shade: 0.4, hi: 0.2 }); g.save(); g.clip(P); g.strokeStyle = rgba(INK, .4); g.lineWidth = 2.5; for (const yy of [-50, -28]) { g.beginPath(); g.moveTo(-200, yy); g.lineTo(200, yy - 3); g.stroke(); } g.restore();
  g.fillStyle = shade(color, 1.2); g.fillRect(-196, -80, 392, 10); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(-196, -80, 392, 10); g.restore();
}
/** Rügen fishing cutter: wooden hull, mast with tan sail, wheelhouse-less deck with nets and fish crates. (x,y) = waterline centre. rock = roll angle */
function cutter(g, x, y, s = 1, { flip = false, sail = true, rock = 0, hull = '#5a4636', sailColor = '#b8743e' } = {}) {
  g.save(); g.translate(x, y); g.rotate(rock); g.scale(s * (flip ? -1 : 1), s);
  const P = new Path2D(); P.moveTo(-430, -170); P.quadraticCurveTo(0, -150, 400, -200); P.quadraticCurveTo(390, -60, 300, 0); P.lineTo(-330, 0); P.quadraticCurveTo(-420, -40, -430, -170); P.closePath();
  shape(g, P, hull, [-430, -200, 400, 0], { ink: 5, shade: 0.42, hi: 0.2 }); g.save(); g.clip(P); g.strokeStyle = rgba(INK, .35); g.lineWidth = 3; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(-440, -140 + k * 30); g.quadraticCurveTo(0, -122 + k * 30, 420, -170 + k * 34); g.stroke(); }
  g.fillStyle = '#e8dcc0'; g.fillRect(-440, -170, 900, 12); g.fillStyle = 'rgba(30,60,50,.8)'; g.fillRect(-440, -22, 900, 30); g.restore();
  text(g, 'SAS 14', -250, -110, { size: 30, font: 'serif', color: '#efe6cc' });
  // deck furniture behind the gunwale
  g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.moveTo(40, -160); g.lineTo(40, -820); g.stroke(); g.strokeStyle = '#7a5434'; g.lineWidth = 9; g.stroke();
  g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(40, -250); g.lineTo(-360, -230); g.stroke(); g.strokeStyle = '#6a4a2e'; g.lineWidth = 5; g.stroke();
  if (sail) { const S = new Path2D(); S.moveTo(46, -800); S.quadraticCurveTo(-120, -560, -350, -240); S.lineTo(40, -258); S.closePath(); shape(g, S, sailColor, [-350, -800, 46, -240], { ink: 4, shade: 0.35, hi: 0.2 });
    g.save(); g.clip(S); g.strokeStyle = rgba(INK, .25); g.lineWidth = 2; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(40, -740 + k * 90); g.lineTo(-380, -700 + k * 100); g.stroke(); } g.restore(); }
  g.strokeStyle = rgba(INK, .6); g.lineWidth = 2; g.beginPath(); g.moveTo(40, -820); g.lineTo(400, -200); g.moveTo(40, -820); g.lineTo(-420, -172); g.stroke();
  g.restore();
}
/** cutter deck seen from on board: planks, gunwale, mast foot, nets, fish crates. Full-frame interior-like set */
function deck(g, { time = 'day', seed = 13, y0 = 640 } = {}) {
  sky2(g, 0, 0, W, y0 + 60, { time, seed }); sea(g, 0, y0 - 140, W, 210, { time, seed });
  g.fillStyle = '#6a5440'; g.fillRect(0, y0 - 60, W, 70); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(-10, y0 - 60, W + 20, 70); for (let px = 60; px < W; px += 240) rrect(g, px, y0 - 90, 26, 110, 4, '#5a4432', 3);
  floor(g, { y0: y0 + 10, type: 'planks', color: '#9a7a56', vp: [W / 2, 200], seed, base: false });
  const r = rng(seed); g.fillStyle = 'rgba(40,30,20,.12)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse(r() * W, y0 + 40 + r() * 400, 30 + r() * 60, 8, 0, 0, 7); g.fill(); }
}
/** pile of fishing net with cork floats */
function netPile(g, x, y, s = 1, { color = '#6a7a6a', seed = 5 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); const r = rng(seed); const P = new Path2D(); P.moveTo(-150, 0); P.bezierCurveTo(-170, -70, -60, -120, 0, -96); P.bezierCurveTo(70, -130, 170, -70, 150, 0); P.closePath(); shape(g, P, color, [-170, -130, 170, 0], { ink: 3.5, shade: 0.45 });
  g.save(); g.clip(P); g.strokeStyle = rgba('#20281e', .45); g.lineWidth = 1.5; for (let k = -170; k < 170; k += 12) { g.beginPath(); g.moveTo(k, -130); g.lineTo(k + 60, 0); g.moveTo(k + 60, -130); g.lineTo(k, 0); g.stroke(); } g.restore();
  for (let i = 0; i < 9; i++) ell(g, -120 + r() * 240, -20 - r() * 70, 11, 7, '#c8743a', 2.5, r()); g.restore();
}
function fishCrate(g, x, y, s = 1, { n = 7, seed = 2 } = {}) { g.save(); g.translate(x, y); g.scale(s, s); const r = rng(seed); for (let i = 0; i < n; i++) ITEMS.fish(g, -60 + r() * 120, -72 + r() * 18, 0.7, { tilt: (r() - 0.5) * 0.6 }); crate(g, -90, 0, 180, 70, { color: '#8a6a44' }); g.restore(); }
/** stone stairwell inside a fortress (diagonal flight rising to the right) */
function stairwell(g, { color = '#6e6e6c', seed = 61, time = 'night' } = {}) {
  stoneBlocks(g, 0, 0, W, H, { color: shade(color, 0.8), bw: 120, bh: 64, seed, damp: 0.7, moss: 0.05 });
  const steps = 24, x0 = 120, y0 = 1000, dx = 70, dy = 35; // stair surface: y = y0 - (x - x0) / dx * dy
  poly(g, [[x0, y0 + 30], [x0 + steps * dx + 40, y0 - steps * dy + 30], [W + 40, H + 40], [x0, H + 40]]); g.fillStyle = shade(color, 0.45); g.fill();
  for (let i = steps - 1; i >= 0; i--) { const sx = x0 + i * dx, sy = y0 - i * dy; poly(g, [[sx, sy], [sx + dx + 6, sy], [sx + dx + 6, sy + dy], [sx, sy + dy]]); g.fillStyle = shade(color, 0.62 + (i % 3) * 0.03); g.fill(); inkStroke(g, 2, 0.6);
    poly(g, [[sx - 4, sy - 8], [sx + dx + 6, sy - 8], [sx + dx + 6, sy + 4], [sx - 4, sy + 4]]); g.fillStyle = mixc(color, '#d8c8a8', 0.3); g.fill(); inkStroke(g, 2.5); }
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.moveTo(x0, y0 + 40); g.lineTo(x0 + steps * dx, y0 - steps * dy + 40); g.lineTo(x0 + steps * dx, y0 - steps * dy + 120); g.lineTo(x0, y0 + 120); g.fill();
  // arched opening at the top (night sky)
  g.save(); g.beginPath(); g.moveTo(1620, 300); g.lineTo(1620, 110); g.arc(1730, 110, 110, Math.PI, 0); g.lineTo(1840, 300); g.closePath(); g.clip(); sky2(g, 1600, 0, 280, 320, { time, seed: 3 }); g.restore();
  g.beginPath(); g.moveTo(1620, 300); g.lineTo(1620, 110); g.arc(1730, 110, 110, Math.PI, 0); g.lineTo(1840, 300); inkStroke(g, 6);
}
/** prison cell interior. opts: window {x,y,w,h}, tally (count of marks), cracks (count), hole {x,y,r,open}, door x, time ('day'|'night'|'dawn'), straw bed x range, seed */
function cell(g, { win = { x: 1180, y: 150, w: 120, h: 90 }, tally = 0, cracks = 40, hole = null, door = 220, time = 'day', bed = [1240, 1700], bucket = 880, seed = 71, wallY = 800, color = '#8a8680', ceilingY = 70 } = {}) {
  const night = time === 'night';
  // ceiling slab with cracks
  stoneBlocks(g, 0, 0, W, ceilingY + 6, { color: shade(color, 0.7), bw: 260, bh: 40, seed: seed + 5, damp: 0.2, moss: 0 });
  stoneBlocks(g, 0, ceilingY, W, wallY, { color, bw: 120, bh: 64, seed, damp: 0.9, moss: 0.08 });
  g.fillStyle = 'rgba(20,16,14,.35)'; g.fillRect(0, ceilingY, W, 26);
  const r = rng(seed + 9); g.strokeStyle = rgba('#1a1412', 0.7); g.lineCap = 'round';
  for (let i = 0; i < cracks; i++) { let px = r() * W, py = ceilingY + r() * 30 - 26 + (i % 4 === 0 ? r() * 240 : 0); g.lineWidth = 1.5 + r() * 1.5; g.beginPath(); g.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (r() - 0.5) * 60; py += r() * 22; g.lineTo(px, py); } g.stroke(); }
  // small high window with bars
  const { x: wx, y: wy, w: ww, h: wh } = win; g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip(); sky2(g, wx, wy, ww, wh, { time: night ? 'night' : time === 'dawn' ? 'dawn' : 'overcast', seed: 4, stars: night ? 30 : 0 }); g.restore();
  g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(wx, wy, ww, wh); poly(g, [[wx - 16, wy + wh], [wx + ww + 16, wy + wh], [wx + ww + 6, wy + wh + 22], [wx - 6, wy + wh + 22]]); fillInk(g, shade(color, 0.75), 3);
  g.strokeStyle = '#2a2826'; g.lineWidth = 9; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(wx + k * ww / 4, wy - 4); g.lineTo(wx + k * ww / 4, wy + wh + 4); g.stroke(); }
  // tally marks (groups of five) scratched near the bed
  if (tally) { g.strokeStyle = 'rgba(230,224,210,.7)'; g.lineWidth = 3; const tx = bed[0] + 20, ty = 430; for (let i = 0; i < tally; i++) { const grp = (i / 5) | 0, k = i % 5, col = grp % 14, row = (grp / 14) | 0, bx = tx + col * 34, by = ty + row * 46;
      g.beginPath(); if (k < 4) { g.moveTo(bx + k * 6, by); g.lineTo(bx + k * 6 + 1, by + 32); } else { g.moveTo(bx - 4, by + 26); g.lineTo(bx + 26, by + 6); } g.stroke(); } }
  // floor: big worn flagstones in perspective
  floor(g, { y0: wallY, type: 'stone', color: shade(color, 0.72), seed: seed + 2, base: false });
  const fg = g.createLinearGradient(0, wallY, 0, wallY + 30); fg.addColorStop(0, 'rgba(10,8,6,.55)'); fg.addColorStop(1, 'rgba(10,8,6,0)'); g.fillStyle = fg; g.fillRect(0, wallY, W, 30);
  // iron door
  if (door != null) { rrect(g, door - 140, wallY - 470, 280, 476, 6, '#3a3632', 5); stoneBlocks(g, door - 160, wallY - 500, door + 160, wallY - 470, { color: shade(color, 0.85), bw: 60, bh: 30, seed: 4, damp: 0 });
    g.save(); g.beginPath(); g.rect(door - 132, wallY - 462, 264, 460); g.clip(); paint(g, door - 132, wallY - 462, 264, 460, ['#2a2622', '#5a4a3e', '#6a4a2e'], 120, 5, 6, 30, 0.25); g.restore();
    g.fillStyle = '#4a4440'; for (const yy of [wallY - 400, wallY - 200, wallY - 60]) { g.fillRect(door - 136, yy, 272, 18); g.strokeStyle = INK; g.lineWidth = 2.5; g.strokeRect(door - 136, yy, 272, 18); for (let k = 0; k < 7; k++) ell(g, door - 120 + k * 40, yy + 9, 4, 4, '#2a2826', 1.5); }
    rrect(g, door - 50, wallY - 360, 100, 50, 4, '#151312', 3); g.strokeStyle = '#3a3634'; g.lineWidth = 6; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(door - 50 + k * 25, wallY - 360); g.lineTo(door - 50 + k * 25, wallY - 310); g.stroke(); }
    rrect(g, door + 90, wallY - 250, 26, 60, 4, '#2a2826', 3); }
  // straw sack on a plank bunk
  if (bed) { const [b0, b1] = bed, by = wallY + 40; rrect(g, b0, by - 210, b1 - b0, 34, 4, '#6a5038', 4); for (const lx of [b0 + 20, b1 - 50]) rrect(g, lx, by - 180, 30, 180, 3, '#5a4230', 3.5);
    const P = new Path2D(); P.moveTo(b0 - 6, by - 206); P.bezierCurveTo(b0 - 10, by - 270, b0 + 60, by - 268, (b0 + b1) / 2, by - 262); P.bezierCurveTo(b1 - 60, by - 270, b1 + 10, by - 266, b1 + 6, by - 206); P.closePath(); shape(g, P, '#b8a070', [b0, by - 270, b1, by - 206], { ink: 4, shade: 0.35 });
    g.save(); g.clip(P); g.strokeStyle = 'rgba(120,96,50,.6)'; g.lineWidth = 2; for (let k = 0; k < 30; k++) { const sx = b0 + r() * (b1 - b0), sy = by - 260 + r() * 50; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + 20 + r() * 20, sy + (r() - 0.5) * 10); g.stroke(); } g.restore();
    g.strokeStyle = '#d8c080'; g.lineWidth = 2.5; for (let k = 0; k < 18; k++) { const sx = b0 + r() * (b1 - b0), sy = by - 206 + r() * 6; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + (r() - 0.5) * 30, sy + 10 + r() * 16); g.stroke(); }
    for (let k = 0; k < 24; k++) { const sx = b0 - 80 + r() * (b1 - b0 + 160), sy = wallY + 20 + r() * 160; g.strokeStyle = 'rgba(200,170,100,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + (r() - 0.5) * 40, sy + (r() - 0.5) * 8); g.stroke(); } }
  // wooden bucket
  if (bucket != null) { const bx = bucket, by = wallY + 110, P = new Path2D(); P.moveTo(bx - 52, by - 104); P.lineTo(bx + 52, by - 104); P.lineTo(bx + 42, by); P.lineTo(bx - 42, by); P.closePath(); shape(g, P, '#7a5a3a', [bx - 52, by - 104, bx + 52, by], { ink: 3.5, shade: 0.4 });
    for (const yy of [by - 84, by - 22]) { g.fillStyle = '#3a3634'; g.fillRect(bx - 52, yy, 104, 9); } ell(g, bx, by - 104, 52, 12, '#3a2a1e', 3); g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(bx, by - 104, 50, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); }
  // hole low in the wall (to the neighbour's tunnel)
  if (hole) { const { x: hx, y: hy, r: hr = 60, open = 1 } = hole; if (open > 0) { g.save(); g.beginPath(); g.ellipse(hx, hy, hr * 1.15, hr * 0.85, 0, 0, 7); g.fillStyle = '#0e0b0a'; g.fill(); inkStroke(g, 4); g.restore(); } }
}
/** a loose stone block (draw in front of a cell hole). u 0..1 pulls it out of the wall */
function looseStone(g, x, y, u = 0, { color = '#8a8680', r = 60 } = {}) {
  g.save(); g.translate(x + u * 40, y + u * 30); g.rotate(u * 0.25); const P = new Path2D(); P.roundRect(-r * 1.15, -r * 0.85, r * 2.3, r * 1.7, 10); shape(g, P, color, [-r * 1.15, -r * 0.85, r * 1.15, r * 0.85], { ink: 4, shade: 0.4, hi: 0.2 });
  g.save(); g.clip(P); paint(g, -r * 1.2, -r, r * 2.4, r * 2, [shade(color, 0.75), mixc(color, '#fff', 0.2)], 20, 8, 4, 16, 0.25); g.restore(); g.restore();
}
/** courtroom: panelled walls, tall windows with light, the judges' bench, railing, galleries. Returns key points */
function courtroom(g, { time = 'day', seed = 81, verdict = null, bench = true } = {}) {
  wall(g, { y1: 760, color: '#d8c6a4', seed, wainscot: { y: 470, color: '#6a4a30' } });
  g.save(); g.beginPath(); g.rect(0, 470, W, 290); g.clip(); for (let x = 20; x < W; x += 170) { rrect(g, x, 500, 140, 230, 6, '#5e4028', 3); rrect(g, x + 14, 514, 112, 202, 4, '#704c30', 2); } g.restore();
  for (const wx of [200, 620, 1300, 1720]) { const ww = 170, wy = 70, wh = 330; g.save(); g.beginPath(); g.moveTo(wx - ww / 2, wy + wh); g.lineTo(wx - ww / 2, wy + ww / 2); g.arc(wx, wy + ww / 2, ww / 2, Math.PI, 0); g.lineTo(wx + ww / 2, wy + wh); g.closePath(); g.clip(); sky2(g, wx - ww / 2, wy, ww, wh, { time: time === 'day' ? 'day' : time, seed: wx }); g.restore();
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(wx - ww / 2, wy + wh); g.lineTo(wx - ww / 2, wy + ww / 2); g.arc(wx, wy + ww / 2, ww / 2, Math.PI, 0); g.lineTo(wx + ww / 2, wy + wh); g.closePath(); g.stroke();
    g.strokeStyle = '#efe6d2'; g.lineWidth = 5; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx, wy + wh); for (let k = 1; k < 4; k++) { g.moveTo(wx - ww / 2, wy + ww / 2 + k * (wh - ww / 2) / 4); g.lineTo(wx + ww / 2, wy + ww / 2 + k * (wh - ww / 2) / 4); } g.stroke(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
    rrect(g, wx - ww / 2 - 14, wy + wh, ww + 28, 16, 3, '#c8b490', 3); }
  // eagle-less crest plaque above the bench
  ell(g, W / 2, 150, 90, 90, '#7a5a34', 5); ell(g, W / 2, 150, 70, 70, '#a8844a', 3); text(g, '§', W / 2, 152, { size: 90, font: 'serif', color: '#3a2a18' });
  floor(g, { y0: 760, type: 'planks', color: '#8a5a36', vp: [W / 2, 360], seed: seed + 4 });
  if (!bench) return { bench: [960, 360] };
  // judge's bench (raised)
  rrect(g, 560, 360, 800, 60, 6, '#4a3020', 5); const B = new Path2D(); B.rect(580, 410, 760, 360); shape(g, B, '#5e3c24', [580, 410, 1340, 770], { ink: 5, shade: 0.4, hi: 0.12 });
  for (let x = 610; x < 1320; x += 180) { rrect(g, x, 440, 150, 290, 6, '#6a4630', 3); rrect(g, x + 16, 456, 118, 258, 4, '#58391f', 2); }
  if (verdict) { poly(g, [[1040, 376], [1180, 368], [1186, 412], [1046, 418]]); fillInk(g, '#f2ead6', 2.5); }
  return { bench: [960, 360] };
}
/** low wooden railing / bar of the court (draw in front of characters) */
function railing(g, x0, x1, y, { h = 150, color = '#5e3c24' } = {}) {
  rrect(g, x0, y - h, x1 - x0, 22, 6, color, 4); rrect(g, x0, y - 30, x1 - x0, 18, 4, shade(color, 0.85), 3);
  for (let x = x0 + 30; x < x1 - 10; x += 46) { const P = new Path2D(); P.moveTo(x - 7, y - h + 22); P.quadraticCurveTo(x - 14, y - h * 0.55, x - 7, y - 30); P.lineTo(x + 7, y - 30); P.quadraticCurveTo(x + 14, y - h * 0.55, x + 7, y - h + 22); P.closePath(); shape(g, P, shade(color, 1.1), [x - 14, y - h, x + 14, y], { ink: 2.5, shade: 0.4 }); }
}
/** a wooden pew/bench seen from behind (draw in front of seated characters) */
function pew(g, x0, x1, y, { color = '#5e3c24' } = {}) { rrect(g, x0, y - 210, x1 - x0, 130, 8, color, 4); g.save(); g.beginPath(); g.rect(x0, y - 210, x1 - x0, 130); g.clip(); paint(g, x0, y - 210, x1 - x0, 130, [shade(color, .8), mixc(color, '#fff', .15)], 40, 3, 6, 30, 0.2); g.restore(); rrect(g, x0 + 10, y - 80, 20, 80, 3, shade(color, .8), 3); rrect(g, x1 - 30, y - 80, 20, 80, 3, shade(color, .8), 3); }
/** ruined lighthouse on a bare hill. (x, y) = base centre */
function lighthouseRuin(g, x, y, s = 1, { time = 'day', seed = 17 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); const night = time === 'night', c = night ? '#8e8c88' : '#d8d2c4';
  const P = new Path2D(); P.moveTo(-110, 0); P.lineTo(-70, -620); P.lineTo(-40, -640); P.lineTo(-20, -600); P.lineTo(10, -660); P.lineTo(36, -610); P.lineTo(70, -630); P.lineTo(110, 0); P.closePath();
  shape(g, P, c, [-110, -660, 110, 0], { ink: 5, shade: 0.45, hi: 0.2 }); g.save(); g.clip(P); stoneBlocks(g, -120, -680, 120, 0, { color: c, bw: 44, bh: 26, seed, damp: 0.5, moss: 0.4 }); g.fillStyle = 'rgba(30,30,40,.12)'; g.fillRect(20, -680, 100, 680);
  g.fillStyle = 'rgba(160,50,40,.55)'; g.fillRect(-120, -420, 240, 60); g.fillRect(-120, -220, 240, 60); g.restore(); inkP(g, P, 5);
  g.beginPath(); g.moveTo(-34, 0); g.lineTo(-34, -120); g.arc(0, -120, 34, Math.PI, 0); g.lineTo(34, 0); g.closePath(); g.fillStyle = '#1a1616'; g.fill(); inkStroke(g, 4);
  for (const [wx, wy] of [[-14, -320], [6, -500]]) { rrect(g, wx, wy, 22, 44, 8, '#1a1616', 3); }
  const r = rng(seed); for (let i = 0; i < 9; i++) { const bx = -150 + r() * 300, by = -10 + r() * 20; rrect(g, bx, by - 18, 34 + r() * 20, 20, 5, shade(c, 0.85), 3); }
  g.restore();
}
/** island hill (bare, grassy) seen from the sea: returns the hilltop point */
function hill(g, x0, x1, y, h, { color = '#8a9a5a', seed = 23, time = 'day' } = {}) {
  const r = rng(seed), P = new Path2D(); P.moveTo(x0, y); for (let i = 0; i <= 20; i++) { const u = i / 20; P.lineTo(lerp(x0, x1, u), y - h * Math.pow(Math.sin(u * Math.PI), 1.3) * (0.95 + r() * 0.08)); } P.lineTo(x1, y); P.closePath();
  const c = time === 'night' ? mixc(color, '#1a2440', 0.55) : color; shape(g, P, c, [x0, y - h, x1, y], { ink: 4.5, shade: 0.4, hi: 0.15 });
  g.save(); g.clip(P); paint(g, x0, y - h, x1 - x0, h, [shade(c, 0.75), mixc(c, '#f0e0a0', 0.25)], Math.round((x1 - x0) * h / 500), seed, 8, 40, 0.2);
  for (let i = 0; i < (x1 - x0) / 4; i++) { const gx = x0 + r() * (x1 - x0), gy = y - r() * h; g.strokeStyle = r() > 0.5 ? shade(c, 0.7) : mixc(c, '#f4e8b0', 0.35); g.lineWidth = 2; g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx + 4, gy - 12); g.stroke(); }
  for (let i = 0; i < (x1 - x0) / 120; i++) { const u = 0.1 + r() * 0.8; rock(g, lerp(x0, x1, u), y - h * Math.pow(Math.sin(u * Math.PI), 1.3) * r() * 0.8 + 10, 60 + r() * 60, 30 + r() * 30, { color: time === 'night' ? '#5a5e66' : '#8a8a84', seed: seed + i, wet: 0 }); }
  g.restore(); return [lerp(x0, x1, 0.5), y - h];
}
/** grass blades swaying in the wind (draw in front, animated) */
function grassFront(g, x0, x1, y, t, { n = 140, h = 70, color = '#7a8a48', seed = 5, wind = 1 } = {}) {
  const r = rng(seed); g.save(); g.lineCap = 'round'; for (let i = 0; i < n; i++) { const gx = x0 + r() * (x1 - x0), gh = h * (0.5 + r()), sway = Math.sin(t * 1.4 + gx * 0.01 + r() * 3) * 12 * wind + 10 * wind;
    g.strokeStyle = r() > 0.5 ? color : mixc(color, '#e8d890', 0.35); g.lineWidth = 2.5 + r() * 2; g.beginPath(); g.moveTo(gx, y + r() * 30); g.quadraticCurveTo(gx + sway * 0.3, y - gh * 0.5, gx + sway, y - gh); g.stroke(); } g.restore();
}
/** iron-bound treasure chest. open 0..1 lifts the lid; glow 0..1 shows the treasure light; dirt 0..1 covers it */
function chest(g, x, y, s = 1, { open = 0, glow: gl = 0, dirt = 0, t = 0 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const body = '#5a3e26', iron = '#3a3634', tar = '#2a201a';
  if (open > 0.05) { // treasure heap inside
    const gr = g.createLinearGradient(0, -200, 0, -120); g.save(); g.beginPath(); g.rect(-180, -230, 360, 110); g.clip();
    g.fillStyle = '#7a5a20'; g.fillRect(-180, -230, 360, 110); const r = rng(9);
    for (let i = 0; i < 160; i++) { const cx = -170 + r() * 340, cy = -200 + r() * 70 - Math.sin((cx + 180) / 360 * Math.PI) * 30; ell(g, cx, cy, 12, 7, r() > 0.15 ? (r() > 0.5 ? '#f2c84a' : '#d8a830') : '#fff0b0', 1.2); }
    for (const [cx, cy, c] of [[-90, -200, '#c8203a'], [40, -214, '#1a9a5a'], [110, -190, '#c8203a'], [-20, -186, '#2a6ad8'], [-140, -176, '#1a9a5a']]) { poly(g, [[cx, cy - 14], [cx + 12, cy], [cx, cy + 12], [cx - 12, cy]]); fillInk(g, c, 2); g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(cx - 3, cy - 8, 4, 5); }
    g.strokeStyle = '#f6f0e4'; g.lineWidth = 7; g.setLineDash([0.1, 11]); g.lineCap = 'round'; g.beginPath(); g.moveTo(-160, -170); g.quadraticCurveTo(-40, -230, 80, -176); g.quadraticCurveTo(140, -160, 170, -200); g.stroke(); g.setLineDash([]);
    g.restore(); if (gl) { glow(g, 0, -190, 240, '255,214,120', 0.35 * gl); glow(g, 0, -190, 90, '255,240,190', 0.3 * gl); for (let k = 0; k < 5; k++) { const ph = (t * 0.7 + k * 0.37) % 1; star(g, -140 + k * 66, -200 - Math.sin(k * 2) * 18, 9 * Math.sin(ph * Math.PI), ph * 3, `rgba(255,250,220,${Math.sin(ph * Math.PI) * gl})`); } } }
  const P = new Path2D(); P.roundRect(-190, -130, 380, 130, 8); shape(g, P, body, [-190, -130, 190, 0], { ink: 5, shade: 0.45, hi: 0.15 });
  g.save(); g.clip(P); g.strokeStyle = rgba(INK, .4); g.lineWidth = 2.5; for (const yy of [-90, -46]) { g.beginPath(); g.moveTo(-200, yy); g.lineTo(200, yy); g.stroke(); } g.fillStyle = 'rgba(20,12,8,.35)'; g.fillRect(-200, -130, 400, 14); g.restore();
  for (const bx of [-150, 130]) { rrect(g, bx, -134, 22, 138, 3, iron, 3); for (const yy of [-110, -60, -16]) ell(g, bx + 11, yy, 4, 4, '#8a8682', 1.5); }
  rrect(g, -200, -10, 400, 14, 3, iron, 3); rrect(g, -26, -116, 52, 56, 6, iron, 3); ell(g, 0, -86, 8, 10, '#151312', 1.5);
  // lid
  g.save(); g.translate(0, -130); const la = -open * 1.9; g.scale(1, Math.cos(-la * 0.95) * (open > 0.5 ? -1 : 1) * 0 + 1);
  const L = new Path2D(); const lh = 90 * Math.cos(Math.min(open, 0.98) * Math.PI / 2) + (open > 0 ? 0 : 0), ly = -lh;
  if (open < 0.98) { L.moveTo(-190, 0); L.lineTo(-190, ly + 20); L.quadraticCurveTo(0, ly - 30, 190, ly + 20); L.lineTo(190, 0); L.closePath(); shape(g, L, shade(body, 1.05), [-190, ly - 30, 190, 0], { ink: 5, shade: 0.4, hi: 0.2 }); for (const bx of [-150, 130]) rrect(g, bx, ly - 6, 22, -ly + 4, 3, iron, 3); }
  if (open > 0.02) { const bh = 130 * Math.sin(Math.min(open, 1) * Math.PI / 2) * 0.9; const B = new Path2D(); B.moveTo(-196, -4); B.lineTo(-206, -bh); B.quadraticCurveTo(0, -bh - 40, 206, -bh); B.lineTo(196, -4); B.closePath(); shape(g, B, shade(body, 0.8), [-206, -bh - 40, 206, 0], { ink: 5, shade: 0.5 }); g.save(); g.clip(B); g.fillStyle = tar; g.globalAlpha = 0.5; g.fillRect(-210, -bh - 40, 420, bh + 40); g.restore(); for (const bx of [-150, 130]) rrect(g, bx, -bh - 8, 22, bh, 3, iron, 3); }
  g.restore();
  if (dirt) { g.fillStyle = rgba('#3a2e22', dirt); g.beginPath(); g.ellipse(0, -20, 240, 130 * dirt, 0, Math.PI, 0); g.fill(); }
  g.restore();
}
/** letter wrapped in waxed cloth, or the unwrapped sheet with text */
function waxBundle(g, x, y, s = 1, { open = 0, text: tx = '', t = 0 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (open < 1) { g.globalAlpha = 1 - open; const P = new Path2D(); P.roundRect(-80, -50, 160, 100, 14); shape(g, P, '#c8b070', [-80, -50, 80, 50], { ink: 4, shade: 0.35, hi: 0.35 }); g.strokeStyle = '#7a4a2a'; g.lineWidth = 6; g.beginPath(); g.moveTo(-80, 0); g.lineTo(80, 0); g.moveTo(0, -50); g.lineTo(0, 50); g.stroke(); ell(g, 0, 0, 14, 14, '#a8302a', 3); g.globalAlpha = 1; }
  if (open > 0) { g.globalAlpha = open; const P = new Path2D(); P.roundRect(-230, -150, 460, 300, 6); shape(g, P, '#f0e4c4', [-230, -150, 230, 150], { ink: 4, shade: 0.2, hi: 0.2 }); g.save(); g.clip(P); paint(g, -230, -150, 460, 300, ['#d8c098', '#fff4dc'], 60, 4, 10, 50, 0.2); g.restore();
    text(g, tx, 0, 0, { size: 30, font: 'hand', weight: 'normal', color: '#1e2048', maxW: 400, lineH: 1.45 }); g.globalAlpha = 1; }
  g.restore();
}
/** buried-in-grass rock with a weathered cross scratched in it */
function crossRock(g, x, y, s = 1, { time = 'night', seed = 12 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); rock(g, 0, 0, 380, 190, { color: time === 'night' ? '#7a7e88' : '#9a9a94', seed, wet: 0, grass: 0.4 });
  g.strokeStyle = 'rgba(30,28,30,.75)'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(-10, -150); g.lineTo(-4, -40); g.moveTo(-56, -106); g.lineTo(46, -100); g.stroke(); g.strokeStyle = 'rgba(230,230,240,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-4, -150); g.lineTo(2, -42); g.moveTo(-56, -100); g.lineTo(46, -94); g.stroke();
  g.restore();
}
/** heap of dug earth */
function earthHeap(g, x, y, w, h, { color = '#4a3a2a', seed = 3 } = {}) { const r = rng(seed), P = new Path2D(); P.moveTo(x - w / 2, y); P.quadraticCurveTo(x - w * 0.2, y - h * 1.1, x, y - h); P.quadraticCurveTo(x + w * 0.25, y - h * 1.05, x + w / 2, y); P.closePath(); shape(g, P, color, [x - w / 2, y - h, x + w / 2, y], { ink: 3.5, shade: 0.45 }); g.save(); g.clip(P); for (let i = 0; i < w / 6; i++) ell(g, x - w / 2 + r() * w, y - r() * h, 4 + r() * 8, 3 + r() * 5, r() > 0.5 ? shade(color, 0.7) : mixc(color, '#a08a6a', 0.3), 0); g.restore(); }
/** lecture hall in Heidelberg: panelled wall, big chalkboard with diagrams, lectern, tiered benches. Returns { board } */
function lectureHall(g, { seed = 91 } = {}) {
  wall(g, { y1: 820, color: '#cdb894', seed, wainscot: { y: 560, color: '#5a3e28' } });
  for (const wx of [140, 1780]) { g.save(); g.beginPath(); g.rect(wx - 90, 80, 180, 420); g.clip(); sky2(g, wx - 90, 80, 180, 420, { time: 'golden', seed: wx }); g.restore(); g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(wx - 90, 80, 180, 420); g.strokeStyle = '#efe6d2'; g.lineWidth = 6; g.beginPath(); g.moveTo(wx, 80); g.lineTo(wx, 500); g.moveTo(wx - 90, 290); g.lineTo(wx + 90, 290); g.stroke(); }
  rrect(g, 380, 120, 1160, 420, 8, '#6a4a30', 6); rrect(g, 400, 138, 1120, 384, 4, '#2e3a32', 4); g.save(); g.beginPath(); g.rect(400, 138, 1120, 384); g.clip(); paint(g, 400, 138, 1120, 384, ['#3e4a42', '#24302a', '#5a6a5e'], 120, 5, 20, 80, 0.2); g.restore();
  g.strokeStyle = 'rgba(240,240,230,.85)'; g.lineWidth = 3.5; g.lineCap = 'round';
  g.beginPath(); g.arc(560, 330, 70, 0, 7); g.stroke(); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.28; g.beginPath(); g.moveTo(560 + Math.cos(a) * 82, 330 + Math.sin(a) * 82); g.lineTo(560 + Math.cos(a) * 104, 330 + Math.sin(a) * 104); g.stroke(); }
  g.beginPath(); g.ellipse(560, 330, 190, 60, -0.2, 0, 7); g.stroke(); g.beginPath(); g.arc(735, 296, 14, 0, 7); g.stroke();
  text(g, 'F = G · m₁ · m₂ / r²', 1050, 210, { size: 44, font: 'serif', color: 'rgba(240,240,230,.9)', weight: 'normal' }); text(g, 'H₂O    NaCl', 1000, 300, { size: 40, font: 'serif', color: 'rgba(240,240,230,.85)', weight: 'normal' });
  g.beginPath(); for (let k = 0; k < 6; k++) { const sx = 1180 + k * 50, sy = 390 + Math.sin(k * 1.7) * 30; k ? g.lineTo(sx, sy) : g.moveTo(sx, sy); } g.stroke(); for (let k = 0; k < 6; k++) star(g, 1180 + k * 50, 390 + Math.sin(k * 1.7) * 30, 10, 0, 'rgba(240,240,230,.9)');
  rrect(g, 380, 534, 1160, 16, 3, '#7a5a3a', 3);
  floor(g, { y0: 820, type: 'planks', color: '#7a5032', vp: [W / 2, 300], seed: seed + 2 });
  return { board: [960, 330] };
}
function lectern(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); poly(g, [[-120, -330], [120, -350], [110, -300], [-110, -290]]); fillInk(g, '#6a4a30', 4); rrect(g, -90, -300, 180, 300, 6, '#5a3c26', 4); rrect(g, -70, -270, 140, 240, 4, '#6a4830', 2.5); ITEMS.book(g, 0, -340, 0.8, { tilt: -0.05 }); g.restore(); }
/** brick school house with big classroom windows and a gilded inscription band. (x, y) bottom-left. Returns window rects */
function schoolhouse(g, x, y, w, h, { sign = null, sub = null, time = 'day', lit = 0.5, seed = 33 } = {}) {
  bricks(g, x, y - h, x + w, y, { color: '#a4503a', seed, bw: 40, bh: 16, soot: 0.12 }); g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(x, y - h, w, h);
  poly(g, [[x - 40, y - h], [x + w / 2, y - h - 220], [x + w + 40, y - h]]); g.fillStyle = '#5a5a66'; g.fill(); inkStroke(g, 5); g.save(); g.clip(); for (let yy = y - h - 220; yy < y - h; yy += 18) { g.strokeStyle = 'rgba(30,30,40,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 40, yy); g.lineTo(x + w + 40, yy); g.stroke(); } g.restore();
  rrect(g, x + w / 2 - 50, y - h - 300, 100, 140, 6, '#c8b490', 4); ell(g, x + w / 2, y - h - 250, 30, 30, '#f2ead6', 3); clockHands(g, x + w / 2, y - h - 250, 24, 9.2);
  const wins = []; const nw = 4, ww = w / (nw * 1.6), wh = h * 0.42;
  for (let i = 0; i < nw; i++) { if (i === 1 || i === 2) { if (i === 1) continue; } const wx = x + w * (i + 0.5) / nw - ww / 2, wy = y - h + h * 0.12; g.fillStyle = time === 'night' ? '#ffd28a' : '#3a4656'; g.beginPath(); g.moveTo(wx, wy + wh); g.lineTo(wx, wy + ww / 2); g.arc(wx + ww / 2, wy + ww / 2, ww / 2, Math.PI, 0); g.lineTo(wx + ww, wy + wh); g.closePath(); g.fill(); inkStroke(g, 4); wins.push([wx, wy, ww, wh]);
    g.strokeStyle = '#efe6d2'; g.lineWidth = 5; g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.moveTo(wx, wy + wh * 0.55); g.lineTo(wx + ww, wy + wh * 0.55); g.stroke(); rrect(g, wx - 8, wy + wh, ww + 16, 14, 2, '#c8b490', 3); }
  const dw = w * 0.17, dh = h * 0.42, dx = x + w / 2 - dw / 2; g.beginPath(); g.moveTo(dx, y); g.lineTo(dx, y - dh + dw / 2); g.arc(dx + dw / 2, y - dh + dw / 2, dw / 2, Math.PI, 0); g.lineTo(dx + dw, y); g.closePath(); g.fillStyle = '#4a5a3a'; g.fill(); inkStroke(g, 4);
  g.strokeStyle = rgba(INK, .5); g.lineWidth = 2.5; g.beginPath(); g.moveTo(dx + dw / 2, y - dh + 10); g.lineTo(dx + dw / 2, y); g.stroke();
  for (let k = 0; k < 3; k++) rrect(g, dx - 30 - k * 16, y - 4 + k * 0, dw + 60 + k * 32, 0.1, 1, '#9a948a', 0);
  if (sign) { const sw = w * 0.86, sh = h * 0.2, sx = x + (w - sw) / 2, sy = y - dh - sh - 26; rrect(g, sx, sy, sw, sh, 6, '#2a2a30', 5); rrect(g, sx + 8, sy + 8, sw - 16, sh - 16, 4, '#1e1e24', 2);
    text(g, sign, x + w / 2, sy + sh * (sub ? 0.34 : 0.5), { size: sh * 0.36, font: 'serif', color: '#f0c860', maxW: sw - 40, outline: '#6a4a10', outlineW: 2 });
    if (sub) text(g, sub, x + w / 2, sy + sh * 0.74, { size: sh * 0.17, font: 'serif', color: '#e8c058', maxW: sw - 50, weight: 'normal' }); }
  return { wins, door: [dx + dw / 2, y], dw, dh };
}
/** timber scaffolding (building site) in front of a wall */
function scaffold(g, x0, x1, y, h) { g.strokeStyle = INK; g.lineWidth = 9; g.lineCap = 'butt'; for (let x = x0; x <= x1; x += 160) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h); g.stroke(); } for (let yy = y - 120; yy > y - h; yy -= 140) { g.beginPath(); g.moveTo(x0 - 10, yy); g.lineTo(x1 + 10, yy); g.stroke(); }
  g.strokeStyle = '#b08a5a'; g.lineWidth = 5; for (let x = x0; x <= x1; x += 160) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h); g.stroke(); } for (let yy = y - 120; yy > y - h; yy -= 140) { g.beginPath(); g.moveTo(x0 - 10, yy); g.lineTo(x1 + 10, yy); g.stroke(); rrect(g, x0, yy - 12, x1 - x0, 12, 2, '#c8a070', 2); } }
/** finger drawing in dust/sand: progressive strokes. strokes = [[[x,y],...], ...], u 0..1 reveals them in order */
function dustDraw(g, strokes, u, { color = 'rgba(235,225,200,.85)', w = 6, shadow = true } = {}) {
  const lens = strokes.map((s) => s.reduce((a, p, i) => i ? a + Math.hypot(p[0] - s[i - 1][0], p[1] - s[i - 1][1]) : 0, 0)), tot = lens.reduce((a, b) => a + b, 0) || 1; let left = u * tot;
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  for (let i = 0; i < strokes.length && left > 0; i++) { const s = strokes[i], take = Math.min(left, lens[i]); left -= lens[i]; let acc = 0; const path = [s[0]];
    for (let k = 1; k < s.length; k++) { const d = Math.hypot(s[k][0] - s[k - 1][0], s[k][1] - s[k - 1][1]); if (acc + d >= take) { const f = (take - acc) / (d || 1); path.push([lerp(s[k - 1][0], s[k][0], f), lerp(s[k - 1][1], s[k][1], f)]); break; } acc += d; path.push(s[k]); }
    if (shadow) { g.strokeStyle = 'rgba(20,14,10,.45)'; g.lineWidth = w + 3; g.beginPath(); path.forEach((p, k) => k ? g.lineTo(p[0] + 1.5, p[1] + 2) : g.moveTo(p[0] + 1.5, p[1] + 2)); g.stroke(); }
    g.strokeStyle = color; g.lineWidth = w; g.beginPath(); path.forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); }
  g.restore();
}
/** linen sack with a body shape inside; seam along the top, iron ball on a rope at one end. (x,y) = centre, rot radians. opts: tear 0..1, ball true, len */
function sack(g, x, y, s = 1, { rot = 0, tear = 0, ball = true, len = 520, bulge = 1, t = 0, wet = 0 } = {}) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); const L = len / 2;
  if (ball) { g.strokeStyle = '#8a7a5a'; g.lineWidth = 6; g.beginPath(); g.moveTo(L - 10, 10); g.quadraticCurveTo(L + 60, 40 + Math.sin(t * 2) * 6, L + 110, 30); g.stroke(); ell(g, L + 140, 30, 42, 42, '#2e2c2e', 4); g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(L + 126, 16, 10, 0, 7); g.fill(); }
  const P = new Path2D(); P.moveTo(-L, -10); P.bezierCurveTo(-L - 20, -90 * bulge, -L * 0.4, -110 * bulge, -L * 0.1, -86 * bulge); P.bezierCurveTo(L * 0.3, -70 * bulge, L * 0.8, -80 * bulge, L, -40); P.quadraticCurveTo(L + 26, 0, L, 36); P.bezierCurveTo(L * 0.5, 70, -L * 0.6, 80, -L, 56); P.quadraticCurveTo(-L - 30, 30, -L, -10); P.closePath();
  shape(g, P, wet ? mixc('#c8b48a', '#4a5a6a', wet) : '#c8b48a', [-L - 30, -110, L + 26, 80], { ink: 4.5, shade: 0.45, hi: 0.2 });
  g.save(); g.clip(P); g.strokeStyle = 'rgba(90,70,40,.3)'; g.lineWidth = 1.5; for (let k = -L; k < L; k += 10) { g.beginPath(); g.moveTo(k, -120); g.lineTo(k + 8, 90); g.stroke(); } g.restore();
  g.strokeStyle = '#5a4a32'; g.lineWidth = 3; g.setLineDash([10, 8]); g.beginPath(); g.moveTo(-L + 20, -30); g.bezierCurveTo(-L * 0.4, -70 * bulge, L * 0.4, -54 * bulge, L - 20, -26); g.stroke(); g.setLineDash([]);
  if (tear > 0) { g.fillStyle = '#0e1a2a'; g.beginPath(); g.ellipse(-L * 0.3, -40, 80 * tear, 30 * tear, -0.2, 0, 7); g.fill(); inkStroke(g, 3); }
  g.restore();
}
/** air bubbles rising (underwater) */
function bubbles(g, x, y, t, { n = 14, spread = 60, rise = 500, s = 1, seed = 3, a = 0.7 } = {}) {
  const r = rng(seed); g.save(); for (let i = 0; i < n; i++) { const ph = r(), sp = 0.5 + r(), u = (t * 0.25 * sp + ph) % 1, bx = x + (r() - 0.5) * spread + Math.sin(t * 3 + i) * 8, by = y - u * rise, rr = (3 + r() * 9) * s;
    g.strokeStyle = `rgba(210,235,255,${a * (1 - u)})`; g.lineWidth = 2; g.beginPath(); g.arc(bx, by, rr, 0, 7); g.stroke(); g.fillStyle = `rgba(255,255,255,${0.5 * a * (1 - u)})`; g.beginPath(); g.arc(bx - rr * 0.35, by - rr * 0.35, rr * 0.25, 0, 7); g.fill(); } g.restore();
}
/** underwater backdrop: deep blue gradient, light rays from the surface, floating particles */
function underwater(g, { seed = 5, surface = 0 } = {}) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1e4a6e'); gr.addColorStop(0.5, '#0f2a48'); gr.addColorStop(1, '#060f20'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const r = rng(seed); for (let i = 0; i < 7; i++) { const x = r() * W; beam(g, [[x - 40, surface], [x + 60, surface], [x + 260 + r() * 100, H], [x + 40, H]], { color: '150,200,240', a: 0.08 + r() * 0.06 }); }
  for (let i = 0; i < 200; i++) { g.fillStyle = `rgba(180,210,230,${0.05 + r() * 0.15})`; g.beginPath(); g.arc(r() * W, r() * H, 1 + r() * 2.5, 0, 7); g.fill(); }
}
/** pocket items for desks: file folder with a label, ledger, inkwell + quill, coins */
function akte(g, x, y, s = 1, { label = '', rot = 0, color = '#c8a868' } = {}) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); rrect(g, -170, -120, 340, 240, 8, shade(color, 0.85), 4); rrect(g, -160, -130, 330, 240, 6, color, 4); g.save(); g.beginPath(); g.rect(-160, -130, 330, 240); g.clip(); paint(g, -160, -130, 330, 240, [shade(color, .8), mixc(color, '#fff', .3)], 40, 3, 10, 40, 0.18); g.restore();
  rrect(g, -100, -86, 200, 60, 4, '#f2ead6', 3); if (label) text(g, label, 0, -55, { size: 30, font: 'hand', color: '#1e2048', maxW: 180, weight: 'normal' }); g.strokeStyle = '#8a2a2a'; g.lineWidth = 6; g.beginPath(); g.moveTo(-162, 40); g.lineTo(172, 40); g.stroke(); g.restore(); }
function inkwell(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); const P = new Path2D(); P.moveTo(-34, 0); P.lineTo(-30, -44); P.lineTo(30, -44); P.lineTo(34, 0); P.closePath(); shape(g, P, '#2a3a4a', [-34, -44, 34, 0], { ink: 3, hi: 0.4 }); rrect(g, -14, -58, 28, 16, 4, '#1a2028', 2.5);
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(4, -56); g.lineTo(80, -190); g.stroke(); const F = new Path2D(); F.moveTo(40, -110); F.quadraticCurveTo(110, -200, 96, -230); F.quadraticCurveTo(60, -180, 40, -110); shape(g, F, '#f2ead6', [40, -230, 110, -110], { ink: 2.5, shade: 0.2 }); g.restore(); }
function coins(g, x, y, n = 8, { seed = 4, s = 1 } = {}) { const r = rng(seed); for (let i = 0; i < n; i++) { const cx = x + (r() - 0.5) * 120 * s, cy = y - i * 6 * s * (r() > 0.5 ? 1 : 0.2); ell(g, cx, cy, 20 * s, 8 * s, r() > 0.3 ? '#c8c4b8' : '#d8b040', 2); } }
/** a bed-shaped heap: a body under a blanket facing the wall (for the cell bunk). (x, y) = bunk top centre */
function blanketBody(g, x, y, s = 1, { color = '#6a6a5a', flip = false, hair = null, seed = 2 } = {}) {
  g.save(); g.translate(x, y); g.scale(s * (flip ? -1 : 1), s); if (hair) { ell(g, -190, -40, 50, 40, hair, 3.5); }
  const P = new Path2D(); P.moveTo(-230, 0); P.bezierCurveTo(-250, -90, -150, -100, -60, -80); P.bezierCurveTo(20, -120, 120, -110, 180, -70); P.quadraticCurveTo(240, -40, 230, 0); P.closePath(); shape(g, P, pattern(g, 'tweed', color), [-250, -120, 240, 0], { ink: 4.5, shade: 0.45 });
  g.save(); g.clip(P); g.strokeStyle = rgba(INK, .3); g.lineWidth = 2.5; for (const k of [-120, 0, 120]) { g.beginPath(); g.moveTo(k, -110); g.quadraticCurveTo(k + 20, -50, k - 10, 0); g.stroke(); } g.restore(); g.restore();
}
/** night sky with named constellations helper: returns star positions for the Big Dipper and Polaris (to draw guides) */
function bigDipper(x, y, s = 1) { return [[0, 0], [70, 20], [130, 30], [190, 60], [210, 130], [300, 140], [300, 60]].map(([a, b]) => [x + a * s, y + b * s]); }
function polaris(dip, k = 5) { const a = dip[6], b = dip[5], dx = a[0] - b[0], dy = a[1] - b[1]; return [a[0] + dx * k, a[1] + dy * k]; }
Object.assign(K, { stoneBlocks, bricks, cobbles, sky2, sea, waves, fog, rock, fortress, sailship, steamship, smoke, warehouse, townhouse, gasLamp, barrel, crate, ropeCoil, bollard, quay, rowboat, cutter, deck, netPile, fishCrate,
  stairwell, cell, looseStone, courtroom, railing, pew, lighthouseRuin, hill, grassFront, chest, waxBundle, crossRock, earthHeap, lectureHall, lectern, schoolhouse, scaffold, dustDraw, sack, bubbles, underwater, akte, inkwell, coins, blanketBody, bigDipper, polaris });
/** ship under construction on a slipway: keel, ribs, partial planking. (x, y) = keel centre on the slip */
function hullFrame(g, x, y, s = 1, { planked = 0.35, color = '#b08a5a' } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  poly(g, [[-560, 40], [560, 40], [600, 90], [-600, 90]]); fillInk(g, '#6a5a48', 4);
  for (let k = -500; k <= 500; k += 120) { rrect(g, k - 12, 40, 24, 50, 3, '#4a3a2c', 3); }
  for (let i = 0; i <= 16; i++) { const u = i / 16, xx = lerp(-470, 470, u), hh = 300 * Math.sin(lerp(0.25, 0.92, u) * Math.PI) + 60, wd = 30 + 80 * Math.sin(u * Math.PI);
    g.strokeStyle = INK; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(xx - wd, -hh); g.quadraticCurveTo(xx - wd * 0.2, 10, xx, 30); g.stroke(); g.strokeStyle = color; g.lineWidth = 10; g.stroke(); }
  if (planked > 0) { g.save(); const P = new Path2D(); P.moveTo(-480, 20); P.quadraticCurveTo(0, 60, 480, 20); P.lineTo(480, 20 - 300 * planked); P.quadraticCurveTo(0, 30 - 300 * planked, -480, 20 - 300 * planked); P.closePath();
    shape(g, P, shade(color, 0.85), [-480, -300, 480, 60], { ink: 4, shade: 0.4, hi: 0.15 }); g.clip(P); g.strokeStyle = rgba(INK, 0.35); g.lineWidth = 2; for (let k = 0; k < 12; k++) { g.beginPath(); g.moveTo(-500, 20 - k * 24); g.quadraticCurveTo(0, 54 - k * 24, 500, 20 - k * 24); g.stroke(); } g.restore(); }
  g.strokeStyle = INK; g.lineWidth = 22; g.beginPath(); g.moveTo(-560, 30); g.quadraticCurveTo(0, 50, 560, 30); g.stroke(); g.strokeStyle = '#8a6a44'; g.lineWidth = 14; g.stroke();
  g.strokeStyle = INK; g.lineWidth = 18; g.beginPath(); g.moveTo(520, 30); g.quadraticCurveTo(600, -80, 590, -360); g.stroke(); g.strokeStyle = color; g.lineWidth = 11; g.stroke();
  for (const sx of [-380, 0, 380]) { g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(sx - 60, 40); g.lineTo(sx, -330); g.lineTo(sx + 60, 40); g.stroke(); g.strokeStyle = '#7a5a3a'; g.lineWidth = 5; g.stroke(); }
  g.restore();
}
/** timber stack (planks seen end-on and from the side) */
function timberStack(g, x, y, w = 300, n = 6, { color = '#b8905a' } = {}) { for (let i = 0; i < n; i++) { const yy = y - i * 22; rrect(g, x + (i % 2) * 8, yy - 22, w, 22, 3, shade(color, 0.85 + (i % 3) * 0.07), 3); g.strokeStyle = rgba(INK, .3); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + 20, yy - 11); g.lineTo(x + w - 20, yy - 13); g.stroke(); } }
/** wooden shed with a painted sign board. (x, y) bottom-left */
function shed(g, x, y, w, h, { sign = null, color = '#7a3a2a', doorOpen = true } = {}) {
  const P = new Path2D(); P.moveTo(x, y); P.lineTo(x, y - h); P.lineTo(x + w / 2, y - h - w * 0.28); P.lineTo(x + w, y - h); P.lineTo(x + w, y); P.closePath(); shape(g, P, color, [x, y - h - w * 0.28, x + w, y], { ink: 4.5, shade: 0.35 });
  g.save(); g.clip(P); g.strokeStyle = rgba(INK, .35); g.lineWidth = 2.5; for (let k = x + 26; k < x + w; k += 26) { g.beginPath(); g.moveTo(k, y - h - w * 0.3); g.lineTo(k, y); g.stroke(); } paint(g, x, y - h - w * 0.3, w, h + w * 0.3, [shade(color, .75), mixc(color, '#fff', .2)], 60, 9, 8, 40, 0.15); g.restore();
  poly(g, [[x - 30, y - h + 6], [x + w / 2, y - h - w * 0.3 - 6], [x + w + 30, y - h + 6]], false); g.strokeStyle = INK; g.lineWidth = 16; g.lineJoin = 'round'; g.stroke(); g.strokeStyle = '#4a4040'; g.lineWidth = 10; g.stroke();
  const dw = w * 0.4, dh = h * 0.7; rrect(g, x + (w - dw) / 2, y - dh, dw, dh, 3, doorOpen ? '#1e1612' : shade(color, 0.7), 4);
  if (sign) { const sw = w * 0.86, sh = h * 0.2; rrect(g, x + (w - sw) / 2, y - h - sh * 0.4, sw, sh, 4, '#efe4c8', 4); text(g, sign, x + w / 2, y - h - sh * 0.4 + sh / 2 + 1, { size: sh * 0.52, font: 'serif', color: '#2a3a5a', maxW: sw - 24 }); }
}
/** Lübeck skyline silhouette (spires, roofs) in haze along y */
function skyline(g, x0, x1, y, { color = '#7a86a8', time = 'day', seed = 3 } = {}) {
  const r = rng(seed); g.fillStyle = color; g.beginPath(); g.moveTo(x0, y);
  for (let x = x0; x < x1;) { const w = 40 + r() * 70, h = 30 + r() * 50; g.lineTo(x, y - h); g.lineTo(x + w / 2, y - h - 20 - r() * 20); g.lineTo(x + w, y - h); x += w; } g.lineTo(x1, y); g.closePath(); g.fill();
  for (const [sx, sh, tw] of [[0.36, 230, 1], [0.39, 230, 1], [0.55, 200, 0], [0.72, 170, 0], [0.18, 150, 0]]) { const cx = lerp(x0, x1, sx); g.fillRect(cx - 18, y - sh * 0.62, 36, sh * 0.62); g.beginPath(); g.moveTo(cx - 22, y - sh * 0.62); g.lineTo(cx, y - sh); g.lineTo(cx + 22, y - sh * 0.62); g.fill(); if (tw) { g.fillStyle = shade(color, 0.92); g.fillRect(cx - 30, y - 90, 60, 90); g.fillStyle = color; } }
  if (time === 'night') { for (let i = 0; i < (x1 - x0) / 30; i++) { g.fillStyle = `rgba(255,205,130,${0.4 + r() * 0.5})`; g.fillRect(x0 + r() * (x1 - x0), y - 10 - r() * 40, 3, 4); } }
}
/** the Lübeck harbour (Trave quay), c. 1903/1912: skyline, far warehouses, water, moored ships, near cobbled quay with a shipyard.
 * opts: time, year (1903|1912), sign (shipyard board), seed. Returns key points { waterY, quayY, yard } */
function harbor(g, { time = 'day', year = 1903, sign = 'Werft Lindqvist', seed = 41, ships = true } = {}) {
  const night = time === 'night', waterY = 520, quayY = 800;
  sky2(g, 0, 0, W, waterY + 20, { time, seed, moon: night ? [1640, 150, 34] : null });
  skyline(g, 0, W, waterY - 40, { color: night ? '#2a3052' : time === 'golden' ? '#9a8aa0' : '#8a96b4', time, seed });
  const r = rng(seed); for (let i = 0; i < 9; i++) { const w = 120 + r() * 70; warehouse(g, i * 215 - 30 + r() * 20, waterY + 4, w, 120 + r() * 80, { color: night ? '#5a3a34' : ['#9a4a32', '#8a5038', '#a85a3a'][i % 3], seed: seed + i, lit: night ? 0.35 : 0, doors: false }); }
  if (!night) { g.fillStyle = 'rgba(200,215,235,.22)'; g.fillRect(0, 300, W, waterY - 280); }
  quay(g, -20, W + 20, waterY + 4, { h: 22, stone: true });
  sea(g, 0, waterY + 26, W, quayY - waterY - 26, { time, seed: seed + 2, calm: 0.8 });
  if (ships) { sailship(g, 470, 722, 0.4, { sails: 'furled', seed, time }); if (year > 1905) steamship(g, 1250, 690, 0.32, {}); else steamship(g, 1180, 664, 0.24, {}); }
  // shipyard on the near bank (right)
  hullFrame(g, 1520, 760, 0.42, { planked: 0.45 });
  shed(g, 1650, quayY + 4, 270, 230, { sign, color: '#7a3a2a' });
  quay(g, -20, W + 20, quayY, { h: 60 });
  cobbles(g, quayY + 60, H, { color: night ? '#5a5864' : '#9a9084', seed, wet: night ? 0.6 : 0 });
  return { waterY, quayY };
}
/** harbour tavern façade with big warm windows (interior drawn by the caller through K.tavernWindows). (x, y) bottom-left */
function tavern(g, x, y, w, h, { seed = 8 } = {}) { townhouse(g, x, y, w, h, { color: '#d8c49a', shutters: '#3a5a3a', door: '#4a2a1a', seed, lit: 0.0, gable: 'step' });
  rrect(g, x + 30, y - h * 0.62, w - 60, h * 0.36, 6, '#2a1a10', 5); rrect(g, x + 40, y - h * 0.86, w - 80, h * 0.12, 4, '#3a2a1a', 3); text(g, 'Zum Anker', x + w / 2, y - h * 0.8, { size: h * 0.07, font: 'serif', color: '#e8c870', maxW: w - 100 }); return [x + 40, y - h * 0.6, w - 80, h * 0.32]; }
/** judges' bench drawn separately so a judge can sit behind it (draw after the judge) */
function judgeBench(g, { verdict = null } = {}) {
  rrect(g, 560, 360, 800, 60, 6, '#4a3020', 5); const B = new Path2D(); B.rect(580, 410, 760, 360); shape(g, B, '#5e3c24', [580, 410, 1340, 770], { ink: 5, shade: 0.4, hi: 0.12 });
  for (let x = 610; x < 1320; x += 180) { rrect(g, x, 440, 150, 290, 6, '#6a4630', 3); rrect(g, x + 16, 456, 118, 258, 4, '#58391f', 2); }
  if (verdict) { g.save(); g.translate(1150, 392); g.rotate(-0.03); rrect(g, -90, -54, 180, 108, 3, '#f4ecd6', 3); text(g, verdict, 0, 0, { size: 28, font: 'serif', color: '#2a1a14', maxW: 160, lineH: 1.25 }); g.restore(); }
}
Object.assign(K, { hullFrame, timberStack, shed, skyline, harbor, tavern, judgeBench });
// <<< PERIOD KIT

// ======================================================================= FILM runtime
const SETS = [];
/** K.set(fn): a background painted once at 2x and reused by every scene that names it */
K.set = (fn, { scale = 2 } = {}) => { const s = { fn, scale, cv: null }; SETS.push(s); return s; };
const SET_CACHE = []; K.SET_CACHE_MAX = 8;
function setCanvas(s) { const i = SET_CACHE.indexOf(s); if (i >= 0) { SET_CACHE.splice(i, 1); SET_CACHE.push(s); }
  else { SET_CACHE.push(s); while (SET_CACHE.length > K.SET_CACHE_MAX) { const old = SET_CACHE.shift(); if (old.cv) { old.cv.width = old.cv.height = 1; old.cv = null; } } }
  if (!s.cv) { s.cv = document.createElement('canvas'); s.cv.width = W * s.scale; s.cv.height = H * s.scale; const g = s.cv.getContext('2d'); g.scale(s.scale, s.scale); s.fn(g); } return s.cv; }
function camOf(sc, t) {
  let c = { x: W / 2, y: H / 2, z: 1, r: 0 };
  if (typeof sc.cam === 'function') c = { ...c, ...sc.cam(t) };
  else if (Array.isArray(sc.cam)) c = { ...c, ...key(t, sc.cam.map((k) => [k.t, k]), sc.camEase === 'lin' ? (u) => u : eio) };
  else if (sc.cam) c = { ...c, ...sc.cam };
  c.x = clamp(c.x, W / 2 / c.z, W - W / 2 / c.z); c.y = clamp(c.y, H / 2 / c.z, H - H / 2 / c.z);
  if (sc.shake) for (const [at, amp] of sc.shake) { const d = t - at; if (d >= 0 && d < 0.3) { const k = (1 - d / 0.3) * amp; c.x += Math.sin(d * 90) * k; c.y += Math.cos(d * 77) * k; } }
  return c;
}
/** footstep cues for a walk: plants happen at step = 0.25 + k/2 when step = t * rate */
K.steps = (t0, t1, rate, name = 'step', gain = 0.8) => { const out = []; for (let k = 0; ; k++) { const t = (0.25 + k / 2) / rate; if (t < t0) continue; if (t > t1) break; out.push([t, name, gain * (k % 2 ? 0.85 : 1), { seed: k }]); } return out; };
window.FILM = function FILM(def) {
  const FPS = def.fps || 30, scenes = def.scenes; let acc = 0;
  for (const s of scenes) { s.start = acc; acc += s.dur; }
  const DURATION = def.duration || acc;
  const cv = document.getElementById('film'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
  const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H; const tctx = tmp.getContext('2d');
  function renderScene(g, sc, t) {
    LIGHT.dir = sc.light ?? 1;
    const c = camOf(sc, t); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#1a1210'; g.fillRect(0, 0, W, H);
    g.translate(W / 2, H / 2); g.rotate((c.r || 0) * Math.PI / 180); g.scale(c.z, c.z); g.translate(-c.x, -c.y);
    if (sc.set) g.drawImage(setCanvas(sc.set), 0, 0, W, H);
    if (sc.draw) sc.draw(g, t, K);
    g.setTransform(1, 0, 0, 1, 0, 0);
    const gr = sc.grade || {};
    if (gr.tint) { g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = gr.tintA ?? 0.35; g.fillStyle = gr.tint; g.fillRect(0, 0, W, H); g.restore(); }
    if (gr.warm !== 0) { g.save(); g.globalCompositeOperation = 'soft-light'; g.globalAlpha = gr.warm ?? 0.12; g.fillStyle = '#ffb060'; g.fillRect(0, 0, W, H); g.restore(); }
    const vg = gr.vignette ?? 0.32, v = g.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.62); v.addColorStop(0, 'rgba(20,10,5,0)'); v.addColorStop(1, `rgba(20,10,5,${vg})`); g.fillStyle = v; g.fillRect(0, 0, W, H);
    if (sc.post) sc.post(g, t, K);
  }
  function renderAt(T) {
    T = clamp(T, 0, DURATION - 1e-6);
    let i = scenes.findIndex((s) => T >= s.start && T < s.start + s.dur); if (i < 0) i = scenes.length - 1;
    const sc = scenes[i], t = T - sc.start, tr = sc.in || (i ? 'fade' : 'cut'), td = sc.inDur ?? (tr === 'flash' ? 0.15 : 0.3);
    renderScene(ctx, sc, t);
    if (i > 0 && t < td && tr !== 'cut') {
      const k = sm(t / td), prev = scenes[i - 1];
      if (tr === 'fade') { renderScene(tctx, prev, prev.dur + t); ctx.globalAlpha = 1 - k; ctx.drawImage(tmp, 0, 0); ctx.globalAlpha = 1; }
      else if (tr === 'flash') { ctx.fillStyle = `rgba(255,252,240,${1 - k})`; ctx.fillRect(0, 0, W, H); }
      else if (tr === 'dip') { ctx.fillStyle = `rgba(15,8,5,${1 - k})`; ctx.fillRect(0, 0, W, H); }
      else if (tr === 'black') { // previous scene fades to black, then this one fades up (a calm chapter break)
        const u = t / td; if (u < 0.5) { renderScene(ctx, prev, prev.dur + t); ctx.fillStyle = `rgba(8,6,6,${sm(u * 2)})`; } else ctx.fillStyle = `rgba(8,6,6,${1 - sm((u - 0.5) * 2)})`; ctx.fillRect(0, 0, W, H); }
      else if (tr === 'wipe') { renderScene(tctx, prev, prev.dur + t); ctx.save(); ctx.beginPath(); ctx.rect(W * k, 0, W, H); ctx.clip(); ctx.drawImage(tmp, 0, 0); ctx.restore(); const gx = W * k; const wg = ctx.createLinearGradient(gx - 160, 0, gx + 40, 0); wg.addColorStop(0, 'rgba(255,255,255,0)'); wg.addColorStop(1, 'rgba(255,255,255,.9)'); ctx.fillStyle = wg; ctx.fillRect(gx - 160, 0, 200, H); }
    }
    if (def.fadeIn && T < def.fadeIn) { ctx.fillStyle = `rgba(15,8,5,${1 - T / def.fadeIn})`; ctx.fillRect(0, 0, W, H); }
    if (def.fadeOut && T > DURATION - def.fadeOut) { ctx.fillStyle = `rgba(15,8,5,${(T - (DURATION - def.fadeOut)) / def.fadeOut})`; ctx.fillRect(0, 0, W, H); }
  }
  if (def.preload !== false && SETS.length <= K.SET_CACHE_MAX) for (const s of SETS) setCanvas(s);
  // ---- audio cue sheet (no speech): music mood sections + sound effects, consumed by scripts/audio.py
  const mus = typeof def.music === 'string' ? { mood: def.music } : { mood: 'quirky', ...(def.music || {}) };
  const sections = [{ t: 0, mood: (scenes[0] && scenes[0].music) || mus.mood }], cues = [];
  scenes.forEach((s, i) => {
    if (i && s.music && s.music !== sections[sections.length - 1].mood) sections.push({ t: s.start, mood: s.music });
    const tr = s.in || (i ? 'fade' : 'cut');
    if (i && def.autoSfx !== false) { if (tr === 'wipe') cues.push({ t: s.start - 0.05, name: 'whoosh', gain: 0.55, dur: 0.6 }); else if (tr === 'flash') cues.push({ t: s.start - 0.04, name: 'swish', gain: 0.6 }); else if (tr === 'fade') cues.push({ t: s.start - 0.15, name: 'whoosh', gain: 0.22, dur: 0.5 }); }
    for (const c of s.sfx || []) { const o = Array.isArray(c) ? { t: c[0], name: c[1], gain: c[2] ?? 1, ...(c[3] || {}) } : { ...c }; o.t = s.start + o.t; if (o.t < DURATION) cues.push(o); }
  });
  const audio = { duration: DURATION, fadeOut: def.fadeOut || 0, music: mus, sections, cues: cues.sort((a, b) => a.t - b.t) };
  window.__film = { FPS, DURATION, W, H, renderAt, audio, scenes: scenes.map((s) => ({ start: s.start, dur: s.dur, name: s.name || '' })) };
  if (!/[?&]render/.test(location.search)) { // simple player: space = pause, arrows = seek
    let t0 = performance.now(), paused = false, pt = 0; const now = () => paused ? pt : ((performance.now() - t0) / 1000) % DURATION;
    addEventListener('keydown', (e) => { if (e.code === 'Space') { if (paused) { t0 = performance.now() - pt * 1000; paused = false; } else { pt = now(); paused = true; } }
      if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') { const n = clamp(now() + (e.code === 'ArrowRight' ? 1 : -1), 0, DURATION - 0.01); pt = n; t0 = performance.now() - n * 1000; } });
    cv.addEventListener('click', () => dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' })));
    const loop = () => { renderAt(now()); requestAnimationFrame(loop); }; loop();
  }
};
})();
