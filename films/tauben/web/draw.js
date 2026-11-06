// "Tauben" — round-style Canvas 2D drawing. Flat fills, one ink weight (7 px on screen).
import { GEO, FLOCK, FPS, mulberry32, clamp, lerp, inv, mix, qpt, peck } from './story.js';

export const INK = '#2b2420';
let SC = 1;               // current screen scale of the layer being drawn
let TINTC = '#ffffff';    // current multiply tint
export const setTint = t => { TINTC = t; };
const LW = () => 7 / SC;
const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const CACHE = new Map();
// every scene colour goes through C(): flat multiply by the light tint
export function C(h) {
  const k = h + TINTC; let v = CACHE.get(k); if (v) return v;
  const a = hx(h), b = hx(TINTC);
  v = '#' + a.map((x, i) => Math.round(x * b[i] / 255).toString(16).padStart(2, '0')).join('');
  CACHE.set(k, v); return v;
}
const ink = (c, w = 1) => { c.strokeStyle = C(INK); c.lineWidth = LW() * w; c.lineJoin = 'round'; c.lineCap = 'round'; };
const fs = (c, fill, w = 1) => { if (fill) { c.fillStyle = C(fill); c.fill(); } ink(c, w); c.stroke(); };
const ell = (c, x, y, rx, ry, rot = 0) => { c.beginPath(); c.ellipse(x, y, Math.max(rx, 0.01), Math.max(ry, 0.01), rot, 0, Math.PI * 2); };
const circ = (c, x, y, r) => ell(c, x, y, r, r);
const poly = (c, pts, close = true) => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); if (close) c.closePath(); };
const rrect = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
// union of shapes with a single outer outline: stroke all at 2x, then fill all
function blob(c, shapes, fill) {
  ink(c, 2); shapes.forEach(s => { s(c); c.stroke(); });
  c.fillStyle = C(fill); shapes.forEach(s => { s(c); c.fill(); });
}
const E = (x, y, rx, ry, rot = 0) => c => ell(c, x, y, rx, ry, rot);

export function setScale(s) { SC = s; }
let REALF = 0;               // output frame (clock ticks in real time in every variant)
export const setRealFrame = g => { REALF = g; };

// ---------------- sky & roofs ----------------
export function sky(c, col) { c.fillStyle = col; c.fillRect(0, 0, 1080, 1920); }

function house(c, x0, x1, top, peak, wall, chimney) {
  c.beginPath(); c.rect(x0, top, x1 - x0, 2400 - top); fs(c, wall);
  poly(c, [[x0 - 18, top], [(x0 + x1) / 2, peak], [x1 + 18, top]]); fs(c, '#c8643c');
  if (chimney) { c.beginPath(); c.rect(chimney, peak + (top - peak) * 0.35 - 70, 34, 80); fs(c, '#b5583a'); }
  for (let y = top + 70; y < top + 600; y += 150) { c.beginPath(); c.rect(x0 + 24, y, 42, 64); fs(c, '#7f8a96'); }
}
// far roofs (p 0.35, blur 14) and near roofs (p 0.6, blur 10) on both sides of Otto's house
export function roofs(c, which) {
  if (which === 'far') {
    house(c, -120, 170, 700, 560, '#d9c7a5', 60); house(c, 900, 1220, 770, 640, '#d6c09c', 980);
    house(c, 150, 420, 820, 690, '#dbcaa8'); house(c, 660, 940, 860, 740, '#d4c1a0');
  } else {
    house(c, -200, 150, 1000, 880, '#e3d2ae', 40); house(c, 930, 1300, 1120, 1000, '#dfcca6', 1010);
  }
}
export function wires(c) {
  ink(c, 0.55);
  for (const w of [GEO.wireTop, GEO.wireL, GEO.wireR]) { c.beginPath(); c.moveTo(...w.a); c.quadraticCurveTo(...w.c, ...w.b); c.stroke(); }
  // a second, slightly lower top wire
  c.beginPath(); c.moveTo(-40, 58); c.quadraticCurveTo(540, 166, 1120, 84); c.stroke();
  // poles at the frame edges
  c.beginPath(); c.rect(1040, 40, 22, 900); fs(c, '#6b5642'); c.beginPath(); c.rect(18, 20, 22, 900); fs(c, '#6b5642');
}

// ---------------- building ----------------
function shutterShape(c, x0, x1, y0, y1) {
  c.beginPath(); c.rect(Math.min(x0, x1), y0, Math.abs(x1 - x0), y1 - y0); fs(c, '#4f7a5a');
  const n = 9; ink(c, 0.6);
  for (let i = 1; i < n; i++) { const y = y0 + (y1 - y0) * i / n; c.beginPath(); c.moveTo(Math.min(x0, x1) + 10, y); c.lineTo(Math.max(x0, x1) - 10, y); c.stroke(); }
}
// a swinging shutter hinged at hx; open 0 = covering the window, 1 = flat on the wall
function shutter(c, hxp, dir, w, y0, y1, open) {
  const th = open * Math.PI, pw = w * Math.cos(th);       // projected width (signed)
  const fx = hxp + dir * pw;                              // free edge x
  const grow = Math.sin(th) * 0.09 * (y1 - y0);           // free edge swings toward camera
  c.beginPath(); c.moveTo(hxp, y0); c.lineTo(fx, y0 - grow); c.lineTo(fx, y1 + grow); c.lineTo(hxp, y1); c.closePath();
  fs(c, open > 0.5 ? '#4f7a5a' : '#44694e');
  ink(c, 0.6); const n = 9;
  for (let i = 1; i < n; i++) {
    const t = i / n; const ya = y0 + (y1 - y0) * t, yb = y0 - grow + (y1 - y0 + 2 * grow) * t;
    if (Math.abs(pw) > 24) { c.beginPath(); c.moveTo(hxp + dir * Math.sign(pw) * 10, ya); c.lineTo(fx - dir * Math.sign(pw) * 10, yb); c.stroke(); }
  }
}
function smallWindow(c, x0, x1, y0, y1, sill) {
  c.beginPath(); c.rect(x0, y0, x1 - x0, y1 - y0); fs(c, '#3e3a3a');
  const w = (x1 - x0) / 2; shutterShape(c, x0, x0 + w, y0, y1); shutterShape(c, x0 + w, x1, y0, y1);
  if (sill) { c.beginPath(); c.rect(x0 - 20, y1, x1 - x0 + 40, 22); fs(c, '#cfc6b4'); }
  c.beginPath(); c.rect(x0 - 14, y0 - 22, x1 - x0 + 28, 22); fs(c, '#d8cfbe');
}
export function building(c, A) {
  const { facade: F, win: Wn } = GEO;
  // own roof
  poly(c, [[F.x0 - 30, GEO.eave], [F.x0 + 70, GEO.ridge], [F.x1 - 70, GEO.ridge], [F.x1 + 30, GEO.eave]]); fs(c, '#c8643c');
  ink(c, 0.6);
  for (let y = GEO.ridge + 36; y < GEO.eave; y += 36) { const k = (y - GEO.ridge) / (GEO.eave - GEO.ridge); c.beginPath(); c.moveTo(F.x0 + 70 - 100 * k, y); c.lineTo(F.x1 - 70 + 100 * k, y); c.stroke(); }
  c.beginPath(); c.rect(700, 70, 60, 110); fs(c, '#b5583a');
  // facade
  c.beginPath(); c.rect(F.x0, GEO.eave, F.x1 - F.x0, 2000); fs(c, '#efe2c4');
  // plaster patches
  [[230, 820, 40, 22], [850, 1060, 30, 18], [300, 1420, 46, 20], [820, 420, 34, 16]].forEach(([x, y, a, b]) => { ell(c, x, y, a, b); c.fillStyle = C('#e5d5b3'); c.fill(); });
  // cornices
  c.beginPath(); c.rect(F.x0 - 24, GEO.eave - 8, F.x1 - F.x0 + 48, 30); fs(c, '#ddd2bd');
  c.beginPath(); c.rect(F.x0 - 10, 1300, F.x1 - F.x0 + 20, 22); fs(c, '#ddd2bd');
  c.beginPath(); c.rect(F.x0 - 10, 568, F.x1 - F.x0 + 20, 20); fs(c, '#ddd2bd');
  // floor 4 and floor 2
  smallWindow(c, 410, 670, 360, 500, true);
  smallWindow(c, 380, 700, 1440, 1880, false);
  // window 3: stone surround
  c.beginPath(); c.rect(Wn.x0 - 30, Wn.y0 - 46, Wn.x1 - Wn.x0 + 60, 46); fs(c, '#d8cfbe');
  c.beginPath(); c.rect(Wn.x0 - 22, Wn.y0, 22, Wn.y1 - Wn.y0); fs(c, '#d8cfbe');
  c.beginPath(); c.rect(Wn.x1, Wn.y0, 22, Wn.y1 - Wn.y0); fs(c, '#d8cfbe');
}
export function openShutters(c, A) {
  const Wn = GEO.win, w = (Wn.x1 - Wn.x0) / 2;
  shutter(c, Wn.x0 - 22, 1, w, Wn.y0, Wn.y1, A.shutter);
  shutter(c, Wn.x1 + 22, -1, w, Wn.y0, Wn.y1, A.shutter);
}
export function sillAndPot(c, A, f) {
  const S = GEO.sill;
  c.beginPath(); c.rect(S.x0, S.y, S.x1 - S.x0, S.h); fs(c, '#cfc6b4');
  c.beginPath(); c.rect(S.x0 + 14, S.y + S.h, S.x1 - S.x0 - 28, 16); fs(c, '#bdb3a0');
  if (A.snow) { c.beginPath(); c.moveTo(S.x0 - 4, S.y + 6); c.bezierCurveTo(S.x0, S.y - 22, S.x1, S.y - 26, S.x1 + 4, S.y + 6); c.closePath(); fs(c, '#ffffff'); }
  // geranium pot
  const x = GEO.pot.x, y = S.y;
  const sway = Math.sin(f / FPS * 2.2) * 2;
  [[-22, -78, 8], [6, -92, 9], [26, -70, 7], [-6, -64, 8]].forEach(([dx, dy]) => { c.beginPath(); c.moveTo(x, y - 40); c.lineTo(x + dx * 0.8 + sway, y + dy + 10); ink(c); c.stroke(); });
  blob(c, [E(x - 26, y - 56, 20, 13, -0.4), E(x + 26, y - 52, 20, 13, 0.4), E(x - 4, y - 64, 18, 12)], '#5f9a4e');
  [[-22, -78], [6, -92], [26, -70]].forEach(([dx, dy]) => blob(c, [E(x + dx + sway - 7, y + dy, 9, 9), E(x + dx + sway + 7, y + dy, 9, 9), E(x + dx + sway, y + dy - 8, 9, 9), E(x + dx + sway, y + dy + 6, 9, 9)], '#d8352a'));
  poly(c, [[x - 34, y - 42], [x + 34, y - 42], [x + 26, y], [x - 26, y]]); fs(c, '#b85c3c');
  c.beginPath(); c.rect(x - 38, y - 48, 76, 12); fs(c, '#c86a48');
  if (A.snow) { ell(c, x, y - 49, 40, 8); fs(c, '#ffffff'); }
}
export function crumbs(c, amt) {
  if (amt <= 0) return;
  const r = mulberry32(9), n = Math.floor(22 * amt);
  for (let i = 0; i < n; i++) { const x = 600 + r() * 110, y = GEO.sill.y - 2 - r() * 6; ell(c, x, y, 4 + r() * 3, 3 + r() * 2); c.fillStyle = C('#e2bf78'); c.fill(); }
}
export function fallingCrumbs(c, f, sp, hand) {
  const r = mulberry32(31);
  for (let i = 0; i < 12; i++) {
    const t0 = r() * 0.6, t = (sp - t0) / 0.4; if (t < 0 || t > 1) continue;
    const x = hand[0] + (r() - 0.3) * 40 + t * 18, y = hand[1] + t * t * (GEO.sill.y - hand[1]);
    circ(c, x, y, 4); c.fillStyle = C('#e2bf78'); c.fill();
  }
}

// ---------------- room behind the window (p 0.92, blur 6) ----------------
export function room(c, A, f, L) {
  const lampOn = L.lamp;
  const wall = lampOn ? '#ecd096' : '#7d6a55';
  c.beginPath(); c.rect(200, 450, 680, 900); fs(c, wall);
  c.beginPath(); c.rect(200, 1080, 680, 300); fs(c, lampOn ? '#c79a62' : '#5c4a3a');
  // picture
  c.beginPath(); c.rect(520, 690, 70, 56); fs(c, '#8aa37a');
  // lamp
  const { x, y } = GEO.lamp;
  if (lampOn) { circ(c, x, y + 10, 70); c.fillStyle = C('#f6e2a6'); c.fill(); }
  c.beginPath(); c.moveTo(x, y + 30); c.lineTo(x, 1180); ink(c, 1.4); c.stroke();
  poly(c, [[x - 26, y - 34], [x + 26, y - 34], [x + 46, y + 30], [x - 46, y + 30]]); fs(c, lampOn ? '#f2c94c' : '#8f7f45');
  // clock
  const k = GEO.clock; circ(c, k.x, k.y, k.r); fs(c, '#fbf6ea');
  const sec = Math.floor(REALF / 15);                       // ticks twice a second
  const hand = (a, len, w) => { c.beginPath(); c.moveTo(k.x, k.y); c.lineTo(k.x + Math.sin(a) * len, k.y - Math.cos(a) * len); ink(c, w); c.stroke(); };
  hand(-0.9 + f * 0.0006, k.r * 0.5, 1); hand(1.2 + f * 0.003, k.r * 0.75, 0.8); hand(sec * Math.PI / 30, k.r * 0.8, 0.45);
  // curtains pushed to the sides
  [[200, 372], [708, 880]].forEach(([a, b]) => { c.beginPath(); c.rect(a, 600, b - a, 600); fs(c, '#e4cfa6'); });
}

// ---------------- Herr Otto ----------------
// o.x,o.y head centre (world), o.R head radius. Arms/hands in R units relative to head centre.
function brow(c, x, y, R, inner, outer, side, arch) {
  const ax = x - side * 0.2 * R, bx = x + side * 0.2 * R;
  c.beginPath(); c.moveTo(ax, y - inner * R); c.quadraticCurveTo(x, y - (inner + outer) / 2 * R - arch * R, bx, y - outer * R);
  const core = 0.11 * R;
  c.strokeStyle = C(INK); c.lineCap = 'round'; c.lineWidth = core + 2 * LW(); c.stroke();
  c.strokeStyle = C('#a6a6a6'); c.lineWidth = core; c.stroke();
}
export function ottoBody(c, o) {
  const R = o.R, X = o.x, Y = o.y + o.sink * R, tr = o.tremble ? Math.sin(o._f * 2.7) * 1.5 : 0;
  c.save(); c.translate(X + tr, Y);
  // cardigan torso, hunched: shoulders high and round
  c.beginPath(); c.moveTo(-0.42 * R, 0.82 * R);
  c.bezierCurveTo(-1.15 * R, 0.86 * R, -1.42 * R, 1.15 * R, -1.42 * R, 1.75 * R); c.lineTo(-1.5 * R, (o.len || 4.4) * R); c.lineTo(1.5 * R, (o.len || 4.4) * R); c.lineTo(1.42 * R, 1.75 * R);
  c.bezierCurveTo(1.42 * R, 1.15 * R, 1.15 * R, 0.86 * R, 0.42 * R, 0.82 * R); c.closePath(); fs(c, '#c9962e');
  // shirt V with checked pattern
  poly(c, [[-0.46 * R, 0.84 * R], [0.46 * R, 0.84 * R], [0, 2.0 * R]]); c.save(); c.clip(); c.fillStyle = C('#7a9cc6'); c.fillRect(-R, 0.7 * R, 2 * R, 1.5 * R);
  c.strokeStyle = C('#56789f'); c.lineWidth = 0.05 * R;
  for (let i = -5; i <= 5; i++) { c.beginPath(); c.moveTo(i * 0.16 * R, 0.7 * R); c.lineTo(i * 0.16 * R, 2.1 * R); c.stroke(); c.beginPath(); c.moveTo(-R, 0.9 * R + i * 0.16 * R + 0.8 * R); c.lineTo(R, 0.9 * R + i * 0.16 * R + 0.8 * R); c.stroke(); }
  c.restore(); poly(c, [[-0.46 * R, 0.84 * R], [0.46 * R, 0.84 * R], [0, 2.0 * R]]); ink(c); c.stroke();
  // collar points
  poly(c, [[-0.46 * R, 0.82 * R], [-0.05 * R, 0.95 * R], [-0.3 * R, 1.22 * R]]); fs(c, '#7a9cc6');
  poly(c, [[0.46 * R, 0.82 * R], [0.05 * R, 0.95 * R], [0.3 * R, 1.22 * R]]); fs(c, '#7a9cc6');
  // placket + buttons
  c.beginPath(); c.moveTo(0, 2.0 * R); c.lineTo(0, (o.len || 4.4) * R); ink(c); c.stroke();
  [2.28, 2.78].forEach(y => { circ(c, 0, y * R, 0.09 * R); fs(c, '#7a4a2a'); });
  if (o.scarf) {
    blob(c, [E(0, 0.92 * R, 0.62 * R, 0.2 * R)], '#c0453a');
    rrect(c, 0.12 * R, 0.95 * R, 0.26 * R, 0.85 * R, 0.08 * R); fs(c, '#c0453a');
    ink(c, 0.6); [1.35, 1.6].forEach(y => { c.beginPath(); c.moveTo(0.14 * R, y * R); c.lineTo(0.36 * R, y * R); c.stroke(); });
  }
  c.restore();
  ottoHead(c, { ...o, x: X + tr, y: Y });
}
export function ottoHead(c, o) {
  const R = o.R, turn = o.turn || 0;
  c.save(); c.translate(o.x, o.y);
  const fx = turn * R;                       // face features shift toward the turn
  // ears
  circ(c, -1.06 * R, 0.08 * R, 0.17 * R); fs(c, '#ffffff'); circ(c, 1.06 * R, 0.08 * R, 0.17 * R); fs(c, '#ffffff');
  // head
  ell(c, 0, 0, 1.08 * R, R); fs(c, '#ffffff');
  // side hair tufts (bald top)
  for (const s of [-1, 1]) blob(c, [E(s * 1.0 * R, -0.22 * R, 0.24 * R, 0.2 * R), E(s * 1.1 * R, -0.02 * R, 0.22 * R, 0.2 * R), E(s * 0.94 * R, -0.42 * R, 0.17 * R, 0.15 * R), E(s * 1.04 * R, 0.2 * R, 0.16 * R, 0.14 * R)], '#d9d9d9');
  const ex = 0.37 * R, ey = -0.04 * R;
  const shock = o.expr === 'shock', laugh = o.expr === 'laugh';
  const lx = o.look[0] * 0.07 * R + fx, ly = o.look[1] * 0.06 * R;
  // eyes
  for (const s of [-1, 1]) {
    const x = s * ex + lx, y = ey + ly;
    if (laugh) { c.beginPath(); c.arc(s * ex + fx, ey + 0.08 * R, 0.13 * R, Math.PI * 1.05, Math.PI * 1.95); ink(c, 1.1); c.stroke(); continue; }
    const rw = (shock ? 0.115 : 0.09) * R, rh = (shock ? 0.24 : 0.18) * R;
    let lid = o.lid; if (o.expr === 'sad') lid = Math.max(lid, 0.32);
    if (lid > 0.92) { c.beginPath(); c.moveTo(x - rw * 1.2, y + rh * 0.35); c.lineTo(x + rw * 1.2, y + rh * 0.35); ink(c, 1); c.stroke(); continue; }
    c.save(); c.beginPath(); c.rect(x - R, y - rh + lid * 2 * rh, 2 * R, 2 * R); c.clip();
    ell(c, x, y, rw, rh); c.fillStyle = C(INK); c.fill(); c.restore();
    if (shock) { circ(c, x - rw * 0.3, y - rh * 0.4, rw * 0.32); c.fillStyle = C('#ffffff'); c.fill(); }
  }
  // glasses
  ink(c, 0.8);
  for (const s of [-1, 1]) { circ(c, s * ex + fx, ey, 0.3 * R); c.stroke(); }
  c.beginPath(); c.moveTo(-ex + 0.3 * R + fx, ey - 0.03 * R); c.quadraticCurveTo(fx, ey - 0.12 * R, ex - 0.3 * R + fx, ey - 0.03 * R); c.stroke();
  c.beginPath(); c.moveTo(-ex - 0.3 * R + fx, ey - 0.04 * R); c.lineTo(-0.9 * R, -0.12 * R); c.moveTo(ex + 0.3 * R + fx, ey - 0.04 * R); c.lineTo(0.9 * R, -0.12 * R); c.stroke();
  // brows [inner height, outer height, arch]
  const B = { smile: [0.5, 0.52, 0.06], wait: [0.48, 0.48, 0], sad: [0.56, 0.4, -0.02], shock: [0.66, 0.64, 0.1], laugh: [0.56, 0.5, 0.08] }[o.expr];
  for (const s of [-1, 1]) brow(c, s * ex + fx, ey, R, B[0], B[1], s, B[2]);
  // nose
  circ(c, fx, 0.27 * R, 0.13 * R); fs(c, '#ffffff');
  // mouth (under the moustache)
  const my = 0.7 * R;
  ink(c, 0.9);
  if (o.expr === 'smile') { c.beginPath(); c.moveTo(fx - 0.13 * R, my - 0.02 * R); c.quadraticCurveTo(fx, my + 0.1 * R, fx + 0.13 * R, my - 0.02 * R); c.stroke(); }
  else if (o.expr === 'wait') { c.beginPath(); c.moveTo(fx - 0.1 * R, my); c.lineTo(fx + 0.1 * R, my); c.stroke(); }
  else if (o.expr === 'sad') { c.beginPath(); c.moveTo(fx - 0.13 * R, my + 0.06 * R); c.quadraticCurveTo(fx, my - 0.06 * R, fx + 0.13 * R, my + 0.06 * R); c.stroke(); }
  else if (shock) { ell(c, fx, my + 0.05 * R, 0.07 * R, 0.09 * R); fs(c, '#4a2420', 0.9); }
  else if (laugh) { c.beginPath(); c.moveTo(fx - 0.24 * R, my - 0.06 * R); c.lineTo(fx + 0.24 * R, my - 0.06 * R); c.quadraticCurveTo(fx + 0.22 * R, my + 0.3 * R, fx, my + 0.3 * R); c.quadraticCurveTo(fx - 0.22 * R, my + 0.3 * R, fx - 0.24 * R, my - 0.06 * R); fs(c, '#4a2420', 0.9);
    c.save(); c.clip(); ell(c, fx, my + 0.3 * R, 0.13 * R, 0.1 * R); c.fillStyle = C('#d0574a'); c.fill(); c.restore(); }
  // thick white moustache
  blob(c, [E(fx - 0.2 * R, 0.47 * R, 0.21 * R, 0.14 * R, 0.2), E(fx + 0.2 * R, 0.47 * R, 0.21 * R, 0.14 * R, -0.2), E(fx - 0.4 * R, 0.53 * R, 0.13 * R, 0.1 * R, 0.5), E(fx + 0.4 * R, 0.53 * R, 0.13 * R, 0.1 * R, -0.5)], '#ffffff');
  c.restore();
}
function stick(c, pts, col, w) {
  c.beginPath(); c.moveTo(...pts[0]); c.quadraticCurveTo(...pts[1], ...pts[2]);
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = C(INK); c.lineWidth = w + 2 * LW(); c.stroke();
  c.strokeStyle = C(col); c.lineWidth = w; c.stroke();
}
export function ottoArms(c, o, f) {
  const R = o.R, X = o.x, Y = o.y + o.sink * R;
  const P = p => [X + p[0] * R, Y + p[1] * R];
  for (const side of ['L', 'R']) {
    const s = side === 'L' ? -1 : 1, a = o.arms[side];
    stick(c, [P([s * 1.18, 1.3]), P(a.elbow), P(a.hand)], '#c9962e', 0.2 * R);
    const h = P(a.hand);
    if (side === 'R' && o.prop === 'bag') {
      // paper bag of crumbs held up
      poly(c, [[h[0] - 0.3 * R, h[1] - 0.75 * R], [h[0] + 0.3 * R, h[1] - 0.75 * R], [h[0] + 0.36 * R, h[1] + 0.05 * R], [h[0] - 0.36 * R, h[1] + 0.05 * R]]); fs(c, '#c9a46a');
      poly(c, [[h[0] - 0.3 * R, h[1] - 0.75 * R], [h[0] - 0.16 * R, h[1] - 0.92 * R], [h[0] + 0.16 * R, h[1] - 0.9 * R], [h[0] + 0.3 * R, h[1] - 0.75 * R]]); fs(c, '#b8925a');
    }
    if (side === 'L' && o.prop === 'umbrella') {
      const top = [X - 0.1 * R, Y - 1.25 * R];
      c.beginPath(); c.moveTo(h[0], h[1] + 0.3 * R); c.lineTo(top[0], top[1]); ink(c, 1.3); c.stroke();
      c.beginPath(); c.moveTo(top[0] - 1.75 * R, top[1] + 0.32 * R);
      c.quadraticCurveTo(top[0], top[1] - 1.25 * R, top[0] + 1.75 * R, top[1] + 0.32 * R);
      for (let i = 3; i >= 0; i--) { const x0 = top[0] - 1.75 * R + i * 0.875 * R; c.quadraticCurveTo(x0 + 0.44 * R, top[1] + 0.12 * R, x0, top[1] + 0.32 * R); }
      c.closePath(); fs(c, '#3d4e7a');
    }
    circ(c, h[0], h[1], 0.15 * R); fs(c, '#ffffff');
  }
}

// ---------------- pigeon ----------------
// origin = feet on the ground; dir 1 faces right. o: {s, dir, tone, spot, peck, nod, flap, hop}
const shade = (h, k) => k >= 0 ? mix(h, '#ffffff', k) : mix(h, '#000000', -k);
export function pigeon(c, x, y, o) {
  const s = o.s || 1, d = o.dir || 1, tone = o.tone || 0;
  const body = shade('#9aa3ad', tone * 0.1), wingC = shade('#6f7880', tone * 0.1);
  c.save(); c.translate(x, y - (o.hop || 0)); c.scale(d * s, s);
  const SCs = SC; SC = SC * s;                      // keep ink weight constant on screen
  const hx2 = 10 * (o.peck || 0) + (o.nod || 0) * 6, hy2 = 26 * (o.peck || 0) + Math.abs(o.nod || 0) * 2;
  // legs
  c.lineCap = 'round';
  for (const lx of [-5, 9]) { c.beginPath(); c.moveTo(lx, -14); c.lineTo(lx + 2, 0); c.lineTo(lx + 9, 0);
    c.strokeStyle = C(INK); c.lineWidth = 5 + 2 * LW(); c.stroke(); c.strokeStyle = C('#ef8f2e'); c.lineWidth = 5; c.stroke(); }
  // far wing when flapping
  const fl = o.flap;
  const wing = (ang, col) => { c.save(); c.translate(-2, -54); c.rotate(ang); ell(c, -34, 0, 38, 15); fs(c, col); c.restore(); };
  if (fl != null) wing(lerp(-0.5, -2.3, (fl + 1) / 2) + 0.25, shade(wingC, -0.12));
  // tail
  poly(c, [[-26, -46], [-72, -30], [-70, -17], [-24, -28]]); fs(c, wingC);
  // body + neck + head as one outlined blob
  const parts = [E(0, -40, 40, 30), E(18, -52, 23, 22), E(22 + hx2 * 0.5, -66 + hy2 * 0.5, 15, 15), E(29 + hx2, -82 + hy2, 19, 18)];
  blob(c, parts, body);
  // neck band (green over purple), clipped to the neck/chest
  c.save(); c.beginPath();
  c.moveTo(41, -52); c.ellipse(18, -52, 23, 22, 0, 0, 7);
  c.moveTo(37 + hx2 * 0.5, -66 + hy2 * 0.5); c.ellipse(22 + hx2 * 0.5, -66 + hy2 * 0.5, 15, 15, 0, 0, 7); c.clip();
  c.translate(20 + hx2 * 0.35, -60 + hy2 * 0.35); c.rotate(-0.35 + (o.peck || 0) * 0.5);
  c.fillStyle = C('#5fa58a'); c.fillRect(-30, -9, 60, 8); c.fillStyle = C('#8a5fa5'); c.fillRect(-30, -1, 60, 8);
  c.restore();
  // head details
  const hcx = 29 + hx2, hcy = -82 + hy2;
  if (o.spot) { c.save(); ell(c, hcx, hcy, 19, 18); c.clip(); blob2(c, hcx, hcy); c.restore(); }
  ell(c, hcx + 8, hcy - 1, 3.8, 6.2); c.fillStyle = C(INK); c.fill();
  poly(c, [[hcx + 16, hcy - 3], [hcx + 31, hcy + 3], [hcx + 15, hcy + 7]]); fs(c, '#ef8f2e', 0.8);
  // near wing
  if (fl != null) wing(lerp(-0.4, -2.2, (fl + 1) / 2), wingC);
  else { c.beginPath(); c.moveTo(16, -52); c.bezierCurveTo(-2, -66, -34, -50, -48, -30); c.bezierCurveTo(-30, -24, 0, -22, 14, -32); c.quadraticCurveTo(22, -42, 16, -52); fs(c, wingC); }
  SC = SCs; c.restore();
}
function blob2(c, x, y) { c.fillStyle = C('#ffffff'); ell(c, x - 7, y - 11, 11, 9, -0.3); c.fill(); ell(c, x + 2, y - 15, 8, 6); c.fill(); ell(c, x - 13, y - 3, 6, 6); c.fill(); }

// a flock bird's animated pose at frame f (S5)
export function flockPose(b, f) {
  const t = f / FPS, since = f - 216;
  const burst = Math.max(0, 1 - since / 26);               // big wing burst at the cut, settling
  let flap = null;
  if (burst > 0 && (b.fph < 0.55 + 0.45 * burst)) flap = Math.sin((t * 7 + b.fph) * Math.PI * 2);
  else if (b.flapper && Math.sin((t * 0.9 + b.fph) * Math.PI * 2) > 0.7) flap = Math.sin((t * 6 + b.fph) * Math.PI * 2);
  return { s: b.s, dir: b.dir, tone: b.tone, nod: Math.sin((t * 1.7 + b.ph) * Math.PI * 2), flap };
}
export function flockLayer(c, f, layer) {
  for (const b of FLOCK) if (b.layer === layer) pigeon(c, b.x, b.y, flockPose(b, f));
}

// ---------------- weather ----------------
export function rain(c, f) {
  const r = mulberry32(5); c.strokeStyle = C('#e8eef5'); c.lineWidth = 3 / SC; c.lineCap = 'round';
  for (let i = 0; i < 140; i++) { const x0 = r() * 1300 - 100, sp = 70 + r() * 30, y = ((r() * 2200 + f * sp) % 2200) - 140;
    c.beginPath(); c.moveTo(x0 + (y + 140) * 0.18, y); c.lineTo(x0 + (y + 140) * 0.18 + 12, y + 60); c.stroke(); }
}
export function snowfall(c, f) {
  const r = mulberry32(6); c.fillStyle = C('#ffffff');
  for (let i = 0; i < 110; i++) { const x0 = r() * 1080, sp = 3 + r() * 4, rad = 4 + r() * 6, y = (r() * 2000 + f * sp) % 2000 - 40;
    circ(c, x0 + Math.sin(f * 0.1 + i) * 14, y, rad); c.fill(); }
}

// ---------------- interior close-up (S4) ----------------
export function interiorBack(c, f, A) {
  c.beginPath(); c.rect(-200, -200, 1480, 2400); fs(c, '#ecd7a6');
  c.beginPath(); c.rect(-200, 1560, 1480, 600); fs(c, '#b98c58');
  c.beginPath(); c.rect(-200, 1540, 1480, 26); fs(c, '#d9c08c');
  // morning light from the window, with flock shadows crossing it
  poly(c, [[120, 220], [960, 220], [1020, 1560], [60, 1560]]); c.fillStyle = C('#f7e9c3'); c.fill();
  c.fillStyle = C('#e4cf9b'); c.fillRect(522, 220, 36, 1340); c.fillRect(90, 820, 900, 34);
  flockShadows(c, f, A, 0.3);
  // lamp and clock
  c.beginPath(); c.moveTo(210, 800); c.lineTo(210, 1560); ink(c, 1.4); c.stroke();
  poly(c, [[160, 640], [260, 640], [300, 800], [120, 800]]); fs(c, '#f2c94c');
  circ(c, 860, 470, 80); fs(c, '#fbf6ea'); ink(c);
  c.beginPath(); c.moveTo(860, 470); c.lineTo(860, 420); c.moveTo(860, 470); c.lineTo(905, 488); c.stroke();
  c.beginPath(); c.rect(80, 300, 150, 120); fs(c, '#8aa37a');
}
export function flockShadows(c, f, A, alpha) {
  const r = mulberry32(77);
  for (let i = 0; i < Math.floor(6 + 22 * A.shadows); i++) {
    const sp = 0.6 + r(), y0 = 150 + r() * 1300, x = ((r() * 1700 + f * sp * 26) % 1700) - 300, y = y0 + Math.sin(f * 0.3 + i) * 30;
    const k = 1.2 + r() * 1.2;
    c.save(); c.translate(x, y); c.scale(k, k * 0.8);
    const fl = Math.sin(f * 0.9 + i * 2);
    c.fillStyle = `rgba(60,42,25,${alpha})`;
    c.beginPath(); c.ellipse(0, 0, 40, 20, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(-10, -24 * fl, 46, 12, -0.6 * fl, 0, 7); c.fill(); c.beginPath(); c.ellipse(30, -12, 14, 13, 0, 0, 7); c.fill();
    c.restore();
  }
}
export function curtains(c, A) {
  const o = A.curtain;
  for (const s of [-1, 1]) {
    const inner = 540 + s * lerp(0, 470, o), outer = 540 + s * 900;
    c.beginPath(); c.moveTo(inner, -100); c.lineTo(outer, -100); c.lineTo(outer, 2100);
    for (let i = 0; i <= 6; i++) { const y = 2100 - i * 370; c.lineTo(inner + Math.sin(i * 1.7) * 14 * s, y); }
    c.closePath(); fs(c, '#e4cfa6');
    ink(c, 0.7); for (let k = 1; k < 4; k++) { const x = inner + s * k * 90; c.beginPath(); c.moveTo(x, -100); c.lineTo(x + s * 10, 2100); c.stroke(); }
  }
}

// ---------------- post ----------------
let GRAIN = null;
function grainTiles() {
  GRAIN = [];
  for (let k = 0; k < 3; k++) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 512; const g = cv.getContext('2d');
    const im = g.createImageData(512, 512), r = mulberry32(900 + k);
    for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0); GRAIN.push(cv);
  }
}
export function post(c, f) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.filter = 'none';
  // vignette
  const v = c.createRadialGradient(540, 900, 600, 540, 960, 1250);
  v.addColorStop(0, 'rgba(30,20,15,0)'); v.addColorStop(1, 'rgba(30,20,15,0.32)');
  c.fillStyle = v; c.fillRect(0, 0, 1080, 1920);
  // seeded grain: tile + offset depend only on f
  if (!GRAIN) grainTiles();
  const r = mulberry32(5000 + f), tile = GRAIN[f % 3], ox = -Math.floor(r() * 512), oy = -Math.floor(r() * 512);
  c.globalAlpha = 0.055; c.globalCompositeOperation = 'overlay';
  for (let y = oy; y < 1920; y += 512) for (let x = ox; x < 1080; x += 512) c.drawImage(tile, x, y);
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
}

export { building as window, building as windowFacade };
export const oldMan = { body: ottoBody, head: ottoHead, arms: ottoArms };
