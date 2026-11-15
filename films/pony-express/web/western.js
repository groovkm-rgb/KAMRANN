// ===================== western.js: horses, riders, rim light, western FX =====================
// Appended after cast.js into toon.js (cat web/toonbase.js web/cast.js web/western.js > web/toon.js).
const WK = '#1a1416';
const rngW = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const rad_ = (a) => a * Math.PI / 180;
const rot2 = (x, y, cx, cy, a) => { const c = Math.cos(a), s = Math.sin(a); return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]; };
/** union of shapes with one ink outline (stroke all thick, then fill all) + cool shade crescent */
function union(g, shapes, fill, w = 9, shade = null, off = [0, 0.35]) {
  for (const s of shapes) { pth(g, s); g.lineWidth = w * 2; g.strokeStyle = WK; g.lineJoin = 'round'; g.stroke(); }
  for (const s of shapes) { pth(g, s); g.fillStyle = fill; g.fill(); }
  if (shade) {
    const xs = shapes.flat().map((p) => p[0]), ys = shapes.flat().map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    g.save(); g.beginPath(); for (const s of shapes) { s.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); } g.clip();
    g.fillStyle = shade; g.beginPath(); g.ellipse((x0 + x1) / 2 + off[0] * (x1 - x0), y1 + (y1 - y0) * (0.55 - off[1]), (x1 - x0) * 0.75, (y1 - y0) * 0.62, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
}
const seg = (g, a, b, w, col) => { ln(g, [a, b], w + 12); ln(g, [a, b], w, col); };

/** chest post pouch with "Post" on the flap (drawn over the body, under the arms) */
function drawPouch(g, o) {
  const x = o.x ?? 318, y = o.y ?? 470, w = o.w ?? 118, h = o.h ?? 92;
  ln(g, [[230, 360], [x + w * 0.4, y]], 14); ln(g, [[230, 360], [x + w * 0.4, y]], 7, '#6a3e22');
  inkFill(g, [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2 - 4, y + h / 2], [x - w / 2 + 4, y + h / 2]], '#8a5530', 7);
  inkFill(g, [[x - w / 2 - 4, y - h / 2 - 4], [x + w / 2 + 4, y - h / 2 - 4], [x + w / 2, y + 6], [x, y + 16], [x - w / 2, y + 6]], '#a8683a', 7);
  g.save(); g.font = `bold ${Math.round(h * 0.36)}px "Rye","Georgia","DejaVu Serif",serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 5; g.strokeStyle = '#3a2214'; g.strokeText('Post', x, y - h * 0.16); g.fillStyle = '#f4e2b0'; g.fillText('Post', x, y - h * 0.16); g.restore();
  dt(g, x, y + 10, 6, '#e2b84c');
}

// ---------- characters ----------
export const WEST = {
  rider: { body: '#9cc8ec', bw: 186, detail: [{ t: 'vest', c: '#7a4a2a' }, { t: 'scarf', c: '#d0302c' }, 'belt'], legs: '#7a4e2c', boots: '#4a2a18',
    hair: '#b07a42', hairStyle: 'mop', iris: '#2f7fd8', freckles: true },
  rider2: { body: '#e8dcc0', bw: 186, detail: [{ t: 'vest', c: '#3a3a44' }, { t: 'scarf', c: '#2e9a4a' }, 'belt'], legs: '#4a4a5a', boots: '#2a2020',
    hair: '#1c1a20', hairStyle: 'short', hat: { type: 'cowboy', color: '#5a4030', band: '#2a1a12' } },
  keeper: { body: '#5a78a8', bw: 214, detail: [{ t: 'straps', c: '#3a5280' }, { t: 'pocket' }, { t: 'buttons', c: '#e2b84c' }], legs: '#4a6a9a', boots: '#3a2a20',
    hair: '#eeeeee', hairStyle: 'sides', mous: '#f4f4f4', mousStyle: 'handle', hat: { type: 'flatcap', color: '#6a5a4a', stripes: '#8a7a64' } },
  worker: { body: '#e8e0cc', bw: 200, sleeve: '#e8e0cc', detail: [{ t: 'straps', c: '#5a3a24' }], legs: '#5a5a70', boots: '#3a2a20',
    hair: '#5a3a24', hairStyle: 'short', hat: { type: 'flatcap', color: '#7a6a52' } },
  worker2: { body: '#c8d8e8', bw: 210, sleeve: '#c8d8e8', detail: [{ t: 'straps', c: '#3a2a20' }], legs: '#6a5040', boots: '#3a2a20',
    hair: '#c06030', hairStyle: 'sides', mous: '#c06030', hat: { type: 'wide', color: '#c8a46a', band: '#7a5a34' } },
  operator: { body: '#f2f0ea', bw: 196, sleeve: '#f2f0ea', garter: '#2a2228', detail: ['collar', { t: 'vest', c: '#5a5a66' }, { t: 'tie', c: '#2a2a50' }], legs: '#3a3a44',
    hair: '#4a3a30', hairStyle: 'side', hat: { type: 'visor', color: '#2a6a3a' } },
  miner: { body: '#c0703a', bw: 200, detail: [{ t: 'straps', c: '#3a2a20' }, 'belt'], legs: '#4a4a5a', boots: '#3a2a20', hair: '#3a2a22', hairStyle: 'sides', beard: '#5a3a22',
    hat: { type: 'cowboy', color: '#7a6048', band: '#3a2a1a' } },
  lady: { body: '#b04a6a', robe: true, detail: [{ t: 'collar', c: '#f4ecdc' }, { t: 'buttons', c: '#f4ecdc' }], hair: '#7a4a2a', hairStyle: 'bun' },
  lady2: { body: '#4a7ab0', robe: true, detail: [{ t: 'collar', c: '#ffffff' }, { t: 'trim', c: '#f2e6c8' }], hair: '#2a2228', hairStyle: 'bun' },
  newsboy: { body: '#8a9a6a', bw: 160, headScale: 1.04, detail: [{ t: 'straps', c: '#5a3a24' }], legs: '#5a4a3a', hair: '#c88a4a', hairStyle: 'mop',
    hat: { type: 'flatcap', color: '#5a6a8a', stripes: '#7a8aa8' } },
  crier: { body: '#3a3a4a', bw: 206, detail: ['collar', { t: 'tie', c: '#b8282b' }, 'buttons'], legs: '#2a2a32', hair: '#8a8a90', hairStyle: 'sides', mous: '#5a5a60',
    hat: { type: 'bowler', color: '#2a2630' } },
  townA: { body: '#6a8a4a', bw: 200, detail: [{ t: 'vest', c: '#4a3424' }, 'belt'], legs: '#4a4038', hair: '#3a2a22', hairStyle: 'short', mous: '#3a2a22', hat: { type: 'cowboy', color: '#a8865a', band: '#4a2a1a' } },
  townB: { body: '#d8b04a', bw: 196, detail: ['apron', 'belt'], legs: '#5a4a3a', hair: '#8a5a2e', hairStyle: 'sides', hat: { type: 'bowler', color: '#3a2e2a' } },
  blueM: { body: '#3e5a9a', bw: 200, detail: ['buttons', 'belt'], legs: '#2e3e6a', hair: '#3a2a22', hairStyle: 'short', hat: { type: 'flatcap', color: '#2e3e6a' } },
  greyM: { body: '#8a8a8e', bw: 200, detail: ['buttons', 'belt'], legs: '#5a5a60', hair: '#5a3a24', hairStyle: 'short', hat: { type: 'flatcap', color: '#6a6a70' } },
};
export const HORSES = {
  bay: { coat: '#9a5a2e', mane: '#2e1c14', blaze: true, hoof: '#3a2a22' },
  black: { coat: '#2e2a34', mane: '#141218', blaze: false, socks: true, hoof: '#3a3238' },
  spot: { coat: '#f0e6d4', mane: '#4a3a30', spots: '#6a4a34', hoof: '#4a3a30' },
  grey: { coat: '#b8b4b0', mane: '#6a6460', hoof: '#4a4440' },
};

// ---------- rim light ----------
let _rA = null, _rB = null;
/** draw fn(pen) with a coloured rim light on the side facing the light. rim = {dx, dy (canvas px toward the light), col, a} */
export const rimWrap = (p, fn, rim) => {
  if (!rim) return fn(p);
  const g = p.g, c = g.canvas, W = c.width, H = c.height, tr = g.getTransform();
  if (!_rA || _rA.width !== W || _rA.height !== H) { _rA = document.createElement('canvas'); _rB = document.createElement('canvas'); _rA.width = _rB.width = W; _rA.height = _rB.height = H; }
  const ga = _rA.getContext('2d'), gb = _rB.getContext('2d');
  ga.setTransform(1, 0, 0, 1, 0, 0); ga.clearRect(0, 0, W, H); ga.setTransform(tr); fn(new Pen(ga));
  if (rim.sil) { ga.save(); ga.setTransform(1, 0, 0, 1, 0, 0); ga.globalCompositeOperation = 'source-atop'; ga.globalAlpha = rim.silA ?? 0.88; ga.fillStyle = rim.sil; ga.fillRect(0, 0, W, H); ga.restore(); }
  gb.setTransform(1, 0, 0, 1, 0, 0); gb.globalCompositeOperation = 'source-over'; gb.clearRect(0, 0, W, H); gb.drawImage(_rA, 0, 0);
  gb.globalCompositeOperation = 'source-in'; gb.fillStyle = rim.col || '#ffc070'; gb.fillRect(0, 0, W, H);
  gb.globalCompositeOperation = 'destination-out'; gb.drawImage(_rA, -rim.dx, -rim.dy);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(_rA, 0, 0); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = rim.a ?? 0.9; g.drawImage(_rB, 0, 0);
  if (rim.wash) { g.globalAlpha = rim.wash; g.drawImage(_rB, rim.dx * 0.5, rim.dy * 0.5); }
  g.restore();
};

// ---------- horse: side view (facing +x) ----------
const smooth_ = (t) => t * t * (3 - 2 * t);
function legAngles(front, p, mode, k = 1) {
  if (mode === 'stand') return [front ? 4 : -6, front ? 2 : 4, 0];
  if (mode === 'jump') return front ? [62, -78, 1] : [-48, -58, 0];
  if (mode === 'land') return front ? [18, 10, 0] : [-20, -10, 0];
  const st = mode === 'trot' ? 0.5 : 0.4, A = mode === 'trot' ? 20 : 28;
  if (p < st) { const t = p / st, a = A - 2 * A * t; return [a, a + (front ? 0 : 8), 0]; }
  const t = (p - st) / (1 - st), a = -A + 2 * A * smooth_(t), fold = Math.sin(Math.PI * t) * k;
  return front ? [a + 30 * fold, a + 30 * fold - 120 * fold, fold] : [a - 6 * fold, a - 80 * fold, fold];
}
export const drawHorseSide = (p, o) => {
  const k_ = o.k ?? 0.84; p.g.save(); p.g.translate(300, 975); p.g.scale(k_, k_); p.g.translate(-300, -975); drawHorseSide_(p, o); p.g.restore();
};
const drawHorseSide_ = (p, o) => {
  const g = p.g, H = { ...(HORSES[o.kind || 'bay']), ...o }, mode = o.mode || 'gallop', ph = ((o.phase || 0) % 1 + 1) % 1;
  const coat = H.coat, sh = coolShade(coat), dark = shadeC(coat, 0.7), mane = H.mane;
  const gal = mode === 'gallop' || mode === 'trot';
  const bob = gal ? -(mode === 'trot' ? 8 : 16) * Math.cos(2 * Math.PI * (ph - 0.15)) : mode === 'jump' ? -10 : 0;
  const pitch = rad_(gal ? 4 * Math.sin(2 * Math.PI * ph) : mode === 'jump' ? -12 : mode === 'land' ? 8 : 0);
  const cx = 300, cy = 652 + bob + (o.dy || 0), P_ = (x, y) => rot2(cx + x, cy + y, cx, cy, pitch);
  const nod = rad_((gal ? 7 * Math.sin(2 * Math.PI * ph + 1.2) : 0) + (o.headDown || 0));
  const wind = o.wind ?? (gal ? 1 : 0.3), t = o.t || 0;
  const legDefs = [{ f: true, far: true, off: 0.42, j: [112, 28] }, { f: false, far: true, off: 0.0, j: [-108, 18] }];
  const legDefsN = [{ f: true, far: false, off: 0.54, j: [124, 34] }, { f: false, far: false, off: 0.12, j: [-96, 24] }];
  const offs = mode === 'trot' ? { true: 0, false: 0.5 } : null;
  const drawLeg = (L) => {
    const lp = ((ph - (mode === 'trot' ? (L.f === L.far ? 0 : 0.5) : L.off)) % 1 + 1) % 1;
    const [a1, a2] = legAngles(L.f, lp, mode); const col = L.far ? dark : coat;
    const j = P_(L.j[0], L.j[1]), u1 = L.f ? 128 : 120, u2 = L.f ? 142 : 150;
    const k = [j[0] + u1 * Math.sin(rad_(a1) + pitch), j[1] + u1 * Math.cos(rad_(a1) + pitch)];
    const h = [k[0] + u2 * Math.sin(rad_(a2) + pitch), k[1] + u2 * Math.cos(rad_(a2) + pitch)];
    const n1 = [Math.cos(rad_(a1) + pitch), -Math.sin(rad_(a1) + pitch)], w0 = L.f ? 36 : 50, hw = 15;
    inkFill(g, [[j[0] - n1[0] * w0, j[1] - n1[1] * w0 - 20], [j[0] + n1[0] * w0, j[1] + n1[1] * w0 - 20], [k[0] + n1[0] * 19, k[1] + n1[1] * 19], [k[0] - n1[0] * 19, k[1] - n1[1] * 19]], col, 8);
    const n2 = [Math.cos(rad_(a2) + pitch), -Math.sin(rad_(a2) + pitch)];
    inkFill(g, [[k[0] - n2[0] * 18, k[1] - n2[1] * 18], [k[0] + n2[0] * 18, k[1] + n2[1] * 18], [h[0] + n2[0] * hw, h[1] + n2[1] * hw], [h[0] - n2[0] * hw, h[1] - n2[1] * hw]], col, 7);
    g.save(); g.beginPath(); g.arc(k[0], k[1], 19, 0, 7); g.fillStyle = col; g.fill(); g.restore();
    if (H.socks && !L.far) inkFill(g, [[k[0] + (h[0] - k[0]) * 0.5 - n2[0] * 16, k[1] + (h[1] - k[1]) * 0.5 - n2[1] * 16], [k[0] + (h[0] - k[0]) * 0.5 + n2[0] * 16, k[1] + (h[1] - k[1]) * 0.5 + n2[1] * 16], [h[0] + n2[0] * hw, h[1] + n2[1] * hw], [h[0] - n2[0] * hw, h[1] - n2[1] * hw]], '#f2ece2', 6);
    const ha = rad_(a2) + pitch, hx = Math.sin(ha), hy = Math.cos(ha);
    inkFill(g, [[h[0] - hy * 17 - hx * 2, h[1] + hx * 17 - hy * 2], [h[0] + hy * 19 - hx * 2, h[1] - hx * 19 - hy * 2], [h[0] + hy * 25 + hx * 26, h[1] - hx * 25 + hy * 26], [h[0] - hy * 21 + hx * 26, h[1] + hx * 21 + hy * 26]], H.hoof, 6);
  };
  // tail
  const tb = P_(-170, -44), tw = [];
  for (let i = 0; i <= 10; i++) { const s_ = i / 10, wv = Math.sin(t * 0.5 + s_ * 4) * 26 * s_ * wind; tw.push([tb[0] - s_ * (150 + 60 * wind) , tb[1] + s_ * (gal ? 40 : 190) - (gal ? 60 * s_ * s_ * wind : 0) + wv]); }
  const tpts = [...tw.map(([x, y], i) => [x, y - 26 * (1 - i / 14)]), ...tw.map(([x, y], i) => [x - 6, y + 30 * (1 - i / 12)]).reverse()];
  inkFill(g, tpts, mane, 8); for (let k = 0; k < 3; k++) ln(g, tw.slice(2).map(([x, y]) => [x + 6, y - 8 + k * 9]), 3, shadeC(mane, 1.8));
  for (const L of legDefs) drawLeg(L);
  for (const L of legDefsN) drawLeg(L);
  // body
  const barrel = ellP(cx, cy, 150, 80).map(([x, y]) => P_(x - cx, y - cy)), chest = ellP(0, 0, 76, 78).map(([x, y]) => P_(x + 118, y - 8)), rump = ellP(0, 0, 80, 80).map(([x, y]) => P_(x - 118, y - 16));
  const nb = P_(0, 0), np = (x, y) => rot2(...P_(x, y), ...P_(120, -40), -nod);
  const neck = [P_(70, -50), P_(160, -10), np(214, -146), np(190, -206), np(124, -190)];
  union(g, [barrel, chest, rump, neck], coat, 8, sh, [-0.1, 0.42]);
  if (H.spots) { g.save(); g.beginPath(); for (const s of [barrel, rump]) { s.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); } g.clip();
    const R = rngW(77); for (let i = 0; i < 26; i++) { const [x, y] = P_(-220 + R() * 300, -70 + R() * 150); dt(g, x, y, 8 + R() * 14, H.spots); } g.restore(); }
  // head
  const hc = np(232, -150), ha = -nod + pitch;
  const headA = ellP(0, 0, 86, 40).map(([x, y]) => { const [a, b] = rot2(x, y, 0, 0, rad_(58)); return np(232 + a, -158 + b); });
  const cheek = ellP(0, 0, 46, 46).map(([x, y]) => np(200 + x, -184 + y));
  const ear1 = [np(176, -214), np(170, -268), np(198, -222)], ear2 = [np(192, -214), np(196, -262), np(212, -214)];
  inkFill(g, ear1, dark, 7);
  union(g, [headA, cheek], coat, 8, sh, [0.1, 0.4]);
  inkFill(g, ear2, coat, 7);
  if (H.blaze) inkFill(g, [np(214, -222), np(232, -214), np(284, -104), np(266, -94)], '#f6f0e6', 0);
  // mane
  { const base = [], trail = []; for (let i = 0; i <= 10; i++) { const s_ = i / 10, b = np(194 - 86 * s_, -214 + 166 * s_); base.push(b);
      const L_ = (58 + 30 * wind) * (1 - 0.35 * s_) * (i % 2 ? 0.8 : 1.12), wv = Math.sin(t * 0.8 - s_ * 6) * 16 * wind; trail.push([b[0] - L_, b[1] + 18 + wv - 10 * wind * (1 - s_)]); }
    inkFill(g, [...base, ...trail.reverse()], mane, 6); trail.reverse();
    for (let k = 0; k < 3; k++) ln(g, base.slice(1, 9).map((b, i) => [b[0] + (trail[i + 1][0] - b[0]) * (0.35 + k * 0.2), b[1] + (trail[i + 1][1] - b[1]) * (0.35 + k * 0.2)]), 3, shadeC(mane, 1.9)); }
  inkFill(g, [np(184, -224), np(222, -230 - 10 * wind), np(204, -204)], mane, 6); // forelock
  // face
  const eye = np(206, -188), ex = o.hexpr || 'det';
  inkFill(g, ellP(eye[0], eye[1], 15, 17, 0, 360, 18), '#ffffff', 5); dt(g, eye[0] + 5, eye[1] + 2, ex === 'tired' ? 0 : 8);
  if (ex === 'tired') ln(g, [[eye[0] - 14, eye[1]], [eye[0] + 14, eye[1] + 2]], 6);
  ln(g, ex === 'det' ? [[eye[0] - 18, eye[1] - 24], [eye[0] + 18, eye[1] - 14]] : ex === 'wide' ? [[eye[0] - 14, eye[1] - 30], [eye[0] + 16, eye[1] - 30]] : [[eye[0] - 16, eye[1] - 20], [eye[0] + 16, eye[1] - 22]], 7);
  const ns = np(276, -104); inkFill(g, ellP(ns[0], ns[1], 9, 6, 0, 360, 12), '#3a1a1a', 3); ln(g, [np(244, -84), np(268, -80)], 5);
  // tack: bridle + reins
  ln(g, [np(256, -98), np(198, -150), np(184, -208)], 6, '#4a2a18');
  // saddle blanket, saddle, mochila
  if (o.saddle !== false) {
    inkFill(g, [P_(-70, -86), P_(64, -88), P_(70, -6), P_(-74, -4)], o.blanket || '#b83a3a', 6);
    ln(g, [P_(-62, -14), P_(62, -16)], 6, '#e8c048');
    if (o.mochila !== false) {
      inkFill(g, [P_(-62, -92), P_(58, -94), P_(56, 14), P_(-58, 16)], '#7a4426', 7);
      for (const px of [-38, 30]) inkFill(g, [P_(px - 18, -36), P_(px + 18, -36), P_(px + 18, 4), P_(px - 18, 4)], '#9a5a32', 5);
      g.save(); const tp = P_(-2, -62); g.translate(tp[0], tp[1]); g.rotate(pitch); g.font = 'bold 34px "Rye","Georgia","DejaVu Serif",serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = 5; g.strokeStyle = '#2a160c'; g.strokeText('Post', 0, 0); g.fillStyle = '#f4e2b0'; g.fillText('Post', 0, 0); g.restore();
    }
    inkFill(g, [P_(-54, -96), P_(-40, -118), P_(-20, -100), P_(30, -100), P_(46, -124), P_(56, -112), P_(48, -92), P_(-50, -88)], '#5a3420', 6);
    ln(g, [P_(-4, -60), P_(-6, 70)], 9, '#3a2214');
  }
  if (o.rider) drawRiderOnSide(g, o, P_, np, pitch, t);
  if (o.rider && o.rider.reinsTo) {}
};
function drawRiderOnSide(g, o, P_, np, pitch, t) {
  const R = o.rider, rs = R.s ?? 0.56, lean = rad_(R.lean ?? 18) + pitch, seat = P_(-6, -100);
  const hand = np(150, -150);
  const toL = (x, y) => { const dx = (x - seat[0]) / rs, dy = (y - seat[1]) / rs; const [a, b] = rot2(dx, dy, 0, 0, -lean); return { x: 300 + a, y: 705 + b, b: 0.5 }; };
  g.save(); g.translate(seat[0], seat[1]); g.rotate(lean); g.scale(rs, rs); g.translate(-300, -705 - (R.lift || 0));
  const opts = { turn: 0.55, look: 0.6, expr: 'determined', legs: 'rideSide', knee: R.knee || 0, L: R.L || toL(hand[0] - 10, hand[1] + 10), R: R.R || toL(hand[0] + 8, hand[1] + 4), ...(R.opts || {}) };
  toonChar({ g }, R.spec, opts);
  g.restore();
  if (!R.noReins) { const h2 = hand; ln(g, [np(254, -96), [h2[0] - 6, h2[1] + 6]], 4, '#3a2214'); }
}

// ---------- horse: front view (galloping toward camera) ----------
export const drawHorseFront = (p, o) => {
  const g = p.g, H = { ...(HORSES[o.kind || 'bay']), ...o }, mode = o.mode || 'gallop', ph = ((o.phase || 0) % 1 + 1) % 1, t = o.t || 0;
  const coat = H.coat, sh = coolShade(coat), dark = shadeC(coat, 0.68), mane = H.mane, wind = o.wind ?? 1;
  const bob = mode === 'gallop' ? -16 * Math.cos(2 * Math.PI * (ph - 0.15)) : 0, cy = 680 + bob, hx = o.headX ?? 262;
  // rear legs (far, small)
  if (mode !== 'jump') for (const s of [-1, 1]) { const lift = Math.max(0, Math.sin(2 * Math.PI * (ph + (s > 0 ? 0 : 0.12)))); const x = 300 + s * 44;
    seg(g, [x, cy + 70], [x + s * 6, 940 - lift * 90], 26, dark); inkFill(g, ellP(x + s * 6, 948 - lift * 90, 20, 12), H.hoof, 5); }
  // body + chest
  const barrel = ellP(300, cy - 40, 118, 88), chest = ellP(300, cy + 10, 104, 92), shL = ellP(214, cy - 4, 56, 80), shR = ellP(386, cy - 4, 56, 80);
  union(g, [barrel, chest, shL, shR], coat, 8, sh, [0.15, 0.4]);
  ln(g, ellP(300, cy + 40, 60, 40, 200, 340, 16), 5, shadeC(coat, 0.8));
  // saddle mochila flaps at the sides
  if (o.saddle !== false) for (const s of [-1, 1]) inkFill(g, [[300 + s * 100, cy - 118], [300 + s * 124, cy - 112], [300 + s * 124, cy - 70], [300 + s * 104, cy - 74]], '#7a4426', 5);
  // rider (behind the head)
  if (o.rider) {
    const R = o.rider, rs = R.s ?? 0.56, sx = R.x ?? 352, sy = R.y ?? cy - 92;
    for (const s of [-1, 1]) inkFill(g, ellP(300 + s * 128, cy + 2, 18, 15), R.spec.boots || '#3a2a18', 5);
    g.save(); g.translate(sx, sy); g.rotate(rad_(R.tilt ?? 6)); g.scale(rs, rs * (R.squash ?? 0.92)); g.translate(-300, -705);
    toonChar({ g }, R.spec, { expr: 'determined', turn: -0.1, look: 0, legs: 'none', ...(R.opts || {}) });
    g.restore();
  }
  // neck + head
  const nk = ellP(hx + 10, cy - 130, 66, 96);
  const skull = ellP(hx, 432, 62, 70), muzzle = ellP(hx, 548, 48, 56), jaw = [[hx - 60, 440], [hx + 60, 440], [hx + 46, 560], [hx - 46, 560]];
  union(g, [nk], coat, 8, sh);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const b = [hx + s * 46, 400 + i * 52], L_ = (s > 0 ? 34 : 60) + (s > 0 ? 10 : 30) * wind, wv = Math.sin(t * 0.9 + i * 1.7 + s) * 16;
    inkFill(g, [[b[0], b[1] - 26], [b[0] + s * L_ * 0.6, b[1] - 34 + wv], [b[0] + s * L_, b[1] - 6 + wv], [b[0] + s * L_ * 0.5, b[1] + 8 + wv * 0.5], [b[0], b[1] + 22]], i % 2 ? mane : shadeC(mane, 1.35), 6); }
  const ear = (s) => [[hx + s * 30, 386], [hx + s * 52, 318 - 6 * Math.sin(t * 0.5)], [hx + s * 62, 384]];
  inkFill(g, ear(-1), coat, 7); inkFill(g, ear(1), coat, 7);
  union(g, [skull, muzzle, jaw], coat, 8, sh, [0.2, 0.42]);
  if (H.blaze) inkFill(g, [[hx - 14, 380], [hx + 14, 380], [hx + 22, 590], [hx - 22, 590]], '#f6f0e6', 0);
  inkFill(g, [[hx - 34, 380], [hx, 350 - 10 * wind], [hx + 30, 382], [hx + 6, 412], [hx - 14, 404]], mane, 6); // forelock
  for (const s of [-1, 1]) { // eyes at the sides
    const ex = hx + s * 56, ey = 438; inkFill(g, ellP(ex, ey, 15, 18), '#ffffff', 5); dt(g, ex - s * 3, ey + 2, 8);
    ln(g, [[ex - s * 4 - 16, ey - 28 + (s > 0 ? 10 : 0)], [ex - s * 4 + 16, ey - 28 + (s > 0 ? 0 : 10)]], 7);
    inkFill(g, ellP(hx + s * 22, 572, 11, 15, 0, 360, 14), '#3a1a1a', 4); // nostrils
  }
  ln(g, [[hx - 30, 604], [hx + 30, 604]], 5);
  if (o.rider && !o.rider.noReins) for (const s of [-1, 1]) ln(g, [[hx + s * 44, 590], [ (o.rider.x ?? 352) - 10, (o.rider.y ?? cy - 92) - 40]], 4, '#3a2214');
  // front legs: one reaching toward camera, one folded (hoof sole showing)
  for (const s of [-1, 1]) {
    const x = 300 + s * 74;
    if (mode === 'jump') { const kn = [x + s * 10, cy + 120]; inkFill(g, ellP(kn[0] - s * 4, kn[1] + 44, 26, 18), H.hoof, 6);
      inkFill(g, [[x - 40, cy + 10], [x + 40, cy + 10], [kn[0] + 30, kn[1]], [kn[0] - 30, kn[1]]], coat, 8); inkFill(g, ellP(kn[0], kn[1] + 4, 30, 30), coat, 7); continue; }
    const my = Math.max(0, Math.sin(2 * Math.PI * (ph + (s > 0 ? 0.42 : 0.92))));
    const top = [x, cy + 40], knee = [x + s * 4, cy + 168 - my * 96], foot = [x + s * (2 + 10 * my), 952 - my * 200];
    inkFill(g, [[top[0] - 40, top[1] - 30], [top[0] + 40, top[1] - 30], [knee[0] + 22, knee[1]], [knee[0] - 22, knee[1]]], coat, 8);
    if (my > 0.35) { inkFill(g, ellP(foot[0], foot[1], 22, 16), H.hoof, 6); inkFill(g, [[knee[0] - 20, knee[1]], [knee[0] + 20, knee[1]], [foot[0] + 18, foot[1] - 6], [foot[0] - 18, foot[1] - 6]], coat, 7); }
    else { inkFill(g, [[knee[0] - 20, knee[1]], [knee[0] + 20, knee[1]], [foot[0] + 16, foot[1] - 6], [foot[0] - 16, foot[1] - 6]], coat, 7);
      inkFill(g, [[foot[0] - 22, foot[1] - 12], [foot[0] + 22, foot[1] - 12], [foot[0] + 32, foot[1] + 22], [foot[0] - 32, foot[1] + 22]], H.hoof, 6); }
    g.save(); g.beginPath(); g.arc(knee[0], knee[1], 22, 0, 7); g.fillStyle = coat; g.fill(); g.restore();
  }
};

// ---------- FX sprites (design 600x1000; centre ~ (300,500)) ----------
/** soft billowing dust cloud */
export const fxDustCloud = (p, t, seed = 1, col = '214,160,110', a = 0.85) => {
  const g = p.g, R = rngW(seed * 97 + 3);
  for (let i = 0; i < 14; i++) { const x = 300 + (R() - 0.5) * 420 * (0.6 + t), y = 640 - R() * 360 * (0.5 + t), r = (80 + R() * 110) * (0.7 + 0.6 * t);
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a * (1 - t * 0.6)})`); gr.addColorStop(0.6, `rgba(${col},${a * 0.5 * (1 - t * 0.6)})`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
};
/** flying dirt clods */
export const fxClods = (p, t, seed = 1, col = '#7a4426') => {
  const g = p.g, R = rngW(seed * 31 + 7);
  for (let i = 0; i < 16; i++) { const a = rad_(200 + R() * 140), v = 200 + R() * 260, x = 300 + Math.cos(a) * v * t, y = 700 + Math.sin(a) * v * t + 420 * t * t, r = 8 + R() * 14;
    const pts = []; for (let k = 0; k < 6; k++) { const b = k / 6 * 6.283 + R(); pts.push([x + Math.cos(b) * r * (0.7 + R() * 0.5), y + Math.sin(b) * r * (0.7 + R() * 0.5)]); } inkFill(g, pts, col, 4); }
};
/** dirt splats stuck to the lens */
export const fxLensDirt = (p, k = 1, seed = 1) => {
  const g = p.g, R = rngW(seed * 13 + 5);
  for (let i = 0; i < 9; i++) { const x = 60 + R() * 480, y = 120 + R() * 760, r = (16 + R() * 40) * k; const pts = []; for (let j = 0; j < 9; j++) { const b = j / 9 * 6.283; pts.push([x + Math.cos(b) * r * (0.6 + R() * 0.6), y + Math.sin(b) * r * (0.6 + R() * 0.6)]); }
    g.globalAlpha = 0.85; inkFill(g, pts, i % 2 ? '#6a3a20' : '#8a5230', 0); g.globalAlpha = 1; }
};
/** jagged lightning bolt */
export const fxBolt = (p, seed = 1, a = 1) => {
  const g = p.g, R = rngW(seed * 5 + 11), pts = [[300 + (R() - 0.5) * 80, 0]];
  for (let i = 1; i <= 10; i++) pts.push([pts[i - 1][0] + (R() - 0.5) * 120, i * 98]);
  g.globalAlpha = a; ln(g, pts, 26, 'rgba(160,190,255,0.35)'); ln(g, pts, 10, '#e8f0ff'); ln(g, pts, 4, '#ffffff'); g.globalAlpha = 1;
};
/** electric pulse ball with crackles */
export const fxPulse = (p, t = 0, k = 1) => {
  const g = p.g, R = rngW(Math.floor(t * 60) + 3);
  const gr = g.createRadialGradient(300, 500, 0, 300, 500, 300); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.12, `rgba(150,220,255,${0.95 * k})`); gr.addColorStop(0.35, `rgba(60,140,255,${0.5 * k})`); gr.addColorStop(1, 'rgba(40,90,255,0)');
  g.fillStyle = gr; g.fillRect(0, 200, 600, 600);
  for (let i = 0; i < 7; i++) { let x = 300, y = 500; const a = R() * 6.283, pts = [[x, y]]; for (let j = 0; j < 5; j++) { x += Math.cos(a + (R() - 0.5) * 1.4) * 40; y += Math.sin(a + (R() - 0.5) * 1.4) * 40; pts.push([x, y]); } ln(g, pts, 5, '#dff4ff'); }
};
/** tumbleweed (rotating tangle) */
export const fxTumble = (p, rot = 0) => {
  const g = p.g, R = rngW(41); g.save(); g.translate(300, 780); g.rotate(rot);
  inkFill(g, ellP(0, 0, 150, 140, 0, 360, 30), 'rgba(170,130,70,0.35)', 0);
  for (let i = 0; i < 26; i++) { const a = R() * 6.283, b = a + 1 + R() * 2; ln(g, ellP((R() - 0.5) * 80, (R() - 0.5) * 80, 60 + R() * 80, 50 + R() * 70, a * 57, b * 57, 10), 5, i % 3 ? '#8a6a3a' : '#5a4224'); }
  g.restore();
};
/** small bird, flap 0..1 */
export const fxBird = (p, flap = 0, col = '#1a1416') => { const w = Math.sin(flap * 6.283) * 60; ln(p.g, [[160, 500 - w], [240, 470], [300, 500], [360, 470], [440, 500 - w]], 22, col); };
/** perched bird (side) */
export const fxPerch = (p, look = 0, col = '#2a2430') => {
  const g = p.g; inkFill(g, ellP(300, 900, 46, 34), col, 6); inkFill(g, ellP(336 + look * 6, 862, 26, 24), col, 6); inkFill(g, [[358 + look * 6, 858], [384 + look * 8, 866], [358 + look * 6, 872]], '#e8a040', 3);
  inkFill(g, [[262, 896], [212, 880], [222, 914]], col, 5); dt(g, 342 + look * 8, 856, 4.5, '#ffffff'); ln(g, [[292, 930], [290, 962]], 5); ln(g, [[312, 930], [314, 962]], 5);
};
/** sheet of paper fluttering */
export const fxPaperSheet = (p, rot = 0, bend = 0) => { const g = p.g; g.save(); g.translate(300, 500); g.rotate(rot);
  inkFill(g, [[-90, -110], [90, -110 + bend * 30], [90, 110], [-90, 110 - bend * 30]], '#f6f0e0', 6); for (let k = 0; k < 6; k++) ln(g, [[-66, -70 + k * 30], [66, -70 + k * 30 + bend * 10]], 4, '#9a9080'); g.restore(); };
/** hat flying (top-ish view) */
export const fxHatFly = (p, rot = 0, col = '#a8865a') => { const g = p.g; g.save(); g.translate(300, 500); g.rotate(rot);
  inkFill(g, ellP(0, 30, 200, 60), col, 8); inkFill(g, [[-90, 30], [-80, -80], [0, -110], [80, -80], [90, 30]], col, 8); inkFill(g, [[-90, 0], [90, 0], [90, 24], [-90, 24]], shadeC(col, 0.55), 6); g.restore(); };
/** breath vapour puff */
export const fxBreath = (p, t = 0) => { const g = p.g; for (let i = 0; i < 4; i++) { const x = 300 + i * 50 * (0.4 + t), y = 500 - i * 10, r = (40 + i * 18) * (0.5 + t);
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(240,248,255,${0.75 * (1 - t)})`); gr.addColorStop(1, 'rgba(240,248,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); } };
/** soft radial glow, colour 'r,g,b' */
export const fxSoft = (p, col = '255,200,120', k = 1, r = 290) => { const g = p.g, gr = g.createRadialGradient(300, 500, 0, 300, 500, r); gr.addColorStop(0, `rgba(${col},${k})`); gr.addColorStop(0.3, `rgba(${col},${0.45 * k})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 0, 600, 1000); };
/** water splash crown + drops */
export const fxSplashUp = (p, t, seed = 1) => { const g = p.g, R = rngW(seed * 17 + 1);
  for (let i = 0; i < 18; i++) { const a = rad_(210 + R() * 120), v = 180 + R() * 300, x = 300 + Math.cos(a) * v * t * 1.2, y = 860 + Math.sin(a) * v * t * 1.6 + 600 * t * t, r = (10 + R() * 18) * (1 - t * 0.5);
    if (y < 960) inkFill(g, ellP(x, y, r, r * 1.3), i % 3 ? '#cfeeff' : '#ffffff', 4); }
  if (t < 0.7) { const h = 260 * Math.sin(t / 0.7 * Math.PI); const pts = []; for (let i = 0; i <= 12; i++) pts.push([140 + i * 320 / 12, 900 - h * (i % 2 ? 1 : 0.55) * (1 - Math.abs(i - 6) / 9)]); inkFill(g, [...pts, [460, 930], [140, 930]], 'rgba(220,244,255,0.9)', 6); }
};

/** tall speaker seen only from behind (no face): dark long coat, dark hair, one arm raised */
export const drawBackFigure = (p, o = {}) => { const g = p.g, arm = o.arm ?? 1;
  for (const sd of [-1, 1]) ln(g, [[300 + sd * 34, 860], [300 + sd * 38, 968]], 22, '#1c1a20');
  inkFill(g, pill(200, 330, 400, 900, 80, 18), '#26232c', 9);
  ln(g, [[300, 380], [300, 880]], 4, '#3a3640');
  inkFill(g, [[236, 330], [364, 330], [350, 380], [250, 380]], '#1c1a20', 6);
  inkFill(g, wob(300, 236, 104, 112, 5), '#2c241e', 9); for (let k = 0; k < 4; k++) ln(g, ellP(300, 236, 60 + k * 10, 80, 220, 320, 10), 3, '#4a3c30');
  inkFill(g, ellP(196, 250, 12, 22), '#e8ddd0', 5); inkFill(g, ellP(404, 250, 12, 22), '#e8ddd0', 5);
  ln(g, [[214, 400], [170, 560], [190, 690]], 22, '#26232c'); dt(g, 190, 700, 13, '#e8ddd0');
  const hx = 420 + 40 * arm, hy = 420 - 200 * arm; ln(g, [[386, 400], [440, 380 - 60 * arm], [hx, hy]], 22, '#26232c'); dt(g, hx, hy, 13, '#e8ddd0');
};
/** candle flame + halo */
export const fxFlame = (p, t = 0) => { const g = p.g, w = 1 + 0.12 * Math.sin(t * 2.3) * Math.sin(t * 0.7), sway = Math.sin(t * 1.7) * 10;
  const gr = g.createRadialGradient(300, 520, 0, 300, 520, 280); gr.addColorStop(0, 'rgba(255,200,110,0.55)'); gr.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = gr; g.fillRect(0, 200, 600, 640);
  inkFill(g, [[300 - 34 * w, 600], [300 - 30 * w, 520], [300 + sway, 380], [300 + 30 * w, 520], [300 + 34 * w, 600], [300, 640]], '#ffb030', 0);
  inkFill(g, [[300 - 18, 610], [300 - 14, 540], [300 + sway * 0.6, 460], [300 + 14, 540], [300 + 18, 610], [300, 630]], '#fff4c0', 0);
  ln(g, [[300, 640], [300, 680]], 6, '#2a1a10'); };
/** newspaper with the German headline (hand-set look) */
export const fxNews = (p, rot = 0, bend = 0) => { const g = p.g; g.save(); g.translate(300, 500); g.rotate(rot);
  inkFill(g, [[-250, -330], [250, -330 + bend * 20], [250, 330], [-250, 330 - bend * 20]], '#f2ead6', 8);
  g.fillStyle = '#1a1416'; g.fillRect(-226, -306, 452, 8);
  g.font = '64px "Rye","Georgia",serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Die Rede', 0, -240); g.font = '50px "Rye","Georgia",serif'; g.fillText('des Präsidenten', 0, -170);
  g.fillRect(-226, -126, 452, 5); for (let r = 0; r < 11; r++) for (const cx of [-226, 10]) { g.fillStyle = 'rgba(40,30,30,0.5)'; g.fillRect(cx, -96 + r * 38, 214 * (0.75 + 0.25 * ((r * 7 + cx) % 5) / 5), 12); }
  g.restore(); };
